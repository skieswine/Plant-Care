// app/(tabs)/settings.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
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
  const plants = useAppStore((s) => s.plants);
  const rooms = useAppStore((s) => s.rooms);
  const season = useAppStore((s) => s.season);
  const restoreFromBackup = useAppStore((s) => s.restoreFromBackup);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const handleExport = async () => {
    const backup = JSON.stringify({ plants, rooms, season, exportedAt: new Date().toISOString() }, null, 2);
    try {
      const path = FileSystem.documentDirectory + 'plantcare_backup.json';
      await FileSystem.writeAsStringAsync(path, backup, { encoding: FileSystem.EncodingType.UTF8 });
      await Share.share({ url: path, message: backup, title: 'PlantCare Backup' });
    } catch {
      await Share.share({ message: backup, title: 'PlantCare Backup' });
    }
  };

  const handleImport = () => {
    const trimmed = importText.trim();
    if (!trimmed) return;
    try {
      const data = JSON.parse(trimmed);
      if (!Array.isArray(data.plants) || !Array.isArray(data.rooms)) {
        Alert.alert('', t('settings.importError'));
        return;
      }
      Alert.alert(t('settings.importConfirmTitle'), t('settings.importConfirmMsg'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.importBtn'),
          style: 'destructive',
          onPress: () => {
            restoreFromBackup({ plants: data.plants, rooms: data.rooms, season: data.season ?? 'summer' });
            setShowImportModal(false);
            setImportText('');
            Alert.alert('', t('settings.importSuccess'));
          },
        },
      ]);
    } catch {
      Alert.alert('', t('settings.importError'));
    }
  };

  const s = makeStyles(colors);

  return (
    <>
      <Modal visible={showImportModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.importModal}>
            <View style={s.importModalHeader}>
              <Text style={s.importModalTitle}>{t('settings.importData')}</Text>
              <TouchableOpacity onPress={() => { setShowImportModal(false); setImportText(''); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[s.importInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder={t('settings.importPaste')}
              placeholderTextColor={colors.textMuted}
              value={importText}
              onChangeText={setImportText}
              multiline
              autoFocus
            />
            <TouchableOpacity
              style={[s.importBtn, !importText.trim() && s.importBtnDisabled]}
              onPress={handleImport}
              disabled={!importText.trim()}
            >
              <Ionicons name="cloud-download-outline" size={18} color="#fff" />
              <Text style={s.importBtnText}>{t('settings.importBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              <View style={[s.themeIconWrap, { backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(255, 183, 3, 0.15)' }]}>
                <Ionicons name="sunny" size={24} color={theme === 'light' ? '#fff' : '#f59e0b'} />
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
              <View style={[s.themeIconWrap, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(52, 211, 153, 0.15)' }]}>
                <Ionicons name="moon" size={22} color={theme === 'dark' ? '#fff' : colors.primaryLight} />
              </View>
              <Text style={[s.themeLabel, theme === 'dark' && s.themeLabelActive]}>
                {t('settings.themeDark')}
              </Text>
              {theme === 'dark' && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 'auto' }} />
              )}
            </TouchableOpacity>

            <View style={s.divider} />

            <TouchableOpacity
              style={[s.themeOption, theme === 'nature' && s.themeOptionActiveNature]}
              onPress={() => setTheme('nature')}
              activeOpacity={0.8}
            >
              <View style={[s.themeIconWrap, { backgroundColor: theme === 'nature' ? 'rgba(255,255,255,0.2)' : 'rgba(37, 107, 71, 0.15)' }]}>
                <Ionicons name="leaf" size={22} color={theme === 'nature' ? '#fff' : '#256B47'} />
              </View>
              <Text style={[s.themeLabel, theme === 'nature' && s.themeLabelActive]}>
                {t('settings.themeNature')}
              </Text>
              {theme === 'nature' && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 'auto' }} />
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

        {/* Бекап */}
        <Animated.View entering={FadeInDown.delay(120).springify()} style={s.section}>
          <Text style={s.sectionTitle}>{t('settings.backupTitle')}</Text>
          <View style={s.card}>
            <TouchableOpacity style={s.backupOption} onPress={handleExport} activeOpacity={0.7}>
              <View style={[s.backupIconWrap, { backgroundColor: colors.primary + '1C' }]}>
                <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.backupLabel}>{t('settings.exportData')}</Text>
                <Text style={s.backupSub}>{t('settings.exportDataSub')}</Text>
              </View>
              <Ionicons name="share-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={s.divider} />

            <TouchableOpacity style={s.backupOption} onPress={() => setShowImportModal(true)} activeOpacity={0.7}>
              <View style={[s.backupIconWrap, { backgroundColor: '#3b82f620' }]}>
                <Ionicons name="cloud-download-outline" size={22} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.backupLabel}>{t('settings.importData')}</Text>
                <Text style={s.backupSub}>{t('settings.importDataSub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={s.hint}>{t('settings.backupNote')}</Text>
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
    </>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, gap: 24, paddingBottom: 48 },
    section: { gap: 10 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingLeft: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.02,
      shadowRadius: 10,
      elevation: 2,
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
      backgroundColor: colors.primary,
    },
    themeOptionActiveDark: {
      backgroundColor: colors.primaryDark,
    },
    themeOptionActiveNature: {
      backgroundColor: '#256B47',
    },
    themeIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeLabel: {
      fontSize: 15,
      fontWeight: '700',
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
      fontSize: 15,
      color: colors.text,
      fontWeight: '700',
    },
    hint: {
      fontSize: 12,
      color: colors.textMuted,
      paddingLeft: 4,
      fontWeight: '500',
    },

    // Backup
    backupOption: {
      flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
    },
    backupIconWrap: {
      width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    },
    backupLabel: {
      fontSize: 15, fontWeight: '700', color: colors.text,
    },
    backupSub: {
      fontSize: 12, color: colors.textMuted, marginTop: 2, fontWeight: '500',
    },

    // Import modal
    modalOverlay: {
      flex: 1, backgroundColor: colors.modalOverlay, justifyContent: 'flex-end',
    },
    importModal: {
      backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32,
      padding: 24, gap: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    importModalHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    importModalTitle: {
      fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.3,
    },
    importInput: {
      borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 13, minHeight: 140, textAlignVertical: 'top',
    },
    importBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 16,
    },
    importBtnDisabled: { opacity: 0.5 },
    importBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

    // About
    aboutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 18,
    },
    aboutTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    aboutSub: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '600',
    },
  });
}
