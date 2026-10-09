import { ActionItem, Deadline, Mention, Decision, UnansweredQuestion, PriorityItem, PriorityLevel } from '../../types';

const HIGH_URGENCY_TOKENS = /\b(?:blocker|critical|emergency|asap|urgent|immediately|outage|broken|p0)\b/i;
const NEGATION_OR_LOW_TOKENS = /\b(?:not\s+urgent|no\s+rush|whenever\s+you\s+can|low\s+priority|fyi|optional|take\s+your\s+time)\b/i;

export function buildPriorities(
  tasks: ActionItem[],
  deadlines: Deadline[],
  mentions: Mention[],
  decisions: Decision[],
  questions: UnansweredQuestion[]
): PriorityItem[] {
  const items: PriorityItem[] = [];

  // 1. Evaluate Tasks
  for (const task of tasks) {
    let score = 30; // base score
    const reasons: string[] = [];

    if (task.status === 'completed') {
      score = 10;
      reasons.push('Task already completed');
    } else {
      if (task.isAssignedToUser) {
        score += 35;
        reasons.push('Directly assigned to you');
      } else if (task.assignee) {
        score += 15;
        reasons.push(`Assigned to ${task.assignee}`);
      }

      if (task.dueDateRaw) {
        score += 15;
        reasons.push(`Due date specified (${task.dueDate})`);
      }

      if (HIGH_URGENCY_TOKENS.test(task.description)) {
        score += 20;
        reasons.push('Contains critical/blocker keywords');
      }

      if (NEGATION_OR_LOW_TOKENS.test(task.description)) {
        score -= 25;
        reasons.push('Low priority modifier detected');
      }
    }

    score = Math.max(5, Math.min(100, score));
    const level: PriorityLevel = score >= 75 ? 'urgent' : score >= 45 ? 'important' : 'informational';

    items.push({
      id: `prio-${task.id}`,
      category: 'task',
      title: task.description,
      description: task.dueDate ? `Due: ${task.dueDate} • Assigned: ${task.assignee || 'Team'}` : `Assigned: ${task.assignee || 'Unassigned'}`,
      level,
      score,
      reason: reasons.join(' • '),
      sourceMessageId: task.sourceMessageId,
      sourceSender: task.sourceSender,
      sourceTimestamp: task.sourceTimestamp,
      userStatus: task.userStatus,
    });
  }

  // 2. Evaluate Deadlines
  for (const dl of deadlines) {
    let score = 50;
    const reasons: string[] = [];

    if (dl.isImminent) {
      score += 40;
      reasons.push('Imminent deadline (< 36 hours remaining)');
    } else if (dl.isUncertain) {
      score -= 15;
      reasons.push('Flexible or uncommitted timeframe');
    } else {
      score += 15;
      reasons.push('Firm scheduled milestone');
    }

    if (HIGH_URGENCY_TOKENS.test(dl.title)) {
      score += 10;
      reasons.push('High-severity vocabulary present');
    }

    score = Math.max(10, Math.min(100, score));
    const level: PriorityLevel = score >= 80 ? 'urgent' : score >= 50 ? 'important' : 'informational';

    items.push({
      id: `prio-${dl.id}`,
      category: 'deadline',
      title: `Deadline: ${dl.title}`,
      description: `Target: ${dl.dueDateRaw} (${dl.urgencyExplanation})`,
      level,
      score,
      reason: reasons.join(' • '),
      sourceMessageId: dl.sourceMessageId,
      sourceSender: dl.sourceSender,
      sourceTimestamp: dl.sourceTimestamp,
      userStatus: 'active',
    });
  }

  // 3. Evaluate Mentions
  for (const m of mentions) {
    let score = 40;
    const reasons: string[] = [];

    if (m.isDirectRequest) {
      score += 45;
      reasons.push('Direct request requiring your action');
    } else if (m.type === 'exact') {
      score += 25;
      reasons.push('Direct user @mention');
    } else if (m.type === 'alias') {
      score += 20;
      reasons.push(`Matched user alias (${m.matchedName})`);
    } else {
      score += 5;
      reasons.push('Contextual reference');
    }

    if (NEGATION_OR_LOW_TOKENS.test(m.contextSnippet)) {
      score -= 20;
      reasons.push('Informational context (e.g. no rush / fyi)');
    }

    score = Math.max(10, Math.min(100, score));
    const level: PriorityLevel = score >= 75 ? 'urgent' : score >= 45 ? 'important' : 'informational';

    items.push({
      id: `prio-${m.id}`,
      category: 'mention',
      title: m.isDirectRequest ? `Request from ${m.sourceSender}` : `Mentioned by ${m.sourceSender}`,
      description: m.contextSnippet,
      level,
      score,
      reason: reasons.join(' • '),
      sourceMessageId: m.sourceMessageId,
      sourceSender: m.sourceSender,
      sourceTimestamp: m.sourceTimestamp,
      userStatus: 'active',
    });
  }

  // 4. Evaluate Decisions
  for (const d of decisions) {
    const score = d.status === 'confirmed' ? 60 : 35;
    const reason = d.status === 'confirmed'
      ? `Confirmed team consensus (${d.participants.join(', ')})`
      : 'Open proposal under discussion';

    items.push({
      id: `prio-${d.id}`,
      category: 'decision',
      title: `${d.status === 'confirmed' ? 'Decision' : 'Proposal'}: ${d.decision}`,
      description: d.context,
      level: d.status === 'confirmed' ? 'important' : 'informational',
      score,
      reason,
      sourceMessageId: d.primaryMessageId,
      sourceSender: d.participants[0] || 'Team',
      sourceTimestamp: d.sourceTimestamp,
      userStatus: 'active',
    });
  }

  // 5. Evaluate Unanswered Questions
  for (const q of questions) {
    if (!q.isResolved) {
      const score = q.targetAssignee ? 70 : 45;
      const reason = q.targetAssignee
        ? `Pending question directed to ${q.targetAssignee}`
        : `Unresolved question from ${q.askedBy}`;

      items.push({
        id: `prio-${q.id}`,
        category: 'question',
        title: `Unresolved: ${q.question}`,
        description: `Asked by ${q.askedBy}. No direct answer detected in conversation.`,
        level: score >= 65 ? 'important' : 'informational',
        score,
        reason,
        sourceMessageId: q.sourceMessageId,
        sourceSender: q.askedBy,
        sourceTimestamp: q.timestamp,
        userStatus: 'active',
      });
    }
  }

  // Sort strictly by score descending
  return items.sort((a, b) => b.score - a.score);
}
