// hooks/useNotifications.ts
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  schedulePlantWateringNotification,
  cancelPlantNotification,
  configureNotificationHandler,
} from '../utils/notificationUtils';
import { useAppStore } from '../store/useAppStore';

export function useNotifications() {
  const notificationListener = useRef<Notifications.EventSubscription>();
  const plants = useAppStore((s) => s.plants);
  const updatePlant = useAppStore((s) => s.updatePlant);

  useEffect(() => {
    configureNotificationHandler();
    requestNotificationPermissions();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    return () => {
      notificationListener.current?.remove();
    };
  }, []);

  /**
   * Оновлює сповіщення для рослини (скасовує старе, планує нове)
   */
  const rescheduleNotification = async (plantId: string) => {
    const plant = plants.find((p) => p.id === plantId);
    if (!plant) return;

    await cancelPlantNotification(plant.notificationId);
    const newNotificationId = await schedulePlantWateringNotification(
      plant.name,
      plant.nextWateringDate
    );

    if (newNotificationId) {
      updatePlant(plantId, { notificationId: newNotificationId });
    }
  };

  /**
   * Планує сповіщення для нової рослини
   */
  const scheduleForNewPlant = async (
    plantId: string,
    name: string,
    nextWateringDate: string
  ) => {
    const notificationId = await schedulePlantWateringNotification(name, nextWateringDate);
    if (notificationId) {
      updatePlant(plantId, { notificationId });
    }
  };

  return { rescheduleNotification, scheduleForNewPlant };
}
