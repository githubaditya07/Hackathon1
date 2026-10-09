import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Clipboard,
  FileUp,
} from 'lucide-react';
import { Conversation, ParseResult } from '../types';
import { parseChatLog } from '../lib/parser/chatParser';
import { validateImportFile } from '../lib/security/sanitizer';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportConversation: (conversation: Conversation) => void;
  onLoadDemo: () => void;
  userName: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportConversation,
  onLoadDemo,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [previewResult, setPreviewResult] = useState<ParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setErrorMessage(null);
    const validation = validateImportFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file format.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = parseChatLog(content, userName);
      if (!res.success) {
        setErrorMessage(res.errors[0] || 'Unable to parse conversation messages.');
        setPreviewResult(null);
      } else {
        setPreviewResult(res);
        if (!customTitle) {
          setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file on device.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handlePasteAnalyze = () => {
    setErrorMessage(null);
    if (!pastedText.trim()) {
      setErrorMessage('Please paste chat content first.');
      return;
    }
    const res = parseChatLog(pastedText, userName);
    if (!res.success) {
      setErrorMessage(res.errors[0] || 'Unable to parse conversation messages.');
      setPreviewResult(null);
    } else {
      setPreviewResult(res);
      if (!customTitle) setCustomTitle('Pasted Chat Export');
    }
  };

  const handleConfirmImport = () => {
    if (!previewResult || previewResult.messages.length === 0) return;

    const conv: Conversation = {
      id: `conv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title: customTitle.trim() || 'Imported Conversation',
      importedAt: new Date().toISOString(),
      messageCount: previewResult.messages.length,
      senders: previewResult.senders,
      startDate: previewResult.startDate,
      endDate: previewResult.endDate,
      messages: previewResult.messages,
      isSample: false,
    };

    onImportConversation(conv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Upload className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Import Conversation</h2>
              <p className="text-[11px] text-slate-400">100% processed locally on your device.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-6 pt-4 flex items-center space-x-3 border-b border-surface-border">
          <button
            onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
            className={`pb-2 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload File (.txt / .json)</span>
          </button>
          <button
            onClick={() => { setActiveTab('paste'); setErrorMessage(null); }}
            className={`pb-2 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'paste'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste Text Directly</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
                  : 'border-surface-border hover:border-slate-500 bg-surface/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.log,.json,.chat"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
              <FileText className="w-10 h-10 text-brand-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-200 mb-1">
                Drop your chat export file here, or click to browse
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Supports WhatsApp txt exports, timestamped IRC/Slack plain-text logs, or structured JSON.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="[2026-10-09 09:15:20] Alice: Hey @Alex, please check the build&#10;[2026-10-09 09:16:00] Bob: We decided to deploy at 5pm"
                className="w-full bg-surface border border-surface-border rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={handlePasteAnalyze}
                className="px-4 py-2 bg-surface hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Validate and Preview
              </button>
            </div>
          )}

          {/* Pre-import Preview */}
          {previewResult && (
            <div className="bg-surface border border-surface-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validation Successful</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {previewResult.messages.length} messages parsed
                </span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Conversation Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div>
                  <strong>Senders ({previewResult.senders.length}):</strong>{' '}
                  {previewResult.senders.slice(0, 4).join(', ')}
                  {previewResult.senders.length > 4 ? '…' : ''}
                </div>
                <div>
                  <strong>Date Range:</strong>{' '}
                  {previewResult.startDate ? new Date(previewResult.startDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              {/* Sample snippet */}
              <div className="border-t border-surface-border pt-2">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block mb-1">
                  Sample Message Preview:
                </span>
                <div className="text-[11px] font-mono text-slate-300 bg-surface-card p-2 rounded border border-surface-border/50 max-h-24 overflow-y-auto">
                  {previewResult.messages.slice(0, 3).map((m, idx) => (
                    <div key={idx} className="truncate">
                      <strong className="text-brand-400">{m.sender}:</strong> {m.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-border flex items-center justify-between bg-surface/40">
          <button
            onClick={() => {
              onLoadDemo();
              onClose();
            }}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1.5 font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Instead</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={!previewResult || previewResult.messages.length === 0}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-brand-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Import & Catch Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
