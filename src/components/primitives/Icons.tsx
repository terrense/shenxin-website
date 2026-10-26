import type { SVGProps } from 'react';

/**
 * Inline icon set. Hand-rolled rather than installed, because the whole site
 * needs about fifteen glyphs and an icon package would ship hundreds.
 *
 * All icons inherit `currentColor` and are 24×24 on a 1.5px stroke grid, so
 * they sit consistently next to 14–16px text.
 */

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

export const ArrowUpRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

export const ArrowRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

export const ArrowLeft = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </svg>
);

export const ChevronDown = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const Menu = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 7h18M3 12h18M3 17h12" />
  </svg>
);

export const Close = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Globe = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
  </svg>
);

export const Mail = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7.5 7.3 5.2a2 2 0 0 0 2.4 0l7.3-5.2" />
  </svg>
);

export const Copy = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M15 6.5A2.5 2.5 0 0 0 12.5 4H6.5A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15" />
  </svg>
);

export const Check = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const Github = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...p}>
    <path d="M12 1.8a10.2 10.2 0 0 0-3.23 19.88c.51.1.7-.22.7-.49v-1.9c-2.84.62-3.44-1.2-3.44-1.2-.46-1.18-1.13-1.5-1.13-1.5-.93-.63.07-.62.07-.62 1.02.07 1.56 1.05 1.56 1.05.91 1.56 2.39 1.11 2.97.85.09-.66.36-1.11.65-1.37-2.27-.26-4.65-1.14-4.65-5.06 0-1.12.4-2.03 1.05-2.75-.11-.26-.46-1.3.1-2.7 0 0 .85-.28 2.79 1.05a9.7 9.7 0 0 1 5.08 0c1.94-1.33 2.79-1.05 2.79-1.05.56 1.4.21 2.44.1 2.7.65.72 1.05 1.63 1.05 2.75 0 3.93-2.39 4.8-4.67 5.05.37.32.7.95.7 1.92v2.84c0 .28.18.6.71.5A10.2 10.2 0 0 0 12 1.8Z" />
  </svg>
);

export const LinkedIn = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...p}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4v11H3v-11Zm6.5 0h3.83v1.5h.05a4.2 4.2 0 0 1 3.78-2.08c2.7 0 4.34 1.78 4.34 5v6.58h-4V15c0-1.5-.54-2.52-1.88-2.52-1.02 0-1.63.69-1.9 1.36-.1.24-.12.57-.12.9v5.76h-4v-11Z" />
  </svg>
);

export const FileText = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);

export const Play = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8.5l5.5 3.5L10 15.5v-7Z" />
  </svg>
);

export const Terminal = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="m7.5 10 2.5 2-2.5 2M13 14h3.5" />
  </svg>
);

export const Sparkle = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3v4M12 17v4M4.9 7.4l2.8 2.8M16.3 13.8l2.8 2.8M3 12h4M17 12h4M4.9 16.6l2.8-2.8M16.3 10.2l2.8-2.8" />
  </svg>
);

export const AlertTriangle = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M10.3 4.3 2.9 17a1.9 1.9 0 0 0 1.65 2.85h14.9A1.9 1.9 0 0 0 21.1 17L13.7 4.3a1.95 1.95 0 0 0-3.4 0Z" />
    <path d="M12 9.5v4M12 17h.01" />
  </svg>
);

export const Info = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);

export const linkKindIcon = {
  repo: Github,
  demo: Play,
  paper: FileText,
  video: Play,
  doc: FileText,
  external: ArrowUpRight,
} as const;
