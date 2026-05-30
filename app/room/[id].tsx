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

export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  const room = useAppStore((s) => s.rooms.find((r) => r.id === id));
  const allPlants = useAppStore((s) => s.plants);
  const plants = allPlants.filter((p) => p.roomId === id);
  const deleteRoom = useAppStore((s) => s.deleteRoom);

  const handleDeleteRoom = () => {
    if (!room) return;
    Alert.alert(
      'Видалити кімнату?',
      plants.length > 0
        ? `У кімнаті «${room.name}» є ${plants.length} рослин. Вони також будуть видалені.`
        : `Видалити кімнату «${room.name}»?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
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

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `${room.emoji} ${room.name}`,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 8, marginRight: 8 }}>
              <TouchableOpacity
                onPress={() =>
                  router.push({ pathname: '/plant/add', params: { roomId: id } })
                }
                style={styles.headerBtn}
              >
                <Ionicons name="add" size={24} color="#4db88a" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteRoom} style={styles.headerBtn}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Фоновий декор стіни */}
      <View style={styles.wallBackground}>
        <View style={styles.wallStripe} />
        <View style={[styles.wallStripe, { top: 120 }]} />
      </View>

      {plants.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 64 }}>🪴</Text>
          <Text style={styles.emptyTitle}>Тут ще порожньо</Text>
          <Text style={styles.emptySubtitle}>
            Додай свою першу рослину в {room.name}!
          </Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              router.push({ pathname: '/plant/add', params: { roomId: id } })
            }
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Додати рослину</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.shelfContainer}
        >
          <Text style={styles.plantCount}>
            {plants.length} {plants.length === 1 ? 'рослина' : plants.length < 5 ? 'рослини' : 'рослин'}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0e8',
  },
  wallBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#ede8df',
  },
  wallStripe: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#d8d0c4',
  },
  headerBtn: {
    marginRight: 8,
    padding: 4,
  },
  shelfContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  plantCount: {
    fontSize: 13,
    color: '#9bada0',
    marginBottom: 16,
    paddingLeft: 4,
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
    fontWeight: '700',
    color: '#2d4a30',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9bada0',
    textAlign: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4db88a',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#2d9e6f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
