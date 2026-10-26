import type { ProjectCover } from '@/content/types';
import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/lib/utils';

/**
 * Project cover art with a mandatory honesty badge.
 *
 * `mediaKind: 'concept'` renders a visible "Concept visualization" label over
 * the image. That label is not decorative and must not be made optional: an
 * unlabelled generated illustration on an engineering case study is read as a
 * screenshot of the real system.
 *
 * `variant` picks the file as well as the layout. Cards get the downscaled
 * `thumb` — the home page shows six covers at once, and at full resolution
 * that is ~1.5 MB of artwork above the fold.
 *
 * Images sit in an aspect-ratio box and are lazy by default, so adding covers
 * cannot introduce layout shift.
 */
export function CoverImage({
  cover,
  className,
  imgClassName,
  variant = 'card',
  /** The first card in the viewport can skip lazy loading. */
  eager = false,
}: {
  cover: ProjectCover;
  className?: string;
  imgClassName?: string;
  variant?: 'card' | 'full';
  eager?: boolean;
}) {
  const { tl, ui } = useLocale();
  const src = variant === 'card' ? (cover.thumb ?? cover.src) : cover.src;
  const isConcept = cover.mediaKind === 'concept';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        src={src}
        alt={tl(cover.alt)}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        style={cover.focus ? { objectPosition: cover.focus } : undefined}
        className={cn('size-full object-cover', imgClassName)}
      />

      {isConcept && (
        <>
          {/* Local scrim behind the badge only — enough to keep it legible on
              a bright image without muting the artwork. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/55 to-transparent"
          />
          <span
            title={ui('media.conceptHelp')}
            className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 font-mono text-[0.8125rem] tracking-[0.08em] text-white uppercase backdrop-blur-sm"
          >
            <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#ffb340]" />
            {ui('media.concept')}
          </span>
        </>
      )}
    </div>
  );
}

/**
 * The caveat that belongs under a cover on a case-study page.
 *
 * Separate from `CoverImage` because it only makes sense where there is room
 * to read it. On a card the badge carries the warning; here the specific
 * discrepancy — wrong task, wrong hardware, invented on-screen numbers — is
 * spelled out before a reader can spot it themselves.
 */
export function CoverNote({ cover, className }: { cover: ProjectCover; className?: string }) {
  const { tl } = useLocale();
  if (!cover.note) return null;

  return (
    <p
      className={cn(
        'mt-3 flex items-start gap-2 text-[0.875rem] leading-relaxed text-ink-2',
        className,
      )}
    >
      <span
        aria-hidden
        className="mt-[0.45em] inline-block size-1.5 shrink-0 rounded-full bg-amber"
      />
      {tl(cover.note)}
    </p>
  );
}
