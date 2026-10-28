import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { navSections, profile } from '@/content/site';
import { LOCALE_LABELS, LOCALE_TAGS, useLocale } from '@/i18n/LocaleProvider';
import { LOCALES } from '@/content/types';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollLock } from '@/hooks/useUi';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { Close, Globe, Menu } from '@/components/primitives/Icons';

/** Wordmark. Doubles as the home link. */
function Mark() {
  const { tl } = useLocale();
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden className="relative grid size-7 place-items-center">
        <svg viewBox="0 0 32 32" className="size-7">
          <g stroke="url(#mark-grad)" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
            <path d="M9 10 L16 16 L9 22" fill="none" />
            <path d="M23 10 L16 16 L23 22" fill="none" />
          </g>
          <circle cx="16" cy="16" r="2.4" fill="url(#mark-grad)" />
          <defs>
            <linearGradient id="mark-grad" x1="4" y1="4" x2="28" y2="28">
              {/* Token-driven so the mark re-tints itself inside `.tone-dark`. */}
              <stop offset="0" stopColor="var(--color-accent)" />
              <stop offset="1" stopColor="var(--color-violet)" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className="font-display text-[0.9375rem] font-semibold tracking-tight text-ink">
        {tl(profile.name)}
      </span>
    </span>
  );
}

/**
 * Language switcher.
 *
 * A segmented control rather than a toggle: with three languages a toggle
 * would have to cycle, which means a Russian reader wanting English might
 * pass through Chinese to get there. Every option is visible and one click
 * away, and each is labelled in its own language.
 */
function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, ui } = useLocale();

  return (
    <div
      role="group"
      aria-label={ui('nav.lang')}
      className={cn(
        'inline-flex h-9 items-center gap-0.5 rounded-lg border border-line p-0.5',
        className,
      )}
    >
      <Globe aria-hidden className="mx-1.5 size-3.5 shrink-0 text-ink-3" />
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            lang={LOCALE_TAGS[code]}
            aria-pressed={active}
            onClick={() => setLocale(code)}
            className={cn(
              'rounded-md px-2 py-1 font-mono text-[0.8125rem] leading-none tracking-wider transition-colors duration-200',
              active
                ? 'bg-accent text-white'
                : 'text-ink-3 hover:bg-ink/[0.06] hover:text-ink',
            )}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}

export function Header() {
  const { tl, ui } = useLocale();
  const location = useLocation();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useScrollLock(open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Any navigation closes the drawer, including a hash change to the same page.
  useEffect(() => setOpen(false), [location]);

  // Only the home page opens with a dark hero behind the fixed bar.
  const overDarkHero = location.pathname === '/' && !scrolled;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ease-out-expo',
          // At the top of the home page the bar floats over the dark hero, so
          // it adopts the dark tone — otherwise near-black nav text would sit
          // on near-black background and vanish. Once scrolled it becomes the
          // usual translucent light bar.
          overDarkHero ? 'tone-dark border-b border-transparent bg-transparent' : null,
          scrolled
            ? 'border-b border-line-2 bg-surface/80 backdrop-blur-xl'
            : 'border-b border-transparent',
        )}
        style={{ height: 'var(--header-h)' }}
      >
        <div className="shell flex h-full items-center justify-between gap-6">
          <Link to="/" aria-label={ui('nav.home')} className="shrink-0">
            <Mark />
          </Link>

          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {navSections.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/#${item.id}`}
                    className="rounded-lg px-3 py-2 text-[0.8125rem] whitespace-nowrap text-ink-2 transition-colors duration-200 hover:bg-ink/[0.05] hover:text-ink"
                  >
                    {tl(item.label)}
                  </Link>
                </li>
              ))}
              {/* Real routes rather than hashes — these are their own pages. */}
              <li>
                <Link
                  to="/hall"
                  className="rounded-lg px-3 py-2 text-[0.8125rem] whitespace-nowrap text-ink-2 transition-colors duration-200 hover:bg-ink/[0.05] hover:text-ink"
                >
                  {ui('palace.eyebrow')}
                </Link>
              </li>
              <li>
                <Link
                  to="/footprints"
                  className="rounded-lg px-3 py-2 text-[0.8125rem] whitespace-nowrap text-ink-2 transition-colors duration-200 hover:bg-ink/[0.05] hover:text-ink"
                >
                  {ui('footprints.eyebrow')}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <a
              href={`mailto:${profile.email}`}
              // Accent fill, not ink: this is the one call to action in the
              // bar and it has to read instantly against both tones.
              className="hidden h-9 items-center rounded-full bg-accent px-4 text-[0.8125rem] font-medium text-white transition-opacity duration-200 hover:opacity-90 sm:inline-flex"
            >
              {ui('contact.email')}
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={ui('nav.menu')}
              aria-expanded={open}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-ink-2 transition-colors hover:text-ink xl:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-60 xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <button
              type="button"
              aria-label={ui('nav.close')}
              onClick={() => setOpen(false)}
              // Fixed black, not a token: this scrim must darken the page
              // behind the drawer, and `bg-surface` is white on a light page.
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={ui('nav.menu')}
              initial={reduced ? { opacity: 0 } : { x: '100%' }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: '100%' }}
              transition={{ duration: 0.34, ease: EASE }}
              className="card absolute inset-y-0 right-0 flex w-[min(20rem,86vw)] flex-col p-6"
            >
              <div className="mb-8 flex items-center justify-between">
                <Mark />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={ui('nav.close')}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-ink-2"
                >
                  <Close className="size-5" />
                </button>
              </div>

              <nav aria-label="Mobile" className="flex-1">
                <ul className="space-y-1">
                  {navSections.map((item, i) => (
                    <li key={item.id}>
                      <Link
                        to={`/#${item.id}`}
                        className="block rounded-lg px-3 py-3 font-display text-lg text-ink transition-colors hover:bg-ink/5 hover:text-ink"
                      >
                        <span className="mr-3 font-mono text-[0.8125rem] text-ink-3">
                          0{i + 1}
                        </span>
                        {tl(item.label)}
                      </Link>
                    </li>
                  ))}
                  <li className="pt-2">
                    <Link
                      to="/hall"
                      className="block rounded-lg px-3 py-3 font-display text-lg text-ink"
                    >
                      {ui('palace.eyebrow')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/footprints"
                      className="block rounded-lg px-3 py-3 font-display text-lg text-ink"
                    >
                      {ui('footprints.eyebrow')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/projects"
                      className="block rounded-lg px-3 py-3 font-display text-lg text-accent-ink"
                    >
                      {ui('nav.allWork')}
                    </Link>
                  </li>
                </ul>
              </nav>

              <div className="mt-6 space-y-3 border-t border-line-2 pt-6">
                <LanguageSwitcher className="w-full justify-center" />
                <a
                  href={`mailto:${profile.email}`}
                  className="flex h-11 items-center justify-center rounded-full bg-accent text-sm font-medium text-white"
                >
                  {ui('contact.email')}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
