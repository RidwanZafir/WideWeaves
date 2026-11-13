"""
Builds the circular planet thumbnails used by the destination cards.

The cards previously stretched the 2:1 equirectangular map into a 56 px circle,
which looked smeared. This projects one hemisphere orthographically and shades it
with a soft terminator, so the thumbnail reads as a globe.

Usage: python scripts/make-planet-globes.py
Source textures: Solar System Scope (CC BY 4.0) via Wikimedia Commons.
"""

from math import asin, atan2, cos, hypot, pi, sin, sqrt
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SIZE = 192
# Viewer-facing light, upper left, so the disc has a lit and a shadowed side.
LIGHT = (-0.55, 0.35, 0.78)


def normalized_light():
    length = sqrt(sum(c * c for c in LIGHT))
    return tuple(c / length for c in LIGHT)


def bilinear(px, width, height, u, v):
    x = (u % 1.0) * width - 0.5
    y = (v % 1.0) * height - 0.5
    x0, y0 = int(x), int(y)
    fx, fy = x - x0, y - y0
    x1, y1 = (x0 + 1) % width, (y0 + 1) % height
    x0, y0 = x0 % width, y0 % height
    p00, p10 = px[x0, y0], px[x1, y0]
    p01, p11 = px[x0, y1], px[x1, y1]
    out = []
    for i in range(3):
        top = p00[i] * (1 - fx) + p10[i] * fx
        bottom = p01[i] * (1 - fx) + p11[i] * fx
        out.append(top * (1 - fy) + bottom * fy)
    return out


def globe(source: Path, target: Path, lon0_deg: float, lat0_deg: float):
    tex = Image.open(source).convert("RGB")
    width, height = tex.size
    px = tex.load()
    lon0, lat0 = lon0_deg * pi / 180, lat0_deg * pi / 180
    lx, ly, lz = normalized_light()
    out = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    dst = out.load()
    half = SIZE / 2

    for j in range(SIZE):
        y = 1 - 2 * (j + 0.5) / SIZE  # +1 north, -1 south
        for i in range(SIZE):
            x = 2 * (i + 0.5) / SIZE - 1
            r = hypot(x, y)
            if r > 1.02:
                continue
            # soften the limb instead of a hard aliased edge
            alpha = min(1.0, (1.02 - r) / 0.02) * 255
            z = sqrt(max(0.0, 1 - r * r))
            # rotate the view towards the chosen latitude instead of shifting the
            # texture lookup, which would wrap and smear the poles
            y2 = y * cos(lat0) - z * sin(lat0)
            z2 = y * sin(lat0) + z * cos(lat0)
            lat = asin(max(-1.0, min(1.0, y2)))
            lon = lon0 + atan2(x, z2)

            u = (lon + pi) / (2 * pi)
            v = (pi / 2 - lat) / pi

            rr, gg, bb = bilinear(px, width, height, u, v)
            diffuse = max(0.0, x * lx + y * ly + z * lz)
            shade = 0.32 + 0.88 * diffuse**0.8
            shade = min(1.35, shade)
            dst[i, j] = (
                min(255, int(rr * shade)),
                min(255, int(gg * shade)),
                min(255, int(bb * shade)),
                int(alpha),
            )
    out.save(target)


if __name__ == "__main__":
    jobs = [
        ("public/textures/moon.jpg", "public/textures/moon-globe.png", -20.0, 6.0),
        ("public/textures/mars.jpg", "public/textures/mars-globe.png", -40.0, 18.0),
    ]
    for src, dst, lon, lat in jobs:
        globe(ROOT / src, ROOT / dst, lon, lat)
        print("wrote", dst)
