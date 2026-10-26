import type { Provenance } from '@/content/types';
import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/lib/utils';

/**
 * Marks a figure whose value is not a measured result.
 *
 * `measured` and `spec` figures render nothing — the overwhelming majority of
 * numbers should be one of those, and a badge on every metric would be noise.
 * Only `illustrative` gets a visible marker, because that is the case where a
 * reader would otherwise reasonably assume an experimental result.
 */
export function ProvenanceMark({
  provenance = 'illustrative',
  className,
}: {
  provenance?: Provenance;
  className?: string;
}) {
  const { ui } = useLocale();
  if (provenance !== 'illustrative') return null;

  return (
    <span
      title={ui('provenance.illustrativeHelp')}
      className={cn(
        'ml-1.5 inline-flex translate-y-[-0.15em] items-center rounded border border-amber/30 bg-amber/10 px-1 py-px align-middle font-mono text-[0.8125rem] leading-none tracking-wider text-amber/90 uppercase',
        className,
      )}
    >
      {ui('provenance.illustrative')}
    </span>
  );
}

/**
 * Section-level disclosure, shown once wherever illustrative figures appear
 * together. The inline marks say *which* numbers; this says what that means.
 */
export function ProvenanceNote({ className }: { className?: string }) {
  const { ui } = useLocale();
  return (
    <p
      className={cn(
        'mt-4 flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink-3',
        className,
      )}
    >
      <span
        aria-hidden
        className="mt-[0.35em] inline-block size-1 shrink-0 rounded-full bg-amber/70"
      />
      {ui('provenance.note')}
    </p>
  );
}
