import { Message, UnansweredQuestion } from '../../types';

const QUESTION_STARTERS = [
  /^(?:what|where|when|why|who|how|is|are|can|could|would|should|has|have|does|did|will)\b/i,
  /\b(?:anyone\s+know|has\s+anyone|can\s+someone\s+explain|does\s+anyone\s+have)\b/i,
];

const ANSWER_SIGNALS = [
  /\b(?:yes|no|yep|nope|it is|they are|we have|i checked|here is|here's|use\s+this|resolved|fixed|already)\b/i,
  /\b(?:because|the\s+answer\s+is|you\s+can\s+find|according\s+to|done|see\s+the\s+pr)\b/i,
];

export function extractQuestions(messages: Message[]): UnansweredQuestion[] {
  const questions: UnansweredQuestion[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const text = msg.text.trim();

    // Check if message contains a genuine question
    const hasQuestionMark = text.includes('?');
    const hasStarter = QUESTION_STARTERS.some(s => s.test(text));

    if (!hasQuestionMark && !hasStarter) continue;

    // Filter out rhetorical or greeting questions ("how's it going", "ready?", "what's up")
    if (/^(?:how['’]?s\s+it\s+going|what['’]?s\s+up|how\s+are\s+you|ready\??)$/i.test(text)) {
      continue;
    }

    // Extract the specific question sentence if text is long
    const sentences = text.split(/(?<=[.!?])\s+/);
    const questionSentence = sentences.find(s => s.includes('?') || QUESTION_STARTERS.some(st => st.test(s))) || text;

    // Check for target assignee if mentioned ("@Alex, do you have...")
    const mentionMatch = text.match(/@([A-Za-z0-9_-]+)/);
    const targetAssignee = mentionMatch ? mentionMatch[1] : undefined;

    // Now look ahead in conversation for answers
    let isResolved = false;
    const potentialResponses: string[] = [];

    const lookAheadWindow = Math.min(messages.length, i + 8);
    for (let j = i + 1; j < lookAheadWindow; j++) {
      const laterMsg = messages[j];

      // If another question is asked by someone else before an answer is given,
      // the conversational thread has moved or forked
      const isInterveningQuestion =
        (laterMsg.text.includes('?') || QUESTION_STARTERS.some(st => st.test(laterMsg.text))) &&
        laterMsg.sender.toLowerCase() !== msg.sender.toLowerCase();

      if (isInterveningQuestion) {
        // If the intervening message is a new question, stop looking ahead for this question
        break;
      }

      // Skip messages from the same author
      if (laterMsg.sender.toLowerCase() === msg.sender.toLowerCase()) continue;

      // If target assignee replied, or subsequent message contains answer signals
      const isTargetReplying = targetAssignee && laterMsg.sender.toLowerCase() === targetAssignee.toLowerCase();
      const hasAnswerSignal = ANSWER_SIGNALS.some(p => p.test(laterMsg.text));

      if (isTargetReplying || hasAnswerSignal) {
        potentialResponses.push(`${laterMsg.sender}: "${laterMsg.text.slice(0, 80)}${laterMsg.text.length > 80 ? '…' : ''}"`);
        isResolved = true;
        break;
      }
    }

    questions.push({
      id: `question-${msg.id}-${questions.length + 1}`,
      question: questionSentence.slice(0, 150),
      askedBy: msg.sender,
      targetAssignee,
      timestamp: msg.timestamp,
      sourceMessageId: msg.id,
      isResolved,
      potentialResponses: potentialResponses.length > 0 ? potentialResponses : undefined,
    });
  }

  return questions;
}
