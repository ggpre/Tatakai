import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, borderRadius } from '../../lib/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius: radius = borderRadius.md, style }: SkeletonProps) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <Skeleton height={200} borderRadius={borderRadius.xl} />
      <View style={styles.cardContent}>
        <Skeleton height={16} width="80%" style={{ marginTop: 8 }} />
        <Skeleton height={12} width="50%" style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function HeroSkeleton() {
  return (
    <View style={styles.heroContainer}>
      <Skeleton height={400} borderRadius={borderRadius.xl} />
    </View>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.listItem}>
          <Skeleton width={80} height={80} borderRadius={borderRadius.lg} />
          <View style={styles.listContent}>
            <Skeleton height={16} width="70%" />
            <Skeleton height={12} width="40%" style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.muted,
  },
  cardContainer: {
    marginRight: 12,
    marginBottom: 16,
    width: 150,
  },
  cardContent: {
    marginTop: 8,
  },
  heroContainer: {
    marginBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
});
