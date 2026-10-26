import type { Publication } from './types';

/**
 * Publications and talks.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * INTENTIONALLY EMPTY.
 *
 * Nothing goes in this array that does not exist. A portfolio that lists a
 * paper nobody can find is worse than one that lists none — the first thing a
 * reviewer does is search for it. The Research section detects an empty array
 * and removes itself from the page and the navigation, so shipping with `[]`
 * costs nothing.
 *
 * Add a real entry using the template below and the section reappears.
 * ──────────────────────────────────────────────────────────────────────────
 */
export const publications: Publication[] = [];

/*
Template — copy into the array above and fill in:

{
  title: {
    en: 'Host-Memory Bounds on Single-GPU Vision-Language-Action Training',
    zh: '单卡视觉-语言-动作模型训练的宿主内存边界',
  },
  venue: { en: 'Technical report', zh: '技术报告' },
  year: 2026,
  authors: 'Xin Shen',
  kind: 'preprint',          // paper | preprint | talk | workshop | patent
  abstract: {
    en: 'One paragraph. State the claim and the evidence, not the motivation.',
    zh: '一段话。说明结论与证据，而不是动机。',
  },
  links: [
    { kind: 'doc', label: { en: 'Read', zh: '阅读' }, href: 'https://…' },
  ],
}
*/
