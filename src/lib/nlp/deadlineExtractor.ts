import { Message, Deadline, UserPreferences } from '../../types';
import { resolveDeadline } from './dateResolver';

const DEADLINE_TRIGGERS = [
  /\b(?:deadline|due\s+date|hard\s+stop|freeze|cut-off|cutoff|submissions?\s+close)\b/i,
  /\b(?:by|before|until|due)\s+(?:today|tomorrow|eod|tonight|friday|monday|tuesday|wednesday|thursday|saturday|sunday|\d{1,2}(?::\d{2})?\s*(?:am|pm)|\d{4}-\d{2}-\d{2})\b/i,
  /\b(?:promise|committed\s+to|have\s+to\s+deliver|must\s+submit|need\s+this\s+by)\b/i,
  /\b(?:sometime\s+next\s+week|at\s+some\s+point|later\s+this\s+month)\b/i,
];

export function extractDeadlines(
  messages: Message[],
  preferences: UserPreferences
): Deadline[] {
  const deadlines: Deadline[] = [];

  for (const msg of messages) {
    const text = msg.text;
    const hasTrigger = DEADLINE_TRIGGERS.some(trigger => trigger.test(text));
    if (!hasTrigger) continue;

    const resolved = resolveDeadline(text, msg.timestamp, preferences.imminentHoursThreshold);
    if (!resolved) continue;

    // Build title summary from message text
    let title = text.split('\n')[0].trim();
    if (title.length > 80) {
      title = title.substring(0, 77) + '…';
    }

    let urgencyExplanation = '';
    if (resolved.isImminent) {
      urgencyExplanation = `Critical: Due within ${preferences.imminentHoursThreshold} hours (${resolved.formatted}).`;
    } else if (resolved.isUncertain) {
      urgencyExplanation = 'Tentative or uncommitted timing. Marked as flexible.';
    } else {
      urgencyExplanation = `Scheduled for ${resolved.formatted}.`;
    }

    const confidence = resolved.isUncertain ? 0.6 : 0.9;

    // Check duplicate
    const exists = deadlines.some(
      d => d.dueDateCanonical === resolved.canonicalIso && d.sourceSender === msg.sender
    );

    if (!exists) {
      deadlines.push({
        id: `dl-${msg.id}-${deadlines.length + 1}`,
        title,
        dueDateCanonical: resolved.canonicalIso,
        dueDateRaw: resolved.rawMatched,
        isImminent: resolved.isImminent,
        isUncertain: resolved.isUncertain,
        sourceMessageId: msg.id,
        sourceSender: msg.sender,
        sourceTimestamp: msg.timestamp,
        confidence,
        urgencyExplanation,
      });
    }
  }

  // Sort by earliest canonical ISO timestamp
  return deadlines.sort((a, b) => a.dueDateCanonical.localeCompare(b.dueDateCanonical));
}
