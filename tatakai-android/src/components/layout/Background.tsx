import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';

export function Background() {
  return (
    <View style={styles.container}>
      {/* Base background */}
      <View style={styles.base} />
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', colors.primary + '10', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      {/* Radial glow effect */}
      <LinearGradient
        colors={[colors.secondary + '15', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={styles.glow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  glow: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    height: 400,
    opacity: 0.5,
  },
});
