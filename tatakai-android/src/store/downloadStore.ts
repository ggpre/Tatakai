import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import { DownloadItem, DownloadedSeries } from '../types';

interface DownloadState {
  downloads: DownloadItem[];
  activeDownloads: string[];
  maxConcurrent: number;
  
  // Actions
  addDownload: (item: Omit<DownloadItem, 'id' | 'status' | 'progress' | 'downloadedSize' | 'createdAt'>) => string;
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void;
  removeDownload: (id: string) => void;
  pauseDownload: (id: string) => void;
  resumeDownload: (id: string) => void;
  getDownloadsByAnime: (animeId: string) => DownloadItem[];
  getDownloadedSeries: () => DownloadedSeries[];
  getDownload: (id: string) => DownloadItem | undefined;
  getDownloadByEpisode: (episodeId: string) => DownloadItem | undefined;
  clearCompletedDownloads: () => void;
  deleteAllDownloads: () => Promise<void>;
}

// Use UUID for robust unique ID generation
const generateId = (): string => uuid.v4() as string;

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set, get) => ({
      downloads: [],
      activeDownloads: [],
      maxConcurrent: 3,

      addDownload: (item) => {
        const id = generateId();
        const newDownload: DownloadItem = {
          ...item,
          id,
          status: 'pending',
          progress: 0,
          downloadedSize: 0,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          downloads: [...state.downloads, newDownload],
        }));

        return id;
      },

      updateDownload: (id, updates) => {
        set((state) => ({
          downloads: state.downloads.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        }));
      },

      removeDownload: async (id) => {
        const download = get().downloads.find((d) => d.id === id);
        if (download?.filePath) {
          try {
            await FileSystem.deleteAsync(download.filePath, { idempotent: true });
          } catch (error) {
            console.error('Error deleting file:', error);
          }
        }

        set((state) => ({
          downloads: state.downloads.filter((d) => d.id !== id),
          activeDownloads: state.activeDownloads.filter((activeId) => activeId !== id),
        }));
      },

      pauseDownload: (id) => {
        set((state) => ({
          downloads: state.downloads.map((d) =>
            d.id === id && d.status === 'downloading'
              ? { ...d, status: 'paused' as const }
              : d
          ),
          activeDownloads: state.activeDownloads.filter((activeId) => activeId !== id),
        }));
      },

      resumeDownload: (id) => {
        set((state) => ({
          downloads: state.downloads.map((d) =>
            d.id === id && d.status === 'paused'
              ? { ...d, status: 'pending' as const }
              : d
          ),
        }));
      },

      getDownloadsByAnime: (animeId) => {
        return get().downloads.filter((d) => d.animeId === animeId);
      },

      getDownloadedSeries: () => {
        const downloads = get().downloads;
        const seriesMap = new Map<string, DownloadedSeries>();

        downloads.forEach((download) => {
          if (!seriesMap.has(download.animeId)) {
            seriesMap.set(download.animeId, {
              animeId: download.animeId,
              animeName: download.animeName,
              animePoster: download.animePoster,
              episodes: [],
              totalEpisodes: 0,
              downloadedEpisodes: 0,
            });
          }

          const series = seriesMap.get(download.animeId)!;
          series.episodes.push(download);
          series.totalEpisodes++;
          if (download.status === 'completed') {
            series.downloadedEpisodes++;
          }
        });

        return Array.from(seriesMap.values());
      },

      getDownload: (id) => {
        return get().downloads.find((d) => d.id === id);
      },

      getDownloadByEpisode: (episodeId) => {
        return get().downloads.find((d) => d.episodeId === episodeId);
      },

      clearCompletedDownloads: () => {
        set((state) => ({
          downloads: state.downloads.filter((d) => d.status !== 'completed'),
        }));
      },

      deleteAllDownloads: async () => {
        const downloads = get().downloads;
        for (const download of downloads) {
          if (download.filePath) {
            try {
              await FileSystem.deleteAsync(download.filePath, { idempotent: true });
            } catch (error) {
              console.error('Error deleting file:', error);
            }
          }
        }
        set({ downloads: [], activeDownloads: [] });
      },
    }),
    {
      name: 'tatakai-downloads',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
