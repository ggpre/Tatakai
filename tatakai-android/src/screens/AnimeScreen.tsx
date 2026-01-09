import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Background } from '../components/layout/Background';
import { Header } from '../components/layout/Header';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Button } from '../components/ui/Button';
import { Skeleton, ListSkeleton } from '../components/ui/Skeleton';
import { colors, fontSizes, spacing, borderRadius } from '../lib/theme';
import { fetchAnimeInfo, fetchEpisodes, AnimeInfo, Episode } from '../lib/api';
import { useWatchStore } from '../store/watchStore';
import { useDownloadStore } from '../store/downloadStore';
import { RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AnimeRouteProp = RouteProp<RootStackParamList, 'Anime'>;

export default function AnimeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AnimeRouteProp>();
  const { animeId } = route.params;

  const [animeInfo, setAnimeInfo] = useState<{ anime: { info: AnimeInfo; moreInfo: AnimeInfo['moreInfo'] } } | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  const addToWatchlist = useWatchStore((state) => state.addToWatchlist);
  const removeFromWatchlist = useWatchStore((state) => state.removeFromWatchlist);
  const isInWatchlist = useWatchStore((state) => state.isInWatchlist);
  const addDownload = useDownloadStore((state) => state.addDownload);

  const isFavorite = isInWatchlist(animeId);

  useEffect(() => {
    loadData();
  }, [animeId]);

  const loadData = async () => {
    try {
      const [info, eps] = await Promise.all([
        fetchAnimeInfo(animeId),
        fetchEpisodes(animeId),
      ]);
      setAnimeInfo(info);
      setEpisodes(eps.episodes);
    } catch (error) {
      console.error('Error loading anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromWatchlist(animeId);
    } else if (animeInfo) {
      addToWatchlist({
        animeId,
        animeName: animeInfo.anime.info.name,
        animePoster: animeInfo.anime.info.poster,
        status: 'watching',
      });
    }
  };

  const handleShare = async () => {
    if (!animeInfo) return;
    try {
      await Share.share({
        message: `Check out ${animeInfo.anime.info.name} on Tatakai!`,
        title: animeInfo.anime.info.name,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDownload = (episode: Episode) => {
    if (!animeInfo) return;
    addDownload({
      animeId,
      animeName: animeInfo.anime.info.name,
      animePoster: animeInfo.anime.info.poster,
      episodeId: episode.episodeId,
      episodeNumber: episode.number,
      episodeTitle: episode.title,
      totalSize: 0,
    });
  };

  const displayedEpisodes = showAllEpisodes ? episodes : episodes.slice(0, 12);

  if (loading) {
    return (
      <View style={styles.container}>
        <Background />
        <Header showBack />
        <ScrollView>
          <Skeleton height={height * 0.4} borderRadius={0} />
          <View style={{ padding: spacing.md }}>
            <Skeleton height={32} width="80%" style={{ marginBottom: 12 }} />
            <Skeleton height={16} width="60%" style={{ marginBottom: 24 }} />
            <ListSkeleton count={5} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!animeInfo) {
    return (
      <View style={styles.container}>
        <Background />
        <Header showBack />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.destructive} />
          <Text style={styles.errorText}>Failed to load anime</Text>
          <Button onPress={loadData}>Retry</Button>
        </View>
      </View>
    );
  }

  const anime = animeInfo.anime.info;
  const moreInfo = animeInfo.anime.moreInfo;

  return (
    <View style={styles.container}>
      <Background />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: anime.poster }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.heroGradient}
          />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.actionButton} onPress={toggleFavorite}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? colors.destructive : colors.foreground} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Anime Info */}
        <View style={styles.content}>
          <Text style={styles.title}>{anime.name}</Text>
          {anime.jname && (
            <Text style={styles.japaneseTitle}>{anime.jname}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            {anime.stats?.rating && (
              <View style={styles.statBadge}>
                <Ionicons name="star" size={14} color={colors.amber} />
                <Text style={styles.statText}>{anime.stats.rating}</Text>
              </View>
            )}
            {anime.stats?.type && (
              <View style={styles.statBadge}>
                <Text style={styles.statText}>{anime.stats.type}</Text>
              </View>
            )}
            {anime.stats?.episodes && (
              <View style={styles.statBadge}>
                <Ionicons name="play" size={14} color={colors.primary} />
                <Text style={styles.statText}>
                  {anime.stats.episodes.sub || anime.stats.episodes.dub} Episodes
                </Text>
              </View>
            )}
          </View>

          {/* Genres */}
          {moreInfo?.genres && (
            <View style={styles.genresContainer}>
              {moreInfo.genres.slice(0, 5).map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={styles.genreChip}
                  onPress={() => navigation.navigate('Genre', { genre })}
                >
                  <Text style={styles.genreText}>{genre}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Description */}
          <GlassPanel style={styles.descriptionPanel}>
            <Text style={styles.sectionTitle}>Synopsis</Text>
            <Text style={styles.description}>{anime.description}</Text>
          </GlassPanel>

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            <GlassPanel style={styles.infoCard}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{moreInfo?.status || 'Unknown'}</Text>
            </GlassPanel>
            <GlassPanel style={styles.infoCard}>
              <Text style={styles.infoLabel}>Aired</Text>
              <Text style={styles.infoValue}>{moreInfo?.aired || 'Unknown'}</Text>
            </GlassPanel>
            {moreInfo?.studios?.[0] && (
              <GlassPanel style={styles.infoCard}>
                <Text style={styles.infoLabel}>Studio</Text>
                <Text style={styles.infoValue}>{moreInfo.studios[0]}</Text>
              </GlassPanel>
            )}
          </View>

          {/* Episodes */}
          <View style={styles.episodesSection}>
            <View style={styles.episodesHeader}>
              <Text style={styles.sectionTitle}>Episodes</Text>
              <Text style={styles.episodeCount}>{episodes.length} Episodes</Text>
            </View>

            {displayedEpisodes.map((episode) => (
              <TouchableOpacity
                key={episode.episodeId}
                style={[
                  styles.episodeItem,
                  episode.isFiller && styles.episodeFiller,
                ]}
                onPress={() => navigation.navigate('Watch', { episodeId: episode.episodeId })}
              >
                <View style={styles.episodeNumber}>
                  <Text style={styles.episodeNumberText}>{episode.number}</Text>
                </View>
                <View style={styles.episodeContent}>
                  <Text style={styles.episodeTitle} numberOfLines={1}>
                    {episode.title || `Episode ${episode.number}`}
                  </Text>
                  {episode.isFiller && (
                    <Text style={styles.fillerBadge}>Filler</Text>
                  )}
                </View>
                <View style={styles.episodeActions}>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownload(episode)}
                  >
                    <Ionicons name="download-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <Ionicons name="play-circle" size={24} color={colors.foreground} />
                </View>
              </TouchableOpacity>
            ))}

            {episodes.length > 12 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllEpisodes(!showAllEpisodes)}
              >
                <Text style={styles.showMoreText}>
                  {showAllEpisodes ? 'Show Less' : `Show All ${episodes.length} Episodes`}
                </Text>
                <Ionicons 
                  name={showAllEpisodes ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: height * 0.45,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActions: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'row',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: spacing.md,
    marginTop: -60,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 4,
  },
  japaneseTitle: {
    fontSize: fontSizes.md,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.muted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statText: {
    fontSize: fontSizes.sm,
    color: colors.foreground,
    fontWeight: '500',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: 8,
  },
  genreChip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  genreText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  descriptionPanel: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  infoLabel: {
    fontSize: fontSizes.xs,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: fontSizes.sm,
    color: colors.foreground,
    fontWeight: '600',
    textAlign: 'center',
  },
  episodesSection: {
    marginTop: spacing.md,
  },
  episodesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  episodeCount: {
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  episodeFiller: {
    borderColor: colors.orange + '40',
  },
  episodeNumber: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeNumberText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.primaryForeground,
  },
  episodeContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  episodeTitle: {
    fontSize: fontSizes.md,
    color: colors.foreground,
    fontWeight: '500',
  },
  fillerBadge: {
    fontSize: fontSizes.xs,
    color: colors.orange,
    marginTop: 4,
  },
  episodeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  downloadButton: {
    padding: 8,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: 8,
  },
  showMoreText: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: fontSizes.lg,
    color: colors.foreground,
  },
});
