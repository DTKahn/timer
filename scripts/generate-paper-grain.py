"""Generates the construction-paper fiber texture: assets/images/paper-fibers-{light,dark}.png.

Two seamlessly tiling images, 160pt square drawn at 3 pixels per point:
  light  white fibers (with alpha): fibers a shade lighter than the sheet
  dark   black fibers (with alpha): fibers a shade darker, plus the odd dark fleck
The app lays both over every sheet, with opacities set from the sheet's lightness
(see src/paper/grain.ts). White over a color lightens it and black darkens it without
changing its hue, so the fibers always look like the sheet's own fibers.

The texture is a faint felt of short fibers, fine paper tooth, and a few hundred
hair-thin strands 3-10pt long (real fibers are 1-3 mm, about 6-18pt on a phone).
No blotches: real construction paper is evenly colored at arm's length.

Run from the repo root: python3 scripts/generate-paper-grain.py   (needs numpy + Pillow)
"""

import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "assets" / "images"

TILE_PT = 160  # Keep in sync with GRAIN_TILE in src/components/paper.tsx.
PX = 3  # pixels per point
K = 4  # supersampling for drawing strands
# Full-strength values of the two layers; src/paper/grain.ts scales these per sheet.
LIGHT_FULL, DARK_FULL = 0.2, 0.3


def wrap_blur(arr, sigma):
    """Gaussian blur that wraps around (done in frequency space), so the tile stays seamless."""
    h, w = arr.shape
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    return np.real(np.fft.ifft2(np.fft.fft2(arr) * np.exp(-2 * (np.pi * sigma) ** 2 * (fx**2 + fy**2)))).astype(np.float32)


def strands(seed, count, length, width, strength, dark_share, wave=0.0, steps=6):
    """Light and dark strand layers (0..1), each strand drawn in all nine neighboring tiles so it wraps."""
    n = TILE_PT * PX
    light, dark = Image.new("L", (n * K, n * K)), Image.new("L", (n * K, n * K))
    dl, dd = ImageDraw.Draw(light), ImageDraw.Draw(dark)
    p = random.Random(seed)
    for _ in range(count):
        x, y = p.uniform(0, TILE_PT), p.uniform(0, TILE_PT)
        ln = p.uniform(*length)
        a = p.uniform(0, 2 * math.pi)
        turn = p.uniform(-0.3, 0.3) / max(ln, 1)
        seg = ln / steps
        pts = [(x, y)]
        for _ in range(steps):
            a += turn * seg + p.gauss(0, wave)
            x += math.cos(a) * seg
            y += math.sin(a) * seg
            pts.append((x, y))
        draw = dd if p.random() < dark_share else dl
        w = max(1, round(p.uniform(*width) * PX * K))
        s = p.uniform(*strength)
        # Fibers fade out toward both ends.
        for i in range(len(pts) - 1):
            u = (i + 0.5) / (len(pts) - 1)
            fill = round(255 * s * min(1, math.sin(math.pi * u) * 1.6))
            for ox in (-TILE_PT, 0, TILE_PT):
                for oy in (-TILE_PT, 0, TILE_PT):
                    draw.line(
                        [((pts[i][0] + ox) * PX * K, (pts[i][1] + oy) * PX * K), ((pts[i + 1][0] + ox) * PX * K, (pts[i + 1][1] + oy) * PX * K)],
                        fill=fill,
                        width=w,
                    )
    return np.asarray(light.reduce(K), np.float32) / 255, np.asarray(dark.reduce(K), np.float32) / 255


def main():
    n = TILE_PT * PX
    rng = np.random.default_rng(3)
    tooth = wrap_blur(rng.normal(size=(n, n)).astype(np.float32), 0.6)
    tooth /= tooth.std()
    felt_light, felt_dark = strands(5, 2600, (1.0, 2.6), (0.15, 0.2), (0.25, 0.6), 0.4, wave=0.15)
    felt_light, felt_dark = wrap_blur(felt_light, 0.4), wrap_blur(felt_dark, 0.4)
    long_light, long_dark = strands(21, 460, (3, 10), (0.15, 0.22), (0.6, 1.0), 0.45, wave=0.07, steps=12)
    _, flecks = strands(9, 7, (0.6, 1.6), (0.28, 0.36), (0.75, 0.95), 1.0)

    light = 0.02 * np.clip(tooth, 0, None) + 0.05 * felt_light + 0.2 * long_light
    dark = 0.02 * np.clip(-tooth, 0, None) + 0.035 * felt_dark + 0.16 * long_dark + 0.28 * flecks
    for name, arr, full, gray in (("light", light, LIGHT_FULL, 255), ("dark", dark, DARK_FULL, 0)):
        alpha = np.clip(arr / full, 0, 1)
        img = Image.merge("LA", (Image.new("L", (n, n), gray), Image.fromarray((alpha * 255 + 0.5).astype(np.uint8))))
        img.save(OUT / f"paper-fibers-{name}.png", optimize=True)
        print(f"wrote {OUT / f'paper-fibers-{name}.png'}")


if __name__ == "__main__":
    main()
