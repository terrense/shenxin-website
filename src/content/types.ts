/**
 * Content model.
 *
 * Everything on this site is authored as typed data in `src/content/**`.
 * There is no CMS, no database and no runtime API — the build inlines it all.
 * Adding a project means adding one file and one import; TypeScript then tells
 * you if anything is missing.
 *
 * Every human-readable string is an `L` (localised pair), so the language
 * toggle can never fall back to a missing key.
 */

export type Locale = 'en' | 'zh';

export const LOCALES: readonly Locale[] = ['en', 'zh'] as const;

/** A localised string. Both languages are required — that is the point. */
export type L = { en: string; zh: string };

/** Resolve a localised string. */
export const t = (value: L, locale: Locale): string => value[locale] ?? value.en;

export type Domain = 'agentic' | 'rl' | 'robotics' | 'embodied' | 'healthcare' | 'infra';

export type ProjectStatus = 'shipped' | 'active' | 'research' | 'archived';

export type Accent = 'signal' | 'flux' | 'ember';

/**
 * Where a published figure came from. This is a correctness feature, not
 * metadata: a number on a portfolio is read as a measured result unless it
 * says otherwise, and claiming an experimental result you did not run is the
 * one mistake that cannot be walked back.
 *
 *  - `measured`     taken from a real run, log or datasheet. Safe to publish bare.
 *  - `spec`         a design constraint or hardware spec, not an outcome
 *                   (e.g. an 8 ms controller period, a 20 mm checkerboard).
 *  - `illustrative` a plausible placeholder pending real measurement. Rendered
 *                   with a visible marker and excluded from result claims.
 *
 * This field is REQUIRED. Making it optional meant an unreviewed number
 * silently presented as fact; requiring it turns "is this real?" into a
 * compile error instead of an integrity problem discovered after publishing.
 */
export type Provenance = 'measured' | 'spec' | 'illustrative';

/** A headline number. `value` stays a string so units and prefixes survive. */
export type Metric = {
  value: string;
  label: L;
  detail?: L;
  /** Animate from 0 to this number on reveal. Omit for non-numeric values. */
  countTo?: number;
  /** See `Provenance`. Required — no number ships unclassified. */
  provenance: Provenance;
};

export type LinkKind = 'repo' | 'demo' | 'paper' | 'video' | 'doc' | 'external';

export type ProjectLink = {
  kind: LinkKind;
  label: L;
  href: string;
};

export type DiagramId =
  | 'post-training'
  | 'agent-runtime'
  | 'eye-in-hand'
  | 'sim2real'
  | 'clinical-fusion'
  | 'field-pipeline';

/** Content blocks available inside a case-study section. */
export type CaseBlock =
  | { kind: 'prose'; body: L }
  | { kind: 'bullets'; ordered?: boolean; items: Array<{ label?: L; body: L }> }
  | { kind: 'metrics'; items: Metric[] }
  | { kind: 'code'; lang: string; code: string; caption?: L }
  | { kind: 'diagram'; id: DiagramId; caption?: L }
  | { kind: 'table'; head: L[]; rows: L[][]; caption?: L }
  | { kind: 'callout'; tone: 'insight' | 'warning' | 'note'; title: L; body: L }
  | {
      kind: 'media';
      /** Path under /public, or an embed URL for `type: 'embed'`. */
      src: string;
      type: 'image' | 'video' | 'embed';
      alt: L;
      caption?: L;
      poster?: string;
      /** Intrinsic ratio, used to reserve layout space and avoid CLS. */
      ratio?: string;
      /** See `MediaKind`. Required — no image ships unclassified. */
      mediaKind: MediaKind;
    };

/**
 * What an image actually depicts. Same reasoning as `Provenance`, and equally
 * required: a reader assumes a picture on an engineering case study is a
 * screenshot of the real system.
 *
 *  - `capture`  a real screenshot, photo or recording of the system.
 *  - `concept`  a generated or illustrated visualisation of the idea. Always
 *               rendered with a visible "Concept visualization" badge.
 *  - `diagram`  an authored schematic. Self-evidently not a photograph.
 */
export type MediaKind = 'capture' | 'concept' | 'diagram';

/**
 * Cover art for a project card and case-study header.
 *
 * Optional throughout: with no cover, cards fall back to the generated
 * `CardMotif` and the case header to its gradient wash, both of which are
 * finished designs rather than placeholders. That is what lets the site ship
 * before artwork exists.
 */
export type ProjectCover = {
  /** Path under /public, e.g. `/assets/covers/vla-lab.webp`. */
  src: string;
  /** Optional higher-resolution or wider crop for the case-study header. */
  wide?: string;
  alt: L;
  mediaKind: MediaKind;
  /**
   * Focal point for `object-position`, as a CSS value. Cards crop hard on
   * narrow screens; this keeps the subject in frame.
   */
  focus?: string;
};

/**
 * Case-study sections use a fixed vocabulary so every project reads the same
 * way and the in-page navigation is predictable.
 */
export type CaseSectionId =
  'problem' | 'architecture' | 'decisions' | 'experiments' | 'results' | 'demo' | 'reflection';

export type CaseSection = {
  id: CaseSectionId;
  title: L;
  /** One-line framing shown under the section heading. */
  lede?: L;
  blocks: CaseBlock[];
};

export type Project = {
  slug: string;
  title: L;
  /** Short line used on cards. Keep under ~70 characters. */
  tagline: L;
  /** Two or three sentences, used on the index and in meta descriptions. */
  summary: L;
  domain: Domain;
  /** Secondary domains, rendered as tags. */
  alsoIn?: Domain[];
  period: string;
  role: L;
  status: ProjectStatus;
  accent: Accent;
  stack: string[];
  /** Up to three numbers surfaced on the card and at the top of the case study. */
  highlights: Metric[];
  links?: ProjectLink[];
  /**
   * Cover art. Omit until real artwork exists — see `ProjectCover`.
   * Wire a whole set at once via src/content/assets.ts.
   */
  cover?: ProjectCover;
  /** Appears in the home bento grid. */
  featured: boolean;
  /** Bento footprint. `anchor` is the one large tile; use it exactly once. */
  span: 'anchor' | 'wide' | 'tall' | 'cell';
  /** Decorative card motif. */
  motif: 'lattice' | 'pipeline' | 'orbit' | 'waveform' | 'scan' | 'stack';
  sections: CaseSection[];
};

export type Publication = {
  title: L;
  venue: L;
  year: number;
  authors: string;
  kind: 'paper' | 'preprint' | 'talk' | 'workshop' | 'patent';
  abstract: L;
  links?: ProjectLink[];
};

export type Article = {
  title: L;
  excerpt: L;
  date: string;
  readingMinutes: number;
  tags: string[];
  /**
   * External post URL, or an internal route.
   *
   * `null` means the piece is written but not yet published anywhere. The card
   * then renders as plain text with an "unpublished" marker instead of a link
   * — never as a link to a placeholder, which reads as broken.
   */
  href: string | null;
  external?: boolean;
  featured?: boolean;
};
