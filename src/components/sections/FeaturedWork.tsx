import { Link } from 'react-router-dom';
import { featuredProjects, projects } from '@/content';
import { useLocale } from '@/i18n/LocaleProvider';
import { Section, SectionHeader } from '@/components/primitives/Section';
import { Reveal } from '@/components/primitives/Reveal';
import { Marquee } from '@/components/bits/Marquee';
import { ArrowRight } from '@/components/primitives/Icons';
import { ProjectCard } from './ProjectCard';

/** Every distinct stack entry, for the ticker under the grid. */
const allStack = Array.from(new Set(projects.flatMap((p) => p.stack))).sort();

export function FeaturedWork() {
  const { ui } = useLocale();

  return (
    <Section id="work" tone="band">
      <SectionHeader
        eyebrow={ui('work.eyebrow')}
        title={ui('work.title')}
        lede={ui('work.lede')}
        aside={
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 font-mono text-[0.8125rem] tracking-wider uppercase text-ink-2 transition-colors hover:text-accent-ink"
          >
            {ui('work.viewAll')}
            <span className="text-ink-3">({projects.length})</span>
            <ArrowRight className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
          </Link>
        }
      />

      {/*
        Bento grid. One column on phones, six at `lg` — see `bentoSpan` in
        src/lib/utils.ts for how the declared project order tiles it without
        holes. `auto-rows` keeps row-spanning tiles proportional instead of
        letting a tall tile stretch its row.
      */}
      <ul className="grid auto-rows-[minmax(0,auto)] grid-cols-1 gap-4 md:grid-cols-6 lg:auto-rows-[15.5rem] lg:gap-5">
        {featuredProjects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </ul>

      <Reveal className="mt-12" y={10}>
        <div className="rule-fade mb-6" />
        <Marquee durationSec={56}>
          {allStack.map((item) => (
            <span
              key={item}
              className="shrink-0 font-mono text-[0.8125rem] tracking-[0.14em] whitespace-nowrap text-ink-3 uppercase"
            >
              {item}
              <span aria-hidden className="mx-3 text-ink-3">
                ·
              </span>
            </span>
          ))}
        </Marquee>
      </Reveal>
    </Section>
  );
}
