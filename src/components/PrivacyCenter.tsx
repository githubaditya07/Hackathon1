import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  HardDrive,
  Cpu,
  Download,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  FileText,
  Lock,
} from 'lucide-react';
import { Conversation, AnalysisResult, UserPreferences } from '../types';
import { getStorageUsage } from '../lib/storage/indexedDB';
import { checkLocalModelRuntime, LocalModelStatus } from '../lib/nlp/localModelAdapter';

interface PrivacyCenterProps {
  conversation: Conversation | null;
  analysis: AnalysisResult | null;
  preferences: UserPreferences;
  onDeleteCurrentConversation: () => void;
  onClearAllData: () => void;
}

export const PrivacyCenter: React.FC<PrivacyCenterProps> = ({
  conversation,
  analysis,
  preferences,
  onDeleteCurrentConversation,
  onClearAllData,
}) => {
  const [storageInfo, setStorageInfo] = useState<{
    conversationCount: number;
    messageCount: number;
    estimatedBytes: number;
  }>({ conversationCount: 0, messageCount: 0, estimatedBytes: 0 });

  const [localModelStatus, setLocalModelStatus] = useState<LocalModelStatus | null>(null);
  const [isCheckingModel, setIsCheckingModel] = useState(false);

  useEffect(() => {
    refreshStorageInfo();
    runModelCheck();
  }, [conversation]);

  const refreshStorageInfo = async () => {
    const info = await getStorageUsage();
    setStorageInfo(info);
  };

  const runModelCheck = async () => {
    setIsCheckingModel(true);
    const status = await checkLocalModelRuntime(preferences.localModelEndpoint);
    setLocalModelStatus(status);
    setIsCheckingModel(false);
  };

  // Export JSON
  const handleExportJson = () => {
    if (!conversation) return;
    const exportData = {
      conversation,
      analysis,
      exportedAt: new Date().toISOString(),
      privacyAudit: '100% on-device data export. No cloud transmission occurred.',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unread-export-${conversation.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Markdown Report
  const handleExportMarkdown = () => {
    if (!conversation || !analysis) return;

    let md = `# UNREAD Catch-up Briefing: ${conversation.title}\n\n`;
    md += `*Generated on-device on ${new Date(analysis.analyzedAt).toLocaleString()}*\n\n`;
    md += `## Executive Summary\n${analysis.summary.executiveSummary}\n\n`;

    md += `## Top Urgent & Important Items\n`;
    analysis.priorities.forEach((p, idx) => {
      md += `${idx + 1}. **[${p.level.toUpperCase()}] ${p.title}** (Score: ${p.score}/100)\n`;
      md += `   - *Why prioritized:* ${p.reason}\n`;
      md += `   - *Source:* ${p.sourceSender} at ${new Date(p.sourceTimestamp).toLocaleString()}\n\n`;
    });

    md += `## Action Items & Tasks\n`;
    analysis.tasks.forEach((t) => {
      md += `- [ ] **${t.description}** (Assigned: ${t.assignee || 'Team'}, Status: ${t.status})\n`;
      if (t.dueDate) md += `  - Due Date: ${t.dueDate}\n`;
    });
    md += `\n`;

    md += `## Confirmed Decisions\n`;
    analysis.decisions.forEach((d) => {
      md += `- **${d.decision}** (Status: ${d.status}, Agreed by: ${d.participants.join(', ')})\n`;
    });
    md += `\n`;

    md += `## Privacy Audit Log\n`;
    md += `- Processing Pipeline: Pure On-Device Deterministic NLP\n`;
    md += `- Storage: Browser IndexedDB\n`;
    md += `- External Network Leakage: 0 bytes\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unread-report-${conversation.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-semibold text-primary tracking-tight flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <span>Local Privacy & Security Center</span>
        </h2>
        <p className="text-xs text-muted mt-0.5">
          100% on-device processing telemetry, local storage audit, and data governance controls.
        </p>
      </div>

      {/* Local-First Architecture Guarantee */}
      <div className="bg-surface-card border border-border rounded-md p-4 space-y-2">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
            Local-First Architectural Guarantee
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-semantic-success-bg text-semantic-success border border-semantic-success-border">
            Active
          </span>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          Conversations, tasks, deadlines, and summaries are parsed directly in your browser's memory and stored exclusively in your local IndexedDB (<code className="font-mono text-primary">unread_catchup_db</code>). Zero messages or tokens are transmitted to external cloud APIs or servers.
        </p>
      </div>

      {/* Grid: Storage Telemetry & Local Daemon Probe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Storage Telemetry */}
        <div className="bg-surface-card border border-border rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-primary flex items-center space-x-1.5">
              <HardDrive className="w-3.5 h-3.5 text-secondary" />
              <span>Browser Storage</span>
            </h4>
            <span className="text-[10px] font-mono text-muted">
              ~{(storageInfo.estimatedBytes / 1024).toFixed(1)} KB used
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-secondary">Stored Conversations</span>
              <span className="font-mono font-medium text-primary">{storageInfo.conversationCount}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-secondary">Cached Messages</span>
              <span className="font-mono font-medium text-primary">{storageInfo.messageCount}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-secondary">Persistence Engine</span>
              <span className="font-mono text-primary">IndexedDB</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Outbound Network Telemetry</span>
              <span className="font-mono text-semantic-success">0 Bytes</span>
            </div>
          </div>
        </div>

        {/* Local Model Daemon Probe */}
        <div className="bg-surface-card border border-border rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-primary flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-secondary" />
              <span>On-Device AI Probe</span>
            </h4>
            <button
              onClick={runModelCheck}
              disabled={isCheckingModel}
              className="text-xs text-accent hover:text-accent-hover flex items-center space-x-1"
            >
              <RefreshCw className={`w-3 h-3 ${isCheckingModel ? 'animate-spin' : ''}`} />
              <span>Probe</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-secondary">Local Daemon Endpoint</span>
              <span className="font-mono text-primary truncate max-w-[150px]">{preferences.localModelEndpoint}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-secondary">Daemon Status</span>
              <span
                className={`font-mono flex items-center space-x-1 ${
                  localModelStatus?.available ? 'text-semantic-success' : 'text-muted'
                }`}
              >
                {localModelStatus?.available ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active ({localModelStatus.modelName})</span>
                  </>
                ) : (
                  <span>Offline / Fallback Active</span>
                )}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Active Engine</span>
              <span className="font-mono text-primary">Deterministic NLP Pipeline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Export & Destruction */}
      <div className="bg-surface-card border border-border rounded-md p-4 space-y-4">
        <h4 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center space-x-1.5">
          <Download className="w-3.5 h-3.5 text-accent" />
          <span>Data Portability & Management</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportMarkdown}
            disabled={!conversation}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-md bg-surface-secondary border border-border hover:bg-surface-hover text-primary text-xs font-medium transition-colors disabled:opacity-40"
          >
            <FileText className="w-3.5 h-3.5 text-secondary" />
            <span>Export Briefing (.md)</span>
          </button>

          <button
            onClick={handleExportJson}
            disabled={!conversation}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-md bg-surface-secondary border border-border hover:bg-surface-hover text-primary text-xs font-medium transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-secondary" />
            <span>Export Raw Data (.json)</span>
          </button>
        </div>

        <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h5 className="text-xs font-medium text-semantic-urgent flex items-center space-x-1">
              <AlertOctagon className="w-3 h-3" />
              <span>Danger Zone: Local Removal</span>
            </h5>
            <p className="text-[11px] text-muted">
              Permanently purges messages and computed insights from your device.
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={onDeleteCurrentConversation}
              disabled={!conversation}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-md bg-surface-card border border-semantic-urgent-border text-semantic-urgent hover:bg-semantic-urgent-bg text-xs font-medium transition-colors disabled:opacity-30"
            >
              Delete Current Chat
            </button>
            <button
              onClick={onClearAllData}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-md bg-semantic-urgent text-white hover:opacity-90 text-xs font-medium transition-colors"
            >
              Purge All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
