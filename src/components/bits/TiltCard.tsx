import { useRef, type PointerEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMinWidth } from '@/hooks/useUi';
import { cn } from '@/lib/utils';

/**
 * Subtle 3D tilt toward the pointer.
 *
 * Kept to ±5° — enough to feel responsive, not enough to look like a gimmick.
 * Disabled entirely under reduced motion and below 1024px, where there is no
 * precise pointer and the transform only costs compositing work.
 */
export function TiltCard({
  children,
  className,
  maxDeg = 5,
}: {
  children: ReactNode;
  className?: string;
  maxDeg?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isDesktop = useMinWidth(1024);
  const enabled = !reduced && isDesktop;

  // -0.5 … 0.5, relative to the card centre.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const config = { stiffness: 180, damping: 22, mass: 0.5 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [maxDeg, -maxDeg]), config);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-maxDeg, maxDeg]), config);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled || event.pointerType !== 'mouse') return;
    const rect = el.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = () => {
    px.set(0);
    py.set(0);
  };

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={cn('[perspective:1200px]', className)}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="size-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
