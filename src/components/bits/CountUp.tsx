import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type CountUpProps = {
  to: number;
  /** Rendered before/after the number, e.g. `%`, `×`, `ms`. */
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  decimals?: number;
  className?: string;
};

/**
 * Counts from 0 to `to` the first time it scrolls into view.
 *
 * Reduced motion renders the final value immediately — the number is the
 * content, so it must never be withheld for the sake of an animation.
 */
export function CountUp({
  to,
  prefix = '',
  suffix = '',
  durationMs = 1400,
  decimals = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(() => (reduced ? to : 0));

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }
    if (!inView) return;

    let frame = 0;
    const start = performance.now();
    // easeOutExpo: fast arrival, long settle — matches the site's motion ease.
    const ease = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(to * ease(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, durationMs, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
