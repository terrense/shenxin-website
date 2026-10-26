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

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggle: () => void;
  /** UI chrome lookup. */
  ui: (key: UIKey) => string;
  /** Localised content lookup. */
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
  // English is the primary language; only switch for an explicit Chinese pref.
  const prefers = window.navigator.languages ?? [window.navigator.language];
  return prefers.some((lang) => lang?.toLowerCase().startsWith('zh')) ? 'zh' : 'en';
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

  const toggle = useCallback(
    () => setLocale(locale === 'en' ? 'zh' : 'en'),
    [locale, setLocale],
  );

  // Keep the document in sync so screen readers and search engines agree with
  // what is rendered.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale === 'zh' ? 'zh-CN' : 'en';
    // Chinese body copy needs slightly looser leading at the same size.
    root.dataset.locale = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggle,
      ui: (key) => ui[key][locale] ?? ui[key].en,
      tl: (v) => (v ? (v[locale] ?? v.en) : ''),
    }),
    [locale, setLocale, toggle],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
  return ctx;
}
