import React from 'react';
import {
  AlertTriangle,
  CheckSquare,
  Clock,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Award,
  Users,
  Calendar,
  ExternalLink,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Conversation, AnalysisResult, UserPreferences } from '../types';

interface DashboardProps {
  conversation: Conversation | null;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  analysis: AnalysisResult | null;
  preferences: UserPreferences;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onNavigateToAction: (category: string) => void;
  onJumpToMessage: (messageId: string) => void;
  onOpenImport: () => void;
  onLoadDemo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  conversation,
  conversations,
  onSelectConversation,
  analysis,
  preferences,
  onAnalyze,
  isAnalyzing,
  onNavigateToAction,
  onJumpToMessage,
  onOpenImport,
  onLoadDemo,
}) => {
  if (!conversation) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-lg bg-surface-secondary border border-border flex items-center justify-center mx-auto mb-4 text-accent">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-primary tracking-tight mb-2">
          No Conversation Loaded
        </h2>
        <p className="text-secondary max-w-md mx-auto mb-6 text-xs leading-relaxed">
          UNREAD runs genuine conversation intelligence on-device. Load our realistic hackathon team sprint demo or import a chat export (.txt / .json).
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onLoadDemo}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white font-medium text-xs shadow-subtle transition-colors flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Conversation</span>
          </button>
          <button
            onClick={onOpenImport}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-surface-card border border-border hover:bg-surface-hover text-primary font-medium text-xs transition-colors"
          >
            Import Chat File
          </button>
        </div>
      </div>
    );
  }

  const stats = analysis?.stats || {
    totalMessages: conversation.messages.length,
    urgentCount: 0,
    taskCount: 0,
    mentionCount: 0,
    decisionCount: 0,
    questionCount: 0,
    imminentDeadlineCount: 0,
  };

  const topPriorities = analysis?.priorities?.slice(0, 5) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg font-semibold text-primary tracking-tight">
              Briefing for {preferences.userName}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-surface-secondary text-secondary border border-border">
              {conversation.title}
            </span>
            {conversation.isSample && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-accent-soft text-accent border border-accent/20">
                Sample
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5">
            {stats.totalMessages} messages ingested • Last analyzed{' '}
            {analysis ? new Date(analysis.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-surface-card border border-border hover:bg-surface-hover text-primary text-xs font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-accent' : 'text-secondary'}`} />
            <span>{isAnalyzing ? 'Processing...' : 'Re-Analyze'}</span>
          </button>
          <button
            onClick={onOpenImport}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: Compact & Restrained */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Messages Analyzed */}
        <div className="bg-surface-card border border-border rounded-md p-3">
          <div className="text-[11px] text-muted font-medium mb-1 flex items-center justify-between">
            <span>Analyzed</span>
            <MessageSquare className="w-3.5 h-3.5 text-secondary" />
          </div>
          <div className="text-xl font-bold font-mono text-primary">{stats.totalMessages}</div>
          <p className="text-[10px] text-muted mt-0.5">Total messages</p>
        </div>

        {/* Urgent Items */}
        <div
          onClick={() => onNavigateToAction('urgent')}
          className="bg-surface-card border border-border hover:border-semantic-urgent-border rounded-md p-3 cursor-pointer transition-colors group"
        >
          <div className="text-[11px] text-muted font-medium mb-1 flex items-center justify-between">
            <span className="group-hover:text-semantic-urgent transition-colors">Urgent</span>
            <AlertTriangle className="w-3.5 h-3.5 text-semantic-urgent" />
          </div>
          <div className="text-xl font-bold font-mono text-semantic-urgent">{stats.urgentCount}</div>
          <p className="text-[10px] text-muted mt-0.5">High priority</p>
        </div>

        {/* Pending Tasks */}
        <div
          onClick={() => onNavigateToAction('task')}
          className="bg-surface-card border border-border hover:border-semantic-important-border rounded-md p-3 cursor-pointer transition-colors group"
        >
          <div className="text-[11px] text-muted font-medium mb-1 flex items-center justify-between">
            <span className="group-hover:text-semantic-important transition-colors">Tasks</span>
            <CheckSquare className="w-3.5 h-3.5 text-semantic-important" />
          </div>
          <div className="text-xl font-bold font-mono text-primary">{stats.taskCount}</div>
          <p className="text-[10px] text-muted mt-0.5">Action items</p>
        </div>

        {/* Imminent Deadlines */}
        <div
          onClick={() => onNavigateToAction('deadline')}
          className="bg-surface-card border border-border hover:border-semantic-urgent-border rounded-md p-3 cursor-pointer transition-colors group"
        >
          <div className="text-[11px] text-muted font-medium mb-1 flex items-center justify-between">
            <span className="group-hover:text-semantic-urgent transition-colors">Deadlines</span>
            <Clock className="w-3.5 h-3.5 text-semantic-urgent" />
          </div>
          <div className="text-xl font-bold font-mono text-primary">{stats.imminentDeadlineCount}</div>
          <p className="text-[10px] text-muted mt-0.5">&lt; 36h cutoff</p>
        </div>

        {/* Personal Mentions */}
        <div
          onClick={() => onNavigateToAction('mention')}
          className="bg-surface-card border border-border hover:border-accent rounded-md p-3 cursor-pointer transition-colors group"
        >
          <div className="text-[11px] text-muted font-medium mb-1 flex items-center justify-between">
            <span className="group-hover:text-accent transition-colors">Mentions</span>
            <Users className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="text-xl font-bold font-mono text-primary">{stats.mentionCount}</div>
          <p className="text-[10px] text-muted mt-0.5">Tagged alerts</p>
        </div>

        {/* Decisions */}
        <div
          onClick={() => onNavigateToAction('decision')}
          className="bg-surface-card border border-border hover:border-semantic-success-border rounded-md p-3 cursor-pointer transition-colors group"
        >
          <div className="text-[11px] text-muted font-medium mb-1 flex items-center justify-between">
            <span className="group-hover:text-semantic-success transition-colors">Decisions</span>
            <Award className="w-3.5 h-3.5 text-semantic-success" />
          </div>
          <div className="text-xl font-bold font-mono text-primary">{stats.decisionCount}</div>
          <p className="text-[10px] text-muted mt-0.5">Team consensus</p>
        </div>
      </div>

      {/* Catch-up Briefing (Executive Section) */}
      {analysis?.summary && (
        <div className="bg-surface-card border border-border rounded-md p-4 sm:p-5 space-y-3 shadow-card">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-xs text-primary uppercase tracking-wider">
                Executive Catch-up Briefing
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success" />
              <span>Deterministic NLP</span>
            </span>
          </div>

          <p className="text-xs text-primary leading-relaxed">
            {analysis.summary.executiveSummary}
          </p>

          {analysis.summary.changeDelta && (
            <div className="text-[11px] font-mono text-secondary bg-surface-secondary border border-border rounded p-2">
              {analysis.summary.changeDelta}
            </div>
          )}
        </div>
      )}

      {/* Two Column Layout: Priorities & Context Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Top Priority List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
                Top Priorities
              </h3>
            </div>
            <button
              onClick={() => onNavigateToAction('all')}
              className="text-xs text-accent hover:text-accent-hover font-medium flex items-center space-x-1"
            >
              <span>View all ({analysis?.priorities?.length || 0})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {topPriorities.length === 0 ? (
              <div className="bg-surface-card border border-border rounded-md p-8 text-center text-xs text-muted">
                No urgent priorities detected in this conversation.
              </div>
            ) : (
              topPriorities.map((item) => {
                const isUrgent = item.level === 'urgent';
                const isImportant = item.level === 'important';

                return (
                  <div
                    key={item.id}
                    className="bg-surface-card border border-border hover:border-secondary rounded-md p-3 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            isUrgent
                              ? 'bg-semantic-urgent-bg text-semantic-urgent border border-semantic-urgent-border'
                              : isImportant
                              ? 'bg-semantic-important-bg text-semantic-important border border-semantic-important-border'
                              : 'bg-semantic-info-bg text-semantic-info border border-semantic-info-border'
                          }`}
                        >
                          {item.level}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-surface-secondary text-secondary border border-border">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-muted">
                          from <strong className="text-secondary font-medium">{item.sourceSender}</strong>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-[10px] font-mono text-muted">Score {item.score}</span>
                        <button
                          onClick={() => onJumpToMessage(item.sourceMessageId)}
                          className="text-[11px] text-accent hover:text-accent-hover flex items-center space-x-0.5 bg-surface-secondary border border-border px-1.5 py-0.5 rounded hover:border-accent transition-colors"
                          title="Jump to source message"
                        >
                          <span>Evidence</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-medium text-primary">
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-[11px] text-secondary line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="text-[11px] text-muted bg-surface-secondary rounded px-2 py-1 border border-border/70 flex items-center space-x-1.5">
                      <span className="font-medium text-secondary">Why prioritized:</span>
                      <span className="text-primary truncate">{item.reason}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Developments, Topics, and Recent Chats */}
        <div className="space-y-4">
          {/* Key Developments */}
          <div className="bg-surface-card border border-border rounded-md p-4 space-y-2.5">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-accent" />
              <span>Key Developments</span>
            </h3>
            <div className="space-y-2">
              {analysis?.summary?.importantDevelopments && analysis.summary.importantDevelopments.length > 0 ? (
                analysis.summary.importantDevelopments.map((dev, idx) => (
                  <div key={idx} className="text-xs text-secondary flex items-start space-x-2">
                    <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{dev}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted">No developments tagged yet.</p>
              )}
            </div>
          </div>

          {/* Discussion Topics */}
          <div className="bg-surface-card border border-border rounded-md p-4 space-y-2.5">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-accent" />
              <span>Discussion Topics</span>
            </h3>
            <div className="space-y-2">
              {analysis?.summary?.keyTopics && analysis.summary.keyTopics.length > 0 ? (
                analysis.summary.keyTopics.map((topic, idx) => (
                  <div key={idx} className="bg-surface-secondary border border-border/80 rounded p-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-primary">{topic.topic}</span>
                      <span className="text-[10px] font-mono text-muted bg-surface-card px-1 py-0.2 rounded border border-border">
                        {topic.messageCount} msgs
                      </span>
                    </div>
                    <p className="text-[11px] text-muted">{topic.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted">No topics clustered.</p>
              )}
            </div>
          </div>

          {/* Chronological Flow */}
          <div className="bg-surface-card border border-border rounded-md p-4 space-y-2.5">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <span>Chronological Flow</span>
            </h3>
            <div className="space-y-2">
              {analysis?.summary?.chronologicalRecap && analysis.summary.chronologicalRecap.length > 0 ? (
                analysis.summary.chronologicalRecap.map((phase, idx) => (
                  <div key={idx} className="border-l border-accent/60 pl-2.5 py-0.5 space-y-0.5">
                    <span className="text-[10px] text-accent font-mono">{phase.timeRange}</span>
                    <p className="text-[11px] text-secondary">{phase.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted">No flow available.</p>
              )}
            </div>
          </div>

          {/* Recent Conversations Card */}
          {conversations.length > 1 && (
            <div className="bg-surface-card border border-border rounded-md p-4 space-y-2">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
                Switch Conversation
              </h3>
              <div className="space-y-1">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectConversation(c.id)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                      c.id === conversation.id
                        ? 'bg-accent-soft text-primary font-medium'
                        : 'text-secondary hover:text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <span className="truncate pr-2">{c.title}</span>
                    <span className="text-[10px] font-mono text-muted">{c.messageCount} msgs</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
