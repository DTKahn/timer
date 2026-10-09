"""Option C, v3: edge pictures in several lengths, so nothing is stretched or squeezed more than 20%.

Rect and torn kits: one square sprite per middle length s (box = 2c + s, plus shadow room). The app
keeps corners at 1:1 and fills each side's middle with the sprite whose middle is nearest in
length (several end to end on long sides), scaled by 0.8-1.2. Pieces from different sprites join
because every outline meets each slice line at the same spot (the wobble is pinned to zero there),
and torn fibers crossing a slice line are the same "seam patch" in every sprite.
Circles: a ladder of sizes, drawn whole; the app picks the nearest size (scale 0.8-1.2).

Writes PNGs (white + alpha; tinted by the app) and kits.json describing them.
"""
import json, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

PX, K, PAD = 3, 4, 36
SHADOWS = {
    "light": {"glued": [(0.5, 0.4, 0.30)], "raised": [(1, 1, 0.20), (3, 5, 0.18)], "lifted": [(2, 2, 0.16), (10, 16, 0.22)]},
    "dark": {"glued": [(0.6, 0.5, 0.65)], "raised": [(1, 1, 0.55), (3, 6, 0.5)], "lifted": [(2, 2, 0.5), (10, 18, 0.6)]},
}
DASH = [5, 3, 2, 4, 9, 2, 3, 6]
RECT = {"c": 14, "r": 12, "sizes": [12, 18, 27, 40, 60, 90, 135]}
TORN = {"c": 24, "rc": 4, "sizes": [24, 36, 54, 80, 120, 180]}


def save_la(name, gray, alpha):
    g = Image.fromarray(np.clip(gray * 255 + 0.5, 0, 255).astype(np.uint8))
    a = Image.fromarray(np.clip(alpha * 255 + 0.5, 0, 255).astype(np.uint8))
    Image.merge("LA", (g, a)).save(f"kit/{name}.png", optimize=True)


def shadows_for(name, sil, levels=("glued", "raised", "lifted")):
    img = Image.fromarray((np.clip(sil, 0, 1) * 255).astype(np.uint8))
    for mode, table in SHADOWS.items():
        for level in levels:
            out = np.zeros_like(sil)
            for dy, blur, strength in table[level]:
                moved = Image.new("L", img.size, 0)
                moved.paste(img, (0, round(dy * PX)))
                b = np.asarray(moved.filter(ImageFilter.GaussianBlur(blur / 2 * PX)), np.float32) / 255
                out = 1 - (1 - out) * (1 - b * strength)
            save_la(f"{name}-shadow-{level}-{mode}", np.zeros_like(out), out)


def pin(d, flat=3.0, ramp=5.0):
    """0 within `flat` of a slice line, easing to 1 over `ramp` more points."""
    t = np.clip((d - flat) / ramp, 0, 1)
    return t * t * (3 - 2 * t)


def smooth_noise(rng, length, spacing, step=0.25):
    """Smooth random curve sampled every `step` points (std 1)."""
    n = int(length / step) + 1
    knots = rng.normal(size=int(length / spacing) + 3)
    xs = np.arange(n) * step / spacing
    i = np.floor(xs).astype(int)
    f = xs - i
    f = f * f * (3 - 2 * f)
    return knots[i] * (1 - f) + knots[i + 1] * f


def rim_and_mask(name, B, poly_pts):
    """Mask and rim (solid half-strength stroke + dashed stroke, kept inside the cut)."""
    n = (B + 2 * PAD) * PX
    sc = PX * K
    poly = [((x + PAD) * sc, (y + PAD) * sc) for x, y in poly_pts]
    m = Image.new("L", (n * K, n * K), 0)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    rim = Image.new("L", (n * K, n * K), 0)
    dr = ImageDraw.Draw(rim)
    ring = poly + [poly[0]]
    dr.line(ring, fill=128, width=round(0.8 * sc), joint="curve")
    i, on, left = 0, True, DASH[0]
    for j in range(len(ring) - 1):
        (x0, y0), (x1, y1) = ring[j], ring[j + 1]
        L = math.hypot(x1 - x0, y1 - y0) / sc
        t0 = 0.0
        while t0 < L:
            step = min(left, L - t0)
            if on and L > 0:
                dr.line([(x0 + (x1 - x0) * t0 / L, y0 + (y1 - y0) * t0 / L), (x0 + (x1 - x0) * (t0 + step) / L, y0 + (y1 - y0) * (t0 + step) / L)], fill=255, width=round(0.8 * sc))
            t0 += step
            left -= step
            if left <= 1e-6:
                i = (i + 1) % len(DASH)
                left, on = DASH[i], not on
    mk = np.asarray(m, np.float32) / 255
    rim_a = np.asarray(rim, np.float32) / 255 * mk
    mask = np.asarray(m.reduce(K), np.float32) / 255
    rim_a = np.asarray(Image.fromarray((rim_a * 255).astype(np.uint8)).reduce(K), np.float32) / 255
    ones = np.ones_like(mask)
    save_la(f"{name}-mask", ones, mask)
    save_la(f"{name}-rim", ones, rim_a)
    return mask


# ---------------------------------------------------------------- scissor-cut rects
def rect_sprite(s, seed):
    c, r = RECT["c"], RECT["r"]
    B = 2 * c + s
    rng = np.random.default_rng(seed)
    # Rounded-rect perimeter, sampled every 0.25pt, with outward normals.
    pts = []
    def arc(cx, cy, a0):
        for k in range(int(r * math.pi / 2 / 0.25)):
            a = a0 + k * 0.25 / r
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a), math.cos(a), math.sin(a)))
    def line(x0, y0, x1, y1, nx, ny):
        L = math.hypot(x1 - x0, y1 - y0)
        for k in range(int(L / 0.25)):
            t = k * 0.25 / L
            pts.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, nx, ny))
    line(r, 0, B - r, 0, 0, -1); arc(B - r, r, -math.pi / 2)
    line(B, r, B, B - r, 1, 0); arc(B - r, B - r, 0)
    line(B - r, B, r, B, 0, 1); arc(r, B - r, math.pi / 2)
    line(0, B - r, 0, r, -1, 0); arc(r, r, math.pi)
    P = len(pts) * 0.25
    wander = smooth_noise(rng, P, 26)[: len(pts)]
    tremble = smooth_noise(rng, P, 7)[: len(pts)]
    out = []
    for (x, y, nx, ny), wv, tv in zip(pts, wander, tremble):
        d = min(abs(x - c), abs(x - (B - c)), abs(y - c), abs(y - (B - c)))
        off = (wv * 0.2 + tv * 0.08) * pin(d)
        out.append((x + nx * off, y + ny * off))
    name = f"rect-{s}"
    mask = rim_and_mask(name, B, out)
    shadows_for(name, mask)
    return name


# ---------------------------------------------------------------- torn sheets
SEAM = 2.5  # fibers centered within this many points of a slice line come from the shared seam patch
DEPTH0, WIDTH0 = 2.0, 1.6


def angle(p):
    if p.random() < 0.35:
        return (1 if p.random() < 0.5 else -1) * (1.1 + p.random() * 0.5)
    return (p.random() - 0.5) * 2.2


def fiber_specs(p, a, depth_at, width_at):
    """Fibers for one spot along an edge: (tone, a, t, angle, length, width, opacity); t is inward."""
    out = []
    dep, wid = depth_at(a), width_at(a)
    for _ in range(17):  # per point of edge
        aa = a + p.random()
        d = wid * p.random() ** 1.4
        inner = d < wid * 0.45
        tier = (1 if p.random() < 0.5 else 2) if inner else (0 if p.random() < 0.7 else 1)
        out.append((tier, aa, dep - d, angle(p), 0.35 + p.random() * p.random() * 1.3, [0.16, 0.2, 0.22][tier], [0.7, 0.85, 0.95][tier]))
    for _ in range(3):
        aa = a + p.random()
        out.append((0, aa, dep + 0.3 - wid * 0.45 * p.random() ** 1.5, (p.random() - 0.5) * 2, 0.4 + p.random(), 0.2, 0.9))
    for _ in range(2 if p.random() < 0.5 else 3):
        aa = a + p.random()
        out.append((1, aa, dep - (p.random() - 0.6) * 0.8, angle(p), 0.3 + p.random() * 0.8, 0.16, 0.6))
    return out


# One shared patch of fibers around a slice line, in line-relative coordinates (u along, t inward).
_pp = random.Random(4242)
SEAM_PATCH = []
for k in range(int(2 * SEAM)):
    for spec in fiber_specs(_pp, -SEAM + k, lambda a: DEPTH0, lambda a: WIDTH0):
        if abs(spec[1]) <= SEAM:
            SEAM_PATCH.append(spec)


def torn_sprite(s, seed):
    c, rc = TORN["c"], TORN["rc"]
    B = 2 * c + s
    rng = np.random.default_rng(seed)
    p = random.Random(seed)
    lines = (c, B - c)
    N = int(B / 0.25) + 2
    a_s = np.arange(N) * 0.25
    profiles = {}
    for side in ("top", "right", "bottom", "left"):
        dpin = np.minimum(abs(a_s - lines[0]), abs(a_s - lines[1]))
        w = pin(dpin)
        drift, ripple, jit = (smooth_noise(rng, B + 1, sp)[:N] for sp in (38, 7, 2.2))
        depth = DEPTH0 + w * np.clip(-0.9 * drift - 0.45 * ripple - 0.25 * jit, -1.6, 1.5)
        fw, slow = smooth_noise(rng, B + 1, 9)[:N], smooth_noise(rng, B + 1, 60)[:N]
        width = WIDTH0 + w * (np.minimum(3.2, (0.9 + (0.6 * fw + 1) * 1.2) * (0.75 + 0.9 * np.maximum(0, 0.55 * slow - 0.2))) - WIDTH0)
        profiles[side] = (depth, width)

    def at(arr, a):
        return float(arr[min(N - 1, max(0, int(round(a / 0.25))))])

    n = (B + 2 * PAD) * PX
    cc = (np.arange(n) + 0.5) / PX - PAD
    X, Y = np.meshgrid(cc, cc)
    e = np.full_like(X, 1e9)
    for side, (t, a) in {"top": (Y, X), "bottom": (B - Y, X), "left": (X, Y), "right": (B - X, Y)}.items():
        depth, _ = profiles[side]
        idx = np.clip(np.round(a / 0.25).astype(int), 0, N - 1)
        e = np.minimum(e, t - depth[idx])
    cx, cy = np.clip(X, rc, B - rc), np.clip(Y, rc, B - rc)
    corner = ((X < rc) | (X > B - rc)) & ((Y < rc) | (Y > B - rc))
    e = np.minimum(e, np.where(corner, rc - np.hypot(X - cx, Y - cy) - DEPTH0, 1e9))
    mask = np.clip(e * PX + 0.5, 0, 1)

    layers = [Image.new("L", (n * K, n * K), 0) for _ in range(3)]
    draws = [ImageDraw.Draw(im) for im in layers]

    def to_px(side, a, t):
        x, y = {"top": (a, t), "bottom": (a, B - t), "left": (t, a), "right": (B - t, a)}[side]
        return ((x + PAD) * PX * K, (y + PAD) * PX * K)

    def draw(side, spec):
        tone, a, t, ang, length, wd, op = spec
        if min(a, B - a) <= t + 1.2:  # each side keeps to its own wedge
            return
        da, dt = math.sin(ang) * length / 2, -math.cos(ang) * length / 2
        draws[tone].line([to_px(side, a - da, t - dt), to_px(side, a + da, t + dt)], fill=round(255 * op), width=max(1, round(wd * PX * K)))

    for side, (depth, width) in profiles.items():
        for a in range(-3, B + 3):
            for spec in fiber_specs(p, a, lambda v: at(depth, v), lambda v: at(width, v)):
                if min(abs(spec[1] - lines[0]), abs(spec[1] - lines[1])) > SEAM:
                    draw(side, spec)
        for line_at in lines:
            for tone, u, t, ang, length, wd, op in SEAM_PATCH:
                draw(side, (tone, line_at + u, t, ang, length, wd, op))

    fib = [np.asarray(im.reduce(K), np.float32) / 255 for im in layers]
    name = f"torn-{s}"
    ones = np.ones_like(mask)
    save_la(f"{name}-mask", ones, mask)
    for i, f in enumerate(fib):
        save_la(f"{name}-f{i}", ones, f)
    shadows_for(name, np.maximum(mask, np.clip(fib[0] + fib[1] + fib[2], 0, 1) * 0.8), levels=("lifted",))
    return name


# ---------------------------------------------------------------- circles
def circles():
    data = json.load(open("circle-outlines.json"))
    for s in data["sizes"]:
        for v in range(3):
            name = f"circle-{s}-{v}"
            # Outline is in a box of side s; the sprite box is the same size.
            mask = rim_and_mask(name, s, [tuple(pt) for pt in data["out"][f"{s}-{v}"]])
            if v == 0:
                shadows_for(f"circle-{s}", mask)
    return data["sizes"]


import os
os.makedirs("kit", exist_ok=True)
for i, s in enumerate(RECT["sizes"]):
    rect_sprite(s, 100 + i)
for i, s in enumerate(TORN["sizes"]):
    torn_sprite(s, 200 + i)
csizes = circles()
json.dump({
    "pad": PAD,
    "rect": {"c": RECT["c"], "r": RECT["r"], "sizes": RECT["sizes"]},
    "torn": {"c": TORN["c"], "sizes": TORN["sizes"]},
    "circle": {"sizes": csizes, "variants": 3},
}, open("kits.json", "w"), indent=1)
print("files:", len(os.listdir("kit")), "KB:", sum(os.path.getsize(f"kit/{f}") for f in os.listdir("kit")) // 1024)
