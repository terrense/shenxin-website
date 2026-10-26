import { useMemo, useState } from 'react';
import type { Domain } from '@/content/types';
import { activeDomains, projects, projectsByDomain } from '@/content';
import { domainLabels, profile } from '@/content/site';
import { useLocale } from '@/i18n/LocaleProvider';
import { useSeo } from '@/hooks/useSeo';
import { SectionHeader } from '@/components/primitives/Section';
import { RevealGroup, RevealItem } from '@/components/primitives/Reveal';
import { ProjectCard } from '@/components/sections/ProjectCard';
import { cn } from '@/lib/utils';

export default function Projects() {
  const { tl, ui, locale } = useLocale();
  const [filter, setFilter] = useState<Domain | 'all'>('all');

  useSeo({
    title: `${ui('nav.allWork')} — ${tl(profile.name)}`,
    description: ui('work.lede'),
    path: '/projects',
    locale,
  });

  const visible = useMemo(() => projectsByDomain(filter), [filter]);

  return (
    <div className="section-y">
      <div className="shell">
        <SectionHeader
          eyebrow={ui('work.eyebrow')}
          title={ui('nav.allWork')}
          lede={ui('work.lede')}
          aside={
            <span className="font-mono text-[0.8125rem] tracking-wider text-ink-3 uppercase">
              {visible.length} {ui('work.count')}
            </span>
          }
        />

        <div role="group" aria-label={ui('work.filter')} className="mb-10 flex flex-wrap gap-2">
          {(['all', ...activeDomains] as Array<Domain | 'all'>).map((domain) => {
            const on = filter === domain;
            return (
              <button
                key={domain}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(domain)}
                className={cn(
                  'h-9 rounded-lg border px-3.5 text-[0.8125rem] transition-colors duration-200',
                  on
                    ? 'border-accent/45 bg-accent/10 text-accent-ink'
                    : 'border-line text-ink-2 hover:border-line hover:text-ink',
                )}
              >
                {domain === 'all' ? ui('work.all') : tl(domainLabels[domain])}
                <span className="ml-2 font-mono text-[0.8125rem] text-ink-3">
                  {domain === 'all' ? projects.length : projectsByDomain(domain).length}
                </span>
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <p className="text-ink-3">{ui('work.empty')}</p>
        ) : (
          /* Keyed on the filter so the stagger replays when the set changes —
             otherwise the new cards appear with no transition at all. */
          <RevealGroup key={filter}>
            <ul className="grid gap-4 md:grid-cols-2 lg:gap-5">
              {visible.map((project, index) => (
                <RevealItem as="li" key={project.slug}>
                  <ProjectCard project={project} variant="row" index={index} />
                </RevealItem>
              ))}
            </ul>
          </RevealGroup>
        )}
      </div>
    </div>
  );
}
