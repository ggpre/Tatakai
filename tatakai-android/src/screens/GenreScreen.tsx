import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Background } from '../components/layout/Background';
import { Header } from '../components/layout/Header';
import { AnimeCard } from '../components/ui/AnimeCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { colors, spacing } from '../lib/theme';
import { fetchGenreAnime, TrendingAnime } from '../lib/api';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GenreRouteProp = RouteProp<RootStackParamList, 'Genre'>;

export default function GenreScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GenreRouteProp>();
  const { genre } = route.params;

  const [animes, setAnimes] = useState<TrendingAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadData = async (pageNum: number = 1, refresh: boolean = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (pageNum > 1) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await fetchGenreAnime(genre, pageNum);
      
      if (pageNum === 1) {
        setAnimes(data.animes);
      } else {
        setAnimes((prev) => [...prev, ...data.animes]);
      }
      
      setHasMore(data.hasNextPage);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading genre anime:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [genre]);

  const onRefresh = () => loadData(1, true);

  const loadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      loadData(page + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Background />
        <Header title={genre} showBack />
        <View style={styles.loadingGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Background />
      <Header title={genre} showBack />

      <FlatList
        data={animes}
        numColumns={2}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <AnimeCard
            anime={item}
            onPress={() => navigation.navigate('Anime', { animeId: item.id })}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            <View style={{ height: 100 }} />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  loader: {
    marginVertical: spacing.xl,
  },
});
