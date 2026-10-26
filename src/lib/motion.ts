import type { Transition, Variants } from 'motion/react';

/**
 * The motion vocabulary. Three durations, one ease.
 *
 * Every variant here has a `reduced` twin that keeps the opacity change (so
 * reveals still read as reveals) but drops movement and blur, which are the
 * parts that cause discomfort.
 */

export const EASE = [0.22, 1, 0.36, 1] as const;

export const DUR = { fast: 0.18, base: 0.32, slow: 0.64 } as const;

export const spring: Transition = { type: 'spring', stiffness: 260, damping: 28, mass: 0.8 };

export const reveal: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DUR.slow, ease: EASE },
  },
};

export const revealReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.base } },
};

/** Parent that staggers its children's `reveal`. */
export const stagger = (delayChildren = 0.05, staggerChildren = 0.07): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base * 1.4, ease: EASE } },
};

/** Standard in-view trigger: once, when a third of the block is on screen. */
export const inView = { once: true, amount: 0.25, margin: '0px 0px -80px 0px' } as const;

export function pickReveal(reduced: boolean): Variants {
  return reduced ? revealReduced : reveal;
}
