"""Read isolated per-language review decisions without shared-file write conflicts."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def language_review(locale):
    path=ROOT/'i18n/language-review'/f'{locale}.json'
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
