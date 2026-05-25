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

  // These labels are used in CountdownBadge — kept simple (not translated via hook to avoid complexity)
  if (isToday(next)) return '💧 Today!';
  if (days < 0) return `⚠️ ${Math.abs(days)}d late`;
  if (isTomorrow(next)) return '🔔 Tomorrow';
  if (days <= 3) return `⏰ ${days}d`;
  return `📅 ${days}d`;
};

export const wateringStatusColor = (nextWateringDateISO: string): string => {
  const days = daysUntilWatering(nextWateringDateISO);
  if (days < 0) return '#ef4444';
  if (days === 0) return '#f97316';
  if (days <= 2) return '#eab308';
  return '#4db88a';
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
