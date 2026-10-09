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
  const [theme, setTheme] = useState<'light' | 'dark'>(preferences.theme);

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
      theme,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-card border border-border rounded-lg w-full max-w-md overflow-hidden shadow-card">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-accent-soft text-accent flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary">Preferences & Mention Detection</h3>
              <p className="text-[11px] text-muted">Personalize catch-up triggers and theme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-primary rounded hover:bg-surface-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="text-secondary font-medium block mb-1">Display Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Alex"
              className="w-full bg-surface-secondary border border-border rounded px-2.5 py-1.5 text-primary focus:outline-none focus:border-accent"
              required
            />
            <p className="text-[11px] text-muted mt-0.5">
              Identifies direct requests and tasks assigned to you.
            </p>
          </div>

          <div>
            <label className="text-secondary font-medium block mb-1">Aliases & Nicknames</label>
            <input
              type="text"
              value={aliasesText}
              onChange={(e) => setAliasesText(e.target.value)}
              placeholder="Alex, Aditya, akg"
              className="w-full bg-surface-secondary border border-border rounded px-2.5 py-1.5 text-primary focus:outline-none focus:border-accent"
            />
            <p className="text-[11px] text-muted mt-0.5">
              Comma-separated list of usernames or initials.
            </p>
          </div>

          <div>
            <label className="text-secondary font-medium block mb-1">
              Imminent Deadline Threshold (Hours)
            </label>
            <input
              type="number"
              min={1}
              max={168}
              value={imminentHours}
              onChange={(e) => setImminentHours(Number(e.target.value))}
              className="w-full bg-surface-secondary border border-border rounded px-2.5 py-1.5 text-primary focus:outline-none focus:border-accent"
            />
            <p className="text-[11px] text-muted mt-0.5">
              Deadlines within this window will be marked Urgent (default: 36 hrs).
            </p>
          </div>

          <div>
            <label className="text-secondary font-medium block mb-1">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-accent-soft border-accent text-accent font-semibold'
                    : 'bg-surface-secondary border-border text-secondary hover:text-primary'
                }`}
              >
                Light (Stone)
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-accent-soft border-accent text-accent font-semibold'
                    : 'bg-surface-secondary border-border text-secondary hover:text-primary'
                }`}
              >
                Dark (Graphite)
              </button>
            </div>
          </div>

          <div>
            <label className="text-secondary font-medium block mb-1">
              Local Model Endpoint (Optional)
            </label>
            <input
              type="text"
              value={localModelEndpoint}
              onChange={(e) => setLocalModelEndpoint(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full bg-surface-secondary border border-border rounded px-2.5 py-1.5 text-primary font-mono focus:outline-none focus:border-accent"
            />
            <p className="text-[11px] text-muted mt-0.5 flex items-center space-x-1">
              <Shield className="w-3 h-3 text-semantic-success" />
              <span>Local network only. Cloud endpoints are blocked by CSP.</span>
            </p>
          </div>

          <div className="pt-2.5 border-t border-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-muted hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-md shadow-subtle transition-colors flex items-center space-x-1"
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
