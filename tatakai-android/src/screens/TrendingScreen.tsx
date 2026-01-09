import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Background } from '../components/layout/Background';
import { Header } from '../components/layout/Header';
import { AnimeCard } from '../components/ui/AnimeCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { colors, fontSizes, spacing } from '../lib/theme';
import { fetchTrendingAnime, TrendingAnime } from '../lib/api';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TrendingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [animes, setAnimes] = useState<TrendingAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchTrendingAnime();
      setAnimes(data);
    } catch (error) {
      console.error('Error loading trending:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Background />
        <Header title="Trending" />
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
      <Header title="Trending" />

      <FlatList
        data={animes}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item, index }) => (
          <AnimeCard
            anime={{ ...item, rank: index + 1 }}
            onPress={() => navigation.navigate('Anime', { animeId: item.id })}
            showRank
          />
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
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
});
