#!/usr/bin/env python3
"""Regenerate PWA / favicon / apple-touch icons from public/icon-master.png."""
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
ICONS = PUBLIC / "icons"
MASTER = Path(__file__).resolve().parent / "icon-master.png"

ICONS.mkdir(parents=True, exist_ok=True)

src = Image.open(MASTER).convert("RGBA")

png_targets = [
    (ICONS / "icon-192.png", 192),
    (ICONS / "icon-512.png", 512),
    (PUBLIC / "apple-touch-icon.png", 180),
    (PUBLIC / "favicon-16.png", 16),
    (PUBLIC / "favicon-32.png", 32),
    (PUBLIC / "logo-symbol.png", 256),
    (PUBLIC / "logo.png", 512),
]

for path, size in png_targets:
    img = src.resize((size, size), Image.LANCZOS)
    img.save(path, "PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)} ({size}x{size})")

ico_path = PUBLIC / "favicon.ico"
ico_sizes = [(16, 16), (32, 32), (48, 48)]
src.save(ico_path, sizes=ico_sizes)
print(f"wrote {ico_path.relative_to(ROOT)} ({','.join(f'{s[0]}' for s in ico_sizes)})")
