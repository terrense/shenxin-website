import { domainSections } from '@/content/domains';
import { profile, SITE_URL } from '@/content/site';
import { projects } from '@/content';
import { useLocale } from '@/i18n/LocaleProvider';
import { useSeo } from '@/hooks/useSeo';
import { Hero } from '@/components/sections/Hero';
import { FeaturedWork } from '@/components/sections/FeaturedWork';
import { DomainSection } from '@/components/sections/DomainSection';
import { Research } from '@/components/sections/Research';
import { Writing } from '@/components/sections/Writing';
import { About, Contact } from '@/components/sections/AboutContact';

export default function Home() {
  const { tl, locale } = useLocale();

  useSeo({
    title: `${tl(profile.name)} — ${tl(profile.role)} | Agentic AI, RL, Robotics`,
    description: tl(profile.statement).slice(0, 180),
    path: '/',
    locale,
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: tl(profile.name),
        jobTitle: tl(profile.role),
        email: `mailto:${profile.email}`,
        url: `${SITE_URL}/`,
      },
      hasPart: projects.map((project) => ({
        '@type': 'CreativeWork',
        name: tl(project.title),
        abstract: tl(project.tagline),
        url: `${SITE_URL}/projects/${project.slug}`,
      })),
    },
  });

  return (
    <>
      <Hero />
      <FeaturedWork />
      {domainSections.map((spec) => (
        <DomainSection key={spec.id} spec={spec} />
      ))}
      <Research />
      <Writing />
      <About />
      <Contact />
    </>
  );
}
