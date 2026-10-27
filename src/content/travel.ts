import type { L } from './types';

/**
 * Countries visited, highlighted on the map on /footprints.
 *
 * `iso` is ISO 3166-1 numeric and must match the ids in world-map.ts — that
 * file is generated from Natural Earth, which keys countries numerically.
 * `code` is the alpha-2 form, used only to derive the flag emoji.
 *
 * TODO(content): `note` is optional and currently holds only what is known
 * for certain. Fill in years and context where you want them; an empty note
 * renders nothing rather than a placeholder.
 */
export type VisitedCountry = {
  /** ISO 3166-1 numeric, zero-padded. Must exist in WORLD_SHAPES. */
  iso: string;
  /** ISO 3166-1 alpha-2, for the flag emoji. */
  code: string;
  name: L;
  note?: L;
};

export const visitedCountries: VisitedCountry[] = [
  {
    iso: '156',
    code: 'CN',
    name: { en: 'China', zh: '中国', ru: 'Китай' },
    note: {
      en: 'Home. Beijing Institute of Technology, then the field robotics and agentic work.',
      zh: '故乡。北京理工大学，之后是田间机器人与 Agent 方向的工作。',
      ru: 'Родина. Пекинский технологический институт, затем полевая робототехника и работа над агентами.',
    },
  },
  {
    iso: '643',
    code: 'RU',
    name: { en: 'Russia', zh: '俄罗斯', ru: 'Россия' },
    note: {
      en: 'Seven years in Moscow — MSc and PhD at Bauman, and the navigation research that runs through everything since.',
      zh: '在莫斯科的七年——鲍曼的硕士与博士，以及此后贯穿一切的导航研究。',
      ru: 'Семь лет в Москве — магистратура и аспирантура в МГТУ им. Баумана и навигационные исследования, которые проходят через всё последующее.',
    },
  },
  {
    iso: '112',
    code: 'BY',
    name: { en: 'Belarus', zh: '白俄罗斯', ru: 'Беларусь' },
  },
  {
    iso: '792',
    code: 'TR',
    name: { en: 'Türkiye', zh: '土耳其', ru: 'Турция' },
  },
  {
    iso: '784',
    code: 'AE',
    name: { en: 'United Arab Emirates', zh: '阿联酋', ru: 'ОАЭ' },
  },
];

/**
 * No flag emoji here, deliberately.
 *
 * Windows does not render regional-indicator pairs as flags — it shows the
 * two letters instead — while macOS and iOS show the actual flag. The same
 * markup would be a coloured image on one platform and a text label on
 * another, with different widths and baselines. The alpha-2 code set in the
 * monospace face looks intentional everywhere, so `code` is rendered as a
 * badge rather than converted.
 */

export const visitedIsoSet = new Set(visitedCountries.map((c) => c.iso));
