import React, { useState } from 'react';
import { Sparkles, ShieldCheck, PlayCircle, Upload } from 'lucide-react';
import { UserPreferences } from '../types';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDemo: () => void;
  onOpenImport: () => void;
  preferences: UserPreferences;
  onSavePreferences: (updated: UserPreferences) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onLoadDemo,
  onOpenImport,
  preferences,
  onSavePreferences,
}) => {
  const [userName, setUserName] = useState(preferences.userName);
  const [aliases, setAliases] = useState((preferences.aliases || []).join(', '));

  if (!isOpen) return null;

  const handleStart = (action: 'demo' | 'import') => {
    const parsedAliases = aliases
      .split(',')
      .map((a) => a.trim().replace(/^@/, ''))
      .filter(Boolean);

    onSavePreferences({
      ...preferences,
      userName: userName.trim() || 'Alex',
      aliases: parsedAliases.length > 0 ? parsedAliases : [userName.trim() || 'Alex'],
    });

    onClose();
    if (action === 'demo') onLoadDemo();
    else onOpenImport();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-card border border-border rounded-lg w-full max-w-lg overflow-hidden shadow-card p-6 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center text-white mx-auto shadow-subtle">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-primary tracking-tight">
            Welcome to UNREAD
          </h2>
          <p className="text-xs text-secondary max-w-sm mx-auto">
            Catch up on what matters in overwhelming conversations. Skip what doesn't.
          </p>
        </div>

        {/* Local Privacy Pledge */}
        <div className="bg-surface-secondary border border-border rounded-md p-3 flex items-start space-x-2.5 text-xs text-secondary">
          <ShieldCheck className="w-4 h-4 text-semantic-success flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-primary font-medium block">100% On-Device Processing</strong>
            <span className="text-[11px] text-muted">
              Your conversations never leave this machine. All text parsing, deadline math, and priority scoring run locally.
            </span>
          </div>
        </div>

        {/* Personalization */}
        <div className="space-y-2.5 bg-surface-secondary p-3.5 rounded-md border border-border text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold block">
            Personalize Your Briefing
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-secondary block mb-0.5 font-medium">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Alex"
                className="w-full bg-surface-card border border-border rounded px-2.5 py-1 text-primary focus:outline-none focus:border-accent text-xs"
              />
            </div>
            <div>
              <label className="text-secondary block mb-0.5 font-medium">Aliases (e.g. Alex, Adi)</label>
              <input
                type="text"
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder="Alex, Aditya, akg"
                className="w-full bg-surface-card border border-border rounded px-2.5 py-1 text-primary focus:outline-none focus:border-accent text-xs"
              />
            </div>
          </div>
        </div>

        {/* Launch Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => handleStart('demo')}
            className="w-full py-2 px-3 rounded-md bg-accent hover:bg-accent-hover text-white font-medium text-xs shadow-subtle transition-colors flex items-center justify-center space-x-1.5"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Load Demo Conversation (Hackathon Sprint)</span>
          </button>

          <button
            onClick={() => handleStart('import')}
            className="w-full py-1.5 px-3 rounded-md bg-surface-card border border-border hover:bg-surface-hover text-secondary hover:text-primary font-medium text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-muted" />
            <span>Import Chat Export File (.txt / .json)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
