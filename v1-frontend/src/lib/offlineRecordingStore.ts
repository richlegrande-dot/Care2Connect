/**
 * Offline Recording Store - IndexedDB-based local storage for recordings
 * Stores audio blobs when backend is unreachable, syncs when online
 */

const DB_NAME = 'CareConnectOffline';
const DB_VERSION = 1;
const RECORDINGS_STORE = 'offlineRecordings';

export interface OfflineRecording {
  offlineRecordingId: string;
  audioBlob: Blob;
  duration: number;
  createdAt: string;
  status: 'pending' | 'uploading' | 'synced' | 'failed';
  lastError?: string;
  recordingIdFromServer?: string;
  // Optional profile data if collected before offline save
  profileDraft?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

/**
 * Initialize IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create recordings store if it doesn't exist
      if (!db.objectStoreNames.contains(RECORDINGS_STORE)) {
        const store = db.createObjectStore(RECORDINGS_STORE, { keyPath: 'offlineRecordingId' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Save a pending recording to IndexedDB
 */
export async function savePendingRecording(
  audioBlob: Blob,
  duration: number,
  profileDraft?: { name?: string; email?: string; phone?: string }
): Promise<string> {
  const db = await openDatabase();
  
  const recording: OfflineRecording = {
    offlineRecordingId: generateUUID(),
    audioBlob,
    duration,
    createdAt: new Date().toISOString(),
    status: 'pending',
    profileDraft,
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDINGS_STORE], 'readwrite');
    const store = transaction.objectStore(RECORDINGS_STORE);
    const request = store.add(recording);
    
    request.onsuccess = () => {
      console.log('[OfflineStore] Saved pending recording:', recording.offlineRecordingId);
      resolve(recording.offlineRecordingId);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to save recording to IndexedDB'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Mark recording as uploading
 */
export async function markAsUploading(offlineRecordingId: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDINGS_STORE], 'readwrite');
    const store = transaction.objectStore(RECORDINGS_STORE);
    const getRequest = store.get(offlineRecordingId);
    
    getRequest.onsuccess = () => {
      const recording = getRequest.result as OfflineRecording;
      if (recording) {
        recording.status = 'uploading';
        store.put(recording);
      }
    };
    
    transaction.oncomplete = () => {
      console.log('[OfflineStore] Marked as uploading:', offlineRecordingId);
      db.close();
      resolve();
    };
    
    transaction.onerror = () => {
      reject(new Error('Failed to update recording status'));
    };
  });
}

/**
 * Mark recording as synced with server recordingId
 */
export async function markAsSynced(offlineRecordingId: string, recordingIdFromServer: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDINGS_STORE], 'readwrite');
    const store = transaction.objectStore(RECORDINGS_STORE);
    const getRequest = store.get(offlineRecordingId);
    
    getRequest.onsuccess = () => {
      const recording = getRequest.result as OfflineRecording;
      if (recording) {
        recording.status = 'synced';
        recording.recordingIdFromServer = recordingIdFromServer;
        recording.lastError = undefined;
        store.put(recording);
      }
    };
    
    transaction.oncomplete = () => {
      console.log('[OfflineStore] Marked as synced:', offlineRecordingId, '→', recordingIdFromServer);
      db.close();
      resolve();
    };
    
    transaction.onerror = () => {
      reject(new Error('Failed to mark as synced'));
    };
  });
}

/**
 * Mark recording as failed with reason
 */
export async function markAsFailed(offlineRecordingId: string, reason: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDINGS_STORE], 'readwrite');
    const store = transaction.objectStore(RECORDINGS_STORE);
    const getRequest = store.get(offlineRecordingId);
    
    getRequest.onsuccess = () => {
      const recording = getRequest.result as OfflineRecording;
      if (recording) {
        recording.status = 'failed';
        recording.lastError = reason.substring(0, 200); // Truncate to 200 chars
        store.put(recording);
      }
    };
    
    transaction.oncomplete = () => {
      console.log('[OfflineStore] Marked as failed:', offlineRecordingId, reason);
      db.close();
      resolve();
    };
    
    transaction.onerror = () => {
      reject(new Error('Failed to mark as failed'));
    };
  });
}

/**
 * List all pending recordings (pending or failed)
 */
export async function listPending(): Promise<OfflineRecording[]> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDINGS_STORE], 'readonly');
    const store = transaction.objectStore(RECORDINGS_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => {
      const allRecordings = request.result as OfflineRecording[];
      // Filter for pending and failed only (exclude synced, uploading)
      const pending = allRecordings.filter(
        r => r.status === 'pending' || r.status === 'failed'
      );
      resolve(pending);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to list pending recordings'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get a specific recording by ID
 */
export async function getRecording(offlineRecordingId: string): Promise<OfflineRecording | null> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDINGS_STORE], 'readonly');
    const store = transaction.objectStore(RECORDINGS_STORE);
    const request = store.get(offlineRecordingId);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to get recording'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Delete a recording (used after successful sync)
 */
export async function deleteRecording(offlineRecordingId: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDINGS_STORE], 'readwrite');
    const store = transaction.objectStore(RECORDINGS_STORE);
    const request = store.delete(offlineRecordingId);
    
    request.onsuccess = () => {
      console.log('[OfflineStore] Deleted recording:', offlineRecordingId);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to delete recording'));
    };
    
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
  });
}

/**
 * Count pending recordings
 */
export async function countPending(): Promise<number> {
  const pending = await listPending();
  return pending.length;
}

/**
 * Clear all synced recordings older than 7 days (cleanup)
 */
export async function clearOldSyncedRecordings(): Promise<void> {
  const db = await openDatabase();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDINGS_STORE], 'readwrite');
    const store = transaction.objectStore(RECORDINGS_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => {
      const allRecordings = request.result as OfflineRecording[];
      const toDelete = allRecordings.filter(
        r => r.status === 'synced' && new Date(r.createdAt) < sevenDaysAgo
      );
      
      toDelete.forEach(recording => {
        store.delete(recording.offlineRecordingId);
      });
      
      if (toDelete.length > 0) {
        console.log('[OfflineStore] Cleaned up', toDelete.length, 'old synced recordings');
      }
    };
    
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    
    transaction.onerror = () => {
      reject(new Error('Failed to clear old recordings'));
    };
  });
}
