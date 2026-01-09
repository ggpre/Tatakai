import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useDownloadStore } from '../store/downloadStore';
import { fetchEpisodeSources, fetchEpisodeServers } from '../lib/api';

// Get the document directory - cast to any to handle type issues between platforms
const getDocumentDirectory = (): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (FileSystem as any).documentDirectory || '';
};

// Directory for downloaded videos
const DOWNLOAD_DIR = getDocumentDirectory() + 'downloads/';

// Ensure download directory exists
async function ensureDownloadDir() {
  const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
}

// Generate a safe filename from episode info
function getFileName(animeId: string, episodeNumber: number): string {
  const safeName = animeId.replace(/[^a-zA-Z0-9-]/g, '_');
  return `${safeName}_ep${episodeNumber}.mp4`;
}

// Type for download resumable
type DownloadResumableType = ReturnType<typeof FileSystem.createDownloadResumable>;

// Download manager class
class DownloadManager {
  private activeDownloads: Map<string, DownloadResumableType> = new Map();
  private maxConcurrent = 3;

  async startDownload(downloadId: string): Promise<void> {
    const store = useDownloadStore.getState();
    const download = store.getDownload(downloadId);
    
    if (!download) {
      console.error('Download not found:', downloadId);
      return;
    }

    if (this.activeDownloads.size >= this.maxConcurrent) {
      console.log('Max concurrent downloads reached, queued:', downloadId);
      return;
    }

    try {
      await ensureDownloadDir();

      // Update status to downloading
      store.updateDownload(downloadId, { status: 'downloading' });

      // Get video source
      const servers = await fetchEpisodeServers(download.episodeId);
      const availableServers = servers.sub.filter((s) => s.serverName !== 'hd-1');
      
      if (availableServers.length === 0) {
        throw new Error('No servers available');
      }

      const server = availableServers.find((s) => s.serverName === 'hd-2') || availableServers[0];
      const sources = await fetchEpisodeSources(download.episodeId, server.serverName, 'sub');
      
      const source = sources.sources.find((s) => s.quality === '1080p' || s.quality === '720p') || sources.sources[0];
      
      if (!source?.url) {
        throw new Error('No video source available');
      }

      const fileName = getFileName(download.animeId, download.episodeNumber);
      const filePath = DOWNLOAD_DIR + fileName;

      // Create download resumable
      const downloadResumable = FileSystem.createDownloadResumable(
        source.url,
        filePath,
        {},
        (progress) => {
          const progressPercent = (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100;
          store.updateDownload(downloadId, {
            progress: progressPercent,
            downloadedSize: progress.totalBytesWritten,
            totalSize: progress.totalBytesExpectedToWrite,
          });
        }
      );

      this.activeDownloads.set(downloadId, downloadResumable);

      // Start download
      const result = await downloadResumable.downloadAsync();

      if (result?.uri) {
        store.updateDownload(downloadId, {
          status: 'completed',
          progress: 100,
          filePath: result.uri,
          completedAt: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.error('Download error:', error);
      store.updateDownload(downloadId, {
        status: 'failed',
        error: error.message || 'Download failed',
      });
    } finally {
      this.activeDownloads.delete(downloadId);
      this.processQueue();
    }
  }

  async pauseDownload(downloadId: string): Promise<void> {
    const downloadResumable = this.activeDownloads.get(downloadId);
    if (downloadResumable) {
      await downloadResumable.pauseAsync();
      this.activeDownloads.delete(downloadId);
      useDownloadStore.getState().pauseDownload(downloadId);
    }
  }

  async resumeDownload(downloadId: string): Promise<void> {
    // Re-start the download
    useDownloadStore.getState().resumeDownload(downloadId);
    this.startDownload(downloadId);
  }

  cancelDownload(downloadId: string): void {
    const downloadResumable = this.activeDownloads.get(downloadId);
    if (downloadResumable) {
      // Cancel by deleting the partial file
      this.activeDownloads.delete(downloadId);
    }
    useDownloadStore.getState().removeDownload(downloadId);
  }

  private processQueue(): void {
    const store = useDownloadStore.getState();
    const pending = store.downloads.filter((d) => d.status === 'pending');
    
    for (const download of pending) {
      if (this.activeDownloads.size >= this.maxConcurrent) break;
      this.startDownload(download.id);
    }
  }

  // Get local file path for offline playback
  async getOfflineUri(downloadId: string): Promise<string | null> {
    const download = useDownloadStore.getState().getDownload(downloadId);
    if (!download?.filePath) return null;

    const fileInfo = await FileSystem.getInfoAsync(download.filePath);
    if (fileInfo.exists) {
      return download.filePath;
    }
    return null;
  }

  // Request media library permissions for saving to gallery
  async requestPermissions(): Promise<boolean> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  }

  // Save downloaded video to gallery (optional)
  async saveToGallery(downloadId: string): Promise<boolean> {
    const download = useDownloadStore.getState().getDownload(downloadId);
    if (!download?.filePath) return false;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      await MediaLibrary.createAssetAsync(download.filePath);
      return true;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      return false;
    }
  }

  // Get download statistics
  getStats() {
    const downloads = useDownloadStore.getState().downloads;
    return {
      total: downloads.length,
      completed: downloads.filter((d) => d.status === 'completed').length,
      downloading: downloads.filter((d) => d.status === 'downloading').length,
      pending: downloads.filter((d) => d.status === 'pending').length,
      failed: downloads.filter((d) => d.status === 'failed').length,
      paused: downloads.filter((d) => d.status === 'paused').length,
    };
  }

  // Clear completed downloads from queue (files remain)
  clearCompleted(): void {
    useDownloadStore.getState().clearCompletedDownloads();
  }

  // Delete all downloads and files
  async deleteAll(): Promise<void> {
    // Cancel active downloads
    for (const [id] of this.activeDownloads) {
      this.activeDownloads.delete(id);
    }

    // Delete all files and clear store
    await useDownloadStore.getState().deleteAllDownloads();

    // Also clean up download directory
    try {
      const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(DOWNLOAD_DIR, { idempotent: true });
        await ensureDownloadDir();
      }
    } catch (error) {
      console.error('Error cleaning download directory:', error);
    }
  }
}

// Singleton instance
export const downloadManager = new DownloadManager();

// Hook for components
export function useDownloadManager() {
  return downloadManager;
}
