#!/usr/bin/env python3
"""Prepare Android adaptive-icon layers from the supplied square Read∞ artwork.

The source PNG is a white mark on a black square. Android adaptive icons treat
foreground and background as separate layers, so keeping that black square in
the foreground causes launcher normalization to render it as a smaller inset
square. This script keeps the artwork in the foreground as white alpha and
moves the black canvas into the adaptive background layer.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import xml.etree.ElementTree as ET

from PIL import Image, ImageChops, ImageColor

ANDROID_NS = "http://schemas.android.com/apk/res/android"
ET.register_namespace("android", ANDROID_NS)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--res-dir", type=Path, required=True)
    return parser.parse_args()


def artwork_layer(source: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Return a white artwork-only layer with black source pixels made transparent."""
    rgb = source.convert("RGB").resize(size, Image.Resampling.LANCZOS)
    red, green, blue = rgb.split()
    alpha = ImageChops.lighter(ImageChops.lighter(red, green), blue)
    white = Image.new("RGB", size, ImageColor.getrgb("white"))
    return Image.merge("RGBA", (*white.split(), alpha))


def write_background(path: Path) -> None:
    root = ET.Element("resources")
    ET.SubElement(root, "color", {"name": "ic_launcher_background"}).text = "#000000"
    path.write_bytes(ET.tostring(root, encoding="utf-8", xml_declaration=True) + b"\n")


def write_adaptive_icon(path: Path) -> None:
    root = ET.Element("adaptive-icon")
    ET.SubElement(root, "foreground", {f"{{{ANDROID_NS}}}drawable": "@mipmap/ic_launcher_foreground"})
    ET.SubElement(root, "background", {f"{{{ANDROID_NS}}}drawable": "@color/ic_launcher_background"})
    path.write_bytes(ET.tostring(root, encoding="utf-8", xml_declaration=True) + b"\n")


def main() -> None:
    args = parse_args()
    source = Image.open(args.source).convert("RGBA")
    foregrounds = sorted(args.res_dir.glob("mipmap-*/ic_launcher_foreground.png"))
    if not foregrounds:
        raise SystemExit(f"No generated Android foreground layers found under {args.res_dir}")

    for foreground_path in foregrounds:
        with Image.open(foreground_path) as generated:
            size = generated.size
        artwork_layer(source, size).save(foreground_path, format="PNG", optimize=True)
        print(f"Prepared transparent artwork foreground: {foreground_path} ({size[0]}x{size[1]})")

    # Tauri's generated adaptive XML references @color/ic_launcher_background,
    # not a drawable, so update the values resource that Android resolves.
    background = args.res_dir / "values" / "ic_launcher_background.xml"
    background.parent.mkdir(parents=True, exist_ok=True)
    write_background(background)
    print(f"Prepared solid black adaptive background color: {background}")

    adaptive_dir = args.res_dir / "mipmap-anydpi-v26"
    adaptive_dir.mkdir(parents=True, exist_ok=True)
    for name in ("ic_launcher.xml", "ic_launcher_round.xml"):
        adaptive_path = adaptive_dir / name
        write_adaptive_icon(adaptive_path)
        print(f"Prepared adaptive launcher reference: {adaptive_path}")


if __name__ == "__main__":
    main()
