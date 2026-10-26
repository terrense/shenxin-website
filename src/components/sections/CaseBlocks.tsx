import type { CaseBlock, Metric } from '@/content/types';
import { useLocale } from '@/i18n/LocaleProvider';
import { useCopy } from '@/hooks/useUi';
import { Diagram } from '@/components/diagrams/Diagram';
import { CountUp } from '@/components/bits/CountUp';
import { AlertTriangle, Check, Copy, Info, Sparkle } from '@/components/primitives/Icons';
import { ProvenanceMark, ProvenanceNote } from '@/components/primitives/Provenance';
import { cn } from '@/lib/utils';

function MetricCard({ metric }: { metric: Metric }) {
  const { tl } = useLocale();
  const suffix = metric.countTo === undefined ? '' : metric.value.replace(/^[\d.,\s]+/, '');

  return (
    <div className="card rounded-xl p-5">
      <p className="font-display text-[1.75rem] leading-none font-semibold tabular-nums text-ink">
        {metric.countTo === undefined ? (
          metric.value
        ) : (
          <CountUp to={metric.countTo} suffix={suffix} />
        )}
        <ProvenanceMark provenance={metric.provenance} />
      </p>
      <p className="mt-2.5 text-[0.8125rem] font-medium text-ink">{tl(metric.label)}</p>
      {metric.detail && (
        <p className="mt-1 text-[0.8125rem] leading-snug text-ink-3">{tl(metric.detail)}</p>
      )}
    </div>
  );
}

function CodeBlock({ lang, code, caption }: { lang: string; code: string; caption?: string }) {
  const { copied, copy } = useCopy();

  return (
    <figure className="not-prose my-2">
      {/* Tinted, not white: a code block on a white page needs its own plane
          or it reads as body copy in a monospace font. */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface-2">
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5">
          <span className="font-mono text-[0.8125rem] tracking-[0.16em] text-ink-3 uppercase">
            {lang}
          </span>
          <button
            type="button"
            onClick={() => copy(code)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[0.8125rem] text-ink-3 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            {copied ? (
              <Check className="size-3.5 text-accent-ink" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? 'copied' : 'copy'}
          </button>
        </div>
        {/*
          No syntax highlighter. A Prism/Shiki bundle costs more than every
          other dependency on this site combined, for six code samples that are
          already short and commented. The language label does the orienting.
        */}
        <div className="overflow-x-auto">
          <pre className="px-4 py-4 text-[0.8125rem] leading-relaxed">
            <code className="font-mono text-ink">{code}</code>
          </pre>
        </div>
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-[0.8125rem] text-ink-3">{caption}</figcaption>
      )}
    </figure>
  );
}

// Solid `-soft` tints rather than low-alpha accents: a 5% wash is invisible on
// white, and these blocks carry the sharpest points in each case study.
const calloutTone = {
  insight: {
    icon: Sparkle,
    accent: 'text-accent-ink',
    border: 'border-accent/30',
    bg: 'bg-accent-soft',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'text-amber',
    border: 'border-amber/30',
    bg: 'bg-amber-soft',
  },
  note: { icon: Info, accent: 'text-violet', border: 'border-violet/30', bg: 'bg-violet-soft' },
} as const;

/**
 * Renders one case-study block.
 *
 * The block union in `src/content/types.ts` is the contract: adding a block
 * kind there produces a type error here until it is handled, which is why the
 * switch has no `default`.
 */
export function CaseBlockView({ block }: { block: CaseBlock }) {
  const { tl, ui } = useLocale();

  switch (block.kind) {
    case 'prose':
      return <p className="prose-lab max-w-3xl">{tl(block.body)}</p>;

    case 'bullets': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        // list-none throughout: the index/dash marker is rendered explicitly
        // below so ordered and unordered lists share one layout.
        <List className="max-w-3xl list-none space-y-5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-4">
              <span
                aria-hidden
                className="mt-0.5 shrink-0 font-mono text-[0.8125rem] tabular-nums text-accent-ink/70"
              >
                {block.ordered ? String(i + 1).padStart(2, '0') : '—'}
              </span>
              <span className="min-w-0">
                {item.label && (
                  <strong className="block font-display text-[0.9375rem] font-semibold text-ink">
                    {tl(item.label)}
                  </strong>
                )}
                <span className="mt-1 block text-[1rem] leading-relaxed text-ink">
                  {tl(item.body)}
                </span>
              </span>
            </li>
          ))}
        </List>
      );
    }

    case 'metrics': {
      // The inline marks say which figures are placeholders; the note explains
      // what that means. Shown only when there is something to explain.
      const hasIllustrative = block.items.some((m) => m.provenance === 'illustrative');
      return (
        <div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {block.items.map((metric) => (
              <MetricCard key={metric.value + metric.label.en} metric={metric} />
            ))}
          </div>
          {hasIllustrative && <ProvenanceNote />}
        </div>
      );
    }

    case 'code':
      return (
        <CodeBlock
          lang={block.lang}
          code={block.code}
          caption={block.caption ? tl(block.caption) : undefined}
        />
      );

    case 'diagram':
      return <Diagram id={block.id} caption={block.caption ? tl(block.caption) : undefined} />;

    case 'table':
      return (
        <figure className="not-prose my-2">
          {/* Tables are the most likely thing to overflow; it scrolls here,
              never on the page body. */}
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-ink/[0.03]">
                  {block.head.map((cell, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="border-b border-line px-4 py-3 font-mono text-[0.8125rem] tracking-[0.14em] text-ink-3 uppercase"
                    >
                      {tl(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="border-b border-line-2 last:border-0">
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={cn(
                          'px-4 py-3.5 align-top leading-relaxed',
                          c === 0 ? 'font-medium text-ink' : 'text-ink',
                        )}
                      >
                        {tl(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <figcaption className="mt-2.5 text-[0.8125rem] text-ink-3">
              {tl(block.caption)}
            </figcaption>
          )}
        </figure>
      );

    case 'callout': {
      const tone = calloutTone[block.tone];
      const Icon = tone.icon;
      return (
        <aside
          className={cn('max-w-3xl rounded-xl border px-5 py-5', tone.border, tone.bg)}
          aria-label={ui(`callout.${block.tone}`)}
        >
          <p className={cn('mb-2.5 flex items-center gap-2 label', tone.accent)}>
            <Icon className="size-3.5" />
            {ui(`callout.${block.tone}`)}
          </p>
          <h4 className="font-display text-[1.0625rem] leading-snug font-semibold text-ink">
            {tl(block.title)}
          </h4>
          <p className="mt-2.5 text-[1rem] leading-relaxed text-ink">{tl(block.body)}</p>
        </aside>
      );
    }

    case 'media': {
      const ratio = block.ratio ?? '16 / 9';
      return (
        <figure className="not-prose my-2">
          <div
            className="relative overflow-hidden rounded-xl border border-line bg-surface"
            style={{ aspectRatio: ratio }}
          >
            {/* Generated artwork is always labelled — see `MediaKind`. */}
            {block.mediaKind === 'concept' && (
              <span
                title={ui('media.conceptHelp')}
                className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface/80 px-2 py-1 font-mono text-[0.8125rem] tracking-[0.14em] text-ink-2 uppercase backdrop-blur-sm"
              >
                <span aria-hidden className="inline-block size-1 rounded-full bg-amber/80" />
                {ui('media.concept')}
              </span>
            )}
            {block.type === 'image' && (
              <img
                src={block.src}
                alt={tl(block.alt)}
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            )}
            {block.type === 'video' && (
              // No autoplay: an unprompted moving image is the single most
              // disruptive thing a case study can do.
              //
              // preload="none" with a poster means the page costs zero video
              // bytes until someone presses play — the poster is ~57 KB
              // against a ~5.7 MB file. `object-contain` because cropping a
              // demo recording can cut away the thing being demonstrated.
              <video
                src={block.src}
                poster={block.poster}
                controls
                preload="none"
                playsInline
                aria-label={tl(block.alt)}
                className="size-full bg-black object-contain"
              />
            )}
            {block.type === 'embed' && (
              <iframe
                src={block.src}
                title={tl(block.alt)}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                className="size-full"
              />
            )}
          </div>
          {block.caption && (
            <figcaption className="mt-2.5 text-[0.8125rem] text-ink-3">
              {tl(block.caption)}
            </figcaption>
          )}
        </figure>
      );
    }
  }
}
