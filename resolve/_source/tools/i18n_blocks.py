"""Translate complete inline blocks while preserving original interactive elements.

Numbered placeholders move existing links/buttons/emphasis; translations never supply HTML.
"""
import json
import re
import unicodedata
from pathlib import Path
from bs4 import NavigableString, Tag
from i18n_number_format import format_groups
from i18n_reviews import language_review

ROOT=Path(__file__).resolve().parents[1]

def normalize(text):
    return re.sub(r'\s+',' ',unicodedata.normalize('NFC',text)).strip()

def source_text(element):
    parts=[]
    for text in element.find_all(string=True):
        if text.find_parent(attrs={'aria-hidden':'true'}) or text.find_parent(attrs={'data-i18n-document-language':'en'}):
            continue
        if text.strip(): parts.append(str(text))
    return normalize(' '.join(parts))

def load_overrides(locale):
    result={}
    path=ROOT/'i18n/compound-overrides.json'
    if path.exists():
        for source,locales in json.loads(path.read_text(encoding='utf-8')).items():
            if locale in locales: result[normalize(source)]=locales[locale]
    polish=ROOT/'i18n/polish-sentence-overrides.json'
    if locale=='pl' and polish.exists():
        result.update({normalize(k):v for k,v in json.loads(polish.read_text(encoding='utf-8')).items()})
    result.update({normalize(k):v for k,v in language_review(locale).get('blocks',{}).items()})
    return result

def apply_blocks(soup,locale,formats=None):
    overrides=load_overrides(locale)
    if not overrides:return {}
    candidates=list(soup.select('p,h1,h2,h3,h4,summary,label,figcaption,li,button,a'))
    targets={key:[e for e in candidates if source_text(e)==key] for key in overrides}
    applied={}
    for key,matches in targets.items():
        if not matches:raise ValueError(f'{locale}: whole-sentence source block not found: {key}')
        # A li wrapping just one p has the same text. Keep the more specific inner block.
        matches=[element for element in matches if not any(other is not element and element in other.parents for other in matches)]
        entry=overrides[key]
        if isinstance(entry,str):entry={'text':entry}
        template=format_groups(key,entry['text'],formats or {})
        for element in matches:
            notes=[child for child in list(element.children) if isinstance(child,Tag) and child.has_attr('data-i18n-document-language')]
            slots=[child for child in list(element.children) if isinstance(child,Tag) and child.name!='br' and child not in notes]
            tokens=[int(number) for number in re.findall(r'\{(\d+)\}',template)]
            if sorted(tokens)!=list(range(len(slots))):
                raise ValueError(f'{locale}: each original inline element must occur exactly once in {key!r}; expected {len(slots)} slots, got {tokens}')
            for number,label in entry.get('slots',{}).items():
                child=slots[int(number)]
                badges=[note.extract() for note in child.select('[data-i18n-document-language]')]
                child.clear();child.append(NavigableString(format_groups(key,label,formats or {})))
                child['data-resolve-reviewed-label']='true'
                for badge in badges:child.append(badge)
            for slot in slots:slot.extract()
            for note in notes:note.extract()
            element.clear()
            element['data-resolve-reviewed-block']='true'
            for part in re.split(r'(\{\d+\})',template):
                if re.fullmatch(r'\{\d+\}',part):element.append(slots[int(part[1:-1])])
                elif part:element.append(NavigableString(part))
            for note in notes:element.append(note)
        applied[key]=len(matches)
    return applied
