"use strict";
/**
 * Outlines for the construction-paper look: pieces cut by hand with scissors
 * (smooth curves that wander a little, with the odd small step where the
 * blades stopped and started again) or torn by hand (a ragged edge with a
 * pale fiber fringe). Everything is seeded, so a piece keeps the same edge on
 * every render.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seeded = seeded;
exports.hash = hash;
exports.polygonPath = polygonPath;
exports.cutOutline = cutOutline;
exports.tornOutline = tornOutline;
exports.seededTilt = seededTilt;
exports.circleCut = circleCut;
exports.cutCircle = cutCircle;
exports.cutRingPath = cutRingPath;
/** Small, fast PRNG; the same seed always gives the same sequence. */
function seeded(seed) {
    let h = typeof seed === 'number' ? seed >>> 0 : hash(seed);
    return () => {
        h = (h + 0x6d2b79f5) >>> 0;
        let t = h;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++)
        h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
}
/** Closed SVG path through the points, with coordinates rounded to keep strings short. */
function polygonPath(points) {
    if (points.length === 0)
        return '';
    const r = (n) => Math.round(n * 10) / 10;
    return `M${points.map((p) => `${r(p.x)} ${r(p.y)}`).join('L')}Z`;
}
/**
 * Walks the edge of a w×h rounded rectangle. `at(s)` gives the point `s` along
 * the edge (clockwise from the end of the top-left corner) and its outward normal.
 */
function roundedRect(w, h, radius) {
    const r = Math.max(0, Math.min(radius, w / 2, h / 2));
    const sx = w - 2 * r;
    const sy = h - 2 * r;
    const arc = (Math.PI / 2) * r;
    const length = 2 * sx + 2 * sy + 4 * arc;
    // Straight run, then corner, four times: top, top-right, right, bottom-right, ...
    const runs = [sx, arc, sy, arc, sx, arc, sy, arc];
    function at(s) {
        let d = ((s % length) + length) % length;
        let i = 0;
        while (i < runs.length - 1 && d > runs[i]) {
            d -= runs[i];
            i++;
        }
        const side = i >> 1;
        if (i % 2 === 0) {
            // Straight sides: top, right, bottom, left.
            const t = d;
            if (side === 0)
                return { x: r + t, y: 0, nx: 0, ny: -1, corner: false };
            if (side === 1)
                return { x: w, y: r + t, nx: 1, ny: 0, corner: false };
            if (side === 2)
                return { x: w - r - t, y: h, nx: 0, ny: 1, corner: false };
            return { x: 0, y: h - r - t, nx: -1, ny: 0, corner: false };
        }
        // Corners: top-right, bottom-right, bottom-left, top-left; angle measured from straight up.
        const a = (side * Math.PI) / 2 + (r > 0 ? d / r : 0);
        const centers = [
            [w - r, r],
            [w - r, h - r],
            [r, h - r],
            [r, r],
        ];
        const [cx, cy] = centers[side];
        const nx = Math.sin(a);
        const ny = -Math.cos(a);
        return { x: cx + nx * r, y: cy + ny * r, nx, ny, corner: true };
    }
    return { at, length, radius: r, runs };
}
function rotate(points, w, h, degrees) {
    if (!degrees)
        return points;
    const a = (degrees * Math.PI) / 180;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const cx = w / 2;
    const cy = h / 2;
    return points.map(({ x, y }) => ({
        x: cx + (x - cx) * cos - (y - cy) * sin,
        y: cy + (x - cx) * sin + (y - cy) * cos,
    }));
}
/** Smooth periodic noise along a loop of `length`, in [-1, 1]. */
function loopNoise(rand, length, spacing) {
    const n = Math.max(3, Math.round(length / spacing));
    const knots = Array.from({ length: n }, () => rand() * 2 - 1);
    return (s) => {
        const t = ((((s / length) * n) % n) + n) % n;
        const i = Math.floor(t);
        const f = t - i;
        const e = (1 - Math.cos(f * Math.PI)) / 2;
        return knots[i] * (1 - e) + knots[(i + 1) % n] * e;
    };
}
/**
 * How far a hand cut strays from the ideal line, at each point `s` along a
 * loop of `length` points: a slow wander, a little tremble, and a few small
 * steps where the scissors were stopped and restarted a hair off the line,
 * each easing back over the next stretch. `restarts` lists where the steps
 * are, so the edge can be sampled on both sides of each one.
 */
function handCut(rand, length) {
    const amp = Math.min(0.6, Math.max(0.25, length * 0.0018));
    const wander = loopNoise(rand, length, 26);
    const tremble = loopNoise(rand, length, 7);
    const count = Math.min(4, Math.max(1, Math.round(length / 160)));
    const restarts = Array.from({ length: count }, (_, i) => ({
        // Spread around the loop, and never right at its start (12 o'clock on a circle).
        at: ((i + 0.2 + rand() * 0.6) / count) * length,
        step: (rand() < 0.5 ? -1 : 1) * (0.25 + rand() * 0.3),
        ease: 10 + rand() * 20,
    }));
    const offset = (s) => {
        let d = wander(s) * amp + tremble(s) * 0.12 - amp * 0.3;
        for (const r of restarts)
            d += r.step * Math.exp(-((((s - r.at) % length) + length) % length) / r.ease);
        return d;
    };
    return { offset, restarts: restarts.map((r) => r.at) };
}
/** Sample positions along a loop: evenly `step` apart, plus both sides of each restart. */
function samples(length, step, restarts) {
    const n = Math.max(8, Math.ceil(length / step));
    const out = Array.from({ length: n }, (_, i) => (i / n) * length);
    for (const at of restarts)
        out.push(Math.max(0, at - 0.05), at);
    return out.sort((a, b) => a - b);
}
/** Chord length that keeps a curve of radius `r` looking smooth (it bulges under 0.05pt). */
function smoothStep(r) {
    return r > 0 ? Math.min(6, Math.max(1.5, Math.sqrt(0.4 * r))) : 4;
}
/**
 * Hand cut with scissors: the rounded rectangle traced as a smooth curve that
 * wanders a little, with a couple of small restart steps.
 */
function cutOutline(w, h, { radius, seed, tilt = 0 }) {
    const shape = roundedRect(w, h, radius);
    const cut = handCut(seeded(seed), shape.length);
    const step = Math.min(4, smoothStep(shape.radius));
    const points = samples(shape.length, step, cut.restarts).map((s) => {
        const p = shape.at(s);
        const off = cut.offset(s);
        return { x: p.x + p.nx * off, y: p.y + p.ny * off };
    });
    return rotate(points, w, h, tilt);
}
/**
 * Hand torn: a ragged edge that wanders a little, plus the pale fringe of
 * exposed fibers just outside it. Both sit within about 3pt of the box.
 */
function tornOutline(w, h, { radius, seed, tilt = 0 }) {
    const shape = roundedRect(w, h, radius);
    const rand = seeded(seed);
    const drift = loopNoise(rand, shape.length, 38);
    const ripple = loopNoise(rand, shape.length, 7);
    const fringeWidth = loopNoise(rand, shape.length, 9);
    const edge = [];
    const fringe = [];
    const step = 2.2;
    for (let s = 0; s < shape.length; s += step * (0.75 + rand() * 0.5)) {
        const p = shape.at(s);
        // Mostly inward so the torn edge stays inside the box.
        const off = -2 + drift(s) * 1.5 + ripple(s) * 0.7 + (rand() - 0.5) * 0.9;
        edge.push({ x: p.x + p.nx * off, y: p.y + p.ny * off });
        // Fibers stick out past the color by 0.5–3.5pt, with the odd longer wisp.
        const wisp = rand() < 0.08 ? rand() * 1.8 : 0;
        const out = off + 0.5 + (fringeWidth(s) + 1) * 1.2 + rand() * 0.8 + wisp;
        fringe.push({ x: p.x + p.nx * out, y: p.y + p.ny * out });
    }
    return { edge: rotate(edge, w, h, tilt), fringe: rotate(fringe, w, h, tilt) };
}
/** A tilt in degrees for a piece, seeded, smaller for wider pieces so their edges barely move. */
function seededTilt(seed, w, max = 1.2) {
    const rand = seeded(`${seed}:tilt`);
    const limit = Math.min(max, 24 / Math.max(w, 1));
    return (rand() * 2 - 1) * limit;
}
/**
 * A circle of radius `r` cut by hand. The first sample sits exactly at
 * 12 o'clock, where the wedge ends.
 */
function circleCut(r, seed) {
    const length = 2 * Math.PI * r;
    const cut = handCut(seeded(seed), length);
    return samples(length, smoothStep(r), cut.restarts).map((s) => ({
        angle: s / r,
        scale: 1 + cut.offset(s) / r,
    }));
}
function cutPoint(cx, cy, r, f) {
    return { x: cx + r * f.scale * Math.sin(f.angle), y: cy - r * f.scale * Math.cos(f.angle) };
}
/** Point on the cut circle's edge at `angle`, between the two samples around it. */
function cutEdgeAt(cx, cy, r, cut, angle) {
    const n = cut.length;
    let i = n - 1;
    for (let k = 0; k < n; k++) {
        if (cut[k].angle > angle) {
            i = k - 1;
            break;
        }
    }
    const a = cut[i];
    const b = i + 1 < n ? cut[i + 1] : { angle: 2 * Math.PI, scale: cut[0].scale };
    const pa = cutPoint(cx, cy, r, a);
    const pb = cutPoint(cx, cy, r, b);
    // Intersect the ray from the center at `angle` with the short chord from a to b.
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle);
    const ex = pb.x - pa.x;
    const ey = pb.y - pa.y;
    const denom = dx * ey - dy * ex;
    if (Math.abs(denom) < 1e-9)
        return pa;
    const t = ((pa.x - cx) * ey - (pa.y - cy) * ex) / denom;
    return { x: cx + dx * t, y: cy + dy * t };
}
/** The whole cut circle. */
function cutCircle(cx, cy, r, cut) {
    return cut.map((f) => cutPoint(cx, cy, r, f));
}
/** The cut circle's edge from `from` (radians) clockwise to 12 o'clock. */
function cutArc(cx, cy, r, cut, from) {
    const points = [cutEdgeAt(cx, cy, r, cut, from)];
    for (const f of cut)
        if (f.angle > from)
            points.push(cutPoint(cx, cy, r, f));
    points.push(cutPoint(cx, cy, r, { angle: 2 * Math.PI, scale: cut[0].scale }));
    return points;
}
/** A gentle wander across a straight cut, by distance along it; never periodic. */
function lineWander(seed) {
    const rand = seeded(seed);
    const spacing = 16;
    const knots = Array.from({ length: 80 }, () => (rand() * 2 - 1) * 0.35);
    return (t) => {
        const u = Math.min(knots.length - 2, Math.max(0, t / spacing));
        const i = Math.floor(u);
        const e = (1 - Math.cos((u - i) * Math.PI)) / 2;
        return knots[i] * (1 - e) + knots[i + 1] * e;
    };
}
const START_EDGE = lineWander('wedge-start');
const MOVING_EDGE = lineWander('wedge-moving');
/** Spacing of points along the wedge's straight cuts. */
const LINE_STEP = 7;
/**
 * Points along a hand-cut straight edge at `angle`, from radius `t0` toward
 * `t1` (both ends left out; the arcs supply them). Points sit at fixed
 * distances from the center, so the edge keeps its shape as it turns.
 */
function radialCut(cx, cy, angle, t0, t1, wander) {
    const lo = Math.min(t0, t1) + 1.5;
    const hi = Math.max(t0, t1) - 1.5;
    const ts = [];
    for (let t = Math.ceil(lo / LINE_STEP) * LINE_STEP; t <= hi; t += LINE_STEP)
        ts.push(t);
    if (t0 > t1)
        ts.reverse();
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle);
    return ts.map((t) => {
        const across = wander(t);
        return { x: cx + dx * t - dy * across, y: cy + dy * t + dx * across };
    });
}
/**
 * The remaining-time wedge (or one ring of it) cut from hand-cut circles, so
 * the curved edges don't shimmer as it sweeps, and its two straight cuts
 * wander slightly too. `fraction` 1 is the full disk; the wedge ends at
 * 12 o'clock like `ringPath`.
 */
function cutRingPath(cx, cy, inner, outer, fraction, outerCut, innerCut) {
    const f = Math.min(1, Math.max(0, fraction));
    if (f <= 0)
        return '';
    if (f >= 0.99999) {
        const ring = polygonPath(cutCircle(cx, cy, outer, outerCut));
        return inner > 0 ? `${ring}${polygonPath(cutCircle(cx, cy, inner, innerCut).reverse())}` : ring;
    }
    const from = (1 - f) * 2 * Math.PI;
    const outside = cutArc(cx, cy, outer, outerCut, from);
    const startEdge = radialCut(cx, cy, 0, outer, inner, START_EDGE);
    const inside = inner > 0 ? cutArc(cx, cy, inner, innerCut, from).reverse() : [{ x: cx, y: cy }];
    const movingEdge = radialCut(cx, cy, from, inner, outer, MOVING_EDGE);
    return polygonPath([...outside, ...startEdge, ...inside, ...movingEdge]);
}
