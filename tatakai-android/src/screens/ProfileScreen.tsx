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
import { colors, fontSizes, spacing, borderRadius, shadows } from '../lib/theme';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, profile, signOut, isLoading } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Background />
        <Header title="Profile" />
        
        <View style={styles.authPrompt}>
          <Ionicons name="person-circle-outline" size={80} color={colors.mutedForeground} />
          <Text style={styles.authTitle}>Sign In Required</Text>
          <Text style={styles.authDescription}>
            Sign in to sync your watch history, favorites, and more across devices
          </Text>
          <Button
            onPress={() => navigation.navigate('Auth')}
            style={styles.authButton}
          >
            Sign In
          </Button>
        </View>
      </View>
    );
  }

  const menuItems = [
    {
      icon: 'download-outline',
      label: 'Downloads',
      description: 'Manage offline content',
      onPress: () => navigation.navigate('Downloads'),
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      description: 'App preferences',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'time-outline',
      label: 'Watch History',
      description: 'View your history',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      description: 'Manage alerts',
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.container}>
      <Background />
      <Header title="Profile" />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <GlassPanel style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profile?.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {profile?.displayName?.[0]?.toUpperCase() || 
                     user.email?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>
                {profile?.displayName || 'User'}
              </Text>
              {profile?.username && (
                <Text style={styles.username}>@{profile.username}</Text>
              )}
              <Text style={styles.email} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          </View>

          {profile?.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          {profile?.isAdmin && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.amber} />
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </GlassPanel>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <GlassPanel style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Watched</Text>
          </GlassPanel>
          <GlassPanel style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </GlassPanel>
          <GlassPanel style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Downloads</Text>
          </GlassPanel>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Ionicons 
                  name={item.icon as any} 
                  size={22} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={colors.mutedForeground} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.destructive} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
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
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  authTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.foreground,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  authDescription: {
    fontSize: fontSizes.md,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  authButton: {
    paddingHorizontal: 48,
  },
  profileCard: {
    marginTop: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.primaryForeground,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: colors.card,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  displayName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  username: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    marginTop: 2,
  },
  email: {
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  bio: {
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
    marginTop: spacing.md,
    lineHeight: 20,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.amber + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  adminText: {
    fontSize: fontSizes.xs,
    color: colors.amber,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  menuSection: {
    marginTop: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuLabel: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.foreground,
  },
  menuDescription: {
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.destructive + '15',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.destructive + '30',
  },
  signOutText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.destructive,
    marginLeft: spacing.sm,
  },
});
