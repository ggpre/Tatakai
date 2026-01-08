import 'react-native-url-polyfill/dist/polyfill';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

// Custom storage adapter for React Native using SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_admin: boolean;
          is_banned: boolean;
          ban_reason: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          anime_id: string;
          anime_name: string;
          anime_poster: string;
          episode_id: string;
          episode_number: number;
          progress_seconds: number;
          duration_seconds: number;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          anime_id: string;
          anime_name: string;
          anime_poster: string;
          status: string;
          created_at: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          anime_id: string;
          content: string;
          created_at: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          user_id: string;
          anime_id: string;
          rating: number;
          created_at: string;
        };
      };
    };
  };
};
