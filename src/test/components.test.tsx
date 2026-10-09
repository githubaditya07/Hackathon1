import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header';
import { getSampleConversation } from '../data/sampleConversation';

describe('UI Component Unit Tests', () => {
  it('renders Header with UNREAD logo and active navigation items', () => {
    const sample = getSampleConversation();

    render(
      <Header
        conversations={[sample]}
        activeConversationId={sample.id}
        onSelectConversation={() => {}}
        activeTab="dashboard"
        onSelectTab={() => {}}
        onOpenImport={() => {}}
        onLoadDemo={() => {}}
        onOpenSettings={() => {}}
        urgentCount={3}
      />
    );

    expect(screen.getByText('UNREAD')).toBeInTheDocument();
    expect(screen.getByText("Catch up on what matters. Skip what doesn't.")).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Action Center')).toBeInTheDocument();
    expect(screen.getByText('Explorer')).toBeInTheDocument();
    expect(screen.getByText('Privacy Center')).toBeInTheDocument();
    expect(screen.getByText('100% Local • Zero Leakage')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // urgent badge count
  });
});
