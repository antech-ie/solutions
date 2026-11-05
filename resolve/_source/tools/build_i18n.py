"""Generate independently indexable locale routes from one preserved ReSolve source.

Run from any directory. The default destination is a noindex review preview.
No upload or deployment is performed by this command.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import unicodedata
from pathlib import Path
from urllib.parse import urlsplit

from bs4 import BeautifulSoup, Comment, Doctype, NavigableString
from i18n_blocks import apply_blocks
from i18n_number_format import build_formats, format_groups
from i18n_reviews import language_review

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ['en', 'es', 'fr', 'de', 'pl', 'it', 'nl', 'pt-BR', 'zh-CN', 'ja', 'ko', 'hi', 'tr', 'ar']
ORIGIN = 'https://solutions.antech.ie'
ATTRIBUTES = ['alt', 'title', 'aria-label', 'aria-description', 'placeholder']


def normalize(value):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFC', value)).strip()


def route(locale):
    return '/resolve/' + ('' if locale == 'en' else locale.lower() + '/')


def absolute_resource(value):
    if not value or value.startswith(('#', '/', 'data:', 'blob:', 'http:', 'https:', 'mailto:', 'tel:', 'javascript:')):
        return value
    return '/resolve/' + value.removeprefix('./')


def version_resources(soup, output_root):
    """Prevent existing production/browser caches from retaining the previous presentation script."""
    for element in soup.select('script[src],link[rel="stylesheet"][href]'):
        attribute = 'src' if element.name == 'script' else 'href'
        value = element[attribute]
        if not value.startswith('/resolve/'):
            continue
        path = urlsplit(value).path
        file = output_root / path.lstrip('/')
        if file.is_file():
            digest = hashlib.sha256(file.read_bytes()).hexdigest()[:12]
            element[attribute] = path + '?v=' + digest


def dictionary(locale):
    path = ROOT / 'i18n' / 'locales' / f'{locale}.json'
    if not path.exists():
        return {}, []
    data = json.loads(path.read_text(encoding='utf-8-sig'))
    messages = dict(data.get('messages', data))
    supplemental = ROOT / 'i18n' / 'supplemental-messages.json'
    if supplemental.exists():
        messages.update(json.loads(supplemental.read_text(encoding='utf-8')).get(locale, {}))
    messages.update(language_review(locale).get('supplemental', {}))
    return {normalize(k): v for k, v in messages.items() if isinstance(v, (str, dict))}, data.get('patterns', [])


def render_text(source, messages, formats=None):
    key = normalize(source)
    target = messages.get(key)
    if isinstance(target, dict):
        target = target.get('other') or target.get('one')
    if not isinstance(target, str):
        target=source.strip()
    target=format_groups(source,target,formats or {})
    before = source[:len(source)-len(source.lstrip())]
    after = source[len(source.rstrip()):]
    return before + target + after


def annotate_documents(soup):
    # Source documents retain their original bytes and scientific figures.
    for link in soup.find_all('a', href=True):
        if (re.search(r'\.pdf(?:[?#]|$)', link['href'], re.I)
                or str(link.get('download', '')).lower().endswith('.pdf')
                or link['href'].startswith('#evidence-pdf-')):
            note = soup.new_tag('span', attrs={'class': 'rv-source-language', 'data-i18n-document-language': 'en'})
            note.string = 'English-language document'
            link.append(note)
    for video in soup.select('.rv-profile-video'):
        note = soup.new_tag('p', attrs={'class': 'rv-source-language'})
        note.string = 'Video in English.'
        video.append(note)


def english_editorial(soup):
    """English-only presentation changes; original source and other translations are retained."""
    record = ROOT/'i18n/english-editorial-20261104.json'
    if not record.exists():
        return
    rows = json.loads(record.read_text(encoding='utf8'))['rows']
    caption = soup.select_one('#resolve-overview figcaption')
    if caption:
        caption.decompose()
    for title in soup.select('#rv-paper-title-quality,#rv-paper-title-research'):
        title.clear();title.append('Read the PMBrc / SETU evaluation')
    paragraphs = [r['changes'] for r in rows if r['section']=='PMBRC introduction in Quality and Research']
    for selector in ['#view-quality .study-source-row', '#view-research .evidence-link-card']:
        target=soup.select_one(selector)
        if not target:raise ValueError('PMBRC introduction target missing: '+selector)
        context=soup.new_tag('section',attrs={'class':'rv-pmbrc-context'})
        heading=soup.new_tag('h3');heading.string='About PMBRC';context.append(heading)
        for value in paragraphs:
            paragraph=soup.new_tag('p');paragraph.string=value;context.append(paragraph)
        sources=soup.new_tag('p',attrs={'class':'small'})
        for index,(label,url) in enumerate([('About PMBRC','https://pmbrc.org/'),('Pharma Industry Award','https://research.setu.ie/en/prizes/research-and-development-achievement-award-pmbrc/')]):
            if index:sources.append(' · ')
            link=soup.new_tag('a',href=url,target='_blank',rel='noopener');link.string=label+' ↗';sources.append(link)
        context.append(sources)
        target.insert_after(context)


def polish_editorial(soup):
    """Apply the new English presentation to Polish with reviewed Polish copy only."""
    path = ROOT/'i18n/polish-editorial-20261104.json'
    if not path.exists():
        return
    record = json.loads(path.read_text(encoding='utf8'))
    english_editorial(soup)
    for title in soup.select('#rv-paper-title-quality,#rv-paper-title-research'):
        title.string = record['whitePaperTitle']
    paragraphs = record['pmbrcParagraphs']
    labels = record['pmbrcSourceLabels']
    if len(paragraphs)!=2 or len(labels)!=2:
        raise ValueError('Polish PMBRC context requires two paragraphs and two source labels')
    for context in soup.select('.rv-pmbrc-context'):
        context.h3.string = record['pmbrcHeading']
        for paragraph,value in zip(context.find_all('p',recursive=False)[:2],paragraphs):
            paragraph.string = value
        for link,label in zip(context.select('a'),labels):
            link.string = label+' ↗'


def locale_editorial(soup, locale):
    """Apply the current presentation with a dedicated locale's reviewed copy."""
    path = ROOT/'i18n/editorial-20261104'/f'{locale}.json'
    if not path.exists():
        return
    record = json.loads(path.read_text(encoding='utf8'))
    paragraphs = record['pmbrcParagraphs']
    labels = record['pmbrcSourceLabels']
    if len(paragraphs)!=2 or len(labels)!=2 or not all(
        isinstance(value,str) and value.strip()
        for value in [record['whitePaperTitle'],record['pmbrcHeading'],*paragraphs,*labels]
    ):
        raise ValueError(f'{locale}: complete reviewed PMBRC copy is required')
    english_editorial(soup)
    # The complete reviewed hero is already localized. Some languages share
    # words with English; translating its separate emphasis nodes again can
    # duplicate a noun (for example French "phase mobile mobile").
    soup.select_one('#resolve-overview-title')['translate'] = 'no'
    if locale in ['ja','zh-CN']:
        heading=soup.select_one('#resolve-overview-title')
        prefix=soup.new_tag('span',style='white-space:nowrap;color:inherit')
        prefix.append(heading.contents[0].extract())
        heading.insert(0,prefix)
        heading.em['style'] = 'white-space:nowrap'
    if locale == 'ko':
        soup.select_one('#resolve-overview-title')['style'] = 'word-break:keep-all'
    if locale == 'ar':
        for measurement in soup.select('.analytical-kpis strong'):
            if re.fullmatch(r'[\d.,]+\s*→\s*[\d.,]+\s*min',measurement.get_text()):
                measurement['dir']='ltr'
                measurement['style']='text-align:right;unicode-bidi:isolate'
    for title in soup.select('#rv-paper-title-quality,#rv-paper-title-research'):
        title.string = record['whitePaperTitle']
    for context in soup.select('.rv-pmbrc-context'):
        context.h3.string = record['pmbrcHeading']
        for paragraph,value in zip(context.find_all('p',recursive=False)[:2],paragraphs):
            paragraph.string = value
        for link,label in zip(context.select('a'),labels):
            link.string = label+' ↗'


def english_quality_layout(soup):
    """Apply the English browser annotations without changing other locale routes."""
    stylesheet=ROOT/'i18n/english-quality-layout-20261105.css'
    if not stylesheet.exists():
        return
    link=soup.select_one('#resolve-overview .rv-overview-copy > a.rv-text-link')
    if link:
        link.decompose()
    for selector in ['#resolve-overview .rv-suitability','#resolve-principle .rv-process-heading > p']:
        element=soup.select_one(selector)
        if element:
            element.decompose()
    title=soup.select_one('#resolve-principle-title')
    for text in list(title.find_all(string=True)):
        if 'Return eligible baseline flow.' in str(text):
            text.replace_with(str(text).replace('Return eligible baseline flow.','Return baseline flow.'))
    targets=[
        '#view-quality > section.quality-study:first-child',
        '#view-quality > section.setu-section-one',
        '#quality-analytical-checks',
        '#quality-audit-extract',
        '#quality-evidence',
    ]
    for selector in targets:
        section=soup.select_one(selector)
        if not section:
            raise ValueError('English dropdown target missing: '+selector)
        band=section.find('div',class_='quality-panel-band',recursive=False)
        if not band:
            raise ValueError('English dropdown heading missing: '+selector)
        section['class']=section.get('class',[])+['rv-collapsible']
        details=soup.new_tag('details',attrs={'class':'rv-quality-dropdown'})
        band.extract();band.name='summary'
        details.append(band)
        body=soup.new_tag('div',attrs={'class':'rv-quality-dropdown-body'})
        for child in list(section.contents):
            body.append(child.extract())
        details.append(body);section.append(details)
    principle=soup.select_one('#resolve-principle')
    details=soup.new_tag('details',attrs={'class':'rv-quality-dropdown rv-principle-dropdown'})
    summary=soup.new_tag('summary',attrs={'class':'quality-panel-band'})
    summary.string='The recovery principle'
    details.append(summary)
    body=soup.new_tag('div',attrs={'class':'rv-quality-dropdown-body'})
    for child in list(principle.contents):
        body.append(child.extract())
    eyebrow=body.select_one('.rv-process-heading .eyebrow')
    if eyebrow:
        eyebrow.decompose()
    details.append(body);principle.append(details)
    style=soup.new_tag('style',id='resolve-english-quality-layout')
    style.string=stylesheet.read_text(encoding='utf8')
    soup.head.append(style)


def shared_sources(soup, output):
    target = output / 'assets' / 'i18n'
    target.mkdir(parents=True, exist_ok=True)
    data = {}
    script_manifest = []
    for index, script in enumerate(list(soup.find_all('script'))):
        body = script.string if script.string is not None else script.get_text()
        if script.get('type') == 'application/json':
            data[script['id']] = body
            script.decompose()
        elif not script.get('src') and script.get('type') in (None, '', 'text/javascript', 'application/javascript'):
            digest = hashlib.sha256(body.encode()).hexdigest()
            name = f'engine-{index:02}-{digest[:10]}.js'
            (target / name).write_text(body, encoding='utf-8', newline='')
            script.clear()
            script['src'] = '/resolve/assets/i18n/' + name
            script_manifest.append({'file': name, 'id': script.get('id'), 'sha256': digest})
    bootstrap = '(()=>{const data=' + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + ';for(const [id,text] of Object.entries(data)){const s=document.createElement("script");s.type="application/json";s.id=id;s.textContent=text;document.head.append(s);}})();\n'
    (target / 'source-data.js').write_text(bootstrap, encoding='utf-8')
    return script_manifest


def build(args):
    output_root = Path(args.output).resolve() if args.output else ROOT / 'international-preview'
    output = output_root / 'resolve'
    output.mkdir(parents=True, exist_ok=True)
    source = ROOT / 'site' / 'resolve'
    if not source.exists():
        source = ROOT.parent  # Portable authoring package lives in resolve/_source/.
    template = ROOT/'english.html' if (ROOT/'english.html').exists() else source/'index.html'
    # Shared images, PDFs, styles and presentation script are copied once.
    if (source/'assets').resolve() != (output/'assets').resolve():
        shutil.copytree(source / 'assets', output / 'assets', dirs_exist_ok=True)
    for name in ['legacy.css', 'redesign.css', 'redesign.js']:
        if (source/name).resolve() != (output/name).resolve():
            shutil.copy2(source / name, output / name)
    # Presentation artwork URLs are the only runtime-created relative resource URLs.
    # Original inline scientific/functional script bodies stay byte-identical.
    presentation = (output / 'redesign.js').read_text(encoding='utf-8')
    presentation = presentation.replace("const artSource='assets/'", "const artSource='/resolve/assets/'")
    (output / 'redesign.js').write_text(presentation, encoding='utf-8', newline='')
    base = BeautifulSoup(template.read_text(encoding='utf-8'), 'html.parser')
    annotate_documents(base)
    ui = ROOT / 'i18n' / 'language-ui.html'
    if ui.exists():
        fragment = BeautifulSoup(ui.read_text(encoding='utf-8'), 'html.parser')
        # UI designer may supply a separate persistent control and banner.
        header_control = fragment.select_one('[data-i18n-header-control], #rv-language-control')
        if header_control:
            base.select_one('.brand-bar').append(header_control.extract())
        overview = base.find(id='resolve-overview')
        for node in list(fragment.contents):
            if isinstance(node, NavigableString) and not node.strip():
                continue
            overview.insert_before(node.extract())
    for element in base.select('.rv-brand,#rv-language-toggle,.rv-paper-preview,.quality-evidence a[aria-label],#quality-evidence a[aria-label],.rv-video-play'):
        if element.get('aria-label') and element.get_text(strip=True):
            element['aria-description']=element.attrs.pop('aria-label')
            element.attrs.pop('data-i18n-aria-label', None)
    for index, region in enumerate(base.select('.value-scroll')):
        region['tabindex']='0';region['role']='region'
        section=region.find_parent('section')
        heading=section.find(['h2','h3']) if section else None
        if heading:
            if not heading.get('id'):heading['id']='rv-value-scroll-title-'+str(index)
            region['aria-labelledby']=heading['id']
    script_manifest = shared_sources(base, output)
    if args.production:
        # Retain the exact analytics integration already present in production.
        # Review previews deliberately do not load it.
        recovery_path=ROOT/'recovery'/'resolve-live.html'
        if not recovery_path.exists():recovery_path=ROOT/'analytics.html'
        recovery = BeautifulSoup(recovery_path.read_text(encoding='utf-8'), 'html.parser')
        analytics = recovery.find('script', src='https://cloud.umami.is/script.js')
        if analytics:
            base.head.append(analytics.extract())
    resources = output / 'assets' / 'i18n'
    for name in ['runtime.js', 'language-ui.js', 'language-ui.css', 'number-display.js', 'number-display.css', 'rtl.css', 'startup.js']:
        path = ROOT / 'i18n' / name
        if path.exists():
            shutil.copy2(path, resources / name)
    base.head.insert(0,base.new_tag('script',src='/resolve/assets/i18n/startup.js'))
    base.select_one('#rv-language-banner')['hidden']=''
    base.select_one('#rv-language-toggle')['aria-expanded']='false'
    for name in ['language-ui.css', 'number-display.css']:
        if (resources / name).exists():
            base.head.append(base.new_tag('link', rel='stylesheet', href='/resolve/assets/i18n/'+name))
    source_note_style=base.new_tag('style', attrs={'id':'resolve-source-language-style'})
    source_note_style.string='.rv-source-language{display:block;font-size:.75rem;line-height:1.5;font-weight:400;letter-spacing:normal;margin-block:.35rem 0;opacity:1}.rv-profile-video>.rv-source-language{grid-column:1/-1;margin-block:0;color:#526675}'
    base.head.append(source_note_style)
    # The data bootstrap is loaded before any original executable script.
    bootstrap_tag = base.new_tag('script', src='/resolve/assets/i18n/source-data.js')
    base.head.append(bootstrap_tag)
    available = {}
    english, _ = dictionary('en')
    source_values=list(english)+[str(text) for text in base.find_all(string=True) if text.parent.name not in ['script','style']]
    number_formats=build_formats(LOCALES,source_values)
    headings_path = ROOT / 'i18n' / 'hero-headings.json'
    headings = json.loads(headings_path.read_text(encoding='utf-8')) if headings_path.exists() else {}
    for locale in LOCALES:
        messages, patterns = dictionary(locale)
        missing = sorted(k for k in english if not isinstance(messages.get(k), (str, dict)) or not messages.get(k))
        if missing and locale != 'en' and not args.allow_incomplete:
            raise SystemExit(f'{locale}: {len(missing)} missing translation keys. Use --allow-incomplete only during development.')
        soup = BeautifulSoup(str(base), 'html.parser')
        soup.html['lang'] = locale
        soup.html['dir'] = 'rtl' if locale == 'ar' else 'ltr'
        soup.html['data-resolve-locale'] = locale
        soup.html['data-resolve-route'] = route(locale)
        selected_card = soup.select_one('[data-locale="'+locale+'"]')
        if selected_card:
            for card in soup.select('.rv-language-card'):
                card.attrs.pop('aria-current', None)
            selected_card['aria-current'] = 'page'
            current = soup.select_one('.rv-language-current')
            current.string = selected_card.select_one('.rv-language-native').get_text()
            current['lang'] = locale
            current['dir'] = 'rtl' if locale == 'ar' else 'ltr'
        if locale == 'ar' and (resources/'rtl.css').exists():
            soup.head.append(soup.new_tag('link', rel='stylesheet', href='/resolve/assets/i18n/rtl.css'))
        whole_blocks = apply_blocks(soup, locale, number_formats[locale])
        for text in list(soup.find_all(string=True)):
            if (isinstance(text, (Comment, Doctype)) or text.parent.name in ['script', 'style']
                    or text.find_parent(attrs={'translate':'no'})
                    or text.parent.has_attr('data-resolve-reviewed-block')
                    or text.parent.has_attr('data-resolve-reviewed-label')):
                continue
            if normalize(text):
                text.replace_with(render_text(str(text), messages, number_formats[locale]))
        heading_parts=language_review(locale).get('hero') or headings.get(locale)
        if heading_parts:
            heading = soup.find(id='resolve-overview-title')
            heading.clear()
            heading.append(heading_parts['prefix'])
            emphasis = soup.new_tag('em')
            emphasis.string = heading_parts['emphasis']
            heading.append(emphasis)
            if heading_parts.get('suffix'):
                heading.append(heading_parts['suffix'])
        for element in soup.find_all(True):
            for attr in ATTRIBUTES:
                if isinstance(element.get(attr), str):
                    element[attr] = render_text(element[attr], messages, number_formats[locale])
            for resource_attr in ['src', 'href', 'poster']:
                if isinstance(element.get(resource_attr), str):
                    element[resource_attr] = absolute_resource(element[resource_attr])
            if isinstance(element.get('style'), str):
                element['style'] = re.sub(r'url\(([\'"]?)([^)\'"\s]+)\1\)', lambda match: 'url('+match[1]+absolute_resource(match[2])+match[1]+')', element['style'])
        for element in soup.select('td,output,[data-roi],[id$="-output"],[id$="-total"],[id$="-saving"],[id$="-litres"],[id$="-npv"],[id$="-roi"],[id$="-payback"]'):
            if not element.find(True) and re.search(r'\d', element.get_text()):
                element['data-resolve-initial-text'] = element.get_text()
        for meta in soup.find_all('meta'):
            if meta.get('name') == 'description' or meta.get('property') in ['og:title', 'og:description']:
                meta['content'] = render_text(meta.get('content',''), messages)
        for old in soup.select('link[rel="canonical"],link[hreflang],meta[property^="og:"],meta[name="robots"]'):
            old.decompose()
        soup.head.append(soup.new_tag('link', rel='canonical', href=ORIGIN + route(locale)))
        for alternative in LOCALES:
            soup.head.append(soup.new_tag('link', rel='alternate', hreflang=alternative, href=ORIGIN + route(alternative)))
        soup.head.append(soup.new_tag('link', rel='alternate', hreflang='x-default', href=ORIGIN+'/resolve/'))
        soup.head.append(soup.new_tag('meta', attrs={'name':'robots', 'content':'index,follow' if args.production else 'noindex,nofollow'}))
        title = soup.title.get_text() if soup.title else 'ReSolve™ | Antech'
        description = soup.find('meta', attrs={'name':'description'})
        for prop, content in [('og:title',title), ('og:description', description['content'] if description else ''), ('og:url',ORIGIN+route(locale)), ('og:type','website'), ('og:locale',locale.replace('-','_'))]:
            soup.head.append(soup.new_tag('meta', attrs={'property':prop,'content':content}))
        plural_path = ROOT / 'i18n' / 'plural-forms.json'
        plural_forms = json.loads(plural_path.read_text(encoding='utf-8')).get(locale, {}) if plural_path.exists() else {}
        bundle = {'locale':locale,'messages':messages,'patterns':patterns,'route':route(locale),'pluralForms':plural_forms}
        (resources / f'{locale}.js').write_text('window.ResolveLocale='+json.dumps(bundle, ensure_ascii=False).replace('</','<\\/')+';\n',encoding='utf-8')
        for name in [f'{locale}.js','number-display.js','runtime.js']:
            soup.head.append(soup.new_tag('script', src='/resolve/assets/i18n/'+name))
        if locale=='en':
            english_editorial(soup)
            english_quality_layout(soup)
        elif locale=='pl':
            polish_editorial(soup)
        else:
            locale_editorial(soup,locale)
        if (resources / 'language-ui.js').exists():
            soup.body.append(soup.new_tag('script', src='/resolve/assets/i18n/language-ui.js'))
        version_resources(soup, output_root)
        destination = output if locale == 'en' else output / locale.lower()
        destination.mkdir(parents=True, exist_ok=True)
        rendered = str(soup)
        try:
            from i18n_seo import apply_seo
            rendered = apply_seo(rendered, locale, production=args.production)
        except ImportError:
            pass
        (destination / 'index.html').write_text(rendered, encoding='utf-8')
        available[locale] = {'route':route(locale),'keys':len(messages),'missingKeys':len(missing),'wholeSentenceBlocks':sum(whole_blocks.values()),'htmlBytes':(destination/'index.html').stat().st_size}
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+ORIGIN+route(locale)+'</loc></url>' for locale in LOCALES)+'</urlset>\n'
    try:
        from i18n_seo import build_sitemap
        sitemap = build_sitemap()
    except ImportError:
        pass
    (output / 'sitemap.xml').write_text(sitemap, encoding='utf-8')
    report = {'source':'site/resolve/index.html','output':str(output_root),'productionIndexing':args.production,'locales':available,'preservedScripts':script_manifest,'sharedDataBytes':(resources/'source-data.js').stat().st_size}
    (ROOT / 'i18n' / 'build-report.json').write_text(json.dumps(report,indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'routes':len(available),'sharedScripts':len(script_manifest),'output':str(output_root),'missing':{k:v['missingKeys'] for k,v in available.items()}},indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output')
    parser.add_argument('--production', action='store_true', help='Generate indexable release output; does not deploy.')
    parser.add_argument('--allow-incomplete', action='store_true', help='Development only: retain explicit English fallbacks.')
    build(parser.parse_args())
