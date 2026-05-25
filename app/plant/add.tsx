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
import { PLANT_SPECIES } from '../../constants/plantSpecies';
import { useTheme } from '../../hooks/useTheme';
import { useT } from '../../hooks/useT';

const POPULAR_SPECIES = PLANT_SPECIES;

export default function AddPlantScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const addPlant = useAppStore((s) => s.addPlant);
  const rooms = useAppStore((s) => s.rooms);
  const { scheduleForNewPlant } = useNotifications();
  const { colors } = useTheme();
  const { t } = useT();

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

  const WATERING_PRESETS = [
    { label: `7 ${t('plant.daysUnit')}`, days: 7 },
    { label: `14 ${t('plant.daysUnit')}`, days: 14 },
    { label: `30 ${t('plant.daysUnit')}`, days: 30 },
  ];

  const LIGHT_LEVELS: { value: LightLevel; label: string }[] = [
    { value: 'shade', label: t('plant.shade') },
    { value: 'partial', label: t('plant.partial') },
    { value: 'direct', label: t('plant.direct') },
  ];

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('plant.permissionTitle'), t('plant.permissionGallery'));
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
      Alert.alert(t('plant.permissionTitle'), t('plant.permissionCamera'));
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
        setPhotoUri(uri);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim() && !finalSpecies.trim()) {
      Alert.alert(t('plant.validationTitle'), t('plant.validation'));
      return;
    }
    if (!selectedRoomId) {
      Alert.alert(t('plant.validationTitle'), t('plant.validationRoom'));
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

    await scheduleForNewPlant(newPlant.id, newPlant.name || newPlant.species || 'Plant', newPlant.nextWateringDate);
    router.back();
  };

  const s = makeStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

      {/* Фото */}
      <View style={s.section}>
        <Text style={s.label}>{t('plant.photo')}</Text>
        <View style={s.photoRow}>
          {photoUri ? (
            <View style={s.photoPreview}>
              <Image source={{ uri: photoUri }} style={s.photo} />
              <TouchableOpacity style={s.removePhoto} onPress={() => setPhotoUri(undefined)}>
                <Ionicons name="close-circle" size={22} color={colors.urgent} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.photoPlaceholder}>
              <Text style={{ fontSize: 40 }}>🪴</Text>
            </View>
          )}
          <View style={s.photoButtons}>
            <TouchableOpacity style={s.photoBtn} onPress={handlePickPhoto}>
              <Ionicons name="images-outline" size={20} color={colors.primary} />
              <Text style={s.photoBtnText}>{t('plant.gallery')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.photoBtn} onPress={handleTakePhoto}>
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
              <Text style={s.photoBtnText}>{t('plant.camera')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Вид рослини */}
      <View style={s.section}>
        <Text style={s.label}>{t('plant.species')} <Text style={s.required}>{t('plant.speciesRequired')}</Text></Text>

        {!isCustomSpecies && (
          <TouchableOpacity style={s.speciesSelector} onPress={() => setShowSpeciesModal(true)}>
            <Ionicons name="leaf-outline" size={18} color={species ? colors.primary : colors.textMuted} />
            <Text style={[s.speciesSelectorText, species && s.speciesSelectorTextSelected]}>
              {species
                ? (POPULAR_SPECIES.find((sp) => sp.value === species)?.label ?? species)
                : t('plant.selectSpecies')}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {isCustomSpecies ? (
          <View style={s.customSpeciesRow}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder={t('plant.enterSpecies')}
              placeholderTextColor={colors.textMuted}
              value={customSpecies}
              onChangeText={setCustomSpecies}
              autoFocus
            />
            <TouchableOpacity
              style={s.backToListBtn}
              onPress={() => { setIsCustomSpecies(false); setCustomSpecies(''); }}
            >
              <Ionicons name="list-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={s.customSpeciesBtn}
            onPress={() => { setIsCustomSpecies(true); setSpecies(''); }}
          >
            <Ionicons name="create-outline" size={16} color={colors.primaryLight} />
            <Text style={s.customSpeciesBtnText}>{t('plant.customSpecies')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Назва (опціональна) */}
      <View style={s.section}>
        <Text style={s.label}>
          {t('plant.name')} <Text style={s.optional}>{t('plant.optional')}</Text>
        </Text>
        <TextInput
          style={s.input}
          placeholder={t('plant.namePlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          maxLength={50}
        />
        {!name && finalSpecies ? (
          <Text style={s.nameHint}>{t('plant.nameHint', { species: finalSpecies })}</Text>
        ) : null}
      </View>

      {/* Кімната */}
      <View style={s.section}>
        <Text style={s.label}>{t('plant.room')} <Text style={s.required}>{t('plant.speciesRequired')}</Text></Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.chipsRow}>
            {rooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={[s.chip, selectedRoomId === room.id && s.chipActive]}
                onPress={() => setSelectedRoomId(room.id)}
              >
                <Text style={s.chipEmoji}>{room.emoji}</Text>
                <Text style={[s.chipText, selectedRoomId === room.id && s.chipTextActive]}>
                  {room.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Інтервал поливу */}
      <View style={s.section}>
        <Text style={s.label}>{t('plant.wateringInterval')}</Text>
        <View style={s.chipsRow}>
          {WATERING_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.days}
              style={[s.chip, !isCustom && intervalDays === preset.days && s.chipActive]}
              onPress={() => { setIntervalDays(preset.days); setIsCustom(false); }}
            >
              <Ionicons name="water-outline" size={14} color={!isCustom && intervalDays === preset.days ? '#fff' : colors.primaryLight} />
              <Text style={[s.chipText, !isCustom && intervalDays === preset.days && s.chipTextActive]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[s.chip, isCustom && s.chipActive]}
            onPress={() => setIsCustom(true)}
          >
            <Ionicons name="create-outline" size={14} color={isCustom ? '#fff' : colors.primaryLight} />
            <Text style={[s.chipText, isCustom && s.chipTextActive]}>{t('plant.customDays')}</Text>
          </TouchableOpacity>
        </View>
        {isCustom && (
          <View style={s.customDaysRow}>
            <TextInput
              style={[s.input, s.customDaysInput]}
              placeholder="..."
              placeholderTextColor={colors.textMuted}
              value={customDays}
              onChangeText={setCustomDays}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={s.customDaysLabel}>{t('plant.daysUnit')}</Text>
          </View>
        )}
      </View>

      {/* Рівень освітленості */}
      <View style={s.section}>
        <Text style={s.label}>{t('plant.lightLevel')}</Text>
        <View style={s.chipsRow}>
          {LIGHT_LEVELS.map(({ value, label }) => (
            <TouchableOpacity
              key={value}
              style={[s.chip, s.lightChip, lightLevel === value && s.chipActive]}
              onPress={() => setLightLevel(value)}
            >
              <LightLevelIcon level={value} size={16} />
              <Text style={[s.chipText, lightLevel === value && s.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Кнопка збереження */}
      <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Ionicons name="leaf" size={20} color="#fff" />
        <Text style={s.saveBtnText}>{t('plant.addBtn')}</Text>
      </TouchableOpacity>

      {/* Modal вибору виду */}
      <Modal visible={showSpeciesModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{t('plant.speciesModalTitle')}</Text>
              <TouchableOpacity onPress={() => setShowSpeciesModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={POPULAR_SPECIES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.speciesItem, species === item.value && s.speciesItemActive]}
                  onPress={() => { setSpecies(item.value); setShowSpeciesModal(false); }}
                >
                  <Text style={s.speciesItemText}>{item.label}</Text>
                  {species === item.value && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={s.separator} />}
            />
            <TouchableOpacity
              style={s.customSpeciesModalBtn}
              onPress={() => { setShowSpeciesModal(false); setIsCustomSpecies(true); setSpecies(''); }}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
              <Text style={s.customSpeciesModalBtnText}>{t('plant.enterManually')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, gap: 24, paddingBottom: 40 },
    section: { gap: 10 },
    label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    optional: { color: colors.textMuted, fontWeight: '400', textTransform: 'none' },
    required: { color: colors.primary, fontWeight: '600', textTransform: 'none' },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    },
    nameHint: { fontSize: 12, color: colors.textMuted, paddingLeft: 4 },

    speciesSelector: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.inputBg, borderRadius: 14,
      borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: 16, paddingVertical: 14, gap: 10,
    },
    speciesSelectorText: { flex: 1, fontSize: 16, color: colors.textMuted },
    speciesSelectorTextSelected: { color: colors.text },
    customSpeciesRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    backToListBtn: {
      backgroundColor: colors.surfaceSecondary, borderRadius: 12,
      padding: 14, borderWidth: 1, borderColor: colors.border,
    },
    customSpeciesBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
    customSpeciesBtnText: { color: colors.primaryLight, fontSize: 13, fontWeight: '500' },

    photoRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
    photoPlaceholder: {
      width: 90, height: 90, borderRadius: 16,
      backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    },
    photoPreview: { position: 'relative' },
    photo: { width: 90, height: 90, borderRadius: 16 },
    removePhoto: { position: 'absolute', top: -8, right: -8 },
    photoButtons: { flex: 1, gap: 10 },
    photoBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: colors.surface, borderRadius: 12,
      paddingHorizontal: 14, paddingVertical: 10,
      borderWidth: 1, borderColor: colors.border,
    },
    photoBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },

    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 14, paddingVertical: 9,
      borderRadius: 12, backgroundColor: colors.surface,
      borderWidth: 1.5, borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    lightChip: { flex: 1, justifyContent: 'center' },
    chipEmoji: { fontSize: 16 },
    chipText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
    chipTextActive: { color: '#fff', fontWeight: '600' },

    customDaysRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
    customDaysInput: { flex: 1, textAlign: 'center' },
    customDaysLabel: { fontSize: 16, color: colors.textSecondary, fontWeight: '500' },

    saveBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 10, backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 16, marginTop: 8,
      shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    modalOverlay: { flex: 1, backgroundColor: colors.modalOverlay, justifyContent: 'flex-end' },
    modalContent: {
      backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingTop: 20, maxHeight: '75%',
    },
    modalHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingBottom: 16,
      borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    speciesItem: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: 14, paddingHorizontal: 20,
    },
    speciesItemActive: { backgroundColor: colors.surfaceSecondary },
    speciesItemText: { fontSize: 16, color: colors.text },
    separator: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 20 },
    customSpeciesModalBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8, paddingVertical: 16, margin: 16,
      borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
    },
    customSpeciesModalBtnText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  });
}
