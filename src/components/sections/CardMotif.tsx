import type { Accent, Project } from '@/content/types';
import { accentClasses } from '@/lib/utils';

/**
 * Decorative corner graphic per project, keyed off `project.motif`.
 *
 * These exist so six cards in a grid are distinguishable at a glance without
 * six photographs. Each one gestures at the project's actual shape — a
 * pipeline, a lattice, an orbit — rather than being abstract noise.
 *
 * Purely decorative: `aria-hidden`, and nothing here carries information that
 * is not also in the card text.
 */
export function CardMotif({ motif, accent }: { motif: Project['motif']; accent: Accent }) {
  const hex = accentClasses[accent].hex;

  const common = {
    fill: 'none',
    stroke: hex,
    strokeWidth: 1.1,
    strokeLinecap: 'round' as const,
  };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-6 -right-6 size-48 opacity-[0.17] transition-opacity duration-500 ease-out-expo group-hover:opacity-[0.32]"
    >
      <svg viewBox="0 0 200 200" className="size-full">
        {motif === 'lattice' && (
          <g {...common}>
            <path
              d="M40 60h120M40 100h120M40 140h120M60 40v120M100 40v120M140 40v120"
              opacity="0.5"
            />
            <g fill={hex} stroke="none">
              <circle cx="60" cy="60" r="3.2" />
              <circle cx="100" cy="100" r="4.4" />
              <circle cx="140" cy="140" r="3.2" />
              <circle cx="140" cy="60" r="2.4" />
              <circle cx="60" cy="140" r="2.4" />
            </g>
          </g>
        )}

        {motif === 'pipeline' && (
          <g {...common}>
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={28 + i * 38} y={86} width="26" height="28" rx="5" />
            ))}
            <path d="M54 100h8M92 100h8M130 100h8" />
            <path d="M166 114v22H42v-20" strokeDasharray="4 4" opacity="0.7" />
          </g>
        )}

        {motif === 'orbit' && (
          <g {...common}>
            <circle cx="100" cy="100" r="58" opacity="0.4" />
            <ellipse cx="100" cy="100" rx="58" ry="22" opacity="0.6" />
            <ellipse cx="100" cy="100" rx="22" ry="58" opacity="0.35" />
            <g fill={hex} stroke="none">
              <circle cx="100" cy="100" r="5" />
              <circle cx="158" cy="100" r="3.4" />
              <circle cx="100" cy="42" r="2.6" />
            </g>
          </g>
        )}

        {motif === 'waveform' && (
          <g {...common}>
            {Array.from({ length: 16 }, (_, i) => {
              // Deterministic pseudo-envelope: two sines beating against each other.
              const h = 14 + Math.abs(Math.sin(i * 0.9) * 32 + Math.cos(i * 0.4) * 16);
              return (
                <path
                  key={i}
                  d={`M${30 + i * 9} ${100 - h / 2}v${h}`}
                  strokeWidth={2.2}
                  opacity={0.4 + (i % 4) * 0.15}
                />
              );
            })}
          </g>
        )}

        {motif === 'scan' && (
          <g {...common}>
            <rect x="40" y="46" width="120" height="108" rx="10" opacity="0.5" />
            <path d="M40 82h120M40 118h120" strokeDasharray="3 6" opacity="0.5" />
            <path d="M58 100c14-26 36-26 50 0s32 26 36 0" strokeWidth={1.6} />
            <path d="M40 64h20M140 64h20M40 136h20M140 136h20" strokeWidth={2} />
          </g>
        )}

        {motif === 'stack' && (
          <g {...common}>
            {[0, 1, 2, 3].map((i) => (
              <g key={i} opacity={1 - i * 0.18}>
                <path
                  d={`M100 ${52 + i * 28} 150 ${66 + i * 28} 100 ${80 + i * 28} 50 ${66 + i * 28}Z`}
                />
              </g>
            ))}
            <path d="M150 66v56M50 66v56" strokeDasharray="3 5" opacity="0.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
