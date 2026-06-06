// components/LightLevelIcon.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LightLevel } from '../store/types';
import { useT } from '../hooks/useT';

const CONFIG: Record<LightLevel, { icon: keyof typeof Ionicons.glyphMap; translationKey: string; color: string }> = {
  shade: {
    icon: 'moon-outline',
    translationKey: 'plant.shade',
    color: '#818CF8', // Soft indigo
  },
  partial: {
    icon: 'partly-sunny-outline',
    translationKey: 'plant.partial',
    color: '#FFB703', // Warm golden yellow
  },
  direct: {
    icon: 'sunny-outline',
    translationKey: 'plant.direct',
    color: '#FF9F1C', // Soft premium orange
  },
};

interface Props {
  level: LightLevel;
  showLabel?: boolean;
  size?: number;
}

export function LightLevelIcon({ level, showLabel = false, size = 18 }: Props) {
  const { t } = useT();
  const config = CONFIG[level];

  return (
    <View style={styles.container}>
      <Ionicons name={config.icon} size={size} color={config.color} />
      {showLabel && (
        <Text style={[styles.label, { color: config.color }]}>{t(config.translationKey)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
