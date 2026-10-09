import { Message, Decision } from '../../types';

const CONFIRMED_PATTERNS = [
  /\b(?:we\s+decided\s+to|agreed|let['’]s\s+go\s+with|final\s+decision|decision\s+is|we['’]re\s+locking\s+in|officially\s+approved|approved:?)\b/i,
  /\b(?:consensus\s+is|settled\s+on|team\s+agreed|all\s+agreed)\b/i,
];

const PROPOSAL_PATTERNS = [
  /\b(?:proposal:?|i\s+propose|what\s+if\s+we|how\s+about\s+we|should\s+we|maybe\s+we\s+can|suggest\s+we)\b/i,
  /\b(?:thinking\s+of\s+using|could\s+we\s+try)\b/i,
];

const AGREEMENT_REPLIES = [
  /(?:\+1|\bagreed\b|\bsounds\s+good\b|\bworks\s+for\s+me\b|\blgtm\b|\blet['’]s\s+do\s+it\b|\btotally\s+agree\b|\bmakes\s+sense\b)/i
];

export function extractDecisions(messages: Message[]): Decision[] {
  const decisions: Decision[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const text = msg.text;

    const isConfirmed = CONFIRMED_PATTERNS.some(p => p.test(text));
    const isProposal = PROPOSAL_PATTERNS.some(p => p.test(text));

    if (!isConfirmed && !isProposal) continue;

    // Check subsequent messages to see if there is immediate consensus or agreement
    const supportingIds: string[] = [msg.id];
    const participants: Set<string> = new Set([msg.sender]);

    let finalStatus: Decision['status'] = isConfirmed ? 'confirmed' : 'proposal';

    // Scan up to next 5 messages for consensus / replies
    const lookaheadCount = Math.min(messages.length, i + 6);
    for (let j = i + 1; j < lookaheadCount; j++) {
      const nextMsg = messages[j];
      const hasAgreement = AGREEMENT_REPLIES.some(p => p.test(nextMsg.text));
      if (hasAgreement) {
        supportingIds.push(nextMsg.id);
        participants.add(nextMsg.sender);
        if (participants.size >= 2) {
          finalStatus = 'confirmed';
        }
      }
    }

    // Extract core decision statement
    let cleanDecision = text
      .replace(/^(?:(?:team|all|everyone)[,\s]+)?(?:we\s+decided\s+to|agreed\s+(?:on|to)?|decision\s+is:?|approved:?)\s*/i, '')
      .split('\n')[0]
      .trim();

    if (cleanDecision.length > 120) {
      cleanDecision = cleanDecision.substring(0, 117) + '…';
    }

    // Deduplicate
    const exists = decisions.some(d => d.primaryMessageId === msg.id);
    if (!exists && cleanDecision.length > 5) {
      decisions.push({
        id: `decision-${msg.id}-${decisions.length + 1}`,
        decision: cleanDecision.charAt(0).toUpperCase() + cleanDecision.slice(1),
        status: finalStatus,
        context: text.length > 180 ? text.substring(0, 177) + '…' : text,
        sourceMessageIds: supportingIds,
        primaryMessageId: msg.id,
        participants: Array.from(participants),
        sourceTimestamp: msg.timestamp,
      });
    }
  }

  return decisions;
}
