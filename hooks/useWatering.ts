// hooks/useWatering.ts
import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useNotifications } from './useNotifications';

export function useWatering() {
  const waterPlant = useAppStore((s) => s.waterPlant);
  const postponeWatering = useAppStore((s) => s.postponeWatering);
  const { rescheduleNotification } = useNotifications();

  /**
   * Полити рослину зараз — скидає таймер і перепланує сповіщення
   */
  const handleWater = useCallback(
    async (plantId: string) => {
      waterPlant(plantId);
      await rescheduleNotification(plantId);
    },
    [waterPlant, rescheduleNotification]
  );

  /**
   * Відкласти полив на N днів
   */
  const handlePostpone = useCallback(
    async (plantId: string, days: number) => {
      postponeWatering(plantId, days);
      await rescheduleNotification(plantId);
    },
    [postponeWatering, rescheduleNotification]
  );

  return { handleWater, handlePostpone };
}
