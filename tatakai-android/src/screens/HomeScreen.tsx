import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Background } from '../components/layout/Background';
import { Header } from '../components/layout/Header';
import { GlassPanel } from '../components/ui/GlassPanel';
import { AnimeCard } from '../components/ui/AnimeCard';
import { HeroSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { colors, fontSizes, borderRadius, spacing } from '../lib/theme';
import { fetchHomeData, HomeData, SpotlightAnime } from '../lib/api';
import { useWatchStore } from '../store/watchStore';
import { RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSpotlight, setCurrentSpotlight] = useState(0);
  const continueWatching = useWatchStore((state) => state.getContinueWatching());

  const loadData = async () => {
    try {
      const homeData = await fetchHomeData();
      setData(homeData);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (data?.spotlightAnimes && data.spotlightAnimes.length > 1) {
      const interval = setInterval(() => {
        setCurrentSpotlight((prev) => 
          (prev + 1) % data.spotlightAnimes.length
        );
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [data?.spotlightAnimes]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const spotlight = data?.spotlightAnimes?.[currentSpotlight];

  const renderHeroSection = () => {
    if (!spotlight) return null;

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => navigation.navigate('Anime', { animeId: spotlight.id })}
        style={styles.heroContainer}
      >
        <Image
          source={{ uri: spotlight.poster }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', colors.background]}
          style={styles.heroGradient}
        />
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Ionicons name="star" size={12} color={colors.amber} />
            <Text style={styles.heroBadgeText}>Spotlight</Text>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {spotlight.name}
          </Text>
          <Text style={styles.heroDescription} numberOfLines={3}>
            {spotlight.description}
          </Text>
          <View style={styles.heroMeta}>
            {spotlight.otherInfo?.slice(0, 3).map((info, i) => (
              <View key={i} style={styles.heroMetaItem}>
                <Text style={styles.heroMetaText}>{info}</Text>
              </View>
            ))}
          </View>
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => navigation.navigate('Anime', { animeId: spotlight.id })}
            >
              <Ionicons name="play" size={20} color={colors.primaryForeground} />
              <Text style={styles.playButtonText}>Watch Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Spotlight indicators */}
        <View style={styles.spotlightIndicators}>
          {data?.spotlightAnimes.map((_, i) => (
            <View
              key={i}
              style={[
                styles.spotlightDot,
                i === currentSpotlight && styles.spotlightDotActive,
              ]}
            />
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderContinueWatching = () => {
    if (continueWatching.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Watching</Text>
          <Ionicons name="play-circle" size={20} color={colors.primary} />
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={continueWatching}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.continueCard}
              onPress={() => navigation.navigate('Watch', { 
                episodeId: item.episodeId,
                seekTime: item.progressSeconds,
              })}
            >
              <Image
                source={{ uri: item.animePoster }}
                style={styles.continueImage}
                resizeMode="cover"
              />
              <View style={styles.continueOverlay}>
                <View style={styles.continueProgress}>
                  <View 
                    style={[
                      styles.continueProgressBar,
                      { width: `${(item.progressSeconds / item.durationSeconds) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.continueTitle} numberOfLines={1}>
                  {item.animeName}
                </Text>
                <Text style={styles.continueEpisode}>
                  Episode {item.episodeNumber}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderAnimeGrid = (
    title: string,
    animes: any[],
    icon?: React.ReactNode
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {icon}
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={animes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnimeCard
            anime={item}
            onPress={() => navigation.navigate('Anime', { animeId: item.id })}
          />
        )}
      />
    </View>
  );

  const renderGenreCloud = () => {
    if (!data?.genres) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse by Genre</Text>
          <Ionicons name="layers" size={20} color={colors.secondary} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {data.genres.slice(0, 15).map((genre) => (
            <TouchableOpacity
              key={genre}
              style={styles.genreChip}
              onPress={() => navigation.navigate('Genre', { genre })}
            >
              <Text style={styles.genreText}>{genre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTop10 = () => {
    if (!data?.top10Animes?.today) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top 10 Today</Text>
          <Ionicons name="trophy" size={20} color={colors.amber} />
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data.top10Animes.today.slice(0, 10)}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <AnimeCard
              anime={item}
              onPress={() => navigation.navigate('Anime', { animeId: item.id })}
              showRank
            />
          )}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Background />
        <Header showLogo showSearch showNotification />
        <ScrollView style={styles.content}>
          <HeroSkeleton />
          <View style={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Background />
      <Header showLogo showSearch showNotification />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {renderHeroSection()}
        {renderContinueWatching()}
        
        {data?.latestEpisodeAnimes && renderAnimeGrid(
          'Latest Episodes',
          data.latestEpisodeAnimes,
          <Ionicons name="time" size={20} color={colors.primary} />
        )}
        
        {data?.trendingAnimes && renderAnimeGrid(
          'Trending Now',
          data.trendingAnimes,
          <Ionicons name="trending-up" size={20} color={colors.destructive} />
        )}
        
        {renderTop10()}
        {renderGenreCloud()}
        
        {data?.mostPopularAnimes && renderAnimeGrid(
          'Most Popular',
          data.mostPopularAnimes.slice(0, 10),
          <Ionicons name="heart" size={20} color={colors.destructive} />
        )}
        
        {data?.mostFavoriteAnimes && renderAnimeGrid(
          'Most Favorite',
          data.mostFavoriteAnimes.slice(0, 10),
          <Ionicons name="star" size={20} color={colors.amber} />
        )}
        
        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  heroContainer: {
    height: height * 0.55,
    marginBottom: spacing.lg,
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
    height: '70%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroBadgeText: {
    color: colors.amber,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    marginLeft: 4,
  },
  heroTitle: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
    lineHeight: 20,
    marginBottom: 12,
  },
  heroMeta: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  heroMetaItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginRight: 8,
  },
  heroMetaText: {
    color: colors.foreground,
    fontSize: fontSizes.xs,
  },
  heroButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    marginRight: 12,
  },
  playButtonText: {
    color: colors.primaryForeground,
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightIndicators: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  spotlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  spotlightDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  continueCard: {
    width: 200,
    height: 120,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: 12,
  },
  continueImage: {
    width: '100%',
    height: '100%',
  },
  continueOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  continueProgress: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  continueProgressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  continueTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.foreground,
  },
  continueEpisode: {
    fontSize: fontSizes.xs,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  genreChip: {
    backgroundColor: colors.muted,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genreText: {
    color: colors.foreground,
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
});
