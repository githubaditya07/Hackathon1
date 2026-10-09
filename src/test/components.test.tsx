import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { DEFAULT_PREFERENCES } from '../lib/storage/indexedDB';
import { getSampleConversation } from '../data/sampleConversation';

describe('UI Component Unit Tests — Modern Greige Layout', () => {
  it('renders Sidebar with brand logo, priority inbox, and local status', () => {
    const sample = getSampleConversation();

    render(
      <Sidebar
        conversations={[sample]}
        activeConversationId={sample.id}
        onSelectConversation={() => {}}
        activeTab="dashboard"
        onSelectTab={() => {}}
        urgentCount={3}
        taskCount={5}
        deadlineCount={2}
        preferences={DEFAULT_PREFERENCES}
        onToggleTheme={() => {}}
        onOpenImport={() => {}}
        onOpenSettings={() => {}}
        isOpenMobile={false}
        onCloseMobile={() => {}}
      />
    );

    expect(screen.getByText('UNREAD')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Priority Inbox')).toBeInTheDocument();
    expect(screen.getByText('Conversation Explorer')).toBeInTheDocument();
    expect(screen.getByText('Privacy & Security')).toBeInTheDocument();
    expect(screen.getByText('0 B Outbound')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1); // urgent badge count
  });

  it('renders Topbar with view title, demo and import buttons', () => {
    const sample = getSampleConversation();

    render(
      <Topbar
        activeTab="dashboard"
        conversations={[sample]}
        activeConversationId={sample.id}
        onSelectConversation={() => {}}
        onOpenMobileSidebar={() => {}}
        onOpenImport={() => {}}
        onLoadDemo={() => {}}
        preferences={DEFAULT_PREFERENCES}
        onToggleTheme={() => {}}
      />
    );

    expect(screen.getByText('Overview & Briefing')).toBeInTheDocument();
    expect(screen.getByText('Demo')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
  });
});
