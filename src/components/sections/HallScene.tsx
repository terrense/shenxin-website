import { useEffect, useRef, useState } from 'react';
import { Scene, type Input, type SceneState } from '@/game/engine';
import { floorPlanDataUrl } from '@/game/paint';
import { MAP_H, MAP_W, assertWorld, placed, type PlacedExhibit } from '@/game/world';
import { useLocale } from '@/i18n/LocaleProvider';

/**
 * The hall, full-bleed.
 *
 * The previous version of this page drew a 26×16 grid of SVG glyphs inside a
 * content column, which was honest about being a diagram and read as one.
 * The brief was a scene that fills the screen, and the thing that actually
 * makes a scene fill a screen is not size — it is that the world is larger
 * than the window, so the camera has somewhere to go and the player has
 * something to find.
 *
 * React owns the chrome and nothing else. The canvas is driven imperatively
 * by `Scene`; the only things that cross back into React are "which exhibit
 * is in reach" and "has the player moved yet", both of which change a few
 * times a minute rather than sixty times a second. Running the game loop
 * through React state would re-render the tree every frame to move one
 * sprite.
 */

type Props = {
  onOpen: (e: PlacedExhibit) => void;
  /** True while a modal is up: the loop keeps drawing but stops taking input. */
  paused: boolean;
};

/** Only the boolean axes — `ax`/`ay` belong to the stick and are not keyed. */
const KEYS: Record<string, 'up' | 'down' | 'left' | 'right'> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
  // Russian keyboard layout shares the physical WASD keys with these, and a
  // trilingual site that only responds to Latin letters is a site that does
  // not work for a third of the people it was translated for.
  ц: 'up',
  ы: 'down',
  ф: 'left',
  в: 'right',
  Ц: 'up',
  Ы: 'down',
  Ф: 'left',
  В: 'right',
};

export function HallScene({ onOpen, paused }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const inputRef = useRef<Input>({
    up: false,
    down: false,
    left: false,
    right: false,
    ax: 0,
    ay: 0,
  });
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const [state, setState] = useState<SceneState>({ near: null, moved: false });
  const [stick, setStick] = useState<{ x: number; y: number } | null>(null);
  const { ui, tl } = useLocale();

  // `near` has to be readable from the keydown handler without re-binding it
  // on every change, so it is mirrored into a ref.
  const nearRef = useRef<PlacedExhibit | null>(null);
  nearRef.current = state.near;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new Scene(canvas, setState, reduced);
    sceneRef.current = scene;

    if (import.meta.env.DEV) {
      const problems = assertWorld();
      for (const p of problems) console.error(`[hall] ${p}`);
    }

    const fit = () => {
      const rect = wrap.getBoundingClientRect();
      scene.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      scene.draw();
    };
    fit();

    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Clamped so a backgrounded tab does not resume by teleporting the
      // player across the hall in one step, straight through a wall.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!pausedRef.current) scene.step(dt, inputRef.current);
      scene.draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = KEYS[e.key];
      if (key) {
        inputRef.current[key] = true;
        // Arrow keys scroll the page otherwise, which fights the camera.
        e.preventDefault();
        return;
      }
      if ((e.key === 'e' || e.key === 'E' || e.key === 'у' || e.key === 'У' || e.key === ' ') &&
          !pausedRef.current) {
        const near = nearRef.current;
        if (near) {
          e.preventDefault();
          onOpen(near);
        }
      }
    };
    const up = (e: KeyboardEvent) => {
      const key = KEYS[e.key];
      if (key) inputRef.current[key] = false;
    };
    const blur = () => {
      inputRef.current.up = false;
      inputRef.current.down = false;
      inputRef.current.left = false;
      inputRef.current.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [onOpen]);

  // --- virtual stick --------------------------------------------------------

  const stickBase = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    stickBase.current = { x: e.clientX, y: e.clientY };
    setStick({ x: 0, y: 0 });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const base = stickBase.current;
    if (!base) return;
    const R = 56;
    let dx = e.clientX - base.x;
    let dy = e.clientY - base.y;
    const d = Math.hypot(dx, dy);
    if (d > R) {
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    setStick({ x: dx, y: dy });
    // Dead zone, so resting a thumb does not creep the figure across the room.
    const dead = 10;
    inputRef.current.ax = Math.abs(dx) < dead ? 0 : dx / R;
    inputRef.current.ay = Math.abs(dy) < dead ? 0 : dy / R;
  };
  const endStick = () => {
    stickBase.current = null;
    setStick(null);
    inputRef.current.ax = 0;
    inputRef.current.ay = 0;
  };

  const near = state.near;

  return (
    <div
      ref={wrapRef}
      className="relative h-[100svh] w-full touch-none overflow-hidden bg-[#c9d6d8] select-none"
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />

      {/* Touch surface. Separate from the canvas so the canvas stays inert. */}
      <div
        className="absolute inset-0"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStick}
        onPointerCancel={endStick}
      />

      {/*
        The scene is decorative in the accessibility tree — everything it
        contains is reachable from the exhibit list below it. This live region
        is what makes the walking version narratable at all: it announces what
        you are standing next to without the canvas pretending to be content.
      */}
      <p className="sr-only" aria-live="polite">
        {near ? tl(near.title) : ''}
      </p>

      {/* Controls hint, retired once the player has actually moved. */}
      <div
        className={[
          // Clear of the site header, which floats over the scene.
          'pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 transition-opacity duration-700 md:top-24',
          state.moved ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        <p className="rounded-full bg-[#2b2a33]/82 px-4 py-2 text-[0.8125rem] font-medium text-[#f7efdd] shadow-lg backdrop-blur-sm">
          {ui('hall.controls')}
        </p>
      </div>

      {/* Interaction prompt. */}
      <div
        className={[
          'pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 transition-all duration-200',
          near ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        ].join(' ')}
      >
        <button
          type="button"
          disabled={!near}
          onClick={() => near && onOpen(near)}
          className="pointer-events-auto flex items-center gap-3 rounded-full border border-[#c69a3f] bg-[#2b2a33]/90 py-2.5 pr-5 pl-3 text-[#f7efdd] shadow-xl backdrop-blur-sm"
        >
          <kbd className="rounded border border-[#c69a3f]/60 bg-[#c69a3f]/20 px-2 py-0.5 font-mono text-[0.75rem] text-[#f3dc94]">
            E
          </kbd>
          <span className="font-display text-[0.9375rem] font-semibold">
            {near ? tl(near.title) : ''}
          </span>
        </button>
      </div>

      <Minimap scene={sceneRef} />

      {/* Virtual stick, drawn where the thumb landed. */}
      {stick && stickBase.current && (
        <div
          className="pointer-events-none absolute z-10"
          style={{ left: stickBase.current.x, top: stickBase.current.y }}
        >
          <div className="absolute size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f7efdd]/40 bg-[#2b2a33]/20" />
          <div
            className="absolute size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#c69a3f] bg-[#f7efdd]/70"
            style={{ transform: `translate(calc(-50% + ${stick.x}px), calc(-50% + ${stick.y}px))` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Minimap.
 *
 * Reads the scene's position on an interval rather than on every frame: a
 * four-pixel dot moving across a 112-pixel map does not need 60 Hz, and
 * re-rendering React that often to move it would be the most expensive thing
 * on the page.
 */
function Minimap({ scene }: { scene: React.RefObject<Scene | null> }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [plan, setPlan] = useState('');

  useEffect(() => {
    setPlan(floorPlanDataUrl(3));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const s = scene.current;
      if (s) setPos(s.tile);
    }, 120);
    return () => clearInterval(id);
  }, [scene]);

  const W = 140;
  const H = (W * MAP_H) / MAP_W;

  return (
    <div
      className="pointer-events-none absolute top-20 right-4 rounded-lg border border-[#2b2a33]/25 bg-[#2b2a33]/35 p-1.5 shadow-lg backdrop-blur-sm md:top-24"
      aria-hidden="true"
    >
      <div className="relative" style={{ width: W, height: H }}>
        {plan && (
          <img
            src={plan}
            alt=""
            className="absolute inset-0 h-full w-full"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
        {placed.map((e) => (
          <span
            key={e.id}
            className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b1762a] ring-1 ring-[#f7efdd]/70"
            style={{ left: ((e.x + 0.5) / MAP_W) * W, top: ((e.y + 0.5) / MAP_H) * H }}
          />
        ))}
        <span
          className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1d4f8f] ring-2 ring-[#f7efdd] transition-all duration-150 ease-linear"
          style={{ left: (pos.x / MAP_W) * W, top: (pos.y / MAP_H) * H }}
        />
      </div>
    </div>
  );
}
