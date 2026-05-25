// app/(tabs)/settings.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { useT } from '../../hooks/useT';
import { LANGUAGE_LABELS, Language } from '../../constants/i18n';

const LANGUAGES: Language[] = ['uk', 'en', 'de', 'ru'];

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const { t, language } = useT();
  const setTheme = useAppStore((s) => s.setTheme);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const theme = useAppStore((s) => s.theme);

  const s = makeStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Тема */}
      <Animated.View entering={FadeInDown.delay(0).springify()} style={s.section}>
        <Text style={s.sectionTitle}>{t('settings.theme')}</Text>
        <View style={s.card}>
          <TouchableOpacity
            style={[s.themeOption, theme === 'light' && s.themeOptionActive]}
            onPress={() => setTheme('light')}
            activeOpacity={0.8}
          >
            <View style={s.themeIconWrap}>
              <Ionicons name="sunny" size={26} color={theme === 'light' ? '#fff' : '#f59e0b'} />
            </View>
            <Text style={[s.themeLabel, theme === 'light' && s.themeLabelActive]}>
              {t('settings.themeLight')}
            </Text>
            {theme === 'light' && (
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 'auto' }} />
            )}
          </TouchableOpacity>

          <View style={s.divider} />

          <TouchableOpacity
            style={[s.themeOption, theme === 'dark' && s.themeOptionActiveDark]}
            onPress={() => setTheme('dark')}
            activeOpacity={0.8}
          >
            <View style={[s.themeIconWrap, { backgroundColor: theme === 'dark' ? '#4db88a33' : colors.surfaceSecondary }]}>
              <Ionicons name="moon" size={24} color={theme === 'dark' ? colors.primaryLight : colors.textMuted} />
            </View>
            <Text style={[s.themeLabel, theme === 'dark' && { color: colors.primaryLight }]}>
              {t('settings.themeDark')}
            </Text>
            {theme === 'dark' && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primaryLight} style={{ marginLeft: 'auto' }} />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Мова */}
      <Animated.View entering={FadeInDown.delay(80).springify()} style={s.section}>
        <Text style={s.sectionTitle}>{t('settings.language')}</Text>
        <View style={s.card}>
          {LANGUAGES.map((lang, index) => (
            <React.Fragment key={lang}>
              {index > 0 && <View style={s.divider} />}
              <TouchableOpacity
                style={s.langOption}
                onPress={() => setLanguage(lang)}
                activeOpacity={0.7}
              >
                <Text style={s.langLabel}>{LANGUAGE_LABELS[lang]}</Text>
                {language === lang && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
        <Text style={s.hint}>{t('settings.languageNote')}</Text>
      </Animated.View>

      {/* Про додаток */}
      <Animated.View entering={FadeInDown.delay(160).springify()} style={s.section}>
        <Text style={s.sectionTitle}>{t('settings.about')}</Text>
        <View style={s.card}>
          <View style={s.aboutRow}>
            <Text style={{ fontSize: 48 }}>🪴</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.aboutTitle}>PlantCare</Text>
              <Text style={s.aboutSub}>{t('settings.version')}</Text>
              <Text style={s.aboutSub}>{t('settings.madeWith')}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, gap: 24, paddingBottom: 48 },
    section: { gap: 10 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      paddingLeft: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    divider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 16 },

    // Theme
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
    },
    themeOptionActive: {
      backgroundColor: '#4db88a',
    },
    themeOptionActiveDark: {
      backgroundColor: colors.surfaceSecondary,
    },
    themeIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: '#f59e0b22',
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    themeLabelActive: { color: '#fff' },

    // Language
    langOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    langLabel: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    hint: {
      fontSize: 12,
      color: colors.textMuted,
      paddingLeft: 4,
    },

    // About
    aboutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 18,
    },
    aboutTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    aboutSub: {
      fontSize: 13,
      color: colors.textMuted,
    },
  });
}
