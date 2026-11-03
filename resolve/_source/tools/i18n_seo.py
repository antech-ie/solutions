"""SEO output for generated locale pages; no publishing or filesystem mutations.

Call apply_seo after translating the page. Production indexing must be requested
explicitly. All locale routes share the existing English /resolve/ entry point.
"""
from __future__ import annotations

import html
import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET
from i18n_reviews import language_review

ROOT = Path(__file__).resolve().parents[1]
SITE_ORIGIN = "https://solutions.antech.ie"
RESOLVE_PATH = "/resolve/"
LOCALES = ("en", "es", "fr", "de", "pl", "it", "nl", "pt-BR", "zh-CN", "ja", "ko", "hi", "tr", "ar")
SVG_TITLE = re.compile(r"<title(?:\s[^>]*)?>.*?</title\s*>", re.I | re.S)


def load_metadata() -> dict:
    metadata = json.loads((ROOT / "i18n" / "seo.json").read_text(encoding="utf-8"))
    if set(metadata) != set(LOCALES):
        raise ValueError("SEO metadata must contain exactly the 14 supported locales")
    for locale, values in metadata.items():
        values.update(language_review(locale).get('metadata', {}))
        if not all(isinstance(values.get(key), str) and values[key].strip() for key in ("title", "description", "ogLocale")):
            raise ValueError(f"Incomplete SEO metadata: {locale}")
    return metadata


def normalise_locale(locale: str) -> str:
    match = next((code for code in LOCALES if code.lower() == locale.lower()), None)
    if match is None:
        raise ValueError(f"Unsupported ReSolve locale: {locale}")
    return match


def locale_path(locale: str) -> str:
    locale = normalise_locale(locale)
    return RESOLVE_PATH + ("" if locale == "en" else locale.lower() + "/")


def locale_url(locale: str) -> str:
    return SITE_ORIGIN + locale_path(locale)


def _attributes(tag: str) -> dict[str, str]:
    # Head metadata is generated with quoted attributes. Also accept unquoted input.
    pattern = r"([\w:-]+)\s*=\s*(?:\"([^\"]*)\"|'([^']*)'|([^\s>]+))"
    return {name.lower(): html.unescape(double or single or bare) for name, double, single, bare in re.findall(pattern, tag)}


def _remove_replaced_metadata(head: str) -> str:
    head = SVG_TITLE.sub("", head)

    def keep_meta(match: re.Match) -> str:
        tag = match[0]
        attrs = _attributes(tag)
        name = attrs.get("name", "").lower()
        prop = attrs.get("property", "").lower()
        if name in {"description", "robots", "googlebot", "bingbot"} or name.startswith("twitter:") or prop.startswith("og:"):
            return ""
        return tag

    def keep_link(match: re.Match) -> str:
        attrs = _attributes(match[0])
        rel = attrs.get("rel", "").lower().split()
        if "canonical" in rel or ("alternate" in rel and "hreflang" in attrs):
            return ""
        return match[0]

    head = re.sub(r"<meta\b[^>]*>", keep_meta, head, flags=re.I)
    head = re.sub(r"<link\b[^>]*>", keep_link, head, flags=re.I)
    # Repeated builds replace only our own structured data, never source evidence.
    head = re.sub(r'<script\b(?=[^>]*\bid=[\"\']resolve-i18n-schema[\"\'])[^>]*>.*?</script\s*>', "", head, flags=re.I | re.S)
    return head


def apply_seo(source_html: str, locale: str, *, production: bool = False) -> str:
    locale = normalise_locale(locale)
    metadata = load_metadata()
    content = metadata[locale]
    url = locale_url(locale)
    image = SITE_ORIGIN + RESOLVE_PATH + "assets/resolve-installed-on-hplc.webp"
    escape = lambda value: html.escape(value, quote=True)
    head_match = re.search(r"(<head\b[^>]*>)(.*?)(</head\s*>)", source_html, re.I | re.S)
    if not head_match:
        raise ValueError("Locale source needs a complete <head> element")
    head = _remove_replaced_metadata(head_match[2]).rstrip()
    tags = [
        f'<title>{html.escape(content["title"])}</title>',
        f'<meta name="description" content="{escape(content["description"])}">',
        f'<meta name="robots" content="{"index,follow" if production else "noindex,nofollow"}">',
        f'<link rel="canonical" href="{url}">',
    ]
    tags.extend(f'<link rel="alternate" hreflang="{code}" href="{locale_url(code)}">' for code in LOCALES)
    tags.append(f'<link rel="alternate" hreflang="x-default" href="{locale_url("en")}">')
    og = {"type": "website", "site_name": "Antech Solutions", "title": content["title"], "description": content["description"], "url": url, "locale": content["ogLocale"], "image": image}
    tags.extend(f'<meta property="og:{key}" content="{escape(value)}">' for key, value in og.items())
    tags.extend(f'<meta property="og:locale:alternate" content="{escape(metadata[code]["ogLocale"])}">' for code in LOCALES if code != locale)
    twitter = {"card": "summary_large_image", "title": content["title"], "description": content["description"], "image": image}
    tags.extend(f'<meta name="twitter:{key}" content="{escape(value)}">' for key, value in twitter.items())
    # A WebPage describes the actual document. No prices, certifications, review
    # ratings, manufacturer claims or universally validated capabilities are added.
    schema = {
        "@context": "https://schema.org", "@type": "WebPage", "@id": url + "#webpage",
        "url": url, "name": content["title"], "description": content["description"],
        "inLanguage": locale, "primaryImageOfPage": {"@type": "ImageObject", "url": image},
        "about": {"@type": "Thing", "name": "ReSolve™"},
        "isPartOf": {"@type": "WebSite", "@id": SITE_ORIGIN + "/#website", "url": SITE_ORIGIN + "/", "name": "Antech Solutions"},
    }
    schema_json = json.dumps(schema, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    tags.append('<script type="application/ld+json" id="resolve-i18n-schema">' + schema_json + '</script>')
    result = source_html[:head_match.start()] + head_match[1] + head + "\n" + "\n".join(tags) + head_match[3] + source_html[head_match.end():]

    def replace_html(match: re.Match) -> str:
        tag = re.sub(r"\s(?:lang|dir)\s*=\s*(?:\"[^\"]*\"|'[^']*'|[^\s>]+)", "", match[0], flags=re.I)
        return tag[:-1] + f' lang="{locale}" dir="{"rtl" if locale == "ar" else "ltr"}">'

    return re.sub(r"<html\b[^>]*>", replace_html, result, count=1, flags=re.I)


def build_sitemap(lastmod: str | None = None) -> str:
    """Return one locale sitemap with reciprocal XHTML alternatives.

    Write to /resolve/sitemap.xml. lastmod is an optional ISO date for an actual
    content change; omit it rather than claiming an unverified modification date.
    """
    if lastmod and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", lastmod):
        raise ValueError("Sitemap lastmod must be an ISO YYYY-MM-DD date")
    ns = "http://www.sitemaps.org/schemas/sitemap/0.9"
    xhtml = "http://www.w3.org/1999/xhtml"
    ET.register_namespace("", ns)
    ET.register_namespace("xhtml", xhtml)
    root = ET.Element(f"{{{ns}}}urlset")
    for locale in LOCALES:
        entry = ET.SubElement(root, f"{{{ns}}}url")
        ET.SubElement(entry, f"{{{ns}}}loc").text = locale_url(locale)
        if lastmod:
            ET.SubElement(entry, f"{{{ns}}}lastmod").text = lastmod
        for alternative in (*LOCALES, "x-default"):
            ET.SubElement(entry, f"{{{xhtml}}}link", {"rel": "alternate", "hreflang": alternative, "href": locale_url("en" if alternative == "x-default" else alternative)})
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode") + "\n"
