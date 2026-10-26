import { Suspense, lazy, useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/primitives/ErrorBoundary';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMinWidth } from '@/hooks/useUi';

/**
 * `three` + `@react-three/fiber` are roughly 600 KB of the bundle, so they are
 * code-split and only requested when all of the following hold:
 *
 *   1. the user has not asked for reduced motion,
 *   2. the viewport is at least 640px (phones get the static backdrop; the
 *      battery cost is not worth it for a decorative layer), and
 *   3. the browser reports a usable WebGL context,
 *   4. the first paint has already happened — the import is deferred to idle
 *      so it never competes with the hero text for the LCP.
 *
 * If any check fails, or the scene throws at runtime, `StaticBackdrop` renders
 * instead. It is not a placeholder: it is a finished, intentional design.
 */
const NeuralField = lazy(() => import('./NeuralField'));

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return false;
    // Software rasterisers render this scene at single-digit FPS.
    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = String(
        (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      ).toLowerCase();
      if (renderer.includes('swiftshader') || renderer.includes('software')) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Static lattice. Same palette, same composition, zero JavaScript cost. */
export function StaticBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 size-full opacity-[0.55]"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <defs>
          <linearGradient id="hb-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5ee7ff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#8b7cff" stopOpacity="0.5" />
          </linearGradient>
          <radialGradient id="hb-vignette" cx="0.5" cy="0.45" r="0.62">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="hb-mask">
            <rect width="1200" height="700" fill="url(#hb-vignette)" />
          </mask>
        </defs>
        <g mask="url(#hb-mask)">
          <g stroke="url(#hb-edge)" strokeWidth="0.9" fill="none" opacity="0.6">
            <path d="M120 150 L260 232 L198 372 L120 150 M260 232 L430 190 L520 300 L430 420 L198 372 M520 300 L690 262 L780 150 M690 262 L742 420 L600 492 L430 420 M780 150 L944 208 L1020 330 L900 430 L742 420 M944 208 L1080 140 M1020 330 L1130 470 M600 492 L520 620 L360 560 L198 372 M900 430 L960 580 L820 630 L600 492" />
          </g>
          <g fill="url(#hb-edge)">
            {[
              [120, 150, 3],
              [260, 232, 4.5],
              [198, 372, 3.5],
              [430, 190, 2.5],
              [520, 300, 5.5],
              [430, 420, 3],
              [690, 262, 4],
              [780, 150, 2.5],
              [742, 420, 4.5],
              [600, 492, 5],
              [944, 208, 3.5],
              [1020, 330, 3],
              [900, 430, 4],
              [1080, 140, 2],
              [1130, 470, 2.5],
              [520, 620, 3],
              [360, 560, 2.5],
              [960, 580, 3],
              [820, 630, 2],
            ].map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

export function HeroBackdrop() {
  const reduced = useReducedMotion();
  const wideEnough = useMinWidth(640);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced || !wideEnough) return;
    if (!hasWebGL()) return;

    // Defer the ~600 KB chunk past first paint.
    const idle = window.requestIdleCallback?.bind(window);
    if (idle) {
      const handle = idle(() => setReady(true), { timeout: 1600 });
      return () => window.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(() => setReady(true), 600);
    return () => window.clearTimeout(timer);
  }, [reduced, wideEnough]);

  if (!ready) return <StaticBackdrop />;

  return (
    <ErrorBoundary label="NeuralField" fallback={<StaticBackdrop />}>
      <Suspense fallback={<StaticBackdrop />}>
        <NeuralField intensity={1} />
      </Suspense>
    </ErrorBoundary>
  );
}
