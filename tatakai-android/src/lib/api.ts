import { API_BASE_URL, ANISKIP_API_URL, JIKAN_API_URL } from './constants';

// Anime API Types
export interface AnimeInfo {
  id: string;
  name: string;
  poster: string;
  description: string;
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
  jname: string;
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

export interface SpotlightAnime {
  id: string;
  name: string;
  jname: string;
  poster: string;
  description: string;
  rank: number;
  otherInfo: string[];
  episodes: {
    sub: number;
    dub: number;
  };
}

export interface TrendingAnime {
  id: string;
  name: string;
  poster: string;
  rank: number;
}

export interface LatestEpisode {
  id: string;
  name: string;
  poster: string;
  type: string;
  episodes: {
    sub: number;
    dub: number;
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

export interface EpisodeSource {
  url: string;
  isM3U8: boolean;
  quality: string;
  isDub?: boolean;
  language?: string;
  langCode?: string;
  isEmbed?: boolean;
  needsHeadless?: boolean;
}

export interface Subtitle {
  lang: string;
  url: string;
  label?: string;
}

export interface HomeData {
  spotlightAnimes: SpotlightAnime[];
  trendingAnimes: TrendingAnime[];
  latestEpisodeAnimes: LatestEpisode[];
  top10Animes: {
    today: TrendingAnime[];
    week: TrendingAnime[];
    month: TrendingAnime[];
  };
  mostPopularAnimes: TrendingAnime[];
  mostFavoriteAnimes: TrendingAnime[];
  genres: string[];
}

// API Functions
export async function fetchHomeData(): Promise<HomeData> {
  const response = await fetch(`${API_BASE_URL}/anime/hianime/home`);
  if (!response.ok) throw new Error('Failed to fetch home data');
  const data = await response.json();
  return data.data;
}

export async function fetchAnimeInfo(animeId: string): Promise<{ anime: { info: AnimeInfo; moreInfo: AnimeInfo['moreInfo'] } }> {
  const response = await fetch(`${API_BASE_URL}/anime/hianime/anime/${animeId}`);
  if (!response.ok) throw new Error('Failed to fetch anime info');
  const data = await response.json();
  return data.data;
}

export async function fetchEpisodes(animeId: string): Promise<{ episodes: Episode[]; totalEpisodes: number }> {
  const response = await fetch(`${API_BASE_URL}/anime/hianime/anime/${animeId}/episodes`);
  if (!response.ok) throw new Error('Failed to fetch episodes');
  const data = await response.json();
  return data.data;
}

export async function fetchEpisodeServers(episodeId: string): Promise<{ sub: EpisodeServer[]; dub: EpisodeServer[]; episodeNo: number }> {
  const response = await fetch(`${API_BASE_URL}/anime/hianime/episode/servers?animeEpisodeId=${encodeURIComponent(episodeId)}`);
  if (!response.ok) throw new Error('Failed to fetch servers');
  const data = await response.json();
  return data.data;
}

export async function fetchEpisodeSources(
  episodeId: string,
  server: string,
  category: 'sub' | 'dub'
): Promise<{ sources: EpisodeSource[]; subtitles?: Subtitle[]; tracks?: Subtitle[]; headers?: Record<string, string> }> {
  const response = await fetch(
    `${API_BASE_URL}/anime/hianime/episode/sources?animeEpisodeId=${encodeURIComponent(episodeId)}&server=${server}&category=${category}`
  );
  if (!response.ok) throw new Error('Failed to fetch sources');
  const data = await response.json();
  return data.data;
}

export async function searchAnime(query: string, page: number = 1): Promise<{ animes: TrendingAnime[]; currentPage: number; hasNextPage: boolean; totalPages: number }> {
  const response = await fetch(`${API_BASE_URL}/anime/hianime/search?q=${encodeURIComponent(query)}&page=${page}`);
  if (!response.ok) throw new Error('Failed to search anime');
  const data = await response.json();
  return data.data;
}

export async function fetchGenreAnime(genre: string, page: number = 1): Promise<{ animes: TrendingAnime[]; currentPage: number; hasNextPage: boolean }> {
  const response = await fetch(`${API_BASE_URL}/anime/hianime/genre/${genre}?page=${page}`);
  if (!response.ok) throw new Error('Failed to fetch genre anime');
  const data = await response.json();
  return data.data;
}

export async function fetchTrendingAnime(): Promise<TrendingAnime[]> {
  const response = await fetch(`${API_BASE_URL}/anime/hianime/top-airing`);
  if (!response.ok) throw new Error('Failed to fetch trending');
  const data = await response.json();
  return data.data.animes;
}

// AniSkip API for skip timestamps
export async function fetchSkipTimes(malId: number, episodeNumber: number): Promise<{
  intro?: { startTime: number; endTime: number };
  outro?: { startTime: number; endTime: number };
}> {
  try {
    const response = await fetch(
      `${ANISKIP_API_URL}/v2/skip-times/${malId}/${episodeNumber}?types=op&types=ed`
    );
    if (!response.ok) return {};
    const data = await response.json();
    
    let intro, outro;
    if (data.results) {
      for (const result of data.results) {
        if (result.skipType === 'op') {
          intro = { startTime: result.interval.startTime, endTime: result.interval.endTime };
        } else if (result.skipType === 'ed') {
          outro = { startTime: result.interval.startTime, endTime: result.interval.endTime };
        }
      }
    }
    return { intro, outro };
  } catch {
    return {};
  }
}

// Jikan API for additional anime info
export async function fetchUpcomingAnime(): Promise<any[]> {
  try {
    const response = await fetch(`${JIKAN_API_URL}/seasons/upcoming?limit=10`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

// Server name mapping
export function getFriendlyServerName(serverName: string): string {
  const names: Record<string, string> = {
    'hd-1': 'HD Server 1',
    'hd-2': 'HD Pro',
    'megacloud': 'MegaCloud',
    'streamsb': 'StreamSB',
    'vidcloud': 'VidCloud',
    'vidstreaming': 'VidStreaming',
    'streamtape': 'StreamTape',
  };
  return names[serverName] || serverName;
}
