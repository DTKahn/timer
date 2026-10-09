// Builds the Paper Pack canvas boards from the app's own outline code and palette.
const fs = require('fs');
const path = require('path');
const o = require('./js/outline.js');
const C = require('./colors.json');
const { tornEdge } = require('./js/torn-fibers.js');
const C2_NAMES = ['rect2', 'circle2-0', 'circle2-1', 'circle2-2'].flatMap((n) => [`${n}-mask`, `${n}-rim`])
  .concat(['rect2', 'circle2-0'].flatMap((n) => ['glued', 'raised', 'lifted'].flatMap((l) => ['light', 'dark'].map((m) => `${n}-shadow-${l}-${m}`))));
const C2_BLOBS = fs.existsSync(path.join(__dirname, 'c2/blobs.json')) ? require('./c2/blobs.json') : {};
const c2url = (n) => C2_BLOBS[n] ?? `tex/${n}.png`;
const KITS = require('./c2/kits.json');
const KIT_BLOBS = fs.existsSync(path.join(__dirname, 'c2/kit-blobs.json')) ? require('./c2/kit-blobs.json') : {};
const kitUrl = (n) => KIT_BLOBS[n] ?? `tex/kit/${n}.png`;
const KIT_USED = new Set();
const KIT_ALL_USED = new Set();
const PAGE_SHEETS = Object.fromEntries(C.pack.filter((s) => ['Manila', 'Black'].includes(s.name)).map((s) => [s.paper, s]));
let pageTexCount = 0;
/** Every page is a sheet of construction paper too: give each page-colored box the sheet's grain, under its content. */
function addPageTex(html) {
  return html.replace(/<div([^>]*?) style="([^"]*?)background: (#[0-9A-F]{6})([^"]*)">/g, (m, pre, s1, hex, s2) => {
    const sheet = PAGE_SHEETS[hex];
    const style = s1 + s2;
    if (!sheet || style.includes('clip-path') || /height: \d px/.test(style)) return m;
    const seed = `page-${pageTexCount++}`;
    const pos = /position: (absolute|relative)/.test(style) ? '' : 'position: relative; ';
    const tex = `<div class="tex fl" style="z-index: -1; background: ${sheet.shades[0]}; -webkit-mask-position: ${offset(seed)}; mask-position: ${offset(seed)}"></div><div class="tex fd" style="z-index: -1; background: ${sheet.shades[1]}; -webkit-mask-position: ${offset(seed + 'd')}; mask-position: ${offset(seed + 'd')}"></div>`;
    return `<div${pre} style="${pos}isolation: isolate; ${s1}background: ${hex}${s2}">${tex}`;
  });
}

const OUT = path.join(__dirname, 'project');
const OLD = '/_blob/e5f1c98f8a4434b8d29096c65f738d6b';
const LIGHT = '/_blob/a83c4321bc5e54238f691acea21e49ff';
const DARK = '/_blob/75f930dc771a4d848cea7c88d09548c2';

const INK = '#2A2520';
const MUTED = '#655C50';
const MANILA = '#EAE0CB';
const BLACK = C.pack.find((x) => x.name === 'Black').paper;
const TABLE = '#DCD8D0';

const p = (pts) => o.polygonPath(pts);
const shift = (d, dx, dy) =>
  d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${+(+x + dx).toFixed(1)} ${+(+y + dy).toFixed(1)}`);
const hash = (s) => o.hash(s);
const offset = (seed) => `${-(hash(seed) % 160)}px ${-((hash(seed) >>> 9) % 160)}px`;

// ---------- shared helmet ----------
function helmet(extra = '') {
  return `<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&amp;display=swap" rel="stylesheet">
<style>
body{margin:0}
a{color:${MUTED}}a:hover{color:${INK}}
.tex{position:absolute;inset:0}
.now{background-image:url(${OLD});background-size:160px 160px}
.fl{-webkit-mask-image:url(${LIGHT});mask-image:url(${LIGHT});-webkit-mask-size:160px 160px;mask-size:160px 160px}
.fd{-webkit-mask-image:url(${DARK});mask-image:url(${DARK});-webkit-mask-size:160px 160px;mask-size:160px 160px}
.glued{filter:drop-shadow(0 0.5px 0.4px rgba(43,30,15,.30))}
.raised{filter:drop-shadow(0 1px 1px rgba(43,30,15,.20)) drop-shadow(0 3px 5px rgba(43,30,15,.18))}
.lifted{filter:drop-shadow(0 2px 2px rgba(43,30,15,.16)) drop-shadow(0 10px 16px rgba(43,30,15,.22))}
.on-dark .glued{filter:drop-shadow(0 0.6px 0.5px rgba(0,0,0,.65))}
.on-dark .raised{filter:drop-shadow(0 1px 1px rgba(0,0,0,.55)) drop-shadow(0 3px 6px rgba(0,0,0,.5))}
.on-dark .lifted{filter:drop-shadow(0 2px 2px rgba(0,0,0,.5)) drop-shadow(0 10px 18px rgba(0,0,0,.6))}
 ${C2_NAMES.map((n) => `.k-${n}{-webkit-mask-image:url(${c2url(n)});mask-image:url(${c2url(n)});-webkit-mask-size:100% 100%;mask-size:100% 100%}`).join('\n')}
.c2-shadow{background-image:url(/_blob/70fe512b8bfb276050151212c08ee436);background-size:100% 100%}
.c2-mask,.c2-f0,.c2-f1,.c2-f2{-webkit-mask-size:100% 100%;mask-size:100% 100%}
.c2-mask{-webkit-mask-image:url(/_blob/540d815f7aeb3b27603b1b038b7e45a4);mask-image:url(/_blob/540d815f7aeb3b27603b1b038b7e45a4)}
.c2-f0{-webkit-mask-image:url(/_blob/eac2eb438067c05fd492fb6c1cfa8a73);mask-image:url(/_blob/eac2eb438067c05fd492fb6c1cfa8a73)}
.c2-f1{-webkit-mask-image:url(/_blob/e9425f44ec5d2830097c4cc34f636ef0);mask-image:url(/_blob/e9425f44ec5d2830097c4cc34f636ef0)}
.c2-f2{-webkit-mask-image:url(/_blob/0b66068100f8c6ec81d94b5969d52db4);mask-image:url(/_blob/0b66068100f8c6ec81d94b5969d52db4)}
${extra}
</style>
</helmet>`;
}

function page(title, w, h, body, extraCss = '') {
  body = addPageTex(body);
  extraCss += [...KIT_USED].map((n) => `.q-${n}{-webkit-mask-image:url(${kitUrl(n)});mask-image:url(${kitUrl(n)});-webkit-mask-size:100% 100%;mask-size:100% 100%}`).join('\n');
  KIT_USED.clear();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
${helmet(extraCss)}
<div style="width: ${w}px; height: ${h}px; box-sizing: border-box; background: ${TABLE}; color: ${INK}; font-family: Lato, 'Avenir Next', 'Helvetica Neue', sans-serif; display: flex; flex-direction: column;">
${body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
`;
}

// ---------- a piece of paper ----------
// texture: 'now' (today's grain) or 'new' (same-hue fibers). edge: 'cut' | 'torn'. lift: glued | raised | lifted.
function piece({ w, h, color, shades, texture = 'new', dark = false, d, seed, lift = 'glued', fringe = null, rim = false, inner = '', style = '' }) {
  const tex =
    texture === 'now'
      ? `<div class="tex now" style="background-position: ${offset(seed)}; opacity: ${dark ? 0.75 : 1}"></div>`
      : `<div class="tex fl" style="background: ${shades[0]}; -webkit-mask-position: ${offset(seed)}; mask-position: ${offset(seed)}"></div>
<div class="tex fd" style="background: ${shades[1]}; -webkit-mask-position: ${offset(seed + 'd')}; mask-position: ${offset(seed + 'd')}"></div>`;
  const rimSvg = rim
    ? `<svg aria-hidden="true" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position: absolute; left: 0; top: 0"><path d="${d}" fill="none" stroke="#FFFFFF" stroke-opacity="${dark ? 0.07 : 0.16}" stroke-width="0.8"></path><path d="${d}" fill="none" stroke="#FFFFFF" stroke-opacity="${dark ? 0.07 : 0.16}" stroke-width="0.8" stroke-dasharray="5 3 2 4 9 2 3 6"></path></svg>`
    : '';
  const fibers = fringe && fringe.fibers && fringe.style !== 'now' ? fringe.fibers : null;
  const svgAt = (body) => `<svg aria-hidden="true" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position: absolute; left: 0; top: 0; overflow: visible">${body}</svg>`;
  // Torn, new: a pale band of fibers, loose wisps past it, and colored fibers feathering the edge.
  // Torn fibers are the sheet's own dyed fibers: its color, its lighter fiber shade, and a touch lighter at the tips.
  const tones = edgeTones(color, shades, dark);
  const fringeDiv = fibers
    ? svgAt(fibers.mat.map((d2, i) => `<path d="${d2}" fill="none" stroke="${tones[i]}" stroke-width="${[0.16, 0.2, 0.22][i]}" stroke-opacity="${[0.7, 0.85, 0.95][i]}" stroke-linecap="round"></path>`).join('')
      + `<path d="${fibers.wisps}" fill="none" stroke="${tones[1]}" stroke-width="0.14" stroke-opacity="0.6" stroke-linecap="round"></path>`)
    : fringe
      ? `<div style="position: absolute; left: -6px; top: -6px; width: ${w + 12}px; height: ${h + 12}px; background: ${fringe.color}; clip-path: path('${shift(fringe.d, 6, 6)}')"></div>`
      : '';
  const featherSvg = fibers
    ? svgAt(`<path d="${fibers.colored}" fill="none" stroke="${color}" stroke-width="0.2" stroke-opacity="0.9" stroke-linecap="round"></path><path d="${fibers.crossing}" fill="none" stroke="${tones[1]}" stroke-width="0.16" stroke-opacity="0.6" stroke-linecap="round"></path>`)
    : '';
  return `<div class="${lift}" style="position: relative; width: ${w}px; height: ${h}px; flex-shrink: 0; ${style}">
${fringeDiv}<div style="position: absolute; inset: 0; background: ${color}; clip-path: path('${d}')">
${tex}
${rimSvg}
${inner}
</div>
${featherSvg}
</div>`;
}

/** Colors for torn fibers, from the sheet's own color: [sheet, its lighter fiber shade, a little lighter still]. */
function edgeTones(color, shades, dark) {
  return [color, shades[0], mix(shades[0], '#FFFFFF', dark ? 0.06 : 0.12)];
}

const cut = (w, h, r, seed, tilt = 0) => p(o.cutOutline(w, h, { radius: r, seed, tilt }));
function torn(w, h, seed) {
  const t = tornEdge(w, h, { radius: 4, seed, tilt: 0 });
  return { d: t.edge, fringe: t.fringe, fibers: t };
}
function mix(hex, toward, t) {
  const rgb = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const a = rgb(hex);
  const b = rgb(toward);
  return '#' + a.map((c, i) => Math.round(c + (b[i] - c) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
}

const label = (text, size = 13, weight = 700, color = INK) =>
  `<div style="font-size: ${size}px; font-weight: ${weight}; color: ${color}; line-height: 1.3">${text}</div>`;

function header(eyebrow, title, sub) {
  return `<div style="padding: 56px 64px 32px; display: flex; flex-direction: column; gap: 10px">
<div style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #9A4A2E">${eyebrow}</div>
<h1 style="margin: 0; font-size: 44px; font-weight: 900; letter-spacing: -0.01em; line-height: 1.05">${title}</h1>
<p style="margin: 0; font-size: 17px; color: ${MUTED}; max-width: 760px; line-height: 1.5">${sub}</p>
</div>`;
}

// A color shown twice: today's grain and the proposed fibers.
function pair({ name, color, nowColor = color, shades, dark, note }) {
  const S = 96;
  const seedA = `${name}-now`;
  const seedB = `${name}-new`;
  const txt = dark ? '#F1EFEA' : INK;
  const sub = dark ? '#AAA8A2' : MUTED;
  return `<div style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; gap: 14px">
<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start">
${piece({ w: S, h: S, color: nowColor, shades, texture: 'now', dark, d: cut(S, S, 8, seedA), seed: seedA })}
<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${sub}">Now</div>
</div>
<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start">
${piece({ w: S, h: S, color, shades, texture: 'new', dark, d: cut(S, S, 8, seedB), seed: seedB })}
<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${sub}">New</div>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 2px">
${label(name, 15, 700, txt)}
<div style="font-size: 12px; color: ${sub}; font-variant-numeric: tabular-nums; max-width: 206px; line-height: 1.4">${nowColor !== color ? `${nowColor} → <b style="color: ${txt}">${color}</b>` : color}${note ? `<br>${note}` : ''}</div>
</div>
</div>`;
}

function band(title, bg, dark, inner) {
  return `<div class="${dark ? 'on-dark' : ''}" style="margin: 0 64px; padding: 36px 40px 40px; background: ${bg}; display: flex; flex-direction: column; gap: 24px">
<div style="font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${dark ? '#AAA8A2' : MUTED}">${title}</div>
${inner}
</div>`;
}

// ---------- Board 1: the pack ----------
function packBoard() {
  const light = C.pack.filter((s) => s.mode === 'light');
  const dark = C.pack.filter((s) => s.mode === 'dark');
  const roles = { White: 'dial face, time boxes, sheets', Manila: 'page', Oatmeal: 'buttons, chips', Kraft: 'spare', 'Light Gray': 'spare', Charcoal: 'pieces, dark mode', Black: 'page, dark mode' };
  const row = (list, isDark) =>
    `<div style="display: flex; gap: 36px; flex-wrap: wrap">${list.map((s) => pair({ name: s.name, color: s.paper, nowColor: s.now, shades: s.shades, dark: isDark, note: roles[s.name] })).join('\n')}</div>`;
  const body = `${header('Paper pack', 'Neutral sheets: now and new', 'Every surface in the app is cut from one of these sheets. Left of each pair is today: its color and its grain of white and black specks. Right is the proposal: real construction-paper colors, with a faint felt and hair-thin fibers in a lighter and darker shade of the sheet’s own color. White is now a dull off-white and black a warm, faded charcoal, like the real sheets.')}
${band('Light mode · on the manila page', MANILA, false, row(light, false))}
<div style="height: 32px"></div>
${band('Dark mode · on the black page', BLACK, true, row(dark, true))}
<div style="padding: 28px 64px 0; font-size: 14px; color: ${MUTED}; max-width: 900px; line-height: 1.5">Real fibers are 1–3 mm long, about 6–18 points on a phone, and hair thin, so a few show as fine strands while the rest blend into felt. Strength follows the sheet’s lightness: pale sheets get gentler dark fibers and black sheets gentler light ones. Charcoal moves up a step so pieces still stand out on the lighter black page.</div>`;
  return page('Paper pack: neutral sheets', 1440, 1000, body);
}

// ---------- Board 5: references ----------
function refsBoard() {
  const black = C.pack.find((x) => x.name === 'Black');
  const white = C.pack.find((x) => x.name === 'White');
  const charcoal = C.pack.find((x) => x.name === 'Charcoal');
  const photo = (src, w, h, caption, credit) => `<figure style="margin: 0; width: ${w}px; display: flex; flex-direction: column; gap: 10px; flex-shrink: 0">
<img src="${src}" alt="" width="${w}" height="${h}" style="display: block; width: ${w}px; height: ${h}px; object-fit: cover">
<figcaption style="font-size: 14px; color: ${INK}; line-height: 1.45">${caption}<div style="font-size: 12px; color: ${MUTED}; margin-top: 4px">${credit}</div></figcaption>
</figure>`;
  const chip = (hex, name, dark) => `<div style="display: flex; flex-direction: column; gap: 6px"><div style="width: 120px; height: 56px; background: ${hex}"></div><div style="font-size: 12px; color: ${MUTED}; font-variant-numeric: tabular-nums"><b style="color: ${INK}">${name}</b> ${hex}</div></div>`;
  const body = `${header('Paper pack', 'References', 'Photos of real construction paper used to set the fibers and the black and white sheets. Photos are lit differently, so colors were judged by how each sheet compares with things next to it, not by sampling one pixel.')}
<div style="padding: 0 64px; display: flex; flex-direction: column; gap: 36px">
<div style="display: flex; gap: 32px">
${photo('/_blob/a6739f40b7484e60f1a8d12e795620d9', 400, 300, 'Fibers: up close the surface is felt with hair-thin strands on top, mostly a shade paler than the sheet, plus the odd dark fleck.', 'Quinn Dombrowski, CC BY-SA 2.0')}
${photo('/_blob/54ba92719885efe19b466b2382e6fedf', 400, 300, 'Fibers on a darker sheet: the strands show as fine pale lines; at the tear they stick out as a fringe.', 'Rachel Ford James, CC BY-NC-SA 2.0')}
${photo('/_blob/c59956c57b7439c787cb72cdd5fc35eb', 300, 300, 'A stack of sheets: the black (top) is a deep brownish gray and the white (near the bottom) is a dull, gray off-white, not paper-white.', 'Todd Van Hoosear, CC BY-SA 2.0')}
</div>
<div style="display: flex; gap: 32px">
${photo('/_blob/493c3665e8b7031f1528b1a30abb63e3', 400, 300, 'Black construction paper with black laser printing on it: the paper reads as a soft charcoal, several times lighter than the ink.', 'bjornmeansbear, CC BY-SA 2.0')}
${photo('/_blob/cdb448a176efe8d5bb76b6e1d37f8e20', 400, 300, 'Black construction paper next to white paper and black vinyl: faded and warm, with a brown cast.', '1lenore, CC BY 2.0')}
<div style="display: flex; flex-direction: column; gap: 18px; padding-top: 4px">
${label('What changed', 20, 900)}
<div style="display: flex; gap: 16px">${chip(white.now, 'White now', false)}${chip(white.paper, 'White new', false)}</div>
<div style="display: flex; gap: 16px">${chip(black.now, 'Black now', true)}${chip(black.paper, 'Black new', true)}</div>
<div style="display: flex; gap: 16px">${chip(charcoal.now, 'Charcoal now', true)}${chip(charcoal.paper, 'Charcoal new', true)}</div>
</div>
</div>
</div>`;
  return page('Paper pack: references', 1440, 1120, body);
}

// ---------- Board 6: torn edge, now and new ----------
function tornBoard() {
  const white = C.pack.find((x) => x.name === 'White');
  const charcoal = C.pack.find((x) => x.name === 'Charcoal');
  const red = C.timer[0];
  const cases = [
    { name: 'White on the manila page', sheet: white, bg: MANILA, dark: false, seed: 'tb-white' },
    { name: 'Red on the manila page', sheet: { paper: red.paper, shades: red.shades }, bg: MANILA, dark: false, seed: 'tb-red' },
    { name: 'Charcoal on the black page', sheet: charcoal, bg: BLACK, dark: true, seed: 'tb-dark' },
  ];
  const W = 240, H = 170, PAD = 24;
  const sheetAt = (c, style) => {
    const t = torn(W, H, c.seed);
    return piece({ w: W, h: H, color: c.sheet.paper, shades: c.sheet.shades, dark: c.dark, d: t.d, seed: c.seed, lift: 'lifted', fringe: { d: t.fringe, fibers: t.fibers, style, color: mix(c.sheet.paper, '#FFFFFF', c.dark ? 0.1 : 0.6) } });
  };
  const win = (c, style, scale, x, y, ww, hh) => `<div class="${c.dark ? 'on-dark' : ''}" style="position: relative; width: ${ww}px; height: ${hh}px; overflow: hidden; background: ${c.bg}; flex-shrink: 0">
<div style="position: absolute; left: 0; top: 0; transform-origin: 0 0; transform: scale(${scale}) translate(${-x}px, ${-y}px)"><div style="padding: ${PAD}px; background: ${c.bg}">${sheetAt(c, style)}</div></div>
</div>`;
  const cap = (t) => `<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}">${t}</div>`;
  const row = (c) => `<div style="display: flex; flex-direction: column; gap: 12px">
${label(c.name, 18, 900)}
<div style="display: flex; gap: 24px; align-items: flex-start">
<div style="display: flex; flex-direction: column; gap: 8px">${win(c, 'now', 5, 196, 150, 360, 240)}${cap('Now · 5× close-up')}</div>
<div style="display: flex; flex-direction: column; gap: 8px">${win(c, 'new', 5, 196, 150, 360, 240)}${cap('New · 5× close-up')}</div>
<div style="display: flex; flex-direction: column; gap: 8px">${win(c, 'new', 1, 0, 0, 288, 218)}${cap('New · actual size')}</div>
</div>
</div>`;
  const notes = ['No solid shapes at the edge: the exposed band is a dense mat of short fibers, thickest against the color and thinning outward, so the fibers themselves make the outer edge.',
    'Fibers lie at all angles, about a third of them along the tear, so it reads as felt rather than a fringe.',
    'Fibers reach out of the sheet and lie across its edge, so it has no hard line anywhere.',
    'The band stays tight, up to about 3 points, widening a little where the tear ran at an angle.',
    'Every fiber is the sheet’s own color: the sheet color, its lighter fiber shade from the grain, and a touch lighter at the tips.'];
  const body = `${header('Paper pack', 'Torn edge: now and new', 'Now, the torn edge is one flat pale shape behind the sheet. New is made entirely of fibers, like the tear in the reference photos.')}
<div style="padding: 0 64px; display: flex; gap: 48px">
<div style="display: flex; flex-direction: column; gap: 32px">${cases.map(row).join('\n')}</div>
<ul style="margin: 0; padding: 4px 0 0 18px; display: flex; flex-direction: column; gap: 10px; font-size: 14px; color: ${MUTED}; line-height: 1.45; max-width: 300px">${notes.map((n) => `<li>${n}</li>`).join('')}</ul>
</div>`;
  return page('Paper pack: torn edge', 1440, 1240, body);
}

// ---------- Option C, updated: the torn sheet from pre-drawn pictures ----------
// C's technique (pictures drawn ahead of time, sliced to fit, the middle of each side repeating
// one 120pt tear) with what we learned on A: an edge made entirely of fibers, every layer tinted
// from the sheet's own colors, the new fiber grain and the lifted shadow. Sprite: 264pt
// (36pt shadow room, 36pt corners, one 120pt period); see c2/gen_torn.py.
const C_SPRITE = { size: 264, pad: 36, a: 72 };
function cSpans(total) {
  const { size, a } = C_SPRITE;
  const mid = total - 2 * a;
  const srcMid = size - 2 * a;
  const out = [{ s0: 0, s1: a, d0: 0, d1: a, middle: false }];
  const n = Math.max(1, Math.round(mid / srcMid));
  for (let i = 0; i < n; i++) out.push({ s0: a, s1: size - a, d0: a + (mid * i) / n, d1: a + (mid * (i + 1)) / n, middle: true });
  out.push({ s0: size - a, s1: size, d0: total - a, d1: total, middle: false });
  return out;
}
function cPiece({ w, h, color, shades, dark, seed = 'c' }) {
  const { size, pad } = C_SPRITE;
  const artW = w + 2 * pad;
  const artH = h + 2 * pad;
  const cells = cSpans(artH).flatMap((y) => cSpans(artW).map((x) => ({ x, y })));
  const tones = edgeTones(color, shades, dark);
  // kind: 'shadow' (an image) or a tinted mask layer: 'mask' | 'f0' | 'f1' | 'f2'.
  const layer = (kind, tint) =>
    cells
      .map(({ x, y }) => {
        const center = x.middle && y.middle;
        const box = `left: ${x.d0}px; top: ${y.d0}px; width: ${x.d1 - x.d0}px; height: ${y.d1 - y.d0}px`;
        if (center && kind !== 'mask') return '';
        if (center) return `<div style="position: absolute; ${box}; background: ${tint}"></div>`;
        const kx = (x.d1 - x.d0) / (x.s1 - x.s0);
        const ky = (y.d1 - y.d0) / (y.s1 - y.s0);
        const img = `position: absolute; left: ${-x.s0 * kx}px; top: ${-y.s0 * ky}px; width: ${size * kx}px; height: ${size * ky}px`;
        return `<div style="position: absolute; ${box}; overflow: hidden"><div class="c2-${kind}" style="${img}${tint ? `; background-color: ${tint}` : ''}"></div></div>`;
      })
      .join('');
  const frame = `position: absolute; left: ${-pad}px; top: ${-pad}px; width: ${artW}px; height: ${artH}px`;
  // An image can't clip another image without an extra native module, so the grain stops
  // just inside the deepest point of the tear, as in C's original.
  const inset = 3.5;
  return `<div style="position: relative; width: ${w}px; height: ${h}px; flex-shrink: 0">
<div style="${frame}; opacity: ${dark ? 1 : 0.35}">${layer('shadow')}</div>
<div style="${frame}">${layer('mask', color)}</div>
<div style="position: absolute; left: ${inset}px; top: ${inset}px; width: ${w - 2 * inset}px; height: ${h - 2 * inset}px; border-radius: 3px; overflow: hidden">
<div class="tex fl" style="background: ${shades[0]}; -webkit-mask-position: ${offset(seed)}; mask-position: ${offset(seed)}"></div>
<div class="tex fd" style="background: ${shades[1]}; -webkit-mask-position: ${offset(seed + 'd')}; mask-position: ${offset(seed + 'd')}"></div>
</div>
<div style="${frame}">${layer('f0', tones[0])}${layer('f1', tones[1])}${layer('f2', tones[2])}</div>
</div>`;
}

// ---------- Board 7: torn edge, option C vs option A ----------
function cVsABoard() {
  const white = C.pack.find((x) => x.name === 'White');
  const charcoal = C.pack.find((x) => x.name === 'Charcoal');
  const red = C.timer[0];
  const cases = [
    { name: 'White on the manila page', sheet: white, bg: MANILA, dark: false, seed: 'ca-white' },
    { name: 'Red on the manila page', sheet: { paper: red.paper, shades: red.shades }, bg: MANILA, dark: false, seed: 'ca-red' },
    { name: 'Charcoal on the black page', sheet: charcoal, bg: BLACK, dark: true, seed: 'ca-dark' },
  ];
  const PAD = 24;
  const aSheet = (c, w, h) => {
    const t = torn(w, h, c.seed + w);
    return piece({ w, h, color: c.sheet.paper, shades: c.sheet.shades, dark: c.dark, d: t.d, seed: c.seed, lift: 'lifted', fringe: { d: t.fringe, fibers: t.fibers, color: '' } });
  };
  const cSheet = (c, w, h) => kitPiece({ kind: 'torn', w, h, color: c.sheet.paper, shades: c.sheet.shades, dark: c.dark, seed: c.seed });
  const win = (c, sheet, scale, x, y, ww, hh) => `<div class="${c.dark ? 'on-dark' : ''}" style="position: relative; width: ${ww}px; height: ${hh}px; overflow: hidden; background: ${c.bg}; flex-shrink: 0">
<div style="position: absolute; left: 0; top: 0; transform-origin: 0 0; transform: scale(${scale}) translate(${-x}px, ${-y}px)"><div style="padding: ${PAD}px; background: ${c.bg}">${sheet}</div></div>
</div>`;
  const cap = (t) => `<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}">${t}</div>`;
  const cell = (inner, t) => `<div style="display: flex; flex-direction: column; gap: 8px">${inner}${cap(t)}</div>`;
  const row = (c) => `<div style="display: flex; flex-direction: column; gap: 12px">
${label(c.name, 18, 900)}
<div style="display: flex; gap: 20px; align-items: flex-start">
${cell(win(c, cSheet(c, 240, 170), 5, 212, 168, 300, 220), 'C · 5× close-up')}
${cell(win(c, aSheet(c, 240, 170), 5, 212, 168, 300, 220), 'A · 5× close-up')}
${cell(win(c, cSheet(c, 240, 170), 1, 0, 0, 288, 218), 'C · actual size')}
${cell(win(c, aSheet(c, 240, 170), 1, 0, 0, 288, 218), 'A · actual size')}
</div>
</div>`;
  // A phone-width sheet, where C's tear repeats.
  const long = cases[0];
  const longRow = `<div style="display: flex; flex-direction: column; gap: 12px">
${label('A phone-width sheet (360 points)', 18, 900)}
<div style="font-size: 14px; color: ${MUTED}; max-width: 900px; line-height: 1.45">C fills each side from its kit of torn pictures, so nothing is stretched more than 20%. On a sheet this wide each long side is two copies of the same 180-point piece, and every sheet that uses that piece tears the same way. A’s tear is new on every sheet.</div>
<div style="display: flex; gap: 20px">
${cell(win(long, cSheet(long, 360, 120), 1, 0, 0, 408, 168), 'C · actual size')}
${cell(win(long, aSheet(long, 360, 120), 1, 0, 0, 408, 168), 'A · actual size')}
${cell(win(long, cSheet(long, 360, 120), 2, 10, 90, 300, 168), 'C · 2×, bottom edge')}
</div>
</div>`;
  const notes = [
    ['How it’s made', 'C: a kit of torn pictures in six lengths (the sheet, three fiber layers, the shadow), tinted to the sheet’s colors and fitted without stretching any edge more than 20%. A: fibers drawn by the app from each sheet’s own torn outline.'],
    ['Edge color', 'Both: fibers in the sheet’s own color, its lighter fiber shade from the grain, and a slightly lighter shade at the tips.'],
    ['Repeats', 'C: sheets that use the same kit pieces tear the same way, and long sides repeat a piece. A: every sheet tears differently.'],
    ['Sharpness and grain', 'C: drawn at 3 pixels per point, so it softens up close, and its grain stops about 3 points inside the tear. A: sharp at any size, grain right to the edge.'],
    ['Cost', 'C: about 530 KB for the torn kit and 40-plus image slices per sheet, cheap to draw. A: no pictures, but thousands of tiny strokes, so it needs measuring on a phone.'],
  ];
  const body = `${header('Paper pack', 'Torn edge: option C vs option A', 'The same sheets, colors and sizes, torn two ways. C is the pre-drawn picture approach from the first round, rebuilt with everything we learned on A: an edge made entirely of fibers in the sheet’s own colors, the new grain and the lifted shadow. A draws the same kind of edge live.')}
<div style="padding: 0 64px 32px; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 28px">${notes.map(([t, d]) => `<div style="font-size: 13px; color: ${MUTED}; line-height: 1.45"><b style="color: ${INK}; display: block; margin-bottom: 4px; font-size: 14px">${t}</b>${d}</div>`).join('')}</div>
<div style="padding: 0 64px; display: flex; flex-direction: column; gap: 30px">${cases.map(row).join('\n')}${longRow}</div>`;
  return page('Paper pack: torn edge, C vs A', 1440, 1700, body);
}

// ---------- Option C, updated: scissor-cut pieces from pre-drawn pictures ----------
// Rect: a 120pt sheet (12pt corners) 9-sliced 16pt in from each side, middles stretched. Circle: one of three 72pt cuts,
// drawn whole. Each piece: a baked shadow for its lift, the tinted sheet, the grain (clipped just
// inside the cut), and the rim. See c2/gen_cut.py.
function cCut({ shape, w, h, color, shades, dark, level, seed, variant = 0 }) {
  const pad = 36;
  const box = shape === 'rect' ? 120 : 72;
  const name = shape === 'rect' ? 'rect2' : `circle2-${variant % 3}`;
  const shadowName = `${shape === 'rect' ? 'rect2' : 'circle2-0'}-shadow-${level}-${dark ? 'dark' : 'light'}`;
  const SW = box + 2 * pad;
  const artW = w + 2 * pad;
  const artH = h + 2 * pad;
  const a = pad + 16; // just past the 12pt corner, so short pieces squeeze as little of the cut as possible
  const spans = (total) => [
    { s0: 0, s1: a, d0: 0, d1: a },
    { s0: a, s1: SW - a, d0: a, d1: total - a },
    { s0: SW - a, s1: SW, d0: total - a, d1: total },
  ];
  const layer = (asset, tint, opacity = 1) => {
    if (shape !== 'rect') return `<div class="k-${asset}" style="position: absolute; inset: 0; background: ${tint}; opacity: ${opacity}"></div>`;
    return spans(artH)
      .flatMap((y) => spans(artW).map((x) => ({ x, y })))
      .map(({ x, y }) => {
        const kx = (x.d1 - x.d0) / (x.s1 - x.s0);
        const ky = (y.d1 - y.d0) / (y.s1 - y.s0);
        return `<div style="position: absolute; left: ${x.d0}px; top: ${y.d0}px; width: ${x.d1 - x.d0}px; height: ${y.d1 - y.d0}px; overflow: hidden"><div class="k-${asset}" style="position: absolute; left: ${-x.s0 * kx}px; top: ${-y.s0 * ky}px; width: ${SW * kx}px; height: ${SW * ky}px; background: ${tint}; opacity: ${opacity}"></div></div>`;
      })
      .join('');
  };
  const frame = `position: absolute; left: ${-pad}px; top: ${-pad}px; width: ${artW}px; height: ${artH}px`;
  const inset = 0.8;
  const radius = shape === 'rect' ? 12 - inset : w / 2 - inset;
  return `<div style="position: relative; width: ${w}px; height: ${h}px; flex-shrink: 0">
<div style="${frame}">${layer(shadowName, dark ? '#000000' : 'rgb(43, 30, 15)')}</div>
<div style="${frame}">${layer(`${name}-mask`, color)}</div>
<div style="position: absolute; left: ${inset}px; top: ${inset}px; width: ${w - 2 * inset}px; height: ${h - 2 * inset}px; border-radius: ${radius}px; overflow: hidden">
<div class="tex fl" style="background: ${shades[0]}; -webkit-mask-position: ${offset(seed)}; mask-position: ${offset(seed)}"></div>
<div class="tex fd" style="background: ${shades[1]}; -webkit-mask-position: ${offset(seed + 'd')}; mask-position: ${offset(seed + 'd')}"></div>
</div>
<div style="${frame}">${layer(`${name}-rim`, '#FFFFFF', dark ? 0.14 : 0.32)}</div>
</div>`;
}

// ---------- Option C, v3: edges from a kit of pictures in several lengths ----------
// No edge is stretched or squeezed by more than 20%: each side's middle is filled with the
// picture whose middle is nearest in length (several end to end on long sides). Corners stay 1:1.
// Circles come in a ladder of sizes and use the nearest. See c2/gen_kits.py.
const MAX_STRETCH = 1.2;
function planAxis(M, sizes) {
  if (M <= 0.5) return { s: sizes[0], n: 0, scale: 1 };
  let best = null;
  for (let n = 1; n <= 8 && !best; n++) {
    for (const s of sizes) {
      const scale = M / (n * s);
      if (scale >= 1 / MAX_STRETCH - 1e-9 && scale <= MAX_STRETCH + 1e-9 && (!best || Math.abs(Math.log(scale)) < Math.abs(Math.log(best.scale)))) best = { s, n, scale };
    }
  }
  return best ?? { s: sizes[0], n: 1, scale: M / sizes[0] };
}
function kitPiece({ kind, w, h, color, shades, dark, level = 'lifted', seed, variant = 0 }) {
  const pad = KITS.pad;
  const mode = dark ? 'dark' : 'light';
  const shadowTint = dark ? '#000000' : 'rgb(43, 30, 15)';
  const use = (n) => (KIT_USED.add(n), KIT_ALL_USED.add(n), n);
  const grain = (inset, radius) => `<div style="position: absolute; left: ${inset}px; top: ${inset}px; width: ${w - 2 * inset}px; height: ${h - 2 * inset}px; border-radius: ${radius}px; overflow: hidden">
<div class="tex fl" style="background: ${shades[0]}; -webkit-mask-position: ${offset(seed)}; mask-position: ${offset(seed)}"></div>
<div class="tex fd" style="background: ${shades[1]}; -webkit-mask-position: ${offset(seed + 'd')}; mask-position: ${offset(seed + 'd')}"></div>
</div>`;
  if (kind === 'circle') {
    const sizes = KITS.circle.sizes;
    const s = sizes.reduce((b, x) => (Math.abs(Math.log(w / x)) < Math.abs(Math.log(w / b)) ? x : b));
    const k = w / s;
    const v = variant % KITS.circle.variants;
    const frame = `position: absolute; left: ${-pad * k}px; top: ${-pad * k}px; width: ${(s + 2 * pad) * k}px; height: ${(s + 2 * pad) * k}px`;
    const lay = (n, tint, op = 1) => `<div class="q-${use(n)}" style="${frame}; background: ${tint}; opacity: ${op}"></div>`;
    return `<div style="position: relative; width: ${w}px; height: ${h}px; flex-shrink: 0" title="circle ${s}pt ×${k.toFixed(2)}">
${lay(`circle-${s}-shadow-${level}-${mode}`, shadowTint)}${lay(`circle-${s}-${v}-mask`, color)}
${grain(0.8, w / 2 - 0.8)}
${lay(`circle-${s}-${v}-rim`, '#FFFFFF', dark ? 0.14 : 0.32)}
</div>`;
  }
  const kit = KITS[kind];
  const c = kit.c;
  const a = pad + c;
  const plan = (L) => {
    const p = planAxis(L - 2 * c, kit.sizes);
    const cells = [{ part: 'start', d0: 0, d1: a }];
    for (let i = 0; i < p.n; i++) cells.push({ part: 'mid', d0: a + i * p.s * p.scale, d1: a + (i + 1) * p.s * p.scale, s: p.s });
    cells.push({ part: 'end', d0: a + p.n * p.s * p.scale, d1: 2 * a + p.n * p.s * p.scale });
    return { ...p, cells };
  };
  const px = plan(w);
  const py = plan(h);
  // Source rectangle (in sprite points) for one cell along one axis, from sprite size s.
  const src = (cell, s) => {
    const S = 2 * c + s + 2 * pad;
    return cell.part === 'start' ? [0, a] : cell.part === 'end' ? [S - a, S] : [a, a + s];
  };
  const layer = (suffix, tint, op = 1, solidCenter = false) =>
    py.cells
      .flatMap((cy, j) =>
        px.cells.map((cx, i) => {
          const center = cx.part === 'mid' && cy.part === 'mid';
          const box = `left: ${cx.d0}px; top: ${cy.d0}px; width: ${cx.d1 - cx.d0 + (solidCenter && i < px.cells.length - 1 ? 0.4 : 0)}px; height: ${cy.d1 - cy.d0 + (solidCenter && j < py.cells.length - 1 ? 0.4 : 0)}px`;
          if (center) return solidCenter ? `<div style="position: absolute; ${box}; background: ${tint}"></div>` : '';
          // Edge cells come from the sprite chosen for their run; corners from the horizontal plan's sprite.
          const s = cx.part === 'mid' ? cx.s : cy.part === 'mid' ? cy.s : px.s;
          const S = 2 * c + s + 2 * pad;
          const [sx0, sx1] = src(cx, s);
          const [sy0, sy1] = src(cy, s);
          const kx = (cx.d1 - cx.d0) / (sx1 - sx0);
          const ky = (cy.d1 - cy.d0) / (sy1 - sy0);
          return `<div style="position: absolute; ${box}; overflow: hidden"><div class="q-${use(`${kind}-${s}-${suffix}`)}" style="position: absolute; left: ${-sx0 * kx}px; top: ${-sy0 * ky}px; width: ${S * kx}px; height: ${S * ky}px; background: ${tint}; opacity: ${op}"></div></div>`;
        }),
      )
      .join('');
  const frame = `position: absolute; left: ${-pad}px; top: ${-pad}px; width: ${w + 2 * pad}px; height: ${h + 2 * pad}px`;
  const note = `${kind}: sides ${px.n}×${px.s}pt ×${px.scale.toFixed(2)}, ${py.n}×${py.s}pt ×${py.scale.toFixed(2)}`;
  if (kind === 'torn') {
    const tones = edgeTones(color, shades, dark);
    return `<div style="position: relative; width: ${w}px; height: ${h}px; flex-shrink: 0" title="${note}">
<div style="${frame}">${layer(`shadow-lifted-${mode}`, shadowTint)}</div>
<div style="${frame}">${layer('mask', color, 1, true)}</div>
${grain(3.5, 3)}
<div style="${frame}">${layer('f0', tones[0])}${layer('f1', tones[1])}${layer('f2', tones[2])}</div>
</div>`;
  }
  return `<div style="position: relative; width: ${w}px; height: ${h}px; flex-shrink: 0" title="${note}">
<div style="${frame}">${layer(`shadow-${level}-${mode}`, shadowTint)}</div>
<div style="${frame}">${layer('mask', color, 1, true)}</div>
${grain(0.8, kit.r - 0.8)}
<div style="${frame}">${layer('rim', '#FFFFFF', dark ? 0.14 : 0.32)}</div>
</div>`;
}

// ---------- Boards 8 and 9: A vs C, every kind of piece, light and dark ----------
function compareBoard(dark) {
  const find = (n) => C.pack.find((x) => x.name === n) ?? C.timer.find((x) => x.name === n);
  const sheets = (dark ? ['Charcoal', 'Red', 'Blue'] : ['White', 'Oatmeal', 'Red', 'Blue']).map((n) => ({ name: n, ...find(n) }));
  const bg = dark ? BLACK : MANILA;
  const txt = dark ? '#F1EFEA' : INK;
  const rows = [
    { title: 'Scissor-cut rectangle', sub: 'glued to the page', shape: 'rect', level: 'glued' },
    { title: 'Scissor-cut rectangle', sub: 'sitting on top of the page', shape: 'rect', level: 'raised' },
    { title: 'Scissor-cut rectangle', sub: 'floating above the page', shape: 'rect', level: 'lifted' },
    { title: 'Torn rectangle', sub: 'floating above the page', shape: 'torn', level: 'lifted' },
    { title: 'Scissor-cut circle', sub: 'glued to the page', shape: 'circle', level: 'glued' },
    { title: 'Scissor-cut circle', sub: 'sitting on top of the page', shape: 'circle', level: 'raised' },
    { title: 'Scissor-cut circle', sub: 'floating above the page', shape: 'circle', level: 'lifted' },
  ];
  const size = { rect: [110, 64], circle: [72, 72], torn: [130, 90] };
  const aPiece = (row, s, i) => {
    const [w, h] = size[row.shape];
    const seed = `cmp-${row.shape}-${row.level}-${s.name}-${dark ? 'd' : 'l'}`;
    if (row.shape === 'torn') {
      const t = torn(w, h, seed);
      return piece({ w, h, color: s.paper, shades: s.shades, dark, d: t.d, seed, lift: 'lifted', fringe: { d: t.fringe, fibers: t.fibers, color: '' } });
    }
    return piece({ w, h, color: s.paper, shades: s.shades, dark, d: cut(w, h, row.shape === 'rect' ? 12 : w / 2, seed), seed, lift: row.level, rim: true });
  };
  const cPieceFor = (row, s, i) => {
    const [w, h] = size[row.shape];
    const seed = `cmpc-${row.shape}-${s.name}-${i}`;
    return kitPiece({ kind: row.shape, w, h, color: s.paper, shades: s.shades, dark, level: row.level, seed, variant: i });
  };
  const cell = (pieces) => `<div class="${dark ? 'on-dark' : ''}" style="flex: 1 1 0; min-width: 0; height: 170px; box-sizing: border-box; background: ${bg}; display: flex; gap: 24px; align-items: center; justify-content: center; padding: 0 20px">${pieces}</div>`;
  const rowHtml = (row) => `<div style="display: flex; flex-direction: column; gap: 10px">
<div style="font-size: 16px; color: ${MUTED}"><b style="color: ${INK}; font-weight: 900">${row.title}</b> · ${row.sub}</div>
<div style="display: flex; gap: 32px">
${cell(sheets.map((s, i) => aPiece(row, s, i)).join(''))}
${cell(sheets.map((s, i) => cPieceFor(row, s, i)).join(''))}
</div>
</div>`;
  const colHead = (t, d) => `<div style="flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 4px">${label(t, 22, 900)}<div style="font-size: 14px; color: ${MUTED}; line-height: 1.45">${d}</div></div>`;
  const mode = dark ? 'Dark mode' : 'Light mode';
  const body = `${header('Paper pack', `A vs C · ${mode.toLowerCase()}`, `Every kind of piece on the ${dark ? 'black' : 'manila'} page, drawn both ways. Sheets: ${sheets.map((s) => s.name.toLowerCase()).join(', ')}. Same colors, grain, edges and shadows; only the technique differs.`)}
<div style="padding: 0 64px; display: flex; flex-direction: column; gap: 26px">
<div style="display: flex; gap: 32px">
${colHead('A · drawn by the app', 'Every piece gets its own hand-cut or torn outline, drawn as vector shapes. Sharp at any size.')}
${colHead('C · pre-drawn pictures', 'Edges from a kit of pictures in several lengths, so no edge is stretched or squeezed more than 20%; circles from a ladder of sizes. Drawn ahead of time and tinted; shadows baked per lift.')}
</div>
${rows.map(rowHtml).join('\n')}
</div>`;
  return page(`Paper pack: A vs C, ${mode.toLowerCase()}`, 1440, 1900, body);
}

// ---------- Board 2: timer colors ----------
function timerBoard() {
  const cells = C.timer.map((t) => pair({ name: t.name, color: t.paper, shades: t.shades, dark: false, note: `screen ${t.screen}` })).join('\n');
  const body = `${header('Paper pack', 'Timer colors: now and new', 'The 20 timer colors as dyed construction paper (a touch less saturated and warmer than the screen color). Now uses today’s grain; New uses fibers in a lighter and darker shade of each color, so red stays red instead of turning pink and speckled.')}
${band('On the manila page', MANILA, false, `<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 36px 24px">${cells}</div>`)}`;
  return page('Paper pack: timer colors', 1440, 1180, body);
}

// ---------- Board 3: edges ----------
function edgesBoard() {
  const red = C.timer[0];
  const white = C.pack.find((s) => s.name === 'White');
  const charcoal = C.pack.find((s) => s.name === 'Charcoal');
  const oat = C.pack.find((s) => s.name === 'Oatmeal');

  const cutPill = cut(300, 72, 36, 'edge-start');
  const cutCircle = cut(96, 96, 48, 'edge-sound');
  const tornSheet = torn(300, 220, 'edge-sheet');
  const tornDark = torn(300, 220, 'edge-sheet-dark');

  // A close-up: the same piece scaled 4x inside a window.
  const zoom = (inner, x, y, bg, dark) =>
    `<div class="${dark ? 'on-dark' : ''}" style="position: relative; width: 300px; height: 220px; overflow: hidden; background: ${bg}; flex-shrink: 0">
<div style="position: absolute; left: 0; top: 0; transform-origin: 0 0; transform: scale(4) translate(${-x}px, ${-y}px)">${inner}</div>
</div>`;

  const startPiece = piece({ w: 300, h: 72, color: red.paper, shades: red.shades, d: cutPill, seed: 'edge-start', lift: 'raised', rim: true });
  const soundPiece = piece({ w: 96, h: 96, color: oat.paper, shades: oat.shades, d: cutCircle, seed: 'edge-sound', lift: 'raised', rim: true });
  const sheetPiece = piece({ w: 300, h: 220, color: white.paper, shades: white.shades, d: tornSheet.d, seed: 'edge-sheet', lift: 'lifted', fringe: { d: tornSheet.fringe, fibers: tornSheet.fibers, color: mix(white.paper, '#FFFFFF', 0.6) } });
  const darkPiece = piece({ w: 300, h: 220, color: charcoal.paper, shades: charcoal.shades, dark: true, d: tornDark.d, seed: 'edge-sheet-dark', lift: 'lifted', fringe: { d: tornDark.fringe, fibers: tornDark.fibers, color: mix(charcoal.paper, '#FFFFFF', 0.1) } });

  const anatomy = (items) =>
    `<ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: ${MUTED}; line-height: 1.45">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

  const column = (title, sub, actual, zoomed, notes) => `<div style="flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 20px">
<div style="display: flex; flex-direction: column; gap: 6px">${label(title, 24, 900)}<div style="font-size: 15px; color: ${MUTED}; line-height: 1.5">${sub}</div></div>
<div style="display: flex; gap: 24px; align-items: flex-start">
<div style="display: flex; flex-direction: column; gap: 8px">${actual}<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}">Actual size</div></div>
<div style="display: flex; flex-direction: column; gap: 8px">${zoomed}<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}">4× close-up</div></div>
</div>
${notes}
</div>`;

  const startSmall = piece({ w: 240, h: 64, color: red.paper, shades: red.shades, d: cut(240, 64, 32, 'edge-start-s'), seed: 'edge-start-s', lift: 'raised', rim: true });
  const cutActual = `<div style="width: 300px; height: 220px; background: ${MANILA}; display: flex; flex-direction: column; gap: 24px; align-items: center; justify-content: center">${soundPiece}${startSmall}</div>`;
  const cutZoom = zoom(`<div style="padding: 20px; background: ${MANILA}; width: 340px">${startPiece}</div>`, 240, 6, MANILA, false);
  const tS = torn(240, 170, 'edge-sheet-s');
  const tD = torn(240, 170, 'edge-sheet-ds');
  const sheetSmall = piece({ w: 240, h: 170, color: white.paper, shades: white.shades, d: tS.d, seed: 'edge-sheet-s', lift: 'lifted', fringe: { d: tS.fringe, fibers: tS.fibers, color: mix(white.paper, '#FFFFFF', 0.6) } });
  const darkSmall = piece({ w: 240, h: 170, color: charcoal.paper, shades: charcoal.shades, dark: true, d: tD.d, seed: 'edge-sheet-ds', lift: 'lifted', fringe: { d: tD.fringe, fibers: tD.fibers, color: mix(charcoal.paper, '#FFFFFF', 0.1) } });
  const tornActual = `<div style="display: flex; flex-direction: column; gap: 16px"><div style="width: 300px; height: 220px; background: ${MANILA}; display: flex; align-items: center; justify-content: center">${sheetSmall}</div><div class="on-dark" style="width: 300px; height: 220px; background: ${BLACK}; display: flex; align-items: center; justify-content: center">${darkSmall}</div></div>`;
  const tornZoom = `<div style="display: flex; flex-direction: column; gap: 16px">${zoom(`<div style="padding: 20px; background: ${MANILA}">${sheetPiece}</div>`, 250, 195, MANILA, false)}${zoom(`<div class="on-dark" style="padding: 20px; background: ${BLACK}">${darkPiece}</div>`, 250, 195, BLACK, true)}</div>`;

  const body = `${header('Paper pack', 'Edges', 'Small pieces are cut with scissors. Large panels are torn by hand. Both use the new grain.')}
<div style="padding: 0 64px; display: flex; gap: 64px">
${column('Cut edge', 'Buttons, chips, swatches, the dial and its wedge.', cutActual, cutZoom, anatomy([
    'A smooth curve that wanders a fraction of a point, never a perfect circle or straight line.',
    'One to four tiny steps where the scissors stopped and restarted.',
    'A hairline of paler fibers just inside the cut; the grain stops dead at the edge.',
  ]))}
${column('Torn edge', 'Settings, history and picker panels.', tornActual, tornZoom, anatomy([
    'A ragged line that drifts slowly, with fine ripples along it.',
    'Torn fibers in the sheet’s own color and its lighter fiber shade, fuzzy at the outer edge, with a few loose wisps.',
    'The edge matches the sheet: red tears red, black tears black.',
  ]))}
</div>`;
  return page('Paper pack: edges', 1440, 900, body);
}

// ---------- Board 4: layering ----------
function layeringBoard() {
  const red = C.timer[0];
  const white = C.pack.find((s) => s.name === 'White');
  const oat = C.pack.find((s) => s.name === 'Oatmeal');
  const charcoal = C.pack.find((s) => s.name === 'Charcoal');

  // Side view: sheets as thin strips.
  const strip = (w, color, extra = '') => `<div style="width: ${w}px; height: 6px; background: ${color}; ${extra}"></div>`;
  const sideView = (title, desc, uses, stack) => `<div style="display: flex; gap: 32px; align-items: center">
<div style="width: 360px; height: 120px; background: #CFCAC0; position: relative; flex-shrink: 0; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 28px; box-sizing: border-box">${stack}</div>
<div style="display: flex; flex-direction: column; gap: 6px; max-width: 420px">${label(title, 20, 900)}<div style="font-size: 15px; color: ${MUTED}; line-height: 1.5">${desc}</div><div style="font-size: 13px; color: ${INK}; line-height: 1.5"><b>Used for:</b> ${uses}</div></div>
</div>`;
  const page0 = (inner) => `<div style="position: relative; width: 300px; display: flex; flex-direction: column; align-items: center">${inner}${strip(300, MANILA)}</div>`;
  const gluedStack = page0(`<div style="display: flex; flex-direction: column; align-items: center">${strip(120, red.paper)}${strip(200, white.paper, 'box-shadow: 0 0.5px 0.5px rgba(43,30,15,.3)')}</div>`);
  const raisedStack = page0(`<div style="display: flex; flex-direction: column; align-items: center"><div style="width: 120px; height: 6px; background: ${oat.paper}; margin-bottom: 6px; box-shadow: 0 3px 5px rgba(43,30,15,.22)"></div></div>`);
  const liftedStack = page0(`<div style="display: flex; flex-direction: column; align-items: center"><div style="width: 220px; height: 6px; background: ${white.paper}; margin-bottom: 18px; box-shadow: 0 10px 14px rgba(43,30,15,.25)"></div></div>`);

  // Top view examples.
  const c = 110;
  const faceR = c - 3;
  const faceD = p(o.cutCircle(c, c, faceR, o.circleCut(faceR, 'lay-face')));
  const wedgeD = o.cutRingPath(c, c, 0, c * 0.8, 0.7, o.circleCut(c * 0.8, 'lay-wedge'), o.circleCut(1, 'x'));
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const major = i % 5 === 0;
    const a = (i / 60) * 2 * Math.PI;
    const r1 = c * (major ? 0.84 : 0.87);
    const r2 = c * 0.93;
    const pt = (r) => [c + r * Math.sin(a), c - r * Math.cos(a)].map((v) => v.toFixed(1));
    const [x1, y1] = pt(r1);
    const [x2, y2] = pt(r2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-opacity="${major ? 0.7 : 0.25}" stroke-width="${major ? 2 : 1}"></line>`;
  }).join('');
  const dial = (dark) => {
    const face = dark ? charcoal : white;
    const wedge = piece({ w: 2 * c, h: 2 * c, color: red.paper, shades: red.shades, dark, d: wedgeD, seed: 'lay-wedge', lift: 'glued', rim: true });
    return piece({
      w: 2 * c, h: 2 * c, color: face.paper, shades: face.shades, dark, d: faceD, seed: 'lay-face', lift: 'glued', rim: true,
      inner: `<svg aria-hidden="true" width="${2 * c}" height="${2 * c}" viewBox="0 0 ${2 * c} ${2 * c}" style="position: absolute; left: 0; top: 0">${dark ? ticks.replaceAll(INK, '#F1EFEA') : ticks}</svg><div style="position: absolute; left: 0; top: 0">${wedge}</div>`,
    });
  };
  const chip = (text, color, shades, dark, seed, txt) =>
    piece({ w: 64, h: 40, color, shades, dark, d: cut(64, 40, 20, seed), seed, lift: 'raised', rim: true, inner: `<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: ${txt}">${text}</div>` });
  const circleBtn = (color, shades, dark, seed, glyph) =>
    piece({ w: 64, h: 64, color, shades, dark, d: cut(64, 64, 32, seed), seed, lift: 'raised', rim: true, inner: `<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center">${glyph}</div>` });
  const speaker = (stroke) => `<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"></path><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M19 5a10 10 0 0 1 0 14"></path></svg>`;
  const play = `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M7 4.5v15l12-7.5z"></path></svg>`;

  const scene = (dark) => {
    const bg = dark ? BLACK : MANILA;
    const pieceSheet = dark ? charcoal : oat;
    const txt = dark ? '#F1EFEA' : INK;
    const panel = torn(250, 150, dark ? 'lay-panel-d' : 'lay-panel');
    const panelColor = dark ? charcoal : white;
    const swatch = (col, i) => piece({ w: 40, h: 40, color: col.paper, shades: col.shades, dark, d: cut(40, 40, 20, `lay-sw-${i}`), seed: `lay-sw-${i}`, lift: 'raised' });
    const panelInner = `<div style="position: absolute; inset: 0; padding: 22px 24px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px"><div style="font-size: 13px; font-weight: 700; color: ${txt}">Color</div><div style="display: flex; gap: 12px">${[0, 2, 6, 11].map((k, i) => swatch(C.timer[k], i)).join('')}</div><div style="display: flex; gap: 12px">${[13, 3, 8, 16].map((k, i) => swatch(C.timer[k], i + 4)).join('')}</div></div>`;
    return `<div class="${dark ? 'on-dark' : ''}" style="width: 600px; height: 380px; background: ${bg}; position: relative; flex-shrink: 0">
<div style="position: absolute; left: 32px; top: 30px">${dial(dark)}</div>
<div style="position: absolute; left: 290px; top: 40px; display: flex; gap: 10px">${chip('1m', pieceSheet.paper, pieceSheet.shades, dark, 'lay-c1', txt)}${chip('5m', red.paper, red.shades, dark, 'lay-c2', '#FFFFFF')}</div>
<div style="position: absolute; left: 290px; top: 106px">${circleBtn(pieceSheet.paper, pieceSheet.shades, dark, 'lay-snd', speaker(txt))}</div>
<div style="position: absolute; left: 372px; top: 106px">${piece({ w: 190, h: 64, color: red.paper, shades: red.shades, dark, d: cut(190, 64, 32, 'lay-start'), seed: 'lay-start', lift: 'raised', rim: true, inner: `<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center">${play}</div>` })}</div>
<div style="position: absolute; left: 310px; top: 200px">${piece({ w: 250, h: 150, color: panelColor.paper, shades: panelColor.shades, dark, d: panel.d, seed: 'lay-panel', lift: 'lifted', fringe: { d: panel.fringe, fibers: panel.fibers, color: mix(panelColor.paper, '#FFFFFF', dark ? 0.1 : 0.6) }, inner: panelInner })}</div>
</div>`;
  };

  const legend = (n, title, text) => `<div style="display: flex; gap: 12px; align-items: baseline"><div style="font-size: 13px; font-weight: 900; color: #9A4A2E; min-width: 18px">${n}</div><div style="font-size: 14px; color: ${MUTED}; line-height: 1.5"><b style="color: ${INK}">${title}</b> ${text}</div></div>`;

  const body = `${header('Paper pack', 'Layering', 'Three ways a piece sits on what’s under it. Glued pieces lie flat with only a hairline of contact shadow. Raised pieces are buttons you can press, lifted a little off the page. Lifted panels float highest, above everything.')}
<div style="padding: 0 64px; display: flex; flex-direction: column; gap: 28px">
${sideView('1 · Glued down', 'Pasted flat onto the sheet below. Only a hairline of shadow where the paper’s thickness meets the sheet; no lift, no blur.', 'the dial face on the page, the time wedge on the dial face, swatches on a panel’s backing.', gluedStack)}
${sideView('2 · Raised', 'Sits on top with a little air under it: a short, soft shadow just below. Presses down when tapped.', 'buttons, duration chips, the star, the start button, color swatches.', raisedStack)}
${sideView('3 · Lifted panel', 'Torn sheets that come and go above the screen, with a longer, softer shadow.', 'Settings, History and the color and sound pickers.', liftedStack)}
</div>
<div style="padding: 40px 64px 0; display: flex; flex-direction: column; gap: 18px">
${label('All three together', 24, 900)}
<div style="display: flex; gap: 40px">${scene(false)}${scene(true)}</div>
<div style="display: flex; gap: 40px; max-width: 1240px">
${legend('1', 'Glued:', 'white dial face on the page, red wedge on the face.')}
${legend('2', 'Raised:', 'chips, the sound button and the start button.')}
${legend('3', 'Lifted:', 'the torn color panel, with raised swatches on it.')}
</div>
</div>`;
  return page('Paper pack: layering', 1440, 1220, body);
}

const boards = [
  ['Main.dc.html', 'Neutral sheets', packBoard(), 1440, 1000],
  ['TimerColors.dc.html', 'Timer colors', timerBoard(), 1440, 1180],
  ['Edges.dc.html', 'Edges', edgesBoard(), 1440, 900],
  ['Layering.dc.html', 'Layering', layeringBoard(), 1440, 1220],
  ['References.dc.html', 'References', refsBoard(), 1440, 1120],
  ['TornEdge.dc.html', 'Torn edge', tornBoard(), 1440, 1240],
  ['TornCvsA.dc.html', 'Torn edge: C vs A', cVsABoard(), 1440, 1700],
  ['CompareLight.dc.html', 'A vs C · light', compareBoard(false), 1440, 1900],
  ['CompareDark.dc.html', 'A vs C · dark', compareBoard(true), 1440, 1900],
];
fs.mkdirSync(OUT, { recursive: true });
for (const [file, , html] of boards) fs.writeFileSync(path.join(OUT, file), html);

// Index: two rows.
const pos = { 'Main.dc.html': [0, 0], 'Edges.dc.html': [1520, 0], 'TimerColors.dc.html': [0, 1080], 'Layering.dc.html': [1520, 1080], 'References.dc.html': [3040, 0], 'TornEdge.dc.html': [3040, 1200], 'TornCvsA.dc.html': [4560, 1200], 'CompareLight.dc.html': [0, 3020], 'CompareDark.dc.html': [1520, 3020] };
const index = {
  v: 3,
  createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') },
  title: 'Paper Pack',
  launch: { view: 'canvas' },
  pages: [],
  boards: Object.fromEntries(boards.map(([f, title, , w, h]) => [f, { x: pos[f][0], y: pos[f][1], w, h, title }])),
  order: boards.map(([f]) => f),
  notes: {},
  designSystems: [],
};
fs.writeFileSync(path.join(OUT, 'canvas.json'), JSON.stringify(index, null, 1));
for (const [f, , html] of boards) console.log(f, (html.length / 1024).toFixed(0) + 'KB');
fs.writeFileSync(path.join(__dirname, 'c2/kit-used.json'), JSON.stringify([...KIT_ALL_USED].sort(), null, 1));
