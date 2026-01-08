import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, borderRadius, shadows } from '../../lib/theme';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  noPadding?: boolean;
}

export function GlassPanel({ children, style, intensity = 20, noPadding = false }: GlassPanelProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <View style={[styles.content, noPadding && styles.noPadding]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(13, 13, 13, 0.6)',
    ...shadows.md,
  },
  blur: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  noPadding: {
    padding: 0,
  },
});
