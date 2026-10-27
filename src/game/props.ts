import { PAL, circle, contact, ellipse, hash, line, paintPillar, rect as r, ring } from './paint';
import { TILE, decor, pillars, placed, type DecorKind } from './world';

/**
 * The exhibits, and the figure that walks among them.
 *
 * Each prop is drawn from bottom-centre so it anchors to the foot of its
 * tile and can be taller than the tile is — which it needs to be, because an
 * object confined to 32×32 seen from above is a rug pattern, not an object.
 * Height is what makes these read as things standing in a room.
 *
 * Every shape here is specific to the thing it represents and not a generic
 * box with a label. A portfolio whose interactive scene is ten identical
 * crates with captions is a worse version of a list.
 */

type Ctx = CanvasRenderingContext2D;
type Kind = (typeof placed)[number]['kind'];

/** Shared plinth, so exhibits sit on something rather than float on stone. */
function plinth(c: Ctx, cx: number, by: number, w: number) {
  contact(c, cx + 3, by - 1, w * 0.62, w * 0.24);
  r(c, cx - w / 2, by - 7, w, 7, PAL.pillarMid);
  r(c, cx - w / 2, by - 7, w, 2, PAL.pillar);
  r(c, cx - w / 2 - 1, by - 2, w + 2, 2, PAL.pillarDark);
  r(c, cx - w / 2 - 1, by, w + 2, 1, PAL.outline);
}

function astrolabe(c: Ctx, cx: number, by: number) {
  plinth(c, cx, by, 30);
  const y = by - 34;
  // Tripod.
  for (const dx of [-9, 0, 9]) {
    line(c, cx + dx * 0.35, y + 10, cx + dx, by - 7, 2.5, PAL.brassDark);
  }
  line(c, cx, y + 6, cx, y + 12, 3, PAL.brass);

  // Armillary rings: one seen edge-on, one from above, one upright. Three
  // ellipses at different aspects is what makes a sphere out of flat shapes.
  ring(c, cx, y, 14, 14, 2.5, PAL.brassDark);
  ring(c, cx, y, 14, 14, 1.5, PAL.brass);
  ring(c, cx, y, 14, 5, 2, PAL.brassLit);
  ring(c, cx, y, 5, 14, 2, PAL.brass);
  ring(c, cx, y, 10, 3.4, 1.5, PAL.brassDark);
  // Graduation ticks on the outer ring — the detail that says "instrument".
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const x0 = cx + Math.cos(a) * 12;
    const y0 = y + Math.sin(a) * 12;
    const x1 = cx + Math.cos(a) * 14.5;
    const y1 = y + Math.sin(a) * 14.5;
    line(c, x0, y0, x1, y1, 1, PAL.brassLit);
  }
  circle(c, cx, y, 3, PAL.brassLit);
  circle(c, cx - 1, y - 1, 1.2, PAL.cream);
  // Alidade.
  line(c, cx - 13, y + 7, cx + 13, y - 7, 1.5, PAL.brassLit);
}

function tank(c: Ctx, cx: number, by: number) {
  plinth(c, cx, by, 44);
  const y = by - 7;
  // Tracks first, so the hull overlaps them.
  for (const side of [-1, 1]) {
    const ty = y - 7 + side * 0;
    r(c, cx - 19, ty - 3 + (side === -1 ? 0 : 3), 38, 6, PAL.woodDark);
  }
  r(c, cx - 19, y - 11, 38, 9, PAL.ink);
  for (let i = -17; i <= 15; i += 5) circle(c, cx + i, y - 6.5, 2.6, PAL.slateLit);
  r(c, cx - 19, y - 11, 38, 2, PAL.slate);

  // Hull: a wedge, because a rectangle reads as a bus.
  c.beginPath();
  c.moveTo(cx - 19, y - 12);
  c.lineTo(cx + 13, y - 12);
  c.lineTo(cx + 19, y - 17);
  c.lineTo(cx - 14, y - 19);
  c.closePath();
  c.fillStyle = PAL.slate;
  c.fill();
  c.strokeStyle = PAL.outline;
  c.lineWidth = 1;
  c.stroke();
  r(c, cx - 14, y - 19, 33, 2, PAL.slateLit);

  // Turret and gun.
  ellipse(c, cx - 2, y - 23, 10, 6, PAL.slateLit);
  ellipse(c, cx - 2, y - 24, 10, 5, PAL.slate);
  r(c, cx + 6, y - 25, 16, 2.5, PAL.ink);
  r(c, cx + 20, y - 25.5, 4, 3.5, PAL.slateLit);
  line(c, cx - 8, y - 28, cx - 6, y - 33, 1.5, PAL.ink);
  circle(c, cx - 6, y - 34, 1.5, PAL.brass);
}

function blackboard(c: Ctx, cx: number, by: number) {
  contact(c, cx + 3, by - 2, 22, 8);
  // Easel.
  line(c, cx - 14, by - 2, cx - 6, by - 42, 3, PAL.wood);
  line(c, cx + 14, by - 2, cx + 6, by - 42, 3, PAL.wood);
  line(c, cx - 11, by - 16, cx + 11, by - 16, 2.5, PAL.woodLit);

  // Board.
  r(c, cx - 21, by - 46, 42, 32, PAL.wood);
  r(c, cx - 19, by - 44, 38, 28, '#27323a');
  r(c, cx - 19, by - 44, 38, 1, '#1b242a');

  // Chalk: a noisy measurement and a smoothed estimate through it. The only
  // equation this hall contains, and it is the right one for the man.
  c.save();
  c.strokeStyle = 'rgba(247,239,221,0.75)';
  c.lineWidth = 1;
  c.beginPath();
  for (let i = 0; i <= 34; i++) {
    const x = cx - 17 + i;
    const yy = by - 30 + Math.sin(i * 0.55) * 4 + (hash(i, 3) - 0.5) * 5;
    i === 0 ? c.moveTo(x, yy) : c.lineTo(x, yy);
  }
  c.stroke();
  c.strokeStyle = 'rgba(243,220,148,0.95)';
  c.lineWidth = 1.6;
  c.beginPath();
  for (let i = 0; i <= 34; i++) {
    const x = cx - 17 + i;
    const yy = by - 30 + Math.sin(i * 0.55) * 3.4;
    i === 0 ? c.moveTo(x, yy) : c.lineTo(x, yy);
  }
  c.stroke();
  c.restore();
  // Axes and a caret over a state symbol.
  line(c, cx - 17, by - 20, cx + 17, by - 20, 1, 'rgba(247,239,221,0.5)');
  line(c, cx - 17, by - 20, cx - 17, by - 41, 1, 'rgba(247,239,221,0.5)');
  line(c, cx - 15, by - 40, cx - 12, by - 43, 1.2, 'rgba(247,239,221,0.8)');
  line(c, cx - 12, by - 43, cx - 9, by - 40, 1.2, 'rgba(247,239,221,0.8)');
  // Chalk tray.
  r(c, cx - 14, by - 15, 6, 2, PAL.cream);
}

function antenna(c: Ctx, cx: number, by: number) {
  plinth(c, cx, by, 26);
  const my = by - 7;
  for (const dx of [-8, 8]) line(c, cx, my - 14, cx + dx, my - 1, 2, PAL.pillarDark);
  r(c, cx - 1.5, my - 34, 3, 22, PAL.pillarMid);

  // Dish: a crescent, which is how a parabola looks from three-quarters.
  const dy = my - 38;
  c.save();
  c.translate(cx, dy);
  c.rotate(-0.42);
  c.beginPath();
  c.ellipse(0, 0, 16, 15, 0, 0, Math.PI * 2);
  c.fillStyle = PAL.pillar;
  c.fill();
  c.strokeStyle = PAL.pillarDark;
  c.lineWidth = 1.5;
  c.stroke();
  c.beginPath();
  c.ellipse(1.5, 1, 13, 12, 0, 0, Math.PI * 2);
  c.fillStyle = PAL.pillarMid;
  c.fill();
  // Ribs.
  c.strokeStyle = 'rgba(181,160,131,0.75)';
  c.lineWidth = 1;
  for (let a = 0; a < Math.PI; a += Math.PI / 5) {
    c.beginPath();
    c.moveTo(Math.cos(a) * 12.5, Math.sin(a) * 11.5);
    c.lineTo(-Math.cos(a) * 12.5, -Math.sin(a) * 11.5);
    c.stroke();
  }
  c.restore();

  // Feed horn on its struts, pointing out of the dish.
  line(c, cx + 2, dy - 2, cx + 13, dy - 11, 1.5, PAL.pillarDark);
  line(c, cx - 6, dy + 6, cx + 11, dy - 9, 1.2, PAL.pillarDark);
  circle(c, cx + 13, dy - 12, 3, PAL.brass);
  circle(c, cx + 13, dy - 12, 1.4, PAL.brassLit);
  // Signal arcs.
  c.save();
  c.globalAlpha = 0.55;
  for (let i = 1; i <= 3; i++) {
    c.beginPath();
    c.arc(cx + 13, dy - 12, 4 + i * 4, -1.9, -0.5);
    c.strokeStyle = PAL.tealLit;
    c.lineWidth = 1.4;
    c.stroke();
  }
  c.restore();
}

function pointcloud(c: Ctx, cx: number, by: number) {
  plinth(c, cx, by, 34);
  const top = by - 44;
  const bot = by - 9;
  const hw = 14;

  // A dark interior, which is the whole reason this prop works.
  //
  // The first version painted the points straight onto the cream floor
  // showing through clear glass. Teal and brass dots on near-white have
  // almost no contrast, so from two tiles away the exhibit was a faint
  // smudge. A point cloud is a thing you look at in the dark; giving the
  // case a night-coloured back wall costs one rectangle and makes every
  // point in it legible.
  const grad = c.createLinearGradient(0, top, 0, bot);
  grad.addColorStop(0, '#13343a');
  grad.addColorStop(1, '#0c2228');
  c.fillStyle = grad;
  c.fillRect(Math.round(cx - hw), Math.round(top + 4), hw * 2, bot - top - 4);

  // Vitrine: a glass box drawn as a lid ellipse plus two faces, with the
  // contents painted before the front face so they read as enclosed.
  const dots: [number, number, number][] = [];
  for (let i = 0; i < 46; i++) {
    const a = hash(i, 1) * Math.PI * 2;
    const rr = Math.sqrt(hash(i, 2)) * hw * 0.85;
    dots.push([cx + Math.cos(a) * rr, top + 6 + hash(i, 3) * (bot - top - 10), hash(i, 4)]);
  }
  // Lines between some near pairs — the point-and-line map, not just points.
  c.save();
  c.strokeStyle = 'rgba(73,167,176,0.8)';
  c.lineWidth = 1;
  for (let i = 0; i < dots.length - 1; i += 6) {
    c.beginPath();
    c.moveTo(dots[i][0], dots[i][1]);
    c.lineTo(dots[i + 3][0], dots[i + 3][1]);
    c.stroke();
  }
  c.restore();
  for (const [x, y, n] of dots) {
    circle(c, x, y, n > 0.8 ? 1.8 : 1.1, n > 0.6 ? PAL.brassLit : PAL.tealLit);
  }

  // Glass.
  c.save();
  c.globalAlpha = 0.18;
  r(c, cx - hw, top + 4, hw * 2, bot - top - 4, PAL.cream);
  c.restore();
  c.save();
  c.globalAlpha = 0.5;
  line(c, cx - hw, top + 4, cx - hw, bot, 1.5, PAL.sky);
  line(c, cx + hw, top + 4, cx + hw, bot, 1.5, PAL.sky);
  line(c, cx - hw, bot, cx + hw, bot, 1.5, PAL.sky);
  c.restore();
  ellipse(c, cx, top + 4, hw, 5, 'rgba(207,234,241,0.6)');
  ring(c, cx, top + 4, hw, 5, 1.5, PAL.brass);
  r(c, cx - hw - 1, bot, hw * 2 + 2, 3, PAL.brass);
  r(c, cx - hw - 1, bot + 3, hw * 2 + 2, 1, PAL.brassDark);
  // Corner posts.
  for (const dx of [-hw, hw]) r(c, cx + dx - 1, top + 4, 2, bot - top - 4, PAL.brass);
}

function vine(c: Ctx, cx: number, by: number) {
  contact(c, cx + 3, by - 2, 24, 8);
  // Planter.
  r(c, cx - 15, by - 11, 30, 10, PAL.wood);
  r(c, cx - 16, by - 12, 32, 3, PAL.woodLit);
  r(c, cx - 15, by - 2, 30, 1, PAL.outline);
  r(c, cx - 13, by - 9, 26, 3, '#3f3328');

  // Trellis: two posts and three wires. Exactly the structure the real robot
  // has to plan around, which is why it is the thing worth drawing.
  for (const dx of [-12, 12]) r(c, cx + dx - 1.5, by - 46, 3, 36, PAL.woodLit);
  for (const wy of [-40, -32, -24]) r(c, cx - 14, by + wy, 28, 1.5, PAL.pillarDark);

  // Canopy.
  const leaves: [number, number, number][] = [];
  for (let i = 0; i < 16; i++) {
    leaves.push([
      cx - 13 + hash(i, 11) * 26,
      by - 45 + hash(i, 12) * 22,
      3 + hash(i, 13) * 3.5,
    ]);
  }
  for (const [x, y, rr] of leaves) circle(c, x, y, rr + 1, PAL.leaf);
  for (const [x, y, rr] of leaves) {
    circle(c, x - 0.6, y - 0.8, rr * 0.75, PAL.leafLit);
  }

  // Two clusters, one of them thinned — the whole point of that project.
  const cluster = (bx: number, byy: number, rows: number, gaps: number) => {
    let i = 0;
    for (let row = 0; row < rows; row++) {
      const n = rows - row;
      for (let k = 0; k < n; k++) {
        i++;
        if (i % 7 < gaps) continue;
        const x = bx + (k - (n - 1) / 2) * 3.6;
        const y = byy + row * 3.2;
        circle(c, x, y, 2.1, PAL.grape);
        circle(c, x - 0.5, y - 0.6, 1, PAL.grapeLit);
      }
    }
  };
  line(c, cx - 7, by - 26, cx - 7, by - 22, 1.2, PAL.leaf);
  cluster(cx - 7, by - 21, 4, 0);
  line(c, cx + 8, by - 26, cx + 8, by - 22, 1.2, PAL.leaf);
  cluster(cx + 8, by - 21, 4, 3);
}

function arm(c: Ctx, cx: number, by: number) {
  plinth(c, cx, by, 30);
  const base = by - 7;
  // Pedestal and shoulder. Cream links with dark joints — a collaborative
  // arm, not an industrial-orange cage robot, because that is what a CR10A is.
  ellipse(c, cx, base - 2, 11, 4.5, PAL.pillarDark);
  r(c, cx - 8, base - 10, 16, 8, PAL.pillar);
  r(c, cx - 8, base - 10, 16, 2, PAL.cream);
  circle(c, cx, base - 11, 5.5, PAL.slate);
  circle(c, cx - 1, base - 12, 2, PAL.slateLit);

  const joint = (x: number, y: number, rr = 4.5) => {
    circle(c, x, y, rr, PAL.slate);
    circle(c, x - rr * 0.25, y - rr * 0.3, rr * 0.4, PAL.slateLit);
  };
  const link = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    line(c, x0, y0, x1, y1, w, PAL.pillarDark);
    line(c, x0, y0, x1, y1, w - 2.5, PAL.pillar);
  };

  // Shoulder → elbow → wrist, posed reaching up and forward.
  const sx = cx;
  const sy = base - 12;
  const ex = cx - 10;
  const ey = base - 30;
  const wx = cx + 9;
  const wy = base - 40;
  link(sx, sy, ex, ey, 8);
  joint(ex, ey, 5);
  link(ex, ey, wx, wy, 7);
  joint(wx, wy, 4.5);

  // Gripper, open, with a faint target between the fingers.
  const gx = wx + 8;
  const gy = wy - 6;
  link(wx, wy, gx, gy, 5);
  line(c, gx, gy, gx + 5, gy - 4, 2, PAL.slate);
  line(c, gx, gy, gx + 6, gy + 2, 2, PAL.slate);
  c.save();
  c.globalAlpha = 0.6;
  circle(c, gx + 7, gy - 1, 2.4, PAL.brassLit);
  c.restore();
  // Cable loop, because a real arm always has one.
  c.save();
  c.strokeStyle = PAL.ink;
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(sx + 5, sy + 2);
  c.bezierCurveTo(sx + 14, sy + 6, sx + 10, base - 4, sx + 2, base - 3);
  c.stroke();
  c.restore();
}

function terminal(c: Ctx, cx: number, by: number) {
  contact(c, cx + 4, by - 2, 24, 8);
  // Desk.
  r(c, cx - 20, by - 18, 40, 4, PAL.woodLit);
  r(c, cx - 20, by - 14, 40, 3, PAL.wood);
  for (const dx of [-17, 15]) r(c, cx + dx, by - 11, 3, 10, PAL.woodDark);
  r(c, cx - 20, by - 2, 40, 1, PAL.outline);

  // CRT: deep body, bright screen. The glow is the thing that makes a dark
  // rectangle read as switched on.
  r(c, cx - 13, by - 42, 27, 24, PAL.pillarMid);
  r(c, cx - 13, by - 42, 27, 2, PAL.pillar);
  r(c, cx - 13, by - 20, 27, 2, PAL.pillarDark);
  r(c, cx - 10, by - 39, 21, 17, '#0e2b30');
  c.save();
  c.globalAlpha = 0.9;
  for (let i = 0; i < 7; i++) {
    const w = 4 + hash(i, 21) * 15;
    r(c, cx - 8, by - 37 + i * 2.3, w, 1, i === 3 ? PAL.brassLit : PAL.tealLit);
  }
  c.restore();
  // Scanline sheen and a cursor block.
  c.save();
  c.globalAlpha = 0.12;
  for (let i = 0; i < 17; i += 2) r(c, cx - 10, by - 39 + i, 21, 1, '#ffffff');
  c.restore();
  r(c, cx + 6, by - 24, 3, 2, PAL.brassLit);
  // Keyboard and a stack of paper.
  r(c, cx - 11, by - 17, 20, 4, PAL.pillar);
  r(c, cx - 11, by - 17, 20, 1, PAL.cream);
  for (let i = 0; i < 3; i++) r(c, cx + 12, by - 17 - i, 8, 1, PAL.cream);
}

function caduceus(c: Ctx, cx: number, by: number) {
  contact(c, cx + 4, by - 2, 24, 8);
  // Reception counter with a curved front.
  c.beginPath();
  c.moveTo(cx - 21, by - 2);
  c.lineTo(cx - 21, by - 15);
  c.quadraticCurveTo(cx, by - 21, cx + 21, by - 15);
  c.lineTo(cx + 21, by - 2);
  c.closePath();
  c.fillStyle = PAL.pillarMid;
  c.fill();
  c.strokeStyle = PAL.outline;
  c.lineWidth = 1;
  c.stroke();
  c.beginPath();
  c.moveTo(cx - 22, by - 15);
  c.quadraticCurveTo(cx, by - 22, cx + 22, by - 15);
  c.lineTo(cx + 22, by - 12);
  c.quadraticCurveTo(cx, by - 19, cx - 22, by - 12);
  c.closePath();
  c.fillStyle = PAL.pillar;
  c.fill();

  // Standing sign: a cross, which is the one medical symbol nobody misreads.
  r(c, cx - 1.5, by - 34, 3, 14, PAL.pillarDark);
  circle(c, cx, by - 40, 9, PAL.cream);
  circle(c, cx, by - 40, 9, PAL.cream);
  ring(c, cx, by - 40, 9, 9, 1.5, PAL.pillarDark);
  r(c, cx - 1.8, by - 45, 3.6, 10, PAL.red);
  r(c, cx - 5, by - 41.8, 10, 3.6, PAL.red);

  // A queue ticket display and a plant, because a waiting room has both.
  r(c, cx + 11, by - 26, 10, 7, PAL.slate);
  r(c, cx + 12.5, by - 24.5, 7, 4, PAL.tealLit);
  r(c, cx - 20, by - 22, 7, 7, PAL.wood);
  circle(c, cx - 16.5, by - 25, 4, PAL.leaf);
  circle(c, cx - 18, by - 27, 2.4, PAL.leafLit);
  circle(c, cx - 14.5, by - 26.5, 2.2, PAL.leafLit);
}

function telescope(c: Ctx, cx: number, by: number) {
  plinth(c, cx, by, 28);
  const my = by - 7;
  // Tripod.
  for (const dx of [-11, 0, 11]) line(c, cx, my - 16, cx + dx, my - 1, 2.5, PAL.wood);
  line(c, cx - 8, my - 8, cx + 8, my - 8, 1.5, PAL.woodLit);
  // Equatorial head.
  r(c, cx - 4, my - 22, 8, 7, PAL.slate);
  circle(c, cx, my - 22, 4, PAL.slateLit);

  // Tube, angled up toward the window the player is standing at.
  c.save();
  c.translate(cx, my - 24);
  c.rotate(-0.72);
  r(c, -17, -5, 34, 10, PAL.pillarMid);
  r(c, -17, -5, 34, 2.5, PAL.pillar);
  r(c, -17, 2.5, 34, 2.5, PAL.pillarDark);
  r(c, 15, -6, 4, 12, PAL.brass);
  r(c, 16, -5, 2, 10, PAL.ink);
  r(c, -19, -4, 3, 8, PAL.brassDark);
  // Finder scope and focuser.
  r(c, -4, -9, 12, 4, PAL.brassDark);
  r(c, -8, 4, 5, 6, PAL.slate);
  c.restore();
  circle(c, cx + 2, my - 36, 1.6, PAL.brassLit);
}

// ---------------------------------------------------------------------------
// Furniture
// ---------------------------------------------------------------------------

function table(c: Ctx, cx: number, by: number) {
  contact(c, cx + 3, by - 2, 18, 6);
  for (const dx of [-13, 11]) r(c, cx + dx, by - 13, 3, 11, PAL.woodDark);
  r(c, cx - 16, by - 20, 32, 7, PAL.woodLit);
  r(c, cx - 16, by - 20, 32, 2, '#8d6b4b');
  r(c, cx - 16, by - 14, 32, 2, PAL.woodDark);
  // An open book and a lamp, which is what makes it a reading table.
  r(c, cx - 11, by - 22, 9, 3, PAL.cream);
  r(c, cx - 1, by - 22, 9, 3, PAL.cream);
  r(c, cx - 2, by - 23, 2, 4, PAL.wood);
  r(c, cx + 9, by - 26, 2, 7, PAL.brassDark);
  ellipse(c, cx + 10, by - 27, 4.5, 3, PAL.brass);
  circle(c, cx + 10, by - 26, 1.6, PAL.brassLit);
}

function bench(c: Ctx, cx: number, by: number) {
  contact(c, cx + 2, by - 2, 13, 5);
  for (const dx of [-9, 7]) r(c, cx + dx, by - 9, 2.5, 7, PAL.woodDark);
  r(c, cx - 11, by - 13, 22, 4, PAL.wood);
  r(c, cx - 11, by - 13, 22, 1.5, PAL.woodLit);
}

function brazier(c: Ctx, cx: number, by: number) {
  // Scaled up from the first pass, where a 9 px bowl on a 32 px tile read as
  // a gold mushroom. Floor-standing light in a hall this size is chest-high
  // furniture, not a candle.
  contact(c, cx + 2, by - 2, 14, 5.5);
  for (const dx of [-8, 0, 8]) line(c, cx + dx * 0.3, by - 22, cx + dx, by - 2, 2.5, PAL.brassDark);
  line(c, cx - 7, by - 12, cx + 7, by - 12, 2, PAL.brass);
  ellipse(c, cx, by - 23, 12, 5, PAL.brassDark);
  ellipse(c, cx, by - 24.5, 11, 4.4, PAL.brass);
  ellipse(c, cx, by - 25, 8.5, 3.2, '#5b2f1c');
  // Flame: three stacked ellipses, hot at the core. No animation — this is
  // baked into the static ground layer, and a flickering flame would mean
  // repainting the whole world every frame to move one pixel.
  ellipse(c, cx, by - 31, 5.6, 7.5, '#d2541f');
  ellipse(c, cx, by - 32.5, 3.8, 5.4, '#f0943a');
  ellipse(c, cx, by - 33.5, 1.9, 3.2, PAL.brassLit);
}

function crate(c: Ctx, cx: number, by: number) {
  contact(c, cx + 2, by - 2, 12, 5);
  r(c, cx - 11, by - 15, 22, 13, PAL.wood);
  r(c, cx - 11, by - 15, 22, 2, PAL.woodLit);
  r(c, cx - 11, by - 4, 22, 2, PAL.woodDark);
  line(c, cx - 10, by - 14, cx + 10, by - 3, 1.2, PAL.woodDark);
  line(c, cx + 10, by - 14, cx - 10, by - 3, 1.2, PAL.woodDark);
  // A smaller crate on top, so the stack has a silhouette.
  r(c, cx - 7, by - 24, 15, 9, PAL.woodLit);
  r(c, cx - 7, by - 24, 15, 1.5, '#8d6b4b');
  r(c, cx - 7, by - 16, 15, 1.5, PAL.woodDark);
  r(c, cx - 2, by - 24, 2, 9, PAL.wood);
}

function plant(c: Ctx, cx: number, by: number) {
  contact(c, cx + 2, by - 2, 10, 4);
  // Terracotta pot.
  c.beginPath();
  c.moveTo(cx - 8, by - 13);
  c.lineTo(cx + 8, by - 13);
  c.lineTo(cx + 6, by - 2);
  c.lineTo(cx - 6, by - 2);
  c.closePath();
  c.fillStyle = '#a5603f';
  c.fill();
  r(c, cx - 9, by - 15, 18, 3, '#b86e49');
  r(c, cx - 9, by - 13, 18, 1, '#8a4b30');
  // Fronds, drawn as tapering strokes so it is a plant rather than a bush.
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.34;
    const len = 16 + hash(i, 41) * 8;
    const ex = cx + Math.cos(a) * len;
    const ey = by - 15 + Math.sin(a) * len;
    line(c, cx, by - 14, ex, ey, 2.4, PAL.leaf);
    line(c, cx, by - 14, (cx + ex) / 2, (by - 14 + ey) / 2, 1.6, PAL.leafLit);
    circle(c, ex, ey, 2.4, i % 2 ? PAL.leafLit : PAL.leaf);
  }
}

function bust(c: Ctx, cx: number, by: number) {
  contact(c, cx + 2, by - 2, 11, 4.5);
  // Pedestal.
  r(c, cx - 8, by - 5, 16, 3, PAL.pillarDark);
  r(c, cx - 6, by - 22, 12, 17, PAL.pillarMid);
  r(c, cx - 6, by - 22, 4, 17, PAL.pillar);
  r(c, cx - 8, by - 25, 16, 3, PAL.pillar);
  r(c, cx - 8, by - 2, 16, 1, PAL.outline);
  // Head and shoulders.
  ellipse(c, cx, by - 28, 7, 4, PAL.pillar);
  circle(c, cx, by - 33, 5, PAL.pillar);
  ellipse(c, cx - 1.6, by - 34, 3.4, 3.8, PAL.cream);
  r(c, cx - 5, by - 36, 10, 2.5, PAL.pillarMid);
  r(c, cx - 2, by - 32, 1.4, 1.4, PAL.pillarDark);
  r(c, cx + 1, by - 32, 1.4, 1.4, PAL.pillarDark);
}

const DECOR: Record<DecorKind, (c: Ctx, cx: number, by: number) => void> = {
  table,
  bench,
  brazier,
  crate,
  plant,
  bust,
};

/**
 * Everything that takes part in the depth sort, as one list.
 *
 * Furniture, columns and exhibits were all baked into the static layer at
 * first, which is faster and wrong: walk north of a table and the table is
 * drawn behind you, so you appear to stand on it. Anything the player can
 * get behind has to be sorted against the player every frame.
 *
 * Built once at module load. About ninety entries, culled to the viewport
 * before sorting, so a frame sorts perhaps thirty — nothing.
 */
export type Entity = { x: number; y: number; draw: (c: Ctx) => void };

export const entities: Entity[] = [
  ...pillars.map((p) => ({
    x: p.x,
    y: p.y,
    draw: (c: Ctx) => paintPillar(c, p.x * TILE, p.y * TILE),
  })),
  ...decor.map((d) => ({
    x: d.x,
    y: d.y,
    draw: (c: Ctx) => DECOR[d.kind](c, d.x * TILE + TILE / 2, d.y * TILE + TILE - 2),
  })),
  ...placed.map((e) => ({
    x: e.x,
    y: e.y,
    draw: (c: Ctx) => PROPS[e.kind](c, e.x * TILE + TILE / 2, e.y * TILE + TILE - 2),
  })),
];

const PROPS: Record<Kind, (c: Ctx, cx: number, by: number) => void> = {
  astrolabe,
  tank,
  blackboard,
  antenna,
  pointcloud,
  vine,
  arm,
  terminal,
  caduceus,
  window: telescope,
};

/**
 * Draws one prop at a given bottom-centre. Used by the preview script to lay
 * the exhibits out on a plain grid, away from the hall, which is how each
 * one gets checked without hunting for it in the world.
 */
export function paintProp(c: Ctx, kind: Kind, cx: number, by: number) {
  c.imageSmoothingEnabled = false;
  PROPS[kind](c, cx, by);
}

export type Facing = 'down' | 'up' | 'left' | 'right';

/**
 * The figure.
 *
 * Small on purpose — about 24 px tall against 32 px tiles, which is the
 * proportion that makes a room feel like a room. A sprite as tall as the
 * tiles makes a hall look like a corridor.
 *
 * Four frames per direction. Frame 0 and 2 are the passing pose, 1 and 3 the
 * contact poses; the body rises a pixel on the passing frames, which is the
 * entire secret of a walk cycle that does not look like sliding.
 */
export function paintHero(c: Ctx, cx: number, by: number, facing: Facing, frame: number) {
  c.imageSmoothingEnabled = false;
  const f = frame & 3;
  const passing = f === 0 || f === 2;
  const swing = f === 1 ? 1 : f === 3 ? -1 : 0;
  const bob = passing ? -1 : 0;

  const SKIN = '#e8bb90';
  const SKIN_DK = '#c9966c';
  const HAIR = '#241f2b';
  const COAT = PAL.slate;
  const COAT_LT = PAL.slateLit;
  const TROUSER = '#343042';
  const BOOT = '#241c18';

  contact(c, cx + 2, by - 1, 9, 3.6);

  const y = by + bob;

  // Legs. Left/right facings swing fore-and-aft; up/down swing laterally,
  // which is what reads as walking toward or away from the camera.
  const lateral = facing === 'up' || facing === 'down';
  const legs: [number, number][] = lateral
    ? [
        [-3, swing],
        [2, -swing],
      ]
    : [
        [-2 + swing * 2, 0],
        [1 - swing * 2, 0],
      ];
  for (const [lx, ly] of legs) {
    r(c, cx + lx, y - 9 + ly, 3, 7, TROUSER);
    r(c, cx + lx - 0.5, y - 2.5 + ly, 4, 2.5, BOOT);
  }

  // Coat.
  r(c, cx - 5, y - 20, 10, 12, COAT);
  r(c, cx - 5, y - 20, 10, 2, COAT_LT);
  r(c, cx - 5, y - 9, 10, 1, '#1e2733');
  if (facing === 'down') {
    // Open front with a lighter shirt showing.
    r(c, cx - 1, y - 18, 2, 9, PAL.cream);
    r(c, cx - 1, y - 18, 2, 2, PAL.brass);
  }

  // Arms, swinging opposite the legs.
  const armY = y - 18;
  if (lateral) {
    r(c, cx - 7, armY - swing, 2.5, 9, COAT);
    r(c, cx + 4.5, armY + swing, 2.5, 9, COAT);
    r(c, cx - 7, armY + 8 - swing, 2.5, 2.5, SKIN);
    r(c, cx + 4.5, armY + 8 + swing, 2.5, 2.5, SKIN);
  } else {
    const dir = facing === 'right' ? 1 : -1;
    r(c, cx - 1 + dir * 3, armY + Math.abs(swing), 2.5, 9, COAT_LT);
    r(c, cx - 1 + dir * 3, armY + 8 + Math.abs(swing), 2.5, 2.5, SKIN);
  }

  // Head.
  const hy = y - 25;
  circle(c, cx, hy, 5, SKIN);
  if (facing === 'up') {
    // Back of the head: all hair, no face. The absence is the cue.
    circle(c, cx, hy, 5, HAIR);
    r(c, cx - 5, hy - 1, 10, 3, HAIR);
  } else {
    r(c, cx - 5, hy - 5, 10, 4, HAIR);
    circle(c, cx - 4.4, hy - 2.4, 1.6, HAIR);
    circle(c, cx + 4.4, hy - 2.4, 1.6, HAIR);
    r(c, cx - 5, hy + 3, 10, 1, SKIN_DK);
    if (facing === 'down') {
      r(c, cx - 2.6, hy, 1.6, 1.6, PAL.ink);
      r(c, cx + 1.2, hy, 1.6, 1.6, PAL.ink);
    } else {
      const dir = facing === 'right' ? 1 : -1;
      r(c, cx + dir * 1.6, hy, 1.6, 1.6, PAL.ink);
      r(c, cx + dir * 4.2, hy + 0.6, 1.4, 1.4, SKIN_DK);
    }
  }
  // Neck shadow, which stops the head from looking stuck on.
  r(c, cx - 2, y - 21, 4, 1.5, SKIN_DK);
}
