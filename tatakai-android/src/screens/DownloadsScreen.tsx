import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Background } from '../components/layout/Background';
import { Header } from '../components/layout/Header';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Button } from '../components/ui/Button';
import { colors, fontSizes, spacing, borderRadius } from '../lib/theme';
import { useDownloadStore } from '../store/downloadStore';
import { RootStackParamList, DownloadItem } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DownloadsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const downloads = useDownloadStore((state) => state.downloads);
  const downloadedSeries = useDownloadStore((state) => state.getDownloadedSeries());
  const removeDownload = useDownloadStore((state) => state.removeDownload);
  const pauseDownload = useDownloadStore((state) => state.pauseDownload);
  const resumeDownload = useDownloadStore((state) => state.resumeDownload);
  const deleteAllDownloads = useDownloadStore((state) => state.deleteAllDownloads);

  const handleDeleteDownload = (download: DownloadItem) => {
    Alert.alert(
      'Delete Download',
      `Delete Episode ${download.episodeNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => removeDownload(download.id),
        },
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Downloads',
      'Are you sure you want to delete all downloads?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: deleteAllDownloads,
        },
      ]
    );
  };

  const getStatusIcon = (status: DownloadItem['status']) => {
    switch (status) {
      case 'completed':
        return { name: 'checkmark-circle', color: '#22c55e' };
      case 'downloading':
        return { name: 'cloud-download', color: colors.primary };
      case 'paused':
        return { name: 'pause-circle', color: colors.amber };
      case 'failed':
        return { name: 'close-circle', color: colors.destructive };
      default:
        return { name: 'time', color: colors.mutedForeground };
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cloud-download-outline" size={64} color={colors.mutedForeground} />
      <Text style={styles.emptyTitle}>No Downloads</Text>
      <Text style={styles.emptyDescription}>
        Downloaded anime will appear here for offline viewing
      </Text>
      <Button
        onPress={() => navigation.goBack()}
        style={styles.browseButton}
      >
        Browse Anime
      </Button>
    </View>
  );

  const renderDownloadItem = (download: DownloadItem) => {
    const statusIcon = getStatusIcon(download.status);

    return (
      <TouchableOpacity
        key={download.id}
        style={styles.downloadItem}
        onPress={() => {
          if (download.status === 'completed') {
            navigation.navigate('Watch', { episodeId: download.episodeId });
          }
        }}
        activeOpacity={download.status === 'completed' ? 0.7 : 1}
      >
        <View style={styles.downloadInfo}>
          <View style={styles.episodeHeader}>
            <Text style={styles.episodeNumber}>Episode {download.episodeNumber}</Text>
            <Ionicons name={statusIcon.name as any} size={18} color={statusIcon.color} />
          </View>
          {download.episodeTitle && (
            <Text style={styles.episodeTitle} numberOfLines={1}>
              {download.episodeTitle}
            </Text>
          )}
          
          {download.status === 'downloading' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${download.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {formatSize(download.downloadedSize)} / {formatSize(download.totalSize)}
              </Text>
            </View>
          )}

          {download.status === 'completed' && download.totalSize > 0 && (
            <Text style={styles.sizeText}>{formatSize(download.totalSize)}</Text>
          )}

          {download.status === 'failed' && download.error && (
            <Text style={styles.errorText} numberOfLines={1}>{download.error}</Text>
          )}
        </View>

        <View style={styles.downloadActions}>
          {download.status === 'downloading' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => pauseDownload(download.id)}
            >
              <Ionicons name="pause" size={20} color={colors.foreground} />
            </TouchableOpacity>
          )}
          {download.status === 'paused' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => resumeDownload(download.id)}
            >
              <Ionicons name="play" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteDownload(download)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSeriesSection = (series: typeof downloadedSeries[0]) => (
    <GlassPanel key={series.animeId} style={styles.seriesCard}>
      <TouchableOpacity
        style={styles.seriesHeader}
        onPress={() => navigation.navigate('Anime', { animeId: series.animeId })}
      >
        <Image
          source={{ uri: series.animePoster }}
          style={styles.seriesPoster}
          resizeMode="cover"
        />
        <View style={styles.seriesInfo}>
          <Text style={styles.seriesTitle} numberOfLines={2}>
            {series.animeName}
          </Text>
          <Text style={styles.seriesStats}>
            {series.downloadedEpisodes} / {series.totalEpisodes} episodes
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>

      <View style={styles.episodesList}>
        {series.episodes.map(renderDownloadItem)}
      </View>
    </GlassPanel>
  );

  return (
    <View style={styles.container}>
      <Background />
      <Header 
        title="Downloads" 
        showBack
        rightElement={
          downloads.length > 0 ? (
            <TouchableOpacity onPress={handleDeleteAll} style={styles.headerButton}>
              <Ionicons name="trash" size={20} color={colors.destructive} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={downloads.length === 0 ? styles.emptyContent : undefined}
      >
        {downloads.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{downloadedSeries.length}</Text>
                <Text style={styles.summaryLabel}>Series</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{downloads.length}</Text>
                <Text style={styles.summaryLabel}>Episodes</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {downloads.filter((d) => d.status === 'completed').length}
                </Text>
                <Text style={styles.summaryLabel}>Ready</Text>
              </View>
            </View>

            {/* Series List */}
            {downloadedSeries.map(renderSeriesSection)}

            <View style={{ height: 100 }} />
          </>
        )}
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
  emptyContent: {
    flexGrow: 1,
  },
  headerButton: {
    padding: spacing.sm,
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
  browseButton: {
    paddingHorizontal: 32,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  summaryLabel: {
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  seriesCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  seriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  seriesPoster: {
    width: 60,
    height: 80,
    borderRadius: borderRadius.md,
  },
  seriesInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  seriesTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.foreground,
  },
  seriesStats: {
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  episodesList: {
    padding: spacing.sm,
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.muted,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  downloadInfo: {
    flex: 1,
  },
  episodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  episodeNumber: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.foreground,
  },
  episodeTitle: {
    fontSize: fontSizes.xs,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSizes.xs,
    color: colors.mutedForeground,
  },
  sizeText: {
    fontSize: fontSizes.xs,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  errorText: {
    fontSize: fontSizes.xs,
    color: colors.destructive,
    marginTop: 4,
  },
  downloadActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.sm,
  },
});
