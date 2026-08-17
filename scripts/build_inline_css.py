from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "index.html"
CSS_PATHS = [ROOT / "styles.css", ROOT / "responsive.css", ROOT / "typography.css"]
START = "/* INLINE_CSS_START */"
END = "/* INLINE_CSS_END */"


def main() -> None:
    html = HTML_PATH.read_text(encoding="utf-8")
    if html.count(START) != 1 or html.count(END) != 1:
        raise RuntimeError("Inline CSS markers are missing or duplicated")

    css_parts = []
    for path in CSS_PATHS:
        css_parts.append(f"/* Source: {path.name} */\n{path.read_text(encoding='utf-8').strip()}")
    bundle = "\n\n".join(css_parts)

    before, rest = html.split(START, 1)
    _, after = rest.split(END, 1)
    HTML_PATH.write_text(f"{before}{START}\n{bundle}\n{END}{after}", encoding="utf-8")
    print(f"Inlined {len(bundle.encode('utf-8'))} bytes of CSS into {HTML_PATH.name}")


if __name__ == "__main__":
    main()
