import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { DomainSection as DomainSectionSpec } from '@/content/domains';
import { getProject } from '@/content';
import { useLocale } from '@/i18n/LocaleProvider';
import type { UIKey } from '@/i18n/dictionary';
import { Section, SectionHeader } from '@/components/primitives/Section';
import { Reveal, RevealGroup, RevealItem } from '@/components/primitives/Reveal';
import { Diagram } from '@/components/diagrams/Diagram';
import { ArrowUpRight } from '@/components/primitives/Icons';
import { cn } from '@/lib/utils';

/**
 * One domain deep-dive band: diagram, three defensible claims, related cases.
 *
 * All three home-page domain sections share this component and differ only by
 * data in `src/content/domains.ts` — the alternative was three nearly-identical
 * 150-line files that would drift apart within a month.
 */
export function DomainSection({ spec }: { spec: DomainSectionSpec }) {
  const { tl, ui } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);

  const active = spec.diagrams[activeIndex] ?? spec.diagrams[0]!;

  const related = spec.projectSlugs
    .map((slug) => getProject(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <Section id={spec.id} tone={spec.tone}>
      <SectionHeader
        eyebrow={ui(`${spec.copyKey}.eyebrow` as UIKey)}
        title={ui(`${spec.copyKey}.title` as UIKey)}
        lede={ui(`${spec.copyKey}.lede` as UIKey)}
      />

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-7 xl:col-span-8">
          {spec.diagrams.length > 1 && (
            <div
              role="tablist"
              aria-label="Diagram selector"
              className="mb-5 flex flex-wrap gap-1 rounded-xl border border-line bg-surface-2/60 p-1"
            >
              {spec.diagrams.map((diagram, i) => (
                <button
                  key={diagram.id}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'rounded-lg px-3.5 py-2 text-[0.8125rem] transition-colors duration-200',
                    i === activeIndex ? 'bg-ink/10 text-ink' : 'text-ink-3 hover:text-ink',
                  )}
                >
                  {tl(diagram.label)}
                </button>
              ))}
            </div>
          )}

          {/* Keying on the diagram id remounts on tab switch, which resets the
              selected node — the old selection would be meaningless anyway. */}
          <Diagram key={active.id} id={active.id} caption={tl(active.caption)} />
        </Reveal>

        <div className="lg:col-span-5 xl:col-span-4">
          <RevealGroup className="space-y-7">
            {spec.points.map((point) => (
              <RevealItem key={point.label.en}>
                <div className="border-l border-line pl-5">
                  <h3 className="font-display text-[1.0625rem] leading-snug font-semibold text-ink">
                    {tl(point.label)}
                  </h3>
                  <p className="mt-2.5 text-[1rem] leading-relaxed text-ink">
                    {tl(point.body)}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          {related.length > 0 && (
            <Reveal className="mt-9" y={12}>
              <p className="label mb-4">{ui('work.readCase')}</p>
              <ul className="space-y-2">
                {related.map((project) => (
                  <li key={project.slug}>
                    <Link
                      to={`/projects/${project.slug}`}
                      className="group flex items-center justify-between gap-4 rounded-xl border border-line-2 bg-ink/[0.02] px-4 py-3.5 transition-colors duration-300 hover:border-accent/35 hover:bg-accent/[0.05]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[0.9375rem] font-medium text-ink">
                          {tl(project.title)}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[0.8125rem] text-ink-3">
                          {project.period}
                        </span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-ink-3 transition-all duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-ink" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </div>
    </Section>
  );
}
