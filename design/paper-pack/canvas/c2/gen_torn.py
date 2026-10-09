"""Option C, updated: the torn sheet as pre-drawn pictures, with what we learned on A.

The edge is made entirely of fibers (no solid pale band) and every layer is a white + alpha
mask the app tints from the sheet's own colors, so the edge always matches the paper:
  torn2-mask    the colored sheet
  torn2-f0      fibers in the sheet's color
  torn2-f1      fibers in the sheet's lighter fiber shade (plus strands across the edge, wisps)
  torn2-f2      fiber tips a little lighter still
  torn2-shadow  the lifted shadow (black + alpha), drawn at dark-mode strength
Sprite: a 192pt sheet (36pt corners + one 120pt period) inside 36pt of shadow room. Each side's
tear and fibers repeat exactly every 120pt, so middle slices can repeat seamlessly.
"""
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

PX, K = 3, 4
CORNER, PERIOD, PAD = 36, 120, 36
S = 2 * CORNER + PERIOD
W = S + 2 * PAD
rng = np.random.default_rng(7)
prng = random.Random(7)
STEP = 0.25  # pt per profile sample
N = int(PERIOD / STEP)


def periodic(octaves, falloff=1.0):
    t = np.arange(N) / N
    out = np.zeros(N)
    for k in range(1, octaves + 1):
        out += rng.normal() / k**falloff * np.sin(2 * np.pi * k * t + rng.uniform(0, 2 * np.pi))
    out -= out.mean()
    return out / (out.std() or 1)


def side_profile():
    drift, ripple, jit = periodic(3), periodic(17, 0.6), periodic(55, 0.3)
    depth = np.clip(2 - 0.9 * drift - 0.45 * ripple - 0.25 * jit, 0.4, 3.5)  # inward from the box side
    fw, slow = periodic(13), periodic(4)
    swell = 0.75 + 0.9 * np.maximum(0, 0.55 * slow - 0.2)
    width = np.minimum(3.2, (0.9 + (0.6 * fw + 1) * 1.2) * swell)  # fiber band, outward from the color
    return depth, width


sides = {name: side_profile() for name in ("top", "right", "bottom", "left")}


def at(profile, a):
    return profile[int(math.floor(a / STEP)) % N]


def to_px(name, a, t):
    """Side-local (a along, t inward) to sprite pixels at K x supersampling."""
    x, y = {"top": (a, t), "bottom": (a, S - t), "left": (t, a), "right": (S - t, a)}[name]
    return ((x + PAD) * PX * K, (y + PAD) * PX * K)


# ---- the colored sheet ----
n = W * PX
c = (np.arange(n) + 0.5) / PX - PAD
X, Y = np.meshgrid(c, c)
e = np.full_like(X, 1e9)
for name, (t, a) in {"top": (Y, X), "bottom": (S - Y, X), "left": (X, Y), "right": (S - X, Y)}.items():
    depth, _ = sides[name]
    idx = np.floor(a / STEP).astype(int) % N
    e = np.minimum(e, t - depth[idx])
rc = 4.0
cx, cy = np.clip(X, rc, S - rc), np.clip(Y, rc, S - rc)
corner = ((X < rc) | (X > S - rc)) & ((Y < rc) | (Y > S - rc))
e = np.minimum(e, np.where(corner, rc - np.hypot(X - cx, Y - cy) - 2.0, 1e9))
mask = np.clip(e * PX + 0.5, 0, 1)

# ---- fibers ----
layers = [Image.new("L", (n * K, n * K), 0) for _ in range(3)]
draws = [ImageDraw.Draw(im) for im in layers]


def angle():
    if prng.random() < 0.35:
        return (1 if prng.random() < 0.5 else -1) * (1.1 + prng.random() * 0.5)
    return (prng.random() - 0.5) * 2.2


def strand(tone, name, a, t, ang, length, width, opacity):
    # Outward is -t; rotate it by `ang`.
    da, dt = math.sin(ang) * length / 2, -math.cos(ang) * length / 2
    p0, p1 = to_px(name, a - da, t - dt), to_px(name, a + da, t + dt)
    draws[tone].line([p0, p1], fill=round(255 * opacity), width=max(1, round(width * PX * K)))


for name, (depth, width) in sides.items():
    specs = []
    for _ in range(int(PERIOD * 17)):  # the mat, dense against the color and thinning outward
        a = prng.uniform(0, PERIOD)
        d = at(width, a) * prng.random() ** 1.4
        inner = d < at(width, a) * 0.45
        tier = (1 if prng.random() < 0.5 else 2) if inner else (0 if prng.random() < 0.7 else 1)
        specs.append((tier, a, at(depth, a) - d, angle(), 0.35 + prng.random() * prng.random() * 1.3,
                      [0.16, 0.2, 0.22][tier], [0.7, 0.85, 0.95][tier]))
    for _ in range(int(PERIOD * 3)):  # sheet-colored strands reaching out of the color
        a = prng.uniform(0, PERIOD)
        d = -0.3 + at(width, a) * 0.45 * prng.random() ** 1.5
        specs.append((0, a, at(depth, a) - d, (prng.random() - 0.5) * 2, 0.4 + prng.random(), 0.2, 0.9))
    for _ in range(int(PERIOD * 2.5)):  # strands lying across the color's edge
        a = prng.uniform(0, PERIOD)
        d = (prng.random() - 0.6) * 0.8
        specs.append((1, a, at(depth, a) - d, angle(), 0.3 + prng.random() * 0.8, 0.16, 0.6))
    for tone, a, t, ang, length, wd, op in specs:
        for shift in (-PERIOD, 0, PERIOD, 2 * PERIOD):  # repeat every period along the whole side
            aa = a + shift
            # Each side keeps to its own wedge of the sheet, so fibers don't run past the corners.
            if min(aa, S - aa) > t + 1.2:
                strand(tone, name, aa, t, ang, length, wd, op)

fib = [np.asarray(im.reduce(K), np.float32) / 255 for im in layers]


def save_la(name, gray, alpha):
    g = Image.fromarray(np.clip(gray * 255 + 0.5, 0, 255).astype(np.uint8))
    al = Image.fromarray(np.clip(alpha * 255 + 0.5, 0, 255).astype(np.uint8))
    Image.merge("LA", (g, al)).save(f"{name}.png", optimize=True)


ones = np.ones_like(mask)
save_la("torn2-mask", ones, mask)
for i, f in enumerate(fib):
    save_la(f"torn2-f{i}", ones, f)

# ---- lifted shadow, at dark-mode strength (light mode draws it at about a third) ----
sil = np.maximum(mask, np.clip(fib[0] + fib[1] + fib[2], 0, 1) * 0.8)
img = Image.fromarray((sil * 255).astype(np.uint8))
shadow = np.zeros_like(sil)
for dy, sigma, strength in [(2, 1.0, 0.5), (10, 9.0, 0.6)]:
    moved = Image.new("L", img.size, 0)
    moved.paste(img, (0, dy * PX))
    b = np.asarray(moved.filter(ImageFilter.GaussianBlur(sigma * PX)), np.float32) / 255
    shadow = 1 - (1 - shadow) * (1 - b * strength)
save_la("torn2-shadow", np.zeros_like(shadow), shadow)
print("sprite", W, "pt; corner slice", PAD + CORNER, "pt; period", PERIOD, "pt")
