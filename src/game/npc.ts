import { TILE, passable } from './world';
import type { Facing } from './props';

/**
 * Archivists.
 *
 * A hall with nobody in it reads as a floor plan no matter how well it is
 * drawn — the reference portfolio's single most effective trick is that
 * things are moving when you arrive, before you have touched a key. Three
 * figures walking slowly between fixed points does most of that work.
 *
 * They are on rails rather than pathfinding. A wanderer that picks random
 * adjacent tiles looks drunk, and A* over a 2240-cell grid for three NPCs is
 * a web worker and a week of edge cases to solve a problem this scene does
 * not have: these routes are hand-drawn, so they are always legible and
 * always correct. If a route ever crosses a wall the constructor throws
 * instead of letting a figure glide through the masonry.
 */

export type Npc = {
  x: number;
  y: number;
  facing: Facing;
  frame: number;
  /** Palette index, so the three are visibly different people. */
  look: number;
  route: { x: number; y: number }[];
  leg: number;
  /** Seconds left to stand still at the current waypoint. */
  pause: number;
};

/** Tiles per second. Deliberately slower than the player, who is at 5.4. */
const SPEED = 2.1;
const FRAME_TIME = 0.17;

/**
 * Routes are chosen so at least one archivist is in frame at the start
 * position. Something has to be moving when the page loads — that is what
 * makes a scene read as alive rather than as a very detailed screenshot,
 * and an NPC three rooms away does none of that work.
 */
export const ROUTES: { x: number; y: number }[][] = [
  // Pacing the west aisle of the nave, straight past where the player lands.
  // Column 22, not 24: the braziers and busts that light the nave stand in
  // column 24, and these walk in straight lines between waypoints rather
  // than pathfinding, so a leg has to be clear along its whole length.
  [
    { x: 22, y: 36 },
    { x: 22, y: 22 },
  ],
  // Out of the east aisle, through the doorway into the south-east chamber
  // and back the same way. A loop would be nicer, but the only opening into
  // that chamber is this two-tile doorway, so any circuit has to re-use it —
  // and a route that leaves by a different row walks through the wall.
  [
    { x: 33, y: 32 },
    { x: 41, y: 32 },
  ],
  // A circuit of the middle-east chamber, unseen until you walk in on it.
  [
    { x: 38, y: 21 },
    { x: 50, y: 21 },
    { x: 50, y: 24 },
    { x: 38, y: 24 },
  ],
];

/**
 * Every tile a route crosses, including the ones between waypoints.
 *
 * Checking only the waypoints is not enough — a leg from (35,32) to (40,32)
 * passes through three tiles nobody declared, and if one of them holds a
 * bench the archivist walks through it. Shared with the build-time check in
 * `scripts/dump-world.mjs` so the failure lands in CI, not in a browser.
 */
export function routeTiles(route: { x: number; y: number }[]): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < route.length; i++) {
    const a = route[i];
    const b = route[(i + 1) % route.length];
    const steps = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    for (let s = 0; s <= steps; s++) {
      const t = steps === 0 ? 0 : s / steps;
      out.push({ x: Math.round(a.x + (b.x - a.x) * t), y: Math.round(a.y + (b.y - a.y) * t) });
    }
  }
  return out;
}

/** A blocked tile on a route, or null. Used by both the scene and the check. */
export function routeFault(route: { x: number; y: number }[]): { x: number; y: number } | null {
  return routeTiles(route).find((t) => !passable(t.x, t.y)) ?? null;
}

export function makeNpcs(): Npc[] {
  return ROUTES.flatMap((route, i) => {
    const fault = routeFault(route);
    if (fault) {
      // Never throw. An archivist is decoration, and the first version of
      // this threw on a bad waypoint — which took the whole canvas down and
      // left a blank page where a hall should be. A missing walker is a far
      // smaller problem than a missing scene.
      console.error(`[hall] npc route ${i} crosses a blocked tile at ${fault.x},${fault.y}`);
      return [];
    }
    return {
      x: (route[0].x + 0.5) * TILE,
      y: (route[0].y + 0.7) * TILE,
      facing: 'down' as Facing,
      frame: 0,
      look: i,
      route,
      leg: 0,
      // Staggered so they do not all set off on the same beat.
      pause: i * 1.3,
    };
  });
}

export function stepNpc(n: Npc, dt: number) {
  if (n.pause > 0) {
    n.pause -= dt;
    n.frame = 0;
    return;
  }

  const next = n.route[(n.leg + 1) % n.route.length];
  const tx = (next.x + 0.5) * TILE;
  const ty = (next.y + 0.7) * TILE;
  const dx = tx - n.x;
  const dy = ty - n.y;
  const dist = Math.hypot(dx, dy);

  if (dist < 1.5) {
    n.x = tx;
    n.y = ty;
    n.leg = (n.leg + 1) % n.route.length;
    // A beat at each corner. Without it they turn on the spot and look
    // mechanical; with it they look like they are deciding where to go.
    n.pause = 0.7 + (n.look % 3) * 0.45;
    return;
  }

  const step = Math.min(dist, SPEED * TILE * dt);
  n.x += (dx / dist) * step;
  n.y += (dy / dist) * step;
  n.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';

  n.frame += dt / FRAME_TIME;
  if (n.frame >= 4) n.frame -= 4;
}
