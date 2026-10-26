import type { Accent, Domain, ProjectStatus } from '@/content/types';
import { domainLabels } from '@/content/site';
import { useLocale } from '@/i18n/LocaleProvider';
import { accentClasses, cn } from '@/lib/utils';

/** Neutral metadata chip. The default voice for stack items and tags. */
export function Tag({
  children,
  className,
  mono = true,
}: {
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-line-2 bg-ink/[0.035] px-2 py-1 text-[0.8125rem] leading-none text-ink-2',
        mono && 'font-mono tracking-wide',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DomainTag({ domain, accent }: { domain: Domain; accent?: Accent }) {
  const { tl } = useLocale();
  const a = accent ? accentClasses[accent] : null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[0.8125rem] leading-none tracking-wide',
        a ? cn(a.border, a.bg, a.text) : 'border-line bg-ink/[0.04] text-ink-2',
      )}
    >
      {tl(domainLabels[domain])}
    </span>
  );
}

/**
 * Project status. `active` gets the only animated dot on the page, which is
 * what makes it read as live rather than decorative.
 */
export function StatusPill({ status }: { status: ProjectStatus }) {
  const { ui } = useLocale();

  const tone: Record<ProjectStatus, { dot: string; text: string; pulse: boolean }> = {
    shipped: { dot: 'bg-accent', text: 'text-accent-ink', pulse: false },
    active: { dot: 'bg-amber', text: 'text-amber', pulse: true },
    research: { dot: 'bg-violet', text: 'text-violet', pulse: false },
    archived: { dot: 'bg-mist-600', text: 'text-ink-3', pulse: false },
  };
  const s = tone[status];

  return (
    <span className="inline-flex items-center gap-2 font-mono text-[0.8125rem] uppercase tracking-[0.16em]">
      <span className="relative flex size-1.5">
        {s.pulse && (
          <span
            aria-hidden
            className={cn(
              'absolute inline-flex size-full animate-ping rounded-full opacity-70',
              s.dot,
            )}
          />
        )}
        <span className={cn('relative inline-flex size-1.5 rounded-full', s.dot)} />
      </span>
      <span className={s.text}>{ui(`status.${status}`)}</span>
    </span>
  );
}
