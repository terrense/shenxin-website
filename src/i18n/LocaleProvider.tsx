import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { LOCALES, type L, type Locale } from '@/content/types';
import { ui, type UIKey } from './dictionary';

const STORAGE_KEY = 'portfolio.locale';

/** BCP 47 tags, for the `lang` attribute and `Intl` formatting. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-CN',
  ru: 'ru-RU',
};

/** Short labels for the language switcher, in the language itself. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  zh: '中文',
  ru: 'RU',
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** UI chrome lookup. */
  ui: (key: UIKey) => string;
  /** Localised content lookup, falling back to English. */
  tl: (value: L | undefined) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // Private mode / storage disabled — fall through to language sniffing.
  }
  // English is the primary language; only switch on an explicit preference.
  const prefers = window.navigator.languages ?? [window.navigator.language];
  for (const lang of prefers) {
    const tag = lang?.toLowerCase() ?? '';
    if (tag.startsWith('zh')) return 'zh';
    if (tag.startsWith('ru')) return 'ru';
    if (tag.startsWith('en')) return 'en';
  }
  return 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal: the choice just will not persist.
    }
  }, []);

  // Keep the document in sync so screen readers and search engines agree with
  // what is rendered.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = LOCALE_TAGS[locale];
    // Chinese body copy needs looser leading at the same size; see index.css.
    root.dataset.locale = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      ui: (key) => ui[key][locale] ?? ui[key].en,
      tl: (v) => (v ? (v[locale] ?? v.en) : ''),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
  return ctx;
}
