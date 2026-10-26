import { Link } from 'react-router-dom';
import { profile, socials } from '@/content/site';
import { useLocale } from '@/i18n/LocaleProvider';
import { externalLinkProps } from '@/lib/utils';
import { ArrowUpRight, Github, LinkedIn, Mail } from '@/components/primitives/Icons';

const socialIcon: Record<string, typeof Github> = {
  github: Github,
  linkedin: LinkedIn,
};

export function Footer() {
  const { ui, tl } = useLocale();
  const year = new Date().getFullYear();
  // Links with `href: null` are hidden rather than shipped dead.
  const live = socials.filter((s) => s.href);

  return (
    <footer className="relative mt-8 border-t border-line-2 py-12">
      <div className="shell">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-lg font-semibold text-ink">{tl(profile.name)}</p>
            <p className="mt-1 text-sm text-ink-2">{tl(profile.role)}</p>
            <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-3">
              {ui('footer.built')}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-8">
            <nav aria-label="Footer">
              <p className="label mb-4">{ui('nav.menu')}</p>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/" className="text-ink-2 transition-colors hover:text-ink">
                    {ui('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className="text-ink-2 transition-colors hover:text-ink">
                    {ui('nav.allWork')}
                  </Link>
                </li>
                <li>
                  <Link to="/#research" className="text-ink-2 transition-colors hover:text-ink">
                    {ui('research.title')}
                  </Link>
                </li>
                <li>
                  <Link to="/#about" className="text-ink-2 transition-colors hover:text-ink">
                    {ui('about.title')}
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
              <p className="label mb-4">{ui('contact.eyebrow')}</p>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 text-ink-2 transition-colors hover:text-accent-ink"
                  >
                    <Mail className="size-4" />
                    {profile.email}
                  </a>
                </li>
                {live.map((s) => {
                  const Icon = socialIcon[s.id] ?? ArrowUpRight;
                  return (
                    <li key={s.id}>
                      <a
                        href={s.href!}
                        {...externalLinkProps}
                        className="inline-flex items-center gap-2 text-ink-2 transition-colors hover:text-accent-ink"
                      >
                        <Icon className="size-4" />
                        {s.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse gap-4 border-t border-line-2 pt-6 text-[0.8125rem] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {tl(profile.name)}. {ui('footer.rights')}
          </p>
          <a href="#top" className="font-mono tracking-wider text-ink-3 hover:text-accent-ink">
            {ui('footer.top')} ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
