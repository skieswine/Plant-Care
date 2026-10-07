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
      selectedColor: colors.primary,
    };

    return result;
  }, [getWateringEvents, selectedDate, colors]);

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

  const s = makeStyles(colors);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Термінові сьогодні */}
      {urgentPlants.length > 0 && (
        <View style={s.urgentSection}>
          <View style={s.urgentHeader}>
            <Ionicons name="alert-circle" size={18} color={colors.urgent} />
            <Text style={s.urgentTitle}>{t('calendar.urgentTitle')}</Text>
          </View>
          {urgentPlants.map((plant) => (
            <View key={plant.id} style={s.urgentItem}>
              <Text style={{ fontSize: 20 }}>🌿</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.plantName}>{getPlantDisplayName(plant, language)}</Text>
              </View>
              <CountdownBadge nextWateringDate={plant.nextWateringDate} />
            </View>
          ))}
        </View>
      )}

      {/* Календар */}
      <View style={s.calendarWrapper}>
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
            todayTextColor: colors.primaryLight,
            dayTextColor: colors.text,
            textDisabledColor: isDark ? colors.surfaceSecondary : colors.border,
            dotColor: colors.primaryLight,
            selectedDotColor: '#fff',
            arrowColor: colors.primary,
            monthTextColor: colors.text,
            indicatorColor: colors.primary,
            textDayFontWeight: '600',
            textMonthFontWeight: '800',
            textDayHeaderFontWeight: '700',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
        />
      </View>

      {/* Деталі вибраного дня */}
      <View style={s.dayDetails}>
        <Text style={s.dayTitle}>
          {format(new Date(selectedDate), "d MMMM yyyy", { locale: dateFnsLocales[language] })}
        </Text>

        {plantsForDate.length > 0 && (
          <View style={s.detailSection}>
            <Text style={s.detailSectionTitle}>{t('calendar.waterOn')}</Text>
            {plantsForDate.map((plant) => (
              <View key={plant.id} style={s.detailItem}>
                <Ionicons name="water-outline" size={16} color={colors.primaryLight} />
                <Text style={s.detailPlantName}>{getPlantDisplayName(plant, language)}</Text>
              </View>
            ))}
          </View>
        )}

        {wateredOnDate.length > 0 && (
          <View style={s.detailSection}>
            <Text style={s.detailSectionTitle}>{t('calendar.wateredOn')}</Text>
            {wateredOnDate.map((plant) => (
              <View key={plant.id} style={s.detailItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.primaryLight} />
                <Text style={s.detailPlantName}>{getPlantDisplayName(plant, language)}</Text>
              </View>
            ))}
          </View>
        )}

        {plantsForDate.length === 0 && wateredOnDate.length === 0 && (
          <Text style={s.emptyDay}>{t('calendar.nothingToday')}</Text>
        )}
      </View>

      {/* Легенда */}
      <View style={s.legend}>
        <Text style={s.legendTitle}>{t('calendar.legendTitle')}</Text>
        <View style={s.legendItems}>
          <LegendPill
            color={colors.primaryLight}
            icon="water"
            label={t('calendar.legendWatered')}
            colors={colors}
            s={s}
          />
          <LegendPill
            color={colors.primary}
            icon="calendar-outline"
            label={t('calendar.legendPlanned')}
            colors={colors}
            s={s}
          />
          <LegendPill
            color={colors.urgent}
            icon="alert-circle"
            label={t('calendar.legendOverdue')}
            colors={colors}
            s={s}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function LegendPill({
  color, icon, label, colors, s,
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: any;
  s: any;
}) {
  return (
    <View style={[s.legendPill, { backgroundColor: color + '12', borderColor: color + '33' }]}>
      <View style={[s.legendPillDot, { backgroundColor: color }]}>
        <Ionicons name={icon} size={11} color="#fff" />
      </View>
      <Text style={[s.legendPillText, { color }]}>{label}</Text>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    urgentSection: {
      margin: 16,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.urgent,
      gap: 12,
      shadowColor: colors.urgent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    urgentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    urgentTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.urgent,
      letterSpacing: -0.2,
    },
    urgentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.surfaceSecondary,
      padding: 10,
      borderRadius: 12,
    },
    plantName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    calendarWrapper: {
      marginHorizontal: 16,
      borderRadius: 24,
      overflow: 'hidden',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.03,
      shadowRadius: 10,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    dayDetails: {
      margin: 16,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      gap: 14,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.02,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    dayTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    detailSection: {
      gap: 8,
    },
    detailSectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
    },
    detailPlantName: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    emptyDay: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: 12,
      fontWeight: '600',
    },
    legend: {
      marginHorizontal: 16,
      marginBottom: 32,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: 16,
      gap: 12,
    },
    legendTitle: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: colors.textSecondary,
    },
    legendItems: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    legendPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
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
      fontSize: 12,
      fontWeight: '700',
    },
  });
}
