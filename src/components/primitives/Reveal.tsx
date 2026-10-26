import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { DUR, EASE, inView } from '@/lib/motion';
import { cn } from '@/lib/utils';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds. Use sparingly — stagger via `RevealGroup` instead. */
  delay?: number;
  /** Translate distance in px. 0 gives a pure fade. */
  y?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'header' | 'footer';
};

/**
 * The single scroll-reveal used site-wide: fade + short rise + de-blur.
 *
 * Under `prefers-reduced-motion` the rise and blur are dropped and only the
 * opacity change remains, so the content still reads as arriving without any
 * movement on screen.
 */
export function Reveal({ children, className, delay = 0, y = 20, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={inView}
      transition={{
        duration: reduced ? DUR.base : DUR.slow,
        ease: EASE,
        delay: reduced ? 0 : delay,
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * Staggers direct children. Children must be `<RevealItem>` (or any element
 * using the `item` variant name) for the stagger to apply.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delay = 0.04,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={{
        hidden: {},
        show: {
          transition: reduced
            ? { staggerChildren: 0 }
            : { delayChildren: delay, staggerChildren: stagger },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  y = 16,
  /** Set to `li` when the item is a direct child of a list. */
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  as?: 'div' | 'li' | 'article';
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={cn(className)}
      variants={{
        hidden: reduced ? { opacity: 0 } : { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: reduced ? DUR.base : DUR.base * 1.5, ease: EASE },
        },
      }}
    >
      {children}
    </Tag>
  );
}
