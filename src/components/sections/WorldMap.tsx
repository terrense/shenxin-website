import { useId, useState } from 'react';
import { WORLD_SHAPES, WORLD_VIEWBOX } from '@/content/world-map';
import { visitedCountries, visitedIsoSet } from '@/content/travel';
import { useLocale } from '@/i18n/LocaleProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

/**
 * World map with visited countries picked out in gold.
 *
 * The geometry is static SVG generated at build time by
 * scripts/build-world-map.mjs — no map library, no tile server, no fetch, so
 * nothing here needs an exception in the CSP.
 *
 * Unvisited countries are drawn, not omitted. A gold shape floating on empty
 * space is a decoration; the same shape against the rest of the world is a
 * statement about where you have actually been. They sit just above the
 * background, enough to read the continents and not enough to compete.
 *
 * Visited countries are real `<button>`s: keyboard reachable, announced, and
 * they drive the same selection the list below uses.
 */
/**
 * Below this projected area (square pixels of the viewBox) a country gets a
 * locator ring. Russia is 22287 and China 7249; Türkiye, Belarus and the UAE
 * are 631, 215 and 54.
 */
const RING_AREA_THRESHOLD = 1200;

export function WorldMap({
  selected,
  onSelect,
  className,
}: {
  selected: string | null;
  onSelect: (iso: string | null) => void;
  className?: string;
}) {
  const { tl } = useLocale();
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const glowId = useId();

  const active = hovered ?? selected;
  const byIso = new Map(visitedCountries.map((c) => [c.iso, c]));

  return (
    <figure className={cn('relative', className)}>
      <svg
        viewBox={WORLD_VIEWBOX}
        className="block w-full"
        role="img"
        aria-label={`World map with ${visitedCountries.length} countries highlighted: ${visitedCountries
          .map((c) => tl(c.name))
          .join(', ')}`}
      >
        <defs>
          {/* A soft bloom under the gold, so a small country like the UAE
              still registers at this scale. */}
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Layer 1: the rest of the world. Decorative, so it is hidden from
            the accessibility tree — the figure's label carries the meaning. */}
        <g aria-hidden fill="var(--map-land)" stroke="var(--map-stroke)" strokeWidth="0.4">
          {WORLD_SHAPES.filter((s) => !visitedIsoSet.has(s.id)).map((s) => (
            <path key={s.id} d={s.d} />
          ))}
        </g>

        {/* Layer 2: the visited countries. */}
        <g filter={`url(#${glowId})`}>
          {WORLD_SHAPES.filter((s) => visitedIsoSet.has(s.id)).map((s) => {
            const country = byIso.get(s.id);
            const isActive = active === s.id;
            return (
              <path
                key={s.id}
                d={s.d}
                role="button"
                tabIndex={0}
                aria-pressed={selected === s.id}
                aria-label={country ? tl(country.name) : s.name}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(s.id)}
                onBlur={() => setHovered(null)}
                onClick={() => onSelect(selected === s.id ? null : s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(selected === s.id ? null : s.id);
                  }
                }}
                className={cn(
                  'cursor-pointer outline-none',
                  !reduced && 'transition-[fill] duration-300 ease-out-expo',
                  'focus-visible:stroke-white focus-visible:[stroke-width:1.5]',
                )}
                fill={isActive ? 'var(--map-gold-bright)' : 'var(--map-gold)'}
                stroke="var(--map-gold-bright)"
                strokeWidth={isActive ? 1 : 0.3}
              />
            );
          })}
        </g>

        {/* Layer 3: locator rings, on top and only where they are needed.
            Russia and China are unmissable; Türkiye, Belarus and the UAE
            cover 631, 215 and 54 square pixels of this viewBox and would
            otherwise vanish, making the map quietly under-report where
            someone has actually been. Drawing a ring on a large country as
            well would just be clutter, so the threshold does the choosing. */}
        <g aria-hidden fill="none" stroke="var(--map-gold-bright)">
          {WORLD_SHAPES.filter(
            (s) => visitedIsoSet.has(s.id) && s.cx !== null && s.area < RING_AREA_THRESHOLD,
          ).map((s) => {
            const isActive = active === s.id;
            return (
              <circle
                key={`ring-${s.id}`}
                cx={s.cx!}
                cy={s.cy!}
                r={isActive ? 14 : 10}
                strokeWidth={isActive ? 1.8 : 1}
                opacity={isActive ? 1 : 0.65}
                className={cn(!reduced && 'transition-all duration-300 ease-out-expo')}
              />
            );
          })}
        </g>
      </svg>
    </figure>
  );
}
