// constants/theme.ts
export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  tabBar: string;
  header: string;
  urgent: string;
  warning: string;
  shelf: string;
  shelfBorder: string;
  shelfSupport: string;
  inputBg: string;
  chipBg: string;
  chipActiveBg: string;
  modalOverlay: string;
};

export const lightTheme: ThemeColors = {
  background: '#faf8f3',
  surface: '#ffffff',
  surfaceSecondary: '#f0faf5',
  surfaceTertiary: '#e8f5ee',
  primary: '#4db88a',
  primaryLight: '#7dd1aa',
  primaryDark: '#2d9e6f',
  text: '#2d4a30',
  textSecondary: '#6b8c6b',
  textMuted: '#9bada0',
  border: '#c8e6d4',
  borderLight: '#e8f5ee',
  tabBar: '#faf8f3',
  header: '#f0faf5',
  urgent: '#ef4444',
  warning: '#f59e0b',
  shelf: '#d4a96a',
  shelfBorder: '#a07850',
  shelfSupport: '#a07850',
  inputBg: '#ffffff',
  chipBg: '#ffffff',
  chipActiveBg: '#4db88a',
  modalOverlay: 'rgba(0,0,0,0.4)',
};

export const darkTheme: ThemeColors = {
  background: '#111a14',
  surface: '#1c2b1f',
  surfaceSecondary: '#223028',
  surfaceTertiary: '#2a3a2f',
  primary: '#4db88a',
  primaryLight: '#7dd1aa',
  primaryDark: '#2d9e6f',
  text: '#d4ede0',
  textSecondary: '#7aab8a',
  textMuted: '#4d7060',
  border: '#2a4035',
  borderLight: '#1f3025',
  tabBar: '#141f17',
  header: '#1a2820',
  urgent: '#f87171',
  warning: '#fbbf24',
  shelf: '#7a5c2a',
  shelfBorder: '#5a4020',
  shelfSupport: '#5a4020',
  inputBg: '#1c2b1f',
  chipBg: '#1c2b1f',
  chipActiveBg: '#2d9e6f',
  modalOverlay: 'rgba(0,0,0,0.7)',
};
