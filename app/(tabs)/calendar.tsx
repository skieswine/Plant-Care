// app/(tabs)/calendar.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { getPlantDisplayName } from '../../store/useAppStore';
import { CountdownBadge } from '../../components/CountdownBadge';

// Українська локаль для календаря
LocaleConfig.locales['uk'] = {
  monthNames: [
    'Січень','Лютий','Березень','Квітень','Травень','Червень',
    'Липень','Серпень','Вересень','Жовтень','Листопад','Грудень',
  ],
  monthNamesShort: [
    'Січ','Лют','Бер','Кві','Тра','Чер',
    'Лип','Сер','Вер','Жов','Лис','Гру',
  ],
  dayNames: ['Неділя','Понеділок','Вівторок','Середа','Четвер','П\'ятниця','Субота'],
  dayNamesShort: ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'],
  today: 'Сьогодні',
};
LocaleConfig.defaultLocale = 'uk';

export default function CalendarScreen() {
  const plants = useAppStore((s) => s.plants);
  const getWateringEvents = useAppStore((s) => s.getWateringEventsForCalendar);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const markedDates = useMemo(() => {
    const events = getWateringEvents();
    const result: Record<string, any> = {};

    Object.entries(events).forEach(([date, data]) => {
      result[date] = {
        ...data,
        marked: true,
      };
    });

    // Виділяємо вибраний день
    result[selectedDate] = {
      ...(result[selectedDate] || {}),
      selected: true,
      selectedColor: '#4db88a',
    };

    return result;
  }, [getWateringEvents, selectedDate]);

  // Рослини, що потрібно полити у вибрану дату
  const plantsForDate = useMemo(() => {
    return plants.filter((p) => {
      const nextDate = format(new Date(p.nextWateringDate), 'yyyy-MM-dd');
      return nextDate === selectedDate;
    });
  }, [plants, selectedDate]);

  // Рослини, що вже полили у вибрану дату
  const wateredOnDate = useMemo(() => {
    return plants.filter((p) =>
      p.wateringHistory.some(
        (r) => !r.postponed && format(new Date(r.date), 'yyyy-MM-dd') === selectedDate
      )
    );
  }, [plants, selectedDate]);

  // Термінові поливи (сьогодні та прострочені)
  const urgentPlants = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return plants.filter((p) => new Date(p.nextWateringDate) <= today);
  }, [plants]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Термінові сьогодні */}
      {urgentPlants.length > 0 && (
        <View style={styles.urgentSection}>
          <View style={styles.urgentHeader}>
            <Ionicons name="alert-circle" size={18} color="#ef4444" />
            <Text style={styles.urgentTitle}>Потребують поливу!</Text>
          </View>
          {urgentPlants.map((plant) => (
            <View key={plant.id} style={styles.urgentItem}>
              <Text style={{ fontSize: 20 }}>🌿</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.plantName}>{getPlantDisplayName(plant)}</Text>
              </View>
              <CountdownBadge nextWateringDate={plant.nextWateringDate} />
            </View>
          ))}
        </View>
      )}

      {/* Календар */}
      <View style={styles.calendarWrapper}>
        <Calendar
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            backgroundColor: '#faf8f3',
            calendarBackground: '#fff',
            textSectionTitleColor: '#9bada0',
            selectedDayBackgroundColor: '#4db88a',
            selectedDayTextColor: '#fff',
            todayTextColor: '#4db88a',
            dayTextColor: '#2d4a30',
            textDisabledColor: '#c8d8c8',
            dotColor: '#4db88a',
            selectedDotColor: '#fff',
            arrowColor: '#4db88a',
            monthTextColor: '#2d4a30',
            indicatorColor: '#4db88a',
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
        />
      </View>

      {/* Деталі вибраного дня */}
      <View style={styles.dayDetails}>
        <Text style={styles.dayTitle}>
          {format(new Date(selectedDate), "d MMMM yyyy", { locale: uk })}
        </Text>

        {plantsForDate.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>💧 Полити:</Text>
            {plantsForDate.map((plant) => (
              <View key={plant.id} style={styles.detailItem}>
                <Ionicons name="water-outline" size={16} color="#7dd1aa" />
                <Text style={styles.detailPlantName}>{getPlantDisplayName(plant)}</Text>
              </View>
            ))}
          </View>
        )}

        {wateredOnDate.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>✅ Вже полили:</Text>
            {wateredOnDate.map((plant) => (
              <View key={plant.id} style={styles.detailItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#4db88a" />
                <Text style={styles.detailPlantName}>{getPlantDisplayName(plant)}</Text>
              </View>
            ))}
          </View>
        )}

        {plantsForDate.length === 0 && wateredOnDate.length === 0 && (
          <Text style={styles.emptyDay}>Жодних поливів цього дня 🌱</Text>
        )}
      </View>

      {/* Легенда */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Позначення:</Text>
        <View style={styles.legendItems}>
          <LegendItem color="#4db88a" label="Полит" />
          <LegendItem color="#7dd1aa" label="Запланований полив" />
          <LegendItem color="#ef4444" label="Прострочено" />
        </View>
      </View>
    </ScrollView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f3',
  },
  urgentSection: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    gap: 10,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  urgentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  plantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d4a30',
  },
  calendarWrapper: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dayDetails: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d4a30',
  },
  detailSection: {
    gap: 6,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b8c6b',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  detailPlantName: {
    fontSize: 14,
    color: '#2d4a30',
  },
  emptyDay: {
    color: '#9bada0',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  legend: {
    marginHorizontal: 16,
    marginBottom: 32,
    gap: 8,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9bada0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: '#6b8c6b',
  },
});
