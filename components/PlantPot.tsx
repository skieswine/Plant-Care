// components/PlantPot.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Plant } from '../store/types';
import { getPlantDisplayName, useAppStore } from '../store/useAppStore';
import { CountdownBadge } from './CountdownBadge';
import { wateringStatusColor } from '../utils/dateUtils';
import { useTheme } from '../hooks/useTheme';

interface Props {
  plant: Plant;
  onPress: (plant: Plant) => void;
}

// 6 красивих сучасних варіантів кольорів для горщиків
const POT_COLORS = [
  { pot: '#E3CBB5', soil: '#604A3A', plant: '#10B981' },
  { pot: '#E8A382', soil: '#543628', plant: '#059669' },
  { pot: '#BACBB7', soil: '#475443', plant: '#34D399' },
  { pot: '#A2C2D6', soil: '#3A4D5C', plant: '#10B981' },
  { pot: '#EBDCB9', soil: '#5A4E38', plant: '#059669' },
  { pot: '#C6B2CE', soil: '#4F3F54', plant: '#34D399' },
];

function getColorForPlant(plantId: string) {
  const idx = plantId.charCodeAt(0) % POT_COLORS.length;
  return POT_COLORS[idx];
}

function PlantPotSVG({ colors, size }: { colors: typeof POT_COLORS[0]; size: number }) {
  const s = size;
  return (
    <View style={{ width: s, height: s * 1.2, alignItems: 'center' }}>
      {/* Рослина (листя) */}
      <View style={{
        width: s * 0.72,
        height: s * 0.58,
        backgroundColor: colors.plant + '22',
        borderRadius: s * 0.36,
        borderWidth: 1.5,
        borderColor: colors.plant,
        marginBottom: -s * 0.05,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ fontSize: s * 0.35, textAlign: 'center', lineHeight: s * 0.58 }}>🌿</Text>
      </View>
      {/* Горщик */}
      <View style={{
        width: s * 0.76,
        height: s * 0.46,
        backgroundColor: colors.pot,
        borderRadius: 5,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden',
      }}>
        {/* Земля */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: colors.soil,
        }} />
      </View>
    </View>
  );
}

export function PlantPot({ plant, onPress }: Props) {
  const colors = getColorForPlant(plant.id);
  const statusColor = wateringStatusColor(plant.nextWateringDate);
  const scale = useSharedValue(1);
  const { colors: themeColors } = useTheme();
  const language = useAppStore((s) => s.language);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withSpring(1, { damping: 8 })
    );
    onPress(plant);
  }, [plant, onPress]);

  const s = makeStyles(themeColors);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[s.container, animatedStyle]}>
        {/* Індикатор статусу поливу */}
        <View style={[s.statusDot, { backgroundColor: statusColor }]} />

        {/* Фото або ілюстрація вазона */}
        {plant.photoUri ? (
          <View style={s.photoContainer}>
            <Image
              source={{ uri: plant.photoUri }}
              style={s.photo}
              resizeMode="cover"
            />
          </View>
        ) : (
          <PlantPotSVG colors={colors} size={60} />
        )}

        {/* Назва */}
        <Text style={s.name} numberOfLines={1}>
          {getPlantDisplayName(plant, language)}
        </Text>

        {/* Бейдж таймера */}
        <CountdownBadge nextWateringDate={plant.nextWateringDate} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function makeStyles(themeColors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      width: 90,
      alignItems: 'center',
      padding: 6,
    },
    statusDot: {
      position: 'absolute',
      top: 4,
      right: 12,
      width: 11,
      height: 11,
      borderRadius: 5.5,
      borderWidth: 2,
      borderColor: themeColors.surface,
      zIndex: 10,
    },
    photoContainer: {
      width: 60,
      height: 72,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 6,
      borderWidth: 1.5,
      borderColor: themeColors.border,
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    name: {
      fontSize: 11,
      fontWeight: '700',
      color: themeColors.text,
      marginTop: 2,
      marginBottom: 4,
      textAlign: 'center',
      maxWidth: 80,
      letterSpacing: -0.1,
    },
  });
}
