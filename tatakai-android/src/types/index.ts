// Navigation Types
export type RootStackParamList = {
  Main: undefined;
  Anime: { animeId: string };
  Watch: { episodeId: string; seekTime?: number };
  Search: { query?: string };
  Genre: { genre: string };
  Auth: undefined;
  Profile: { username?: string };
  Settings: undefined;
  Downloads: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Trending: undefined;
  Favorites: undefined;
  Profile: undefined;
};

// Anime Types
export interface Anime {
  id: string;
  name: string;
  poster: string;
  description?: string;
  jname?: string;
  rank?: number;
  type?: string;
  episodes?: {
    sub: number;
    dub: number;
  };
}

export interface AnimeDetails extends Anime {
  stats: {
    rating: string;
    quality: string;
    episodes: {
      sub: number;
      dub: number;
    };
    type: string;
    duration: string;
  };
  moreInfo: {
    japanese: string;
    synonyms: string[];
    aired: string;
    premiered: string;
    status: string;
    studios: string[];
    genres: string[];
    producers: string[];
  };
}

export interface Episode {
  number: number;
  title: string;
  episodeId: string;
  isFiller: boolean;
}

export interface EpisodeServer {
  serverName: string;
  serverId: string;
}

export interface VideoSource {
  url: string;
  isM3U8: boolean;
  quality: string;
  isDub?: boolean;
  language?: string;
  langCode?: string;
  isEmbed?: boolean;
}

export interface Subtitle {
  lang: string;
  url: string;
  label?: string;
}

// Download Types
export interface DownloadItem {
  id: string;
  animeId: string;
  animeName: string;
  animePoster: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle?: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  progress: number;
  totalSize: number;
  downloadedSize: number;
  filePath?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface DownloadedSeries {
  animeId: string;
  animeName: string;
  animePoster: string;
  episodes: DownloadItem[];
  totalEpisodes: number;
  downloadedEpisodes: number;
}

// User Types
export interface UserProfile {
  id: string;
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  banReason: string | null;
}

// Watch History Types
export interface WatchHistoryItem {
  id: string;
  animeId: string;
  animeName: string;
  animePoster: string;
  episodeId: string;
  episodeNumber: number;
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: string;
}

// Watchlist Types
export interface WatchlistItem {
  id: string;
  animeId: string;
  animeName: string;
  animePoster: string;
  status: 'watching' | 'completed' | 'plan_to_watch' | 'dropped';
  createdAt: string;
}
