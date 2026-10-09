export type PriorityLevel = 'urgent' | 'important' | 'informational';

export type TaskStatus = 'pending' | 'completed' | 'uncertain';

export type UserActionStatus = 'active' | 'completed' | 'dismissed';

export type MentionType = 'exact' | 'alias' | 'direct_request' | 'contextual';

export type DecisionStatus = 'confirmed' | 'proposal';

export interface Message {
  id: string;
  sender: string;
  timestamp: string; // ISO 8601
  text: string;
  isUserSender?: boolean;
  metadata?: {
    rawTimestamp?: string;
    lineNumber?: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  importedAt: string; // ISO 8601
  messageCount: number;
  senders: string[];
  startDate?: string;
  endDate?: string;
  messages: Message[];
  isSample?: boolean;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee?: string;
  isAssignedToUser: boolean;
  dueDate?: string; // Resolved ISO 8601 or formatted string
  dueDateRaw?: string;
  status: TaskStatus;
  userStatus: UserActionStatus;
  sourceMessageId: string;
  sourceSender: string;
  sourceTimestamp: string;
  confidence: number; // 0.0 - 1.0
  priority: PriorityLevel;
  reason: string;
}

export interface Deadline {
  id: string;
  title: string;
  dueDateCanonical: string; // ISO 8601
  dueDateRaw: string;
  isImminent: boolean; // within 24-48 hours
  isUncertain: boolean;
  sourceMessageId: string;
  sourceSender: string;
  sourceTimestamp: string;
  confidence: number;
  urgencyExplanation: string;
}

export interface Mention {
  id: string;
  matchedName: string;
  type: MentionType;
  contextSnippet: string;
  sourceMessageId: string;
  sourceSender: string;
  sourceTimestamp: string;
  isDirectRequest: boolean;
  priority: PriorityLevel;
}

export interface Decision {
  id: string;
  decision: string;
  status: DecisionStatus;
  context: string;
  sourceMessageIds: string[];
  primaryMessageId: string;
  participants: string[];
  sourceTimestamp: string;
}

export interface UnansweredQuestion {
  id: string;
  question: string;
  askedBy: string;
  targetAssignee?: string;
  timestamp: string;
  sourceMessageId: string;
  isResolved: boolean;
  potentialResponses?: string[];
}

export interface SummarySection {
  executiveSummary: string;
  keyTopics: { topic: string; messageCount: number; summary: string }[];
  importantDevelopments: string[];
  chronologicalRecap: { timeRange: string; summary: string }[];
  changeDelta?: string; // What changed since previous run
}

export interface PriorityItem {
  id: string;
  category: 'task' | 'deadline' | 'mention' | 'decision' | 'question';
  title: string;
  description: string;
  level: PriorityLevel;
  score: number; // 0 - 100
  reason: string;
  sourceMessageId: string;
  sourceSender: string;
  sourceTimestamp: string;
  userStatus: UserActionStatus;
}

export interface AnalysisResult {
  id: string;
  conversationId: string;
  analyzedAt: string;
  modelUsed: 'deterministic-nlp' | 'local-llm';
  summary: SummarySection;
  priorities: PriorityItem[];
  tasks: ActionItem[];
  deadlines: Deadline[];
  mentions: Mention[];
  decisions: Decision[];
  unansweredQuestions: UnansweredQuestion[];
  stats: {
    totalMessages: number;
    urgentCount: number;
    taskCount: number;
    mentionCount: number;
    decisionCount: number;
    questionCount: number;
    imminentDeadlineCount: number;
  };
}

export interface UserPreferences {
  userName: string;
  aliases: string[];
  imminentHoursThreshold: number; // e.g. 36 hours
  localModelEnabled: boolean;
  localModelEndpoint: string;
  theme: 'dark';
}

export interface ParseResult {
  success: boolean;
  messages: Message[];
  errors: string[];
  warnings: string[];
  senders: string[];
  startDate?: string;
  endDate?: string;
}
