import React, { useState, useEffect, useCallback } from 'react';
import { Conversation, AnalysisResult, UserPreferences, UserActionStatus } from './types';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { ActionCenter } from './components/ActionCenter';
import { MessageExplorer } from './components/MessageExplorer';
import { PrivacyCenter } from './components/PrivacyCenter';
import { ImportModal } from './components/ImportModal';
import { SettingsModal } from './components/SettingsModal';
import { WelcomeModal } from './components/WelcomeModal';
import { getSampleConversation } from './data/sampleConversation';
import { analyzeConversation } from './lib/nlp/analyzer';
import {
  saveConversation,
  listConversations,
  deleteConversation,
  saveAnalysis,
  getAnalysis,
  saveUserPreferences,
  getUserPreferences,
  setItemAction,
  getItemActions,
  clearAllData,
  DEFAULT_PREFERENCES,
} from './lib/storage/indexedDB';

export const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [itemActions, setItemActionsState] = useState<Record<string, UserActionStatus>>({});

  const [activeTab, setActiveTab] = useState<'dashboard' | 'actions' | 'explorer' | 'privacy'>('dashboard');
  const [actionCategoryFilter, setActionCategoryFilter] = useState<string>('all');
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Apply theme class to document element whenever preferences change
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [preferences.theme]);

  // Run on-device analysis
  const runAnalysis = useCallback(
    async (conv: Conversation, prefs: UserPreferences) => {
      setIsAnalyzing(true);
      try {
        const result = await analyzeConversation(conv, prefs, analysis);
        setAnalysis(result);
        await saveAnalysis(result);
      } catch (err) {
        console.error('Analysis failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [analysis]
  );

  // Initialize application data from local IndexedDB
  useEffect(() => {
    async function init() {
      try {
        const storedPrefs = await getUserPreferences();
        setPreferences(storedPrefs);

        const storedActions = await getItemActions();
        setItemActionsState(storedActions);

        const list = await listConversations();
        if (list.length > 0) {
          setConversations(list);
          const firstId = list[0].id;
          setActiveConversationId(firstId);
          const cachedAnalysis = await getAnalysis(firstId);
          if (cachedAnalysis) {
            setAnalysis(cachedAnalysis);
          } else {
            runAnalysis(list[0], storedPrefs);
          }
        } else {
          // New user -> show welcome modal
          setIsWelcomeModalOpen(true);
        }
      } catch (err) {
        console.error('Initialization error in IndexedDB:', err);
      }
    }
    init();
  }, [runAnalysis]);

  // When active conversation changes, load its analysis
  useEffect(() => {
    async function loadConvData() {
      if (!activeConversationId) return;
      const conv = conversations.find(c => c.id === activeConversationId);
      if (!conv) return;

      const cached = await getAnalysis(activeConversationId);
      if (cached) {
        setAnalysis(cached);
      } else {
        runAnalysis(conv, preferences);
      }
    }
    loadConvData();
  }, [activeConversationId, conversations, preferences, runAnalysis]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  // Toggle Theme
  const handleToggleTheme = useCallback(async () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    const updated: UserPreferences = { ...preferences, theme: nextTheme };
    setPreferences(updated);
    await saveUserPreferences(updated);
  }, [preferences]);

  // Load Built-in Demo Conversation
  const handleLoadDemo = useCallback(async () => {
    const demoConv = getSampleConversation();
    await saveConversation(demoConv);
    setConversations((prev) => {
      const exists = prev.some(c => c.id === demoConv.id);
      return exists ? prev : [demoConv, ...prev];
    });
    setActiveConversationId(demoConv.id);
    await runAnalysis(demoConv, preferences);
    setActiveTab('dashboard');
  }, [preferences, runAnalysis]);

  // Import New Conversation
  const handleImportConversation = useCallback(
    async (newConv: Conversation) => {
      await saveConversation(newConv);
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      await runAnalysis(newConv, preferences);
      setActiveTab('dashboard');
    },
    [preferences, runAnalysis]
  );

  // Update Item Action (Complete / Dismiss)
  const handleUpdateItemAction = useCallback(async (itemId: string, status: UserActionStatus) => {
    await setItemAction(itemId, status);
    setItemActionsState((prev) => ({ ...prev, [itemId]: status }));
  }, []);

  // Jump from Action / Dashboard to Message Explorer
  const handleJumpToMessage = useCallback((messageId: string) => {
    setHighlightedMessageId(messageId);
    setActiveTab('explorer');
  }, []);

  // Navigate to Action Center with pre-filtered category
  const handleNavigateToAction = useCallback((category: string) => {
    setActionCategoryFilter(category);
    setActiveTab('actions');
  }, []);

  // Delete current conversation
  const handleDeleteCurrentConversation = useCallback(async () => {
    if (!activeConversationId) return;
    if (confirm('Are you sure you want to delete this conversation and its insights from your device?')) {
      await deleteConversation(activeConversationId);
      const remaining = conversations.filter(c => c.id !== activeConversationId);
      setConversations(remaining);
      setAnalysis(null);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        setActiveConversationId(null);
      }
    }
  }, [activeConversationId, conversations]);

  // Nuclear purge all local data
  const handleClearAllData = useCallback(async () => {
    if (confirm('Permanently purge all stored conversations, cached analyses, and settings from IndexedDB?')) {
      await clearAllData();
      setConversations([]);
      setActiveConversationId(null);
      setAnalysis(null);
      setItemActionsState({});
      setActiveTab('dashboard');
    }
  }, []);

  // Save Preferences
  const handleSavePreferences = useCallback(
    async (updated: UserPreferences) => {
      setPreferences(updated);
      await saveUserPreferences(updated);
      if (activeConversation) {
        runAnalysis(activeConversation, updated);
      }
    },
    [activeConversation, runAnalysis]
  );

  return (
    <div className="min-h-screen flex bg-background text-primary antialiased font-sans">
      {/* Restrained Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        activeTab={activeTab}
        onSelectTab={(tab, filter) => {
          setActiveTab(tab);
          if (filter) setActionCategoryFilter(filter);
          else if (tab === 'actions') setActionCategoryFilter('all');
        }}
        urgentCount={analysis?.stats?.urgentCount || 0}
        taskCount={analysis?.stats?.taskCount || 0}
        deadlineCount={analysis?.stats?.imminentDeadlineCount || 0}
        preferences={preferences}
        onToggleTheme={handleToggleTheme}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <Topbar
          activeTab={activeTab}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => setActiveConversationId(id)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenImport={() => setIsImportModalOpen(true)}
          onLoadDemo={handleLoadDemo}
          preferences={preferences}
          onToggleTheme={handleToggleTheme}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto pb-12">
          {activeTab === 'dashboard' && (
            <Dashboard
              conversation={activeConversation}
              conversations={conversations}
              onSelectConversation={(id) => setActiveConversationId(id)}
              analysis={analysis}
              preferences={preferences}
              onAnalyze={() => activeConversation && runAnalysis(activeConversation, preferences)}
              isAnalyzing={isAnalyzing}
              onNavigateToAction={handleNavigateToAction}
              onJumpToMessage={handleJumpToMessage}
              onOpenImport={() => setIsImportModalOpen(true)}
              onLoadDemo={handleLoadDemo}
            />
          )}

          {activeTab === 'actions' && (
            <ActionCenter
              analysis={analysis}
              preferences={preferences}
              itemActions={itemActions}
              onUpdateItemAction={handleUpdateItemAction}
              onJumpToMessage={handleJumpToMessage}
              initialFilter={actionCategoryFilter}
            />
          )}

          {activeTab === 'explorer' && (
            <MessageExplorer
              conversation={activeConversation}
              analysis={analysis}
              highlightedMessageId={highlightedMessageId}
              onClearHighlight={() => setHighlightedMessageId(null)}
            />
          )}

          {activeTab === 'privacy' && (
            <PrivacyCenter
              conversation={activeConversation}
              analysis={analysis}
              preferences={preferences}
              onDeleteCurrentConversation={handleDeleteCurrentConversation}
              onClearAllData={handleClearAllData}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportConversation={handleImportConversation}
        onLoadDemo={handleLoadDemo}
        userName={preferences.userName}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
      />

      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onLoadDemo={handleLoadDemo}
        onOpenImport={() => setIsImportModalOpen(true)}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
      />
    </div>
  );
};

export default App;
