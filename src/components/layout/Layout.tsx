import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useLocale } from '@/i18n/LocaleProvider';
import { ScrollProgress } from './Ambience';
import { SparkleTrail } from '@/components/bits/SparkleTrail';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Restores sane scroll behaviour for a client-side router.
 *
 * - A hash navigates to that element (after a frame, so the target exists).
 * - A path change without a hash goes to the top.
 * - Returning via browser back/forward is left alone: the browser has already
 *   restored the position and overriding it is disorienting.
 */
function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      // rAF, not setTimeout: the target may be in a subtree React has queued
      // but not yet committed.
      const frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
          block: 'start',
        });
      });
      return () => cancelAnimationFrame(frame);
    }

    if (key === 'default') return; // first load — respect a browser restore
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash, key]);

  return null;
}

export function Layout() {
  const { ui } = useLocale();

  // The boot screen in index.html is removed only once React has painted, so
  // there is never a flash of unstyled or empty content.
  useEffect(() => {
    const boot = document.getElementById('boot');
    if (!boot) return;
    boot.style.opacity = '0';
    const timer = window.setTimeout(() => boot.remove(), 420);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div id="top" className="relative flex min-h-dvh flex-col bg-surface">
      <ScrollProgress />
      <SparkleTrail />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-surface"
      >
        {ui('nav.skip')}
      </a>

      <Header />
      <ScrollManager />

      <main id="main" className="flex-1" style={{ paddingTop: 'var(--header-h)' }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
