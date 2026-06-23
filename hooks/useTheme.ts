// hooks/useTheme.ts
import { useAppStore } from '../store/useAppStore';
import { lightTheme, darkTheme, natureTheme, ThemeColors } from '../constants/theme';

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';
  const colors = theme === 'dark' ? darkTheme : theme === 'nature' ? natureTheme : lightTheme;
  return { colors, isDark };
}
