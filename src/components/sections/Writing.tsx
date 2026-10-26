import { Link } from 'react-router-dom';
import { articles } from '@/content';
import { useLocale } from '@/i18n/LocaleProvider';
import { Section, SectionHeader } from '@/components/primitives/Section';
import { RevealGroup, RevealItem } from '@/components/primitives/Reveal';
import { SpotlightCard } from '@/components/bits/SpotlightCard';
import { Tag } from '@/components/primitives/Tag';
import { ArrowUpRight } from '@/components/primitives/Icons';
import { cn, externalLinkProps, formatDate } from '@/lib/utils';

export function Writing() {
  const { tl, ui, locale } = useLocale();

  // Same self-hiding contract as Research — `navSections` filters on this too.
  if (articles.length === 0) return null;

  return (
    <Section id="writing">
      <SectionHeader
        eyebrow={ui('writing.eyebrow')}
        title={ui('writing.title')}
        lede={ui('writing.lede')}
      />

      <RevealGroup>
        <ul className="grid gap-4 md:grid-cols-2 lg:gap-5">
          {articles.map((article) => {
            const linked = Boolean(article.href);
            const external = Boolean(article.external) && linked;
            const inner = (
              <>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="font-mono text-[0.8125rem] tracking-wider text-ink-3">
                    {formatDate(article.date, locale)}
                    <span aria-hidden className="mx-2">
                      ·
                    </span>
                    {article.readingMinutes} {ui('writing.minutes')}
                  </span>
                  {/* An arrow on a card that goes nowhere is a broken promise,
                      so unpublished pieces get a status word instead. */}
                  {linked ? (
                    <ArrowUpRight className="size-4 shrink-0 text-ink-3 transition-all duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-ink" />
                  ) : (
                    <span className="shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[0.8125rem] tracking-wider text-ink-3 uppercase">
                      {ui('writing.unpublished')}
                    </span>
                  )}
                </div>

                <h3
                  className={cn(
                    'font-display font-semibold leading-snug text-ink',
                    article.featured ? 'text-[1.1875rem]' : 'text-[1.0625rem]',
                  )}
                >
                  {tl(article.title)}
                </h3>

                <p className="mt-3 flex-1 text-[1rem] leading-relaxed text-ink">
                  {tl(article.excerpt)}
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {article.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </>
            );

            return (
              <RevealItem as="li" key={tl(article.title) + article.date}>
                <SpotlightCard
                  color="rgba(139,124,255,0.13)"
                  className={cn(
                    'card group h-full rounded-2xl transition-[border-color,transform] duration-500 ease-out-expo',
                    linked && 'hover:-translate-y-0.5 hover:border-line',
                  )}
                >
                  {external ? (
                    <a
                      href={article.href!}
                      {...externalLinkProps}
                      className="relative flex h-full flex-col p-6"
                    >
                      {inner}
                    </a>
                  ) : linked ? (
                    <Link to={article.href!} className="relative flex h-full flex-col p-6">
                      {inner}
                    </Link>
                  ) : (
                    <div className="relative flex h-full flex-col p-6">{inner}</div>
                  )}
                </SpotlightCard>
              </RevealItem>
            );
          })}
        </ul>
      </RevealGroup>
    </Section>
  );
}
