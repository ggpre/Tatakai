'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { AnimeAPI, type EpisodeServersResponse, type EpisodeSourcesResponse, type AnimeEpisodesResponse, type Episode, type AnimeInfoResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import VideoPlayer from '@/components/VideoPlayer';

const WatchPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const animeId = params?.id as string;
  const episodeParam = searchParams?.get('ep');
  
  const [episodes, setEpisodes] = useState<AnimeEpisodesResponse | null>(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string>('');
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [servers, setServers] = useState<EpisodeServersResponse | null>(null);
  const [sources, setSources] = useState<EpisodeSourcesResponse | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'sub' | 'dub' | 'raw'>('sub');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animeInfo, setAnimeInfo] = useState<AnimeInfoResponse['data']['anime'] | null>(null);
  
  const [focusedEpisodeIndex, setFocusedEpisodeIndex] = useState(0);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [showSubtitlePanel, setShowSubtitlePanel] = useState(false);
  const [showEpisodesPanel, setShowEpisodesPanel] = useState(false);
  
  // Refs for navigation
  const episodeItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const fetchSources = useCallback(async (episodeId: string, server: string, category: 'sub' | 'dub' | 'raw') => {
    try {
      console.log(`Fetching sources for server: ${server}, category: ${category}`);
      const sourcesData = await AnimeAPI.getEpisodeSources(episodeId, server, category);
      
      if (sourcesData.success) {
        setSources(sourcesData);
        console.log('=== SOURCES DEBUG ===');
        console.log('Full sources response:', JSON.stringify(sourcesData, null, 2));
        console.log('Sources array:', sourcesData.data.sources);
        console.log('Tracks array:', sourcesData.data.tracks);
        console.log('Headers:', sourcesData.data.headers);
        console.log('=====================');
      } else {
        console.error('Sources API returned success: false');
        throw new Error('Failed to load video sources');
      }
    } catch (err) {
      console.error('Error fetching sources:', err);
      setError(`Unable to load video sources: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      console.log('=== WATCH PAGE DEBUG ===');
      console.log('animeId:', animeId);
      console.log('episodeParam from searchParams:', episodeParam);
      
      if (!animeId) {
        setError('No anime ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // First, get the episodes list for this anime
        console.log('Fetching episodes for anime:', animeId);
        const episodesData = await AnimeAPI.getAnimeEpisodes(animeId);
        
        // Also try to get anime info for additional details
        try {
          const animeData = await AnimeAPI.getAnimeInfo(animeId);
          if (animeData.success) {
            setAnimeInfo(animeData.data.anime);
          }
        } catch (err) {
          console.log('Could not fetch anime info:', err);
        }
        
        if (!episodesData.success || !episodesData.data.episodes.length) {
          setError('No episodes found for this anime');
          setLoading(false);
          return;
        }
        
        setEpisodes(episodesData);
        
        // Determine which episode to load
        let targetEpisode;
        if (episodeParam) {
          // If episodeParam is a simple number, find the episode by number
          if (/^\d+$/.test(episodeParam)) {
            const episodeNumber = parseInt(episodeParam);
            targetEpisode = episodesData.data.episodes.find(ep => ep.number === episodeNumber);
          } else {
            // If episodeParam is already a full episode ID, find it in episodes or create a placeholder
            const foundEpisode = episodesData.data.episodes.find(ep => ep.episodeId === episodeParam);
            if (foundEpisode) {
              targetEpisode = foundEpisode;
            } else {
              // Create a placeholder episode for unknown episode ID
              targetEpisode = {
                title: `Episode ${episodeParam}`,
                episodeId: episodeParam,
                number: 1,
                isFiller: false
              };
            }
          }
        } else {
          // Default to first episode
          targetEpisode = episodesData.data.episodes[0];
        }
        
        if (!targetEpisode) {
          setError(`Episode ${episodeParam} not found`);
          setLoading(false);
          return;
        }
        
        const episodeId = targetEpisode.episodeId;
        setCurrentEpisodeId(episodeId);
        setCurrentEpisode(targetEpisode);
        console.log('Using episode ID:', episodeId);
        
        // Find current episode index and focus it
        const episodeIndex = episodesData.data.episodes.findIndex(ep => ep.episodeId === episodeId);
        if (episodeIndex !== -1) {
          setFocusedEpisodeIndex(episodeIndex);
        }
        
        // Fetch available servers for this episode
        console.log('Calling getEpisodeServers with:', episodeId);
        const serversData = await AnimeAPI.getEpisodeServers(episodeId);
        
        console.log('Servers response:', serversData);
        
        if (serversData.success) {
          setServers(serversData);
          
          // Auto-select first available server
          const availableServers = serversData.data.sub.length > 0 ? serversData.data.sub : 
                                 serversData.data.dub.length > 0 ? serversData.data.dub : 
                                 serversData.data.raw;
          
          if (availableServers.length > 0) {
            // Try servers in priority order: hd-2, hd-3, hd-1
            const serverPriority = ['hd-2', 'hd-3', 'hd-1'];
            let defaultServer = availableServers[0]; // fallback
            
            for (const serverName of serverPriority) {
              const server = availableServers.find(s => s.serverName === serverName);
              if (server) {
                defaultServer = server;
                break;
              }
            }
            
            setSelectedServer(defaultServer.serverName);
            
            // Determine category based on available servers
            if (serversData.data.sub.length > 0) setSelectedCategory('sub');
            else if (serversData.data.dub.length > 0) setSelectedCategory('dub');
            else if (serversData.data.raw.length > 0) setSelectedCategory('raw');
            
            // Fetch sources for default server
            await fetchSources(episodeId, defaultServer.serverName, selectedCategory);
          } else {
            setError('No servers available for this episode');
          }
        } else {
          setError('Failed to load episode servers');
        }
      } catch (err) {
        console.error('Error fetching episode data:', err);
        setError(`Unable to load episode: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodeData();
  }, [animeId, episodeParam, fetchSources, selectedCategory]);

  // LG Magic Remote Color Button Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // LG Magic Remote Color Button mappings
      switch (e.key) {
        case 'F1': // Red button - Toggle subtitles panel
        case 'ColorF0RED':
          e.preventDefault();
          setShowSubtitlePanel(!showSubtitlePanel);
          setShowEpisodesPanel(false); // Close episodes panel
          break;
          
        case 'F2': // Green button - Toggle episodes panel  
        case 'ColorF1GREEN':
          e.preventDefault();
          setShowEpisodesPanel(!showEpisodesPanel);
          setShowSubtitlePanel(false); // Close subtitle panel
          break;
          
        case 'F3': // Yellow button - Previous episode
        case 'ColorF2YELLOW':
          e.preventDefault();
          goToPreviousEpisode();
          break;
          
        case 'F4': // Blue button - Next episode
        case 'ColorF3BLUE':
          e.preventDefault();
          goToNextEpisode();
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (showEpisodesPanel && focusedEpisodeIndex > 0) {
            setFocusedEpisodeIndex(focusedEpisodeIndex - 1);
          }
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          if (showEpisodesPanel && episodes && focusedEpisodeIndex < episodes.data.episodes.length - 1) {
            setFocusedEpisodeIndex(focusedEpisodeIndex + 1);
          }
          break;
          
        case 'Enter':
          e.preventDefault();
          if (showEpisodesPanel && episodes) {
            const episode = episodes.data.episodes[focusedEpisodeIndex];
            if (episode) {
              goToEpisode(episode.number);
              setShowEpisodesPanel(false);
            }
          } else if (showSubtitlePanel) {
            setSubtitlesEnabled(!subtitlesEnabled);
          }
          break;
          
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          if (showEpisodesPanel || showSubtitlePanel) {
            setShowEpisodesPanel(false);
            setShowSubtitlePanel(false);
          } else {
            router.back();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    showSubtitlePanel, 
    showEpisodesPanel, 
    focusedEpisodeIndex, 
    episodes, 
    subtitlesEnabled, 
    router
  ]);

  // Scroll focused episode into view
  useEffect(() => {
    if (showEpisodesPanel && episodeItemsRef.current[focusedEpisodeIndex]) {
      episodeItemsRef.current[focusedEpisodeIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [showEpisodesPanel, focusedEpisodeIndex]);

  // Navigation functions
  const goToEpisode = (episodeNumber: number) => {
    router.push(`/tv/watch/${animeId}?ep=${episodeNumber}`);
  };

  const goToPreviousEpisode = () => {
    if (!currentEpisode || !episodes) return;
    const currentNumber = currentEpisode.number;
    if (currentNumber > 1) {
      goToEpisode(currentNumber - 1);
    }
  };

  const goToNextEpisode = () => {
    if (!currentEpisode || !episodes) return;
    const currentNumber = currentEpisode.number;
    const maxEpisode = episodes.data.episodes.length;
    if (currentNumber < maxEpisode) {
      goToEpisode(currentNumber + 1);
    }
  };

  const handleServerChange = async (serverName: string) => {
    if (!currentEpisodeId) return;
    
    setSelectedServer(serverName);
    setLoading(true);
    
    try {
      await fetchSources(currentEpisodeId, serverName, selectedCategory);
    } finally {
      setLoading(false);
    }
  };

  if (!animeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Anime not found</h2>
          <p className="text-gray-400">Please select a valid anime to watch.</p>
        </div>
      </div>
    );
  }

  if (loading && !sources) {
    return <WatchPageSkeleton />;
  }

  if (error && !sources) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Unable to load episode</h2>
          <p className="text-gray-400 mb-4">{error}</p>
            <Button 
            onClick={() => window.location.reload()}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
              window.location.reload();
              }
            }}
            >Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Video Player Section - Full screen by default */}
      <div className="relative w-full h-screen">
        {sources?.data.sources && sources.data.sources.length > 0 ? (
          <VideoPlayer 
            sources={sources.data.sources}
            subtitles={sources?.data?.tracks || []}
            onShowEpisodes={() => setShowEpisodesPanel(!showEpisodesPanel)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-xl">Loading video...</p>
            </div>
          </div>
        )}
      </div>

      {/* Subtitle Panel - Red Button */}
      {showSubtitlePanel && (
        <div className="absolute inset-x-0 bottom-0 z-50 bg-gradient-to-t from-black via-black/95 to-transparent">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="bg-black/80 backdrop-blur-lg rounded-lg p-6">
              <h3 className="text-3xl font-bold mb-6 text-white flex items-center">
                <span className="w-8 h-8 mr-3 text-red-500 text-2xl">💬</span>
                Subtitle Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl text-white">Subtitles</span>
                  <Button
                    variant={subtitlesEnabled ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                    className="px-8 py-3 text-lg"
                  >
                    {subtitlesEnabled ? "ON" : "OFF"}
                  </Button>
                </div>
                {sources?.data?.tracks && sources.data.tracks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white">Available Subtitles:</h4>
                    {sources.data.tracks.map((track, index) => (
                      <div key={index} className="text-white text-lg">
                        • {track.lang || `Track ${index + 1}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-lg">Press Red button again to close • Press Enter to toggle</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Episodes Panel - Green Button */}
      {showEpisodesPanel && episodes && (
        <div className="absolute inset-x-0 bottom-0 z-50 bg-gradient-to-t from-black via-black/95 to-transparent">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="bg-black/80 backdrop-blur-lg rounded-lg p-6 max-h-[70vh] overflow-hidden flex flex-col">
              <h3 className="text-3xl font-bold mb-6 text-white flex items-center">
                <span className="w-8 h-8 mr-3 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                  {episodes.data.episodes.length}
                </span>
                Episodes
              </h3>
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                  {episodes.data.episodes.map((episode, index) => (
                    <div
                      key={episode.episodeId}
                      ref={(el) => { episodeItemsRef.current[index] = el; }}
                      onClick={() => {
                        goToEpisode(episode.number);
                        setShowEpisodesPanel(false);
                      }}
                      className={`
                        p-4 rounded-lg cursor-pointer transition-all duration-200 border-2
                        ${episode.number === currentEpisode?.number 
                          ? 'bg-rose-500/30 border-rose-500 text-rose-400' 
                          : 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-600/50 text-white'}
                        ${focusedEpisodeIndex === index
                          ? 'ring-4 ring-green-500 scale-110 z-10 border-green-500' 
                          : ''}
                      `}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1">{episode.number}</div>
                        {episode.isFiller && (
                          <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                            Filler
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-lg">
                  Use Arrow Keys to navigate • Enter to select • Green button to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WatchPageSkeleton = () => (
  <div className="min-h-screen bg-black">
    <div className="h-screen bg-gray-900 relative">
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4">
        <Skeleton className="h-6 w-60 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  </div>
);

export default WatchPage;