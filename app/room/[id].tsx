import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { Plant } from '../../store/types';
import { Shelf } from '../../components/Shelf';
import { PlantCard } from '../../components/PlantCard';
import { useTheme } from '../../hooks/useTheme';
import { useT } from '../../hooks/useT';

export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const { colors, isDark } = useTheme();
  const { t } = useT();

  const room = useAppStore((s) => s.rooms.find((r) => r.id === id));
  const allPlants = useAppStore((s) => s.plants);
  const plants = allPlants.filter((p) => p.roomId === id);
  const deleteRoom = useAppStore((s) => s.deleteRoom);

  const handleDeleteRoom = () => {
    if (!room) return;
    Alert.alert(
      t('room.deleteTitle'),
      plants.length > 0
        ? t('room.deleteWithPlants', { name: room.name, count: plants.length })
        : t('room.deleteEmpty', { name: room.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => { deleteRoom(id); router.back(); },
        },
      ]
    );
  };

  const handlePlantPress = useCallback((plant: Plant) => {
    setSelectedPlantId(plant.id);
  }, []);

  const handleCloseCard = useCallback(() => {
    setSelectedPlantId(null);
  }, []);

  if (!room) return null;

  const s = makeStyles(colors, isDark);

  return (
    <View style={s.container}>
      <Stack.Screen
        options={{
          title: `${room.emoji} ${room.name}`,
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 10, marginRight: 8 }}>
              <TouchableOpacity
                onPress={() =>
                  router.push({ pathname: '/plant/add', params: { roomId: id } })
                }
                style={s.headerBtn}
              >
                <Ionicons name="add" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteRoom} style={s.headerBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.urgent} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Фоновий декор стіни */}
      <View style={s.wallBackground}>
        <View style={s.wallStripe} />
        <View style={[s.wallStripe, { top: 120 }]} />
      </View>

      {plants.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={{ fontSize: 64 }}>🪴</Text>
          <Text style={s.emptyTitle}>{t('room.empty')}</Text>
          <Text style={s.emptySubtitle}>
            {t('room.emptySub').replace('!', '')} {room.name}!
          </Text>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() =>
              router.push({ pathname: '/plant/add', params: { roomId: id } })
            }
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={s.addBtnText}>{t('room.addPlant')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.shelfContainer}
        >
          <Text style={s.plantCount}>
            {plants.length} {plants.length === 1 ? t('home.plant') : t('home.plants')}
          </Text>
          <Shelf plants={plants} onPlantPress={handlePlantPress} />
        </ScrollView>
      )}

      {/* Картка рослини */}
      {selectedPlantId && (
        <PlantCard plantId={selectedPlantId} onClose={handleCloseCard} />
      )}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0A0F0B' : '#F5F0E8', // Organic wood/slate wallpaper backing
    },
    wallBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 200,
      backgroundColor: isDark ? '#111713' : '#EDE8DF',
    },
    wallStripe: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: isDark ? '#202D25' : '#D8D0C4',
    },
    headerBtn: {
      marginRight: 4,
      padding: 6,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 10,
    },
    shelfContainer: {
      padding: 16,
      paddingTop: 12,
      paddingBottom: 40,
    },
    plantCount: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 16,
      paddingLeft: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.4,
    },
    emptySubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 18,
      marginTop: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    addBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
    },
  });
}
