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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8">
        {/* Brand Hero */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-xl shadow-brand-500/25 ring-1 ring-brand-400/40 mx-auto">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome to UNREAD
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            “Catch up on what matters. Skip what doesn't.”
          </p>
        </div>

        {/* Local Privacy Pledge */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-emerald-300 block font-semibold">100% On-Device Local Processing</strong>
            <span>
              Your chats never leave your browser. All parsing, entity extraction, deadline math, and priority scoring run locally with zero network calls.
            </span>
          </div>
        </div>

        {/* Personalization */}
        <div className="space-y-3 bg-surface p-4 rounded-xl border border-surface-border">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Personalize Your Catch-up
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Alex"
                className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Aliases (e.g. Alex, Adi)</label>
              <input
                type="text"
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder="Alex, Aditya, akg"
                className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => handleStart('demo')}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 group hover:scale-[1.01] active:scale-[0.99]"
          >
            <PlayCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span>Load Demo Conversation (Hackathon Sprint)</span>
          </button>

          <button
            onClick={() => handleStart('import')}
            className="w-full py-2.5 px-4 rounded-xl bg-surface border border-surface-border hover:bg-surface-hover text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Import Your Own Conversation File (.txt / .json)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
