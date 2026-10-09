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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-brand-400" />
            <span>Action Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized inbox of extracted tasks, deadlines, mentions, and key decisions.
          </p>
        </div>

        {/* Controls: Search & Sort */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search action items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-surface border border-surface-border rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 w-48 sm:w-60"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer text-slate-200 text-xs font-medium"
            >
              <option value="score" className="bg-surface">Sort by Urgency Score</option>
              <option value="time" className="bg-surface">Sort by Recency</option>
              <option value="confidence" className="bg-surface">Sort by Confidence</option>
            </select>
          </div>

          <button
            onClick={() => setShowDismissed(!showDismissed)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showDismissed
                ? 'bg-brand-500/15 border-brand-500/30 text-brand-300'
                : 'bg-surface border-surface-border text-slate-400 hover:text-slate-200'
            }`}
          >
            {showDismissed ? 'Hide Dismissed' : 'Show Dismissed'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Items', count: counts.all, icon: CheckSquare },
          { id: 'urgent', label: 'Urgent', count: counts.urgent, icon: AlertTriangle, highlight: true },
          { id: 'my_tasks', label: `My Tasks (${preferences.userName})`, count: counts.my_tasks, icon: CheckCircle },
          { id: 'task', label: 'All Tasks', count: counts.task, icon: CheckSquare },
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'bg-surface-card border border-surface-border text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.highlight && tab.count > 0 ? 'text-red-400' : ''}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-brand-500/30 text-brand-200'
                    : 'bg-surface text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-surface-card border border-surface-border rounded-xl p-12 text-center">
            <CheckCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300 mb-1">No items found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Try broadening your search query.'
                : 'All caught up in this view! Select another filter or check back after new messages.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const userAction = itemActions[item.id] || 'active';
            const isCompleted = userAction === 'completed' || item.taskStatus === 'completed';
            const isDismissed = userAction === 'dismissed';

            return (
              <div
                key={item.id}
                className={`bg-surface-card border rounded-xl p-4 transition-all ${
                  isDismissed
                    ? 'opacity-40 border-surface-border bg-surface/30'
                    : isCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : item.level === 'urgent'
                    ? 'border-red-500/30 hover:border-red-500/60 shadow-sm shadow-red-500/5'
                    : 'border-surface-border hover:border-slate-600'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.level === 'urgent'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : item.level === 'important'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {item.level}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface text-slate-300 border border-surface-border uppercase">
                      {item.category}
                    </span>

                    {item.isAssignedToUser && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Assigned To You
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400">
                      from <strong className="text-slate-300">{item.sender}</strong>
                    </span>
                  </div>

                  {/* Actions: Jump to Evidence, Mark Done, Dismiss */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => onJumpToMessage(item.messageId)}
                      className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1 bg-surface-subtle border border-surface-border px-2.5 py-1 rounded-md hover:border-brand-500/40 transition-colors"
                      title="Inspect original cited message in Explorer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Source</span>
                    </button>

                    {item.category === 'task' && (
                      <button
                        onClick={() =>
                          onUpdateItemAction(item.id, isCompleted ? 'active' : 'completed')
                        }
                        className={`text-xs flex items-center space-x-1 px-2.5 py-1 rounded-md border transition-colors ${
                          isCompleted
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
                            : 'bg-surface border-surface-border text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40'
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
                      className={`text-xs p-1.5 rounded-md border transition-colors ${
                        isDismissed
                          ? 'bg-surface border-surface-border text-slate-400 hover:text-slate-200'
                          : 'bg-surface border-surface-border text-slate-500 hover:text-red-400 hover:border-red-500/40'
                      }`}
                      title={isDismissed ? 'Restore Item' : 'Dismiss Item'}
                    >
                      {isDismissed ? <RotateCcw className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <h4
                  className={`text-sm font-medium mb-1 ${
                    isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                  }`}
                >
                  {item.title}
                </h4>

                {item.description && (
                  <p className="text-xs text-slate-400 mb-2 leading-relaxed font-sans">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-surface-border/40">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-medium">Reason:</span>
                    <span className="text-slate-300">{item.reason}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span>Confidence {Math.round(item.confidence * 100)}%</span>
                    <span>Score {item.score}/100</span>
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
