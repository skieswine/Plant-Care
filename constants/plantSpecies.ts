// constants/plantSpecies.ts
import { Language } from '../store/types';

interface SpeciesEntry {
  emoji: string;
  uk: string;
  en: string;
  de: string;
  ru: string;
}

const SPECIES_DATA: SpeciesEntry[] = [
  // Тропічні та декоративні листяні
  { emoji: '🌿', uk: 'Монстера',         en: 'Monstera',          de: 'Monstera',           ru: 'Монстера' },
  { emoji: '🍃', uk: 'Потос',            en: 'Pothos',            de: 'Efeutute',           ru: 'Потос' },
  { emoji: '🌿', uk: 'Філодендрон',      en: 'Philodendron',      de: 'Philodendron',       ru: 'Филодендрон' },
  { emoji: '🎋', uk: 'Бамбукова пальма', en: 'Bamboo Palm',       de: 'Bambuspalme',        ru: 'Бамбуковая пальма' },
  { emoji: '🌴', uk: 'Драцена',          en: 'Dracaena',          de: 'Drachenbaum',        ru: 'Драцена' },
  { emoji: '🌱', uk: 'Діффенбахія',      en: 'Dieffenbachia',     de: 'Dieffenbachie',      ru: 'Диффенбахия' },
  { emoji: '🌿', uk: 'Калатея',          en: 'Calathea',          de: 'Korbmarante',        ru: 'Калатея' },
  { emoji: '🌳', uk: 'Фікус',            en: 'Ficus',             de: 'Ficus',              ru: 'Фикус' },

  // Квітучі
  { emoji: '🌸', uk: 'Орхідея',          en: 'Orchid',            de: 'Orchidee',           ru: 'Орхидея' },
  { emoji: '🌺', uk: 'Антуріум',         en: 'Anthurium',         de: 'Anthurium',          ru: 'Антуриум' },
  { emoji: '🌺', uk: 'Гібіскус',         en: 'Hibiscus',          de: 'Hibiskus',           ru: 'Гибискус' },
  { emoji: '💜', uk: 'Фіалка',           en: 'Violet',            de: 'Veilchen',           ru: 'Фиалка' },
  { emoji: '🌻', uk: 'Бегонія',          en: 'Begonia',           de: 'Begonie',            ru: 'Бегония' },
  { emoji: '🕊️', uk: 'Спатифілум',      en: 'Peace Lily',        de: 'Einblatt',           ru: 'Спатифиллум' },
  { emoji: '🌼', uk: 'Хризантема',       en: 'Chrysanthemum',     de: 'Chrysantheme',       ru: 'Хризантема' },
  { emoji: '🌹', uk: 'Троянда',          en: 'Rose',              de: 'Rose',               ru: 'Роза' },

  // Сукуленти та кактуси
  { emoji: '🌵', uk: 'Кактус',           en: 'Cactus',            de: 'Kaktus',             ru: 'Кактус' },
  { emoji: '💎', uk: 'Ехеверія',         en: 'Echeveria',         de: 'Echeverie',          ru: 'Эхеверия' },
  { emoji: '🪨', uk: 'Суккулент',        en: 'Succulent',         de: 'Sukkulente',         ru: 'Суккулент' },
  { emoji: '💚', uk: 'Алое вера',        en: 'Aloe Vera',         de: 'Aloe vera',          ru: 'Алоэ вера' },
  { emoji: '⚔️', uk: "Сансев'єра",       en: 'Snake Plant',       de: 'Bogenhanf',          ru: 'Сансевиерия' },
  { emoji: '🟢', uk: 'Замієкулькас',     en: 'ZZ Plant',          de: 'Glücksfeder',        ru: 'Замиокулькас' },

  // Папороті та трав'янисті
  { emoji: '🌿', uk: 'Папороть',         en: 'Fern',              de: 'Farn',               ru: 'Папоротник' },
  { emoji: '🌾', uk: 'Хлорофітум',       en: 'Spider Plant',      de: 'Grünlilie',          ru: 'Хлорофитум' },
  { emoji: '🌿', uk: 'Аспарагус',        en: 'Asparagus Fern',    de: 'Zierspargel',        ru: 'Аспарагус' },
  { emoji: '🌿', uk: 'Плющ',             en: 'Ivy',               de: 'Efeu',               ru: 'Плющ' },

  // Цитрусові та плодові
  { emoji: '🍋', uk: 'Лимон',            en: 'Lemon Tree',        de: 'Zitronenbaum',       ru: 'Лимон' },
  { emoji: '🍊', uk: 'Мандарин',         en: 'Mandarin Tree',     de: 'Mandarinbaum',       ru: 'Мандарин' },

  // Ароматичні та кухонні
  { emoji: '🌱', uk: 'Базилік',          en: 'Basil',             de: 'Basilikum',          ru: 'Базилик' },
  { emoji: '🌿', uk: "М'ята",            en: 'Mint',              de: 'Minze',              ru: 'Мята' },
  { emoji: '🌿', uk: 'Розмарин',         en: 'Rosemary',          de: 'Rosmarin',           ru: 'Rosmarin' },
];

/**
 * Returns species list with labels in the current language.
 * `value` is always the Ukrainian name (used as stable ID stored in DB).
 */
export function getPlantSpecies(lang: Language) {
  return SPECIES_DATA.map((s) => ({
    label: `${s.emoji} ${s[lang]}`,
    value: s.uk, // stable key — always Ukrainian
    localLabel: s[lang],
  }));
}

/** Default export keeps backward compat with screens that haven't been updated yet */
export const PLANT_SPECIES = SPECIES_DATA.map((s) => ({
  label: `${s.emoji} ${s.uk}`,
  value: s.uk,
}));

/**
 * Given a species value (Ukrainian key) and target language,
 * returns the translated display name.
 */
export function translateSpecies(ukName: string, lang: Language): string {
  const entry = SPECIES_DATA.find((s) => s.uk === ukName);
  if (!entry) return ukName;
  return entry[lang] ?? ukName;
}
