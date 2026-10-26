import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { publications } from '@/content';
import type { Publication } from '@/content/types';
import { useLocale } from '@/i18n/LocaleProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Section, SectionHeader } from '@/components/primitives/Section';
import { RevealGroup, RevealItem } from '@/components/primitives/Reveal';
import { Tag } from '@/components/primitives/Tag';
import { ChevronDown, linkKindIcon } from '@/components/primitives/Icons';
import { cn, externalLinkProps } from '@/lib/utils';
import { EASE } from '@/lib/motion';

const kindLabel: Record<Publication['kind'], string> = {
  paper: 'Paper',
  preprint: 'Preprint',
  talk: 'Talk',
  workshop: 'Workshop',
  patent: 'Patent',
};

function PublicationRow({ item }: { item: Publication }) {
  const { tl, ui } = useLocale();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const panelId = `abstract-${item.year}-${item.title.en.slice(0, 12).replace(/\W+/g, '')}`;

  return (
    // The row separator lives on the parent <li> so `last:border-0` actually
    // refers to the last publication rather than to this element's only child.
    <div className="group">
      <div className="flex flex-col gap-4 py-6 md:flex-row md:items-start md:gap-8">
        <div className="flex shrink-0 items-center gap-3 md:w-32 md:flex-col md:items-start md:gap-2">
          <span className="font-mono text-sm tabular-nums text-ink-2">{item.year}</span>
          <Tag>{kindLabel[item.kind]}</Tag>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[1.0625rem] leading-snug font-semibold text-ink">
            {tl(item.title)}
          </h3>
          <p className="mt-1.5 text-sm text-ink-2">
            {item.authors} · <span className="text-ink-3">{tl(item.venue)}</span>
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={panelId}
              className="inline-flex items-center gap-1.5 font-mono text-[0.8125rem] tracking-wider uppercase text-ink-3 transition-colors hover:text-accent-ink"
            >
              {open ? ui('research.hideAbstract') : ui('research.showAbstract')}
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-300 ease-out-expo',
                  open && 'rotate-180',
                )}
              />
            </button>

            {item.links?.map((link) => {
              const Icon = linkKindIcon[link.kind];
              return (
                <a
                  key={link.href}
                  href={link.href}
                  {...externalLinkProps}
                  className="inline-flex items-center gap-1.5 font-mono text-[0.8125rem] tracking-wider uppercase text-ink-3 transition-colors hover:text-accent-ink"
                >
                  <Icon className="size-3.5" />
                  {tl(link.label)}
                </a>
              );
            })}
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={panelId}
                initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.34, ease: EASE }}
                className="overflow-hidden"
              >
                <p className="mt-4 max-w-3xl border-l border-accent/30 pl-4 text-[0.9375rem] leading-relaxed text-ink-2">
                  {tl(item.abstract)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function Research() {
  const { ui } = useLocale();

  // Self-hiding. An empty publication list means the section is removed
  // entirely rather than rendering a tall band that says "nothing here" —
  // see the note at the top of src/content/publications.ts. `navSections`
  // applies the same predicate so the nav link disappears with it.
  if (publications.length === 0) return null;

  return (
    <Section id="research" tone="band">
      <SectionHeader
        eyebrow={ui('research.eyebrow')}
        title={ui('research.title')}
        lede={ui('research.lede')}
      />

      <RevealGroup>
        <ul className="border-t border-line-2">
          {publications.map((item) => (
            <RevealItem
              as="li"
              key={item.title.en}
              className="border-b border-line-2 last:border-0"
            >
              <PublicationRow item={item} />
            </RevealItem>
          ))}
        </ul>
      </RevealGroup>
    </Section>
  );
}
