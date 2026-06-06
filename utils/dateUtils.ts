// utils/dateUtils.ts
import { differenceInDays, format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { uk, enUS, de, ru } from 'date-fns/locale';
import { Language } from '../store/types';

const localeMap: Record<Language, Locale> = {
  uk, en: enUS, de, ru,
};

export const daysUntilWatering = (nextWateringDateISO: string): number => {
  const now = new Date();
  const next = parseISO(nextWateringDateISO);
  return differenceInDays(next, now);
};

export const wateringStatusLabel = (nextWateringDateISO: string, lang: Language = 'uk'): string => {
  const days = daysUntilWatering(nextWateringDateISO);
  const next = parseISO(nextWateringDateISO);

  const loc: Record<Language, { today: string; tomorrow: string; overdue: string; days: string }> = {
    uk: { today: '💧 Сьогодні', tomorrow: '🔔 Завтра', overdue: '⚠️ Запізнення {{n}} дн.', days: '⏰ Через {{n}} дн.' },
    en: { today: '💧 Today', tomorrow: '🔔 Tomorrow', overdue: '⚠️ {{n}}d late', days: '⏰ In {{n}}d' },
    de: { today: '💧 Heute', tomorrow: '🔔 Morgen', overdue: '⚠️ {{n}}T. überfällig', days: '⏰ In {{n}}T.' },
    ru: { today: '💧 Сегодня', tomorrow: '🔔 Завтра', overdue: '⚠️ Опоздание {{n}} дн.', days: '⏰ Через {{n}} дн.' },
  };

  const l = loc[lang] || loc['uk'];

  if (isToday(next)) return l.today;
  if (days < 0) return l.overdue.replace('{{n}}', String(Math.abs(days)));
  if (isTomorrow(next)) return l.tomorrow;
  return l.days.replace('{{n}}', String(days));
};

export const wateringStatusColor = (nextWateringDateISO: string): string => {
  const days = daysUntilWatering(nextWateringDateISO);
  if (days < 0) return '#E63946'; // Crimson red (Overdue)
  if (days === 0) return '#FF9F1C'; // Vibrant orange (Today)
  if (days <= 2) return '#FFB703'; // Soft amber yellow (Upcoming)
  return '#10B981'; // Emerald mint green (Safe)
};

export const formatDate = (isoString: string, lang: Language = 'uk'): string => {
  return format(parseISO(isoString), 'd MMM yyyy', { locale: localeMap[lang] });
};

export const formatRelativeDate = (isoString: string, lang: Language = 'uk'): string => {
  const date = parseISO(isoString);
  const locale = localeMap[lang];
  if (isToday(date)) return format(date, "'Today'");
  if (isYesterday(date)) return format(date, "'Yesterday'");
  if (isTomorrow(date)) return format(date, "'Tomorrow'");
  return format(date, 'd MMM', { locale });
};
