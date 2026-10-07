// store/types.ts
import { translateSpecies } from '../constants/plantSpecies';

export type LightLevel = 'shade' | 'partial' | 'direct';
export type Language = 'uk' | 'en' | 'de' | 'ru';
export type Season = 'summer' | 'winter';

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
  name?: string;
  species?: string;
  photoUri?: string;
  roomId: string;
  wateringIntervalDays: number;     // active interval (auto-computed from season)
  summerWateringIntervalDays: number;
  winterWateringIntervalDays?: number;
  seasonOverride?: Season;          // if set — ignores global season
  lastWateredDate: string;
  nextWateringDate: string;
  lightLevel: LightLevel;
  wateringHistory: WateringRecord[];
  notes: CareNote[];
  notificationId?: string;
  createdAt: string;
}

/** Повертає відображувану назву рослини (вид перекладається на мову інтерфейсу) */
export function getPlantDisplayName(plant: Plant, lang: Language = 'uk'): string {
  if (plant.name) return plant.name;
  if (plant.species) return translateSpecies(plant.species, lang);
  return 'Рослина';
}

export interface Room {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
}
