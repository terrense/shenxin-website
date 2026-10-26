# Xin Shen — portfolio

Personal site for an AI systems engineer working across agentic AI,
reinforcement-learning post-training, robotics and multimodal AI.

Static-first React + TypeScript, hosted free on Cloudflare Pages. No database,
no API keys, no paid services, no tracking.

- **Deploying it:** [DEPLOY.md](./DEPLOY.md)
- **Editing the content:** [CONTENT.md](./CONTENT.md)

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command                  | Purpose                                                      |
| ------------------------ | ------------------------------------------------------------ |
| `npm run dev`            | Dev server with hot reload                                    |
| `npm run build`          | Production build into `dist/`                                 |
| `npm run preview`        | Serve the built output locally                                |
| `npm run check`          | Assets + types + contrast + build + CSS audit                 |
| `npm run check:contrast` | Assert every text colour meets its WCAG target                |
| `npm run check:classes`  | Find Tailwind classes that compile to nothing                 |
| `npm run check:assets`   | Verify every referenced image exists                          |
| `npm run format`         | Prettier                                                      |
| `npm run og`             | Regenerate the social preview PNG (needs `sharp`)             |

---

## Design system

Light-first, modelled on apple.com: near-black text on white, large type, one
accent colour, and a small number of deliberately dark "spotlight" bands.

Readability is the governing constraint. Body text runs at **16.8:1** contrast,
well past the 7:1 AAA threshold, and the smallest type on the site is 13px.
`npm run check:contrast` asserts every pairing the design actually uses and
fails the build if one regresses — so this cannot quietly drift.

Colours are **semantic tokens**, never fixed values:

```
--color-surface / surface-2 / surface-3    backgrounds
--color-ink / ink-2 / ink-3                text, in descending prominence
--color-line / line-2                      hairlines
--color-accent / accent-ink                Apple blue; -ink is the text-safe variant
--color-violet / amber                     supporting accents
```

A `.tone-dark` scope redefines the same tokens, so a component written once
renders correctly on both light and dark bands and no component needs to know
which one it is in. The hero and the contact panel are the dark bands.

Type: Space Grotesk (display) / Inter (body) / JetBrains Mono (labels), all
self-hosted — no external font requests. CJK falls through to system fonts on
purpose; a subsetted Chinese webfont is several megabytes.

---

## Architecture

```
src/
  content/        All copy and data. Typed, bilingual, no CMS.
    projects/     One file per case study
    assets.ts     Image path -> project mapping
    types.ts      The content contract
  i18n/           Locale provider + UI string dictionary
  components/
    primitives/   Section, Reveal, Tag, Button, CoverImage, Provenance
    bits/         Copy-in interactive components (React Bits model)
    diagrams/     Interactive architecture diagrams (SVG + HTML)
    three/        The one WebGL component, lazily loaded
    sections/     Home-page bands
    layout/       Header, Footer, Layout
  pages/          Home, Projects, ProjectCase, NotFound
scripts/          Build-time checks and generators
```

### Notable decisions

**Content is typed data, not markup.** Adding a project is one file plus one
import; TypeScript reports anything missing. Every user-visible string is an
`{ en, zh }` pair with both required, so the language toggle can never hit a
missing key.

**Provenance is enforced by the compiler.** Every metric must declare whether
it is `measured`, a `spec`, or `illustrative`; every image must declare whether
it is a `capture`, a `concept` visualisation, or a `diagram`. Illustrative
figures and concept art render with visible badges. See
[CONTENT.md](./CONTENT.md#the-honesty-rules).

**One WebGL component.** `three` is ~880 KB and is behind a dynamic import that
only fires on a pointer-capable desktop, with WebGL available, after first
paint, and not under `prefers-reduced-motion`. Any of those failing renders a
static SVG lattice that is a finished design rather than a fallback. The
architecture diagrams are plain SVG + HTML, because they carry information and
need to stay selectable, zoomable and keyboard-navigable.

**Reduced motion is handled in JS, not only CSS.** A global CSS kill switch
neutralises transitions, but render loops and scroll listeners are skipped at
the source so nothing is animated off-screen at a battery cost.

**Dead links are never rendered.** Social rows, project links and article cards
all hide or de-link themselves rather than pointing at a placeholder. Sections
whose content array is empty remove themselves from the page *and* the
navigation.

---

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · Motion · React Three Fiber ·
React Router

Interactive components in `src/components/bits/` follow the
[React Bits](https://reactbits.dev) model — copy-in source you own rather than
an installed dependency. See [the folder README](./src/components/bits/README.md).

---

## Accessibility

- WCAG AAA body contrast, asserted in CI by `npm run check:contrast`
- Full keyboard navigation, including arrow-key traversal of diagram nodes
- Visible focus rings everywhere; skip-to-content link
- `prefers-reduced-motion` respected in both CSS and JS
- Semantic landmarks, one `<h1>` per page, `lang` kept in sync with the toggle
- Decorative visuals are `aria-hidden`; nothing meaningful is image-only
