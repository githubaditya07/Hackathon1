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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-card border border-border rounded-lg w-full max-w-xl overflow-hidden shadow-card flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-accent-soft text-accent flex items-center justify-center">
              <Upload className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary">Import Conversation</h3>
              <p className="text-[11px] text-muted">100% processed locally on this device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-primary rounded hover:bg-surface-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-5 pt-2.5 flex items-center space-x-4 border-b border-border">
          <button
            onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
            className={`pb-2 text-xs font-medium border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload File (.txt / .json)</span>
          </button>
          <button
            onClick={() => { setActiveTab('paste'); setErrorMessage(null); }}
            className={`pb-2 text-xs font-medium border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'paste'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste Text Directly</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="bg-semantic-urgent-bg border border-semantic-urgent-border rounded-md p-2.5 text-xs text-semantic-urgent flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-accent bg-accent-soft'
                  : 'border-border hover:border-secondary bg-surface-secondary'
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
              <FileText className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-xs font-medium text-primary mb-0.5">
                Drop your chat export file here, or click to browse
              </p>
              <p className="text-[11px] text-muted">
                Supports WhatsApp txt exports, bracketed logs, or JSON.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <textarea
                rows={5}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="[2026-10-09 09:15:20] Alice: Hey @Alex, please check the build&#10;[2026-10-09 09:16:00] Bob: We decided to deploy at 5pm"
                className="w-full bg-surface-secondary border border-border rounded-md p-2.5 text-xs font-mono text-primary placeholder-muted focus:outline-none focus:border-accent"
              />
              <button
                onClick={handlePasteAnalyze}
                className="px-3 py-1.5 bg-surface-card hover:bg-surface-hover border border-border text-primary text-xs font-medium rounded-md transition-colors"
              >
                Validate & Preview
              </button>
            </div>
          )}

          {/* Pre-import Preview */}
          {previewResult && (
            <div className="bg-surface-secondary border border-border rounded-md p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-semantic-success flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Validated Successfully</span>
                </span>
                <span className="text-xs font-mono text-muted">
                  {previewResult.messages.length} messages
                </span>
              </div>

              <div>
                <label className="text-[11px] text-muted block mb-0.5">Conversation Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded px-2.5 py-1 text-xs text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-secondary">
                <div>
                  <strong>Senders ({previewResult.senders.length}):</strong>{' '}
                  {previewResult.senders.slice(0, 3).join(', ')}
                  {previewResult.senders.length > 3 ? '…' : ''}
                </div>
                <div>
                  <strong>Date:</strong>{' '}
                  {previewResult.startDate ? new Date(previewResult.startDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className="border-t border-border pt-1.5">
                <span className="text-[10px] text-muted uppercase font-mono block mb-1">
                  Message Preview:
                </span>
                <div className="text-[11px] font-mono text-primary bg-surface-card p-2 rounded border border-border max-h-20 overflow-y-auto space-y-0.5">
                  {previewResult.messages.slice(0, 3).map((m, idx) => (
                    <div key={idx} className="truncate">
                      <strong className="text-accent">{m.sender}:</strong> {m.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-surface-secondary">
          <button
            onClick={() => {
              onLoadDemo();
              onClose();
            }}
            className="text-xs text-accent hover:text-accent-hover flex items-center space-x-1 font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Instead</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-muted hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={!previewResult || previewResult.messages.length === 0}
              className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-md shadow-subtle transition-colors disabled:opacity-40"
            >
              Import & Catch Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
