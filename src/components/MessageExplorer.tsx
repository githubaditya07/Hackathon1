import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Filter,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  HelpCircle,
  X,
} from 'lucide-react';
import { Conversation, AnalysisResult } from '../types';

interface MessageExplorerProps {
  conversation: Conversation | null;
  analysis: AnalysisResult | null;
  highlightedMessageId: string | null;
  onClearHighlight: () => void;
}

export const MessageExplorer: React.FC<MessageExplorerProps> = ({
  conversation,
  analysis,
  highlightedMessageId,
  onClearHighlight,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSender, setSelectedSender] = useState<string>('all');
  const [onlyInsights, setOnlyInsights] = useState(false);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Map messages to their extracted insights
  const messageInsightMap = useMemo(() => {
    const map: Record<string, Array<{ type: string; label: string; level?: string }>> = {};
    if (!analysis) return map;

    const add = (msgId: string, item: { type: string; label: string; level?: string }) => {
      if (!map[msgId]) map[msgId] = [];
      map[msgId].push(item);
    };

    for (const t of analysis.tasks) {
      add(t.sourceMessageId, {
        type: 'task',
        label: `Task: ${t.description.slice(0, 45)}…`,
        level: t.priority,
      });
    }

    for (const d of analysis.deadlines) {
      add(d.sourceMessageId, {
        type: 'deadline',
        label: `Deadline: ${d.dueDateRaw}`,
        level: d.isImminent ? 'urgent' : 'important',
      });
    }

    for (const m of analysis.mentions) {
      add(m.sourceMessageId, {
        type: 'mention',
        label: `Mention: @${m.matchedName}`,
        level: m.priority,
      });
    }

    for (const dec of analysis.decisions) {
      for (const id of dec.sourceMessageIds) {
        add(id, {
          type: 'decision',
          label: `Decision: ${dec.decision.slice(0, 45)}…`,
        });
      }
    }

    for (const q of analysis.unansweredQuestions) {
      add(q.sourceMessageId, {
        type: 'question',
        label: `Question: ${q.question.slice(0, 45)}…`,
      });
    }

    return map;
  }, [analysis]);

  // Scroll to highlighted message when selected from Action Center
  useEffect(() => {
    if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      const el = messageRefs.current[highlightedMessageId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedMessageId]);

  if (!conversation) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-muted text-xs">
        No conversation loaded to explore.
      </div>
    );
  }

  // Filter messages
  const filteredMessages = conversation.messages.filter((msg) => {
    if (selectedSender !== 'all' && msg.sender !== selectedSender) return false;
    if (onlyInsights && !messageInsightMap[msg.id]) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = msg.text.toLowerCase().includes(q);
      const matchSender = msg.sender.toLowerCase().includes(q);
      if (!matchText && !matchSender) return false;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-primary tracking-tight">
            Conversation Explorer
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Full chronological chat timeline with tagged intelligence citations.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-surface-card border border-border rounded-md text-xs text-primary placeholder-muted focus:outline-none focus:border-accent w-36 sm:w-48"
            />
          </div>

          {/* Sender filter */}
          <div className="flex items-center space-x-1 bg-surface-card border border-border rounded-md px-2 py-1 text-xs text-secondary">
            <Filter className="w-3 h-3 text-muted" />
            <select
              value={selectedSender}
              onChange={(e) => setSelectedSender(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-primary text-xs font-medium"
            >
              <option value="all" className="bg-surface-card">All Senders ({conversation.senders.length})</option>
              {conversation.senders.map((s) => (
                <option key={s} value={s} className="bg-surface-card">{s}</option>
              ))}
            </select>
          </div>

          {/* Insights Only Toggle */}
          <button
            onClick={() => setOnlyInsights(!onlyInsights)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              onlyInsights
                ? 'bg-accent-soft border-accent text-accent'
                : 'bg-surface-card border-border text-muted hover:text-primary'
            }`}
          >
            <Sparkles className="w-3 h-3 text-accent" />
            <span>Insights Only</span>
          </button>
        </div>
      </div>

      {/* Focus Alert if navigated from evidence link */}
      {highlightedMessageId && (
        <div className="bg-accent-soft border border-accent/40 rounded-md p-2.5 flex items-center justify-between text-xs text-primary">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>Inspecting source evidence: Message <code className="font-mono font-semibold">{highlightedMessageId}</code></span>
          </div>
          <button
            onClick={onClearHighlight}
            className="text-muted hover:text-primary p-0.5 rounded"
            title="Clear highlight"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-2">
        {filteredMessages.length === 0 ? (
          <div className="bg-surface-card border border-border rounded-md p-10 text-center text-xs text-muted">
            No messages matched your current search or filters.
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isHighlighted = msg.id === highlightedMessageId;
            const insights = messageInsightMap[msg.id] || [];

            return (
              <div
                key={msg.id}
                ref={(el) => (messageRefs.current[msg.id] = el)}
                className={`bg-surface-card border rounded-md p-3.5 transition-colors ${
                  isHighlighted
                    ? 'highlight-source-message ring-1 ring-accent'
                    : insights.length > 0
                    ? 'border-border hover:border-secondary'
                    : 'border-border/60 hover:border-border'
                }`}
              >
                {/* Header row: Sender name, You badge, timestamp */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded bg-surface-secondary text-secondary flex items-center justify-center text-xs font-mono font-semibold">
                      {msg.sender.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-semibold text-xs text-primary">{msg.sender}</span>
                    {msg.isUserSender && (
                      <span className="px-1 py-0.2 rounded text-[10px] font-mono bg-accent-soft text-accent border border-accent/20">
                        You
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 text-[11px] font-mono text-muted">
                    <Clock className="w-3 h-3 text-muted" />
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Message body (safe text) */}
                <p className="text-xs text-primary leading-relaxed whitespace-pre-wrap font-sans pl-8">
                  {msg.text}
                </p>

                {/* Attached Insight Citations */}
                {insights.length > 0 && (
                  <div className="mt-2.5 pl-8 flex items-center space-x-1.5 flex-wrap gap-y-1">
                    {insights.map((ins, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
                          ins.type === 'task'
                            ? 'bg-semantic-important-bg text-semantic-important border-semantic-important-border'
                            : ins.type === 'deadline'
                            ? 'bg-semantic-urgent-bg text-semantic-urgent border-semantic-urgent-border'
                            : ins.type === 'decision'
                            ? 'bg-semantic-success-bg text-semantic-success border-semantic-success-border'
                            : ins.type === 'mention'
                            ? 'bg-accent-soft text-accent border-accent/30'
                            : 'bg-semantic-info-bg text-semantic-info border-semantic-info-border'
                        }`}
                      >
                        {ins.type === 'task' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {ins.type === 'deadline' && <AlertTriangle className="w-2.5 h-2.5" />}
                        {ins.type === 'decision' && <Award className="w-2.5 h-2.5" />}
                        {ins.type === 'mention' && <Users className="w-2.5 h-2.5" />}
                        {ins.type === 'question' && <HelpCircle className="w-2.5 h-2.5" />}
                        <span>{ins.label}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
