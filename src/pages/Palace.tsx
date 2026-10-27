import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { profile, SITE_URL } from '@/content/site';
import { exhibits, type Exhibit } from '@/content/palace';
import { useLocale } from '@/i18n/LocaleProvider';
import { useSeo } from '@/hooks/useSeo';
import { useScrollLock } from '@/hooks/useUi';
import { SectionHeader } from '@/components/primitives/Section';
import { Reveal } from '@/components/primitives/Reveal';
import { ArrowUpRight, Close } from '@/components/primitives/Icons';
import { cn } from '@/lib/utils';

const HallScene = lazy(() =>
  import('@/components/sections/HallScene').then((m) => ({ default: m.HallScene })),
);

/**
 * An explorable room standing in for a career.
 *
 * It is a toy, and it is built so that being a toy costs nothing: every
 * exhibit is also a plain button in the list below the scene, so the content
 * is reachable without a keyboard, without pointer precision, and without
 * playing anything. Nothing here is the only route to any information —
 * each exhibit links to the case study it came from.
 */
export default function Palace() {
  const { tl, ui, locale } = useLocale();
  const [open, setOpen] = useState<Exhibit | null>(null);

  useScrollLock(Boolean(open));

  useSeo({
    title: `${ui('palace.title')} — ${tl(profile.name)}`,
    description: ui('palace.lede'),
    path: '/hall',
    locale,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: ui('palace.title'),
      url: `${SITE_URL}/hall`,
      description: ui('palace.lede'),
    },
  });

  return (
    <div>
      {/*
        The scene breaks out of the content column and takes the whole
        viewport. A game scene letterboxed inside a text column reads as a
        figure in an article — which is exactly what the previous version
        was, and exactly the note it got. Everything below it is still a
        normal page, so scrolling leaves the game rather than trapping you.
      */}
      <Suspense
        fallback={<div className="h-[100svh] w-full animate-pulse bg-surface-2" aria-hidden />}
      >
        <HallScene onOpen={setOpen} paused={Boolean(open)} />
      </Suspense>

      <div className="shell section-y">
        <Reveal>
          <SectionHeader
            eyebrow={ui('palace.eyebrow')}
            title={ui('palace.title')}
            lede={ui('palace.lede')}
          />
        </Reveal>

        {/*
          The same exhibits as plain buttons. This is not a fallback bolted
          on afterwards — it is how the page is meant to work for anyone who
          would rather read than walk.
        */}
        <h2 className="label mt-12 mb-5">{ui('palace.index')}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {exhibits.map((exhibit) => (
            <li key={exhibit.id}>
              <button
                type="button"
                onClick={() => setOpen(exhibit)}
                className={cn(
                  'card h-full w-full rounded-xl p-4 text-left transition-[border-color,transform] duration-300 ease-out-expo',
                  'hover:-translate-y-0.5 hover:border-amber/70',
                )}
              >
                <span className="font-display text-[1rem] font-semibold text-ink">
                  {tl(exhibit.title)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-70 grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exhibit-title"
        >
          <button
            type="button"
            aria-label={ui('nav.close')}
            onClick={() => setOpen(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="card relative w-full max-w-xl rounded-2xl p-6 md:p-8">
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label={ui('nav.close')}
              className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-lg border border-line text-ink-2 transition-colors hover:text-ink"
            >
              <Close className="size-5" />
            </button>

            <h3
              id="exhibit-title"
              className="pr-12 font-display text-[1.375rem] leading-snug font-semibold text-ink"
            >
              {tl(open.title)}
            </h3>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink">{tl(open.body)}</p>

            {open.href && (
              <Link
                to={open.href}
                onClick={() => setOpen(null)}
                className="group mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-accent-ink"
              >
                {ui('palace.readCase')}
                <ArrowUpRight className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
