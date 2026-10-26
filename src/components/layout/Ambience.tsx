import { motion, useScroll, useSpring } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Reading-progress hairline at the top of the viewport.
 *
 * The old dark build also painted a fixed grid and film grain behind
 * everything. On a white ground that texture only lowers contrast, which is
 * the opposite of what this redesign is for — so the page background is now
 * simply the surface colour, and separation comes from alternating section
 * bands instead.
 *
 * Hidden under reduced motion: a constantly-updating element is exactly the
 * ambient movement that setting asks us to remove.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 220, damping: 34, mass: 0.4 });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: width }}
      className="fixed inset-x-0 top-0 z-60 h-[2px] origin-left bg-accent"
    />
  );
}
