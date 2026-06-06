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
import { getPlantSpecies } from '../../constants/plantSpecies';
import { useTheme } from '../../hooks/useTheme';
import { useT } from '../../hooks/useT';

const WATERING_PRESETS = [7, 14, 30];

export default function EditPlantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const plant = useAppStore((s) => s.plants.find((p) => p.id === id));
  const updatePlant = useAppStore((s) => s.updatePlant);
  const rooms = useAppStore((s) => s.rooms);
  const { colors } = useTheme();
  const { t, language } = useT();

  const POPULAR_SPECIES = getPlantSpecies(language);

  if (!plant) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>Рослину не знайдено</Text>
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
      const filename = `plant_${Date.now()}.jpg`;
      const dest = FileSystem.documentDirectory + filename;
      try {
        await FileSystem.copyAsync({ from: uri, to: dest });
        setPhotoUri(dest);
      } catch {
        setPhotoUri(uri);
      }
    }
  };

  const takePhoto = async () => {
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
      const filename = `plant_${Date.now()}.jpg`;
      const dest = FileSystem.documentDirectory + filename;
      try {
        await FileSystem.copyAsync({ from: uri, to: dest });
        setPhotoUri(dest);
      } catch {
        setPhotoUri(uri);
      }
    }
  };

  const handlePhotoOptions = () => {
    Alert.alert(t('plant.photoOptions'), t('plant.photoQuestion'), [
      { text: t('plant.gallery') + ' 🖼️', onPress: pickPhoto },
      { text: t('plant.camera') + ' 📷', onPress: takePhoto },
      photoUri ? { text: t('plant.removePhoto'), style: 'destructive', onPress: () => setPhotoUri(undefined) } : null,
      { text: t('plant.cancel'), style: 'cancel' },
    ].filter(Boolean) as any);
  };

  const handleSave = () => {
    if (!name.trim() && !finalSpecies.trim()) {
      Alert.alert(t('plant.validationTitle'), t('plant.validation'));
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

  const s = makeStyles(colors);

  const WATERING_PRESETS_DATA = [
    { label: `7 ${t('plant.daysUnit')}`, days: 7 },
    { label: `14 ${t('plant.daysUnit')}`, days: 14 },
    { label: `30 ${t('plant.daysUnit')}`, days: 30 },
  ];

  const LIGHT_LEVELS: { value: LightLevel; label: string }[] = [
    { value: 'shade', label: t('plant.shade') },
    { value: 'partial', label: t('plant.partial') },
    { value: 'direct', label: t('plant.direct') },
  ];

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen
        options={{
          title: `✏️ ${getPlantDisplayName(plant)}`,
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
        }}
      />

      {/* Фото */}
      <View style={s.photoSection}>
        <TouchableOpacity style={s.photoWrapper} onPress={handlePhotoOptions} activeOpacity={0.85}>
          {photoUri ? (
            <>
              <Image source={{ uri: photoUri }} style={s.photo} />
              <View style={s.photoOverlay}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={s.photoOverlayText}>{t('plant.changePhoto')}</Text>
              </View>
            </>
          ) : (
            <View style={s.photoPlaceholder}>
              <Ionicons name="camera-outline" size={36} color={colors.primaryLight} />
              <Text style={s.photoPlaceholderText}>{t('plant.addPhoto')}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Вид рослини */}
      <View style={s.section}>
        <Text style={s.label}>{t('plant.species')}</Text>
        {!isCustomSpecies && (
          <TouchableOpacity style={s.speciesSelector} onPress={() => setShowSpeciesModal(true)}>
            <Ionicons name="leaf-outline" size={18} color={species ? colors.primary : colors.textMuted} />
            <Text style={[s.speciesSelectorText, species && s.speciesSelectorTextSelected]}>
              {species
                ? (POPULAR_SPECIES.find((s) => s.value === species)?.label ?? species)
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

      {/* Назва */}
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
      </View>

      {/* Кімната */}
      <View style={s.section}>
        <Text style={s.label}>{t('plant.room')}</Text>
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
          {WATERING_PRESETS_DATA.map((preset) => (
            <TouchableOpacity
              key={preset.days}
              style={[s.chip, !isCustomInterval && intervalDays === preset.days && s.chipActive]}
              onPress={() => { setIntervalDays(preset.days); setIsCustomInterval(false); }}
            >
              <Ionicons name="water-outline" size={14} color={!isCustomInterval && intervalDays === preset.days ? '#fff' : colors.primaryLight} />
              <Text style={[s.chipText, !isCustomInterval && intervalDays === preset.days && s.chipTextActive]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[s.chip, isCustomInterval && s.chipActive]}
            onPress={() => setIsCustomInterval(true)}
          >
            <Ionicons name="create-outline" size={14} color={isCustomInterval ? '#fff' : colors.primaryLight} />
            <Text style={[s.chipText, isCustomInterval && s.chipTextActive]}>{t('plant.customDays')}</Text>
          </TouchableOpacity>
        </View>
        {isCustomInterval && (
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

      {/* Зимовий інтервал */}
      <View style={s.section}>
        <TouchableOpacity
          style={s.winterToggleBtn}
          onPress={() => setShowWinterSection(!showWinterSection)}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 18 }}>❄️</Text>
          <Text style={s.winterToggleBtnText}>
            {showWinterSection ? t('plant.winterIntervalLabel').split('(')[0].trim() : `+ ${t('plant.winterIntervalLabel')}`}
          </Text>
          <Ionicons name={showWinterSection ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primaryLight} />
        </TouchableOpacity>

        {showWinterSection && (
          <>
            <View style={s.chipsRow}>
              {WATERING_PRESETS.map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[s.chip, !isCustomWinter && winterInterval === days && s.chipWinterActive]}
                  onPress={() => { setWinterInterval(days); setIsCustomWinter(false); }}
                >
                  <Text style={[s.chipText, !isCustomWinter && winterInterval === days && s.chipTextActive]}>
                    {days} {t('plant.daysUnit')}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[s.chip, isCustomWinter && s.chipWinterActive]}
                onPress={() => setIsCustomWinter(true)}
              >
                <Text style={[s.chipText, isCustomWinter && s.chipTextActive]}>{t('plant.customDays')}</Text>
              </TouchableOpacity>
            </View>
            {isCustomWinter && (
              <View style={s.customDaysRow}>
                <TextInput
                  style={[s.input, s.customDaysInput]}
                  placeholder="..."
                  placeholderTextColor={colors.textMuted}
                  value={winterCustomDays}
                  onChangeText={setWinterCustomDays}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={s.customDaysLabel}>{t('plant.daysUnit')}</Text>
              </View>
            )}
          </>
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

      {/* Зберегти */}
      <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Ionicons name="checkmark-circle" size={20} color="#fff" />
        <Text style={s.saveBtnText}>{t('plant.saveBtn')}</Text>
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
    content: { paddingBottom: 40 },
    section: { gap: 10, paddingHorizontal: 20, paddingTop: 20 },
    label: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    optional: { color: colors.textMuted, fontWeight: '500', textTransform: 'none' },
    input: {
      backgroundColor: colors.inputBg, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text,
    },
    photoSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 8 },
    photoWrapper: { position: 'relative' },
    photo: { width: 140, height: 140, borderRadius: 28, borderWidth: 2, borderColor: colors.border },
    photoOverlay: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: 'rgba(0,0,0,0.45)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      paddingVertical: 8, alignItems: 'center', gap: 2,
    },
    photoOverlayText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    photoPlaceholder: {
      width: 140, height: 140, borderRadius: 28,
      backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', gap: 8,
    },
    photoPlaceholderText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
    speciesSelector: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg,
      borderRadius: 16, borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: 16, paddingVertical: 14, gap: 10,
    },
    speciesSelectorText: { flex: 1, fontSize: 16, color: colors.textMuted, fontWeight: '500' },
    speciesSelectorTextSelected: { color: colors.text },
    customSpeciesRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    backToListBtn: {
      backgroundColor: colors.surfaceSecondary, borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: colors.border,
    },
    customSpeciesBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
    customSpeciesBtnText: { color: colors.primaryLight, fontSize: 13, fontWeight: '600' },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14,
      backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    lightChip: { flex: 1, justifyContent: 'center' },
    chipEmoji: { fontSize: 16 },
    chipText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    chipTextActive: { color: '#fff', fontWeight: '800' },
    customDaysRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
    customDaysInput: { flex: 1, textAlign: 'center' },
    customDaysLabel: { fontSize: 16, color: colors.textSecondary, fontWeight: '600' },
    winterToggleBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingVertical: 10, paddingHorizontal: 14,
      borderRadius: 14, borderWidth: 1.5, borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    winterToggleBtnText: {
      flex: 1, fontSize: 14, fontWeight: '700', color: colors.primaryLight,
    },
    chipWinterActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
    saveBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 10, backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 18,
      marginHorizontal: 20, marginTop: 24,
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
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
    modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
    speciesItem: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: 14, paddingHorizontal: 20,
    },
    speciesItemActive: { backgroundColor: colors.surfaceSecondary },
    speciesItemText: { fontSize: 16, color: colors.text, fontWeight: '600' },
    separator: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 20 },
    customSpeciesModalBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8, paddingVertical: 16, margin: 16,
      borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
    },
    customSpeciesModalBtnText: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  });
}
