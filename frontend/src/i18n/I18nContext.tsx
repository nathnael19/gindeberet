import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import en, { type TranslationKeys } from './locales/en';
import om from './locales/om';
import am from './locales/am';

export type Lang = 'en' | 'om' | 'am';

const LOCALES: Record<Lang, TranslationKeys> = { en, om, am };
const STORAGE_KEY = 'gindeberet-lang';

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

export type I18nKey = NestedKeyOf<TranslationKeys>;

function getByPath(obj: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: I18nKey) => string;
  dict: TranslationKeys;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'om' || saved === 'am') return saved;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    typeof window !== 'undefined' ? readStoredLang() : 'en'
  );

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'om' ? 'om' : lang === 'am' ? 'am' : 'en';
  }, [lang]);

  const dict = LOCALES[lang];

  const t = useCallback(
    (key: I18nKey) => {
      return getByPath(dict, key) ?? getByPath(en, key) ?? key;
    },
    [dict]
  );

  const value = useMemo(() => ({ lang, setLang, t, dict }), [lang, setLang, t, dict]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
