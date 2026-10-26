import { Link } from 'react-router-dom';
import { profile } from '@/content/site';
import { useLocale } from '@/i18n/LocaleProvider';
import { useSeo } from '@/hooks/useSeo';
import { ArrowRight } from '@/components/primitives/Icons';

export default function NotFound() {
  const { ui, tl, locale } = useLocale();

  useSeo({
    title: `${ui('404.title')} — ${tl(profile.name)}`,
    description: ui('404.body'),
    path: '/404',
    locale,
  });

  return (
    <div className="shell flex min-h-[60svh] flex-col items-start justify-center py-20">
      <p className="font-mono text-[clamp(4rem,14vw,9rem)] leading-none font-light text-ink/10">
        404
      </p>
      <h1 className="mt-4 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold">
        {ui('404.title')}
      </h1>
      <p className="mt-5 max-w-md text-[1.125rem] leading-relaxed text-ink">{ui('404.body')}</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link
          to="/projects"
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {ui('nav.allWork')}
          <ArrowRight className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
        </Link>
        <Link
          to="/"
          className="inline-flex h-11 items-center rounded-xl border border-line px-5 text-sm text-ink transition-colors hover:border-accent/45"
        >
          {ui('nav.home')}
        </Link>
      </div>
    </div>
  );
}
