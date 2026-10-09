import { describe, it, expect } from 'vitest';
import { getSampleConversation } from '../data/sampleConversation';
import { analyzeConversation } from '../lib/nlp/analyzer';
import { DEFAULT_PREFERENCES } from '../lib/storage/indexedDB';

describe('End-to-End Analysis Pipeline with Hackathon Sample', () => {
  it('correctly processes the entire hackathon sprint conversation', async () => {
    const sample = getSampleConversation();
    expect(sample.messages.length).toBe(25);

    const result = await analyzeConversation(sample, DEFAULT_PREFERENCES);

    // 1. Verify general stats
    expect(result.stats.totalMessages).toBe(25);
    expect(result.stats.urgentCount).toBeGreaterThanOrEqual(1);
    expect(result.stats.taskCount).toBeGreaterThanOrEqual(2);
    expect(result.stats.decisionCount).toBeGreaterThanOrEqual(1);

    // 2. Verify Imminent Deadline detection (6:00 PM submission)
    const submissionDeadline = result.deadlines.find(d =>
      d.title.toLowerCase().includes('submission') || d.title.toLowerCase().includes('deadline')
    );
    expect(submissionDeadline).toBeDefined();
    expect(submissionDeadline?.isImminent).toBe(true);

    // 3. Verify Direct Request / Mention to Alex
    const alexMention = result.mentions.find(m => m.matchedName.toLowerCase() === 'alex');
    expect(alexMention).toBeDefined();
    expect(alexMention?.isDirectRequest).toBe(true);

    // 4. Verify Task assigned to Alex with high urgency
    const alexTask = result.tasks.find(t => t.isAssignedToUser);
    expect(alexTask).toBeDefined();
    expect(alexTask?.priority).toBe('urgent');

    // 5. Verify Confirmed Decision (Indigo accents / local-first 100% on-device)
    const confirmedDecision = result.decisions.find(d => d.status === 'confirmed');
    expect(confirmedDecision).toBeDefined();
    expect(confirmedDecision?.sourceMessageIds.length).toBeGreaterThanOrEqual(1);

    // 6. Verify Unanswered Question (Marcus asking about Firefox Web Worker)
    const marcusQuestion = result.unansweredQuestions.find(q =>
      q.askedBy.toLowerCase() === 'marcus' && q.question.toLowerCase().includes('firefox')
    );
    expect(marcusQuestion).toBeDefined();
    expect(marcusQuestion?.isResolved).toBe(false);

    // 7. Verify Casual message (David: Pizza) is NOT urgent
    const pizzaItem = result.priorities.find(p => p.title.toLowerCase().includes('pizza'));
    if (pizzaItem) {
      expect(pizzaItem.level).toBe('informational');
    }

    // 8. Verify Source Evidence Traceability: every priority has a valid sourceMessageId
    for (const priority of result.priorities) {
      expect(priority.sourceMessageId).toBeDefined();
      const existsInChat = sample.messages.some(m => m.id === priority.sourceMessageId);
      expect(existsInChat).toBe(true);
    }
  });
});
