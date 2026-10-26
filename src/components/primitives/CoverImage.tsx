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
 * Images are lazy and carry explicit dimensions via the aspect-ratio box, so
 * adding covers later cannot introduce layout shift.
 */
export function CoverImage({
  cover,
  className,
  imgClassName,
  /** Use the wider crop when one exists — case-study headers. */
  preferWide = false,
  /** The first card in the viewport can skip lazy loading. */
  eager = false,
}: {
  cover: ProjectCover;
  className?: string;
  imgClassName?: string;
  preferWide?: boolean;
  eager?: boolean;
}) {
  const { tl, ui } = useLocale();
  const src = preferWide && cover.wide ? cover.wide : cover.src;

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

      {/* Local scrim behind the badge only. The old full-image gradient was
          there to blend art into a dark page; on a light ground it just mutes
          the artwork, so the image is now shown at full strength. */}
      {cover.mediaKind === 'concept' && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/55 to-transparent"
          />
          <span
            title={ui('media.conceptHelp')}
            className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-md bg-black/65 px-2 py-1 font-mono text-[0.8125rem] tracking-[0.1em] text-white uppercase backdrop-blur-sm"
          >
            <span aria-hidden className="inline-block size-1.5 rounded-full bg-[#ffb340]" />
            {ui('media.concept')}
          </span>
        </>
      )}
    </div>
  );
}
