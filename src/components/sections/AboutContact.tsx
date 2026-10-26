import { capabilities, profile, socials, timeline } from '@/content/site';
import { useLocale } from '@/i18n/LocaleProvider';
import { useCopy } from '@/hooks/useUi';
import { Section, SectionHeader } from '@/components/primitives/Section';
import { Reveal, RevealGroup, RevealItem } from '@/components/primitives/Reveal';
import { Tag } from '@/components/primitives/Tag';
import { SpotlightCard } from '@/components/bits/SpotlightCard';
import {
  ArrowUpRight,
  Check,
  Copy,
  Github,
  LinkedIn,
  Mail,
} from '@/components/primitives/Icons';
import { externalLinkProps } from '@/lib/utils';

const socialIcon: Record<string, typeof Github> = { github: Github, linkedin: LinkedIn };

export function About() {
  const { tl, ui } = useLocale();

  return (
    <Section id="about" tone="band">
      <SectionHeader eyebrow={ui('about.eyebrow')} title={ui('about.title')} />

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
        <Reveal className="lg:col-span-5">
          <p className="prose-lab text-[1.0625rem] md:text-[1.125rem]">
            {tl(profile.statement)}
          </p>

          <div className="mt-10">
            <p className="label mb-5">{ui('about.timeline')}</p>
            <ol className="relative space-y-7 border-l border-line pl-6">
              {timeline.map((entry) => (
                <li key={entry.period} className="relative">
                  <span
                    aria-hidden
                    className="absolute top-1.5 -left-[1.6875rem] size-2 rounded-full border-2 border-surface bg-accent"
                  />
                  <p className="font-mono text-[0.8125rem] tracking-wider text-ink-3">
                    {entry.period}
                  </p>
                  <h3 className="mt-1.5 font-display text-[1.0625rem] font-semibold text-ink">
                    {tl(entry.title)}
                  </h3>
                  <p className="mt-1.5 text-[1rem] leading-relaxed text-ink">
                    {tl(entry.body)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <p className="label mb-5">{ui('about.capabilities')}</p>
          <RevealGroup>
            <ul className="grid gap-4 sm:grid-cols-2">
              {capabilities.map((group) => (
                <RevealItem as="li" key={group.group.en}>
                  <SpotlightCard className="card h-full rounded-2xl p-5">
                    <h3 className="relative font-display text-[0.9375rem] font-semibold text-ink">
                      {tl(group.group)}
                    </h3>
                    <ul className="relative mt-4 flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <li key={item}>
                          <Tag>{item}</Tag>
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </RevealItem>
              ))}
            </ul>
          </RevealGroup>
        </div>
      </div>
    </Section>
  );
}

export function Contact() {
  const { ui } = useLocale();
  const { copied, copy } = useCopy();
  const live = socials.filter((s) => s.href);

  return (
    <Section id="contact" tone="dark">
      <Reveal>
        <div className="card relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-px mx-auto h-px w-2/3 bg-linear-to-r from-transparent via-accent/60 to-transparent"
          />

          <p className="label mb-6">{ui('contact.eyebrow')}</p>
          <h2 className="mx-auto max-w-2xl text-[clamp(1.75rem,4.2vw,3rem)] leading-[1.1] font-semibold">
            {ui('contact.title')}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[1.1875rem] leading-relaxed text-ink">
            {ui('contact.lede')}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-accent px-6 text-[0.9375rem] font-medium text-white transition-opacity hover:opacity-90"
            >
              <Mail className="size-4" />
              {profile.email}
            </a>
            <button
              type="button"
              onClick={() => copy(profile.email)}
              className="inline-flex h-12 items-center gap-2.5 rounded-xl border border-line px-5 text-[0.9375rem] text-ink transition-colors hover:border-accent/45 hover:bg-accent/[0.06]"
            >
              {copied ? (
                <Check className="size-4 text-accent-ink" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? ui('contact.copied') : ui('contact.copy')}
            </button>
          </div>

          <p className="mt-6 font-mono text-[0.8125rem] tracking-wider text-ink-3 uppercase">
            {ui('contact.responseTime')}
          </p>

          {live.length > 0 && (
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {live.map((social) => {
                const Icon = socialIcon[social.id] ?? ArrowUpRight;
                return (
                  <li key={social.id}>
                    <a
                      href={social.href!}
                      {...externalLinkProps}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-4 text-[0.8125rem] text-ink-2 transition-colors hover:border-line hover:text-ink"
                    >
                      <Icon className="size-4" />
                      {social.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
