import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  Users,
  Award,
  HelpCircle,
  Search,
  CheckCircle,
  XCircle,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { AnalysisResult, UserActionStatus, UserPreferences } from '../types';

interface ActionCenterProps {
  analysis: AnalysisResult | null;
  preferences: UserPreferences;
  itemActions: Record<string, UserActionStatus>;
  onUpdateItemAction: (itemId: string, status: UserActionStatus) => void;
  onJumpToMessage: (messageId: string) => void;
  initialFilter?: string;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({
  analysis,
  preferences,
  itemActions,
  onUpdateItemAction,
  onJumpToMessage,
  initialFilter = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'confidence'>('score');
  const [showDismissed, setShowDismissed] = useState(false);

  // Synchronize when initialFilter prop changes from sidebar navigation
  React.useEffect(() => {
    if (initialFilter) setActiveTab(initialFilter);
  }, [initialFilter]);

  // Collect and normalize all actionable items into a unified list
  const unifiedItems = useMemo(() => {
    if (!analysis) return [];

    const items: Array<{
      id: string;
      category: 'task' | 'deadline' | 'mention' | 'decision' | 'question';
      title: string;
      description: string;
      level: 'urgent' | 'important' | 'informational';
      score: number;
      confidence: number;
      timestamp: string;
      sender: string;
      messageId: string;
      reason: string;
      isAssignedToUser?: boolean;
      taskStatus?: 'pending' | 'completed' | 'uncertain';
      dueDate?: string;
    }> = [];

    // 1. Tasks
    for (const t of analysis.tasks) {
      items.push({
        id: t.id,
        category: 'task',
        title: t.description,
        description: t.dueDate ? `Due: ${t.dueDate} • Assigned: ${t.assignee || 'Unassigned'}` : `Assigned: ${t.assignee || 'Team'}`,
        level: t.priority,
        score: t.priority === 'urgent' ? 90 : t.priority === 'important' ? 60 : 30,
        confidence: t.confidence,
        timestamp: t.sourceTimestamp,
        sender: t.sourceSender,
        messageId: t.sourceMessageId,
        reason: t.reason,
        isAssignedToUser: t.isAssignedToUser,
        taskStatus: t.status,
        dueDate: t.dueDate,
      });
    }

    // 2. Deadlines
    for (const d of analysis.deadlines) {
      items.push({
        id: d.id,
        category: 'deadline',
        title: d.title,
        description: `Target: ${d.dueDateRaw} (${d.urgencyExplanation})`,
        level: d.isImminent ? 'urgent' : d.isUncertain ? 'informational' : 'important',
        score: d.isImminent ? 95 : 65,
        confidence: d.confidence,
        timestamp: d.sourceTimestamp,
        sender: d.sourceSender,
        messageId: d.sourceMessageId,
        reason: d.urgencyExplanation,
        dueDate: d.dueDateRaw,
      });
    }

    // 3. Mentions
    for (const m of analysis.mentions) {
      items.push({
        id: m.id,
        category: 'mention',
        title: m.isDirectRequest ? `Request from ${m.sourceSender}` : `Mentioned by ${m.sourceSender}`,
        description: m.contextSnippet,
        level: m.priority,
        score: m.priority === 'urgent' ? 85 : 55,
        confidence: 0.95,
        timestamp: m.sourceTimestamp,
        sender: m.sourceSender,
        messageId: m.sourceMessageId,
        reason: m.isDirectRequest ? 'Direct request requiring your attention' : `Mentioned as @${m.matchedName}`,
      });
    }

    // 4. Decisions
    for (const dec of analysis.decisions) {
      items.push({
        id: dec.id,
        category: 'decision',
        title: `${dec.status === 'confirmed' ? 'Decision' : 'Proposal'}: ${dec.decision}`,
        description: dec.context,
        level: dec.status === 'confirmed' ? 'important' : 'informational',
        score: dec.status === 'confirmed' ? 65 : 40,
        confidence: 0.85,
        timestamp: dec.sourceTimestamp,
        sender: dec.participants[0] || 'Team',
        messageId: dec.primaryMessageId,
        reason: `Agreed by ${dec.participants.join(', ')}`,
      });
    }

    // 5. Questions
    for (const q of analysis.unansweredQuestions) {
      items.push({
        id: q.id,
        category: 'question',
        title: `Question: ${q.question}`,
        description: q.isResolved
          ? `Resolved in follow-up messages.`
          : `Asked by ${q.askedBy}. No direct response detected.`,
        level: q.isResolved ? 'informational' : 'important',
        score: q.isResolved ? 20 : 65,
        confidence: 0.8,
        timestamp: q.timestamp,
        sender: q.askedBy,
        messageId: q.sourceMessageId,
        reason: q.isResolved ? 'Answered in subsequent message' : 'Awaiting team reply',
      });
    }

    return items;
  }, [analysis]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: unifiedItems.length,
      urgent: unifiedItems.filter(i => i.level === 'urgent').length,
      my_tasks: unifiedItems.filter(i => i.category === 'task' && i.isAssignedToUser).length,
      task: unifiedItems.filter(i => i.category === 'task').length,
      mention: unifiedItems.filter(i => i.category === 'mention').length,
      deadline: unifiedItems.filter(i => i.category === 'deadline').length,
      decision: unifiedItems.filter(i => i.category === 'decision').length,
      question: unifiedItems.filter(i => i.category === 'question').length,
    };
  }, [unifiedItems]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return unifiedItems
      .filter((item) => {
        // Dismissed filter
        const currentAction = itemActions[item.id] || 'active';
        if (!showDismissed && currentAction === 'dismissed') return false;

        // Category tab filter
        if (activeTab === 'urgent' && item.level !== 'urgent') return false;
        if (activeTab === 'my_tasks' && !(item.category === 'task' && item.isAssignedToUser)) return false;
        if (activeTab === 'task' && item.category !== 'task') return false;
        if (activeTab === 'mention' && item.category !== 'mention') return false;
        if (activeTab === 'deadline' && item.category !== 'deadline') return false;
        if (activeTab === 'decision' && item.category !== 'decision') return false;
        if (activeTab === 'question' && item.category !== 'question') return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchSender = item.sender.toLowerCase().includes(q);
          const matchReason = item.reason.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSender && !matchReason) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.score - a.score;
        if (sortBy === 'confidence') return b.confidence - a.confidence;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [unifiedItems, activeTab, searchQuery, sortBy, showDismissed, itemActions]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-fade-in">
      {/* Top Bar: Title & Search / Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-primary tracking-tight flex items-center space-x-2">
            <span>Priority Inbox</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Action items, deadlines, direct requests, and team decisions extracted from chat.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-surface-card border border-border rounded-md text-xs text-primary placeholder-muted focus:outline-none focus:border-accent w-40 sm:w-52"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-1 bg-surface-card border border-border rounded-md px-2 py-1 text-xs text-secondary">
            <SlidersHorizontal className="w-3 h-3 text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer text-primary text-xs font-medium"
            >
              <option value="score" className="bg-surface-card">Sort: Urgency</option>
              <option value="time" className="bg-surface-card">Sort: Recency</option>
              <option value="confidence" className="bg-surface-card">Sort: Confidence</option>
            </select>
          </div>

          <button
            onClick={() => setShowDismissed(!showDismissed)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              showDismissed
                ? 'bg-accent-soft border-accent text-accent'
                : 'bg-surface-card border-border text-muted hover:text-primary'
            }`}
          >
            {showDismissed ? 'Hide Dismissed' : 'Show Dismissed'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All', count: counts.all, icon: CheckSquare },
          { id: 'urgent', label: 'Urgent', count: counts.urgent, icon: AlertTriangle, isUrgent: true },
          { id: 'my_tasks', label: `My Tasks (${preferences.userName})`, count: counts.my_tasks, icon: CheckCircle },
          { id: 'task', label: 'Tasks', count: counts.task, icon: CheckSquare },
          { id: 'deadline', label: 'Deadlines', count: counts.deadline, icon: Clock },
          { id: 'mention', label: 'Mentions', count: counts.mention, icon: Users },
          { id: 'decision', label: 'Decisions', count: counts.decision, icon: Award },
          { id: 'question', label: 'Questions', count: counts.question, icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-accent text-white shadow-subtle'
                  : 'bg-surface-card border border-border text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                  isActive
                    ? 'bg-black/20 text-white'
                    : 'bg-surface-secondary text-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="bg-surface-card border border-border rounded-md p-10 text-center">
            <CheckCircle className="w-8 h-8 text-muted mx-auto mb-2" />
            <h4 className="text-xs font-medium text-primary mb-1">No items in this view</h4>
            <p className="text-[11px] text-muted max-w-xs mx-auto">
              {searchQuery
                ? 'Try broadening your search criteria.'
                : 'All caught up! Check back as new conversations arrive.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const userAction = itemActions[item.id] || 'active';
            const isCompleted = userAction === 'completed' || item.taskStatus === 'completed';
            const isDismissed = userAction === 'dismissed';
            const isUrgent = item.level === 'urgent';
            const isImportant = item.level === 'important';

            return (
              <div
                key={item.id}
                className={`bg-surface-card border rounded-md p-3 transition-colors ${
                  isDismissed
                    ? 'opacity-40 border-border bg-surface-secondary/40'
                    : isCompleted
                    ? 'border-semantic-success-border bg-semantic-success-bg/30'
                    : isUrgent
                    ? 'border-semantic-urgent-border/80 hover:border-semantic-urgent'
                    : 'border-border hover:border-secondary'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold uppercase ${
                        isUrgent
                          ? 'bg-semantic-urgent-bg text-semantic-urgent border border-semantic-urgent-border'
                          : isImportant
                          ? 'bg-semantic-important-bg text-semantic-important border border-semantic-important-border'
                          : 'bg-semantic-info-bg text-semantic-info border border-semantic-info-border'
                      }`}
                    >
                      {item.level}
                    </span>

                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-surface-secondary text-secondary border border-border">
                      {item.category}
                    </span>

                    {item.isAssignedToUser && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-accent-soft text-accent border border-accent/20">
                        Assigned To You
                      </span>
                    )}

                    {item.taskStatus && (
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase ${
                        isCompleted
                          ? 'bg-semantic-success-bg text-semantic-success border border-semantic-success-border'
                          : item.taskStatus === 'uncertain'
                          ? 'bg-surface-secondary text-muted border border-border'
                          : 'bg-semantic-important-bg text-semantic-important border border-semantic-important-border'
                      }`}>
                        {isCompleted ? 'Completed' : item.taskStatus}
                      </span>
                    )}

                    <span className="text-[11px] text-muted">
                      from <strong className="text-secondary font-medium">{item.sender}</strong>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      onClick={() => onJumpToMessage(item.messageId)}
                      className="text-xs text-accent hover:text-accent-hover flex items-center space-x-1 bg-surface-secondary border border-border px-2 py-0.5 rounded hover:border-accent transition-colors"
                      title="Inspect original message in Explorer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Source</span>
                    </button>

                    {item.category === 'task' && (
                      <button
                        onClick={() =>
                          onUpdateItemAction(item.id, isCompleted ? 'active' : 'completed')
                        }
                        className={`text-xs flex items-center space-x-1 px-2 py-0.5 rounded border transition-colors ${
                          isCompleted
                            ? 'bg-semantic-success-bg border-semantic-success-border text-semantic-success hover:bg-semantic-success-bg/80'
                            : 'bg-surface-card border-border text-secondary hover:text-semantic-success hover:border-semantic-success-border'
                        }`}
                        title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>{isCompleted ? 'Done' : 'Complete'}</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        onUpdateItemAction(item.id, isDismissed ? 'active' : 'dismissed')
                      }
                      className="text-xs p-1 rounded border border-border bg-surface-card text-muted hover:text-primary transition-colors"
                      title={isDismissed ? 'Restore Item' : 'Dismiss Item'}
                    >
                      {isDismissed ? <RotateCcw className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <h4
                  className={`text-xs font-medium mb-1 ${
                    isCompleted ? 'line-through text-muted' : 'text-primary'
                  }`}
                >
                  {item.title}
                </h4>

                {item.description && (
                  <p className="text-[11px] text-secondary mb-1.5 leading-relaxed">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-muted pt-1.5 border-t border-border/60">
                  <div className="flex items-center space-x-1.5 truncate pr-2">
                    <span className="font-medium text-secondary">Reason:</span>
                    <span className="text-primary truncate">{item.reason}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono flex-shrink-0">
                    <span>{Math.round(item.confidence * 100)}% conf</span>
                    <span>Score {item.score}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
