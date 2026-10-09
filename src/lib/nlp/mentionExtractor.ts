import { Message, Mention, UserPreferences, PriorityLevel } from '../../types';

export function extractMentions(
  messages: Message[],
  preferences: UserPreferences
): Mention[] {
  const mentions: Mention[] = [];
  const userName = preferences.userName.trim();
  const allNames = [userName, ...(preferences.aliases || [])].filter(Boolean);

  if (allNames.length === 0) return mentions;

  // Build regex patterns safely escaping special chars
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const namesPattern = allNames.map(escapeRegExp).join('|');

  // Direct mention pattern: @Name or Name: or Name,
  const directMentionRegex = new RegExp(`(?:@)?\\b(${namesPattern})\\b`, 'i');
  // Direct request patterns anywhere in the message mentioning the user
  const requestPattern = /\b(?:can\s+you|could\s+you|please|we\s+need\s+you\s+to|make\s+sure\s+to|take\s+a\s+look|review|verify|implement|check|fix|handle|update)\b/i;

  for (const msg of messages) {
    // If the user sent this message themselves, skip unless they explicitly mentioned themselves
    if (msg.isUserSender) continue;

    const text = msg.text;
    const match = text.match(directMentionRegex);
    if (!match) continue;

    const matchedName = match[1];
    const isDirectRequest = requestPattern.test(text);

    let type: Mention['type'] = 'exact';
    let priority: PriorityLevel = 'important';

    if (isDirectRequest) {
      type = 'direct_request';
      priority = 'urgent';
    } else if (matchedName.toLowerCase() !== userName.toLowerCase()) {
      type = 'alias';
      priority = 'important';
    } else if (text.toLowerCase().includes(`talked to ${matchedName.toLowerCase()}`) || text.toLowerCase().includes(`according to ${matchedName.toLowerCase()}`)) {
      type = 'contextual';
      priority = 'informational';
    }

    // Extract a concise context snippet around the mention
    const index = text.toLowerCase().indexOf(matchedName.toLowerCase());
    const start = Math.max(0, index - 40);
    const end = Math.min(text.length, index + matchedName.length + 60);
    const snippet = (start > 0 ? '…' : '') + text.substring(start, end).trim() + (end < text.length ? '…' : '');

    mentions.push({
      id: `mention-${msg.id}-${mentions.length + 1}`,
      matchedName,
      type,
      contextSnippet: snippet,
      sourceMessageId: msg.id,
      sourceSender: msg.sender,
      sourceTimestamp: msg.timestamp,
      isDirectRequest,
      priority,
    });
  }

  return mentions;
}
