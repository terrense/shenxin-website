import type { Accent, Locale } from '@/content/types';

/** Minimal class joiner — no clsx dependency needed for this surface area. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Accent utility classes, resolved once so no component hand-writes a colour.
 * Keeping these in one table is what stops the palette drifting.
 */
export const accentClasses: Record<
  Accent,
  {
    text: string;
    border: string;
    bg: string;
    glow: string;
    from: string;
    ring: string;
    hoverBorder: string;
    hoverShadow: string;
    hex: string;
  }
> = {
  signal: {
    text: 'text-accent-ink',
    border: 'border-accent/40',
    bg: 'bg-accent/8',
    glow: 'shadow-[0_0_50px_-20px_var(--color-accent)]',
    from: 'from-accent/12',
    ring: 'ring-accent/30',
    // Written out literally, never built by string manipulation — Tailwind
    // scans source text, so a class assembled at runtime is never generated.
    hoverBorder: 'hover:border-accent/70',
    hoverShadow: 'hover:shadow-[0_18px_40px_-16px_var(--color-accent)]',
    hex: '#0071e3',
  },
  flux: {
    text: 'text-violet',
    border: 'border-violet/40',
    bg: 'bg-violet/8',
    glow: 'shadow-[0_0_50px_-20px_var(--color-violet)]',
    from: 'from-violet/12',
    ring: 'ring-violet/30',
    hoverBorder: 'hover:border-violet/70',
    hoverShadow: 'hover:shadow-[0_18px_40px_-16px_var(--color-violet)]',
    hex: '#5b3fd6',
  },
  ember: {
    text: 'text-amber',
    border: 'border-amber/40',
    bg: 'bg-amber/8',
    glow: 'shadow-[0_0_50px_-20px_var(--color-amber)]',
    from: 'from-amber/12',
    ring: 'ring-amber/30',
    hoverBorder: 'hover:border-amber/70',
    hoverShadow: 'hover:shadow-[0_18px_40px_-16px_var(--color-amber)]',
    hex: '#9a5b00',
  },
};

/**
 * Bento footprint → grid span classes, against a 6-column desktop grid.
 *
 * The declared order of featured projects must tile the grid without holes —
 * see the note in src/content/index.ts. Mobile collapses to one column; `md`
 * goes to 6 with a single 2-up row.
 */
export const bentoSpan: Record<string, string> = {
  anchor: 'md:col-span-6 lg:col-span-4 lg:row-span-2',
  tall: 'md:col-span-6 lg:col-span-2 lg:row-span-2',
  wide: 'md:col-span-6 lg:col-span-4',
  cell: 'md:col-span-3 lg:col-span-2',
};

/** BCP 47 tags for `Intl` formatting, per locale. */
const DATE_TAGS: Record<Locale, string> = {
  // en-GB rather than en-US: day-month-year avoids the 03/04 ambiguity for a
  // readership that is mostly not American.
  en: 'en-GB',
  zh: 'zh-CN',
  ru: 'ru-RU',
};

export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(DATE_TAGS[locale], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Hardening for every outbound link. `noreferrer` also implies `noopener`, but
 * both are listed because some older crawlers only honour one.
 */
export const externalLinkProps = {
  target: '_blank',
  rel: 'noopener noreferrer external',
} as const;

export function isExternal(href: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(href);
}
