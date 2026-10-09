import React from 'react';
import {
  ShieldCheck,
  Plus,
  PlayCircle,
  Settings,
  Layers,
  CheckSquare,
  MessageSquare,
  Lock,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Conversation } from '../types';

interface HeaderProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  activeTab: 'dashboard' | 'actions' | 'explorer' | 'privacy';
  onSelectTab: (tab: 'dashboard' | 'actions' | 'explorer' | 'privacy') => void;
  onOpenImport: () => void;
  onLoadDemo: () => void;
  onOpenSettings: () => void;
  urgentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  activeTab,
  onSelectTab,
  onOpenImport,
  onLoadDemo,
  onOpenSettings,
  urgentCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Tagline */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-brand-400/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight text-white font-sans">UNREAD</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded">
                    Engine
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Catch up on what matters. Skip what doesn't.</p>
              </div>
            </div>

            {/* Conversation Switcher Dropdown */}
            {conversations.length > 0 && (
              <div className="relative hidden md:block">
                <div className="flex items-center space-x-2 bg-surface border border-surface-border rounded-lg px-3 py-1.5 hover:border-slate-600 transition-colors">
                  <span className="text-xs text-slate-400">Chat:</span>
                  <select
                    className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-4"
                    value={activeConversationId || ''}
                    onChange={(e) => onSelectConversation(e.target.value)}
                  >
                    {conversations.map((c) => (
                      <option key={c.id} value={c.id} className="bg-surface text-slate-200">
                        {c.title} ({c.messageCount} msgs)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('actions')}
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'actions'
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Action Center</span>
              {urgentCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold bg-accent-urgent text-white rounded-full">
                  {urgentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('explorer')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'explorer'
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Explorer</span>
            </button>

            <button
              onClick={() => onSelectTab('privacy')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'privacy'
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy Center</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* 100% Local Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Local • Zero Leakage</span>
            </div>

            {/* Load Demo Button */}
            <button
              onClick={onLoadDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-surface border border-surface-border hover:bg-surface-hover hover:border-slate-500 rounded-lg transition-colors"
              title="Load Hackathon Sprint Sample Conversation"
            >
              <PlayCircle className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden md:inline">Demo</span>
            </button>

            {/* Import Button */}
            <button
              onClick={onOpenImport}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-surface rounded-lg transition-colors"
              title="User Preferences & Mentions"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
