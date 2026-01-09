import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Background } from '../components/layout/Background';
import { Header } from '../components/layout/Header';
import { Input } from '../components/ui/Input';
import { AnimeCard } from '../components/ui/AnimeCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { colors, fontSizes, spacing } from '../lib/theme';
import { searchAnime, TrendingAnime } from '../lib/api';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TrendingAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string, newSearch: boolean = true) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    if (newSearch) {
      setLoading(true);
      setPage(1);
      Keyboard.dismiss();
    }

    try {
      const currentPage = newSearch ? 1 : page;
      const data = await searchAnime(searchQuery, currentPage);
      
      if (newSearch) {
        setResults(data.animes);
      } else {
        setResults((prev) => [...prev, ...data.animes]);
      }
      
      setHasMore(data.hasNextPage);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
      handleSearch(query, false);
    }
  };

  const renderEmptyState = () => {
    if (loading) return null;

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={64} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>Search Anime</Text>
          <Text style={styles.emptyDescription}>
            Find your favorite anime by searching for titles, genres, or studios
          </Text>
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="sad-outline" size={64} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptyDescription}>
            Try searching for something else
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Background />
      <Header title="Search" />

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search anime..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch(query)}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          icon={<Ionicons name="search" size={20} color={colors.mutedForeground} />}
        />
      </View>

      {loading && results.length === 0 ? (
        <View style={styles.loadingGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <AnimeCard
              anime={item}
              onPress={() => navigation.navigate('Anime', { animeId: item.id })}
            />
          )}
          ListEmptyComponent={renderEmptyState}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && results.length > 0 ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : (
              <View style={{ height: 100 }} />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.foreground,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: fontSizes.md,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
  },
  loader: {
    marginVertical: spacing.xl,
  },
});
