import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

/**
 * A home-page band. Owns the `id` used by navigation and scroll-spy, the
 * vertical rhythm, and the band's surface.
 *
 * Separation between sections comes from alternating surfaces — white, then
 * #f5f5f7 — rather than from rules or glows. That is how apple.com paces a
 * long page, and on a light ground it is far cleaner than a hairline: the eye
 * reads a change of plane without anything being drawn.
 */
export type SectionTone = 'plain' | 'band' | 'dark';

export function Section({
  id,
  children,
  className,
  tone = 'plain',
}: {
  id: string;
  children: ReactNode;
  className?: string;
  tone?: SectionTone;
}) {
  return (
    <section
      id={id}
      className={cn(
        'relative isolate section-y',
        tone === 'band' && 'bg-surface-2',
        // `tone-dark` re-points every colour token for this subtree, so the
        // children need no dark-specific classes of their own.
        tone === 'dark' && 'tone-dark bg-surface',
        className,
      )}
    >
      <div className="shell">{children}</div>
    </section>
  );
}

/**
 * Section heading block. The eyebrow carries the section number so the page
 * reads as a document rather than a stack of cards.
 */
export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = 'left',
  aside,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  align?: 'left' | 'center';
  /** Right-aligned slot on wide screens — a link, a count, a control. */
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'mb-12 md:mb-16',
        align === 'center' && 'text-center',
        // Boolean(): `aside` is a ReactNode, which can legally be 0 — and 0 is
        // not assignable to cn()'s falsy union.
        Boolean(aside) && 'md:flex md:items-end md:justify-between md:gap-10',
        className,
      )}
    >
      <Reveal className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        <p className="label mb-4 text-accent-ink">{eyebrow}</p>
        <h2 className="text-balance text-[clamp(2rem,4.8vw,3.5rem)] leading-[1.06] font-semibold">
          {title}
        </h2>
        {lede && (
          <p
            className={cn(
              // Primary ink, not secondary: a section lede is read, not skimmed.
              'mt-5 max-w-2xl text-[1.1875rem] leading-[1.55] text-ink',
              align === 'center' && 'mx-auto',
            )}
          >
            {lede}
          </p>
        )}
      </Reveal>

      {aside && (
        <Reveal delay={0.08} className="mt-8 shrink-0 md:mt-0 md:pb-2">
          {aside}
        </Reveal>
      )}
    </header>
  );
}
