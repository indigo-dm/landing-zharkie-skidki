from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "optimized" / "content"


def save_webp(source_path: Path, output_name: str, width: int, quality: int) -> None:
    with Image.open(source_path) as source:
        source = source.convert("RGB")
        width = min(width, source.width)
        height = round(source.height * width / source.width)
        resized = source.resize((width, height), Image.Resampling.LANCZOS)
        output_path = OUTPUT / output_name
        resized.save(output_path, "WEBP", quality=quality, method=6)
        print(
            f"{output_name}: {width}x{height}, "
            f"{output_path.stat().st_size / 1024:.1f} KiB"
        )


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)

    map_source = ROOT / "assets" / "user" / "location-map-infographic.jpg"
    save_webp(map_source, "location-map-900.webp", 900, 86)
    save_webp(map_source, "location-map-1600.webp", 1600, 86)

    promo_source = ROOT / "assets" / "user" / "campaign-hot-discounts-square.png"
    save_webp(promo_source, "campaign-hot-540.webp", 540, 86)
    save_webp(promo_source, "campaign-hot-1080.webp", 1080, 86)

    showroom_dir = ROOT / "assets" / "source-showroom"
    for index in range(1, 5):
        save_webp(
            showroom_dir / f"showroom-hq-{index:02}.jpg",
            f"showroom-{index:02}-720.webp",
            720,
            82,
        )

    comfort_dir = ROOT / "assets" / "official"
    for index in range(1, 10):
        source = comfort_dir / f"comfort-{index:02}.jpg"
        with Image.open(source) as image:
            width = image.width
        save_webp(source, f"comfort-{index:02}.webp", width, 82)


if __name__ == "__main__":
    main()
