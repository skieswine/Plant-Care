// components/Shelf.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Plant } from '../store/types';
import { PlantPot } from './PlantPot';

interface Props {
  plants: Plant[];
  onPlantPress: (plant: Plant) => void;
}

// Розбиваємо рослини на "полиці" по 3 штуки
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function Shelf({ plants, onPlantPress }: Props) {
  const shelves = chunkArray(plants, 3);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {shelves.map((shelfPlants, shelfIndex) => (
        <View key={shelfIndex} style={styles.shelfWrapper}>
          {/* Полиця (дерев'яна дошка) */}
          <View style={styles.shelfBoard}>
            {/* Рослини на полиці */}
            <View style={styles.plantsRow}>
              {shelfPlants.map((plant) => (
                <PlantPot
                  key={plant.id}
                  plant={plant}
                  onPress={onPlantPress}
                />
              ))}
              {/* Порожні місця для вирівнювання */}
              {Array.from({ length: 3 - shelfPlants.length }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.emptySlot} />
              ))}
            </View>
          </View>
          {/* Підпірки полиці */}
          <View style={styles.shelfSupports}>
            <View style={styles.support} />
            <View style={styles.support} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
    gap: 24,
  },
  shelfWrapper: {
    alignItems: 'center',
  },
  plantsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 16,
    minHeight: 130,
  },
  shelfBoard: {
    width: '100%',
    backgroundColor: '#d4a96a',
    borderRadius: 8,
    shadowColor: '#7a5530',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderBottomWidth: 4,
    borderBottomColor: '#a07850',
  },
  shelfSupports: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginTop: -2,
  },
  support: {
    width: 16,
    height: 20,
    backgroundColor: '#a07850',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  emptySlot: {
    width: 90,
  },
});
