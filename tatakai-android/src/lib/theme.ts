// Tatakai Theme - Matching web app design
export const colors = {
  background: '#050505',
  foreground: '#fafafa',
  card: '#0d0d0d',
  cardForeground: '#fafafa',
  popover: '#0d0d0d',
  popoverForeground: '#fafafa',
  primary: '#6366f1',
  primaryForeground: '#ffffff',
  secondary: '#8b5cf6',
  secondaryForeground: '#ffffff',
  muted: '#1a1a1a',
  mutedForeground: '#a1a1aa',
  accent: '#8b5cf6',
  accentForeground: '#ffffff',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  border: '#27272a',
  input: '#27272a',
  ring: '#6366f1',
  glass: '#121212',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  surface: '#0a0a0a',
  surfaceHover: '#141414',
  amber: '#f59e0b',
  amberGlow: '#fbbf24',
  orange: '#f97316',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fonts = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};
