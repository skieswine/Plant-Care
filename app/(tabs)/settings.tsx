// app/(tabs)/settings.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { cancelAllNotifications } from '../../utils/notificationUtils';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const plants = useAppStore((s) => s.plants);
  const rooms = useAppStore((s) => s.rooms);

  const handleClearData = () => {
    Alert.alert(
      '⚠️ Видалити всі дані?',
      'Це видалить всі рослини, кімнати та нотатки. Дію неможливо скасувати.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити все',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            // Очищаємо AsyncStorage напряму
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.removeItem('plantcare-storage');
            Alert.alert('Готово', 'Дані видалено. Перезапусти додаток.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Статистика */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>📊 Статистика</Text>
        <View style={styles.statsRow}>
          <StatItem icon="leaf" value={plants.length} label="Рослин" color="#4db88a" />
          <StatItem icon="home" value={rooms.length} label="Кімнат" color="#c4a882" />
          <StatItem
            icon="water"
            value={plants.reduce((acc, p) => acc + p.wateringHistory.filter(r => !r.postponed).length, 0)}
            label="Поливів"
            color="#7dd1aa"
          />
        </View>
      </View>

      {/* Загальні налаштування */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Загальні</Text>

        <SettingRow
          icon="notifications-outline"
          label="Сповіщення"
          description="Дозвіл на push-сповіщення"
          onPress={() => Linking.openSettings()}
        />
        <SettingRow
          icon="information-circle-outline"
          label="Про додаток"
          description={`PlantCare v${Constants.expoConfig?.version || '1.0.0'}`}
          onPress={() => {}}
          chevron={false}
        />
      </View>

      {/* Небезпечна зона */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Небезпечна зона</Text>
        <TouchableOpacity style={styles.dangerRow} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <View style={{ flex: 1 }}>
            <Text style={styles.dangerLabel}>Видалити всі дані</Text>
            <Text style={styles.dangerDesc}>Рослини, кімнати, нотатки</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🌿 PlantCare — доглядай з любов'ю</Text>
      </View>
    </ScrollView>
  );
}

function StatItem({
  icon,
  value,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  description,
  onPress,
  chevron = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress: () => void;
  chevron?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color="#4db88a" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDesc}>{description}</Text>}
      </View>
      {chevron && <Ionicons name="chevron-forward" size={18} color="#c8d8c8" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8f3' },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d4a30',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2d4a30',
  },
  statLabel: {
    fontSize: 12,
    color: '#9bada0',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9bada0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0faf5',
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0faf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2d4a30',
  },
  settingDesc: {
    fontSize: 12,
    color: '#9bada0',
    marginTop: 1,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#fff0f0',
  },
  dangerLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ef4444',
  },
  dangerDesc: {
    fontSize: 12,
    color: '#f87171',
    marginTop: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#9bada0',
  },
});
