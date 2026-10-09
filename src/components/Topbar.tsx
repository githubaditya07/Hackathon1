import React from 'react';
import {
  Menu,
  ChevronDown,
  Plus,
  PlayCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { Conversation, UserPreferences } from '../types';

interface TopbarProps {
  activeTab: 'dashboard' | 'actions' | 'explorer' | 'privacy';
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onOpenMobileSidebar: () => void;
  onOpenImport: () => void;
  onLoadDemo: () => void;
  preferences: UserPreferences;
  onToggleTheme: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  conversations,
  activeConversationId,
  onSelectConversation,
  onOpenMobileSidebar,
  onOpenImport,
  onLoadDemo,
  preferences,
  onToggleTheme,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview & Briefing';
      case 'actions':
        return 'Priority Inbox';
      case 'explorer':
        return 'Conversation Explorer';
      case 'privacy':
        return 'Privacy & Local Governance';
      default:
        return 'UNREAD';
    }
  };

  return (
    <header className="h-14 border-b border-border bg-background px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: mobile hamburger & breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-md text-secondary hover:text-primary hover:bg-surface-secondary md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-muted hidden sm:inline">UNREAD</span>
          <span className="text-border hidden sm:inline">/</span>
          <h1 className="font-semibold text-primary">{getTabTitle()}</h1>
        </div>

        {/* Conversation Switcher Dropdown */}
        {conversations.length > 0 && (
          <div className="relative ml-2">
            <div className="flex items-center space-x-1.5 bg-surface-card border border-border rounded-md px-2.5 py-1 text-xs hover:border-secondary transition-colors">
              <span className="text-[11px] text-muted">Chat:</span>
              <select
                className="bg-transparent text-xs text-primary font-medium focus:outline-none cursor-pointer pr-4 max-w-[140px] sm:max-w-[220px] truncate"
                value={activeConversationId || ''}
                onChange={(e) => onSelectConversation(e.target.value)}
              >
                {conversations.map((c) => (
                  <option key={c.id} value={c.id} className="bg-surface-card text-primary">
                    {c.title} ({c.messageCount})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-muted pointer-events-none absolute right-2" />
            </div>
          </div>
        )}
      </div>

      {/* Right section: actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onLoadDemo}
          className="hidden sm:flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-secondary hover:text-primary bg-surface-card border border-border hover:bg-surface-hover rounded-md transition-colors"
          title="Load Hackathon Sprint sample conversation"
        >
          <PlayCircle className="w-3.5 h-3.5 text-accent" />
          <span>Demo</span>
        </button>

        <button
          onClick={onOpenImport}
          className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-md transition-colors shadow-subtle"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Import</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md text-secondary hover:text-primary hover:bg-surface-secondary transition-colors"
          title={`Switch to ${preferences.theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {preferences.theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </header>
  );
};
