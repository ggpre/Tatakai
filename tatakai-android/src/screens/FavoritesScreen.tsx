import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Background } from '../components/layout/Background';
import { Header } from '../components/layout/Header';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Button } from '../components/ui/Button';
import { colors, fontSizes, spacing, borderRadius } from '../lib/theme';
import { useWatchStore } from '../store/watchStore';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const watchlist = useWatchStore((state) => state.localWatchlist);
  const removeFromWatchlist = useWatchStore((state) => state.removeFromWatchlist);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={64} color={colors.mutedForeground} />
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyDescription}>
        Start adding anime to your favorites to see them here
      </Text>
      <Button
        onPress={() => navigation.navigate('Main')}
        style={styles.exploreButton}
      >
        Explore Anime
      </Button>
    </View>
  );

  const renderItem = ({ item }: { item: typeof watchlist[0] }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('Anime', { animeId: item.animeId })}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.animePoster }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.animeName}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromWatchlist(item.animeId)}
      >
        <Ionicons name="heart" size={24} color={colors.destructive} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Background />
      <Header title="Favorites" />

      <FlatList
        data={watchlist}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
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
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: spacing.xl,
  },
  exploreButton: {
    paddingHorizontal: 32,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  poster: {
    width: 80,
    height: 110,
  },
  itemContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    backgroundColor: colors.primary + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  removeButton: {
    padding: spacing.md,
    justifyContent: 'center',
  },
});
