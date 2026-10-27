import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { exhibits, PALACE_MAP, TILE, type Exhibit } from '@/content/palace';
import { useLocale } from '@/i18n/LocaleProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

/**
 * A walkable room, drawn as one SVG.
 *
 * The reference for this page runs Phaser with isometric pixel art. That is
 * roughly a megabyte of engine for a single static room, which would be the
 * largest thing on a site whose whole design is about not shipping weight
 * nobody asked for. A grid, an SVG and a keydown handler do the same job.
 *
 * It is a toy, so it is built to be skippable: every exhibit is also a plain
 * button in a list underneath, and nothing here is the only route to any
 * piece of information.
 */

const TILE_PX = 36;
const COLS = PALACE_MAP[0]!.length;
const ROWS = PALACE_MAP.length;

type Pos = { x: number; y: number };

const KEY_TO_DELTA: Record<string, Pos> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function findStart(): Pos {
  for (let y = 0; y < ROWS; y++) {
    const x = PALACE_MAP[y]!.indexOf(TILE.START);
    if (x !== -1) return { x, y };
  }
  return { x: 1, y: 1 };
}

/** One glyph per exhibit kind. Geometric rather than pixel art — at this
 *  size, legible shapes beat texture, and they scale without blurring. */
function ExhibitGlyph({ kind, lit }: { kind: Exhibit['kind']; lit: boolean }) {
  const stroke = lit ? 'var(--p-gold-bright)' : 'var(--p-gold)';
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (kind) {
    case 'astrolabe':
      return (
        <g {...common}>
          <circle cx="0" cy="0" r="11" />
          <ellipse cx="0" cy="0" rx="11" ry="4.5" />
          <path d="M0 -11V11M-11 0H11" />
          <circle cx="0" cy="0" r="2.2" fill={stroke} />
        </g>
      );
    case 'tank':
      return (
        <g {...common}>
          <rect x="-11" y="-2" width="22" height="9" rx="2" />
          <path d="M-6 -2V-7h9v5" />
          <path d="M3 -5h10" />
          <circle cx="-6" cy="7" r="2.6" />
          <circle cx="0" cy="7" r="2.6" />
          <circle cx="6" cy="7" r="2.6" />
        </g>
      );
    case 'blackboard':
      return (
        <g {...common}>
          <rect x="-12" y="-9" width="24" height="16" rx="1.5" />
          <path d="M-8 -4h7M-8 0h11M-8 4h5" />
          <path d="M-7 7v4M7 7v4" />
        </g>
      );
    case 'antenna':
      return (
        <g {...common}>
          <path d="M0 10V-2" />
          <path d="M-9 -2a9 9 0 0 1 18 0" />
          <path d="M-5 -4a5 5 0 0 1 10 0" />
          <circle cx="0" cy="-8" r="1.8" fill={stroke} />
          <path d="M-6 10h12" />
        </g>
      );
    case 'pointcloud':
      return (
        <g>
          <g {...common}>
            <path d="M-11 6L0 -9l11 15" />
          </g>
          {[
            [-7, 3],
            [-3, -1],
            [1, -4],
            [5, 0],
            [8, 4],
            [-1, 5],
            [4, 6],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.5" fill={stroke} />
          ))}
        </g>
      );
    case 'vine':
      return (
        <g {...common}>
          <path d="M0 -11v6" />
          <path d="M-9 -5h18" />
          {[
            [-4, -1],
            [0, -1],
            [4, -1],
            [-2, 3],
            [2, 3],
            [0, 7],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2.6" fill={stroke} stroke="none" />
          ))}
        </g>
      );
    case 'arm':
      return (
        <g {...common}>
          <rect x="-7" y="7" width="14" height="4" rx="1.5" />
          <path d="M0 7V0l8-6" />
          <path d="M8 -6l4 4" />
          <circle cx="0" cy="0" r="2.4" />
          <circle cx="8" cy="-6" r="2" />
        </g>
      );
    case 'terminal':
      return (
        <g {...common}>
          <rect x="-12" y="-8" width="24" height="16" rx="2" />
          <path d="M-7 -3l3 3-3 3" />
          <path d="M-1 3h7" />
        </g>
      );
    case 'caduceus':
      return (
        <g {...common}>
          <path d="M0 -10v20" />
          <path d="M-7 -5c4 3 10 3 14 0" />
          <path d="M-7 1c4 3 10 3 14 0" />
          <circle cx="0" cy="-11" r="1.8" fill={stroke} />
        </g>
      );
    case 'window':
      return (
        <g {...common}>
          <rect x="-11" y="-10" width="22" height="20" rx="1.5" />
          <path d="M0 -10v20M-11 0h22" />
        </g>
      );
  }
}

export function PalaceScene({
  open,
  onOpen,
}: {
  open: Exhibit | null;
  onOpen: (e: Exhibit | null) => void;
}) {
  const { ui } = useLocale();
  const reduced = useReducedMotion();
  const [pos, setPos] = useState<Pos>(findStart);
  const [facing, setFacing] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const frameRef = useRef<HTMLDivElement>(null);

  const exhibitAt = useMemo(() => {
    const m = new Map<string, Exhibit>();
    for (const e of exhibits) m.set(`${e.x},${e.y}`, e);
    return m;
  }, []);

  const blocked = useCallback(
    (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
      const ch = PALACE_MAP[y]![x];
      if (ch === TILE.WALL || ch === TILE.PILLAR) return true;
      return exhibitAt.has(`${x},${y}`);
    },
    [exhibitAt],
  );

  /** The exhibit directly adjacent — what E would open. */
  const nearby = useMemo(() => {
    for (const [dx, dy] of [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ]) {
      const hit = exhibitAt.get(`${pos.x + dx},${pos.y + dy}`);
      if (hit) return hit;
    }
    return null;
  }, [pos, exhibitAt]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Never swallow keys while the reader is in the content panel.
      if (open) {
        if (event.key === 'Escape') onOpen(null);
        return;
      }
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key === 'e' || key === 'Enter') {
        if (nearby) {
          event.preventDefault();
          onOpen(nearby);
        }
        return;
      }

      const delta = KEY_TO_DELTA[key];
      if (!delta) return;
      // Only claim the arrow keys once the scene has focus, or the page
      // cannot be scrolled with the keyboard any more.
      if (!frameRef.current?.contains(document.activeElement)) return;
      event.preventDefault();

      setFacing(
        delta.x === 1 ? 'right' : delta.x === -1 ? 'left' : delta.y === 1 ? 'down' : 'up',
      );
      setPos((p) => {
        const next = { x: p.x + delta.x, y: p.y + delta.y };
        return blocked(next.x, next.y) ? p : next;
      });
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [blocked, nearby, onOpen, open]);

  return (
    <div
      ref={frameRef}
      tabIndex={0}
      role="application"
      aria-label={ui('palace.sceneLabel')}
      className="group/scene relative w-full overflow-hidden rounded-2xl border border-line outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={
        {
          '--p-floor': '#14131a',
          '--p-floor-alt': '#191824',
          '--p-wall': '#2a2740',
          '--p-rug': '#1f1b33',
          '--p-gold': '#c9a94e',
          '--p-gold-bright': '#f6dc92',
        } as React.CSSProperties
      }
    >
      <svg
        viewBox={`0 0 ${COLS * TILE_PX} ${ROWS * TILE_PX}`}
        className="block w-full"
        aria-hidden
      >
        <rect width="100%" height="100%" fill="var(--p-floor)" />

        {/* Floor, walls, rugs */}
        {PALACE_MAP.map((row, y) =>
          [...row].map((ch, x) => {
            const px = x * TILE_PX;
            const py = y * TILE_PX;
            if (ch === TILE.WALL) {
              return (
                <rect
                  key={`${x}-${y}`}
                  x={px}
                  y={py}
                  width={TILE_PX}
                  height={TILE_PX}
                  fill="var(--p-wall)"
                />
              );
            }
            if (ch === TILE.RUG) {
              return (
                <rect
                  key={`${x}-${y}`}
                  x={px}
                  y={py}
                  width={TILE_PX}
                  height={TILE_PX}
                  fill="var(--p-rug)"
                />
              );
            }
            // Checkerboard the plain floor so movement is legible — without
            // it, walking across an empty field has no sense of distance.
            if ((x + y) % 2 === 0) {
              return (
                <rect
                  key={`${x}-${y}`}
                  x={px}
                  y={py}
                  width={TILE_PX}
                  height={TILE_PX}
                  fill="var(--p-floor-alt)"
                />
              );
            }
            return null;
          }),
        )}

        {/* Pillars */}
        {PALACE_MAP.map((row, y) =>
          [...row].map((ch, x) =>
            ch === TILE.PILLAR ? (
              <g key={`p-${x}-${y}`}>
                <circle
                  cx={x * TILE_PX + TILE_PX / 2}
                  cy={y * TILE_PX + TILE_PX / 2}
                  r={TILE_PX * 0.42}
                  fill="var(--p-wall)"
                />
                <circle
                  cx={x * TILE_PX + TILE_PX / 2}
                  cy={y * TILE_PX + TILE_PX / 2}
                  r={TILE_PX * 0.26}
                  fill="none"
                  stroke="var(--p-gold)"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </g>
            ) : null,
          ),
        )}

        {/* Exhibits */}
        {exhibits.map((e) => {
          const lit = nearby?.id === e.id || open?.id === e.id;
          return (
            <g
              key={e.id}
              transform={`translate(${e.x * TILE_PX + TILE_PX / 2}, ${e.y * TILE_PX + TILE_PX / 2})`}
            >
              {lit && (
                <circle
                  r={TILE_PX * 0.72}
                  fill="var(--p-gold)"
                  opacity="0.16"
                  className={cn(!reduced && 'animate-pulse')}
                />
              )}
              <ExhibitGlyph kind={e.kind} lit={lit} />
            </g>
          );
        })}

        {/* The figure */}
        <g
          transform={`translate(${pos.x * TILE_PX + TILE_PX / 2}, ${pos.y * TILE_PX + TILE_PX / 2})`}
          className={cn(!reduced && 'transition-transform duration-150 ease-out')}
          style={{ transitionProperty: reduced ? 'none' : 'transform' }}
        >
          <ellipse cy={TILE_PX * 0.34} rx={TILE_PX * 0.26} ry={TILE_PX * 0.1} fill="#000" opacity="0.45" />
          <circle r={TILE_PX * 0.27} fill="#eef1f8" />
          <circle r={TILE_PX * 0.27} fill="none" stroke="var(--p-gold-bright)" strokeWidth="1.5" />
          {/* A notch for facing, so movement has a direction. */}
          <circle
            cx={facing === 'left' ? -5 : facing === 'right' ? 5 : 0}
            cy={facing === 'up' ? -5 : facing === 'down' ? 5 : 0}
            r="2.6"
            fill="#1d1d1f"
          />
        </g>
      </svg>

      {/* Hint, shown until the first exhibit is opened. */}
      <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent px-4 py-3 text-center font-mono text-[0.8125rem] text-white/80">
        {nearby ? ui('palace.hintOpen') : ui('palace.hintMove')}
      </p>
    </div>
  );
}
