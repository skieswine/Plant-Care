// utils/dateUtils.ts
import { differenceInDays, format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';

/**
 * Повертає кількість днів до наступного поливу.
 * Від'ємне — вже прострочено.
 */
export const daysUntilWatering = (nextWateringDateISO: string): number => {
  const now = new Date();
  const next = parseISO(nextWateringDateISO);
  return differenceInDays(next, now);
};

/**
 * Людський рядок: "Сьогодні", "Завтра", "Через 3 дні", "Прострочено 2 дні"
 */
export const wateringStatusLabel = (nextWateringDateISO: string): string => {
  const days = daysUntilWatering(nextWateringDateISO);
  const next = parseISO(nextWateringDateISO);

  if (isToday(next)) return '💧 Сьогодні!';
  if (days < 0) return `⚠️ Прострочено ${Math.abs(days)} дн.`;
  if (isTomorrow(next)) return '🔔 Завтра';
  if (days <= 3) return `⏰ Через ${days} дні`;
  return `📅 Через ${days} днів`;
};

/**
 * Колір індикатора: червоний → жовтий → зелений
 */
export const wateringStatusColor = (nextWateringDateISO: string): string => {
  const days = daysUntilWatering(nextWateringDateISO);
  if (days < 0) return '#ef4444';  // прострочено — червоний
  if (days === 0) return '#f97316'; // сьогодні — помаранчевий
  if (days <= 2) return '#eab308';  // скоро — жовтий
  return '#4db88a';                 // норм — зелений
};

/**
 * Форматує дату для відображення (наприклад, "25 трав. 2025")
 */
export const formatDate = (isoString: string): string => {
  return format(parseISO(isoString), 'd MMM yyyy', { locale: uk });
};

/**
 * Форматує дату з відносним часом ("Вчора", "Сьогодні", "25 трав.")
 */
export const formatRelativeDate = (isoString: string): string => {
  const date = parseISO(isoString);
  if (isToday(date)) return 'Сьогодні';
  if (isYesterday(date)) return 'Вчора';
  if (isTomorrow(date)) return 'Завтра';
  return format(date, 'd MMM', { locale: uk });
};
