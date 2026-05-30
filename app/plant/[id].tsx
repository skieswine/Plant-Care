// app/plant/[id].tsx
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
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useAppStore } from '../../store/useAppStore';
import { getPlantDisplayName } from '../../store/useAppStore';
import { LightLevel } from '../../store/types';
import { LightLevelIcon } from '../../components/LightLevelIcon';
import { PLANT_SPECIES } from '../../constants/plantSpecies';

const WATERING_PRESETS = [7, 14, 30];

const LIGHT_LEVELS: { value: LightLevel; label: string }[] = [
  { value: 'shade', label: 'Тінь' },
  { value: 'partial', label: 'Напівтінь' },
  { value: 'direct', label: 'Пряме сонце' },
];

const POPULAR_SPECIES = PLANT_SPECIES;

export default function EditPlantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const plant = useAppStore((s) => s.plants.find((p) => p.id === id));
  const updatePlant = useAppStore((s) => s.updatePlant);
  const rooms = useAppStore((s) => s.rooms);

  if (!plant) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Рослину не знайдено</Text>
      </View>
    );
  }

  const [name, setName] = useState(plant.name || '');
  const [species, setSpecies] = useState(
    POPULAR_SPECIES.some((s) => s.value === plant.species) ? (plant.species || '') : ''
  );
  const [customSpecies, setCustomSpecies] = useState(
    POPULAR_SPECIES.some((s) => s.value === plant.species) ? '' : (plant.species || '')
  );
  const [isCustomSpecies, setIsCustomSpecies] = useState(
    !!plant.species && !POPULAR_SPECIES.some((s) => s.value === plant.species)
  );
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>(plant.photoUri);
  const [intervalDays, setIntervalDays] = useState(
    WATERING_PRESETS.includes(plant.wateringIntervalDays) ? plant.wateringIntervalDays : 7
  );
  const [customDays, setCustomDays] = useState(
    !WATERING_PRESETS.includes(plant.wateringIntervalDays) ? String(plant.wateringIntervalDays) : ''
  );
  const [isCustomInterval, setIsCustomInterval] = useState(
    !WATERING_PRESETS.includes(plant.wateringIntervalDays)
  );

  const existingWinter = plant.winterWateringIntervalDays;
  const [showWinterSection, setShowWinterSection] = useState(!!existingWinter);
  const [winterInterval, setWinterInterval] = useState(existingWinter ? (WATERING_PRESETS.includes(existingWinter) ? existingWinter : 14) : 14);
  const [winterCustomDays, setWinterCustomDays] = useState(existingWinter && !WATERING_PRESETS.includes(existingWinter) ? String(existingWinter) : '');
  const [isCustomWinter, setIsCustomWinter] = useState(!!existingWinter && !WATERING_PRESETS.includes(existingWinter));
  const [lightLevel, setLightLevel] = useState<LightLevel>(plant.lightLevel);
  const [selectedRoomId, setSelectedRoomId] = useState(plant.roomId);

  const finalSpecies = isCustomSpecies ? customSpecies : species;

  const pickPhoto = async () => {
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
      const filename = `plant_${Date.now()}.jpg`;
      const dest = FileSystem.documentDirectory + filename;
      await FileSystem.copyAsync({ from: uri, to: dest });
      setPhotoUri(dest);
    }
  };

  const takePhoto = async () => {
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
      const filename = `plant_${Date.now()}.jpg`;
      const dest = FileSystem.documentDirectory + filename;
      await FileSystem.copyAsync({ from: uri, to: dest });
      setPhotoUri(dest);
    }
  };

  const handlePhotoOptions = () => {
    Alert.alert('Фото рослини', 'Як додати фото?', [
      { text: 'Галерея 🖼️', onPress: pickPhoto },
      { text: 'Камера 📷', onPress: takePhoto },
      photoUri ? { text: 'Видалити фото', style: 'destructive', onPress: () => setPhotoUri(undefined) } : null,
      { text: 'Скасувати', style: 'cancel' },
    ].filter(Boolean) as any);
  };

  const handleSave = () => {
    if (!name.trim() && !finalSpecies.trim()) {
      Alert.alert('Увага', 'Вкажи вид рослини або власну назву');
      return;
    }

    const finalDays = isCustomInterval ? parseInt(customDays, 10) || 7 : intervalDays;
    const finalWinterDays = showWinterSection
      ? (isCustomWinter ? (parseInt(winterCustomDays, 10) || undefined) : winterInterval)
      : undefined;

    updatePlant(plant.id, {
      name: name.trim() || undefined,
      species: finalSpecies.trim() || undefined,
      photoUri,
      roomId: selectedRoomId,
      summerWateringIntervalDays: finalDays,
      winterWateringIntervalDays: finalWinterDays,
      lightLevel,
    });

    router.back();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen
        options={{
          title: `✏️ ${getPlantDisplayName(plant)}`,
          headerStyle: { backgroundColor: '#f0faf5' },
          headerTintColor: '#2d4a30',
        }}
      />

      {/* Фото */}
      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.photoWrapper} onPress={handlePhotoOptions} activeOpacity={0.85}>
          {photoUri ? (
            <>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <View style={styles.photoOverlay}>
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.photoOverlayText}>Змінити</Text>
              </View>
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={36} color="#a8c8b4" />
              <Text style={styles.photoPlaceholderText}>Додати фото</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Вид рослини */}
      <View style={styles.section}>
        <Text style={styles.label}>Вид рослини</Text>
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

        {isCustomSpecies ? (
          <View style={styles.customSpeciesRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Введи вид вручну..."
              placeholderTextColor="#a8b8a8"
              value={customSpecies}
              onChangeText={setCustomSpecies}
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

      {/* Назва */}
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
      </View>

      {/* Кімната */}
      <View style={styles.section}>
        <Text style={styles.label}>Кімната</Text>
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
          {WATERING_PRESETS.map((days) => (
            <TouchableOpacity
              key={days}
              style={[styles.chip, !isCustomInterval && intervalDays === days && styles.chipActive]}
              onPress={() => { setIntervalDays(days); setIsCustomInterval(false); }}
            >
              <Ionicons name="water-outline" size={14} color={!isCustomInterval && intervalDays === days ? '#fff' : '#7dd1aa'} />
              <Text style={[styles.chipText, !isCustomInterval && intervalDays === days && styles.chipTextActive]}>
                {days} днів
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.chip, isCustomInterval && styles.chipActive]}
            onPress={() => setIsCustomInterval(true)}
          >
            <Ionicons name="create-outline" size={14} color={isCustomInterval ? '#fff' : '#7dd1aa'} />
            <Text style={[styles.chipText, isCustomInterval && styles.chipTextActive]}>Свій</Text>
          </TouchableOpacity>
        </View>
        {isCustomInterval && (
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

      {/* Зимовий інтервал */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.winterToggleBtn}
          onPress={() => setShowWinterSection(!showWinterSection)}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 16 }}>❄️</Text>
          <Text style={styles.winterToggleBtnText}>
            {showWinterSection ? 'Зимовий графік' : '+ Зимовий графік (необов\'язково)'}
          </Text>
          <Ionicons name={showWinterSection ? 'chevron-up' : 'chevron-down'} size={16} color="#7dd1aa" />
        </TouchableOpacity>

        {showWinterSection && (
          <>
            <View style={styles.chipsRow}>
              {WATERING_PRESETS.map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[styles.chip, !isCustomWinter && winterInterval === days && styles.chipWinterActive]}
                  onPress={() => { setWinterInterval(days); setIsCustomWinter(false); }}
                >
                  <Text style={[styles.chipText, !isCustomWinter && winterInterval === days && styles.chipTextActiveW]}>
                    {days} днів
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.chip, isCustomWinter && styles.chipWinterActive]}
                onPress={() => setIsCustomWinter(true)}
              >
                <Text style={[styles.chipText, isCustomWinter && styles.chipTextActiveW]}>Свій</Text>
              </TouchableOpacity>
            </View>
            {isCustomWinter && (
              <View style={styles.customDaysRow}>
                <TextInput
                  style={[styles.input, styles.customDaysInput]}
                  placeholder="Кількість днів"
                  placeholderTextColor="#a8b8a8"
                  value={winterCustomDays}
                  onChangeText={setWinterCustomDays}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.customDaysLabel}>днів</Text>
              </View>
            )}
          </>
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

      {/* Зберегти */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Ionicons name="checkmark-circle" size={20} color="#fff" />
        <Text style={styles.saveBtnText}>Зберегти зміни</Text>
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
  content: { paddingBottom: 40 },
  section: { gap: 10, paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b8c6b', textTransform: 'uppercase', letterSpacing: 0.5 },
  optional: { color: '#b0c8b0', fontWeight: '400', textTransform: 'none' },
  input: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#c8e6d4',
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#2d4a30',
  },

  // Photo
  photoSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 8 },
  photoWrapper: { position: 'relative' },
  photo: { width: 140, height: 140, borderRadius: 24, borderWidth: 3, borderColor: '#aee5c8' },
  photoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    paddingVertical: 8, alignItems: 'center', gap: 2,
  },
  photoOverlayText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  photoPlaceholder: {
    width: 140, height: 140, borderRadius: 24,
    backgroundColor: '#f0faf5', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#c8e6d4', borderStyle: 'dashed', gap: 8,
  },
  photoPlaceholderText: { color: '#a8c8b4', fontSize: 13 },

  // Species
  speciesSelector: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 1, borderColor: '#c8e6d4',
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
  },
  speciesSelectorText: { flex: 1, fontSize: 16, color: '#a8b8a8' },
  speciesSelectorTextSelected: { color: '#2d4a30' },
  customSpeciesRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  backToListBtn: {
    backgroundColor: '#f0faf5', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#c8e6d4',
  },
  customSpeciesBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  customSpeciesBtnText: { color: '#7dd1aa', fontSize: 13, fontWeight: '500' },

  // Chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#c8e6d4',
  },
  chipActive: { backgroundColor: '#4db88a', borderColor: '#4db88a' },
  lightChip: { flex: 1, justifyContent: 'center' },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: 14, fontWeight: '500', color: '#6b8c6b' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  customDaysRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  customDaysInput: { flex: 1, textAlign: 'center' },
  customDaysLabel: { fontSize: 16, color: '#6b8c6b', fontWeight: '500' },

  winterToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#c8e6d4',
    backgroundColor: '#fff',
  },
  winterToggleBtnText: {
    flex: 1, fontSize: 14, fontWeight: '600', color: '#7dd1aa',
  },
  chipWinterActive: { backgroundColor: '#60a5fa', borderColor: '#60a5fa' },
  chipTextActiveW: { color: '#fff', fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#4db88a', paddingVertical: 16, borderRadius: 16,
    marginHorizontal: 20, marginTop: 24,
    shadowColor: '#2d9e6f', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
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
    borderRadius: 14, borderWidth: 1.5, borderColor: '#c8e6d4', borderStyle: 'dashed',
  },
  customSpeciesModalBtnText: { color: '#4db88a', fontSize: 15, fontWeight: '600' },
});
