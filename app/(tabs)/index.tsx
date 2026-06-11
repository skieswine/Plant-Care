import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAppStore } from '../../store/useAppStore';
import { Plant, Room } from '../../store/types';
import { getPlantDisplayName } from '../../store/useAppStore';
import { PlantCard } from '../../components/PlantCard';
import { useNotifications } from '../../hooks/useNotifications';
import { useWatering } from '../../hooks/useWatering';
import { useTheme } from '../../hooks/useTheme';
import { useT } from '../../hooks/useT';

type FrequencyFilter = 'all' | 'urgent' | '7' | '14' | '30';

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
  const season = useAppStore((s) => s.season);
  const setSeason = useAppStore((s) => s.setSeason);
  const { colors } = useTheme();
  const { t } = useT();
  const deleteRoom = useAppStore((s) => s.deleteRoom);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [freqFilter, setFreqFilter] = useState<FrequencyFilter>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string | null>(null);

  useNotifications();
  const { handleWater } = useWatering();

  const urgentPlants = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return plants.filter((p) => new Date(p.nextWateringDate) <= today);
  }, [plants]);

  const allSpecies = useMemo(() => {
    const set = new Set<string>();
    plants.forEach((p) => { if (p.species) set.add(p.species); });
    return Array.from(set).sort();
  }, [plants]);

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

  // Плоский список усіх відфільтрованих рослин (без групування по кімнатах)
  const filteredPlantsFlat = useMemo(() => {
    return plants.filter((p) => {
      const freqMatch = matchesFrequency(p, freqFilter);
      const speciesMatch = speciesFilter ? p.species === speciesFilter : true;
      return freqMatch && speciesMatch;
    });
  }, [plants, freqFilter, speciesFilter]);

  const handlePlantPress = useCallback((plant: Plant) => setSelectedPlantId(plant.id), []);
  const handleCloseCard = useCallback(() => setSelectedPlantId(null), []);

  const handleQuickWater = useCallback((plantId: string) => {
    handleWater(plantId);
  }, [handleWater]);

  const handleDeleteRoom = useCallback((room: Room) => {
    const roomPlants = plants.filter((p) => p.roomId === room.id);
    Alert.alert(
      t('room.deleteTitle'),
      roomPlants.length > 0
        ? t('room.deleteWithPlants', { name: room.name, count: roomPlants.length })
        : t('room.deleteEmpty', { name: room.name }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => swipeableRefs.current.get(room.id)?.close(),
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteRoom(room.id),
        },
      ]
    );
  }, [plants, t, deleteRoom]);

  const isFiltered = freqFilter !== 'all' || speciesFilter !== null;

  const FREQ_FILTERS: { key: FrequencyFilter; label: string }[] = [
    { key: 'urgent', label: t('home.filterUrgent') },
    { key: '7',      label: t('home.filter7') },
    { key: '14',     label: t('home.filter14') },
    { key: '30',     label: t('home.filter30') },
  ];

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      {/* Банер термінових поливів */}
      {urgentPlants.length > 0 && (
        <Animated.View entering={FadeIn} style={s.urgentBanner}>
          <Ionicons name="water" size={18} color="#fff" />
          <Text style={s.urgentText}>
            {urgentPlants.length === 1
              ? t('home.urgentSingle', { name: getPlantDisplayName(urgentPlants[0]) })
              : t('home.urgentMultiple', { count: urgentPlants.length })}
          </Text>
        </Animated.View>
      )}

      {/* Сезон */}
      <View style={s.seasonBar}>
        <TouchableOpacity
          style={[s.seasonBtn, season === 'summer' && s.seasonBtnActive]}
          onPress={() => setSeason('summer')}
          activeOpacity={0.8}
        >
          <Text style={[s.seasonBtnText, season === 'summer' && s.seasonBtnTextActive]}>
            🌞 {t('home.seasonSummer')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.seasonBtn, season === 'winter' && s.seasonBtnWinterActive]}
          onPress={() => setSeason('winter')}
          activeOpacity={0.8}
        >
          <Text style={[s.seasonBtnText, season === 'winter' && s.seasonBtnTextActive]}>
            ❄️ {t('home.seasonWinter')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Фільтри */}
      <View style={s.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          <TouchableOpacity
            style={[s.filterChip, freqFilter === 'all' && !speciesFilter && s.filterChipActive]}
            onPress={() => { setFreqFilter('all'); setSpeciesFilter(null); }}
          >
            <Text style={[s.filterChipText, freqFilter === 'all' && !speciesFilter && s.filterChipTextActive]}>
              {t('home.filterAll')}
            </Text>
          </TouchableOpacity>
          {FREQ_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[s.filterChip, freqFilter === f.key && s.filterChipActive]}
              onPress={() => setFreqFilter(f.key === freqFilter ? 'all' : f.key)}
            >
              <Text style={[s.filterChipText, freqFilter === f.key && s.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {allSpecies.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
            {allSpecies.map((sp) => (
              <TouchableOpacity
                key={sp}
                style={[s.filterChipSpecies, speciesFilter === sp && s.filterChipSpeciesActive]}
                onPress={() => setSpeciesFilter(sp === speciesFilter ? null : sp)}
              >
                <Text style={[s.filterChipSpeciesText, speciesFilter === sp && s.filterChipTextActive]}>
                  🪴 {sp}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Порожній результат фільтра */}
        {isFiltered && filteredPlantsFlat.length === 0 && (
          <Animated.View entering={FadeIn} style={s.emptyFilter}>
            <Text style={{ fontSize: 48 }}>🔍</Text>
            <Text style={s.emptyFilterTitle}>{t('home.noResults')}</Text>
            <Text style={s.emptyFilterSub}>{t('home.noResultsSub')}</Text>
          </Animated.View>
        )}

        {/* Окремий блок відфільтрованих рослин (без групування по кімнатах) */}
        {isFiltered && filteredPlantsFlat.length > 0 && (
          <Animated.View entering={FadeIn} style={s.filteredBlock}>
            <View style={s.filteredHeader}>
              <Text style={s.filteredTitle}>
                {freqFilter === 'urgent' ? t('home.needWatering') : t('home.filterResults')}
              </Text>
              <View style={s.filteredCountBadge}>
                <Text style={s.filteredCountText}>{filteredPlantsFlat.length}</Text>
              </View>
            </View>
            <View style={s.filteredGrid}>
              {filteredPlantsFlat.map((plant) => {
                const room = rooms.find((r) => r.id === plant.roomId);
                return (
                  <Animated.View key={plant.id} entering={FadeIn} style={s.filteredPlant}>
                    <TouchableOpacity onPress={() => handlePlantPress(plant)} activeOpacity={0.85} style={s.filteredPlantInner}>
                      {plant.photoUri ? (
                        <Image source={{ uri: plant.photoUri }} style={s.filteredPlantPhoto} />
                      ) : (
                        <View style={s.filteredPlantEmoji}><Text style={{ fontSize: 32 }}>🪴</Text></View>
                      )}
                      <Text style={s.plantPreviewName} numberOfLines={1}>{getPlantDisplayName(plant)}</Text>
                      {room && (
                        <Text style={s.filteredPlantRoom} numberOfLines={1}>{room.emoji} {room.name}</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.quickWaterBtn}
                      onPress={() => handleQuickWater(plant.id)}
                      activeOpacity={0.8}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="water" size={16} color="#fff" />
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Кімнати з рослинами (тільки без активного фільтра) */}
        {!isFiltered && filteredPlantsByRoom.map(({ room, plants: roomPlants }, index) => {
          const renderRightActions = () => (
            <TouchableOpacity
              style={s.swipeDeleteBtn}
              onPress={() => handleDeleteRoom(room)}
              activeOpacity={0.85}
            >
              <Ionicons name="trash" size={24} color="#fff" />
              <Text style={s.swipeDeleteText}>{t('common.deleteRoom')}</Text>
            </TouchableOpacity>
          );

          return (
          <Swipeable
            key={room.id}
            ref={(ref) => {
              if (ref) swipeableRefs.current.set(room.id, ref);
              else swipeableRefs.current.delete(room.id);
            }}
            renderRightActions={renderRightActions}
            overshootRight={false}
            friction={2}
            rightThreshold={60}
            onSwipeableOpen={() => handleDeleteRoom(room)}
          >
          <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={s.roomSection}>
            <View style={s.roomHeader}>
              <Pressable style={s.roomTitleRow} onPress={() => router.push(`/room/${room.id}`)}>
                <Text style={s.roomEmoji}>{room.emoji}</Text>
                <Text style={s.roomName}>{room.name}</Text>
                <Text style={s.roomCount}>
                  {roomPlants.length} {roomPlants.length === 1 ? t('home.plant') : t('home.plants')}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/plant/add', params: { roomId: room.id } })}
                style={s.addPlantBtn}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.plantsScroll}>
              {roomPlants.map((plant) => (
                <TouchableOpacity key={plant.id} onPress={() => handlePlantPress(plant)} style={s.plantPreview} activeOpacity={0.85}>
                  {plant.photoUri ? (
                    <Image source={{ uri: plant.photoUri }} style={s.plantPreviewPhoto} />
                  ) : (
                    <Text style={{ fontSize: 36 }}>🪴</Text>
                  )}
                  <Text style={s.plantPreviewName} numberOfLines={1}>{getPlantDisplayName(plant)}</Text>
                  {plant.species && plant.name && (
                    <Text style={s.plantPreviewSpecies} numberOfLines={1}>{plant.species}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
          </Swipeable>
          );
        })}

        {/* Кімнати без рослин (якщо фільтр не активний) */}
        {!isFiltered && rooms.map((room, index) => {
          const roomPlants = plants.filter((p) => p.roomId === room.id);
          if (roomPlants.length > 0) return null;
          const renderRightActionsEmpty = () => (
            <TouchableOpacity
              style={s.swipeDeleteBtn}
              onPress={() => handleDeleteRoom(room)}
              activeOpacity={0.85}
            >
              <Ionicons name="trash" size={24} color="#fff" />
              <Text style={s.swipeDeleteText}>{t('common.deleteRoom')}</Text>
            </TouchableOpacity>
          );
          return (
            <Swipeable
              key={room.id}
              ref={(ref) => {
                if (ref) swipeableRefs.current.set(room.id, ref);
                else swipeableRefs.current.delete(room.id);
              }}
              renderRightActions={renderRightActionsEmpty}
              overshootRight={false}
              friction={2}
              rightThreshold={60}
              onSwipeableOpen={() => handleDeleteRoom(room)}
            >
            <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={s.roomSection}>
              <View style={s.roomHeader}>
                <Pressable style={s.roomTitleRow} onPress={() => router.push(`/room/${room.id}`)}>
                  <Text style={s.roomEmoji}>{room.emoji}</Text>
                  <Text style={s.roomName}>{room.name}</Text>
                  <Text style={s.roomCount}>0 {t('home.plants')}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/plant/add', params: { roomId: room.id } })}
                  style={s.addPlantBtn}
                >
                  <Ionicons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/plant/add', params: { roomId: room.id } })}
                style={s.emptyRoom}
              >
                <Ionicons name="add-circle-outline" size={32} color={colors.border} />
                <Text style={s.emptyRoomText}>{t('home.addFirstPlant')}</Text>
              </TouchableOpacity>
            </Animated.View>
            </Swipeable>
          );
        })}

        <TouchableOpacity style={s.addRoomBtn} onPress={() => router.push('/room/add')} activeOpacity={0.8}>
          <Ionicons name="home-outline" size={20} color={colors.primaryLight} />
          <Text style={s.addRoomBtnText}>{t('home.addRoom')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {selectedPlantId && <PlantCard plantId={selectedPlantId} onClose={handleCloseCard} />}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    seasonBar: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    seasonBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: colors.chipBg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    seasonBtnActive: {
      backgroundColor: colors.warning,
      borderColor: colors.warning,
    },
    seasonBtnWinterActive: {
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
    },
    seasonBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    seasonBtnTextActive: {
      color: '#fff',
    },
    urgentBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: colors.urgent, paddingHorizontal: 16, paddingVertical: 12,
      marginHorizontal: 16, marginTop: 12, borderRadius: 16,
      shadowColor: colors.urgent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
    },
    urgentText: { color: '#fff', fontSize: 13, fontWeight: '700', flex: 1 },
    filtersWrapper: { paddingTop: 14, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
    filterChip: {
      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
      backgroundColor: colors.chipBg, borderWidth: 1, borderColor: colors.border,
    },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterChipSpecies: {
      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
      backgroundColor: colors.chipBg, borderWidth: 1, borderColor: colors.border,
    },
    filterChipSpeciesActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
    filterChipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    filterChipTextActive: { color: '#fff', fontWeight: '800' },
    filterChipSpeciesText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    emptyFilter: { alignItems: 'center', paddingVertical: 48, gap: 10 },
    emptyFilterTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
    emptyFilterSub: { fontSize: 14, color: colors.textMuted },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, gap: 16, paddingBottom: 40 },
    roomSection: {
      backgroundColor: colors.surface, borderRadius: 24, overflow: 'hidden',
      shadowColor: colors.text, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.03, shadowRadius: 12, elevation: 4,
      borderWidth: 1, borderColor: colors.borderLight,
      marginBottom: 8,
    },
    roomHeader: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 18, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    },
    roomTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    roomEmoji: { fontSize: 22 },
    roomName: { fontSize: 17, fontWeight: '800', color: colors.text, flex: 1, letterSpacing: -0.3 },
    roomCount: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginRight: 4 },
    addPlantBtn: { padding: 6, backgroundColor: colors.surfaceSecondary, borderRadius: 12 },
    plantsScroll: { paddingHorizontal: 18, paddingVertical: 14, gap: 14 },
    plantPreview: { alignItems: 'center', width: 78, gap: 4 },
    plantPreviewPhoto: {
      width: 56, height: 56, borderRadius: 16,
      borderWidth: 2, borderColor: colors.border,
    },
    plantPreviewName: {
      fontSize: 11, color: colors.text, fontWeight: '700',
      textAlign: 'center', width: '100%',
    },
    plantPreviewSpecies: {
      fontSize: 9, color: colors.textMuted, fontWeight: '500', textAlign: 'center', width: '100%',
    },

    // Окремий блок відфільтрованих рослин
    filteredBlock: {
      backgroundColor: colors.surface, borderRadius: 24, overflow: 'hidden',
      shadowColor: colors.text, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.03, shadowRadius: 12, elevation: 4,
      borderWidth: 1, borderColor: colors.borderLight,
      marginBottom: 8,
    },
    filteredHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingHorizontal: 18, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    },
    filteredTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
    filteredCountBadge: {
      minWidth: 26, height: 26, borderRadius: 13, paddingHorizontal: 8,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    },
    filteredCountText: { color: '#fff', fontSize: 13, fontWeight: '800' },
    filteredGrid: {
      flexDirection: 'row', flexWrap: 'wrap',
      paddingHorizontal: 14, paddingVertical: 16, gap: 8,
    },
    filteredPlant: { width: 82, alignItems: 'center', position: 'relative' },
    filteredPlantInner: { alignItems: 'center', gap: 4, width: '100%' },
    filteredPlantPhoto: {
      width: 60, height: 60, borderRadius: 18,
      borderWidth: 2, borderColor: colors.border,
    },
    filteredPlantEmoji: {
      width: 60, height: 60, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 2, borderColor: colors.border,
    },
    filteredPlantRoom: { fontSize: 9, color: colors.textMuted, fontWeight: '600', textAlign: 'center', width: '100%' },
    quickWaterBtn: {
      position: 'absolute', top: -4, right: 6,
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.surface,
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
    },

    emptyRoom: { alignItems: 'center', paddingVertical: 28, gap: 8 },
    emptyRoomText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
    addRoomBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 10, paddingVertical: 16, borderRadius: 20,
      borderWidth: 2, borderColor: colors.primaryLight, borderStyle: 'dashed',
      marginTop: 8,
    },
    addRoomBtnText: { color: colors.primaryLight, fontSize: 15, fontWeight: '700' },
    swipeDeleteBtn: {
      backgroundColor: colors.urgent,
      justifyContent: 'center',
      alignItems: 'center',
      width: 90,
      borderRadius: 24,
      marginLeft: 8,
      gap: 4,
      marginBottom: 8,
    },
    swipeDeleteText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '800',
      textAlign: 'center',
    },
  });
}
