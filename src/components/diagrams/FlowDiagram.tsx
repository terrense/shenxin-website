import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Accent, L } from '@/content/types';
import { useLocale } from '@/i18n/LocaleProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE } from '@/lib/motion';
import { accentClasses, cn } from '@/lib/utils';

/**
 * Interactive architecture diagram.
 *
 * Deliberately *not* an SVG-text diagram. Nodes are real HTML buttons
 * absolutely positioned over an SVG edge layer, which buys three things that
 * matter more than purity:
 *
 *   - labels wrap, and wrap differently in English and Chinese, without any
 *     manual <tspan> line-breaking;
 *   - nodes are focusable buttons with real semantics, so the diagram is
 *     keyboard-navigable and announced correctly;
 *   - text stays selectable and searchable.
 *
 * The container's aspect-ratio is locked to the spec's coordinate space, so
 * the percentage-positioned HTML and the viewBox-scaled SVG stay in exact
 * registration at any width.
 */

export type DiagramNode = {
  id: string;
  label: L;
  /** Second line — a budget, a rate, a format. Keep it short. */
  sub?: L;
  /** Coordinates and size in the spec's own space (top-left origin). */
  x: number;
  y: number;
  w: number;
  h: number;
  accent?: Accent;
  detail: {
    body: L;
    /** Input contract. */
    takes?: L;
    /** Output contract. */
    emits?: L;
    /** What goes wrong here. */
    risk?: L;
  };
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: L;
  /** `flow` routes left-to-right; `feedback` loops back underneath. */
  kind?: 'flow' | 'feedback';
  dashed?: boolean;
};

export type DiagramSpec = {
  /** Coordinate space. Also the intended natural pixel size. */
  width: number;
  height: number;
  /**
   * Narrowest the diagram may be rendered before the container scrolls
   * horizontally. Set this low enough to avoid scroll on a tablet, but high
   * enough that node labels stay legible — below roughly 0.8 × width the text
   * starts colliding with the node boxes in Chinese.
   */
  minWidth?: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

const pct = (value: number, total: number) => `${(value / total) * 100}%`;

function edgePath(
  a: DiagramNode,
  b: DiagramNode,
  kind: DiagramEdge['kind'],
  space: DiagramSpec,
) {
  if (kind === 'feedback') {
    // Loop below everything, so a right-to-left return never crosses a node.
    const lane = space.height - 14;
    const ax = a.x + a.w / 2;
    const bx = b.x + b.w / 2;
    return `M ${ax} ${a.y + a.h} C ${ax} ${lane}, ${bx} ${lane}, ${bx} ${b.y + b.h}`;
  }

  const ax = a.x + a.w;
  const ay = a.y + a.h / 2;
  const bx = b.x;
  const by = b.y + b.h / 2;

  if (Math.abs(ay - by) < 3) return `M ${ax} ${ay} L ${bx} ${by}`;

  // Horizontal-tangent cubic: enters and leaves each node perpendicular to its
  // edge, which reads as a routed wire rather than a diagonal.
  const mid = ax + (bx - ax) / 2;
  return `M ${ax} ${ay} C ${mid} ${ay}, ${mid} ${by}, ${bx} ${by}`;
}

export default function FlowDiagram({
  spec,
  caption,
  className,
}: {
  spec: DiagramSpec;
  caption?: string;
  className?: string;
}) {
  const { tl, ui } = useLocale();
  const reduced = useReducedMotion();
  const [selectedId, setSelectedId] = useState(spec.nodes[0]!.id);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const byId = useMemo(() => new Map(spec.nodes.map((node) => [node.id, node])), [spec.nodes]);
  const selected = byId.get(selectedId) ?? spec.nodes[0]!;
  const focusId = hoverId ?? selectedId;

  /** Edges touching the focused node are brightened. */
  const isLit = (edge: DiagramEdge) => edge.from === focusId || edge.to === focusId;

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + spec.nodes.length) % spec.nodes.length;
    setSelectedId(spec.nodes[next]!.id);
    buttons.current[next]?.focus();
  };

  return (
    <figure className={cn('not-prose my-2', className)}>
      {/* Horizontal scroll is contained here; the page body never scrolls sideways. */}
      <div className="-mx-1 overflow-x-auto overflow-y-hidden px-1 pb-3">
        <div
          className="relative"
          style={{
            aspectRatio: `${spec.width} / ${spec.height}`,
            minWidth: spec.minWidth ?? Math.min(spec.width, 820),
          }}
          role="group"
          aria-label={caption ?? 'System architecture diagram'}
        >
          <svg
            aria-hidden
            viewBox={`0 0 ${spec.width} ${spec.height}`}
            className="absolute inset-0 size-full"
          >
            <defs>
              <marker
                id="fd-arrow"
                viewBox="0 0 10 10"
                refX="8.5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="currentColor" />
              </marker>
            </defs>

            {spec.edges.map((edge, i) => {
              const a = byId.get(edge.from);
              const b = byId.get(edge.to);
              if (!a || !b) return null;
              const lit = isLit(edge);
              return (
                <g
                  key={`${edge.from}-${edge.to}-${i}`}
                  className={cn(
                    'transition-[color,opacity] duration-300 ease-out-expo',
                    lit ? 'text-accent-ink opacity-100' : 'text-ink-3 opacity-55',
                  )}
                >
                  <path
                    d={edgePath(a, b, edge.kind, spec)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={lit ? 1.9 : 1.2}
                    strokeDasharray={edge.dashed ? '5 5' : undefined}
                    markerEnd="url(#fd-arrow)"
                  />
                </g>
              );
            })}
          </svg>

          {/* Edge labels live in HTML so they wrap and localise. */}
          {spec.edges.map((edge, i) => {
            const a = byId.get(edge.from);
            const b = byId.get(edge.to);
            if (!a || !b || !edge.label) return null;
            const feedback = edge.kind === 'feedback';
            // Feedback labels sit on the return lane; flow labels sit at the
            // midpoint of the gap the wire crosses.
            const cx = feedback ? (a.x + a.w / 2 + b.x + b.w / 2) / 2 : (a.x + a.w + b.x) / 2;
            const cy = feedback ? spec.height - 14 : (a.y + a.h / 2 + b.y + b.h / 2) / 2;
            return (
              <span
                key={`label-${i}`}
                className={cn(
                  'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded bg-surface/85 px-1.5 py-0.5 font-mono text-[0.8125rem] whitespace-nowrap transition-colors duration-300',
                  isLit(edge) ? 'text-accent-ink' : 'text-ink-3',
                )}
                style={{ left: pct(cx, spec.width), top: pct(cy, spec.height) }}
              >
                {tl(edge.label)}
              </span>
            );
          })}

          {spec.nodes.map((node, index) => {
            const isSelected = node.id === selectedId;
            const a = accentClasses[node.accent ?? 'signal'];
            return (
              <button
                key={node.id}
                ref={(el) => {
                  buttons.current[index] = el;
                }}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedId(node.id)}
                onPointerEnter={() => setHoverId(node.id)}
                onPointerLeave={() => setHoverId(null)}
                onFocus={() => setSelectedId(node.id)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className={cn(
                  'absolute flex flex-col items-start justify-center gap-1 rounded-xl border px-3 text-left transition-[border-color,background-color,box-shadow,transform] duration-300 ease-out-expo',
                  'bg-surface-2/90 backdrop-blur-sm',
                  isSelected
                    ? cn(a.border, a.bg, 'shadow-[0_0_34px_-14px_currentColor]', a.text)
                    : 'border-line hover:border-line hover:bg-surface-2',
                  !reduced && isSelected && 'scale-[1.02]',
                )}
                style={{
                  left: pct(node.x, spec.width),
                  top: pct(node.y, spec.height),
                  width: pct(node.w, spec.width),
                  height: pct(node.h, spec.height),
                }}
              >
                <span
                  className={cn(
                    'font-display text-[0.8125rem] leading-tight font-semibold',
                    isSelected ? 'text-ink' : 'text-ink',
                  )}
                >
                  {tl(node.label)}
                </span>
                {node.sub && (
                  <span
                    className={cn(
                      'font-mono text-[0.8125rem] leading-tight',
                      isSelected ? a.text : 'text-ink-3',
                    )}
                  >
                    {tl(node.sub)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="label mt-1 mb-4 flex items-center gap-2">
        <span aria-hidden className="inline-block size-1 rounded-full bg-accent" />
        {ui('agentic.diagramHint')}
      </p>

      {/* aria-live so keyboard users hear the panel update as they arrow across. */}
      <div className="card overflow-hidden rounded-xl p-5" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <h4 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-base font-semibold">
              {tl(selected.label)}
              {selected.sub && (
                <span
                  className={cn(
                    'font-mono text-[0.8125rem] font-normal',
                    accentClasses[selected.accent ?? 'signal'].text,
                  )}
                >
                  {tl(selected.sub)}
                </span>
              )}
            </h4>
            <p className="mt-2.5 text-[1rem] leading-relaxed text-ink">
              {tl(selected.detail.body)}
            </p>

            {(selected.detail.takes || selected.detail.emits || selected.detail.risk) && (
              <dl className="mt-4 grid gap-3 border-t border-line-2 pt-4 sm:grid-cols-3">
                {selected.detail.takes && (
                  <div>
                    <dt className="label mb-1.5">In</dt>
                    <dd className="font-mono text-xs leading-relaxed text-ink-2">
                      {tl(selected.detail.takes)}
                    </dd>
                  </div>
                )}
                {selected.detail.emits && (
                  <div>
                    <dt className="label mb-1.5">Out</dt>
                    <dd className="font-mono text-xs leading-relaxed text-ink-2">
                      {tl(selected.detail.emits)}
                    </dd>
                  </div>
                )}
                {selected.detail.risk && (
                  <div>
                    <dt className="label mb-1.5 text-amber/70">Fails when</dt>
                    <dd className="font-mono text-xs leading-relaxed text-ink-2">
                      {tl(selected.detail.risk)}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {caption && (
        <figcaption className="mt-3 text-[0.8125rem] leading-relaxed text-ink-3">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
