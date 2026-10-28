import { exhibits, type Exhibit } from '@/content/palace';

/**
 * The hall, as geometry.
 *
 * The first version of this page drew a 26×16 character grid as SVG glyphs.
 * It was legible and completely flat, and the comparison with the reference
 * (peteroravec.com — Phaser, a tiled world, a camera that follows a sprite)
 * was not close. So this is a real tile world: bigger than the viewport in
 * both axes, so the camera has somewhere to travel, with rooms the player
 * discovers rather than a single room they take in at a glance.
 *
 * The map is generated from a room spec rather than authored as string rows.
 * 36 rows of exactly 56 characters is a thing I would get wrong, and a
 * miscounted row is a wall in the wrong place — which looks like a bug in
 * the collision code, not a typo in the data. Generating it means the
 * invariants (every exhibit reachable, start on a floor tile) can be
 * asserted instead of eyeballed, which `assertWorld` does below.
 *
 * Plan — a colonnaded nave running north/south with three chambers off each
 * side. A nave keeps the whole hall legible from anywhere inside it: you can
 * always see where you came from, so nobody gets lost in a maze of rooms,
 * which is the failure mode of a grid of equal boxes.
 */

export const TILE = 32;
export const MAP_W = 56;
export const MAP_H = 40;

/**
 * A plain const object rather than a `const enum`: under `isolatedModules`
 * a const enum cannot be erased safely, and this needs to survive being
 * bundled by esbuild for the geometry dump in `scripts/dump-world.mjs`.
 */
export const Cell = {
  /** Outside the building. Never drawn as floor, never walkable. */
  Void: 0,
  Wall: 1,
  Floor: 2,
  /** Walkable, drawn as patterned stone — marks the nave and chamber centres. */
  Inlay: 3,
  /** Walkable, drawn as carpet. Defines where the eye goes. */
  Rug: 4,
  /** Blocks movement. The colonnade. */
  Pillar: 5,
  /** Blocks movement. Lines the chamber walls. */
  Shelf: 6,
  /** Wall tile carrying a window. Blocks movement, lets light in. */
  Window: 7,
} as const;

export type Cell = (typeof Cell)[keyof typeof Cell];

export type Grid = Uint8Array;

const at = (g: Grid, x: number, y: number) => g[y * MAP_W + x];
const set = (g: Grid, x: number, y: number, c: Cell) => {
  if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) g[y * MAP_W + x] = c;
};

const rect = (g: Grid, x0: number, y0: number, x1: number, y1: number, c: Cell) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(g, x, y, c);
};

/**
 * Room bounds, inclusive. `nave` is one tall open gallery; the six chambers
 * open off it through doorways cut in the dividing walls.
 */
export const ROOMS = {
  nave: { x0: 22, y0: 2, x1: 33, y1: 37 },
  west: [
    { x0: 2, y0: 2, x1: 19, y1: 12 },
    { x0: 2, y0: 14, x1: 19, y1: 24 },
    { x0: 2, y0: 26, x1: 19, y1: 37 },
  ],
  east: [
    { x0: 36, y0: 2, x1: 53, y1: 12 },
    { x0: 36, y0: 14, x1: 53, y1: 24 },
    { x0: 36, y0: 26, x1: 53, y1: 37 },
  ],
} as const;

/** Doorway rows — two tiles tall so the opening reads as an arch, not a slot. */
const DOORS = [7, 19, 31];

/**
 * The runner down the nave. Exported because the carpet's pattern depends on
 * where a tile sits inside it — guard lines an inset from the edge, a cross
 * band every fourth course — and deriving that from neighbours per tile is
 * both slower and harder to read than just knowing the rectangle.
 */
export const RUG = { x0: 25, y0: 4, x1: 30, y1: 35 } as const;

/**
 * Floor medallions, one per chamber, radius in tiles.
 *
 * Exported for the same reason as `RUG`. Painting the inlay per tile without
 * knowing where the medallion's centre is produced a 5×5 block of identical
 * small diamonds — correct tile art, and from above indistinguishable from
 * wallpaper. A medallion has to be one shape drawn across the whole block,
 * which means the painter needs the centre.
 */
export const MEDALLIONS = [
  { cx: 10, cy: 7, r: 2 },
  { cx: 10, cy: 19, r: 2 },
  { cx: 10, cy: 31, r: 2 },
  { cx: 45, cy: 7, r: 2 },
  { cx: 45, cy: 19, r: 2 },
  { cx: 45, cy: 31, r: 2 },
] as const;

/**
 * Directly south of the astrolabe, which carries the controls.
 *
 * Two things were wrong with starting at the south door. The camera clamps
 * against the bottom of the map there, so the figure sits half off the
 * viewport edge on the opening frame — the first thing anyone sees, and it
 * looks like a bug. And it starts the player out of reach of everything, so
 * the interaction prompt never appears until they have already guessed that
 * one exists. Starting in reach of the first exhibit means the prompt is on
 * screen at load, which teaches the mechanic without a tutorial.
 */
export const START = { x: 27, y: 32 };

function build(): Grid {
  const g: Grid = new Uint8Array(MAP_W * MAP_H).fill(Cell.Wall);

  // Everything outside the footprint is void, so the renderer can draw haze
  // there instead of pretending the building continues.
  rect(g, 0, 0, MAP_W - 1, 0, Cell.Void);
  rect(g, 0, MAP_H - 1, MAP_W - 1, MAP_H - 1, Cell.Void);
  rect(g, 0, 0, 0, MAP_H - 1, Cell.Void);
  rect(g, MAP_W - 1, 0, MAP_W - 1, MAP_H - 1, Cell.Void);

  const carve = (r: { x0: number; y0: number; x1: number; y1: number }) =>
    rect(g, r.x0, r.y0, r.x1, r.y1, Cell.Floor);

  carve(ROOMS.nave);
  ROOMS.west.forEach(carve);
  ROOMS.east.forEach(carve);

  // Doorways through the two dividing walls (cols 20–21 west, 34–35 east).
  for (const y of DOORS) {
    rect(g, 20, y, 21, y + 1, Cell.Floor);
    rect(g, 34, y, 35, y + 1, Cell.Floor);
  }

  // The nave runs a carpet down its middle with a stone border either side.
  // This is the single strongest navigation cue in the hall: the carpet points
  // at the great window, so "go north" needs no instruction.
  rect(g, RUG.x0, RUG.y0, RUG.x1, RUG.y1, Cell.Rug);
  rect(g, 24, 3, 31, 3, Cell.Inlay);

  // The colonnade, set one tile in from the nave's edge so there is an aisle
  // behind it. Pillars flush against the dividing wall read as decoration
  // applied to the wall; pillars with floor on both sides read as a building
  // holding a roof up, and the player can walk either side of them.
  for (let y = 5; y <= 33; y += 4) {
    if (DOORS.some((d) => y === d || y === d + 1)) continue;
    set(g, 23, y, Cell.Pillar);
    set(g, 32, y, Cell.Pillar);
  }

  // Shelving along the outer wall of each chamber, with the middle left open
  // so the room has a readable focal point rather than a solid ring.
  for (const r of [...ROOMS.west, ...ROOMS.east]) {
    const outer = r.x0 === 2 ? r.x0 : r.x1;
    for (let y = r.y0 + 1; y <= r.y1 - 1; y++) {
      if (y >= r.y0 + 4 && y <= r.y1 - 4) continue;
      set(g, outer, y, Cell.Shelf);
    }
    rect(g, r.x0 + 3, r.y0, r.x1 - 3, r.y0, Cell.Shelf);
  }

  // Inlay medallion at each chamber centre — gives the exhibit something to
  // stand on, and tells the player where the interesting thing is from the door.
  for (const m of MEDALLIONS) {
    rect(g, m.cx - m.r, m.cy - m.r, m.cx + m.r, m.cy + m.r, Cell.Inlay);
  }

  // The great window, centred in the north wall above the apse.
  rect(g, 25, 1, 30, 1, Cell.Window);
  // Clerestory windows in each chamber's outer wall, aligned with the gap in
  // the shelving so the light lands on the exhibit.
  for (const r of [...ROOMS.west, ...ROOMS.east]) {
    const wallX = r.x0 === 2 ? 1 : MAP_W - 2;
    const cy = ((r.y0 + r.y1) / 2) | 0;
    rect(g, wallX, cy - 1, wallX, cy + 1, Cell.Window);
  }

  return g;
}

export const grid = build();

export const cellAt = (x: number, y: number): Cell => {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return Cell.Void;
  return at(grid, x, y) as Cell;
};

export const walkable = (x: number, y: number): boolean => {
  const c = cellAt(x, y);
  return c === Cell.Floor || c === Cell.Inlay || c === Cell.Rug;
};

/**
 * Exhibit placement, keyed by the ids in `palace.ts`.
 *
 * Deliberately chronological as you walk north: the player starts at the
 * south door next to the astrolabe (which carries the controls), passes the
 * two agent workstations in the nave, and reaches the window last. The side
 * chambers run early-career at the north end to recent work at the south,
 * west and east paired so the GNSS pair and the robotics pair face each other.
 */
const PLACEMENT: Record<string, { x: number; y: number }> = {
  astrolabe: { x: 27, y: 31 },
  window: { x: 27, y: 3 },
  terminal: { x: 24, y: 22 },
  caduceus: { x: 31, y: 22 },
  tank: { x: 10, y: 7 },
  pointcloud: { x: 10, y: 19 },
  vine: { x: 10, y: 31 },
  blackboard: { x: 45, y: 7 },
  antenna: { x: 45, y: 19 },
  arm: { x: 45, y: 31 },
};

/**
 * Furniture.
 *
 * The first screenshot of the finished architecture showed six chambers of
 * about 200 tiles each containing one exhibit and otherwise nothing — a
 * correct building that read as an empty warehouse. Rooms need enough in
 * them that the exhibit is the most interesting thing rather than the only
 * thing, which is a different and much easier bar to clear.
 *
 * Everything here blocks movement. That is deliberate: props you can walk
 * through stop being furniture and become floor decals, and the player
 * learns within seconds that nothing in the room is real.
 */
export type DecorKind = 'table' | 'brazier' | 'crate' | 'plant' | 'bench' | 'bust';
export type Decor = { x: number; y: number; kind: DecorKind };

function furnish(): Decor[] {
  const out: Decor[] = [];
  const add = (x: number, y: number, kind: DecorKind) => {
    if (walkable(x, y)) out.push({ x, y, kind });
  };

  /**
   * Six layouts, one per chamber.
   *
   * The first version ran one placement rule over every room, and the
   * screenshot made the problem obvious immediately: the hall was
   * mirror-symmetric down the nave and identical front to back, so it read
   * as one room copy-pasted six times. Rooms in a real building differ
   * because they are used for different things, and six hand-varied layouts
   * is a dozen lines against a scene that otherwise looks generated.
   *
   * Offsets are relative to the chamber centre, with `s` flipping the
   * long axis so west and east wings are not each other's reflection.
   */
  type Spot = [dx: number, dy: number, kind: DecorKind];
  const LAYOUTS: Spot[][] = [
    // Reading room: tables in a row, shelves already line the wall.
    [
      [-5, -1, 'table'],
      [-5, 1, 'bench'],
      [5, -1, 'table'],
      [5, 1, 'bench'],
      [-7, -4, 'brazier'],
      [7, 4, 'brazier'],
      [0, -4, 'bust'],
    ],
    // Store room: crates, one working table, light where the work is.
    [
      [-6, -3, 'crate'],
      [-7, -1, 'crate'],
      [-6, 2, 'crate'],
      [5, 0, 'table'],
      [5, 2, 'bench'],
      [7, -4, 'brazier'],
      [-7, 4, 'brazier'],
    ],
    // Orangery: planting down one side, a bench to sit at.
    [
      [-6, -3, 'plant'],
      [-7, 0, 'plant'],
      [-6, 3, 'plant'],
      [6, 1, 'bench'],
      [6, -1, 'table'],
      [7, 4, 'brazier'],
      [-7, -4, 'brazier'],
      [0, 4, 'bust'],
    ],
    // Gallery: busts on both approaches, kept otherwise clear.
    [
      [-5, -3, 'bust'],
      [-5, 3, 'bust'],
      [5, -3, 'bust'],
      [5, 3, 'bust'],
      [-7, 0, 'brazier'],
      [7, 0, 'brazier'],
      [0, 4, 'bench'],
    ],
    // Workshop: two benches, crates, a plant by the door.
    [
      [-6, -2, 'table'],
      [-6, 0, 'bench'],
      [6, -2, 'table'],
      [6, 0, 'bench'],
      [-7, 3, 'crate'],
      [7, 3, 'plant'],
      [0, -4, 'brazier'],
    ],
    // Antechamber: sparse, so the last room before the entrance breathes.
    [
      [-6, 0, 'bench'],
      [6, 0, 'bench'],
      [-7, -4, 'plant'],
      [7, -4, 'plant'],
      [-7, 4, 'brazier'],
      [7, 4, 'brazier'],
    ],
  ];

  const rooms = [...ROOMS.west, ...ROOMS.east];
  rooms.forEach((room, i) => {
    const cx = ((room.x0 + room.x1) / 2) | 0;
    const cy = ((room.y0 + room.y1) / 2) | 0;
    // West wings run the layouts forward, east wings run a different one and
    // mirrored, so no two chambers on opposite sides of the nave match.
    const west = room.x0 === 2;
    const layout = LAYOUTS[(i * 2 + (west ? 0 : 1)) % LAYOUTS.length];
    const s = west ? 1 : -1;
    for (const [dx, dy, kind] of layout) add(cx + dx * s, cy + dy, kind);
  });

  // The nave: braziers between the columns, and planting by the south door.
  for (const y of [11, 15, 27, 35]) {
    add(24, y, 'brazier');
    add(31, y, 'brazier');
  }
  add(24, 5, 'plant');
  add(31, 5, 'plant');
  add(24, 29, 'bust');
  add(31, 29, 'bust');

  return out;
}

export const decor: Decor[] = furnish();

/**
 * The colonnade, as a list.
 *
 * Pillars are the one piece of architecture the player can walk behind, so
 * unlike walls and shelving they cannot be baked into the static layer —
 * they have to take part in the per-frame depth sort or the figure passes
 * in front of a column it is standing behind.
 */
export const pillars: { x: number; y: number }[] = (() => {
  const out: { x: number; y: number }[] = [];
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (cellAt(x, y) === Cell.Pillar) out.push({ x, y });
    }
  }
  return out;
})();

export type PlacedExhibit = Exhibit & { x: number; y: number };

export const placed: PlacedExhibit[] = exhibits.map((e) => {
  const p = PLACEMENT[e.id];
  if (!p) throw new Error(`palace: exhibit "${e.id}" has no placement in world.ts`);
  return { ...e, x: p.x, y: p.y };
});

/** Exhibits and furniture block movement — you walk up to one, not through it. */
const blocked = new Set([...placed, ...decor].map((e) => `${e.x},${e.y}`));
export const passable = (x: number, y: number) => walkable(x, y) && !blocked.has(`${x},${y}`);

/** Interaction range, in tiles. Chebyshev, so diagonals count. */
export const REACH = 1;

export const nearestExhibit = (tx: number, ty: number): PlacedExhibit | null => {
  let best: PlacedExhibit | null = null;
  let bestD = Infinity;
  for (const e of placed) {
    const d = Math.max(Math.abs(e.x - tx), Math.abs(e.y - ty));
    if (d <= REACH && d < bestD) {
      best = e;
      bestD = d;
    }
  }
  return best;
};

/**
 * Invariants worth failing loudly on, because every one of them produces a
 * symptom that looks like something else: an exhibit sealed behind a wall
 * reads as broken interaction code, and a start tile inside a pillar reads
 * as broken collision.
 *
 * Run from the scene on mount in dev. Cheap — one flood fill over 2240 cells.
 */
export function assertWorld(): string[] {
  const problems: string[] = [];

  if (!passable(START.x, START.y)) problems.push(`start tile ${START.x},${START.y} is not passable`);

  const seen = new Uint8Array(MAP_W * MAP_H);
  const queue: number[] = [START.y * MAP_W + START.x];
  seen[queue[0]] = 1;
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head];
    const x = i % MAP_W;
    const y = (i / MAP_W) | 0;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const nx = x + dx;
      const ny = y + dy;
      const ni = ny * MAP_W + nx;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H || seen[ni]) continue;
      if (!passable(nx, ny)) continue;
      seen[ni] = 1;
      queue.push(ni);
    }
  }

  for (const e of placed) {
    // The exhibit's own tile is blocked, so check that at least one neighbour
    // is both passable and reachable — that is what "you can walk up to it" means.
    const reachable = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].some(([dx, dy]) => {
      const nx = e.x + dx;
      const ny = e.y + dy;
      return (
        nx >= 0 && ny >= 0 && nx < MAP_W && ny < MAP_H && passable(nx, ny) && seen[ny * MAP_W + nx]
      );
    });
    if (!reachable) problems.push(`exhibit "${e.id}" at ${e.x},${e.y} is unreachable from start`);
    if (cellAt(e.x, e.y) === Cell.Wall) problems.push(`exhibit "${e.id}" is inside a wall`);
  }

  return problems;
}
