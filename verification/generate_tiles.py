#!/usr/bin/env python3
"""Generate Leaflet-compatible image tiles from a single large source image.

Usage:
  python tools/generate_tiles.py --source path/to/your-image.png --output public/tiles

This script produces a directory tree like:
  public/tiles/0/0/0.png
  public/tiles/1/0/0.png
  public/tiles/1/1/0.png
  public/tiles/1/0/1.png
  ...

It uses a standard tile pyramid where zoom 0 is the smallest overview and the final zoom level is the image's full resolution.
"""

import argparse
import json
import math
from pathlib import Path

from PIL import Image

# Allow large local images for tile generation.
# The default Pillow decompression bomb limit is to prevent untrusted input abuse.
Image.MAX_IMAGE_PIXELS = None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate 256x256 Leaflet tiles from a static image.")
    parser.add_argument("--source", required=True, help="Source image file path")
    parser.add_argument("--output", required=True, help="Output directory root for tiles")
    parser.add_argument("--tile-size", type=int, default=256, help="Tile size in pixels")
    parser.add_argument("--format", default="png", choices=["png", "jpg", "jpeg"], help="Tile image format")
    parser.add_argument("--min-zoom", type=int, default=0, help="Minimum zoom level to generate")
    parser.add_argument("--max-zoom", type=int, default=-1, help="Maximum zoom level to generate; default is computed from source image size")
    parser.add_argument("--metadata", action="store_true", help="Write metadata.json with image dimensions and zoom settings")
    return parser.parse_args()


def compute_max_zoom(width: int, height: int, tile_size: int) -> int:
    max_dimension = max(width, height)
    return max(0, math.ceil(math.log2(max_dimension / tile_size)))


def make_tile(output_dir: Path, zoom: int, x: int, y: int, tile: Image.Image, image_format: str) -> None:
    tile_dir = output_dir / str(zoom) / str(x)
    tile_dir.mkdir(parents=True, exist_ok=True)
    tile_path = tile_dir / f"{y}.{image_format}"
    save_args = {"quality": 90} if image_format in {"jpg", "jpeg"} else {}
    tile.save(tile_path, format=image_format.upper(), **save_args)


def pad_tile(image: Image.Image, tile_size: int) -> Image.Image:
    if image.width == tile_size and image.height == tile_size:
        return image
    background = Image.new("RGBA", (tile_size, tile_size), (0, 0, 0, 0))
    background.paste(image, (0, 0))
    return background


def generate_tiles(source_path: Path, output_path: Path, tile_size: int, min_zoom: int, max_zoom: int, image_format: str, write_metadata: bool) -> dict:
    with Image.open(source_path) as src:
        src = src.convert("RGBA")
        width, height = src.size

        if max_zoom < 0:
            max_zoom = compute_max_zoom(width, height, tile_size)
        elif max_zoom < min_zoom:
            raise ValueError("--max-zoom must be greater than or equal to --min-zoom")

        metadata = {
            "source": str(source_path),
            "width": width,
            "height": height,
            "tile_size": tile_size,
            "min_zoom": min_zoom,
            "max_zoom": max_zoom,
            "tile_format": image_format,
        }

        print(f"Source image: {width}x{height}")
        print(f"Tile size: {tile_size}")
        print(f"Zoom levels: {min_zoom}..{max_zoom}")

        for zoom in range(min_zoom, max_zoom + 1):
            scale = 2 ** (zoom - max_zoom)
            level_width = max(1, math.ceil(width * scale))
            level_height = max(1, math.ceil(height * scale))

            print(f"Generating zoom {zoom}: {level_width}x{level_height} ({scale:.6f} scale)")
            level_image = src.resize((level_width, level_height), Image.LANCZOS)

            cols = math.ceil(level_width / tile_size)
            rows = math.ceil(level_height / tile_size)

            for x in range(cols):
                for y in range(rows):
                    left = x * tile_size
                    upper = y * tile_size
                    right = min(left + tile_size, level_width)
                    lower = min(upper + tile_size, level_height)

                    tile = level_image.crop((left, upper, right, lower))
                    tile = pad_tile(tile, tile_size)
                    make_tile(output_path, zoom, x, y, tile, image_format)

        if write_metadata:
            metadata_path = output_path / "metadata.json"
            metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

        return metadata


def main() -> None:
    args = parse_args()
    source_path = Path(args.source)
    output_path = Path(args.output)
    if not source_path.exists():
        raise FileNotFoundError(f"Source image not found: {source_path}")

    output_path.mkdir(parents=True, exist_ok=True)
    generate_tiles(
        source_path=source_path,
        output_path=output_path,
        tile_size=args.tile_size,
        min_zoom=args.min_zoom,
        max_zoom=args.max_zoom,
        image_format=args.format,
        write_metadata=args.metadata,
    )


if __name__ == "__main__":
    main()
