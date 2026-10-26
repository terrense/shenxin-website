import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Cycles through phrases in place.
 *
 * The container is `aria-live="off"` and the whole element is announced once
 * from `aria-label`, because a politely-announced rotation every three seconds
 * is actively hostile to screen-reader users. Reduced motion pins the first
 * phrase and never starts the interval.
 */
export function RotatingText({
  phrases,
  intervalMs = 2800,
  className,
}: {
  phrases: string[];
  intervalMs?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || phrases.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % phrases.length), intervalMs);
    return () => window.clearInterval(id);
  }, [reduced, phrases.length, intervalMs]);

  // Keep the index valid if the phrase list changes (e.g. language toggle).
  const current = phrases[index % phrases.length] ?? phrases[0] ?? '';

  if (reduced) {
    return <span className={className}>{phrases[0]}</span>;
  }

  return (
    <span
      className={cn('relative inline-grid overflow-hidden align-bottom', className)}
      aria-label={phrases.join(', ')}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={current}
          aria-hidden
          initial={{ y: '0.85em', opacity: 0, filter: 'blur(5px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-0.85em', opacity: 0, filter: 'blur(5px)' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="col-start-1 row-start-1 whitespace-nowrap"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
