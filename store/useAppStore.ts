// store/useAppStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays, format } from 'date-fns';
import { Plant, Room, CareNote, WateringRecord, LightLevel, Season, getPlantDisplayName } from './types';
export { getPlantDisplayName };

import { Language } from './types';

interface AppState {
  plants: Plant[];
  rooms: Room[];
  theme: 'light' | 'dark';
  language: Language;
  season: Season;

  // Plant actions
  addPlant: (data: {
    name?: string;
    species?: string;
    photoUri?: string;
    roomId: string;
    wateringIntervalDays: number;
    winterWateringIntervalDays?: number;
    lightLevel: LightLevel;
    firstWateringDate?: string;
  }) => Plant;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
  deletePlant: (id: string) => void;
  waterPlant: (id: string) => void;
  postponeWatering: (id: string, days: number) => void;
  addNote: (plantId: string, text: string) => void;
  deleteNote: (plantId: string, noteId: string) => void;
  deleteWateringRecord: (plantId: string, recordId: string) => void;

  // Season actions
  setSeason: (season: Season) => void;
  setPlantSeasonOverride: (plantId: string, season: Season | null) => void;
  updatePlantSeasonIntervals: (plantId: string, summer: number, winter: number | undefined) => void;

  // Room actions
  addRoom: (name: string, emoji: string) => Room;
  updateRoom: (id: string, name: string, emoji: string) => void;
  deleteRoom: (id: string) => void;

  // Settings
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: Language) => void;

  // Backup
  restoreFromBackup: (data: { plants: Plant[]; rooms: Room[]; season: Season }) => void;

  // Helpers
  getPlantsByRoom: (roomId: string) => Plant[];
  getPlantsNeedingWaterToday: () => Plant[];
  getWateringEventsForCalendar: () => Record<string, { dots: { color: string }[] }>;
}

const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

const computeNextWatering = (lastWateredDate: string, intervalDays: number): string => {
  return addDays(new Date(lastWateredDate), intervalDays).toISOString();
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      plants: [],
      theme: 'light' as const,
      language: 'uk' as Language,
      season: 'summer' as Season,
      rooms: [
        { id: 'room-1', name: 'Вітальня', emoji: '🛋️', createdAt: new Date().toISOString() },
        { id: 'room-2', name: 'Спальня',  emoji: '🛏️', createdAt: new Date().toISOString() },
        { id: 'room-3', name: 'Кухня',    emoji: '🍳', createdAt: new Date().toISOString() },
      ],

      addPlant: (data) => {
        const { season } = get();
        const now = new Date().toISOString();
        const lastWatered = data.firstWateringDate || now;
        const summerInterval = data.wateringIntervalDays;
        const winterInterval = data.winterWateringIntervalDays;
        const activeInterval = (season === 'winter' && winterInterval) ? winterInterval : summerInterval;
        const newPlant: Plant = {
          id: generateId(),
          name: data.name,
          species: data.species,
          photoUri: data.photoUri,
          roomId: data.roomId,
          wateringIntervalDays: activeInterval,
          summerWateringIntervalDays: summerInterval,
          winterWateringIntervalDays: winterInterval,
          lightLevel: data.lightLevel,
          lastWateredDate: lastWatered,
          nextWateringDate: computeNextWatering(lastWatered, activeInterval),
          wateringHistory: [],
          notes: [],
          createdAt: now,
        };
        set((state) => ({ plants: [...state.plants, newPlant] }));
        return newPlant;
      },

      updatePlant: (id, updates) => {
        const { season } = get();
        set((state) => ({
          plants: state.plants.map((p) => {
            if (p.id !== id) return p;
            const merged = { ...p, ...updates };
            const effectiveSeason = merged.seasonOverride ?? season;
            // Recompute active interval if seasonal intervals changed
            if (updates.summerWateringIntervalDays !== undefined || updates.winterWateringIntervalDays !== undefined) {
              const summer = merged.summerWateringIntervalDays;
              const winter = merged.winterWateringIntervalDays;
              merged.wateringIntervalDays = (effectiveSeason === 'winter' && winter) ? winter : summer;
            }
            if (updates.wateringIntervalDays !== undefined || updates.lastWateredDate !== undefined ||
                updates.summerWateringIntervalDays !== undefined || updates.winterWateringIntervalDays !== undefined) {
              merged.nextWateringDate = computeNextWatering(merged.lastWateredDate, merged.wateringIntervalDays);
            }
            return merged;
          }),
        }));
      },

      deletePlant: (id) => {
        set((state) => ({ plants: state.plants.filter((p) => p.id !== id) }));
      },

      waterPlant: (id) => {
        const now = new Date().toISOString();
        const record: WateringRecord = { id: generateId(), date: now };
        set((state) => ({
          plants: state.plants.map((p) => {
            if (p.id !== id) return p;
            return {
              ...p,
              lastWateredDate: now,
              nextWateringDate: computeNextWatering(now, p.wateringIntervalDays),
              wateringHistory: [record, ...p.wateringHistory],
            };
          }),
        }));
      },

      postponeWatering: (id, days) => {
        set((state) => ({
          plants: state.plants.map((p) => {
            if (p.id !== id) return p;
            const newNext = addDays(new Date(p.nextWateringDate), days).toISOString();
            const record: WateringRecord = {
              id: generateId(),
              date: new Date().toISOString(),
              postponed: true,
              postponedDays: days,
            };
            return {
              ...p,
              nextWateringDate: newNext,
              wateringHistory: [record, ...p.wateringHistory],
            };
          }),
        }));
      },

      addNote: (plantId, text) => {
        const note: CareNote = {
          id: generateId(),
          date: new Date().toISOString(),
          text,
        };
        set((state) => ({
          plants: state.plants.map((p) =>
            p.id === plantId ? { ...p, notes: [note, ...p.notes] } : p
          ),
        }));
      },

      deleteNote: (plantId, noteId) => {
        set((state) => ({
          plants: state.plants.map((p) =>
            p.id === plantId
              ? { ...p, notes: p.notes.filter((n) => n.id !== noteId) }
              : p
          ),
        }));
      },

      deleteWateringRecord: (plantId, recordId) => {
        set((state) => ({
          plants: state.plants.map((p) =>
            p.id === plantId
              ? { ...p, wateringHistory: p.wateringHistory.filter((r) => r.id !== recordId) }
              : p
          ),
        }));
      },

      addRoom: (name, emoji) => {
        const newRoom: Room = {
          id: generateId(),
          name,
          emoji,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ rooms: [...state.rooms, newRoom] }));
        return newRoom;
      },

      updateRoom: (id, name, emoji) => {
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === id ? { ...r, name, emoji } : r)),
        }));
      },

      deleteRoom: (id) => {
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== id),
          // Видаляємо рослини з цієї кімнати
          plants: state.plants.filter((p) => p.roomId !== id),
        }));
      },

      setSeason: (season) => {
        set((state) => ({
          season,
          plants: state.plants.map((p) => {
            if (p.seasonOverride) return p; // skip individually overridden plants
            const summer = p.summerWateringIntervalDays ?? p.wateringIntervalDays;
            const winter = p.winterWateringIntervalDays;
            const newInterval = (season === 'winter' && winter) ? winter : summer;
            return {
              ...p,
              wateringIntervalDays: newInterval,
              nextWateringDate: computeNextWatering(p.lastWateredDate, newInterval),
            };
          }),
        }));
      },

      setPlantSeasonOverride: (plantId, season) => {
        set((state) => ({
          plants: state.plants.map((p) => {
            if (p.id !== plantId) return p;
            const effectiveSeason = season ?? state.season;
            const summer = p.summerWateringIntervalDays ?? p.wateringIntervalDays;
            const winter = p.winterWateringIntervalDays;
            const newInterval = (effectiveSeason === 'winter' && winter) ? winter : summer;
            return {
              ...p,
              seasonOverride: season ?? undefined,
              wateringIntervalDays: newInterval,
              nextWateringDate: computeNextWatering(p.lastWateredDate, newInterval),
            };
          }),
        }));
      },

      updatePlantSeasonIntervals: (plantId, summer, winter) => {
        set((state) => ({
          plants: state.plants.map((p) => {
            if (p.id !== plantId) return p;
            const effectiveSeason = p.seasonOverride ?? state.season;
            const newInterval = (effectiveSeason === 'winter' && winter) ? winter : summer;
            return {
              ...p,
              summerWateringIntervalDays: summer,
              winterWateringIntervalDays: winter,
              wateringIntervalDays: newInterval,
              nextWateringDate: computeNextWatering(p.lastWateredDate, newInterval),
            };
          }),
        }));
      },

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),

      restoreFromBackup: (data) => {
        set({ plants: data.plants, rooms: data.rooms, season: data.season ?? 'summer' });
      },

      getPlantsByRoom: (roomId) => {
        return get().plants.filter((p) => p.roomId === roomId);
      },

      getPlantsNeedingWaterToday: () => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return get().plants.filter((p) => new Date(p.nextWateringDate) <= today);
      },

      getWateringEventsForCalendar: () => {
        const events: Record<string, { dots: { color: string }[] }> = {};
        const today = new Date();

        get().plants.forEach((plant) => {
          // Минулі поливи
          plant.wateringHistory.forEach((record) => {
            if (!record.postponed) {
              const dateKey = format(new Date(record.date), 'yyyy-MM-dd');
              if (!events[dateKey]) events[dateKey] = { dots: [] };
              events[dateKey].dots.push({ color: '#4db88a' });
            }
          });

          // Майбутній полив
          const nextDate = new Date(plant.nextWateringDate);
          if (nextDate > today) {
            const dateKey = format(nextDate, 'yyyy-MM-dd');
            if (!events[dateKey]) events[dateKey] = { dots: [] };
            events[dateKey].dots.push({ color: '#7dd1aa' });
          } else {
            // Прострочений
            const dateKey = format(nextDate, 'yyyy-MM-dd');
            if (!events[dateKey]) events[dateKey] = { dots: [] };
            events[dateKey].dots.push({ color: '#ef4444' });
          }
        });

        return events;
      },
    }),
    {
      name: 'plantcare-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            season: 'summer',
            plants: (persistedState.plants ?? []).map((p: any) => ({
              ...p,
              summerWateringIntervalDays: p.summerWateringIntervalDays ?? p.wateringIntervalDays,
            })),
          };
        }
        return persistedState;
      },
    }
  )
);
