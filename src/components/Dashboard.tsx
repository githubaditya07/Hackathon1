import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  Users,
  Calendar,
} from 'lucide-react';
import { Conversation, AnalysisResult, UserPreferences } from '../types';

interface DashboardProps {
  conversation: Conversation | null;
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
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-3">No Conversation Loaded Yet</h2>
        <p className="text-slate-400 max-w-lg mx-auto mb-8 text-sm">
          UNREAD processes your message exports 100% locally on your computer. Load our built-in hackathon sprint sample or import your own chat export to get started.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onLoadDemo}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Demo Conversation</span>
          </button>
          <button
            onClick={onOpenImport}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-surface border border-surface-border hover:bg-surface-hover text-slate-200 font-semibold text-sm transition-all"
          >
            Import Chat File (.txt / .json)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Banner & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Hello, {preferences.userName}
            </h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-surface-subtle text-slate-300 border border-surface-border rounded-md">
              {conversation.title}
            </span>
            {conversation.isSample && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                Sample Dataset
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {stats.totalMessages} total messages analyzed • Last updated {analysis ? new Date(analysis.analyzedAt).toLocaleTimeString() : 'Never'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-surface border border-surface-border hover:border-slate-500 text-slate-200 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-brand-400' : 'text-slate-400'}`} />
            <span>{isAnalyzing ? 'Analyzing On-Device...' : 'Re-Analyze Conversation'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Urgent Items */}
        <div
          onClick={() => onNavigateToAction('urgent')}
          className="bg-surface-card border border-surface-border hover:border-red-500/40 rounded-xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">Urgent</span>
            <AlertTriangle className="w-4 h-4 text-accent-urgent group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.urgentCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Requires immediate action</p>
        </div>

        {/* Pending Tasks */}
        <div
          onClick={() => onNavigateToAction('task')}
          className="bg-surface-card border border-surface-border hover:border-amber-500/40 rounded-xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-accent-warning group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.taskCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Action items tracked</p>
        </div>

        {/* Imminent Deadlines */}
        <div
          onClick={() => onNavigateToAction('deadline')}
          className="bg-surface-card border border-surface-border hover:border-red-500/40 rounded-xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">Deadlines</span>
            <Clock className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.imminentDeadlineCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Within &lt; 36 hours</p>
        </div>

        {/* Mentions */}
        <div
          onClick={() => onNavigateToAction('mention')}
          className="bg-surface-card border border-surface-border hover:border-indigo-500/40 rounded-xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">Mentions</span>
            <Users className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.mentionCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Name & alias pings</p>
        </div>

        {/* Confirmed Decisions */}
        <div
          onClick={() => onNavigateToAction('decision')}
          className="bg-surface-card border border-surface-border hover:border-emerald-500/40 rounded-xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">Decisions</span>
            <Award className="w-4 h-4 text-accent-success group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.decisionCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Consensus recorded</p>
        </div>

        {/* Unanswered Questions */}
        <div
          onClick={() => onNavigateToAction('question')}
          className="bg-surface-card border border-surface-border hover:border-blue-500/40 rounded-xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">Unanswered</span>
            <HelpCircle className="w-4 h-4 text-accent-info group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.questionCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Open team questions</p>
        </div>
      </div>

      {/* Executive Briefing Banner */}
      {analysis?.summary && (
        <div className="bg-gradient-to-r from-surface-card via-surface to-surface-card border border-surface-border rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start space-x-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Executive Catch-up Briefing</h3>
                <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  <span>Deterministic Local NLP</span>
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {analysis.summary.executiveSummary}
              </p>
              {analysis.summary.changeDelta && (
                <div className="mt-3 text-xs text-brand-300/90 bg-brand-500/10 border border-brand-500/20 rounded-lg p-2.5">
                  <strong>Delta:</strong> {analysis.summary.changeDelta}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Top Priorities & Developments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Priorities Column (2 cols wide) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <h2 className="text-base font-semibold text-white">Top Priorities & Action Items</h2>
            </div>
            <button
              onClick={() => onNavigateToAction('all')}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1 font-medium transition-colors"
            >
              <span>View all ({analysis?.priorities?.length || 0})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {topPriorities.length === 0 ? (
              <div className="bg-surface-card border border-surface-border rounded-xl p-6 text-center text-slate-400 text-xs">
                No critical priorities detected in this conversation yet.
              </div>
            ) : (
              topPriorities.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-card border border-surface-border hover:border-slate-600 rounded-xl p-4 transition-all hover:bg-surface/50 group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
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
                      <span className="text-[11px] text-slate-400">
                        from <strong className="text-slate-300">{item.sourceSender}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-[11px] text-slate-500 font-mono">Score {item.score}/100</span>
                      <button
                        onClick={() => onJumpToMessage(item.sourceMessageId)}
                        className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center space-x-1 bg-surface-subtle border border-surface-border px-2 py-0.5 rounded hover:border-brand-500/40 transition-colors"
                        title="Jump to original message in chat"
                      >
                        <span>Evidence</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-medium text-slate-100 mb-1 group-hover:text-brand-300 transition-colors">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Explainable Reasoning Badge */}
                  <div className="text-[11px] text-slate-400 bg-surface/80 rounded px-2.5 py-1 border border-surface-border/60 flex items-center space-x-1.5">
                    <span className="text-slate-500 font-medium">Why prioritized:</span>
                    <span className="text-slate-300">{item.reason}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Key Developments & Topic Clusters */}
        <div className="space-y-6">
          {/* Important Developments */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Award className="w-3.5 h-3.5 text-brand-400" />
              <span>Key Developments</span>
            </h3>
            <div className="space-y-2">
              {analysis?.summary?.importantDevelopments && analysis.summary.importantDevelopments.length > 0 ? (
                analysis.summary.importantDevelopments.map((dev, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{dev}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No major developments tagged yet.</p>
              )}
            </div>
          </div>

          {/* Key Topics */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
              <span>Discussion Topics</span>
            </h3>
            <div className="space-y-2.5">
              {analysis?.summary?.keyTopics && analysis.summary.keyTopics.length > 0 ? (
                analysis.summary.keyTopics.map((topic, idx) => (
                  <div key={idx} className="bg-surface/50 border border-surface-border/80 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-200">{topic.topic}</span>
                      <span className="text-[10px] text-slate-400 bg-surface px-1.5 py-0.5 rounded border border-surface-border">
                        {topic.messageCount} msgs
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{topic.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No specific topics clustered.</p>
              )}
            </div>
          </div>

          {/* Chronological Recap */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              <span>Chronological Flow</span>
            </h3>
            <div className="space-y-2">
              {analysis?.summary?.chronologicalRecap && analysis.summary.chronologicalRecap.length > 0 ? (
                analysis.summary.chronologicalRecap.map((phase, idx) => (
                  <div key={idx} className="border-l-2 border-brand-500/40 pl-3 py-1 space-y-0.5">
                    <span className="text-[10px] text-brand-400 font-mono font-medium">{phase.timeRange}</span>
                    <p className="text-xs text-slate-300">{phase.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No chronological recap generated.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
