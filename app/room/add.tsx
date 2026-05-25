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

const ROOM_EMOJIS = [
  '🛋️', '🛏️', '🍳', '🪟', '🏠', '🌿',
  '📚', '🖥️', '🚿', '🪴', '🌸', '☀️',
  '🌙', '🌱', '🎋', '🌵',
];

export default function AddRoomScreen() {
  const router = useRouter();
  const addRoom = useAppStore((s) => s.addRoom);
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🛋️');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Увага', 'Введи назву кімнати');
      return;
    }
    addRoom(name.trim(), selectedEmoji);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Превью */}
      <View style={styles.preview}>
        <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
        <Text style={styles.previewName}>{name || 'Назва кімнати'}</Text>
      </View>

      {/* Назва */}
      <View style={styles.section}>
        <Text style={styles.label}>Назва кімнати</Text>
        <TextInput
          style={styles.input}
          placeholder="Наприклад: Вітальня, Балкон..."
          placeholderTextColor="#a8b8a8"
          value={name}
          onChangeText={setName}
          maxLength={30}
          autoFocus
        />
      </View>

      {/* Вибір emoji */}
      <View style={styles.section}>
        <Text style={styles.label}>Іконка</Text>
        <View style={styles.emojiGrid}>
          {ROOM_EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.emojiBtn,
                selectedEmoji === emoji && styles.emojiBtnActive,
              ]}
              onPress={() => setSelectedEmoji(emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Кнопка збереження */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Ionicons name="checkmark-circle" size={22} color="#fff" />
        <Text style={styles.saveBtnText}>Створити кімнату</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8f3' },
  content: { padding: 20, gap: 24 },
  preview: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: '#e8f5ee',
    gap: 8,
  },
  previewEmoji: { fontSize: 52 },
  previewName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d4a30',
  },
  section: { gap: 10 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b8c6b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c8e6d4',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2d4a30',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e8f5ee',
  },
  emojiBtnActive: {
    borderColor: '#4db88a',
    backgroundColor: '#f0faf5',
  },
  emojiText: { fontSize: 26 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4db88a',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#2d9e6f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
