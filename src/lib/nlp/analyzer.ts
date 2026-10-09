import { Conversation, AnalysisResult, UserPreferences } from '../../types';
import { extractTasks } from './taskExtractor';
import { extractDeadlines } from './deadlineExtractor';
import { extractMentions } from './mentionExtractor';
import { extractDecisions } from './decisionExtractor';
import { extractQuestions } from './questionResolver';
import { buildPriorities } from './urgencyScorer';
import { generateSummary } from './summarizer';

export async function analyzeConversation(
  conversation: Conversation,
  preferences: UserPreferences,
  previousResult?: AnalysisResult | null
): Promise<AnalysisResult> {
  const messages = conversation.messages;

  // 1. Run local extractors
  const tasks = extractTasks(messages, preferences);
  const deadlines = extractDeadlines(messages, preferences);
  const mentions = extractMentions(messages, preferences);
  const decisions = extractDecisions(messages);
  const questions = extractQuestions(messages);

  // 2. Build explainable priorities
  const priorities = buildPriorities(tasks, deadlines, mentions, decisions, questions);

  // 3. Generate structured summaries
  const previousSummaryRef = previousResult
    ? { totalMessages: previousResult.stats.totalMessages, analyzedAt: previousResult.analyzedAt }
    : undefined;

  const summary = generateSummary(messages, tasks, deadlines, decisions, questions, previousSummaryRef);

  // 4. Compute overall statistics
  const urgentCount = priorities.filter(p => p.level === 'urgent').length;
  const imminentDeadlineCount = deadlines.filter(d => d.isImminent).length;

  return {
    id: `analysis-${conversation.id}-${Date.now().toString(36)}`,
    conversationId: conversation.id,
    analyzedAt: new Date().toISOString(),
    modelUsed: 'deterministic-nlp',
    summary,
    priorities,
    tasks,
    deadlines,
    mentions,
    decisions,
    unansweredQuestions: questions,
    stats: {
      totalMessages: messages.length,
      urgentCount,
      taskCount: tasks.length,
      mentionCount: mentions.length,
      decisionCount: decisions.length,
      questionCount: questions.filter(q => !q.isResolved).length,
      imminentDeadlineCount,
    },
  };
}
