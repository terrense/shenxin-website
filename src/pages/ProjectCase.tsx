import { Link, useParams } from 'react-router-dom';
import { getProject, getProjectNeighbours } from '@/content';
import { profile, SITE_URL } from '@/content/site';
import type { CaseSectionId } from '@/content/types';
import { useLocale } from '@/i18n/LocaleProvider';
import type { UIKey } from '@/i18n/dictionary';
import { useSeo } from '@/hooks/useSeo';
import { useScrollSpy } from '@/hooks/useUi';
import { Reveal } from '@/components/primitives/Reveal';
import { DomainTag, StatusPill, Tag } from '@/components/primitives/Tag';
import { ArrowLeft, ArrowRight, linkKindIcon } from '@/components/primitives/Icons';
import { ProvenanceMark, ProvenanceNote } from '@/components/primitives/Provenance';
import { CoverImage, CoverNote } from '@/components/primitives/CoverImage';
import { coverFor } from '@/content/assets';
import { CaseBlockView } from '@/components/sections/CaseBlocks';
import { accentClasses, cn, externalLinkProps } from '@/lib/utils';
import NotFound from './NotFound';

export default function ProjectCase() {
  const { slug = '' } = useParams();
  const project = getProject(slug);
  const { tl, ui } = useLocale();

  // Hooks must run unconditionally, so the ids are derived before the guard.
  const sectionIds = (project?.sections ?? []).map((section) => `case-${section.id}`);
  const activeId = useScrollSpy(sectionIds, 120);

  if (!project) return <NotFound />;

  const accent = accentClasses[project.accent];
  const neighbours = getProjectNeighbours(project.slug);
  const cover = project.cover ?? coverFor(project.slug);

  return (
    <article className="pb-10">
      {/* ---------- Header ---------- */}
      {/* A tinted band rather than a blurred colour blob. On white a 130px
          blur at 16% reads as a smudge; a flat surface change reads as intent. */}
      <header className="relative isolate border-b border-line bg-surface-2 pt-14 pb-16 md:pt-20 md:pb-20">
        <div className="shell">
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 font-mono text-[0.8125rem] tracking-wider uppercase text-ink-3 transition-colors hover:text-accent-ink"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:-translate-x-1" />
            {ui('case.back')}
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <DomainTag domain={project.domain} accent={project.accent} />
            {project.alsoIn?.map((domain) => (
              <DomainTag key={domain} domain={domain} />
            ))}
            <StatusPill status={project.status} />
          </div>

          {cover && (
            <figure className="mt-7">
              <CoverImage
                cover={cover}
                variant="full"
                eager
                className="aspect-[16/9] rounded-2xl border border-line"
              />
              <figcaption>
                <CoverNote cover={cover} className="max-w-3xl" />
              </figcaption>
            </figure>
          )}

          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2rem,5.2vw,3.5rem)] leading-[1.06] font-semibold tracking-[-0.03em]">
            {tl(project.title)}
          </h1>
          <p
            className={cn(
              'mt-5 max-w-2xl text-[1.0625rem] leading-relaxed md:text-[1.1875rem]',
              accent.text,
            )}
          >
            {tl(project.tagline)}
          </p>
          <p className="mt-6 max-w-3xl text-[1.125rem] leading-relaxed text-ink">
            {tl(project.summary)}
          </p>

          <dl className="mt-11 grid gap-x-8 gap-y-7 border-t border-line-2 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="label mb-2">{ui('case.role')}</dt>
              <dd className="text-[0.9375rem] text-ink">{tl(project.role)}</dd>
            </div>
            <div>
              <dt className="label mb-2">{ui('case.period')}</dt>
              <dd className="font-mono text-[0.9375rem] text-ink">{project.period}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="label mb-2">{ui('case.stack')}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {project.stack.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </dd>
            </div>
          </dl>

          {project.links && project.links.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {project.links.map((link) => {
                const Icon = linkKindIcon[link.kind];
                return (
                  <a
                    key={link.href + link.kind}
                    href={link.href}
                    {...externalLinkProps}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-4 text-[0.8125rem] text-ink transition-colors hover:border-accent/45 hover:bg-accent/[0.06]"
                  >
                    <Icon className="size-4" />
                    {tl(link.label)}
                  </a>
                );
              })}
            </div>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {project.highlights.map((metric) => (
              <div key={metric.value + metric.label.en} className="card rounded-xl p-5">
                <p
                  className={cn(
                    'font-display text-[1.75rem] leading-none font-semibold tabular-nums',
                    accent.text,
                  )}
                >
                  {metric.value}
                  <ProvenanceMark provenance={metric.provenance} />
                </p>
                <p className="mt-2.5 text-[0.8125rem] font-medium text-ink">
                  {tl(metric.label)}
                </p>
                {metric.detail && (
                  <p className="mt-1 text-[0.8125rem] leading-snug text-ink-3">
                    {tl(metric.detail)}
                  </p>
                )}
              </div>
            ))}
          </div>
          {project.highlights.some((m) => m.provenance === 'illustrative') && (
            <ProvenanceNote className="max-w-2xl" />
          )}
        </div>
      </header>

      {/* ---------- Body ---------- */}
      <div className="shell">
        <div className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-14 lg:py-20">
          {/* Sticky contents. Hidden below lg, where it would cost more space
              than it saves. */}
          <nav aria-label={ui('case.contents')} className="hidden lg:col-span-3 lg:block">
            <div className="sticky" style={{ top: 'calc(var(--header-h) + 2rem)' }}>
              <p className="label mb-4">{ui('case.contents')}</p>
              <ol className="space-y-1 border-l border-line">
                {project.sections.map((section) => {
                  const id = `case-${section.id}`;
                  const on = activeId === id;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${id}`}
                        aria-current={on ? 'true' : undefined}
                        className={cn(
                          '-ml-px block border-l py-1.5 pl-4 text-[0.8125rem] transition-colors duration-200',
                          on
                            ? 'border-accent font-medium text-ink'
                            : 'border-transparent text-ink-3 hover:text-ink',
                        )}
                      >
                        {tl(section.title)}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          </nav>

          <div className="lg:col-span-9">
            {project.sections.map((section, index) => (
              <section
                key={section.id}
                id={`case-${section.id}`}
                className="scroll-mt-28 border-t border-line-2 py-12 first:border-0 first:pt-0 md:py-14"
                aria-labelledby={`heading-${section.id}`}
              >
                <Reveal>
                  <p className="label mb-4">
                    {String(index + 1).padStart(2, '0')} ·{' '}
                    {ui(`case.section.${section.id as CaseSectionId}` as UIKey)}
                  </p>
                  <h2
                    id={`heading-${section.id}`}
                    className="max-w-3xl text-[clamp(1.5rem,3vw,2.125rem)] leading-tight font-semibold"
                  >
                    {tl(section.title)}
                  </h2>
                  {section.lede && (
                    <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-3 italic">
                      {tl(section.lede)}
                    </p>
                  )}
                </Reveal>

                <div className="mt-8 space-y-7">
                  {section.blocks.map((block, i) => (
                    <Reveal key={i} y={14}>
                      <CaseBlockView block={block} />
                    </Reveal>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Prev / next ---------- */}
      {neighbours && (
        <nav aria-label="Project navigation" className="shell">
          <div className="grid gap-4 border-t border-line-2 pt-10 sm:grid-cols-2">
            {[
              { project: neighbours.prev, label: ui('case.prev'), dir: 'prev' as const },
              { project: neighbours.next, label: ui('case.next'), dir: 'next' as const },
            ].map((entry) => (
              <Link
                key={entry.dir}
                to={`/projects/${entry.project.slug}`}
                className={cn(
                  'group card rounded-2xl p-6 transition-[border-color,transform] duration-500 ease-out-expo hover:-translate-y-0.5 hover:border-line',
                  entry.dir === 'next' && 'sm:text-right',
                )}
              >
                <p
                  className={cn(
                    'label mb-3 flex items-center gap-2',
                    entry.dir === 'next' && 'sm:justify-end',
                  )}
                >
                  {entry.dir === 'prev' && (
                    <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                  )}
                  {entry.label}
                  {entry.dir === 'next' && (
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  )}
                </p>
                <p className="font-display text-lg leading-snug font-semibold text-ink">
                  {tl(entry.project.title)}
                </p>
                <p className="mt-1.5 text-sm text-ink-3">{tl(entry.project.tagline)}</p>
              </Link>
            ))}
          </div>
        </nav>
      )}

      <SeoForProject slug={project.slug} />
    </article>
  );
}

/**
 * Split out so the metadata effect sees a guaranteed-present project without
 * making the parent's hook order conditional.
 */
function SeoForProject({ slug }: { slug: string }) {
  const project = getProject(slug)!;
  const { tl, locale } = useLocale();

  useSeo({
    title: `${tl(project.title)} — ${tl(profile.name)}`,
    description: tl(project.summary).slice(0, 180),
    path: `/projects/${project.slug}`,
    locale,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: tl(project.title),
      description: tl(project.summary),
      author: { '@type': 'Person', name: tl(profile.name) },
      url: `${SITE_URL}/projects/${project.slug}`,
      keywords: project.stack.join(', '),
    },
  });

  return null;
}
