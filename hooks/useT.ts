// hooks/useT.ts
import { useAppStore } from '../store/useAppStore';
import { translations, t as interpolate, Translations } from '../constants/i18n';

type DeepKeys<T, Prefix extends string = ''> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? DeepKeys<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`
      : never
    }[keyof T]
  : never;

export function useT() {
  const language = useAppStore((s) => s.language);
  const tr: Translations = translations[language];

  function t(
    path: string,
    vars?: Record<string, string | number>
  ): string {
    const parts = path.split('.');
    let result: any = tr;
    for (const part of parts) {
      result = result?.[part];
    }
    const str = typeof result === 'string' ? result : path;
    return vars ? interpolate(str, vars) : str;
  }

  return { t, language, tr };
}
