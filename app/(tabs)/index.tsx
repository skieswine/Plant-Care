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

  const handlePlantPress = useCallback((plant: Plant) => setSelectedPlantId(plant.id), []);
  const handleCloseCard = useCallback(() => setSelectedPlantId(null), []);

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
        {/* Порожній результат */}
        {isFiltered && filteredPlantsByRoom.length === 0 && (
          <Animated.View entering={FadeIn} style={s.emptyFilter}>
            <Text style={{ fontSize: 48 }}>🔍</Text>
            <Text style={s.emptyFilterTitle}>{t('home.noResults')}</Text>
            <Text style={s.emptyFilterSub}>{t('home.noResultsSub')}</Text>
          </Animated.View>
        )}

        {/* Кімнати з рослинами */}
        {filteredPlantsByRoom.map(({ room, plants: roomPlants }, index) => {
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
                  {isFiltered && ` ${t('home.from')} ${plants.filter(p => p.roomId === room.id).length}`}
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
