import { useEffect } from 'react';
import { SITE_URL } from '@/content/site';
import type { Locale } from '@/content/types';

type SeoInput = {
  title: string;
  description: string;
  /** Path including the leading slash, e.g. `/projects/vla-lab`. */
  path: string;
  /** Absolute or root-relative image path. Defaults to the site card. */
  image?: string;
  type?: 'website' | 'article' | 'profile';
  locale: Locale;
  /** JSON-LD object injected for this route. */
  jsonLd?: Record<string, unknown>;
  /** ISO date, for article routes. */
  published?: string;
};

const MANAGED = 'data-seo-managed';

/** Open Graph wants underscored POSIX-style tags, not BCP 47. */
const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  ru: 'ru_RU',
};

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    el.setAttribute(MANAGED, '');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    el.setAttribute(MANAGED, '');
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Per-route document metadata.
 *
 * This is a client-side SPA, so crawlers that do not execute JS only see
 * index.html. Google and Bing do render JS; for the long tail, `npm run build`
 * also emits a sitemap so every case study is at least discoverable, and the
 * static shell carries a complete default card.
 */
export function useSeo({
  title,
  description,
  path,
  image = '/og.png',
  type = 'website',
  locale,
  jsonLd,
  published,
}: SeoInput) {
  // Call sites build `jsonLd` as an object literal, so it is a new reference
  // every render. Depending on it directly would rewrite every meta tag on
  // each render; the serialised form only changes when the content does.
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

    document.title = title;

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);
    setMeta('meta[property="og:image"]', 'property', 'og:image', absoluteImage);
    setMeta('meta[property="og:type"]', 'property', 'og:type', type);
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', OG_LOCALE[locale]);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', absoluteImage);

    if (published) {
      setMeta(
        'meta[property="article:published_time"]',
        'property',
        'article:published_time',
        published,
      );
    }

    setLink('canonical', url);
    // Every language lives at the same URL (the switcher is client-side), so
    // hreflang points at the shared canonical rather than inventing /zh/ and
    // /ru/ routes that would then need separately pre-rendered documents.
    setLink('alternate', url, 'en');
    setLink('alternate', url, 'zh-Hans');
    setLink('alternate', url, 'ru');
    setLink('alternate', url, 'x-default');

    const SCRIPT_ID = 'route-jsonld';
    document.getElementById(SCRIPT_ID)?.remove();
    if (jsonLdKey) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'application/ld+json';
      script.textContent = jsonLdKey;
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(SCRIPT_ID)?.remove();
    };
  }, [title, description, path, image, type, locale, jsonLdKey, published]);
}
