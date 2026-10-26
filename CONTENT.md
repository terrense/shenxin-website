# Editing the content

All content lives in `src/content/` as typed TypeScript. There is no CMS and no
database — the build inlines everything, which is why the site can be hosted
free and statically.

TypeScript is doing real work here: if you add a project and forget a field,
`npm run build` tells you exactly which one, instead of the site rendering a
blank space.

---

## The honesty rules

Two of them are enforced by the type system, so you cannot forget.

### 1. Every number declares where it came from

`provenance` is **required** on every metric:

| Value            | Meaning                                                       | Shown as |
| ---------------- | ------------------------------------------------------------- | -------- |
| `'measured'`     | From a real run, log or datasheet                             | plain    |
| `'spec'`         | A design constraint or hardware spec, not an outcome          | plain    |
| `'illustrative'` | A plausible placeholder pending measurement                   | `est.` badge + a footnote |

A number on a portfolio is read as a measured result unless it says otherwise,
and claiming an experiment you did not run is the one mistake that cannot be
walked back. The field is required so that "is this real?" is a compile error
rather than something discovered after publishing.

**Currently marked `illustrative`** — replace these with real numbers when you
have them, then flip `provenance` to `'measured'`:

| Project                   | Figure   | Claim                     |
| ------------------------- | -------- | ------------------------- |
| `post-training-pipeline`  | `−31%`   | SFT step reduction        |
| `post-training-pipeline`  | `3.4×`   | Rollout throughput        |
| `post-training-pipeline`  | `0`      | Unreproducible runs       |
| `grape-thinning-robot`    | `0`      | Peduncle cuts in trials   |
| `eye-in-hand-calibration` | `~20min` | Recalibration time        |

Everything else is a hardware spec or an architectural fact (an 8 ms controller
period, four OS processes, an 11×8 checkerboard) and is safe as written.

### 2. Every image declares what it depicts

`mediaKind` is **required** on cover art and media blocks:

| Value       | Meaning                                  | Shown as                      |
| ----------- | ---------------------------------------- | ----------------------------- |
| `'capture'` | A real screenshot, photo or recording    | plain                         |
| `'concept'` | Generated or illustrated artwork         | **"Concept visualization"** badge |
| `'diagram'` | An authored schematic                    | plain                         |

Any AI-generated or illustrated image must be `'concept'`. An unlabelled
illustration on an engineering case study is read as a screenshot of the real
system.

The same rule covers portraits: **an AI-generated likeness must never be
presented as a photograph of a real person.** There is deliberately no `avatar`
field — use a real photo or none.

---

## Common edits

### Your details, links, hero stats

`src/content/site.ts`. Social links use `href: null` to hide a row entirely —
that is how GitHub shows but LinkedIn does not. Fill in a real URL to surface
one; never point at a site's logged-out home page.

### Changing the site URL

Three files, listed in **DEPLOY.md Part 6**.

### Adding a project

1. Copy an existing file in `src/content/projects/` and edit it.
2. Register it in `src/content/index.ts` — add the import and put it in the
   `projects` array.
3. If `featured: true`, check the bento grid still tiles: the declared order of
   featured projects must produce the span sequence
   `anchor, tall, wide, cell, cell, wide` (see `bentoSpan` in `src/lib/utils.ts`).
4. The sitemap picks it up automatically on the next build.

### Case-study sections

Each project's `sections` array uses a fixed vocabulary so every case study
reads the same way: `problem`, `architecture`, `decisions`, `experiments`,
`results`, `demo`, `reflection`. Use the ones you need; skip the rest.

Available block kinds: `prose`, `bullets`, `metrics`, `code`, `diagram`,
`table`, `callout`, `media`. Adding a new kind to the union in
`src/content/types.ts` produces a type error in `CaseBlocks.tsx` until you
handle it — that is intentional.

### Publications and writing

- `src/content/publications.ts` is **empty on purpose**, with a template in a
  comment. The Research section removes itself from the page and the navigation
  when the array is empty, so shipping with `[]` costs nothing. Add a real
  entry and the section reappears.
- `src/content/writing.ts` holds four pieces drafted from real engineering
  notes, each with `href: null` — they render as unlinked cards with an
  "Unpublished" marker. Set `href` to a live URL and add `external: true` to
  turn one into a link.

### Adding images

1. Put files under `public/assets/` (e.g. `public/assets/covers/vla-lab.webp`).
2. Map them in `src/content/assets.ts` — there is a commented template.
   Paths start with `/assets/…` because `public/` is served from the site root.
3. Set `mediaKind` honestly (see rule 2 above).
4. `npm run build` fails if a referenced file is missing, so a typo cannot ship
   as a broken image.

Projects with no cover fall back to a generated per-project SVG motif. That is
a finished design, not a placeholder — the site is complete without any
artwork.

### Translations

Every user-visible string is an `{ en, zh }` pair and **both are required**, so
the language toggle can never fall back to a missing key. UI chrome lives in
`src/i18n/dictionary.ts`; everything else is in `src/content/`.

`profile.name.zh` is currently the Latin form — a placeholder awaiting the
correct characters rather than a guess.

---

## Before you push

```bash
npm run check
```

Runs the asset check, TypeScript, the contrast audit, the production build and
the CSS class audit. It catches nearly everything Cloudflare would, in seconds.
