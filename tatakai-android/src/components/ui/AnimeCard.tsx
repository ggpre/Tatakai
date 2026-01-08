import React from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, shadows, fontSizes } from '../../lib/theme';
import { Anime } from '../../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface AnimeCardProps {
  anime: Anime;
  onPress: () => void;
  showRank?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function AnimeCard({ anime, onPress, showRank = false, size = 'medium' }: AnimeCardProps) {
  const cardWidth = size === 'small' ? CARD_WIDTH * 0.8 : size === 'large' ? CARD_WIDTH * 1.2 : CARD_WIDTH;
  const cardHeight = cardWidth * 1.4;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.container, { width: cardWidth }]}
    >
      <View style={[styles.imageContainer, { height: cardHeight }]}>
        <Image
          source={{ uri: anime.poster }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        
        {showRank && anime.rank && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{anime.rank}</Text>
          </View>
        )}

        {anime.episodes && (
          <View style={styles.episodeBadge}>
            <Ionicons name="play" size={10} color={colors.foreground} />
            <Text style={styles.episodeText}>
              {anime.episodes.sub || anime.episodes.dub || 0}
            </Text>
          </View>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {anime.name}
          </Text>
          {anime.type && (
            <Text style={styles.type}>{anime.type}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    marginBottom: 16,
  },
  imageContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.muted,
    ...shadows.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    ...shadows.sm,
  },
  rankText: {
    color: colors.primaryForeground,
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
  },
  episodeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  episodeText: {
    color: colors.foreground,
    fontSize: fontSizes.xs,
    fontWeight: '500',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  title: {
    color: colors.foreground,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    lineHeight: 18,
  },
  type: {
    color: colors.mutedForeground,
    fontSize: fontSizes.xs,
    marginTop: 4,
  },
});
