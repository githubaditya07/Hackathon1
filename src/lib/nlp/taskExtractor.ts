import { Message, ActionItem, UserPreferences, PriorityLevel } from '../../types';
import { resolveDeadline } from './dateResolver';

const ACTION_VERBS = [
  'fix', 'implement', 'build', 'create', 'update', 'deploy', 'review', 'test',
  'refactor', 'finish', 'push', 'prepare', 'send', 'verify', 'document', 'check',
  'investigate', 'merge', 'write', 'submit', 'organize', 'resolve', 'design'
];

const TASK_REQUEST_PATTERNS = [
  // "@Alex please review the auth PR"
  /(?:@?([A-Za-z0-9_-]+)[,\s:]+)?(?:please|can you|could you|we need to|make sure to)\s+([a-z]+(?:\s+[^\n.!?]{6,120}))/i,
  // "I will handle the database schema"
  /(?:i will|i'll|im going to|i am going to)\s+([a-z]+(?:\s+[^\n.!?]{6,120}))/i,
  // "I finished the database schema migrations"
  /(?:i finished|i have finished|i've finished|done with|just finished)\s+([a-z]+(?:\s+[^\n.!?]{6,120}))/i,
  // "Action item: fix the build"
  /(?:action item|todo|task):\s*([^\n.!?]{6,120})/i,
  // "Alex will take care of..."
  /([A-Za-z0-9_-]+)\s+(?:will|is going to|to handle|assigned to)\s+([a-z]+(?:\s+[^\n.!?]{6,120}))/i,
];

const COMPLETION_PATTERNS = [
  /\b(?:done with|finished|completed|just merged|already pushed|shipped|resolved|closed)\b/i,
  /\b(?:i have finished|i've finished|i fixed it|all done|it is done)\b/i,
];

export function extractTasks(
  messages: Message[],
  preferences: UserPreferences
): ActionItem[] {
  const tasks: ActionItem[] = [];
  const userName = preferences.userName.trim().toLowerCase();
  const aliases = (preferences.aliases || []).map(a => a.trim().toLowerCase());
  const userIdentities = new Set([userName, ...aliases]);

  for (const msg of messages) {
    const text = msg.text.trim();
    const isCompleted = COMPLETION_PATTERNS.some(p => p.test(text));

    // Check each pattern
    for (const pattern of TASK_REQUEST_PATTERNS) {
      const match = text.match(pattern);
      if (!match) continue;

      let extractedDesc = '';
      let detectedAssignee: string | undefined = undefined;

      if (pattern === TASK_REQUEST_PATTERNS[0]) {
        // [1] = potential assignee, [2] = task verb + object
        const target = match[1]?.trim();
        const body = match[2]?.trim();
        if (target && !/^(?:all|everyone|guys|team|hey|hi)$/i.test(target)) {
          detectedAssignee = target;
        }
        extractedDesc = body;
      } else if (pattern === TASK_REQUEST_PATTERNS[1] || pattern === TASK_REQUEST_PATTERNS[2]) {
        // Self-assignment or completed by sender
        detectedAssignee = msg.sender;
        extractedDesc = match[1]?.trim();
      } else if (pattern === TASK_REQUEST_PATTERNS[3]) {
        // Explicit Action Item / Todo
        extractedDesc = match[1]?.trim();
      } else if (pattern === TASK_REQUEST_PATTERNS[4]) {
        // Third-person assignment: [1] name, [2] task
        detectedAssignee = match[1]?.trim();
        extractedDesc = match[2]?.trim();
      }

      if (!extractedDesc) continue;

      // Validate that description starts with a plausible action verb or meaningful phrase
      const firstWord = extractedDesc.split(/\s+/)[0]?.toLowerCase();
      const isVerb = ACTION_VERBS.includes(firstWord);

      // Clean up description
      let cleanDesc = extractedDesc
        .replace(/\b(?:by|before|until|tomorrow|today|eod|friday|monday).*$/i, '')
        .trim();
      if (cleanDesc.length < 5) cleanDesc = extractedDesc.trim();

      // Resolve deadline if present in this message
      const resolvedDate = resolveDeadline(text, msg.timestamp, preferences.imminentHoursThreshold);

      // Determine assignment to user
      const isAssignedToUser = detectedAssignee
        ? userIdentities.has(detectedAssignee.toLowerCase())
        : false;

      // Status calculation
      let status: ActionItem['status'] = 'pending';
      if (isCompleted) {
        status = 'completed';
      } else if (!detectedAssignee && !text.includes('!')) {
        status = 'uncertain';
      }

      // Confidence estimation
      let confidence = 0.65;
      if (isVerb) confidence += 0.15;
      if (detectedAssignee) confidence += 0.1;
      if (resolvedDate) confidence += 0.1;
      confidence = Math.min(0.98, confidence);

      // Priority calculation
      let priority: PriorityLevel = 'informational';
      let reason = 'Action item mentioned in conversation.';

      if (isCompleted) {
        priority = 'informational';
        reason = `Marked completed by ${msg.sender}.`;
      } else if (isAssignedToUser && resolvedDate?.isImminent) {
        priority = 'urgent';
        reason = `Assigned to you with an imminent deadline (${resolvedDate.formatted}).`;
      } else if (isAssignedToUser) {
        priority = 'urgent';
        reason = `Directly assigned to you by ${msg.sender}.`;
      } else if (resolvedDate?.isImminent) {
        priority = 'urgent';
        reason = `Imminent deadline approaching (${resolvedDate.formatted}).`;
      } else if (detectedAssignee) {
        priority = 'important';
        reason = `Assigned to ${detectedAssignee}.`;
      }

      // Avoid duplicates from same message
      const isDuplicate = tasks.some(
        t => t.sourceMessageId === msg.id && t.description.toLowerCase() === cleanDesc.toLowerCase()
      );

      if (!isDuplicate) {
        tasks.push({
          id: `task-${msg.id}-${tasks.length + 1}`,
          description: cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1),
          assignee: detectedAssignee,
          isAssignedToUser,
          dueDate: resolvedDate ? resolvedDate.formatted : undefined,
          dueDateRaw: resolvedDate ? resolvedDate.rawMatched : undefined,
          status,
          userStatus: 'active',
          sourceMessageId: msg.id,
          sourceSender: msg.sender,
          sourceTimestamp: msg.timestamp,
          confidence: Math.round(confidence * 100) / 100,
          priority,
          reason,
        });
      }

      // Only match one pattern per line if strong match found
      if (confidence >= 0.8) break;
    }
  }

  return tasks;
}
