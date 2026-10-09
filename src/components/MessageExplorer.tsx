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
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400">
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

  // Sender color hash
  const getSenderColor = (sender: string) => {
    const colors = [
      'from-indigo-500 to-purple-600',
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-cyan-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
    ];
    let hash = 0;
    for (let i = 0; i < sender.length; i++) hash += sender.charCodeAt(i);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-brand-400" />
            <span>Message Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Searchable full chat timeline with direct evidence highlighting and source verification.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chat messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-surface border border-surface-border rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 w-44 sm:w-56"
            />
          </div>

          {/* Sender Filter */}
          <div className="flex items-center space-x-1.5 bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSender}
              onChange={(e) => setSelectedSender(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-slate-200 text-xs font-medium"
            >
              <option value="all" className="bg-surface">All Senders ({conversation.senders.length})</option>
              {conversation.senders.map((s) => (
                <option key={s} value={s} className="bg-surface">{s}</option>
              ))}
            </select>
          </div>

          {/* Insights Only Toggle */}
          <button
            onClick={() => setOnlyInsights(!onlyInsights)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              onlyInsights
                ? 'bg-brand-500/15 border-brand-500/30 text-brand-300'
                : 'bg-surface border-surface-border text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-brand-400" />
            <span>Tagged Insights Only</span>
          </button>
        </div>
      </div>

      {/* Highlight active alert if navigating from an action */}
      {highlightedMessageId && (
        <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-brand-300">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-400 animate-spin" />
            <span>Inspecting source evidence for message <strong>{highlightedMessageId}</strong></span>
          </div>
          <button
            onClick={onClearHighlight}
            className="text-[11px] underline hover:text-white"
          >
            Clear focus
          </button>
        </div>
      )}

      {/* Messages Timeline */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="bg-surface-card border border-surface-border rounded-xl p-12 text-center text-slate-400 text-xs">
            No messages matched your current filters.
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isHighlighted = msg.id === highlightedMessageId;
            const insights = messageInsightMap[msg.id] || [];

            return (
              <div
                key={msg.id}
                ref={(el) => (messageRefs.current[msg.id] = el)}
                className={`bg-surface-card border rounded-xl p-4 transition-all ${
                  isHighlighted
                    ? 'highlight-source-message ring-2 ring-brand-500 shadow-xl'
                    : insights.length > 0
                    ? 'border-surface-border hover:border-slate-600'
                    : 'border-surface-border/60 hover:border-surface-border'
                }`}
              >
                {/* Header row: Sender avatar, name, time */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${getSenderColor(
                        msg.sender
                      )} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                    >
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm text-slate-200">{msg.sender}</span>
                    {msg.isUserSender && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        You
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Message Body (Safe text rendered, no unsafe HTML) */}
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans pl-9">
                  {msg.text}
                </p>

                {/* Attached Insights Badges */}
                {insights.length > 0 && (
                  <div className="mt-3 pl-9 flex items-center space-x-2 flex-wrap gap-y-1.5">
                    {insights.map((ins, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                          ins.type === 'task'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : ins.type === 'deadline'
                            ? 'bg-red-500/10 text-red-300 border-red-500/20'
                            : ins.type === 'decision'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : ins.type === 'mention'
                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                            : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                        }`}
                      >
                        {ins.type === 'task' && <CheckCircle2 className="w-3 h-3" />}
                        {ins.type === 'deadline' && <AlertTriangle className="w-3 h-3" />}
                        {ins.type === 'decision' && <Award className="w-3 h-3" />}
                        {ins.type === 'mention' && <Users className="w-3 h-3" />}
                        {ins.type === 'question' && <HelpCircle className="w-3 h-3" />}
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
