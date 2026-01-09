import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSizes } from '../../lib/theme';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
  rightElement?: React.ReactNode;
}

export function Header({
  title,
  showBack = false,
  showLogo = false,
  showSearch = false,
  showNotification = false,
  rightElement,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
        )}
        {showLogo && (
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        {title && <Text style={styles.title}>{title}</Text>}
      </View>

      <View style={styles.right}>
        {showSearch && (
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Search')}
            style={styles.iconButton}
          >
            <Ionicons name="search" size={24} color={colors.foreground} />
          </TouchableOpacity>
        )}
        {showNotification && (
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.foreground} />
          </TouchableOpacity>
        )}
        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.foreground,
    marginLeft: 8,
  },
});
