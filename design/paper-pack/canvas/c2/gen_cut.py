"""Option C, updated: scissor-cut pieces as pre-drawn pictures, with what we learned on A.

Outlines come from A's own hand-cut code (cut-outlines.json, exported from outline.js), so the
cut wanders and restarts like A's. Per shape:
  <name>-mask                 the sheet, white + alpha (tinted to the paper color)
  <name>-rim                  the thin, uneven rim of paler fibers just inside the cut (white + alpha)
  <name>-shadow-<level>-<mode> glued / raised / lifted shadows, light and dark (black + alpha)
Rect: one 120pt sheet with 12pt corners, 9-sliced (middles stretch). Circles: three 72pt cuts,
each drawn whole. 36pt of room around every shape for the lifted shadow.
"""
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

PX, K, PAD = 3, 4, 36
DASH = [5, 3, 2, 4, 9, 2, 3, 6]
SHADOWS = {
    "light": {"glued": [(0.5, 0.4, 0.30)], "raised": [(1, 1, 0.20), (3, 5, 0.18)], "lifted": [(2, 2, 0.16), (10, 16, 0.22)]},
    "dark": {"glued": [(0.6, 0.5, 0.65)], "raised": [(1, 1, 0.55), (3, 6, 0.5)], "lifted": [(2, 2, 0.5), (10, 18, 0.6)]},
}


def save_la(name, gray, alpha):
    g = Image.fromarray(np.clip(gray * 255 + 0.5, 0, 255).astype(np.uint8))
    a = Image.fromarray(np.clip(alpha * 255 + 0.5, 0, 255).astype(np.uint8))
    Image.merge("LA", (g, a)).save(f"{name}.png", optimize=True)


def draw_shape(name, w, h, pts, shadows=True):
    W, H = (w + 2 * PAD) * PX, (h + 2 * PAD) * PX
    sc = PX * K
    poly = [((x + PAD) * sc, (y + PAD) * sc) for x, y in pts]
    m = Image.new("L", (W * K, H * K), 0)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    mask_k = m
    mask = np.asarray(m.reduce(K), np.float32) / 255

    # Rim: a solid 0.8pt stroke (half of it inside the cut) at half strength, and a dashed one on top.
    rim = Image.new("L", (W * K, H * K), 0)
    dr = ImageDraw.Draw(rim)
    ring = poly + [poly[0]]
    dr.line(ring, fill=128, width=round(0.8 * sc), joint="curve")
    pos, i, on = 0.0, 0, True
    seglens = [np.hypot(ring[j + 1][0] - ring[j][0], ring[j + 1][1] - ring[j][1]) / sc for j in range(len(ring) - 1)]
    left = DASH[0]
    for j, L in enumerate(seglens):
        t0 = 0.0
        while t0 < L:
            step = min(left, L - t0)
            if on:
                p = lambda t: (ring[j][0] + (ring[j + 1][0] - ring[j][0]) * t / L, ring[j][1] + (ring[j + 1][1] - ring[j][1]) * t / L)
                dr.line([p(t0), p(t0 + step)], fill=255, width=round(0.8 * sc))
            t0 += step
            left -= step
            if left <= 1e-6:
                i = (i + 1) % len(DASH)
                left = DASH[i]
                on = not on
    rim_a = np.asarray(rim, np.float32) / 255 * (np.asarray(mask_k, np.float32) / 255)
    rim_a = np.asarray(Image.fromarray((rim_a * 255).astype(np.uint8)).reduce(K), np.float32) / 255

    ones = np.ones_like(mask)
    save_la(f"{name}-mask", ones, mask)
    save_la(f"{name}-rim", ones, rim_a)
    if not shadows:
        return
    img = Image.fromarray((mask * 255).astype(np.uint8))
    for mode, levels in SHADOWS.items():
        for level, layers in levels.items():
            out = np.zeros_like(mask)
            for dy, blur, strength in layers:
                moved = Image.new("L", img.size, 0)
                moved.paste(img, (0, round(dy * PX)))
                b = np.asarray(moved.filter(ImageFilter.GaussianBlur(blur / 2 * PX)), np.float32) / 255
                out = 1 - (1 - out) * (1 - b * strength)
            save_la(f"{name}-shadow-{level}-{mode}", np.zeros_like(out), out)


shapes = json.load(open("cut-outlines.json"))
r = shapes["rect"]
draw_shape("rect2", r["w"], r["h"], r["pts"])
for i, c in enumerate(shapes["circles"]):
    draw_shape(f"circle2-{i}", c["w"], c["h"], c["pts"], shadows=(i == 0))
print("done")
