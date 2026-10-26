import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Reveals text word by word with a blur-in.
 *
 * Splitting into spans breaks text selection and copy-paste subtly, so the
 * original string is kept in `aria-label` and the spans are hidden from the
 * accessibility tree. Reduced motion returns the plain string with no spans
 * at all.
 */
export function WordReveal({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  as: Tag = 'span',
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'span' | 'h1' | 'h2' | 'p';
}) {
  const reduced = useReducedMotion();
  const words = text.split(' ');

  if (reduced) return <Tag className={className}>{text}</Tag>;

  const MotionTag = motion[Tag];

  return (
    <MotionTag
      className={cn(className)}
      aria-label={text}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }}
    >
      {words.map((word, i) => (
        // `inline-block` is required for the y-transform; the trailing space is
        // a real space node so copied text keeps its word boundaries.
        <span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden align-bottom"
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: '0.9em', opacity: 0, filter: 'blur(7px)' },
              show: {
                y: 0,
                opacity: 1,
                filter: 'blur(0px)',
                transition: { duration: 0.75, ease: EASE },
              },
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </MotionTag>
  );
}
