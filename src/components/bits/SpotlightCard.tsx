import {
  useCallback,
  useRef,
  useState,
  type ElementType,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

/**
 * A card that lights up where the pointer is.
 *
 * Implemented with CSS custom properties written on the element rather than
 * React state, so pointer movement never triggers a re-render. The only state
 * is a boolean for whether the pointer is inside, which gates the opacity
 * transition.
 */
export function SpotlightCard({
  children,
  className,
  /**
   * CSS colour for the spotlight core.
   *
   * Tuned for a light surface: the original 11% alpha was calibrated against
   * a near-black card and is effectively invisible on white. A spotlight has
   * to be strong enough to read as deliberate, or it just looks like a
   * rendering artefact.
   */
  color = 'rgba(0, 113, 227, 0.3)',
  /** Tighter than the old 420px — a smaller pool reads as a light source
   *  following the pointer, a huge one reads as the card changing colour. */
  radius = 300,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  radius?: number;
  as?: 'div' | 'article' | 'li';
}) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const reduced = useReducedMotion();

  // Widened to ElementType so React does not intersect the prop types of every
  // member of the `as` union — which makes the event handlers unassignable.
  const Tag = as as ElementType;

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const el = ref.current;
      // Coarse pointers "hover" on tap, which looks like a stuck highlight.
      if (!el || reduced || event.pointerType !== 'mouse') return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      el.style.setProperty('--my', `${event.clientY - rect.top}px`);
    },
    [reduced],
  );

  return (
    <Tag
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerEnter={(e: PointerEvent<HTMLElement>) =>
        e.pointerType === 'mouse' && setActive(true)
      }
      onPointerLeave={() => setActive(false)}
      className={cn('group relative overflow-hidden', className)}
      style={
        {
          '--spot-color': color,
          '--spot-radius': `${radius}px`,
        } as React.CSSProperties
      }
    >
      {/* Two stacked pools: a tight bright core and a wide soft falloff. One
          gradient alone either reads as a hard disc or as a vague wash. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 transition-opacity duration-300 ease-out-expo"
        style={{
          opacity: active ? 1 : 0,
          background: [
            'radial-gradient(calc(var(--spot-radius) * 0.45) circle at var(--mx, 50%) var(--my, 0%), var(--spot-color), transparent 70%)',
            'radial-gradient(var(--spot-radius) circle at var(--mx, 50%) var(--my, 0%), var(--spot-color), transparent 75%)',
          ].join(','),
        }}
      />
      {children}
    </Tag>
  );
}
