"""Generates assets/images/paper-grain.png, the construction-paper texture.

A seamlessly tiling gray + alpha image, 160pt square drawn at 3 pixels per
point: faint mottling like uneven pulp, fine paper tooth, and lots of tiny
light and dark fibers (the felted look) with a few longer strands. The app
lays the same tile over every sheet of paper, whatever its color; its white
and black pixels lighten or darken the color underneath.

Run from the repo root: python3 scripts/generate-paper-grain.py   (needs numpy + Pillow)
"""

import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "assets" / "images" / "paper-grain.png"

TILE_PT = 160  # Keep in sync with GRAIN_TILE in src/components/paper.tsx.
PX = 3  # pixels per point


def wrap_blur(arr, sigma):
    """Gaussian blur that wraps around (done in frequency space), so the tile stays seamless."""
    h, w = arr.shape
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    kernel = np.exp(-2 * (np.pi * sigma) ** 2 * (fx**2 + fy**2))
    return np.real(np.fft.ifft2(np.fft.fft2(arr) * kernel)).astype(np.float32)


def light_dark_to_la(light, dark):
    """Combine a white-alpha and a black-alpha layer into one gray + alpha image."""
    light = np.clip(light, 0, 1)
    dark = np.clip(dark, 0, 1)
    alpha = light + dark * (1 - light)
    gray = np.where(alpha > 1e-4, light / np.maximum(alpha, 1e-4), 0)
    return gray, alpha


def grain_tile():
    rng = np.random.default_rng(11)
    n = TILE_PT * PX

    # Mottling: very soft blotches, like uneven pulp.
    mottle = wrap_blur(rng.normal(size=(n, n)).astype(np.float32), PX * 5)
    mottle = mottle / (mottle.std() or 1)

    # Tooth: fine per-pixel roughness.
    tooth = wrap_blur(rng.normal(size=(n, n)).astype(np.float32), 0.6)
    tooth = tooth / (tooth.std() or 1)

    # Fibers: many tiny strands plus a few longer ones, drawn at 2x for smooth edges.
    k = 2
    light_img = Image.new("L", (n * k, n * k), 0)
    dark_img = Image.new("L", (n * k, n * k), 0)
    dl, dd = ImageDraw.Draw(light_img), ImageDraw.Draw(dark_img)
    prng = random.Random(5)
    # (count, length range pt, width range pt, strength range, share that are dark)
    kinds = [(1500, (0.8, 2.6), (0.2, 0.32), (0.25, 0.7), 0.35), (70, (3.0, 6.5), (0.22, 0.3), (0.3, 0.6), 0.1)]
    for count, (l0, l1), (w0, w1), (s0, s1), dark_share in kinds:
        for _ in range(count):
            x, y = prng.uniform(0, TILE_PT), prng.uniform(0, TILE_PT)
            length = prng.uniform(l0, l1)
            ang = prng.uniform(0, math.pi)
            bend = prng.uniform(-0.6, 0.6)
            width = prng.uniform(w0, w1)
            is_dark = prng.random() < dark_share
            strength = prng.uniform(s0, s1)
            steps = 5
            pts = []
            for st in range(steps + 1):
                u = st / steps - 0.5
                a = ang + bend * u * 2
                pts.append((x + math.cos(a) * u * length, y + math.sin(a) * u * length))
            draw = dd if is_dark else dl
            # Drawn in all nine neighboring tiles so strands crossing an edge wrap around.
            for ox in (-TILE_PT, 0, TILE_PT):
                for oy in (-TILE_PT, 0, TILE_PT):
                    seg = [((px + ox) * PX * k, (py + oy) * PX * k) for px, py in pts]
                    draw.line(seg, fill=round(255 * strength), width=max(1, round(width * PX * k)), joint="curve")
    fl = np.asarray(light_img.reduce(k), np.float32) / 255
    fd = np.asarray(dark_img.reduce(k), np.float32) / 255

    light = np.clip(mottle, 0, None) * 0.02 + np.clip(tooth, 0, None) * 0.045 + fl * 0.22
    dark = np.clip(-mottle, 0, None) * 0.008 + np.clip(-tooth, 0, None) * 0.035 + fd * 0.16
    gray, alpha = light_dark_to_la(light, dark)
    g = np.clip(gray * 255 + 0.5, 0, 255).astype(np.uint8)
    a = np.clip(alpha * 255 + 0.5, 0, 255).astype(np.uint8)
    Image.merge("LA", (Image.fromarray(g), Image.fromarray(a))).save(OUT, optimize=True)


if __name__ == "__main__":
    grain_tile()
    print(f"wrote {OUT}")
