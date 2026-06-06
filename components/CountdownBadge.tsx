// components/CountdownBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { wateringStatusColor, wateringStatusLabel } from '../utils/dateUtils';
import { useT } from '../hooks/useT';

interface Props {
  nextWateringDate: string;
  compact?: boolean;
}

export function CountdownBadge({ nextWateringDate, compact = false }: Props) {
  const { language } = useT();
  const color = wateringStatusColor(nextWateringDate);
  const label = wateringStatusLabel(nextWateringDate, language);

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: color + '1A', borderColor: color }]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: color + '0F', borderColor: color + '33' }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  compactBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
