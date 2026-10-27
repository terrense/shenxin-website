import { lazy, Suspense, useState } from 'react';
import { profile, SITE_URL } from '@/content/site';
import { visitedCountries } from '@/content/travel';
import { useLocale } from '@/i18n/LocaleProvider';
import { useSeo } from '@/hooks/useSeo';
import { SectionHeader } from '@/components/primitives/Section';
import { Reveal } from '@/components/primitives/Reveal';
import { cn } from '@/lib/utils';

/**
 * The map file is ~117 KB of generated path data. Splitting it means the rest
 * of the site never pays for a page it does not show.
 */
const WorldMap = lazy(() =>
  import('@/components/sections/WorldMap').then((m) => ({ default: m.WorldMap })),
);

export default function Footprints() {
  const { tl, ui, locale } = useLocale();
  const [selected, setSelected] = useState<string | null>(null);

  useSeo({
    title: `${ui('footprints.title')} — ${tl(profile.name)}`,
    description: ui('footprints.lede'),
    path: '/footprints',
    locale,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: ui('footprints.title'),
      url: `${SITE_URL}/footprints`,
      numberOfItems: visitedCountries.length,
      itemListElement: visitedCountries.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'Country', name: tl(c.name) },
      })),
    },
  });

  return (
    <div className="section-y">
      <div className="shell">
        <SectionHeader
          eyebrow={ui('footprints.eyebrow')}
          title={ui('footprints.title')}
          lede={ui('footprints.lede')}
          aside={
            <span className="font-mono text-[0.8125rem] tracking-wider text-ink-2 uppercase">
              {visitedCountries.length} {ui('footprints.countries')}
            </span>
          }
        />
      </div>

      {/*
        The map is the one deliberately dark band on this page: gold on black
        is what makes a handful of countries read as lit up. On white the same
        fill looks like a muddy highlighter.
      */}
      <Reveal>
        <div
          className="tone-dark relative overflow-hidden border-y border-line bg-surface py-10 md:py-14"
          style={
            {
              '--map-land': '#17171a',
              '--map-stroke': '#232327',
              '--map-gold': '#d8b65a',
              '--map-gold-bright': '#f3d98a',
            } as React.CSSProperties
          }
        >
          <div className="shell">
            <Suspense
              fallback={<div className="aspect-[2/1] w-full animate-pulse rounded-xl bg-surface-3" />}
            >
              <WorldMap selected={selected} onSelect={setSelected} />
            </Suspense>
          </div>
        </div>
      </Reveal>

      <div className="shell">
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visitedCountries.map((country) => {
            const isSelected = selected === country.iso;
            return (
              <li key={country.iso}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelected(isSelected ? null : country.iso)}
                  className={cn(
                    'card h-full w-full rounded-2xl p-5 text-left transition-[border-color,transform,box-shadow] duration-300 ease-out-expo',
                    'hover:-translate-y-1 hover:border-amber/70',
                    isSelected && 'border-amber/70 shadow-[0_18px_40px_-16px_var(--color-amber)]',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className={cn(
                        'inline-flex h-7 min-w-9 items-center justify-center rounded-md px-1.5 font-mono text-[0.8125rem] tracking-wider transition-colors duration-300',
                        isSelected
                          ? 'bg-amber text-white'
                          : 'bg-amber-soft text-amber',
                      )}
                    >
                      {country.code}
                    </span>
                    <span className="font-display text-[1.0625rem] font-semibold text-ink">
                      {tl(country.name)}
                    </span>
                  </span>
                  {country.note && (
                    <span className="mt-3 block text-[0.9375rem] leading-relaxed text-ink-2">
                      {tl(country.note)}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <Reveal className="mt-10" y={12}>
          <p className="max-w-2xl text-[0.875rem] leading-relaxed text-ink-2">
            {ui('footprints.note')}
          </p>
        </Reveal>
      </div>
    </div>
  );
}
