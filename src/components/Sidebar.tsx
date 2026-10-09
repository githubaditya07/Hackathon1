import React from 'react';
import {
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Sun,
  Moon,
  Plus,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import { Conversation, UserPreferences } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  activeTab: 'dashboard' | 'actions' | 'explorer' | 'privacy';
  onSelectTab: (tab: 'dashboard' | 'actions' | 'explorer' | 'privacy', filter?: string) => void;
  urgentCount: number;
  taskCount: number;
  deadlineCount: number;
  preferences: UserPreferences;
  onToggleTheme: () => void;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  activeTab,
  onSelectTab,
  urgentCount,
  taskCount,
  deadlineCount,
  preferences,
  onToggleTheme,
  onOpenImport,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-border">
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none"
            onClick={() => {
              onSelectTab('dashboard');
              onCloseMobile();
            }}
          >
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-sm tracking-tight text-primary font-mono">
                  UNREAD
                </span>
                <span className="text-[10px] px-1 py-0.2 rounded font-mono bg-accent-soft text-accent border border-accent/20">
                  v1.0
                </span>
              </div>
              <span className="text-[10px] text-muted -mt-0.5">On-Device Intelligence</span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1 rounded text-secondary hover:text-primary md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onSelectTab('dashboard');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-accent-soft text-primary font-semibold'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4 text-secondary" />
                <span>Overview</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectTab('actions');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'actions'
                  ? 'bg-accent-soft text-primary font-semibold'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Inbox className="w-4 h-4 text-secondary" />
                <span>Priority Inbox</span>
              </div>
              {urgentCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-semantic-urgent-bg text-semantic-urgent border border-semantic-urgent-border">
                  {urgentCount}
                </span>
              )}
            </button>

            {/* Quick Action Sub-Filters */}
            <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-border ml-3 mt-1 text-[11px]">
              <button
                onClick={() => {
                  onSelectTab('actions', 'urgent');
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-2 py-1 rounded text-secondary hover:text-primary hover:bg-surface-hover"
              >
                <span>Urgent</span>
                {urgentCount > 0 && (
                  <span className="font-mono text-[10px] text-semantic-urgent font-semibold">
                    {urgentCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  onSelectTab('actions', 'my_tasks');
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-2 py-1 rounded text-secondary hover:text-primary hover:bg-surface-hover"
              >
                <span>My Tasks</span>
                {taskCount > 0 && (
                  <span className="font-mono text-[10px] text-secondary">
                    {taskCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  onSelectTab('actions', 'deadline');
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-2 py-1 rounded text-secondary hover:text-primary hover:bg-surface-hover"
              >
                <span>Deadlines</span>
                {deadlineCount > 0 && (
                  <span className="font-mono text-[10px] text-secondary">
                    {deadlineCount}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                onSelectTab('explorer');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'explorer'
                  ? 'bg-accent-soft text-primary font-semibold'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-secondary" />
                <span>Conversation Explorer</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectTab('privacy');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'privacy'
                  ? 'bg-accent-soft text-primary font-semibold'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-secondary" />
                <span>Privacy & Security</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success" title="100% Local" />
            </button>
          </div>

          {/* Conversations Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 text-[10px] font-semibold text-muted tracking-wider uppercase">
              <span>Conversations</span>
              <button
                onClick={() => {
                  onOpenImport();
                  onCloseMobile();
                }}
                className="text-muted hover:text-primary transition-colors p-0.5"
                title="Import conversation"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              {conversations.length === 0 ? (
                <div className="px-2 py-2 text-[11px] text-muted italic">
                  No conversations loaded.
                </div>
              ) : (
                conversations.map((c) => {
                  const isActive = c.id === activeConversationId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectConversation(c.id);
                        onCloseMobile();
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between group ${
                        isActive
                          ? 'bg-surface-card text-primary font-medium border border-border shadow-subtle'
                          : 'text-secondary hover:text-primary hover:bg-surface-hover'
                      }`}
                    >
                      <span className="truncate pr-2">{c.title}</span>
                      <span className="text-[10px] font-mono text-muted group-hover:text-secondary">
                        {c.messageCount}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border space-y-2">
          {/* User profile & settings trigger */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-surface-card border border-border">
            <div
              className="flex items-center space-x-2 cursor-pointer truncate"
              onClick={onOpenSettings}
              title="Configure personal mention settings"
            >
              <div className="w-6 h-6 rounded bg-accent-soft text-accent flex items-center justify-center text-xs font-semibold">
                {preferences.userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-medium text-primary truncate leading-none">
                  {preferences.userName}
                </span>
                <span className="text-[10px] text-muted truncate mt-0.5">
                  {(preferences.aliases || []).length} aliases active
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={onToggleTheme}
                className="p-1 rounded text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
                title={`Switch to ${preferences.theme === 'dark' ? 'light' : 'dark'} mode`}
                aria-label="Toggle theme"
              >
                {preferences.theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={onOpenSettings}
                className="p-1 rounded text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
                title="Open settings"
                aria-label="Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="px-2 text-[10px] text-muted flex items-center justify-between">
            <span>Local Device Storage</span>
            <span className="font-mono text-semantic-success">0 B Outbound</span>
          </div>
        </div>
      </aside>
    </>
  );
};
