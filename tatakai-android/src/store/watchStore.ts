import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { WatchHistoryItem, WatchlistItem } from '../types';

interface WatchState {
  // Local watch history (for offline/guest mode)
  localHistory: WatchHistoryItem[];
  // Local watchlist
  localWatchlist: WatchlistItem[];
  // Settings
  autoPlay: boolean;
  defaultQuality: string;
  defaultSubtitles: boolean;
  skipIntro: boolean;
  skipOutro: boolean;
  
  // Watch history actions
  addToHistory: (item: Omit<WatchHistoryItem, 'id'>) => void;
  updateProgress: (episodeId: string, progressSeconds: number, durationSeconds: number) => void;
  markCompleted: (episodeId: string) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  getHistoryItem: (episodeId: string) => WatchHistoryItem | undefined;
  getContinueWatching: () => WatchHistoryItem[];
  
  // Watchlist actions
  addToWatchlist: (item: Omit<WatchlistItem, 'id' | 'createdAt'>) => void;
  removeFromWatchlist: (animeId: string) => void;
  isInWatchlist: (animeId: string) => boolean;
  updateWatchlistStatus: (animeId: string, status: WatchlistItem['status']) => void;
  
  // Settings actions
  setAutoPlay: (value: boolean) => void;
  setDefaultQuality: (value: string) => void;
  setDefaultSubtitles: (value: boolean) => void;
  setSkipIntro: (value: boolean) => void;
  setSkipOutro: (value: boolean) => void;
}

// Use UUID for robust unique ID generation
const generateId = (): string => uuid.v4() as string;

export const useWatchStore = create<WatchState>()(
  persist(
    (set, get) => ({
      localHistory: [],
      localWatchlist: [],
      autoPlay: true,
      defaultQuality: 'auto',
      defaultSubtitles: true,
      skipIntro: false,
      skipOutro: false,

      addToHistory: (item) => {
        const id = generateId();
        const newItem: WatchHistoryItem = {
          ...item,
          id,
        };

        set((state) => {
          // Remove existing entry for same episode
          const filtered = state.localHistory.filter(
            (h) => h.episodeId !== item.episodeId
          );
          return {
            localHistory: [newItem, ...filtered].slice(0, 100), // Keep last 100
          };
        });
      },

      updateProgress: (episodeId, progressSeconds, durationSeconds) => {
        set((state) => ({
          localHistory: state.localHistory.map((h) =>
            h.episodeId === episodeId
              ? {
                  ...h,
                  progressSeconds,
                  durationSeconds,
                  updatedAt: new Date().toISOString(),
                }
              : h
          ),
        }));
      },

      markCompleted: (episodeId) => {
        set((state) => ({
          localHistory: state.localHistory.map((h) =>
            h.episodeId === episodeId
              ? { ...h, completed: true, updatedAt: new Date().toISOString() }
              : h
          ),
        }));
      },

      removeFromHistory: (id) => {
        set((state) => ({
          localHistory: state.localHistory.filter((h) => h.id !== id),
        }));
      },

      clearHistory: () => {
        set({ localHistory: [] });
      },

      getHistoryItem: (episodeId) => {
        return get().localHistory.find((h) => h.episodeId === episodeId);
      },

      getContinueWatching: () => {
        return get()
          .localHistory.filter((h) => !h.completed && h.progressSeconds > 0)
          .slice(0, 10);
      },

      addToWatchlist: (item) => {
        const existing = get().localWatchlist.find(
          (w) => w.animeId === item.animeId
        );
        if (existing) return;

        const newItem: WatchlistItem = {
          ...item,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          localWatchlist: [newItem, ...state.localWatchlist],
        }));
      },

      removeFromWatchlist: (animeId) => {
        set((state) => ({
          localWatchlist: state.localWatchlist.filter(
            (w) => w.animeId !== animeId
          ),
        }));
      },

      isInWatchlist: (animeId) => {
        return get().localWatchlist.some((w) => w.animeId === animeId);
      },

      updateWatchlistStatus: (animeId, status) => {
        set((state) => ({
          localWatchlist: state.localWatchlist.map((w) =>
            w.animeId === animeId ? { ...w, status } : w
          ),
        }));
      },

      setAutoPlay: (value) => set({ autoPlay: value }),
      setDefaultQuality: (value) => set({ defaultQuality: value }),
      setDefaultSubtitles: (value) => set({ defaultSubtitles: value }),
      setSkipIntro: (value) => set({ skipIntro: value }),
      setSkipOutro: (value) => set({ skipOutro: value }),
    }),
    {
      name: 'tatakai-watch-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
