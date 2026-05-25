// app/plant/add.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useAppStore } from '../../store/useAppStore';
import { LightLevel } from '../../store/types';
import { LightLevelIcon } from '../../components/LightLevelIcon';
import { useNotifications } from '../../hooks/useNotifications';

const WATERING_PRESETS = [
  { label: '7 днів', days: 7 },
  { label: '14 днів', days: 14 },
  { label: '30 днів', days: 30 },
];

const LIGHT_LEVELS: { value: LightLevel; label: string }[] = [
  { value: 'shade', label: 'Тінь' },
  { value: 'partial', label: 'Напівтінь' },
  { value: 'direct', label: 'Пряме сонце' },
];

const POPULAR_SPECIES = [
  { label: '🌿 Монстера', value: 'Монстера' },
  { label: '🌳 Фікус', value: 'Фікус' },
  { label: '🌵 Кактус', value: 'Кактус' },
  { label: '🪨 Суккулент', value: 'Суккулент' },
  { label: '🌸 Орхідея', value: 'Орхідея' },
  { label: '🌿 Папороть', value: 'Папороть' },
  { label: '💚 Алое', value: 'Алое' },
  { label: '🍃 Потос', value: 'Потос' },
  { label: "🌱 Сансев'єра", value: "Сансев'єра" },
  { label: '🌴 Драцена', value: 'Драцена' },
  { label: '🕊️ Спатифілум', value: 'Спатифілум' },
  { label: '🌾 Хлорофітум', value: 'Хлорофітум' },
  { label: '🌺 Гібіскус', value: 'Гібіскус' },
  { label: '🍀 Фіалка', value: 'Фіалка' },
  { label: '🌻 Бегонія', value: 'Бегонія' },
];

export default function AddPlantScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const addPlant = useAppStore((s) => s.addPlant);
  const rooms = useAppStore((s) => s.rooms);
  const { scheduleForNewPlant } = useNotifications();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [customSpecies, setCustomSpecies] = useState('');
  const [isCustomSpecies, setIsCustomSpecies] = useState(false);
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [intervalDays, setIntervalDays] = useState(7);
  const [customDays, setCustomDays] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [lightLevel, setLightLevel] = useState<LightLevel>('partial');
  const [selectedRoomId, setSelectedRoomId] = useState(roomId || rooms[0]?.id || '');

  const finalSpecies = isCustomSpecies ? customSpecies : species;

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Дозвіл', 'Потрібен доступ до галереї');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images' as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      try {
        const filename = `plant_${Date.now()}.jpg`;
        const dest = FileSystem.documentDirectory + filename;
        await FileSystem.copyAsync({ from: uri, to: dest });
        setPhotoUri(dest);
      } catch {
        setPhotoUri(uri);
      }
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Дозвіл', 'Потрібен доступ до камери');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      try {
        const filename = `plant_${Date.now()}.jpg`;
        const dest = FileSystem.documentDirectory + filename;
        await FileSystem.copyAsync({ from: uri, to: dest });
        setPhotoUri(dest);
      } catch {
        // Якщо копіювання не вдалось — використовуємо оригінальний URI
        setPhotoUri(uri);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim() && !finalSpecies.trim()) {
      Alert.alert('Увага', 'Вкажи вид рослини або власну назву');
      return;
    }
    if (!selectedRoomId) {
      Alert.alert('Увага', 'Вибери кімнату');
      return;
    }

    const finalDays = isCustom ? parseInt(customDays, 10) || 7 : intervalDays;

    const newPlant = addPlant({
      name: name.trim() || undefined,
      species: finalSpecies.trim() || undefined,
      photoUri,
      roomId: selectedRoomId,
      wateringIntervalDays: finalDays,
      lightLevel,
    });

    await scheduleForNewPlant(newPlant.id, newPlant.name || newPlant.species || 'Рослина', newPlant.nextWateringDate);
    router.back();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Фото */}
      <View style={styles.section}>
        <Text style={styles.label}>Фото рослини</Text>
        <View style={styles.photoRow}>
          {photoUri ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotoUri(undefined)}>
                <Ionicons name="close-circle" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={{ fontSize: 40 }}>🪴</Text>
            </View>
          )}
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto}>
              <Ionicons name="images-outline" size={20} color="#4db88a" />
              <Text style={styles.photoBtnText}>Галерея</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
              <Ionicons name="camera-outline" size={20} color="#4db88a" />
              <Text style={styles.photoBtnText}>Камера</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Вид рослини */}
      <View style={styles.section}>
        <Text style={styles.label}>Вид рослини *</Text>

        {/* Кнопка відкрити дропдаун */}
        {!isCustomSpecies && (
          <TouchableOpacity style={styles.speciesSelector} onPress={() => setShowSpeciesModal(true)}>
            <Ionicons name="leaf-outline" size={18} color={species ? '#4db88a' : '#a8b8a8'} />
            <Text style={[styles.speciesSelectorText, species && styles.speciesSelectorTextSelected]}>
              {species
                ? (POPULAR_SPECIES.find((s) => s.value === species)?.label ?? species)
                : 'Вибрати вид...'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#a8b8a8" />
          </TouchableOpacity>
        )}

        {/* Або свій вид */}
        {isCustomSpecies ? (
          <View style={styles.customSpeciesRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Введи вид вручну..."
              placeholderTextColor="#a8b8a8"
              value={customSpecies}
              onChangeText={setCustomSpecies}
              autoFocus
            />
            <TouchableOpacity
              style={styles.backToListBtn}
              onPress={() => { setIsCustomSpecies(false); setCustomSpecies(''); }}
            >
              <Ionicons name="list-outline" size={20} color="#4db88a" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.customSpeciesBtn}
            onPress={() => { setIsCustomSpecies(true); setSpecies(''); }}
          >
            <Ionicons name="create-outline" size={16} color="#7dd1aa" />
            <Text style={styles.customSpeciesBtnText}>Ввести інший вид</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Назва (опціональна) */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Власна назва <Text style={styles.optional}>(необов'язково)</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder={`Наприклад: Моя улюблена ${finalSpecies || 'рослина'}...`}
          placeholderTextColor="#a8b8a8"
          value={name}
          onChangeText={setName}
          maxLength={50}
        />
        {!name && finalSpecies ? (
          <Text style={styles.nameHint}>Буде відображатись як «{finalSpecies}»</Text>
        ) : null}
      </View>

      {/* Кімната */}
      <View style={styles.section}>
        <Text style={styles.label}>Кімната *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipsRow}>
            {rooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={[styles.chip, selectedRoomId === room.id && styles.chipActive]}
                onPress={() => setSelectedRoomId(room.id)}
              >
                <Text style={styles.chipEmoji}>{room.emoji}</Text>
                <Text style={[styles.chipText, selectedRoomId === room.id && styles.chipTextActive]}>
                  {room.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Інтервал поливу */}
      <View style={styles.section}>
        <Text style={styles.label}>Інтервал поливу</Text>
        <View style={styles.chipsRow}>
          {WATERING_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.days}
              style={[styles.chip, !isCustom && intervalDays === preset.days && styles.chipActive]}
              onPress={() => { setIntervalDays(preset.days); setIsCustom(false); }}
            >
              <Ionicons name="water-outline" size={14} color={!isCustom && intervalDays === preset.days ? '#fff' : '#7dd1aa'} />
              <Text style={[styles.chipText, !isCustom && intervalDays === preset.days && styles.chipTextActive]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.chip, isCustom && styles.chipActive]}
            onPress={() => setIsCustom(true)}
          >
            <Ionicons name="create-outline" size={14} color={isCustom ? '#fff' : '#7dd1aa'} />
            <Text style={[styles.chipText, isCustom && styles.chipTextActive]}>Свій</Text>
          </TouchableOpacity>
        </View>
        {isCustom && (
          <View style={styles.customDaysRow}>
            <TextInput
              style={[styles.input, styles.customDaysInput]}
              placeholder="Кількість днів"
              placeholderTextColor="#a8b8a8"
              value={customDays}
              onChangeText={setCustomDays}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.customDaysLabel}>днів</Text>
          </View>
        )}
      </View>

      {/* Рівень освітленості */}
      <View style={styles.section}>
        <Text style={styles.label}>Рівень освітленості</Text>
        <View style={styles.chipsRow}>
          {LIGHT_LEVELS.map(({ value, label }) => (
            <TouchableOpacity
              key={value}
              style={[styles.chip, styles.lightChip, lightLevel === value && styles.chipActive]}
              onPress={() => setLightLevel(value)}
            >
              <LightLevelIcon level={value} size={16} />
              <Text style={[styles.chipText, lightLevel === value && styles.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Кнопка збереження */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Ionicons name="leaf" size={20} color="#fff" />
        <Text style={styles.saveBtnText}>Додати рослину 🌱</Text>
      </TouchableOpacity>

      {/* Modal вибору виду */}
      <Modal visible={showSpeciesModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Вибери вид рослини</Text>
              <TouchableOpacity onPress={() => setShowSpeciesModal(false)}>
                <Ionicons name="close" size={24} color="#2d4a30" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={POPULAR_SPECIES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.speciesItem, species === item.value && styles.speciesItemActive]}
                  onPress={() => { setSpecies(item.value); setShowSpeciesModal(false); }}
                >
                  <Text style={styles.speciesItemText}>{item.label}</Text>
                  {species === item.value && (
                    <Ionicons name="checkmark-circle" size={20} color="#4db88a" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <TouchableOpacity
              style={styles.customSpeciesModalBtn}
              onPress={() => { setShowSpeciesModal(false); setIsCustomSpecies(true); setSpecies(''); }}
            >
              <Ionicons name="create-outline" size={18} color="#4db88a" />
              <Text style={styles.customSpeciesModalBtnText}>Ввести вручну</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8f3' },
  content: { padding: 20, gap: 24, paddingBottom: 40 },
  section: { gap: 10 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b8c6b', textTransform: 'uppercase', letterSpacing: 0.5 },
  optional: { color: '#b0c8b0', fontWeight: '400', textTransform: 'none' },
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
  nameHint: { fontSize: 12, color: '#9bada0', paddingLeft: 4 },

  // Species selector
  speciesSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c8e6d4',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  speciesSelectorText: { flex: 1, fontSize: 16, color: '#a8b8a8' },
  speciesSelectorTextSelected: { color: '#2d4a30' },
  customSpeciesRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  backToListBtn: {
    backgroundColor: '#f0faf5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#c8e6d4',
  },
  customSpeciesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  customSpeciesBtnText: { color: '#7dd1aa', fontSize: 13, fontWeight: '500' },

  // Photo
  photoRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  photoPlaceholder: {
    width: 90, height: 90, borderRadius: 16,
    backgroundColor: '#f0faf5', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#c8e6d4', borderStyle: 'dashed',
  },
  photoPreview: { position: 'relative' },
  photo: { width: 90, height: 90, borderRadius: 16 },
  removePhoto: { position: 'absolute', top: -8, right: -8 },
  photoButtons: { flex: 1, gap: 10 },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#c8e6d4',
  },
  photoBtnText: { color: '#4db88a', fontSize: 14, fontWeight: '600' },

  // Chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#c8e6d4',
  },
  chipActive: { backgroundColor: '#4db88a', borderColor: '#4db88a' },
  lightChip: { flex: 1, justifyContent: 'center' },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: 14, fontWeight: '500', color: '#6b8c6b' },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  customDaysRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  customDaysInput: { flex: 1, textAlign: 'center' },
  customDaysLabel: { fontSize: 16, color: '#6b8c6b', fontWeight: '500' },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#4db88a', paddingVertical: 16, borderRadius: 16, marginTop: 8,
    shadowColor: '#2d9e6f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#faf8f3', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 20, maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#e8f5ee',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2d4a30' },
  speciesItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 20,
  },
  speciesItemActive: { backgroundColor: '#f0faf5' },
  speciesItemText: { fontSize: 16, color: '#2d4a30' },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 20 },
  customSpeciesModalBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, margin: 16,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#c8e6d4',
    borderStyle: 'dashed',
  },
  customSpeciesModalBtnText: { color: '#4db88a', fontSize: 15, fontWeight: '600' },
});
