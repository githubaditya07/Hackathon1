import { Message, SummarySection, ActionItem, Deadline, Decision, UnansweredQuestion } from '../../types';
import { format, parseISO } from 'date-fns';

const TOPIC_CLUSTERS: Record<string, RegExp> = {
  'Architecture & Data': /\b(?:architecture|database|sqlite|indexeddb|schema|storage|backend|api|migration|model)\b/i,
  'UI & User Experience': /\b(?:ui|ux|design|frontend|css|tailwind|layout|component|view|screen|modal|theme)\b/i,
  'Security & Privacy': /\b(?:security|privacy|local-first|telemetry|audit|encryption|token|key|offline|csp)\b/i,
  'DevOps & Testing': /\b(?:ci|cd|test|vitest|deploy|build|docker|worker|pipeline|git|pr|commit|release)\b/i,
  'Timeline & Deadlines': /\b(?:deadline|freeze|due|milestone|submission|today|tomorrow|schedule|eod)\b/i,
};

export function generateSummary(
  messages: Message[],
  tasks: ActionItem[],
  deadlines: Deadline[],
  decisions: Decision[],
  questions: UnansweredQuestion[],
  previousAnalysis?: { totalMessages: number; analyzedAt: string }
): SummarySection {
  const total = messages.length;
  const senders = Array.from(new Set(messages.map(m => m.sender)));
  const imminentCount = deadlines.filter(d => d.isImminent).length;
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const confirmedDecisions = decisions.filter(d => d.status === 'confirmed');
  const unresolvedQuestions = questions.filter(q => !q.isResolved);

  // 1. Executive Summary
  let executiveSummary = `Conversation spanning ${total} messages across ${senders.length} participants (${senders.slice(0, 4).join(', ')}${senders.length > 4 ? ` and ${senders.length - 4} others` : ''}). `;
  
  if (imminentCount > 0) {
    executiveSummary += `Identified ${imminentCount} imminent deadline${imminentCount > 1 ? 's' : ''} requiring prompt coordination. `;
  } else {
    executiveSummary += `No immediate blocking deadlines detected. `;
  }

  if (confirmedDecisions.length > 0) {
    executiveSummary += `The team reached consensus on ${confirmedDecisions.length} key decision${confirmedDecisions.length > 1 ? 's' : ''}, with ${pendingTasks.length} pending action item${pendingTasks.length === 1 ? '' : 's'} tracked.`;
  } else {
    executiveSummary += `${pendingTasks.length} active task${pendingTasks.length === 1 ? '' : 's'} remain open.`;
  }

  // 2. Key Topics
  const keyTopics: SummarySection['keyTopics'] = [];
  for (const [topicName, regex] of Object.entries(TOPIC_CLUSTERS)) {
    const matching = messages.filter(m => regex.test(m.text));
    if (matching.length > 0) {
      keyTopics.push({
        topic: topicName,
        messageCount: matching.length,
        summary: `Discussed in ${matching.length} messages. Key contributors: ${Array.from(new Set(matching.map(m => m.sender))).slice(0, 3).join(', ')}.`,
      });
    }
  }

  // 3. Important Developments
  const importantDevelopments: string[] = [];
  if (confirmedDecisions.length > 0) {
    confirmedDecisions.slice(0, 3).forEach(d => {
      importantDevelopments.push(`Decision Confirmed: "${d.decision}" (${d.participants.join(', ')})`);
    });
  }
  if (imminentCount > 0) {
    deadlines.filter(d => d.isImminent).slice(0, 2).forEach(dl => {
      importantDevelopments.push(`Urgent Milestone: ${dl.title} — due ${dl.dueDateRaw}`);
    });
  }
  const completedTasks = tasks.filter(t => t.status === 'completed');
  if (completedTasks.length > 0) {
    completedTasks.slice(0, 2).forEach(t => {
      importantDevelopments.push(`Milestone Completed: "${t.description}" by ${t.sourceSender}`);
    });
  }
  if (unresolvedQuestions.length > 0) {
    importantDevelopments.push(`Open Question: "${unresolvedQuestions[0].question}" by ${unresolvedQuestions[0].askedBy}`);
  }

  // 4. Chronological Recap (divide messages into 3 temporal chunks: Start, Mid, Latest)
  const chronologicalRecap: SummarySection['chronologicalRecap'] = [];
  if (messages.length > 0) {
    const chunkCount = Math.min(3, Math.ceil(messages.length / 5));
    const chunkSize = Math.ceil(messages.length / chunkCount);

    for (let c = 0; c < chunkCount; c++) {
      const chunkMessages = messages.slice(c * chunkSize, (c + 1) * chunkSize);
      if (chunkMessages.length === 0) continue;

      const firstMsgTime = chunkMessages[0].timestamp;
      const lastMsgTime = chunkMessages[chunkMessages.length - 1].timestamp;

      let timeLabel = '';
      try {
        timeLabel = `${format(parseISO(firstMsgTime), 'MMM d, h:mm a')} – ${format(parseISO(lastMsgTime), 'h:mm a')}`;
      } catch {
        timeLabel = `Phase ${c + 1}`;
      }

      const activeSenders = Array.from(new Set(chunkMessages.map(m => m.sender))).join(', ');
      chronologicalRecap.push({
        timeRange: timeLabel,
        summary: `Activity involving ${activeSenders}. ${chunkMessages.length} updates exchanged.`,
      });
    }
  }

  // 5. Change Delta (if re-analyzed)
  let changeDelta: string | undefined = undefined;
  if (previousAnalysis) {
    const diff = total - previousAnalysis.totalMessages;
    changeDelta = diff > 0
      ? `Analysis refreshed: ${diff} new message${diff === 1 ? '' : 's'} imported since previous analysis on ${format(parseISO(previousAnalysis.analyzedAt), 'MMM d, h:mm a')}.`
      : `Analysis re-run on current dataset (${total} messages). All priority weights updated.`;
  }

  return {
    executiveSummary,
    keyTopics,
    importantDevelopments,
    chronologicalRecap,
    changeDelta,
  };
}
