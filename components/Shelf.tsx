// components/Shelf.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Plant } from '../store/types';
import { PlantPot } from './PlantPot';
import { useTheme } from '../hooks/useTheme';

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
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {shelves.map((shelfPlants, shelfIndex) => (
        <View key={shelfIndex} style={s.shelfWrapper}>
          {/* Полиця (дерев'яна дошка) */}
          <View style={s.shelfBoard}>
            {/* Рослини на полиці */}
            <View style={s.plantsRow}>
              {shelfPlants.map((plant) => (
                <PlantPot
                  key={plant.id}
                  plant={plant}
                  onPress={onPlantPress}
                />
              ))}
              {/* Порожні місця для вирівнювання */}
              {Array.from({ length: 3 - shelfPlants.length }).map((_, i) => (
                <View key={`empty-${i}`} style={s.emptySlot} />
              ))}
            </View>
          </View>
          {/* Підпірки полиці */}
          <View style={s.shelfSupports}>
            <View style={s.support} />
            <View style={s.support} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
    gap: 28,
  },
});

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    shelfWrapper: {
      alignItems: 'center',
      marginTop: 8,
    },
    plantsRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      paddingHorizontal: 16,
      paddingBottom: 8,
      paddingTop: 16,
      minHeight: 120,
    },
    shelfBoard: {
      width: '100%',
      backgroundColor: colors.shelf,
      borderRadius: 12,
      shadowColor: colors.shelfBorder,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
      borderBottomWidth: 5,
      borderBottomColor: colors.shelfBorder,
    },
    shelfSupports: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '85%',
      marginTop: -2,
      paddingHorizontal: 10,
    },
    support: {
      width: 14,
      height: 18,
      backgroundColor: colors.shelfSupport,
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
    },
    emptySlot: {
      width: 90,
    },
  });
}
