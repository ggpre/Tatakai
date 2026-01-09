import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Background } from '../components/layout/Background';
import { Header } from '../components/layout/Header';
import { GlassPanel } from '../components/ui/GlassPanel';
import { colors, fontSizes, spacing, borderRadius } from '../lib/theme';
import { useWatchStore } from '../store/watchStore';
import { useDownloadStore } from '../store/downloadStore';
import { APP_VERSION, AUTHOR } from '../lib/constants';

export default function SettingsScreen() {
  const navigation = useNavigation();
  
  // Watch settings
  const autoPlay = useWatchStore((state) => state.autoPlay);
  const setAutoPlay = useWatchStore((state) => state.setAutoPlay);
  const skipIntro = useWatchStore((state) => state.skipIntro);
  const setSkipIntro = useWatchStore((state) => state.setSkipIntro);
  const skipOutro = useWatchStore((state) => state.skipOutro);
  const setSkipOutro = useWatchStore((state) => state.setSkipOutro);
  const defaultSubtitles = useWatchStore((state) => state.defaultSubtitles);
  const setDefaultSubtitles = useWatchStore((state) => state.setDefaultSubtitles);
  const clearHistory = useWatchStore((state) => state.clearHistory);

  // Download store
  const deleteAllDownloads = useDownloadStore((state) => state.deleteAllDownloads);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Watch History',
      'Are you sure you want to clear your watch history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  };

  const handleDeleteDownloads = () => {
    Alert.alert(
      'Delete All Downloads',
      'Are you sure you want to delete all downloaded content? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: deleteAllDownloads,
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    label, 
    description,
    value,
    onValueChange,
    type = 'switch',
    onPress,
  }: {
    icon: string;
    label: string;
    description?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    type?: 'switch' | 'button';
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={type === 'switch'}
      activeOpacity={type === 'button' ? 0.7 : 1}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      {type === 'switch' && onValueChange && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.muted, true: colors.primary + '60' }}
          thumbColor={value ? colors.primary : colors.mutedForeground}
        />
      )}
      {type === 'button' && (
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Background />
      <Header title="Settings" showBack />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Playback Settings */}
        <Text style={styles.sectionTitle}>Playback</Text>
        <GlassPanel style={styles.section}>
          <SettingItem
            icon="play-forward"
            label="Auto Play"
            description="Automatically play next episode"
            value={autoPlay}
            onValueChange={setAutoPlay}
          />
          <SettingItem
            icon="play-skip-forward"
            label="Auto Skip Intro"
            description="Automatically skip opening sequences"
            value={skipIntro}
            onValueChange={setSkipIntro}
          />
          <SettingItem
            icon="play-skip-forward-outline"
            label="Auto Skip Outro"
            description="Automatically skip ending sequences"
            value={skipOutro}
            onValueChange={setSkipOutro}
          />
          <SettingItem
            icon="text"
            label="Show Subtitles"
            description="Enable subtitles by default"
            value={defaultSubtitles}
            onValueChange={setDefaultSubtitles}
          />
        </GlassPanel>

        {/* Downloads */}
        <Text style={styles.sectionTitle}>Downloads</Text>
        <GlassPanel style={styles.section}>
          <SettingItem
            icon="folder-open"
            label="Manage Downloads"
            description="View and manage downloaded content"
            type="button"
            onPress={() => (navigation as any).navigate('Downloads')}
          />
          <SettingItem
            icon="trash"
            label="Delete All Downloads"
            description="Remove all downloaded content"
            type="button"
            onPress={handleDeleteDownloads}
          />
        </GlassPanel>

        {/* Data */}
        <Text style={styles.sectionTitle}>Data</Text>
        <GlassPanel style={styles.section}>
          <SettingItem
            icon="time"
            label="Clear Watch History"
            description="Remove all watch history"
            type="button"
            onPress={handleClearHistory}
          />
        </GlassPanel>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <GlassPanel style={styles.section}>
          <SettingItem
            icon="information-circle"
            label="Version"
            description={`Tatakai v${APP_VERSION}`}
            type="button"
          />
          <SettingItem
            icon="person"
            label="Developer"
            description={AUTHOR}
            type="button"
            onPress={() => Linking.openURL('https://github.com/Snozxyx')}
          />
          <SettingItem
            icon="logo-github"
            label="Source Code"
            description="View on GitHub"
            type="button"
            onPress={() => Linking.openURL('https://github.com/Snozxyx/Tatakai')}
          />
          <SettingItem
            icon="document-text"
            label="Privacy Policy"
            type="button"
            onPress={() => {}}
          />
          <SettingItem
            icon="shield-checkmark"
            label="Terms of Service"
            type="button"
            onPress={() => {}}
          />
        </GlassPanel>

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
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  section: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingLabel: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.foreground,
  },
  settingDescription: {
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
    marginTop: 2,
  },
});
