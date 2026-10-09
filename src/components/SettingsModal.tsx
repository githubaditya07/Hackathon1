import React, { useState } from 'react';
import { User, X, Check, Shield } from 'lucide-react';
import { UserPreferences } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (updated: UserPreferences) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const [userName, setUserName] = useState(preferences.userName);
  const [aliasesText, setAliasesText] = useState((preferences.aliases || []).join(', '));
  const [imminentHours, setImminentHours] = useState(preferences.imminentHoursThreshold || 36);
  const [localModelEndpoint, setLocalModelEndpoint] = useState(preferences.localModelEndpoint || 'http://localhost:11434');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAliases = aliasesText
      .split(',')
      .map(a => a.trim().replace(/^@/, ''))
      .filter(Boolean);

    onSavePreferences({
      ...preferences,
      userName: userName.trim() || 'Alex',
      aliases: parsedAliases.length > 0 ? parsedAliases : [userName.trim()],
      imminentHoursThreshold: Number(imminentHours) || 36,
      localModelEndpoint: localModelEndpoint.trim() || 'http://localhost:11434',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">User & Catch-up Settings</h2>
              <p className="text-[11px] text-slate-400">Configure personal mention detection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Your Display Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Used to classify tasks, direct requests, and messages directed at you.
            </p>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Aliases & Nicknames</label>
            <input
              type="text"
              value={aliasesText}
              onChange={(e) => setAliasesText(e.target.value)}
              placeholder="e.g. Alex, Aditya, akg, alex_dev"
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Comma-separated list of handle names that tag you in the conversation.
            </p>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Imminent Deadline Window (Hours)
            </label>
            <input
              type="number"
              min={1}
              max={168}
              value={imminentHours}
              onChange={(e) => setImminentHours(Number(e.target.value))}
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Deadlines within this window will be flagged as Urgent (default: 36 hrs).
            </p>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Local Model Daemon Endpoint (Optional)
            </label>
            <input
              type="text"
              value={localModelEndpoint}
              onChange={(e) => setLocalModelEndpoint(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Strictly local network only. No remote cloud URLs allowed.</span>
            </p>
          </div>

          <div className="pt-3 border-t border-surface-border flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg shadow-sm shadow-brand-500/25 transition-all flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
