// hooks/useTheme.ts
import { useAppStore } from '../store/useAppStore';
import { lightTheme, darkTheme, ThemeColors } from '../constants/theme';

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';
  return { colors: isDark ? darkTheme : lightTheme, isDark };
}
