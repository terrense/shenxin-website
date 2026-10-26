import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '@/content/types';
import { useLocale } from '@/i18n/LocaleProvider';
import { SpotlightCard } from '@/components/bits/SpotlightCard';
import { TiltCard } from '@/components/bits/TiltCard';
import { DomainTag, StatusPill, Tag } from '@/components/primitives/Tag';
import { ArrowUpRight } from '@/components/primitives/Icons';
import { ProvenanceMark } from '@/components/primitives/Provenance';
import { CoverImage } from '@/components/primitives/CoverImage';
import { coverFor } from '@/content/assets';
import { accentClasses, bentoSpan, cn } from '@/lib/utils';
import { CardMotif } from './CardMotif';

/**
 * One project tile.
 *
 * `variant="bento"` takes its grid footprint from `project.span` and shows
 * metrics; `variant="row"` is the denser form used on the project index.
 *
 * The whole card is a single `<Link>` — not a card with a nested link — so
 * there is one tab stop and one announced target per project.
 */
export function ProjectCard({
  project,
  variant = 'bento',
  index = 0,
}: {
  project: Project;
  variant?: 'bento' | 'row';
  index?: number;
}) {
  const { tl, ui } = useLocale();
  const accent = accentClasses[project.accent];
  const isAnchor = variant === 'bento' && project.span === 'anchor';
  // Project-level cover wins; otherwise fall back to the shared asset map, so
  // an asset pack can be wired up without touching the project files.
  const cover = project.cover ?? coverFor(project.slug);

  /**
   * Only the one anchor tile tilts. Applying it to every card turns a premium
   * detail into noise, and tilting a dense two-line card hurts legibility more
   * than the motion adds. TiltCard self-disables under reduced motion and
   * below 1024px, so this is a no-op on phones.
   */
  const Frame = ({ children }: { children: ReactNode }) =>
    isAnchor ? (
      <TiltCard className="h-full" maxDeg={3}>
        {children}
      </TiltCard>
    ) : (
      <>{children}</>
    );

  return (
    <SpotlightCard
      // In the bento grid the card *is* the list item. On the index page an
      // outer <RevealItem as="li"> already supplies it, so this must not be a
      // second <li>.
      as={variant === 'bento' ? 'li' : 'div'}
      color={`${accent.hex}1c`}
      className={cn(
        'card group relative rounded-2xl transition-[border-color,transform] duration-500 ease-out-expo hover:-translate-y-0.5',
        'hover:border-line',
        variant === 'bento' ? bentoSpan[project.span] : 'h-full',
      )}
    >
      {/* Cover art when it exists; the generated motif otherwise. The motif is
          a finished design, not a placeholder, so a project with no artwork
          looks intentional rather than unfinished. */}
      {!cover && <CardMotif motif={project.motif} accent={project.accent} />}

      <Frame>
        <Link
          to={`/projects/${project.slug}`}
          className="relative flex h-full flex-col p-5 sm:p-6 lg:p-7"
        >
          {cover && (
            <CoverImage
              cover={cover}
              eager={index === 0}
              // 16:9 on every tile, matching the source artwork. A wider crop
              // on the anchor tile cut the top and bottom off the dashboard
              // images, where the UI is the content.
              className="-mx-5 -mt-5 mb-5 aspect-[16/9] sm:-mx-6 sm:-mt-6 lg:-mx-7 lg:-mt-7"
            />
          )}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <DomainTag domain={project.domain} accent={project.accent} />
              {isAnchor &&
                project.alsoIn?.slice(0, 1).map((d) => <DomainTag key={d} domain={d} />)}
            </div>
            <StatusPill status={project.status} />
          </div>

          <p className="label mb-3">
            {String(index + 1).padStart(2, '0')} · {project.period}
          </p>

          <h3
            className={cn(
              'font-display font-semibold tracking-tight text-ink transition-colors duration-300',
              isAnchor
                ? 'text-[clamp(1.5rem,2.6vw,2.125rem)] leading-[1.12]'
                : 'text-xl leading-snug',
            )}
          >
            {tl(project.title)}
          </h3>

          <p
            className={cn(
              'mt-3 text-ink-2',
              isAnchor
                ? 'max-w-xl text-[0.9375rem] leading-relaxed'
                : 'text-sm leading-relaxed',
            )}
          >
            {isAnchor ? tl(project.summary) : tl(project.tagline)}
          </p>

          {/* Metrics are the strongest signal on a card, so they get the space
            on larger tiles and are dropped from the smallest. */}
          {variant === 'bento' && project.span !== 'cell' && (
            <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line-2 pt-5">
              {project.highlights.slice(0, 3).map((metric) => (
                <div key={metric.value}>
                  <dt className="sr-only">{tl(metric.label)}</dt>
                  <dd>
                    <span
                      className={cn(
                        'block font-display text-[1.375rem] leading-none font-semibold tabular-nums',
                        accent.text,
                      )}
                    >
                      {metric.value}
                      <ProvenanceMark provenance={metric.provenance} />
                    </span>
                    <span className="mt-1.5 block text-[0.8125rem] leading-tight text-ink-3">
                      {tl(metric.label)}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-auto pt-6">
            <div className="mb-4 flex flex-wrap gap-1.5">
              {project.stack.slice(0, isAnchor ? 6 : 3).map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
              {project.stack.length > (isAnchor ? 6 : 3) && (
                <Tag className="text-ink-3">+{project.stack.length - (isAnchor ? 6 : 3)}</Tag>
              )}
            </div>

            <span
              className={cn(
                'inline-flex items-center gap-1.5 font-mono text-[0.8125rem] tracking-wider uppercase transition-colors duration-300',
                'text-ink-3 group-hover:text-ink',
              )}
            >
              {ui('work.readCase')}
              <ArrowUpRight className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </Link>
      </Frame>
    </SpotlightCard>
  );
}
