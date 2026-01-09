import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

import { Background } from '../components/layout/Background';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Skeleton } from '../components/ui/Skeleton';
import { colors, fontSizes, spacing, borderRadius } from '../lib/theme';
import {
  fetchEpisodeServers,
  fetchEpisodeSources,
  fetchAnimeInfo,
  fetchEpisodes,
  fetchSkipTimes,
  getFriendlyServerName,
  Episode,
  EpisodeServer,
  EpisodeSource,
} from '../lib/api';
import { useWatchStore } from '../store/watchStore';
import { RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type WatchRouteProp = RouteProp<RootStackParamList, 'Watch'>;

export default function WatchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<WatchRouteProp>();
  const { episodeId, seekTime } = route.params;

  const videoRef = useRef<Video>(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [servers, setServers] = useState<{ sub: EpisodeServer[]; dub: EpisodeServer[] }>({ sub: [], dub: [] });
  const [sources, setSources] = useState<EpisodeSource[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [animeInfo, setAnimeInfo] = useState<any>(null);
  const [category, setCategory] = useState<'sub' | 'dub'>('sub');
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [skipTimes, setSkipTimes] = useState<{ intro?: { startTime: number; endTime: number }; outro?: { startTime: number; endTime: number } }>({});
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);

  const addToHistory = useWatchStore((state) => state.addToHistory);
  const updateProgress = useWatchStore((state) => state.updateProgress);
  const skipIntroEnabled = useWatchStore((state) => state.skipIntro);
  const skipOutroEnabled = useWatchStore((state) => state.skipOutro);

  // Parse anime ID from episode ID
  const animeId = episodeId.split('?')[0];
  const currentEpisodeIndex = episodes.findIndex((ep) => ep.episodeId === episodeId);
  const currentEpisode = episodes[currentEpisodeIndex];
  const prevEpisode = currentEpisodeIndex > 0 ? episodes[currentEpisodeIndex - 1] : null;
  const nextEpisode = currentEpisodeIndex < episodes.length - 1 ? episodes[currentEpisodeIndex + 1] : null;

  // Handle back button in fullscreen
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isFullscreen) {
          toggleFullscreen();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [isFullscreen])
  );

  useEffect(() => {
    loadData();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [episodeId]);

  const loadData = async () => {
    setLoading(true);
    setVideoLoading(true);
    try {
      const [serverData, animeData, episodeData] = await Promise.all([
        fetchEpisodeServers(episodeId),
        fetchAnimeInfo(animeId),
        fetchEpisodes(animeId),
      ]);

      setServers(serverData);
      setAnimeInfo(animeData);
      setEpisodes(episodeData.episodes);

      // Get sources for first available server
      const availableServers = serverData.sub.filter((s) => s.serverName !== 'hd-1');
      if (availableServers.length > 0) {
        const defaultServer = availableServers.find((s) => s.serverName === 'hd-2') || availableServers[0];
        const sourceData = await fetchEpisodeSources(episodeId, defaultServer.serverName, 'sub');
        setSources(sourceData.sources);
      }

      // Load skip times - skip if malId not available
      // Note: mal_id would need to be fetched separately from Jikan API
      // For now, skip times won't be available without additional API call

      // Add to watch history
      if (animeData && episodeData) {
        const episode = episodeData.episodes.find((ep: Episode) => ep.episodeId === episodeId);
        if (episode) {
          addToHistory({
            animeId,
            animeName: animeData.anime.info.name,
            animePoster: animeData.anime.info.poster,
            episodeId,
            episodeNumber: episode.number,
            progressSeconds: 0,
            durationSeconds: 0,
            completed: false,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error loading watch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSources = async (serverName: string, cat: 'sub' | 'dub') => {
    setVideoLoading(true);
    try {
      const sourceData = await fetchEpisodeSources(episodeId, serverName, cat);
      setSources(sourceData.sources);
    } catch (error) {
      console.error('Error loading sources:', error);
    } finally {
      setVideoLoading(false);
    }
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      StatusBar.setHidden(false);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      StatusBar.setHidden(true);
    }
    setIsFullscreen(!isFullscreen);
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setIsPlaying(status.isPlaying);
    setCurrentTime(status.positionMillis / 1000);
    setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
    setProgress(status.durationMillis ? status.positionMillis / status.durationMillis : 0);
    setVideoLoading(status.isBuffering);

    // Check for skip intro/outro
    const currentSec = status.positionMillis / 1000;
    if (skipTimes.intro) {
      const inIntro = currentSec >= skipTimes.intro.startTime && currentSec < skipTimes.intro.endTime;
      setShowSkipIntro(inIntro);
      if (inIntro && skipIntroEnabled) {
        videoRef.current?.setPositionAsync(skipTimes.intro.endTime * 1000);
      }
    }
    if (skipTimes.outro) {
      const inOutro = currentSec >= skipTimes.outro.startTime && currentSec < skipTimes.outro.endTime;
      setShowSkipOutro(inOutro);
      if (inOutro && skipOutroEnabled) {
        videoRef.current?.setPositionAsync(skipTimes.outro.endTime * 1000);
      }
    }

    // Save progress periodically
    if (status.positionMillis && status.durationMillis) {
      updateProgress(episodeId, status.positionMillis / 1000, status.durationMillis / 1000);
    }
  };

  const handleSeek = async (forward: boolean) => {
    if (!videoRef.current) return;
    const seekAmount = forward ? 10000 : -10000;
    const newPosition = Math.max(0, currentTime * 1000 + seekAmount);
    await videoRef.current.setPositionAsync(newPosition);
  };

  const handleSkipIntro = async () => {
    if (skipTimes.intro && videoRef.current) {
      await videoRef.current.setPositionAsync(skipTimes.intro.endTime * 1000);
    }
  };

  const handleSkipOutro = async () => {
    if (skipTimes.outro && videoRef.current) {
      await videoRef.current.setPositionAsync(skipTimes.outro.endTime * 1000);
    }
  };

  const navigateToEpisode = (episode: Episode) => {
    navigation.replace('Watch', { episodeId: episode.episodeId });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const availableServers = category === 'sub' 
    ? servers.sub.filter((s) => s.serverName !== 'hd-1')
    : servers.dub.filter((s) => s.serverName !== 'hd-1');

  const currentSource = sources.find((s) => s.isM3U8) || sources[0];

  if (loading) {
    return (
      <View style={styles.container}>
        <Background />
        <Skeleton height={width * 0.5625} borderRadius={0} />
        <View style={{ padding: spacing.md }}>
          <Skeleton height={24} width="60%" style={{ marginBottom: 12 }} />
          <Skeleton height={16} width="40%" style={{ marginBottom: 24 }} />
          <Skeleton height={40} style={{ marginBottom: 12 }} />
          <Skeleton height={40} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      {!isFullscreen && <Background />}
      <StatusBar hidden={isFullscreen} />

      {/* Video Player */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
        style={[
          styles.videoContainer,
          isFullscreen && styles.videoFullscreen,
        ]}
      >
        {currentSource ? (
          <Video
            ref={videoRef}
            source={{ uri: currentSource.url }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={isPlaying}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onLoad={() => {
              setVideoLoading(false);
              if (seekTime) {
                videoRef.current?.setPositionAsync(seekTime * 1000);
              }
            }}
            useNativeControls={false}
          />
        ) : (
          <View style={styles.noVideo}>
            <Ionicons name="videocam-off" size={48} color={colors.mutedForeground} />
            <Text style={styles.noVideoText}>No video source available</Text>
          </View>
        )}

        {/* Loading Overlay */}
        {videoLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity
                onPress={() => {
                  if (isFullscreen) {
                    toggleFullscreen();
                  } else {
                    navigation.goBack();
                  }
                }}
                style={styles.backBtn}
              >
                <Ionicons name="arrow-back" size={24} color={colors.foreground} />
              </TouchableOpacity>
              <View style={styles.titleContainer}>
                <Text style={styles.episodeTitle} numberOfLines={1}>
                  {animeInfo?.anime?.info?.name}
                </Text>
                <Text style={styles.episodeNumber}>
                  Episode {currentEpisode?.number}
                </Text>
              </View>
              <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenBtn}>
                <Ionicons 
                  name={isFullscreen ? "contract" : "expand"} 
                  size={24} 
                  color={colors.foreground} 
                />
              </TouchableOpacity>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity onPress={() => handleSeek(false)} style={styles.seekBtn}>
                <Ionicons name="play-back" size={32} color={colors.foreground} />
                <Text style={styles.seekText}>10s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (isPlaying) {
                    videoRef.current?.pauseAsync();
                  } else {
                    videoRef.current?.playAsync();
                  }
                }}
                style={styles.playBtn}
              >
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={48} 
                  color={colors.foreground} 
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleSeek(true)} style={styles.seekBtn}>
                <Ionicons name="play-forward" size={32} color={colors.foreground} />
                <Text style={styles.seekText}>10s</Text>
              </TouchableOpacity>
            </View>

            {/* Skip Buttons */}
            {showSkipIntro && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkipIntro}>
                <Ionicons name="play-skip-forward" size={18} color={colors.foreground} />
                <Text style={styles.skipText}>Skip Intro</Text>
              </TouchableOpacity>
            )}
            {showSkipOutro && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkipOutro}>
                <Ionicons name="play-skip-forward" size={18} color={colors.foreground} />
                <Text style={styles.skipText}>Skip Outro</Text>
              </TouchableOpacity>
            )}

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Content Below Video */}
      {!isFullscreen && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Episode Navigation */}
          <View style={styles.episodeNav}>
            <TouchableOpacity
              style={[styles.navBtn, !prevEpisode && styles.navBtnDisabled]}
              onPress={() => prevEpisode && navigateToEpisode(prevEpisode)}
              disabled={!prevEpisode}
            >
              <Ionicons name="chevron-back" size={20} color={colors.foreground} />
              <Text style={styles.navBtnText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnNext, !nextEpisode && styles.navBtnDisabled]}
              onPress={() => nextEpisode && navigateToEpisode(nextEpisode)}
              disabled={!nextEpisode}
            >
              <Text style={styles.navBtnText}>Next</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.primaryForeground} />
            </TouchableOpacity>
          </View>

          {/* Audio Selection */}
          <GlassPanel style={styles.serverPanel}>
            <Text style={styles.panelTitle}>Audio</Text>
            <View style={styles.categoryButtons}>
              <TouchableOpacity
                style={[styles.categoryBtn, category === 'sub' && styles.categoryBtnActive]}
                onPress={() => {
                  setCategory('sub');
                  if (servers.sub[0]) {
                    loadSources(servers.sub[0].serverName, 'sub');
                  }
                }}
              >
                <Ionicons name="text" size={16} color={category === 'sub' ? colors.primaryForeground : colors.foreground} />
                <Text style={[styles.categoryText, category === 'sub' && styles.categoryTextActive]}>
                  Sub
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.categoryBtn, category === 'dub' && styles.categoryBtnActive]}
                onPress={() => {
                  setCategory('dub');
                  if (servers.dub[0]) {
                    loadSources(servers.dub[0].serverName, 'dub');
                  }
                }}
              >
                <Ionicons name="volume-high" size={16} color={category === 'dub' ? colors.secondaryForeground : colors.foreground} />
                <Text style={[styles.categoryText, category === 'dub' && styles.categoryTextActive]}>
                  Dub
                </Text>
              </TouchableOpacity>
            </View>
          </GlassPanel>

          {/* Server Selection */}
          <GlassPanel style={styles.serverPanel}>
            <Text style={styles.panelTitle}>Server</Text>
            <View style={styles.serverButtons}>
              {availableServers.map((server, index) => (
                <TouchableOpacity
                  key={server.serverId}
                  style={[
                    styles.serverBtn,
                    selectedServerIndex === index && styles.serverBtnActive,
                  ]}
                  onPress={() => {
                    setSelectedServerIndex(index);
                    loadSources(server.serverName, category);
                  }}
                >
                  <Text
                    style={[
                      styles.serverText,
                      selectedServerIndex === index && styles.serverTextActive,
                    ]}
                  >
                    {getFriendlyServerName(server.serverName)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassPanel>

          {/* Episodes List */}
          <GlassPanel style={styles.episodesPanel}>
            <Text style={styles.panelTitle}>Episodes</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.episodesList}
            >
              {episodes.map((ep) => (
                <TouchableOpacity
                  key={ep.episodeId}
                  style={[
                    styles.episodeBtn,
                    ep.episodeId === episodeId && styles.episodeBtnActive,
                    ep.isFiller && styles.episodeBtnFiller,
                  ]}
                  onPress={() => navigateToEpisode(ep)}
                >
                  <Text
                    style={[
                      styles.episodeBtnText,
                      ep.episodeId === episodeId && styles.episodeBtnTextActive,
                    ]}
                  >
                    {ep.number}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </GlassPanel>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullscreenContainer: {
    backgroundColor: '#000',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  videoFullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    aspectRatio: undefined,
  },
  video: {
    flex: 1,
  },
  noVideo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noVideoText: {
    color: colors.mutedForeground,
    marginTop: spacing.md,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  backBtn: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  episodeTitle: {
    color: colors.foreground,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  episodeNumber: {
    color: colors.mutedForeground,
    fontSize: fontSizes.sm,
  },
  fullscreenBtn: {
    padding: 8,
  },
  centerControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  seekBtn: {
    alignItems: 'center',
  },
  seekText: {
    color: colors.foreground,
    fontSize: fontSizes.xs,
    marginTop: 4,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    position: 'absolute',
    bottom: 80,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  skipText: {
    color: colors.foreground,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  timeText: {
    color: colors.foreground,
    fontSize: fontSizes.sm,
    minWidth: 45,
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  episodeNav: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.muted,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    gap: 4,
  },
  navBtnNext: {
    backgroundColor: colors.primary,
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    color: colors.foreground,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  serverPanel: {
    marginBottom: spacing.md,
  },
  panelTitle: {
    color: colors.foreground,
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.muted,
    gap: 8,
  },
  categoryBtnActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.foreground,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.primaryForeground,
  },
  serverButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  serverBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.muted,
  },
  serverBtnActive: {
    backgroundColor: colors.foreground,
  },
  serverText: {
    color: colors.foreground,
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  serverTextActive: {
    color: colors.background,
  },
  episodesPanel: {
    marginBottom: spacing.md,
  },
  episodesList: {
    paddingVertical: 4,
  },
  episodeBtn: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  episodeBtnActive: {
    backgroundColor: colors.primary,
  },
  episodeBtnFiller: {
    borderWidth: 1,
    borderColor: colors.orange,
  },
  episodeBtnText: {
    color: colors.foreground,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  episodeBtnTextActive: {
    color: colors.primaryForeground,
  },
});
