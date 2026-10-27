import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * A trail of small stars that follows the pointer across the page background.
 *
 * Design constraints, in the order they mattered:
 *
 *  - **Background only.** Sparkles spawn only when the pointer is over empty
 *    page, not over a card, link or button. Those elements have their own
 *    hover treatment, and glitter on top of a case-study card competes with
 *    the content rather than decorating it.
 *
 *  - **Canvas, not DOM.** One `<canvas>` and one rAF loop. Spawning dozens of
 *    absolutely-positioned elements per second forces style and layout work
 *    on every frame, which is exactly the wrong cost for pure decoration.
 *
 *  - **It sleeps.** The loop stops entirely when the last particle dies and
 *    restarts on the next spawn, so an idle page costs nothing.
 *
 *  - **Off by default where it would be wrong.** Disabled under
 *    `prefers-reduced-motion`, on coarse pointers (there is no hover to trail
 *    on a touchscreen), and on narrow viewports.
 *
 * Purely decorative: `aria-hidden`, `pointer-events: none`, and nothing here
 * carries information.
 */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  spin: number;
  hue: 'accent' | 'violet' | 'warm';
};

/** Keeps a burst of fast mouse movement from queueing unbounded work. */
const MAX_PARTICLES = 70;
/** Minimum pointer travel between spawns, in px. Without it, a slow drag
 *  dumps particles on top of each other and reads as a blob. */
const SPAWN_DISTANCE = 18;

const COLOURS: Record<Particle['hue'], string> = {
  accent: '0, 113, 227',
  violet: '91, 63, 214',
  warm: '255, 179, 64',
};

/** A four-point star, drawn with quadratic cusps so the arms stay concave. */
function drawStar(ctx: CanvasRenderingContext2D, size: number) {
  const inner = size * 0.26;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(inner * 0.55, -inner * 0.55, inner, 0);
  ctx.quadraticCurveTo(inner * 0.55, inner * 0.55, 0, size);
  ctx.quadraticCurveTo(-inner * 0.55, inner * 0.55, -inner, 0);
  ctx.quadraticCurveTo(-inner * 0.55, -inner * 0.55, 0, -size);
  ctx.closePath();
}

export function SparkleTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    // No hover on a touchscreen, and no room for it on a phone.
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();

    const particles: Particle[] = [];
    let frame = 0;
    let lastX = 0;
    let lastY = 0;
    let seeded = false;
    let lastTime = 0;

    const tick = (now: number) => {
      // Clamp dt: a backgrounded tab resumes with a huge delta and every
      // live particle would jump off screen in one step.
      const dt = lastTime ? Math.min((now - lastTime) / 16.667, 3) : 1;
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.life += dt;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Slight upward drift and drag, so stars float rather than fall.
        p.vy -= 0.012 * dt;
        p.vx *= 1 - 0.03 * dt;
        p.vy *= 1 - 0.03 * dt;
        p.rotation += p.spin * dt;

        const t = p.life / p.maxLife;
        // Fast fade-in, long fade-out.
        const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
        const scale = (0.4 + 0.6 * Math.sin(Math.PI * Math.min(t * 1.4, 1))) * p.size;

        ctx.save();
        ctx.translate(p.x * dpr, p.y * dpr);
        ctx.rotate(p.rotation);
        ctx.scale(dpr, dpr);

        const rgb = COLOURS[p.hue];
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${rgb}, ${alpha * 0.8})`;
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        drawStar(ctx, scale);
        ctx.fill();

        // A white core keeps the star readable on the dark hero band.
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
        drawStar(ctx, scale * 0.42);
        ctx.fill();

        ctx.restore();
      }

      if (particles.length) {
        frame = requestAnimationFrame(tick);
      } else {
        // Sleep. The next spawn restarts the loop.
        frame = 0;
        lastTime = 0;
      }
    };

    const spawn = (x: number, y: number) => {
      if (particles.length >= MAX_PARTICLES) return;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.25 + Math.random() * 0.75;
      const roll = Math.random();
      particles.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 34 + Math.random() * 30,
        size: 2.6 + Math.random() * 3.4,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.06,
        // Mostly accent blue, with occasional violet and a rare warm spark so
        // the trail is not one flat colour.
        hue: roll > 0.82 ? 'warm' : roll > 0.55 ? 'violet' : 'accent',
      });

      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;

      // Background only. Cards, links and buttons have their own hover
      // treatment and do not need glitter competing with them.
      const target = event.target as Element | null;
      if (target?.closest?.('a, button, input, textarea, select, [role="button"], .card')) {
        lastX = event.clientX;
        lastY = event.clientY;
        return;
      }

      if (!seeded) {
        lastX = event.clientX;
        lastY = event.clientY;
        seeded = true;
        return;
      }

      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      if (Math.hypot(dx, dy) < SPAWN_DISTANCE) return;

      lastX = event.clientX;
      lastY = event.clientY;
      spawn(event.clientX, event.clientY);
      // A second star on fast movement makes the trail feel continuous.
      if (Math.hypot(dx, dy) > SPAWN_DISTANCE * 2.5) spawn(event.clientX, event.clientY);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40"
    />
  );
}
