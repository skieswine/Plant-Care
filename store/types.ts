// store/types.ts

export type LightLevel = 'shade' | 'partial' | 'direct';
export type Language = 'uk' | 'en' | 'de' | 'ru';

export interface WateringRecord {
  id: string;
  date: string;       // ISO string
  postponed?: boolean;
  postponedDays?: number;
}

export interface CareNote {
  id: string;
  date: string;       // ISO string
  text: string;
}

export interface Plant {
  id: string;
  name?: string;       // опціональна власна назва
  species?: string;    // вид рослини (Монстера, Кактус тощо)
  photoUri?: string;
  roomId: string;
  wateringIntervalDays: number;
  lastWateredDate: string;    // ISO string
  nextWateringDate: string;   // ISO string
  lightLevel: LightLevel;
  wateringHistory: WateringRecord[];
  notes: CareNote[];
  notificationId?: string;
  createdAt: string;
}

/** Повертає відображувану назву рослини */
export function getPlantDisplayName(plant: Plant): string {
  return plant.name || plant.species || 'Рослина';
}

export interface Room {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
}
