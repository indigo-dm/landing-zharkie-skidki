from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "user" / "hero-lemonade-discount.png"
OUTPUT = ROOT / "assets" / "optimized"
WIDTHS = (480, 768, 1280, 1920)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)

    with Image.open(SOURCE) as source:
        source = source.convert("RGB")
        for width in WIDTHS:
            height = round(source.height * width / source.width)
            resized = source.resize((width, height), Image.Resampling.LANCZOS)

            webp_path = OUTPUT / f"hero-lemonade-{width}.webp"
            resized.save(webp_path, "WEBP", quality=80, method=6)

            avif_path = OUTPUT / f"hero-lemonade-{width}.avif"
            resized.save(avif_path, "AVIF", quality=58, speed=6)

            print(
                f"{width}x{height}: "
                f"WebP {webp_path.stat().st_size / 1024:.1f} KiB, "
                f"AVIF {avif_path.stat().st_size / 1024:.1f} KiB"
            )


if __name__ == "__main__":
    main()
