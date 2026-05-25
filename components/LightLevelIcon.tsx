// components/LightLevelIcon.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LightLevel } from '../store/types';

const CONFIG: Record<LightLevel, { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }> = {
  shade: {
    icon: 'moon-outline',
    label: 'Тінь',
    color: '#6366f1',
  },
  partial: {
    icon: 'partly-sunny-outline',
    label: 'Напівтінь',
    color: '#f59e0b',
  },
  direct: {
    icon: 'sunny-outline',
    label: 'Пряме сонце',
    color: '#f97316',
  },
};

interface Props {
  level: LightLevel;
  showLabel?: boolean;
  size?: number;
}

export function LightLevelIcon({ level, showLabel = false, size = 20 }: Props) {
  const config = CONFIG[level];

  return (
    <View style={styles.container}>
      <Ionicons name={config.icon} size={size} color={config.color} />
      {showLabel && (
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
