import { describe, it, expect } from 'vitest';
import { resolveDeadline } from '../lib/nlp/dateResolver';
import { extractTasks } from '../lib/nlp/taskExtractor';
import { extractMentions } from '../lib/nlp/mentionExtractor';
import { extractDecisions } from '../lib/nlp/decisionExtractor';
import { extractQuestions } from '../lib/nlp/questionResolver';
import { buildPriorities } from '../lib/nlp/urgencyScorer';
import { sanitizeText, stripControlCharacters } from '../lib/security/sanitizer';
import { Message, UserPreferences } from '../types';

const defaultPrefs: UserPreferences = {
  userName: 'Alex',
  aliases: ['Alex', 'Aditya', 'akg'],
  imminentHoursThreshold: 36,
  localModelEnabled: false,
  localModelEndpoint: 'http://localhost:11434',
  theme: 'dark',
};

describe('NLP & Extraction Suite', () => {
  describe('Temporal Date Resolver', () => {
    const anchor = '2026-10-09T10:00:00.000Z';

    it('resolves "today at 6:00 PM" anchored to message timestamp', () => {
      const res = resolveDeadline('Submission is today at 6:00 PM', anchor);
      expect(res).not.toBeNull();
      expect(res?.rawMatched.toLowerCase()).toContain('today');
      expect(res?.isImminent).toBe(true);
    });

    it('resolves "by EOD" as 6:00 PM', () => {
      const res = resolveDeadline('Please finish by EOD', anchor);
      expect(res).not.toBeNull();
      expect(res?.formatted).toContain('6:00 PM');
    });

    it('marks vague expressions as uncertain', () => {
      const res = resolveDeadline('We will review sometime next week', anchor);
      expect(res).not.toBeNull();
      expect(res?.isUncertain).toBe(true);
    });
  });

  describe('Task Extractor', () => {
    it('extracts direct assignment with action verb', () => {
      const messages: Message[] = [
        {
          id: 'm1',
          sender: 'Sarah',
          timestamp: '2026-10-09T10:00:00.000Z',
          text: '@Alex, please review the auth PR before 2pm today',
        },
      ];
      const tasks = extractTasks(messages, defaultPrefs);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].assignee).toBe('Alex');
      expect(tasks[0].isAssignedToUser).toBe(true);
      expect(tasks[0].priority).toBe('urgent');
    });

    it('detects completed task status', () => {
      const messages: Message[] = [
        {
          id: 'm2',
          sender: 'Priya',
          timestamp: '2026-10-09T10:00:00.000Z',
          text: 'I finished the database schema migrations and all tests pass',
        },
      ];
      const tasks = extractTasks(messages, defaultPrefs);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].status).toBe('completed');
    });

    it('does not invent task ownership if unassigned', () => {
      const messages: Message[] = [
        {
          id: 'm3',
          sender: 'David',
          timestamp: '2026-10-09T10:00:00.000Z',
          text: 'Action item: export high-res screenshots for README',
        },
      ];
      const tasks = extractTasks(messages, defaultPrefs);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].assignee).toBeUndefined();
    });
  });

  describe('Mention Extractor', () => {
    it('detects user alias match and flags direct requests', () => {
      const messages: Message[] = [
        {
          id: 'm4',
          sender: 'Sarah',
          timestamp: '2026-10-09T10:00:00.000Z',
          text: 'akg please verify the crypto implementation',
        },
      ];
      const mentions = extractMentions(messages, defaultPrefs);
      expect(mentions).toHaveLength(1);
      expect(mentions[0].matchedName).toBe('akg');
      expect(mentions[0].isDirectRequest).toBe(true);
      expect(mentions[0].priority).toBe('urgent');
    });
  });

  describe('Decision Extractor', () => {
    it('distinguishes confirmed team decisions from open proposals', () => {
      const messages: Message[] = [
        {
          id: 'm5',
          sender: 'Sarah',
          timestamp: '2026-10-09T10:00:00.000Z',
          text: "Agreed: We're locking in indigo accents and deep charcoal cards.",
        },
        {
          id: 'm6',
          sender: 'David',
          timestamp: '2026-10-09T10:05:00.000Z',
          text: 'Should we add a dark mode toggle option as well?',
        },
      ];
      const decisions = extractDecisions(messages);
      expect(decisions).toHaveLength(2);
      expect(decisions[0].status).toBe('confirmed');
      expect(decisions[1].status).toBe('proposal');
    });
  });

  describe('Question Resolver', () => {
    it('identifies unanswered questions and tracks answered ones', () => {
      const messages: Message[] = [
        {
          id: 'm7',
          sender: 'Marcus',
          timestamp: '2026-10-09T10:00:00.000Z',
          text: 'Has anyone tested the Web Worker memory footprint on Firefox?',
        },
        {
          id: 'm8',
          sender: 'David',
          timestamp: '2026-10-09T10:05:00.000Z',
          text: 'Where are the slides stored?',
        },
        {
          id: 'm9',
          sender: 'Elena',
          timestamp: '2026-10-09T10:06:00.000Z',
          text: "Here's the link: they are in Google Drive folder.",
        },
      ];
      const questions = extractQuestions(messages);
      expect(questions).toHaveLength(2);
      expect(questions[0].isResolved).toBe(false); // Marcus's question remains unanswered
      expect(questions[1].isResolved).toBe(true);  // David's question was answered by Elena
    });
  });

  describe('Urgency Scorer', () => {
    it('does not over-inflate urgency on casual messages with "no rush"', () => {
      const tasks = extractTasks(
        [
          {
            id: 'm10',
            sender: 'David',
            timestamp: '2026-10-09T10:00:00.000Z',
            text: 'Pizza just arrived at the venue! No rush, take a break whenever.',
          },
        ],
        defaultPrefs
      );
      const priorities = buildPriorities(tasks, [], [], [], []);
      const pizzaPrio = priorities.find(p => p.title.toLowerCase().includes('pizza'));
      if (pizzaPrio) {
        expect(pizzaPrio.level).toBe('informational');
      }
    });
  });

  describe('Security Sanitizer', () => {
    it('neutralizes HTML entities and dangerous scripts', () => {
      const dirty = '<script>alert("xss")</script>&nbsp;<b>Test</b>';
      const clean = sanitizeText(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('&lt;script&gt;');
    });

    it('strips non-printable ASCII control characters', () => {
      const dirty = 'Hello\x00\x07World\nTest';
      const clean = stripControlCharacters(dirty);
      expect(clean).toBe('HelloWorld\nTest');
    });
  });
});
