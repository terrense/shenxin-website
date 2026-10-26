import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { profile } from '@/content/site';
import { useLocale } from '@/i18n/LocaleProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { HeroBackdrop } from '@/components/three/HeroBackdrop';
import { WordReveal } from '@/components/bits/WordReveal';
import { RotatingText } from '@/components/bits/RotatingText';
import { CountUp } from '@/components/bits/CountUp';
import { ArrowRight, ArrowUpRight } from '@/components/primitives/Icons';
import { ProvenanceMark } from '@/components/primitives/Provenance';
import { EASE } from '@/lib/motion';

/**
 * Splits a metric like `450M` or `−31%` into a numeric part and a unit, so the
 * number can animate while the unit stays put. Falls back to rendering the
 * whole string statically when it is not numeric (`0-copy`, `local`, `CI`).
 */
function MetricValue({ value, countTo }: { value: string; countTo?: number }) {
  if (countTo === undefined) return <>{value}</>;
  const suffix = value.replace(/^[\d.,\s]+/, '');
  return <CountUp to={countTo} suffix={suffix} />;
}

export function Hero() {
  const { tl, ui, locale } = useLocale();
  const reduced = useReducedMotion();

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      // `tone-dark` flips the colour tokens for this band only. The page is
      // light; the hero is the one deliberately dark stage, the way Apple
      // opens a product page. White-on-black display type is the highest
      // contrast pairing on the whole site.
      className="tone-dark relative isolate flex min-h-[min(92svh,50rem)] items-center overflow-hidden pt-12 pb-20"
    >
      {/* Decorative WebGL field, or its static equivalent. */}
      <div className="absolute inset-0 -z-10">
        <HeroBackdrop />
        {/* Readability scrim: the field is brightest in the middle, which is
            exactly where the headline sits. */}
        <div className="absolute inset-0 bg-[radial-gradient(75%_65%_at_28%_45%,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.62)_45%,rgba(0,0,0,0.25)_100%)]" />
      </div>

      <div className="shell w-full">
        <div className="max-w-4xl">
          <motion.p
            className="label mb-7 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span aria-hidden className="h-px w-10 bg-linear-to-r from-accent to-transparent" />
            {ui('hero.eyebrow')}
            <span aria-hidden className="size-1 rounded-full bg-accent/70" />
            {tl(profile.location)}
          </motion.p>

          <h1
            id="hero-heading"
            className="font-display text-[clamp(2.75rem,7.5vw,5.5rem)] leading-[1.02] font-semibold tracking-[-0.035em]"
          >
            <WordReveal text={tl(profile.name)} delay={0.15} className="block text-ink" />
            <span className="mt-2 block text-accent">{tl(profile.role)}</span>
          </h1>

          <motion.p
            className="mt-8 max-w-2xl text-[clamp(1.1875rem,2vw,1.5rem)] leading-[1.45] text-ink"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
          >
            {tl(profile.headline)}
          </motion.p>

          <motion.div
            className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
          >
            <span className="text-ink-3">{ui('hero.working')}</span>
            <RotatingText
              key={locale}
              phrases={profile.rotating.map((phrase) => tl(phrase))}
              className="text-accent-ink"
            />
          </motion.div>

          <motion.div
            className="mt-11 flex flex-wrap items-center gap-3"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
          >
            {/* Apple's CTA shape: a solid blue pill and a plain text link
                beside it. The pill is the only filled button in the viewport. */}
            <Link
              to="/#work"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-7 text-[1.0625rem] font-medium text-white transition-opacity duration-200 hover:opacity-90"
            >
              {ui('hero.cta.work')}
              <ArrowRight className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
            </Link>
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex h-12 items-center gap-2 rounded-full border border-line px-7 text-[1.0625rem] text-ink transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              {ui('hero.cta.contact')}
              <ArrowUpRight className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </motion.div>

          {/* Stat rail. Four numbers, each defensible — see src/content/site.ts. */}
          <motion.dl
            className="mt-16 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-7 border-t border-line-2 pt-8 sm:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.05 }}
          >
            {profile.stats.map((stat) => (
              <div key={stat.value}>
                <dd className="font-display text-[1.75rem] leading-none font-semibold tabular-nums text-ink">
                  <MetricValue value={stat.value} countTo={stat.countTo} />
                  <ProvenanceMark provenance={stat.provenance} />
                </dd>
                <dt className="mt-2 text-[0.9375rem] font-medium text-ink">{tl(stat.label)}</dt>
                {stat.detail && (
                  <p className="mt-1 text-[0.8125rem] leading-snug text-ink-2">
                    {tl(stat.detail)}
                  </p>
                )}
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      {!reduced && (
        <motion.div
          aria-hidden
          className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <span className="label">{ui('hero.scroll')}</span>
          <span className="relative h-9 w-px overflow-hidden bg-ink/12">
            <motion.span
              className="absolute inset-x-0 top-0 h-3 bg-accent"
              animate={{ y: ['-100%', '300%'] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </motion.div>
      )}
    </section>
  );
}
