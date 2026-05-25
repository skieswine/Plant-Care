// utils/notificationUtils.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { parseISO } from 'date-fns';

/**
 * Запитати дозвіл на сповіщення (потрібно викликати при старті)
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('watering', {
      name: 'Нагадування про полив',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7dd1aa',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Запланувати локальне сповіщення для рослини
 * @returns ID запланованого сповіщення
 */
export async function schedulePlantWateringNotification(
  plantName: string,
  nextWateringDate: string
): Promise<string | null> {
  try {
    const triggerDate = parseISO(nextWateringDate);

    // Встановлюємо час 9:00 ранку в день поливу
    triggerDate.setHours(9, 0, 0, 0);

    // Якщо час вже минув — додаємо 1 день для уникнення помилки
    if (triggerDate <= new Date()) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌿 Час полити рослину!',
        body: `${plantName} хоче пити. Не забудь полити її сьогодні! 💧`,
        data: { plantName },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Скасувати заплановане сповіщення
 */
export async function cancelPlantNotification(notificationId?: string): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Скасувати всі сповіщення
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Налаштування обробника сповіщень (викликати один раз при старті)
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
