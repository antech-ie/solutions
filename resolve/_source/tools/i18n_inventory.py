"""Read-only inventory of English DOM text, attributes, reports and JS display strings.

Run from any directory. Does not alter source HTML, scripts or scientific payloads.
The lexical JS audit is intentionally a superset, not an automatic assertion that
every string literal is UI text. Keep the raw source/context for human review.
"""
from pathlib import Path
from html.parser import HTMLParser
import base64
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "site/resolve/index.html"
if not SOURCE.exists():
    SOURCE = ROOT / "english.html"
OUT = ROOT / "i18n/inventory.json"
ATTRIBUTES = {"alt", "title", "placeholder", "aria-label", "aria-description", "aria-valuetext"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
entries = {}
scripts = []
templates = []
payloads = []


def normalize(value):
    return re.sub(r"\s+", " ", value).strip()


def add(value, occurrence):
    value = normalize(value)
    if not value:
        return
    key = "text." + hashlib.sha256(value.encode()).hexdigest()[:12]
    if value not in entries:
        entries[value] = {"key": key, "source": value, "containsWords": bool(re.search(r"[A-Za-z]{2,}", value)), "occurrences": []}
    if occurrence not in entries[value]["occurrences"]:
        entries[value]["occurrences"].append(occurrence)


class InventoryHTML(HTMLParser):
    def __init__(self, document, source_kind="html"):
        super().__init__(convert_charrefs=True)
        self.document = document
        self.kind = source_kind
        self.stack = []
        self.current = None

    def context(self, kind):
        return {"kind": kind, "document": self.document, "line": self.getpos()[0], "path": "/".join(x[0] + ("#" + x[1] if x[1] else "") for x in self.stack)}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag not in VOID:
            self.stack.append((tag, attrs.get("id", "")))
        if tag == "script":
            self.current = {"attrs": attrs, "source": "", "document": self.document, "line": self.getpos()[0]}
        if tag not in {"script", "style"}:
            for name in ATTRIBUTES:
                if attrs.get(name):
                    add(attrs[name], dict(self.context(self.kind + "-attribute"), attribute=name))
            if tag == "meta" and attrs.get("content") and (attrs.get("name") == "description" or attrs.get("property", "").startswith("og:")):
                if attrs.get("property") not in {"og:url", "og:image", "og:type"}:
                    add(attrs["content"], dict(self.context(self.kind + "-metadata"), attribute="content"))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == "script" and self.current is not None:
            scripts.append(self.current)
            self.current = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                self.stack = self.stack[:i]
                break

    def handle_data(self, text):
        if self.current is not None:
            self.current["source"] += text
        elif not any(tag in {"style", "script"} for tag, _ in self.stack):
            add(text, self.context(self.kind + "-text"))


def decode_js_literal(value):
    # Decode only JS escapes, leaving real Unicode characters undisturbed.
    return re.sub(r"\\(?:u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2})|([nrtbfv\\'\"`]))", lambda m: chr(int(m[1] or m[2], 16)) if m[1] or m[2] else {"n": "\n", "r": "\r", "t": "\t", "b": "\b", "f": "\f", "v": "\v"}.get(m[3], m[3]), value)


def audit_js(source, document, line=1):
    # A lexical superset including templates; formula/interpolation expressions
    # are retained separately and must never be sent to translation as prose.
    pattern = re.compile(r"//[^\n]*|/\*[\s\S]*?\*/|'(?:\\[\s\S]|[^'\\])*'|\"(?:\\[\s\S]|[^\"\\])*\"|`(?:\\[\s\S]|[^`\\])*`", re.M)
    for match in pattern.finditer(source):
        token = match.group()
        if token.startswith(("//", "/*")):
            continue
        raw = token[1:-1]
        text = decode_js_literal(raw)
        context = {"kind": "js-literal", "document": document, "line": line + source.count("\n", 0, match.start())}
        if token[0] == "`" and "${" in raw:
            templates.append(dict(context, raw=raw, expressions=re.findall(r"\$\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}", raw)))
            # Independent English fragments are useful to the DOM observer.
            text = re.sub(r"\$\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}", "{value}", text)
            context["kind"] = "js-template-candidate"
        if not re.search(r"[A-Za-z]{2,}", text):
            continue
        # Selectors, element IDs, event names and property tokens are kept in the
        # raw literal list only when they contain spaces/markup/human punctuation.
        if not re.search(r"\s|[<>·→←↗™%€]", text) and not text[:1].isupper():
            continue
        if "<" in text and ">" in text:
            parser = InventoryHTML(document + ":literal@" + str(context["line"]), "js-html")
            parser.feed(text)
        else:
            add(text, context)


def main():
    text = SOURCE.read_text(encoding="utf-8")
    parser = InventoryHTML("index.html")
    parser.feed(text)
    original_scripts = list(scripts)
    for i, script in enumerate(original_scripts):
        attrs, content = script["attrs"], script["source"]
        identifier = attrs.get("id") or f"script-{i:02}"
        if attrs.get("type") == "application/json":
            data = json.loads(content)
            payloads.append({"id": identifier, "sha256": hashlib.sha256(content.encode()).hexdigest(), "bytes": len(content.encode()), "kind": type(data).__name__})
            if identifier == "example-report-payloads":
                for report_i, packed in enumerate(data):
                    report = base64.b64decode(packed).decode("utf-8")
                    report_parser = InventoryHTML(f"report-{report_i + 1}.html", "report")
                    report_parser.feed(report)
            continue
        if attrs.get("src"):
            if attrs["src"].startswith(("http://", "https://")):
                continue
            src_path = attrs["src"].split("?")[0]
            resource = SOURCE.parent / src_path
            if not resource.exists():resource = ROOT.parent / src_path.removeprefix('/resolve/')
            content = resource.read_text(encoding="utf-8")
            audit_js(content, src_path)
        else:
            audit_js(content, "index.html#" + identifier, script["line"])
    # Report documents may contain their own dynamically produced labels.
    for script in scripts[len(original_scripts):]:
        if script["attrs"].get("type", "") not in {"application/json", "application/ld+json"}:
            audit_js(script["source"], script["document"] + ":script", script["line"])
    data = {"source": str(SOURCE.relative_to(ROOT)), "sourceSHA256": hashlib.sha256(text.encode()).hexdigest(), "normalization": "HTML entities decoded; Unicode whitespace collapsed and edges trimmed; exact English source strings are translation keys", "method": "HTMLParser static text/attributes/metadata + decoded base64 report HTML + conservative lexical JavaScript display-candidate audit. JS candidates require classification; original PDF bytes are excluded.", "uniqueStrings": len(entries), "wordBearingStrings": sum(x["containsWords"] for x in entries.values()), "occurrences": sum(len(x["occurrences"]) for x in entries.values()), "entries": sorted(entries.values(), key=lambda x: x["source"]), "dynamicTemplates": templates, "scientificPayloads": payloads}
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Inventory: {data['uniqueStrings']} unique strings; {data['wordBearingStrings']} word-bearing; {data['occurrences']} occurrences; {len(templates)} JS templates; {len(payloads)} scientific payloads.")


def classified_messages():
    """Optional seed refresh; deliberately not run by the normal audit command.

    Translation files use exact English source keys, not the audit hash labels.
    Existing manually added source keys are retained when a seed is refreshed.
    """
    program = {"ArrowLeft", "ArrowRight", "Home", "End", "Enter", "Content-Type", "EUR", "POST", "Submission failed", "use strict", "pilot-form-status error", "pilot-form-status success", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", "mL/min", "HPLC", "HPLCs", "Y", "k", "t CO₂e", "€/unit"}
    invariant = {"ReSolve", "ReSolve™", "Antech", "Antech Solutions", "ANTECH SOLUTIONS", "HPLC", "HPLCs", "ACN", "MeOH", "PMBrc / SETU", "PMBrc", "SETU", "GMP", "CO₂e", "CO₂", "NPV", "ROI", "N/A", "HETP", "RSD", "UV", "PAH", "Ph. Eur.", "USP", "Waters", "Thermo Fisher Scientific", "EU", "€", "pH"}
    path = ROOT / "i18n/source-messages.json"
    messages = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    allowed, fragments = [], []
    for item in entries.values():
        value = item["source"]
        if not item["containsWords"]:
            continue
        if all(context["kind"].startswith("js") for context in item["occurrences"]):
            if value in program or value.startswith((".", "#", "<", "stroke-", "points=", "px", "H1010")):
                continue
            raw = value
            if 'aria-label="' in value:
                value = value.split('aria-label="', 1)[1].split('"', 1)[0]
            elif ">" in value:
                value = value.rsplit(">", 1)[-1]
            elif value.startswith(('"', ") rotate")) or re.search(r"\b(?:cx|cy|fill|width|height|stroke|font-size|role|text-anchor)=", value):
                continue
            value = normalize(value.split('"', 1)[0])
            if value != raw and re.search(r"[A-Za-z]{2,}", value):
                fragments.append({"source": value, "raw": raw, "contexts": item["occurrences"]})
        if not re.search(r"[A-Za-z]{2,}", value):
            continue
        if value in invariant or re.fullmatch(r"(?:[A-Z]{1,6}(?:[ /–-][A-Z]{1,6})*|[A-Z]?[0-9]+[A-Za-z]?)", value):
            allowed.append(value)
            continue
        if (any(term in value for term in [" / Pexels", "CIRCULÉIRE", "Potting et al."]) and len(value) < 50) or re.match(r"^(?:https?://|[\w.-]+@)", value):
            allowed.append(value)
            continue
        messages[value] = value
    path.write_text(json.dumps(dict(sorted(messages.items())), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ROOT / "i18n/invariant-allowlist.json").write_text(json.dumps({"description": "Product names, acronyms, source attribution and technical invariants excluded from prose translation. Numeric-only nodes are also invariant. Expand only with documented justification.", "strings": sorted(set(allowed)), "excludedProgramTokens": sorted(program), "dynamicMarkupFragments": fragments}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Classified seed: {len(messages)} exact English keys.")


if __name__ == "__main__":
    main()
    import sys
    if "--refresh-messages" in sys.argv:
        classified_messages()
