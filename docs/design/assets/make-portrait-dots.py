"""Builds portrait-dots.json and portrait-fallback.png from abed-portrait-source.png.

One-time asset generator, not part of the site build. Needs Python 3 with numpy, scipy, Pillow.
Run from this folder: python3 make-portrait-dots.py
"""
import json

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

SRC = 'abed-portrait-source.png'
X0, Y0, S = 175, 130, 900  # square crop of the 1254 x 1254 source: head and shoulders
N = 110  # dot grid is N x N

im = Image.open(SRC).convert('RGB')
a = np.asarray(im).astype(float)
R, B = a[..., 0], a[..., 2]

# Background mask: the blue-grey studio wall, connected to the image border.
bg = (B > 125) & (B - R > 28)
lab, _ = ndimage.label(bg)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
fg = ~np.isin(lab, list(border))
fg = ndimage.binary_opening(fg, iterations=2)
lab2, n2 = ndimage.label(fg)
sizes = ndimage.sum(fg, lab2, range(1, n2 + 1))
fg = ndimage.binary_fill_holes(lab2 == (np.argmax(sizes) + 1))

crop = im.crop((X0, Y0, X0 + S, Y0 + S)).convert('L')
crop = crop.filter(ImageFilter.UnsharpMask(radius=6, percent=160, threshold=2))
L = np.clip((np.asarray(crop).astype(float) - 20) / (230 - 20), 0, 1)
m = fg[Y0:Y0 + S, X0:X0 + S].astype(float)


def box(arr):
    img = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8))
    return np.asarray(img.resize((N, N), Image.BOX)).astype(float) / 255


Lg, mg = box(L * m), box(m)
Ln = np.where(mg > 0.01, Lg / np.maximum(mg, 1e-3), 0)
v = mg * (0.07 + 0.93 * np.power(Ln, 1.7))  # dot strength 0..1
v[mg < 0.3] = 0
ys, xs = np.mgrid[0:N, 0:N]
u, w = (xs + 0.5) / N, (ys + 0.5) / N
fade = np.clip(1 - np.clip((w - 0.78) / 0.22, 0, 1) * 0.75, 0, 1)  # fade the suit toward the bottom
v = v * fade

# Depth for the head-turn parallax: a head ellipse, a neck band, flat shoulders.
head = np.sqrt(np.clip(1 - (((u - 0.5) / 0.2) ** 2 + ((w - 0.333) / 0.27) ** 2), 0, 1))
neck = np.where((np.abs(u - 0.5) < 0.09) & (w > 0.55) & (w < 0.72), 0.3, 0)
d = np.maximum.reduce([head, neck, np.full_like(head, 0.12)]) * (mg > 0.3)

# Eye centres measured on the source photo (pixels 594,422 and 711,427).
eyes = [
    {'x': round((594 - X0) / S, 4), 'y': round((422 - Y0) / S, 4), 'rx': 0.0345, 'ry': 0.0115, 'ir': 0.0135},
    {'x': round((711 - X0) / S, 4), 'y': round((427 - Y0) / S, 4), 'rx': 0.032, 'ry': 0.0115, 'ir': 0.0135},
]
data = {
    'n': N,
    'v': [int(round(x)) for x in (v * 255).flatten()],
    'd': [int(round(x)) for x in (d * 255).flatten()],
    'eyes': eyes,
}
with open('portrait-dots.json', 'w') as f:
    json.dump(data, f, separators=(',', ':'))

# Still fallback: same dots, natural eyes looking straight ahead, transparent background.
P = 920
DOT, SCLERA, BG = (243, 238, 231, 255), (207, 200, 191, 255), (26, 24, 22, 255)
img = Image.new('RGBA', (P, P), (0, 0, 0, 0))
dr = ImageDraw.Draw(img)
st = P / N
nat = [dict(e, rx=e['rx'] * 0.84, ry=0.0085, ir=0.0105) for e in eyes]
for j in range(N):
    for i in range(N):
        val = v[j, i]
        if val <= 0.03:
            continue
        if any(((u[j, i] - e['x']) / (e['rx'] * 1.08)) ** 2 + ((w[j, i] - e['y']) / (e['ry'] * 1.25)) ** 2 < 1 for e in nat):
            continue
        r = st * 0.52 * val ** 0.75
        cx, cy = (i + 0.5) * st, (j + 0.5) * st
        dr.ellipse([cx - r, cy - r, cx + r, cy + r], fill=DOT)
for e in nat:
    cx, cy, rx, ry = e['x'] * P, e['y'] * P, e['rx'] * P, e['ry'] * P
    mask = Image.new('L', (P, P), 0)
    ImageDraw.Draw(mask).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
    layer = Image.new('RGBA', (P, P), BG)
    ld = ImageDraw.Draw(layer)
    f = ry * 0.5
    yy = cy - ry
    while yy <= cy + ry:
        xx = cx - rx
        while xx <= cx + rx:
            dd = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
            if dd <= 1:
                rr = f * 0.55 * (1 - 0.5 * dd)
                ld.ellipse([xx - rr, yy - rr, xx + rr, yy + rr], fill=SCLERA)
            xx += f
        yy += f
    pr = e['ir'] * P
    ld.ellipse([cx - pr, cy - pr, cx + pr, cy + pr], fill=BG)
    cr = max(0.8, pr * 0.14)
    ld.ellipse([cx - pr * 0.45 - cr, cy - pr * 0.4 - cr, cx - pr * 0.45 + cr, cy - pr * 0.4 + cr], fill=DOT)
    img.paste(layer, (0, 0), mask)
img.save('portrait-fallback.png', optimize=True)
print('portrait-dots.json and portrait-fallback.png written')
