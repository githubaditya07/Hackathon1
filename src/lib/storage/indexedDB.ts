import { Conversation, AnalysisResult, UserPreferences, UserActionStatus } from '../../types';

const DB_NAME = 'unread_catchup_db';
const DB_VERSION = 1;

const STORES = {
  CONVERSATIONS: 'conversations',
  ANALYSES: 'analyses',
  PREFERENCES: 'preferences',
  ACTIONS: 'item_actions',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  userName: 'Alex',
  aliases: ['Alex', 'Aditya', 'akg'],
  imminentHoursThreshold: 36,
  localModelEnabled: false,
  localModelEndpoint: 'http://localhost:11434',
  theme: 'dark',
};

// In-memory fallback if IndexedDB is blocked in private browsing
const memoryStore = {
  conversations: new Map<string, Conversation>(),
  analyses: new Map<string, AnalysisResult>(),
  preferences: { ...DEFAULT_PREFERENCES },
  itemActions: new Map<string, UserActionStatus>(),
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.CONVERSATIONS)) {
        db.createObjectStore(STORES.CONVERSATIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.ANALYSES)) {
        db.createObjectStore(STORES.ANALYSES, { keyPath: 'conversationId' });
      }
      if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
        db.createObjectStore(STORES.PREFERENCES, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.ACTIONS)) {
        db.createObjectStore(STORES.ACTIONS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Conversation Storage
export async function saveConversation(conversation: Conversation): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CONVERSATIONS, 'readwrite');
      tx.objectStore(STORES.CONVERSATIONS).put(conversation);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Fallback to memory store for saveConversation', err);
    memoryStore.conversations.set(conversation.id, conversation);
  }
}

export async function getConversation(id: string): Promise<Conversation | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CONVERSATIONS, 'readonly');
      const req = tx.objectStore(STORES.CONVERSATIONS).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return memoryStore.conversations.get(id) || null;
  }
}

export async function listConversations(): Promise<Conversation[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CONVERSATIONS, 'readonly');
      const req = tx.objectStore(STORES.CONVERSATIONS).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return Array.from(memoryStore.conversations.values());
  }
}

export async function deleteConversation(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORES.CONVERSATIONS, STORES.ANALYSES], 'readwrite');
      tx.objectStore(STORES.CONVERSATIONS).delete(id);
      tx.objectStore(STORES.ANALYSES).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    memoryStore.conversations.delete(id);
    memoryStore.analyses.delete(id);
  }
}

// Analysis Storage
export async function saveAnalysis(analysis: AnalysisResult): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ANALYSES, 'readwrite');
      tx.objectStore(STORES.ANALYSES).put(analysis);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    memoryStore.analyses.set(analysis.conversationId, analysis);
  }
}

export async function getAnalysis(conversationId: string): Promise<AnalysisResult | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ANALYSES, 'readonly');
      const req = tx.objectStore(STORES.ANALYSES).get(conversationId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return memoryStore.analyses.get(conversationId) || null;
  }
}

// User Preferences Storage
export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PREFERENCES, 'readwrite');
      tx.objectStore(STORES.PREFERENCES).put({ key: 'user_profile', ...prefs });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    memoryStore.preferences = { ...prefs };
  }
}

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PREFERENCES, 'readonly');
      const req = tx.objectStore(STORES.PREFERENCES).get('user_profile');
      req.onsuccess = () => {
        if (req.result) {
          const { key: _, ...rest } = req.result;
          resolve(rest as UserPreferences);
        } else {
          resolve(DEFAULT_PREFERENCES);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return memoryStore.preferences;
  }
}

// Item Action States (completion / dismissal)
export async function setItemAction(id: string, status: UserActionStatus): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ACTIONS, 'readwrite');
      tx.objectStore(STORES.ACTIONS).put({ id, status, updatedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    memoryStore.itemActions.set(id, status);
  }
}

export async function getItemActions(): Promise<Record<string, UserActionStatus>> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ACTIONS, 'readonly');
      const req = tx.objectStore(STORES.ACTIONS).getAll();
      req.onsuccess = () => {
        const records: Record<string, UserActionStatus> = {};
        for (const item of req.result || []) {
          records[item.id] = item.status;
        }
        resolve(records);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    const map: Record<string, UserActionStatus> = {};
    memoryStore.itemActions.forEach((v, k) => { map[k] = v; });
    return map;
  }
}

// Storage Telemetry (Local only)
export async function getStorageUsage(): Promise<{
  conversationCount: number;
  messageCount: number;
  estimatedBytes: number;
}> {
  const convs = await listConversations();
  let msgCount = 0;
  let estimatedBytes = 0;

  for (const c of convs) {
    msgCount += c.messageCount || c.messages.length;
    estimatedBytes += JSON.stringify(c).length;
  }

  return {
    conversationCount: convs.length,
    messageCount: msgCount,
    estimatedBytes,
  };
}

export async function clearAllData(): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORES.CONVERSATIONS, STORES.ANALYSES, STORES.ACTIONS], 'readwrite');
      tx.objectStore(STORES.CONVERSATIONS).clear();
      tx.objectStore(STORES.ANALYSES).clear();
      tx.objectStore(STORES.ACTIONS).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    memoryStore.conversations.clear();
    memoryStore.analyses.clear();
    memoryStore.itemActions.clear();
  }
}
