"""Format scientific/model decimal and grouped values by English source identity."""
import json
import re
import subprocess

NUMBER=re.compile(r'(?<![\w,.])[-−]?(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+)(?![\d,.])')

def source_numbers(text):
    for match in NUMBER.finditer(text):
        value=match.group()
        integer=value.lstrip('-−').split('.')[0]
        before=text[max(0,match.start()-40):match.start()]
        # Revisions, URLs, serials and recorded zero-padded displays are identifiers,
        # not decimal measurements. Their exact original representation is retained.
        if (len(integer)>1 and integer.startswith('0')
                or re.search(r'(?:rev(?:ision)?|version|serial|SN)\s*[:#]?\s*$',before,re.I)
                or re.search(r'(?:https?://|doi:)\S*$',before,re.I)):
            continue
        yield value

def build_formats(locales, sources):
    values=sorted({value for text in sources for value in source_numbers(text)})
    program=r'''
let input='';process.stdin.setEncoding('utf8');process.stdin.on('data',s=>input+=s);
process.stdin.on('end',()=>{const {locales,values}=JSON.parse(input),out={};
for(const locale of locales){out[locale]={};for(const source of values){
const digits=(source.split('.')[1]||'').length,value=Number(source.replaceAll(',','').replace('−','-'));
out[locale][source]=new Intl.NumberFormat(locale,{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value);
}}process.stdout.write(JSON.stringify(out));});
'''
    result=subprocess.run(['node','-e',program],input=json.dumps({'locales':locales,'values':values}),capture_output=True,text=True,encoding='utf-8',check=True)
    return json.loads(result.stdout)

def format_groups(source, target, formats):
    # A translated decimal comma cannot be mistaken for a grouping comma: a value is
    # replaced only when the exact same literal is present in its English source.
    values=sorted(set(source_numbers(source)),key=len,reverse=True)
    for value in values:
        if value not in formats:continue
        target=re.sub(r'(?<![\d,])'+re.escape(value)+r'(?![\d,.])',lambda _:formats[value],target)
    return target
