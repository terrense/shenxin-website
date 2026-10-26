import type { ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

/**
 * Continuous horizontal ticker.
 *
 * The children are duplicated once and the track translates −50%, which makes
 * the loop seamless for any content width without measuring anything. The
 * duplicate is `aria-hidden` so the content is announced once.
 *
 * Reduced motion turns this into a normal horizontally-scrollable row, which is
 * both calmer and more useful.
 */
export function Marquee({
  children,
  className,
  /** Seconds for one full pass. Longer = slower. */
  durationSec = 42,
  fade = true,
}: {
  children: ReactNode;
  className?: string;
  durationSec?: number;
  fade?: boolean;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={cn('flex gap-3 overflow-x-auto pb-2', className)}>
        <div className="flex shrink-0 gap-3">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn('group relative overflow-hidden', className)}
      style={
        fade
          ? {
              maskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)',
              WebkitMaskImage:
                'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)',
            }
          : undefined
      }
    >
      {/* Duration overrides the token default; hover pauses so a reader can
          actually finish reading an item they noticed. */}
      <div
        className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${durationSec}s` }}
      >
        <div className="flex shrink-0 gap-3">{children}</div>
        <div aria-hidden className="flex shrink-0 gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}
