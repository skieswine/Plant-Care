// components/PlantPot.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import type { ImageStyle, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Plant } from '../store/types';
import { getPlantDisplayName } from '../store/useAppStore';
import { CountdownBadge } from './CountdownBadge';
import { wateringStatusColor } from '../utils/dateUtils';

interface Props {
  plant: Plant;
  onPress: (plant: Plant) => void;
}

// 6 кольорових варіантів вазонів
const POT_COLORS = [
  { pot: '#c4a882', soil: '#7a5530', plant: '#4db88a' },
  { pot: '#d4836b', soil: '#8B4513', plant: '#3d7a4f' },
  { pot: '#9b8ea0', soil: '#6b5b6e', plant: '#7dd1aa' },
  { pot: '#b5c4a1', soil: '#7a6540', plant: '#2d9e6f' },
  { pot: '#e8c598', soil: '#a07850', plant: '#4db88a' },
  { pot: '#a8c5da', soil: '#5a7a8a', plant: '#3d7a4f' },
];

function getColorForPlant(plantId: string) {
  const idx = plantId.charCodeAt(0) % POT_COLORS.length;
  return POT_COLORS[idx];
}

function PlantPotSVG({ colors, size }: { colors: typeof POT_COLORS[0]; size: number }) {
  // Малюємо вазон за допомогою View (оскільки SVG не доступний напряму)
  const s = size;
  return (
    <View style={{ width: s, height: s * 1.2, alignItems: 'center' }}>
      {/* Рослина (листя) */}
      <View style={[styles.plantLeaves, { 
        width: s * 0.7, 
        height: s * 0.55,
        backgroundColor: colors.plant + '33',
        borderRadius: s * 0.35,
        borderWidth: 2,
        borderColor: colors.plant,
        marginBottom: -s * 0.05,
      }]}>
        <Text style={{ fontSize: s * 0.35, textAlign: 'center', lineHeight: s * 0.55 }}>🌿</Text>
      </View>
      {/* Горщик */}
      <View style={[styles.pot, {
        width: s * 0.75,
        height: s * 0.45,
        backgroundColor: colors.pot,
        borderRadius: 4,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
      }]}>
        {/* Земля */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          backgroundColor: colors.soil,
          borderRadius: 2,
        }} />
      </View>
    </View>
  );
}

export function PlantPot({ plant, onPress }: Props) {
  const colors = getColorForPlant(plant.id);
  const statusColor = wateringStatusColor(plant.nextWateringDate);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withSpring(1, { damping: 8 })
    );
    onPress(plant);
  }, [plant, onPress]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Індикатор статусу поливу */}
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />

        {/* Фото або ілюстрація вазона */}
        {plant.photoUri ? (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: plant.photoUri }}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        ) : (
          <PlantPotSVG colors={colors} size={60} />
        )}

        {/* Назва */}
        <Text style={styles.name} numberOfLines={1}>
          {getPlantDisplayName(plant)}
        </Text>

        {/* Бейдж таймера */}
        <CountdownBadge nextWateringDate={plant.nextWateringDate} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 90,
    alignItems: 'center',
    padding: 8,
  },
  statusDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#faf8f3',
  },
  photoContainer: {
    width: 60,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  plantLeaves: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pot: {
    overflow: 'hidden',
    alignItems: 'center',
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3d4a3e',
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'center',
    maxWidth: 80,
  },
});
