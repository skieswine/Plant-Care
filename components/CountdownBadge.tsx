// components/CountdownBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { wateringStatusColor, wateringStatusLabel } from '../utils/dateUtils';

interface Props {
  nextWateringDate: string;
  compact?: boolean;
}

export function CountdownBadge({ nextWateringDate, compact = false }: Props) {
  const color = wateringStatusColor(nextWateringDate);
  const label = wateringStatusLabel(nextWateringDate);

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: color + '22', borderColor: color }]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: color + '18', borderColor: color + '44' }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
