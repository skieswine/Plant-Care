// app/(tabs)/calendar.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format } from 'date-fns';
import { uk, enUS, de, ru } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { getPlantDisplayName } from '../../store/useAppStore';
import { CountdownBadge } from '../../components/CountdownBadge';
import { useTheme } from '../../hooks/useTheme';
import { useT } from '../../hooks/useT';

// ── Locales for react-native-calendars ──────────────────────────
LocaleConfig.locales['uk'] = {
  monthNames: ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'],
  monthNamesShort: ['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жов','Лис','Гру'],
  dayNames: ['Неділя','Понеділок','Вівторок','Середа','Четвер','П\'ятниця','Субота'],
  dayNamesShort: ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'],
  today: 'Сьогодні',
};
LocaleConfig.locales['en'] = {
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  today: 'Today',
};
LocaleConfig.locales['de'] = {
  monthNames: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
  monthNamesShort: ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
  dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
  dayNamesShort: ['So','Mo','Di','Mi','Do','Fr','Sa'],
  today: 'Heute',
};
LocaleConfig.locales['ru'] = {
  monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
  monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
  dayNames: ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
  dayNamesShort: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
  today: 'Сегодня',
};
LocaleConfig.defaultLocale = 'uk';

const dateFnsLocales: Record<string, Locale> = { uk, en: enUS, de, ru };

export default function CalendarScreen() {
  const plants = useAppStore((s) => s.plants);
  const getWateringEvents = useAppStore((s) => s.getWateringEventsForCalendar);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { colors, isDark } = useTheme();
  const { t, language } = useT();

  // Switch calendar locale when language changes
  // ✅ Set locale SYNCHRONOUSLY before Calendar renders (not in useEffect)
  // This fixes the one-step-behind locale shift bug
  LocaleConfig.defaultLocale = language;


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
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
      {/* Термінові сьогодні */}
      {urgentPlants.length > 0 && (
        <View style={[styles.urgentSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={styles.urgentHeader}>
            <Ionicons name="alert-circle" size={18} color={colors.urgent} />
            <Text style={[styles.urgentTitle, { color: colors.text }]}>{t('calendar.urgentTitle')}</Text>
          </View>
          {urgentPlants.map((plant) => (
            <View key={plant.id} style={[styles.urgentItem, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={{ fontSize: 20 }}>🌿</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.plantName, { color: colors.text }]}>{getPlantDisplayName(plant)}</Text>
              </View>
              <CountdownBadge nextWateringDate={plant.nextWateringDate} />
            </View>
          ))}
        </View>
      )}

      {/* Календар — key примусово перемонтовує при зміні мови або теми */}
      <View style={[styles.calendarWrapper, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <Calendar
          key={`${language}-${colors.background}`}
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.surface,
            textSectionTitleColor: colors.textMuted,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#fff',
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: colors.border,
            dotColor: colors.primary,
            selectedDotColor: '#fff',
            arrowColor: colors.primary,
            monthTextColor: colors.text,
            indicatorColor: colors.primary,
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
      <View style={[styles.dayDetails, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <Text style={[styles.dayTitle, { color: colors.text }]}>
          {format(new Date(selectedDate), "d MMMM yyyy", { locale: dateFnsLocales[language] })}
        </Text>

        {plantsForDate.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={[styles.detailSectionTitle, { color: colors.textSecondary }]}>{t('calendar.waterOn')}</Text>
            {plantsForDate.map((plant) => (
              <View key={plant.id} style={[styles.detailItem, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="water-outline" size={16} color={colors.primaryLight} />
                <Text style={[styles.detailPlantName, { color: colors.text }]}>{getPlantDisplayName(plant)}</Text>
              </View>
            ))}
          </View>
        )}

        {wateredOnDate.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={[styles.detailSectionTitle, { color: colors.textSecondary }]}>{t('calendar.wateredOn')}</Text>
            {wateredOnDate.map((plant) => (
              <View key={plant.id} style={[styles.detailItem, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
                <Text style={[styles.detailPlantName, { color: colors.text }]}>{getPlantDisplayName(plant)}</Text>
              </View>
            ))}
          </View>
        )}

        {plantsForDate.length === 0 && wateredOnDate.length === 0 && (
          <Text style={[styles.emptyDay, { color: colors.textMuted }]}>{t('calendar.nothingToday')}</Text>
        )}
      </View>

      {/* Легенда — красиві кольорові плашки */}
      <View style={[styles.legend, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <Text style={[styles.legendTitle, { color: colors.textSecondary }]}>{t('calendar.legendTitle')}</Text>
        <View style={styles.legendItems}>
          <LegendPill
            color={colors.primary}
            icon="water"
            label={t('calendar.legendWatered')}
            colors={colors}
          />
          <LegendPill
            color={colors.primaryLight}
            icon="calendar-outline"
            label={t('calendar.legendPlanned')}
            colors={colors}
          />
          <LegendPill
            color={colors.urgent}
            icon="alert-circle"
            label={t('calendar.legendOverdue')}
            colors={colors}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function LegendPill({
  color, icon, label, colors,
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: any;
}) {
  return (
    <View style={[styles.legendPill, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <View style={[styles.legendPillDot, { backgroundColor: color }]}>
        <Ionicons name={icon} size={11} color="#fff" />
      </View>
      <Text style={[styles.legendPillText, { color }]}>{label}</Text>
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
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  legendPillDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
