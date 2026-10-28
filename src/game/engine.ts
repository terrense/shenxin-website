import { makeNpcs, stepNpc } from './npc';
import { lightSources, paintGround } from './paint';
import { entities, paintHero, type Facing } from './props';
import {
  MAP_H,
  MAP_W,
  START,
  TILE,
  nearestExhibit,
  passable,
  type PlacedExhibit,
} from './world';

/**
 * The runtime.
 *
 * Deliberately not Phaser. The reference portfolio uses it and gets a tile
 * engine, a camera and an animation system for free, but it also ships about
 * a megabyte of framework to render one room — on a site whose entire
 * JavaScript budget is smaller than that. What this scene actually needs is a
 * fixed-step loop, axis-separated collision against a Uint8Array, a camera
 * that follows a point, and an interaction query. That is this file, and it
 * is about three hundred lines.
 *
 * The static world is painted once into an offscreen canvas and blitted per
 * frame. Repainting 2240 tiles every frame would be roughly a thousand times
 * more drawing than the scene needs, and on a phone it is the difference
 * between sixty frames and a slideshow.
 */

export type Input = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  /** Analogue stick, each axis in [-1, 1]. Overrides the booleans when live. */
  ax: number;
  ay: number;
};

export type SceneState = {
  /** Exhibit within reach, or null. Drives the prompt and the E key. */
  near: PlacedExhibit | null;
  /** True once the player has moved, used to retire the "walk" hint. */
  moved: boolean;
};

const SPEED = 5.4 * TILE; // world px per second — a brisk walk, ~5 tiles/s
const RADIUS = 7; // collision half-width in world px
const FRAME_TIME = 0.14; // seconds per walk frame

export class Scene {
  private ground: HTMLCanvasElement;
  private light: HTMLCanvasElement;
  private x = (START.x + 0.5) * TILE;
  private y = (START.y + 0.7) * TILE;
  private camX = 0;
  private camY = 0;
  private facing: Facing = 'down';
  private frame = 0;
  private frameT = 0;
  private walked = false;
  private t = 0;
  private npcs = makeNpcs();

  /** Device-pixel size of the backing store, set by `resize`. */
  private w = 0;
  private h = 0;
  private dpr = 1;
  private zoom = 2;

  constructor(
    private canvas: HTMLCanvasElement,
    private onState: (s: SceneState) => void,
    private reducedMotion = false,
  ) {
    this.ground = document.createElement('canvas');
    this.ground.width = MAP_W * TILE;
    this.ground.height = MAP_H * TILE;
    const g = this.ground.getContext('2d');
    if (!g) throw new Error('hall: 2D context unavailable');
    paintGround(g);

    /**
     * Light, built as shadow with holes in it.
     *
     * The obvious construction — warm radial gradients composited in
     * `screen` — produced no visible effect at all, and the reason is worth
     * recording: the floor here is #f3ead8, which is already within a few
     * percent of white. Adding light to something that bright has nowhere
     * to go. On a dark scene additive light is correct; on a sunlit one the
     * only way to show a light pool is to shade everything that is *not* in
     * it, so this is a translucent warm-grey sheet with the lit areas
     * erased out of it.
     *
     * Kept gentle. The point is modelling, not mood — this hall has to stay
     * readable, and a scene that looks moody in a screenshot is a scene
     * somebody squints at for ten minutes.
     */
    this.light = document.createElement('canvas');
    this.light.width = this.ground.width;
    this.light.height = this.ground.height;
    const l = this.light.getContext('2d');
    if (!l) throw new Error('hall: 2D context unavailable');
    l.fillStyle = 'rgba(70,54,38,0.34)';
    l.fillRect(0, 0, this.light.width, this.light.height);
    l.globalCompositeOperation = 'destination-out';
    for (const s of lightSources()) {
      const rg = l.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      rg.addColorStop(0, `rgba(0,0,0,${Math.min(1, s.a * 2)})`);
      rg.addColorStop(0.5, `rgba(0,0,0,${s.a * 0.8})`);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      l.fillStyle = rg;
      l.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
    }
    l.globalCompositeOperation = 'source-over';

    this.snapCamera();
  }

  /**
   * Picks a zoom from the viewport.
   *
   * The constraint is how much of the hall should be visible at once: enough
   * that a chamber reads as a room, not so much that the figure becomes an
   * ant. Fourteen tiles of height is the target, clamped so a phone does not
   * end up at a fractional zoom — integer scaling is what keeps the art crisp.
   */
  resize(cssW: number, cssH: number, dpr: number) {
    this.dpr = Math.min(dpr, 2);
    this.w = Math.round(cssW * this.dpr);
    this.h = Math.round(cssH * this.dpr);
    this.canvas.width = this.w;
    this.canvas.height = this.h;

    // Seventeen tiles of height. Fourteen was the first guess and the
    // screenshot showed why it was wrong: at that zoom a chamber does not
    // fit on screen, so the hall reads as a corridor and the figure reads as
    // oversized. Seventeen puts a whole room plus the colonnade in frame
    // while keeping the sprite big enough to have a face.
    const target = cssH / (TILE * 17);
    this.zoom = Math.max(1.2, Math.min(3, target));
    this.snapCamera();
  }

  private viewTilesX() {
    return this.w / this.dpr / (TILE * this.zoom);
  }
  private viewTilesY() {
    return this.h / this.dpr / (TILE * this.zoom);
  }

  /**
   * Camera target.
   *
   * Clamped so it never shows the void outside the building — on a map this
   * much larger than the viewport that is almost free, and it means the
   * player never sees the edge of the world.
   */
  private targetCamera() {
    const vw = this.viewTilesX() * TILE;
    const vh = this.viewTilesY() * TILE;
    const maxX = Math.max(0, MAP_W * TILE - vw);
    const maxY = Math.max(0, MAP_H * TILE - vh);
    return {
      x: Math.max(0, Math.min(maxX, this.x - vw / 2)),
      y: Math.max(0, Math.min(maxY, this.y - vh / 2)),
    };
  }

  private snapCamera() {
    const t = this.targetCamera();
    this.camX = t.x;
    this.camY = t.y;
  }

  /** Axis-separated so sliding along a wall works instead of sticking to it. */
  private move(dx: number, dy: number) {
    const free = (px: number, py: number) => {
      // Four corners of the collision box, so a corner never clips a pillar.
      for (const ox of [-RADIUS, RADIUS]) {
        for (const oy of [-RADIUS, 0]) {
          const tx = Math.floor((px + ox) / TILE);
          const ty = Math.floor((py + oy) / TILE);
          if (!passable(tx, ty)) return false;
        }
      }
      return true;
    };
    if (dx && free(this.x + dx, this.y)) this.x += dx;
    if (dy && free(this.x, this.y + dy)) this.y += dy;
  }

  step(dt: number, input: Input) {
    this.t += dt;

    // Archivists keep walking under reduced motion. The preference is about
    // vestibular triggers — large, fast, unexpected movement — not about
    // three small figures strolling at two tiles a second, and freezing them
    // turns a hall into a waxworks for the people who asked for it.
    for (const n of this.npcs) stepNpc(n, dt);

    let vx = input.ax;
    let vy = input.ay;
    if (vx === 0 && vy === 0) {
      vx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      vy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    }
    const len = Math.hypot(vx, vy);
    if (len > 1) {
      vx /= len;
      vy /= len;
    }

    const moving = len > 0.08;
    if (moving) {
      this.move(vx * SPEED * dt, vy * SPEED * dt);
      // Facing follows the dominant axis, which keeps diagonal movement from
      // flipping the sprite back and forth every frame.
      this.facing =
        Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
      this.frameT += dt;
      if (this.frameT >= FRAME_TIME) {
        this.frameT -= FRAME_TIME;
        this.frame = (this.frame + 1) & 3;
      }
      if (!this.walked) {
        this.walked = true;
        this.emit();
      }
    } else {
      this.frame = 0;
      this.frameT = 0;
    }

    // Camera easing. Exponential, so it is frame-rate independent — a plain
    // lerp by a constant drifts with refresh rate and feels different on a
    // 120 Hz display.
    const target = this.targetCamera();
    const k = this.reducedMotion ? 1 : 1 - Math.exp(-9 * dt);
    this.camX += (target.x - this.camX) * k;
    this.camY += (target.y - this.camY) * k;

    const found = this.currentNear();
    if (found?.id !== this.lastNear?.id) {
      this.lastNear = found;
      this.emit();
    }
  }

  private lastNear: PlacedExhibit | null = null;

  private currentNear() {
    return nearestExhibit(Math.floor(this.x / TILE), Math.floor((this.y - RADIUS) / TILE));
  }

  private emit() {
    this.onState({ near: this.lastNear, moved: this.walked });
  }

  /** The exhibit the E key would open, for callers that need it synchronously. */
  get near() {
    return this.lastNear;
  }

  draw() {
    const c = this.canvas.getContext('2d');
    if (!c) return;
    const s = this.dpr * this.zoom;

    c.setTransform(1, 0, 0, 1, 0, 0);
    c.imageSmoothingEnabled = false;
    c.fillStyle = '#c9d6d8';
    c.fillRect(0, 0, this.w, this.h);

    // Round the camera to whole device pixels. Without this the blit lands on
    // a fractional offset and every straight line in the art shimmers as the
    // player walks, which is the single most common way a canvas tile scene
    // ends up looking cheap.
    const ox = Math.round(-this.camX * s) / s;
    const oy = Math.round(-this.camY * s) / s;
    c.setTransform(s, 0, 0, s, ox * s, oy * s);

    c.drawImage(this.ground, 0, 0);
    this.drawHighlight(c);

    // Depth pass. Cull to the viewport first — the sort is then over the
    // thirty-odd things actually on screen rather than all ninety.
    const vw = this.viewTilesX();
    const vh = this.viewTilesY();
    const x0 = this.camX / TILE - 2;
    const x1 = this.camX / TILE + vw + 2;
    const y0 = this.camY / TILE - 3;
    const y1 = this.camY / TILE + vh + 3;

    const visible: { x: number; y: number; draw: (c: CanvasRenderingContext2D) => void }[] =
      entities.filter((e) => e.x >= x0 && e.x <= x1 && e.y >= y0 && e.y <= y1);

    // Archivists join the same sort, so they pass behind columns too.
    for (const n of this.npcs) {
      const nx = n.x / TILE;
      const ny = n.y / TILE;
      if (nx < x0 || nx > x1 || ny < y0 || ny > y1) continue;
      visible.push({
        x: nx,
        y: ny - 0.5,
        draw: (ctx) => paintHero(ctx, n.x, n.y, n.facing, n.frame, n.look + 1),
      });
    }

    const heroY = this.y / TILE;
    visible.sort((a, b) => a.y - b.y);

    let i = 0;
    // Anything whose foot is north of the player is behind them.
    while (i < visible.length && visible[i].y + 0.5 < heroY) visible[i++].draw(c);
    paintHero(c, this.x, this.y, this.facing, this.frame);
    while (i < visible.length) visible[i++].draw(c);

    // Plain source-over: the layer is shade, not glow. See the constructor.
    c.drawImage(this.light, 0, 0);

    this.drawVignette(c);
  }

  /** A ring under whatever is in reach. The only "UI" drawn inside the world. */
  private drawHighlight(c: CanvasRenderingContext2D) {
    const e = this.lastNear;
    if (!e) return;
    const cx = (e.x + 0.5) * TILE;
    const cy = (e.y + 0.9) * TILE;
    const pulse = this.reducedMotion ? 0.6 : 0.45 + Math.sin(this.t * 4) * 0.18;
    c.save();
    c.globalAlpha = pulse;
    c.strokeStyle = '#c69a3f';
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(cx, cy, TILE * 0.62, TILE * 0.3, 0, 0, Math.PI * 2);
    c.stroke();
    c.globalAlpha = pulse * 0.4;
    c.beginPath();
    c.ellipse(cx, cy, TILE * 0.78, TILE * 0.38, 0, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }

  /** Screen-space, so it is applied after the world transform is reset. */
  private drawVignette(c: CanvasRenderingContext2D) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    const g = c.createRadialGradient(
      this.w / 2,
      this.h / 2,
      Math.min(this.w, this.h) * 0.42,
      this.w / 2,
      this.h / 2,
      Math.max(this.w, this.h) * 0.78,
    );
    g.addColorStop(0, 'rgba(40,32,22,0)');
    g.addColorStop(1, 'rgba(40,32,22,0.3)');
    c.fillStyle = g;
    c.fillRect(0, 0, this.w, this.h);
  }

  /** Player position in tiles, for the minimap. */
  get tile() {
    return { x: this.x / TILE, y: this.y / TILE };
  }

  /** Teleport, used by the minimap's room shortcuts and by reduced-motion. */
  warpTo(tx: number, ty: number) {
    this.x = (tx + 0.5) * TILE;
    this.y = (ty + 0.7) * TILE;
    this.snapCamera();
    this.lastNear = this.currentNear();
    this.walked = true;
    this.emit();
  }
}
