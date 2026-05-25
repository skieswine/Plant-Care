// app/(tabs)/index.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAppStore } from '../../store/useAppStore';
import { Plant } from '../../store/types';
import { getPlantDisplayName } from '../../store/useAppStore';
import { PlantCard } from '../../components/PlantCard';
import { useNotifications } from '../../hooks/useNotifications';

// ──────────────────────────────────────────────
// Типи фільтрів
// ──────────────────────────────────────────────
type FrequencyFilter = 'all' | 'urgent' | '7' | '14' | '30';

// ──────────────────────────────────────────────
// Допоміжні функції
// ──────────────────────────────────────────────
function matchesFrequency(plant: Plant, filter: FrequencyFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'urgent') {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return new Date(plant.nextWateringDate) <= today;
  }
  if (filter === '7') return plant.wateringIntervalDays <= 7;
  if (filter === '14') return plant.wateringIntervalDays >= 8 && plant.wateringIntervalDays <= 14;
  if (filter === '30') return plant.wateringIntervalDays >= 15;
  return true;
}

export default function HomeScreen() {
  const router = useRouter();
  const rooms = useAppStore((s) => s.rooms);
  const plants = useAppStore((s) => s.plants);

  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [freqFilter, setFreqFilter] = useState<FrequencyFilter>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string | null>(null);

  useNotifications();

  // Термінові рослини для банера
  const urgentPlants = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return plants.filter((p) => new Date(p.nextWateringDate) <= today);
  }, [plants]);

  // Всі унікальні види (для фільтру по виду)
  const allSpecies = useMemo(() => {
    const set = new Set<string>();
    plants.forEach((p) => { if (p.species) set.add(p.species); });
    return Array.from(set).sort();
  }, [plants]);

  // Рослини після застосування фільтрів
  const filteredPlantsByRoom = useMemo(() => {
    return rooms.map((room) => {
      const roomPlants = plants.filter((p) => p.roomId === room.id);
      const filtered = roomPlants.filter((p) => {
        const freqMatch = matchesFrequency(p, freqFilter);
        const speciesMatch = speciesFilter ? p.species === speciesFilter : true;
        return freqMatch && speciesMatch;
      });
      return { room, plants: filtered, total: roomPlants.length };
    }).filter(({ plants }) => plants.length > 0);
  }, [rooms, plants, freqFilter, speciesFilter]);

  const handlePlantPress = useCallback((plant: Plant) => {
    setSelectedPlant(plant);
  }, []);

  const handleCloseCard = useCallback(() => {
    setSelectedPlant(null);
  }, []);

  const handleFreqFilter = (f: FrequencyFilter) => {
    setFreqFilter(f === freqFilter ? 'all' : f);
  };

  const handleSpeciesFilter = (s: string) => {
    setSpeciesFilter(s === speciesFilter ? null : s);
  };

  const isFiltered = freqFilter !== 'all' || speciesFilter !== null;

  const FREQ_FILTERS: { key: FrequencyFilter; label: string; icon: string }[] = [
    { key: 'urgent', label: 'Термінові 💧', icon: 'alert-circle-outline' },
    { key: '7',      label: '≤ 7 днів',    icon: 'water-outline' },
    { key: '14',     label: '≤ 14 днів',   icon: 'water-outline' },
    { key: '30',     label: '15+ днів',    icon: 'leaf-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Банер термінових поливів */}
      {urgentPlants.length > 0 && (
        <Animated.View entering={FadeIn} style={styles.urgentBanner}>
          <Ionicons name="water" size={18} color="#fff" />
          <Text style={styles.urgentText}>
            {urgentPlants.length === 1
              ? `${getPlantDisplayName(urgentPlants[0])} хоче пити! 💧`
              : `${urgentPlants.length} рослин потребують поливу! 💧`}
          </Text>
        </Animated.View>
      )}

      {/* Фільтри */}
      <View style={styles.filtersWrapper}>
        {/* Рядок 1: частота поливу */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, freqFilter === 'all' && !speciesFilter && styles.filterChipAll]}
            onPress={() => { setFreqFilter('all'); setSpeciesFilter(null); }}
          >
            <Text style={[styles.filterChipText, freqFilter === 'all' && !speciesFilter && styles.filterChipTextActive]}>
              🌿 Всі
            </Text>
          </TouchableOpacity>

          {FREQ_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, freqFilter === f.key && styles.filterChipActive]}
              onPress={() => handleFreqFilter(f.key)}
            >
              <Text style={[styles.filterChipText, freqFilter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Рядок 2: фільтр за видом (тільки якщо є хоча б один вид) */}
        {allSpecies.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {allSpecies.map((sp) => (
              <TouchableOpacity
                key={sp}
                style={[styles.filterChipSpecies, speciesFilter === sp && styles.filterChipSpeciesActive]}
                onPress={() => handleSpeciesFilter(sp)}
              >
                <Text style={[styles.filterChipSpeciesText, speciesFilter === sp && styles.filterChipTextActive]}>
                  🪴 {sp}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Результат фільтрів — порожньо */}
        {isFiltered && filteredPlantsByRoom.length === 0 && (
          <Animated.View entering={FadeIn} style={styles.emptyFilter}>
            <Text style={{ fontSize: 48 }}>🔍</Text>
            <Text style={styles.emptyFilterTitle}>Рослин не знайдено</Text>
            <Text style={styles.emptyFilterSub}>Спробуй інші фільтри</Text>
          </Animated.View>
        )}

        {/* Список кімнат (відфільтрованих) */}
        {filteredPlantsByRoom.map(({ room, plants: roomPlants }, index) => (
          <Animated.View
            key={room.id}
            entering={FadeInDown.delay(index * 80).springify()}
            style={styles.roomSection}
          >
            {/* Заголовок кімнати */}
            <View style={styles.roomHeader}>
              <Pressable
                style={styles.roomTitleRow}
                onPress={() => router.push(`/room/${room.id}`)}
              >
                <Text style={styles.roomEmoji}>{room.emoji}</Text>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomCount}>
                  {roomPlants.length} {roomPlants.length === 1 ? 'рослина' : 'рослин'}
                  {isFiltered && ` з ${plants.filter(p => p.roomId === room.id).length}`}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#9bada0" />
              </Pressable>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/plant/add', params: { roomId: room.id } })}
                style={styles.addPlantBtn}
              >
                <Ionicons name="add" size={20} color="#4db88a" />
              </TouchableOpacity>
            </View>

            {/* Прев'ю рослин (горизонтальний скрол) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.plantsScroll}
            >
              {roomPlants.map((plant) => (
                <TouchableOpacity
                  key={plant.id}
                  onPress={() => handlePlantPress(plant)}
                  style={styles.plantPreview}
                  activeOpacity={0.85}
                >
                  {plant.photoUri ? (
                    <Image source={{ uri: plant.photoUri }} style={styles.plantPreviewPhoto} />
                  ) : (
                    <Text style={{ fontSize: 36 }}>🪴</Text>
                  )}
                  <Text style={styles.plantPreviewName} numberOfLines={1}>
                    {getPlantDisplayName(plant)}
                  </Text>
                  {plant.species && plant.name && (
                    <Text style={styles.plantPreviewSpecies} numberOfLines={1}>
                      {plant.species}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        ))}

        {/* Якщо фільтр неактивний і кімнат немає взагалі — показуємо порожній стан */}
        {!isFiltered && rooms.map((room, index) => {
          const roomPlants = plants.filter((p) => p.roomId === room.id);
          if (roomPlants.length > 0) return null; // вже показано вище
          return (
            <Animated.View
              key={room.id}
              entering={FadeInDown.delay(index * 80).springify()}
              style={styles.roomSection}
            >
              <View style={styles.roomHeader}>
                <Pressable style={styles.roomTitleRow} onPress={() => router.push(`/room/${room.id}`)}>
                  <Text style={styles.roomEmoji}>{room.emoji}</Text>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomCount}>0 рослин</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9bada0" />
                </Pressable>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/plant/add', params: { roomId: room.id } })}
                  style={styles.addPlantBtn}
                >
                  <Ionicons name="add" size={20} color="#4db88a" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/plant/add', params: { roomId: room.id } })}
                style={styles.emptyRoom}
              >
                <Ionicons name="add-circle-outline" size={32} color="#c4e8d0" />
                <Text style={styles.emptyRoomText}>Додати першу рослину</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Кнопка додавання кімнати */}
        <TouchableOpacity
          style={styles.addRoomBtn}
          onPress={() => router.push('/room/add')}
          activeOpacity={0.8}
        >
          <Ionicons name="home-outline" size={20} color="#7dd1aa" />
          <Text style={styles.addRoomBtnText}>Додати кімнату</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Картка рослини */}
      {selectedPlant && (
        <PlantCard plant={selectedPlant} onClose={handleCloseCard} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8f3' },

  urgentBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#4db88a', paddingHorizontal: 20, paddingVertical: 12,
  },
  urgentText: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },

  // Filters
  filtersWrapper: { paddingTop: 12, gap: 6, borderBottomWidth: 1, borderBottomColor: '#f0ece5' },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#d8e8d8',
  },
  filterChipAll: { backgroundColor: '#e8f5ee', borderColor: '#4db88a' },
  filterChipActive: { backgroundColor: '#4db88a', borderColor: '#4db88a' },
  filterChipSpecies: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e0d4c8',
  },
  filterChipSpeciesActive: { backgroundColor: '#a07850', borderColor: '#a07850' },
  filterChipText: { fontSize: 13, fontWeight: '500', color: '#6b8c6b' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  filterChipSpeciesText: { fontSize: 13, fontWeight: '500', color: '#8c7060' },

  // Empty filter
  emptyFilter: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyFilterTitle: { fontSize: 18, fontWeight: '700', color: '#2d4a30' },
  emptyFilterSub: { fontSize: 14, color: '#9bada0' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 20, paddingBottom: 40 },

  roomSection: {
    backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
    shadowColor: '#7dd1aa', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
  },
  roomHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0faf5',
  },
  roomTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomEmoji: { fontSize: 20 },
  roomName: { fontSize: 16, fontWeight: '700', color: '#2d4a30', flex: 1 },
  roomCount: { fontSize: 12, color: '#9bada0' },
  addPlantBtn: { padding: 6, backgroundColor: '#f0faf5', borderRadius: 10 },

  plantsScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  plantPreview: { alignItems: 'center', width: 72 },
  plantPreviewPhoto: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginBottom: 2,
    borderWidth: 2,
    borderColor: '#c8e6d4',
  },
  plantPreviewName: {
    fontSize: 11, color: '#3d4a3e', fontWeight: '600',
    marginTop: 4, textAlign: 'center',
  },
  plantPreviewSpecies: {
    fontSize: 10, color: '#9bada0', fontWeight: '400',
    textAlign: 'center', marginTop: 1,
  },

  emptyRoom: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyRoomText: { color: '#a8c8b4', fontSize: 14 },

  addRoomBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, borderRadius: 16,
    borderWidth: 2, borderColor: '#c8e8d8', borderStyle: 'dashed',
  },
  addRoomBtnText: { color: '#7dd1aa', fontSize: 15, fontWeight: '600' },
});
