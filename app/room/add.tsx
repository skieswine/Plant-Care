// app/room/add.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { useT } from '../../hooks/useT';

const ROOM_EMOJIS = [
  '🛋️', '🛏️', '🍳', '🪟', '🏠', '🌿',
  '📚', '🖥️', '🚿', '🪴', '🌸', '☀️',
  '🌙', '🌱', '🎋', '🌵', '🏡', '🌼',
  '🎨', '🎵', '🍀', '🌺',
];

export default function AddRoomScreen() {
  const router = useRouter();
  const addRoom = useAppStore((s) => s.addRoom);
  const { colors } = useTheme();
  const { t } = useT();

  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🛋️');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('plant.validationTitle'), t('room.nameRequired'));
      return;
    }
    addRoom(name.trim(), selectedEmoji);
    router.back();
  };

  const s = makeStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Превʼю */}
      <View style={s.preview}>
        <Text style={s.previewEmoji}>{selectedEmoji}</Text>
        <Text style={s.previewName}>{name || t('room.namePlaceholder')}</Text>
      </View>

      {/* Назва */}
      <View style={s.section}>
        <Text style={s.label}>{t('room.nameLabel')}</Text>
        <TextInput
          style={s.input}
          placeholder={t('room.inputPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          maxLength={30}
          autoFocus
        />
      </View>

      {/* Вибір emoji */}
      <View style={s.section}>
        <Text style={s.label}>{t('room.emojiLabel')}</Text>
        <View style={s.emojiGrid}>
          {ROOM_EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[s.emojiBtn, selectedEmoji === emoji && s.emojiBtnActive]}
              onPress={() => setSelectedEmoji(emoji)}
            >
              <Text style={s.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Кнопка збереження */}
      <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Ionicons name="checkmark-circle" size={22} color="#fff" />
        <Text style={s.saveBtnText}>{t('room.createBtn')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, gap: 24, paddingBottom: 40 },
    preview: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingVertical: 28,
      borderWidth: 1,
      borderColor: colors.borderLight,
      gap: 8,
    },
    previewEmoji: { fontSize: 52 },
    previewName: { fontSize: 20, fontWeight: '700', color: colors.text },
    section: { gap: 10 },
    label: {
      fontSize: 13, fontWeight: '600', color: colors.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.5,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: 14, borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 16, color: colors.text,
    },
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    emojiBtn: {
      width: 52, height: 52, borderRadius: 14,
      backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.borderLight,
    },
    emojiBtnActive: { borderColor: colors.primary, backgroundColor: colors.surfaceSecondary },
    emojiText: { fontSize: 26 },
    saveBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 10, backgroundColor: colors.primary, paddingVertical: 16,
      borderRadius: 16, marginTop: 8,
      shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  });
}
