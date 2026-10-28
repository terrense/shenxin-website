import { Cell, MAP_H, MAP_W, MEDALLIONS, RUG, TILE, cellAt, decor } from './world';

/**
 * Procedural art.
 *
 * No sprite sheets, for two reasons. The site has no image pipeline for
 * game art and I am not going to ship a megabyte of PNG to render one room;
 * and more importantly a hand-authored pixel grid cannot be checked while
 * it is being written, so authoring art as string rows is authoring blind.
 * Drawing from primitives means the shapes are described in terms that can
 * be reasoned about ("a brass ring of radius 11, a second ring rotated 50°,
 * a tripod under it") and then checked against a screenshot — which is what
 * `scripts/art-preview.mjs` exists for, and which has already caught three
 * things that looked fine in code and wrong on screen.
 *
 * The look is top-down three-quarter — the Zelda/Stardew convention — where
 * floors are seen from above but anything with height shows a face toward the
 * camera. That face is what stops a tile map from reading as a flat diagram,
 * and it costs one extra rectangle per wall.
 *
 * Palette is deliberately bright: sunlit limestone rather than a dark
 * dungeon. A dark scene is the easier way to look cinematic and the wrong
 * choice here — this hall has to stay legible for someone who found the
 * site's first dark draft unreadable.
 */

export const PAL = {
  haze: '#c9d6d8',
  hazeDeep: '#aebfc3',

  floor: '#f3ead8',
  floorAlt: '#eee4d0',
  grout: '#dccfb6',
  crack: '#cdbda0',

  inlay: '#ebdec2',
  inlayLine: '#c39a44',

  rug: '#1d5a63',
  rugDark: '#164a52',
  rugBand: '#2e818c',
  rugGold: '#c9a24a',
  rugFringe: '#e3d6b4',

  /**
   * Walls sit a clear two steps darker than the floor.
   *
   * The first draft made them #fbf6ea against a #f1e8d6 floor — a difference
   * of about four percent in lightness. On a screenshot the hall had no
   * architecture in it at all: the colonnade, the dividing walls and the
   * chambers were one undifferentiated cream field, and the only way to find
   * a wall was to walk into it. A top-down scene has no perspective to carry
   * structure, so value has to do the whole job.
   */
  wallTop: '#c5b497',
  wallTopAlt: '#bdab8d',
  wallFace: '#9c8565',
  wallFaceLit: '#b89d78',
  wallBase: '#6f5c45',
  wallEdge: '#5a4a35',
  outline: '#3b3341',

  pillar: '#f6efdf',
  pillarMid: '#ddcdb0',
  pillarDark: '#b5a083',

  wood: '#5d4430',
  woodLit: '#7a5b40',
  woodDark: '#3e2d1f',

  brass: '#c69a3f',
  brassLit: '#f3dc94',
  brassDark: '#8a6a26',

  sky: '#cfeaf1',
  skyLow: '#eaf6f8',
  glow: '#ffe6ad',

  teal: '#1f6f7a',
  tealLit: '#49a7b0',
  ink: '#2b2a33',
  slate: '#2f3a4a',
  slateLit: '#48586d',

  leaf: '#4e7a3a',
  leafLit: '#79a84f',
  grape: '#5b3a6b',
  grapeLit: '#7f5490',

  red: '#9e3b35',
  redLit: '#c4564a',
  cream: '#f7efdd',
  shadow: 'rgba(59, 51, 65, 0.22)',
} as const;

/**
 * Deterministic per-tile noise. Tiles need to vary or a stone floor reads as
 * graph paper, but the variation has to be stable across frames — a random()
 * call per draw makes the floor boil.
 */
function hash(x: number, y: number, salt = 0): number {
  let h = (x * 374761393 + y * 668265263 + salt * 1442695040) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

type Ctx = CanvasRenderingContext2D;

/** Pixel-snapped rect. Everything in here snaps, so edges stay crisp. */
const r = (c: Ctx, x: number, y: number, w: number, h: number, fill: string) => {
  c.fillStyle = fill;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};

const ellipse = (c: Ctx, cx: number, cy: number, rx: number, ry: number, fill: string) => {
  c.beginPath();
  c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
};

const circle = (c: Ctx, cx: number, cy: number, rad: number, fill: string) =>
  ellipse(c, cx, cy, rad, rad, fill);

const ring = (c: Ctx, cx: number, cy: number, rx: number, ry: number, w: number, s: string) => {
  c.beginPath();
  c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  c.strokeStyle = s;
  c.lineWidth = w;
  c.stroke();
};

const line = (c: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, s: string) => {
  c.beginPath();
  c.moveTo(x0, y0);
  c.lineTo(x1, y1);
  c.strokeStyle = s;
  c.lineWidth = w;
  c.lineCap = 'round';
  c.stroke();
};

/** Soft contact shadow under anything with height. Sells the depth cheaply. */
const contact = (c: Ctx, cx: number, cy: number, rx: number, ry = rx * 0.4) => {
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, rx);
  g.addColorStop(0, 'rgba(59,51,65,0.34)');
  g.addColorStop(0.6, 'rgba(59,51,65,0.16)');
  g.addColorStop(1, 'rgba(59,51,65,0)');
  c.save();
  c.translate(cx, cy);
  c.scale(1, ry / rx);
  c.translate(-cx, -cy);
  c.fillStyle = g;
  c.beginPath();
  c.arc(cx, cy, rx, 0, Math.PI * 2);
  c.fill();
  c.restore();
};

// ---------------------------------------------------------------------------
// Ground layer
// ---------------------------------------------------------------------------

/**
 * Flagstones, laid two tiles wide in a running bond.
 *
 * Per-tile variation was the first instinct and it was wrong twice over: a
 * 32 px slab is too small to read as cut stone at playing scale, and giving
 * every one its own value turned the floor into a chequerboard that fought
 * the rug for attention. Two-tile slabs with the course offset on alternate
 * rows read as a laid floor, and the value spread is now narrow enough that
 * the pattern sits behind everything else instead of in front of it.
 */
function paintFloor(c: Ctx, x: number, y: number, tx: number, ty: number) {
  const bond = ty % 2 === 0 ? 0 : 1;
  const slab = Math.floor((tx + bond) / 2);
  const n = hash(slab, ty, 5);
  r(c, x, y, TILE, TILE, n > 0.58 ? PAL.floor : PAL.floorAlt);

  // Joints: along the top of every course, and down the left edge of a slab
  // only where a slab actually begins.
  r(c, x, y, TILE, 1, PAL.grout);
  if ((tx + bond) % 2 === 0) r(c, x, y, 1, TILE, PAL.grout);

  if (n > 0.94) {
    c.save();
    c.globalAlpha = 0.4;
    line(c, x + TILE * 0.2, y + TILE * 0.3, x + TILE * 0.7, y + TILE * 0.8, 1, PAL.crack);
    c.restore();
  }
}

/**
 * Ambient occlusion: a short gradient on any floor edge that meets a wall.
 *
 * One pass of this does more for the sense of enclosure than any amount of
 * texture. Without it a bright floor running up to a wall looks like the
 * wall is floating on top of it.
 */
function paintContactShade(c: Ctx, x: number, y: number, tx: number, ty: number) {
  const solid = (dx: number, dy: number) => {
    const cell = cellAt(tx + dx, ty + dy);
    return cell === Cell.Wall || cell === Cell.Window || cell === Cell.Void;
  };
  const D = 7;
  const grad = (x0: number, y0: number, x1: number, y1: number) => {
    const g = c.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, 'rgba(90,74,53,0.30)');
    g.addColorStop(1, 'rgba(90,74,53,0)');
    return g;
  };
  c.save();
  if (solid(0, -1)) {
    c.fillStyle = grad(0, y, 0, y + D);
    c.fillRect(x, y, TILE, D);
  }
  if (solid(-1, 0)) {
    c.fillStyle = grad(x, 0, x + D, 0);
    c.fillRect(x, y, D, TILE);
  }
  if (solid(1, 0)) {
    c.fillStyle = grad(x + TILE, 0, x + TILE - D, 0);
    c.fillRect(x + TILE - D, y, D, TILE);
  }
  if (solid(0, 1)) {
    c.fillStyle = grad(0, y + TILE, 0, y + TILE - D);
    c.fillRect(x, y + TILE - D, TILE, D);
  }
  c.restore();
}

/**
 * A hard edge wherever a wall block meets open floor.
 *
 * Drawn on the wall side, so it reads as the wall's own silhouette. This is
 * the line that tells you at a glance which cream region you can walk on.
 */
function paintWallEdge(c: Ctx, x: number, y: number, tx: number, ty: number) {
  const open = (dx: number, dy: number) => {
    const cell = cellAt(tx + dx, ty + dy);
    return cell === Cell.Floor || cell === Cell.Inlay || cell === Cell.Rug;
  };
  if (open(0, -1)) r(c, x, y, TILE, 2, PAL.wallEdge);
  if (open(-1, 0)) r(c, x, y, 2, TILE, PAL.wallEdge);
  if (open(1, 0)) r(c, x + TILE - 2, y, 2, TILE, PAL.wallEdge);
}

/** Inlay base. The figure on top of it is drawn once per medallion, below. */
function paintInlay(c: Ctx, x: number, y: number, tx: number, ty: number) {
  const n = hash(tx, ty, 9);
  r(c, x, y, TILE, TILE, PAL.inlay);
  c.save();
  c.globalAlpha = 0.25;
  r(c, x, y, TILE, 1, PAL.inlayLine);
  r(c, x, y, 1, TILE, PAL.inlayLine);
  if (n > 0.7) r(c, x + 6, y + 9, TILE - 12, 1, PAL.crack);
  c.restore();
}

/**
 * A compass rose at the centre of each chamber.
 *
 * Thematically the right figure for this particular hall — every exhibit in
 * it is about knowing where you are — and practically it is the shape that
 * makes a five-tile square of inlay read as one deliberate floor piece
 * rather than as tiling. The first version drew a small diamond per tile,
 * which from above was indistinguishable from wallpaper.
 */
function paintMedallion(c: Ctx, m: { cx: number; cy: number; r: number }) {
  const x = (m.cx + 0.5) * TILE;
  const y = (m.cy + 0.5) * TILE;
  const R = (m.r + 0.5) * TILE - 4;

  c.save();
  // Held back deliberately. At full strength the rose is the most contrasted
  // thing in the chamber and the exhibit standing on it disappears into the
  // middle of it — the floor out-competing the object it exists to present.
  c.globalAlpha = 0.5;
  ring(c, x, y, R, R, 2.5, PAL.inlayLine);
  ring(c, x, y, R - 6, R - 6, 1, PAL.inlayLine);
  ring(c, x, y, R * 0.42, R * 0.42, 1.5, PAL.inlayLine);

  // Thirty-two graduations on the outer band, every fourth one long.
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const long = i % 4 === 0;
    line(
      c,
      x + Math.cos(a) * (R - 6),
      y + Math.sin(a) * (R - 6),
      x + Math.cos(a) * (R - (long ? 1 : 3)),
      y + Math.sin(a) * (R - (long ? 1 : 3)),
      long ? 1.6 : 1,
      PAL.inlayLine,
    );
  }

  // Eight points, the cardinals long and filled, the ordinals short and open.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const len = i % 2 === 0 ? R - 8 : R * 0.62;
    const w = i % 2 === 0 ? 7 : 5;
    const px = x + Math.cos(a) * len;
    const py = y + Math.sin(a) * len;
    const lx = x + Math.cos(a + Math.PI / 2) * w;
    const ly = y + Math.sin(a + Math.PI / 2) * w;
    const rx = x + Math.cos(a - Math.PI / 2) * w;
    const ry = y + Math.sin(a - Math.PI / 2) * w;
    c.beginPath();
    c.moveTo(px, py);
    c.lineTo(lx, ly);
    c.lineTo(rx, ry);
    c.closePath();
    if (i % 2 === 0) {
      // North filled solid, the other cardinals washed — so the rose has an
      // orientation rather than being rotationally symmetric.
      c.fillStyle = i === 0 ? PAL.brass : 'rgba(195,154,68,0.45)';
      c.fill();
    }
    c.strokeStyle = PAL.inlayLine;
    c.lineWidth = 1;
    c.stroke();
  }
  circle(c, x, y, 3, PAL.brass);
  circle(c, x - 1, y - 1, 1.2, PAL.brassLit);
  c.restore();
}

function paintRug(c: Ctx, x: number, y: number, tx: number, ty: number) {
  r(c, x, y, TILE, TILE, PAL.rug);

  const left = cellAt(tx - 1, ty) !== Cell.Rug;
  const right = cellAt(tx + 1, ty) !== Cell.Rug;
  const top = cellAt(tx, ty - 1) !== Cell.Rug;
  const bottom = cellAt(tx, ty + 1) !== Cell.Rug;

  // Pile: a fine vertical nap, not a lattice. A grid at this scale reads as
  // tartan and competes with the floor it is supposed to sit on.
  c.save();
  c.globalAlpha = 0.35;
  for (let i = 2; i < TILE; i += 3) r(c, x + i, y, 1, TILE, PAL.rugDark);
  c.restore();

  // Position inside the runner drives the pattern. The first version put a
  // gold ring on every other tile, which from above was a field of polka
  // dots — the one thing a carpet must not be, because the eye reads evenly
  // spaced dots as texture noise rather than as design.
  const ix = tx - RUG.x0;
  const iy = ty - RUG.y0;
  const width = RUG.x1 - RUG.x0;

  // Guard lines, one tile in from each long edge.
  if (ix === 1 || ix === width - 1) {
    r(c, x + TILE / 2 - 3, y, 1, TILE, PAL.rugGold);
    r(c, x + TILE / 2 + 2, y, 1, TILE, PAL.rugGold);
  }

  // Cross band every fourth course, with a lozenge in the middle of the bay.
  if (iy % 4 === 0) {
    r(c, x, y + TILE / 2 - 3, TILE, 1, PAL.rugGold);
    r(c, x, y + TILE / 2 + 2, TILE, 1, PAL.rugGold);
  } else if (iy % 4 === 2 && (ix === 2 || ix === 3)) {
    // One diamond centred on the seam between the two middle columns, drawn
    // as two open halves. Closing each half into its own shape — which the
    // first attempt did — produces a pair of back-to-back triangles that
    // read as a bow tie, repeating down the runner like a row of them.
    const m = TILE / 2;
    const mx = ix === 2 ? x + TILE : x;
    const dir = ix === 2 ? -1 : 1;
    const my = y + m;
    c.save();
    c.strokeStyle = PAL.rugGold;
    c.lineWidth = 1.6;
    c.lineCap = 'butt';
    for (const [w, h] of [
      [17, 12],
      [9, 6],
    ] as const) {
      c.beginPath();
      c.moveTo(mx, my - h);
      c.lineTo(mx + dir * w, my);
      c.lineTo(mx, my + h);
      c.stroke();
    }
    c.restore();
  }

  // Border bands follow the rug's outline, drawn per-edge so corners work.
  const band = (bx: number, by: number, bw: number, bh: number) => {
    r(c, bx, by, bw, bh, PAL.rugBand);
  };
  if (left) band(x + 2, y, 3, TILE);
  if (right) band(x + TILE - 5, y, 3, TILE);
  if (top) band(x, y + 2, TILE, 3);
  if (bottom) band(x, y + TILE - 5, TILE, 3);

  // Fringe on the short ends, where a real carpet has one.
  if (top || bottom) {
    const fy = top ? y : y + TILE - 2;
    c.save();
    c.globalAlpha = 0.85;
    for (let i = 1; i < TILE; i += 3) r(c, x + i, fy, 1, 2, PAL.rugFringe);
    c.restore();
  }
}

/**
 * Walls. The top cap is drawn on the tile itself; if the tile below is
 * walkable, a face is drawn hanging into that tile, which is what gives the
 * hall height. The face has to be drawn after the floor below it, so wall
 * faces run in a later pass (see `paintGround`).
 */
function paintWallTop(c: Ctx, x: number, y: number, tx: number, ty: number) {
  // Coursed like the floor, two tiles to a block, so the masonry scale
  // matches. Varying per tile makes the wall look blotchy rather than built.
  const bond = ty % 2 === 0 ? 0 : 1;
  const n = hash(Math.floor((tx + bond) / 2), ty, 7);
  r(c, x, y, TILE, TILE, n > 0.5 ? PAL.wallTop : PAL.wallTopAlt);
  r(c, x, y, TILE, 1, PAL.wallFace);
  if ((tx + bond) % 2 === 0) r(c, x, y, 1, TILE, PAL.wallFace);
  if (n > 0.86) {
    c.save();
    c.globalAlpha = 0.2;
    r(c, x + 4, y + 7, TILE - 10, 2, PAL.wallBase);
    c.restore();
  }
}

function paintWallFace(c: Ctx, x: number, y: number, tx: number, ty: number) {
  const H = 12;
  const lit = cellAt(tx, ty - 1) === Cell.Window;
  r(c, x, y + TILE, TILE, H, lit ? PAL.wallFaceLit : PAL.wallFace);
  r(c, x, y + TILE, TILE, 2, PAL.wallTopAlt);
  r(c, x, y + TILE + H - 2, TILE, 2, PAL.wallBase);
  r(c, x, y + TILE + H, TILE, 1, PAL.outline);
  // A faint vertical joint keeps the face from being a flat band.
  c.save();
  c.globalAlpha = 0.3;
  r(c, x + (ty % 2 === 0 ? 8 : 20), y + TILE + 2, 1, H - 4, PAL.wallBase);
  c.restore();
}

function paintWindow(c: Ctx, x: number, y: number, tx: number, ty: number) {
  paintWallTop(c, x, y, tx, ty);
  const below = cellAt(tx, ty + 1);
  const horizontal = below === Cell.Floor || below === Cell.Inlay || below === Cell.Rug;

  if (horizontal) {
    /**
     * North wall: the opening is on the face, seen edge-on.
     *
     * The first version was fourteen pixels of pale sky behind two brass
     * mullions, and across six tiles it read as a white picket fence rather
     * than a window — too short to have proportion and too pale to look
     * like an opening. This is taller, darker at the head where a real
     * window falls into shadow, and carries a stone reveal so the glass
     * sits *inside* the wall instead of being painted on it.
     */
    const H = 24;
    const top = y + TILE;

    // Reveal: the thickness of the wall, visible around the glass.
    r(c, x, top, TILE, H, PAL.wallBase);
    r(c, x, top, TILE, 2, PAL.wallFace);

    const g = c.createLinearGradient(0, top, 0, top + H);
    g.addColorStop(0, '#9fcfdd');
    g.addColorStop(0.35, PAL.sky);
    g.addColorStop(1, PAL.skyLow);
    c.fillStyle = g;
    c.fillRect(Math.round(x), Math.round(top + 3), TILE, H - 6);

    // Distant land along the horizon — three countries' worth of nothing in
    // particular, but it stops the glass reading as a blank light box.
    c.save();
    c.globalAlpha = 0.5;
    r(c, x, top + H - 11, TILE, 3, '#8fb3ae');
    c.globalAlpha = 0.3;
    r(c, x, top + H - 8, TILE, 2, '#a7c2b4');
    c.restore();

    // Leading: one vertical per tile and two transoms, so the whole six-tile
    // run reads as one window divided rather than six small ones.
    r(c, x + TILE / 2 - 1, top + 3, 2, H - 6, PAL.brassDark);
    r(c, x, top + 3, TILE, 1.5, PAL.brass);
    r(c, x, top + 10, TILE, 1.5, PAL.brassDark);
    r(c, x, top + H - 4, TILE, 2, PAL.brass);
    r(c, x, top + H - 2, TILE, 2, PAL.wallBase);
    r(c, x, top + H, TILE, 1, PAL.outline);

    // Sill, catching the light.
    c.save();
    c.globalAlpha = 0.55;
    r(c, x, top + H + 1, TILE, 3, PAL.brassLit);
    c.restore();
  } else {
    // Side wall: seen from above, so the opening is a bright slot in the cap.
    const g = c.createLinearGradient(x, 0, x + TILE, 0);
    g.addColorStop(0, PAL.skyLow);
    g.addColorStop(1, PAL.sky);
    c.fillStyle = g;
    c.fillRect(Math.round(x + 6), Math.round(y + 3), TILE - 12, TILE - 6);
    r(c, x + 6, y + 3, TILE - 12, 2, PAL.brass);
    r(c, x + 6, y + TILE - 5, TILE - 12, 2, PAL.brass);
    r(c, x + 6, y + TILE / 2 - 1, TILE - 12, 2, PAL.brassDark);
  }
}

export function paintPillar(c: Ctx, x: number, y: number) {
  const cx = x + TILE / 2;
  contact(c, cx + 3, y + TILE - 3, 15, 6);
  // Shaft, drawn as a column with a lit left edge.
  const g = c.createLinearGradient(x + 6, 0, x + TILE - 6, 0);
  g.addColorStop(0, PAL.pillar);
  g.addColorStop(0.45, PAL.pillarMid);
  g.addColorStop(1, PAL.pillarDark);
  c.fillStyle = g;
  c.fillRect(Math.round(x + 7), Math.round(y + 4), TILE - 14, TILE - 6);
  // Flutes.
  c.save();
  c.globalAlpha = 0.35;
  for (let i = 10; i < TILE - 10; i += 4) r(c, x + i, y + 6, 1, TILE - 10, PAL.pillarDark);
  c.restore();
  // Capital and base, wider than the shaft.
  r(c, x + 4, y + 2, TILE - 8, 5, PAL.pillar);
  r(c, x + 4, y + 6, TILE - 8, 1, PAL.pillarDark);
  r(c, x + 5, y + TILE - 5, TILE - 10, 4, PAL.pillarMid);
  r(c, x + 5, y + TILE - 2, TILE - 10, 1, PAL.outline);
  ellipse(c, cx, y + 4, (TILE - 8) / 2, 3, PAL.wallTop);
}

/**
 * A hanging banner on a wall that faces the nave.
 *
 * The dividing walls are two tiles thick and thirty-odd tall, which from
 * above is a large blank slab of the same tan in four places. Banners break
 * them up, carry the only strong colour above floor level, and give the nave
 * the one thing a procession route needs — something to walk past.
 *
 * `side` is which way the cloth hangs: +1 for a wall whose east face is open.
 */
function paintBanner(c: Ctx, x: number, y: number, ty: number, side: 1 | -1) {
  const w = 15;
  const h = 30;
  // Hang from the wall's open edge, spilling a little over it.
  const bx = side === 1 ? x + TILE - w + 4 : x - 4;
  const by = y + 1;

  const warm = (ty >> 2) % 2 === 0;
  const cloth = warm ? PAL.red : PAL.teal;
  const clothLit = warm ? PAL.redLit : PAL.tealLit;

  c.save();
  // Shadow cast onto the wall beside it.
  c.globalAlpha = 0.18;
  r(c, bx + side * 3, by + 2, w, h, PAL.wallBase);
  c.globalAlpha = 1;

  // Rod.
  r(c, bx - 2, by, w + 4, 3, PAL.brassDark);
  r(c, bx - 2, by, w + 4, 1, PAL.brassLit);
  circle(c, bx - 2, by + 1.5, 2, PAL.brass);
  circle(c, bx + w + 2, by + 1.5, 2, PAL.brass);

  // Cloth, with a swallowtail hem.
  c.beginPath();
  c.moveTo(bx, by + 3);
  c.lineTo(bx + w, by + 3);
  c.lineTo(bx + w, by + h - 6);
  c.lineTo(bx + w / 2, by + h);
  c.lineTo(bx, by + h - 6);
  c.closePath();
  c.fillStyle = cloth;
  c.fill();
  // A lit edge down one side so it is not a flat rectangle.
  c.save();
  c.clip();
  r(c, bx, by + 3, 4, h, clothLit);
  c.globalAlpha = 0.45;
  r(c, bx + w - 4, by + 3, 4, h, PAL.ink);
  c.restore();

  // Gold trim and a compass-point emblem, matching the floor medallions.
  r(c, bx, by + 6, w, 1.5, PAL.brass);
  r(c, bx, by + h - 10, w, 1.5, PAL.brass);
  const ex = bx + w / 2;
  const ey = by + 16;
  c.beginPath();
  c.moveTo(ex, ey - 5.5);
  c.lineTo(ex + 3, ey);
  c.lineTo(ex, ey + 5.5);
  c.lineTo(ex - 3, ey);
  c.closePath();
  c.fillStyle = PAL.brass;
  c.fill();
  c.restore();
}

function paintShelf(c: Ctx, x: number, y: number, tx: number, ty: number) {
  contact(c, x + TILE / 2 + 2, y + TILE - 2, 14, 5);
  r(c, x + 1, y + 2, TILE - 2, TILE - 3, PAL.wood);
  r(c, x + 1, y + 2, TILE - 2, 2, PAL.woodLit);
  r(c, x + 1, y + TILE - 2, TILE - 2, 1, PAL.woodDark);

  // Books. Varied widths and a saturated palette — this is where the colour
  // in the room comes from, and a library with grey books reads as a morgue.
  const spines = [PAL.red, PAL.teal, PAL.brass, PAL.slate, PAL.grape, PAL.leaf, PAL.redLit];
  for (let shelf = 0; shelf < 2; shelf++) {
    const sy = y + 5 + shelf * 12;
    let bx = x + 3;
    let i = 0;
    while (bx < x + TILE - 4) {
      const n = hash(tx, ty * 4 + shelf, i++);
      const w = 2 + Math.floor(n * 3);
      if (n > 0.14) {
        const h = 7 + Math.floor(hash(tx, ty, i * 31) * 3);
        r(c, bx, sy + (10 - h), w, h, spines[i % spines.length]);
        r(c, bx, sy + (10 - h), w, 1, PAL.cream);
      }
      bx += w + 1;
    }
    r(c, x + 2, sy + 10, TILE - 4, 2, PAL.woodDark);
  }
}

/**
 * Paints the whole static world into one canvas, once.
 *
 * Several passes, because things overlap in a fixed order: a wall face hangs
 * into the tile below it and has to be drawn after that tile's floor, and
 * occlusion has to land on floor that already exists. One pass would put the
 * floor on top of the face and the hall would lose its height.
 */
export function paintGround(c: Ctx) {
  c.imageSmoothingEnabled = false;
  r(c, 0, 0, MAP_W * TILE, MAP_H * TILE, PAL.haze);

  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      const x = tx * TILE;
      const y = ty * TILE;
      switch (cellAt(tx, ty)) {
        case Cell.Floor:
          paintFloor(c, x, y, tx, ty);
          break;
        case Cell.Inlay:
          paintInlay(c, x, y, tx, ty);
          break;
        case Cell.Rug:
          paintFloor(c, x, y, tx, ty);
          paintRug(c, x, y, tx, ty);
          break;
        case Cell.Wall:
        case Cell.Shelf:
          // Shelving stands on floor; paint it first so shadows land on stone.
          paintFloor(c, x, y, tx, ty);
          paintWallTop(c, x, y, tx, ty);
          break;
        case Cell.Pillar:
          // Floor only. The column itself is drawn per frame so the player
          // can pass behind it — see `pillars` in world.ts.
          paintFloor(c, x, y, tx, ty);
          break;
        case Cell.Window:
          paintWallTop(c, x, y, tx, ty);
          break;
        default:
          break;
      }
    }
  }

  for (const m of MEDALLIONS) paintMedallion(c, m);

  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      const cell = cellAt(tx, ty);
      if (cell === Cell.Floor || cell === Cell.Inlay || cell === Cell.Rug) {
        paintContactShade(c, tx * TILE, ty * TILE, tx, ty);
      }
    }
  }

  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      const cell = cellAt(tx, ty);
      const x = tx * TILE;
      const y = ty * TILE;
      const below = cellAt(tx, ty + 1);
      const open = below === Cell.Floor || below === Cell.Inlay || below === Cell.Rug;

      if (cell === Cell.Wall || cell === Cell.Window) paintWallEdge(c, x, y, tx, ty);
      if (cell === Cell.Wall && open) paintWallFace(c, x, y, tx, ty);

      // Banners on the long walls, every sixth course, hung on whichever
      // side is open. Skipped where a face is already drawn, because a cloth
      // hanging over an edge the player sees in section reads as a mistake.
      if (cell === Cell.Wall && !open && ty % 6 === 2) {
        const eastOpen = cellAt(tx + 1, ty) === Cell.Floor || cellAt(tx + 1, ty) === Cell.Rug;
        const westOpen = cellAt(tx - 1, ty) === Cell.Floor || cellAt(tx - 1, ty) === Cell.Rug;
        if (eastOpen) paintBanner(c, x, y, ty, 1);
        else if (westOpen) paintBanner(c, x, y, ty, -1);
      }
      if (cell === Cell.Window) paintWindow(c, x, y, tx, ty);
      if (cell === Cell.Shelf) paintShelf(c, x, y, tx, ty);
    }
  }
}

/**
 * Light. Composited over everything in `screen` mode, so it brightens rather
 * than tints. Windows cast a pool onto the floor inside them; without this
 * the hall is evenly lit and looks like a diagram of a hall.
 */
export function lightSources(): { x: number; y: number; r: number; a: number }[] {
  const out: { x: number; y: number; r: number; a: number }[] = [];

  // Braziers. Tighter and warmer than a window, and they are the reason the
  // corners of a chamber are not dead space.
  for (const d of decor) {
    if (d.kind !== 'brazier') continue;
    out.push({
      x: (d.x + 0.5) * TILE,
      y: (d.y + 0.2) * TILE,
      r: TILE * 3.4,
      a: 0.9,
    });
  }

  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      if (cellAt(tx, ty) !== Cell.Window) continue;
      const below = cellAt(tx, ty + 1);
      const horizontal = below === Cell.Floor || below === Cell.Inlay || below === Cell.Rug;
      // Offset the pool into the room, away from the wall it comes through.
      const dx = horizontal ? 0 : tx < MAP_W / 2 ? 2.4 : -2.4;
      const dy = horizontal ? 2.4 : 0;
      out.push({
        x: (tx + 0.5 + dx) * TILE,
        y: (ty + 0.5 + dy) * TILE,
        r: TILE * 5,
        a: 1,
      });
    }
  }
  return out;
}

/**
 * A floor plan for the minimap, as a data URL.
 *
 * The first minimap was exhibit dots on a blank card, which told the player
 * where things were but not where *they* were — a dot in an empty rectangle
 * conveys nothing about whether you are in a chamber or the nave. Drawing
 * the actual walls makes it a map. One pixel per tile, built once.
 */
export function floorPlanDataUrl(scale = 3): string {
  const cv = document.createElement('canvas');
  cv.width = MAP_W * scale;
  cv.height = MAP_H * scale;
  const c = cv.getContext('2d');
  if (!c) return '';

  c.fillStyle = 'rgba(0,0,0,0)';
  c.fillRect(0, 0, cv.width, cv.height);
  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      const cell = cellAt(tx, ty);
      let fill: string | null = null;
      if (cell === Cell.Wall) fill = '#8d7a5e';
      else if (cell === Cell.Window) fill = '#6fb6c4';
      else if (cell === Cell.Rug) fill = '#2e818c';
      else if (cell === Cell.Inlay) fill = '#dcc68f';
      else if (cell === Cell.Floor || cell === Cell.Pillar || cell === Cell.Shelf)
        fill = '#f0e7d4';
      if (!fill) continue;
      c.fillStyle = fill;
      c.fillRect(tx * scale, ty * scale, scale, scale);
    }
  }
  return cv.toDataURL('image/png');
}

export { contact, circle, ellipse, line, r as rect, ring, hash };
