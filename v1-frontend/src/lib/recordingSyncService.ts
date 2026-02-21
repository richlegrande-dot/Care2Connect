/**
 * Recording Sync Service
 * Handles automatic background sync of offline recordings when connectivity returns
 */

import {
  listPending,
  markAsUploading,
  markAsSynced,
  markAsFailed,
  deleteRecording,
  clearOldSyncedRecordings,
  type OfflineRecording,
} from './offlineRecordingStore';

const SYNC_INTERVAL_MS = 60000; // 60 seconds
const BACKEND_URL = 'http://localhost:3001';

export type SyncStatus = 'idle' | 'syncing' | 'error';
export type ConnectivityStatus = 'online' | 'offline';

export interface SyncServiceCallbacks {
  onSyncStart?: () => void;
  onSyncComplete?: (successCount: number, failCount: number) => void;
  onSyncError?: (error: Error) => void;
  onConnectivityChange?: (status: ConnectivityStatus) => void;
  onRecordingSynced?: (offlineRecordingId: string, recordingId: string) => void;
}

class RecordingSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private callbacks: SyncServiceCallbacks = {};
  private isRunning = false;
  private isSyncing = false;
  private connectivityStatus: ConnectivityStatus = 'online';

  constructor() {
    // Listen for browser online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      
      // Set initial connectivity status
      this.connectivityStatus = navigator.onLine ? 'online' : 'offline';
    }
  }

  /**
   * Start the sync service
   */
  start(callbacks: SyncServiceCallbacks = {}) {
    if (this.isRunning) {
      console.log('[SyncService] Already running');
      return;
    }

    this.callbacks = callbacks;
    this.isRunning = true;

    console.log('[SyncService] Started');

    // Run initial sync
    this.syncPendingRecordings();

    // Run cleanup once on start
    this.cleanupOldRecordings();

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      if (this.connectivityStatus === 'online') {
        this.syncPendingRecordings();
      }
    }, SYNC_INTERVAL_MS);
  }

  /**
   * Stop the sync service
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.isRunning = false;
    console.log('[SyncService] Stopped');
  }

  /**
   * Get current connectivity status
   */
  getConnectivityStatus(): ConnectivityStatus {
    return this.connectivityStatus;
  }

  /**
   * Check if currently syncing
   */
  getIsSyncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Handle online event
   */
  private handleOnline = () => {
    console.log('[SyncService] Connection restored');
    this.connectivityStatus = 'online';
    
    if (this.callbacks.onConnectivityChange) {
      this.callbacks.onConnectivityChange('online');
    }

    // Immediately attempt sync when coming back online
    this.syncPendingRecordings();
  };

  /**
   * Handle offline event
   */
  private handleOffline = () => {
    console.log('[SyncService] Connection lost');
    this.connectivityStatus = 'offline';
    
    if (this.callbacks.onConnectivityChange) {
      this.callbacks.onConnectivityChange('offline');
    }
  };

  /**
   * Sync all pending recordings
   */
  private async syncPendingRecordings() {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress, skipping');
      return;
    }

    if (this.connectivityStatus === 'offline') {
      console.log('[SyncService] Offline, skipping sync');
      return;
    }

    try {
      this.isSyncing = true;

      if (this.callbacks.onSyncStart) {
        this.callbacks.onSyncStart();
      }

      const pending = await listPending();

      if (pending.length === 0) {
        console.log('[SyncService] No pending recordings');
        this.isSyncing = false;
        return;
      }

      console.log('[SyncService] Found', pending.length, 'pending recording(s)');

      let successCount = 0;
      let failCount = 0;

      for (const recording of pending) {
        try {
          await this.uploadRecording(recording);
          successCount++;
        } catch (error) {
          failCount++;
          console.error('[SyncService] Failed to upload recording:', error);
        }
      }

      console.log('[SyncService] Sync complete:', successCount, 'success,', failCount, 'failed');

      if (this.callbacks.onSyncComplete) {
        this.callbacks.onSyncComplete(successCount, failCount);
      }
    } catch (error) {
      console.error('[SyncService] Sync error:', error);
      
      if (this.callbacks.onSyncError) {
        this.callbacks.onSyncError(error as Error);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Upload a single recording
   */
  private async uploadRecording(recording: OfflineRecording): Promise<void> {
    const { offlineRecordingId, audioBlob, duration } = recording;

    console.log('[SyncService] Uploading recording:', offlineRecordingId);

    // Mark as uploading
    await markAsUploading(offlineRecordingId);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('duration', duration.toString());

    try {
      const response = await fetch(`${BACKEND_URL}/api/recordings`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      const recordingId = result.recordingId;

      // Mark as synced
      await markAsSynced(offlineRecordingId, recordingId);

      console.log('[SyncService] Successfully uploaded:', offlineRecordingId, '→', recordingId);

      if (this.callbacks.onRecordingSynced) {
        this.callbacks.onRecordingSynced(offlineRecordingId, recordingId);
      }

      // Delete from local store after 24 hours (keep for a while in case of issues)
      setTimeout(() => {
        deleteRecording(offlineRecordingId).catch(err => {
          console.error('[SyncService] Failed to delete synced recording:', err);
        });
      }, 24 * 60 * 60 * 1000); // 24 hours

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if network error
      const isNetworkError = errorMessage.includes('fetch') || 
                             errorMessage.includes('network') ||
                             errorMessage.includes('Failed to fetch');

      if (isNetworkError) {
        // Mark as failed but will retry
        await markAsFailed(offlineRecordingId, 'Network error - will retry');
        console.log('[SyncService] Network error, will retry later:', offlineRecordingId);
      } else {
        // Mark as failed with reason
        await markAsFailed(offlineRecordingId, errorMessage);
        console.error('[SyncService] Upload failed:', offlineRecordingId, errorMessage);
      }

      throw error;
    }
  }

  /**
   * Manually trigger sync (for testing or user-initiated sync)
   */
  async triggerSync(): Promise<void> {
    console.log('[SyncService] Manual sync triggered');
    await this.syncPendingRecordings();
  }

  /**
   * Clean up old synced recordings (run periodically)
   */
  private async cleanupOldRecordings() {
    try {
      await clearOldSyncedRecordings();
    } catch (error) {
      console.error('[SyncService] Cleanup error:', error);
    }
  }

  /**
   * Cleanup on unmount
   */
  destroy() {
    this.stop();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }
}

// Singleton instance
let syncServiceInstance: RecordingSyncService | null = null;

/**
 * Get or create sync service instance
 */
export function getSyncService(): RecordingSyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new RecordingSyncService();
  }
  return syncServiceInstance;
}

/**
 * Initialize sync service (call once on app mount)
 */
export function initializeSyncService(callbacks?: SyncServiceCallbacks) {
  const service = getSyncService();
  service.start(callbacks);
  return service;
}
