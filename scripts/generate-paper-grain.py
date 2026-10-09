"""Generates assets/images/paper-grain.png, the construction-paper texture.

A seamlessly tiling 512px grayscale + alpha image: light and dark fibers,
soft mottling, and a few flecks. The app lays it over every paper piece at low
opacity, drawn at 256pt per tile (so it stays sharp on 2x screens), and the
white and black pixels lighten or darken whatever color is underneath.

Run from the repo root: python3 scripts/generate-paper-grain.py
"""

import math
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SIZE = 512
SUPER = 2  # Fibers are drawn at 2x and scaled down for smooth edges.
SEED = 7

rng = np.random.default_rng(SEED)
random.seed(SEED)


def periodic_noise(size: int, low: float, high: float) -> np.ndarray:
    """Band-limited noise in [-1, 1] that wraps at the edges (built in frequency space)."""
    white = rng.standard_normal((size, size))
    f = np.fft.fftfreq(size)
    fx, fy = np.meshgrid(f, f)
    r = np.sqrt(fx**2 + fy**2) * size
    band = np.exp(-((r - (low + high) / 2) ** 2) / (2 * ((high - low) / 2) ** 2))
    band[0, 0] = 0
    out = np.real(np.fft.ifft2(np.fft.fft2(white) * band))
    return out / np.abs(out).max()


def fibers(count: int, length: tuple[int, int], width: int, alpha: tuple[int, int]) -> np.ndarray:
    """Short, gently curved strands, wrapped so the tile repeats without seams."""
    big = SIZE * SUPER
    layer = Image.new('L', (big, big), 0)
    draw = ImageDraw.Draw(layer)
    for _ in range(count):
        x, y = random.uniform(0, big), random.uniform(0, big)
        angle = random.uniform(0, math.pi)
        steps = 4
        seg = random.uniform(*length) * SUPER / steps
        points = [(x, y)]
        for _ in range(steps):
            angle += random.uniform(-0.35, 0.35)
            x += math.cos(angle) * seg
            y += math.sin(angle) * seg
            points.append((x, y))
        a = random.randint(*alpha)
        for ox in (-big, 0, big):
            for oy in (-big, 0, big):
                draw.line([(px + ox, py + oy) for px, py in points], fill=a, width=width * SUPER, joint='curve')
    layer = layer.resize((SIZE, SIZE), Image.LANCZOS)
    return np.asarray(layer, dtype=np.float64) / 255


def flecks(count: int, radius: tuple[float, float], alpha: tuple[int, int]) -> np.ndarray:
    big = SIZE * SUPER
    layer = Image.new('L', (big, big), 0)
    draw = ImageDraw.Draw(layer)
    for _ in range(count):
        x, y = random.uniform(0, big), random.uniform(0, big)
        r = random.uniform(*radius) * SUPER
        a = random.randint(*alpha)
        for ox in (-big, 0, big):
            for oy in (-big, 0, big):
                draw.ellipse([x + ox - r, y + oy - r, x + ox + r, y + oy + r], fill=a)
    layer = layer.resize((SIZE, SIZE), Image.LANCZOS)
    return np.asarray(layer, dtype=np.float64) / 255


def soften(a: np.ndarray, radius: float) -> np.ndarray:
    """Gaussian blur that wraps around, by blurring a 3x3 tiling and keeping the middle."""
    tiled = np.tile(a, (3, 3))
    img = Image.fromarray(np.uint8(np.clip(tiled, 0, 1) * 255)).filter(ImageFilter.GaussianBlur(radius))
    out = np.asarray(img, dtype=np.float64)[SIZE : 2 * SIZE, SIZE : 2 * SIZE] / 255
    return out


# Cloudy unevenness, like pulp settling thicker in places.
mottle = 0.7 * periodic_noise(SIZE, 2, 10) + 0.3 * periodic_noise(SIZE, 14, 40)
mottle /= np.abs(mottle).max()
# Fine tooth: the matte, slightly rough surface.
tooth = periodic_noise(SIZE, 120, 240)

light = np.clip(mottle, 0, 1) * 0.11 + np.clip(tooth, 0, 1) * 0.16
dark = np.clip(-mottle, 0, 1) * 0.12 + np.clip(-tooth, 0, 1) * 0.18

# Long pale fibers and shorter dark ones, slightly blurred so they sit in the paper.
light = 1 - (1 - light) * (1 - soften(fibers(1700, (4, 14), 1, (40, 110)), 0.6))
dark = 1 - (1 - dark) * (1 - soften(fibers(1100, (3, 10), 1, (25, 70)), 0.6))
dark = 1 - (1 - dark) * (1 - soften(flecks(60, (0.5, 1.1), (50, 120)), 0.4))

alpha = light + dark * (1 - light)
gray = np.where(alpha > 0, light / np.maximum(alpha, 1e-6), 0)

# Quantize so the PNG stays small; the texture is viewed at low opacity.
la = np.dstack([np.round(gray * 15) * 17, np.round(np.clip(alpha, 0, 1) * 63) * (255 / 63)]).astype(np.uint8)
Image.fromarray(la).save('assets/images/paper-grain.png', optimize=True)
print('wrote assets/images/paper-grain.png')
