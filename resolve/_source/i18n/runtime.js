/* ReSolve localisation adapter. Original scientific/calculation engines remain shared and unchanged. */
(() => {
  'use strict';
  const config=window.ResolveLocale||{locale:'en',messages:{},patterns:[],route:'/resolve/'};
  const locale=config.locale;
  const normalize=value=>String(value).normalize('NFC').replace(/\s+/gu,' ').trim();
  const messages=new Map(Object.entries(config.messages||{}).map(([key,value])=>[normalize(key),value]));
  const translatedValues=new Set([...messages.values()].filter(value=>typeof value==='string').map(normalize));
  const escapeRegExp=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const phrases=[...messages.keys()].filter(key=>key.length>1&&key.length<220&&/[A-Za-z]/.test(key)&&typeof messages.get(key)==='string').sort((a,b)=>b.length-a.length);
  const phraseExpression=phrases.length?new RegExp('(?<![\\p{L}\\p{N}_])(?:'+phrases.map(escapeRegExp).join('|')+')(?![\\p{L}\\p{N}_])','gu'):null;
  const compositeFallbacks=new Set();
  const numberPart=/[-+]?\d[\d,]*(?:\.\d+)?/g;
  const numericPatterns=[];
  for(const [source,target] of messages){
    if(typeof target!=='string'||!/[A-Za-z]/.test(source)||!/[0-9]/.test(source))continue;
    const numbers=source.match(numberPart),targetNumbers=target.match(numberPart);
    if(!numbers||!targetNumbers||numbers.length!==targetNumbers.length)continue;
    // Match a measurement by its source value, not its translated sentence position.
    // Repeated equal values are ambiguous when reordered: leave those to explicit templates.
    let targetOrder;
    if(numbers.every((value,index)=>value===targetNumbers[index]))targetOrder=numbers.map((_,index)=>index);
    else if(new Set(numbers).size===numbers.length&&targetNumbers.every(value=>numbers.includes(value)))targetOrder=targetNumbers.map(value=>numbers.indexOf(value));
    else continue;
    const sourceParts=source.split(numberPart);
    const expression='^'+sourceParts.map(escapeRegExp).join('([-+]?\\d[\\d,]*(?:\\.\\d+)?)')+'$';
    numericPatterns.push({expression:new RegExp(expression,'u'),targetParts:target.split(numberPart),targetOrder});
  }
  const pluralRules=new Intl.PluralRules(locale);
  const ownText=new WeakMap(),ownAttributes=new WeakMap();
  const attributes=['alt','title','aria-label','aria-description','placeholder'];
  const missing=new Set();
  function countedNouns(result,source){
    const nounPattern=/(\d[\d,]*(?:\.\d+)?)\s+(unit|year|month|lab)s?\b/gu;
    for(const match of source.matchAll(nounPattern)){
      const forms=config.pluralForms?.[match[2]];
      if(!forms)continue;
      const count=Number(match[1].replaceAll(',',''));
      const choice=forms[pluralRules.select(count)]||forms.other;
      const alternatives=[...new Set(Object.values(forms))].sort((a,b)=>b.length-a.length).map(escapeRegExp).join('|');
      const expression=new RegExp('('+escapeRegExp(match[1])+')(\\s*)(?:'+alternatives+')(?![\\p{L}\\p{M}])','gu');
      result=result.replace(expression,(_,number,space)=>number+space+choice);
    }
    return result;
  }
  function t(source,variables={}){
    const key=normalize(source);
    const exactTranslation=messages.has(key);
    let result=messages.get(key);
    if(result&&typeof result==='object')result=result[pluralRules.select(Number(variables.count)||0)]||result.other;
    if(typeof result!=='string'){
      for(const pattern of config.patterns||[]){
        const names=[];
        const escaped=pattern.source.split(/(\{[\w]+\})/g).map(part=>{
          if(/^\{\w+\}$/.test(part)){names.push(part.slice(1,-1));return '(.+?)';}
          return part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        }).join('');
        const match=key.match(new RegExp('^'+escaped+'$','u'));
        if(match){result=pattern.target;names.forEach((name,index)=>{result=result.replaceAll('{'+name+'}',match[index+1]);});break;}
      }
    }
    if(typeof result!=='string'){
      for(const pattern of numericPatterns){
        const match=key.match(pattern.expression);
        if(match){result=pattern.targetParts.map((part,index)=>part+(index<pattern.targetOrder.length?match[pattern.targetOrder[index]+1]:'')).join('');break;}
      }
    }
    if(typeof result!=='string'&&phraseExpression&&!translatedValues.has(key)){
      const composed=key.replace(phraseExpression,match=>messages.get(match));
      if(composed!==key){result=composed;compositeFallbacks.add(key);}
    }
    if(typeof result!=='string')return source;
    result=result.replace(/\{(\w+)\}/g,(whole,name)=>Object.prototype.hasOwnProperty.call(variables,name)?variables[name]:whole);
    // Complete reviewed sentences can require a grammatical case that differs from
    // the bare count label. Never replace their inflections with generic plural forms.
    const bareCountLabel=/^\d[\d,.]*\s+(?:unit|year|month|lab)s?(?:$|\s*·)/u.test(key);
    return !exactTranslation&&bareCountLabel?countedNouns(result,key):result;
  }
  function textNode(node){
    if(!node.parentElement||node.parentElement.closest('script,style,textarea,[translate="no"],.rv-language-native'))return;
    // These legacy source cells are read numerically by later projections. The separate
    // number-display adapter localises their visual/accessible values without changing text.
    if(node.parentElement.closest('#calc-solvent-baseline,#bc-baseline-litres,#calc-annual-litres,#calc-annual-saving,[data-disposal-saving]'))return;
    const current=node.nodeValue;
    if(!normalize(current)||ownText.get(node)===current)return;
    const translated=t(current);
    if(translated!==current){
      const prefix=current.match(/^\s*/u)[0],suffix=current.match(/\s*$/u)[0];
      const next=prefix+translated.trim()+suffix;
      ownText.set(node,next);node.nodeValue=next;
    }else if(locale!=='en'&&/[A-Za-z]{3}/.test(current)&&!messages.has(normalize(current))&&!translatedValues.has(normalize(current))){missing.add(normalize(current));}
  }
  function element(el){
    if(el.matches('script,style,[translate="no"]'))return;
    if(el.matches('[id^="example-report-tab-"][role="tab"][aria-pressed]'))el.removeAttribute('aria-pressed');
    let known=ownAttributes.get(el);if(!known){known={};ownAttributes.set(el,known);}
    for(const attr of attributes){
      if(!el.hasAttribute(attr))continue;
      const value=el.getAttribute(attr);
      if(known[attr]===value)continue;
      const translated=t(value);
      if(translated!==value){known[attr]=translated;el.setAttribute(attr,translated);}
    }
    if(el.tagName==='IFRAME'&&el.id==='client-report-frame'){
      const source=el.getAttribute('srcdoc');
      if(source&&!source.includes('data-resolve-localized-report="'+locale+'"')){
        // Keep the original opaque-origin sandbox. Localise a presentation copy,
        // then let an active-locale runtime inside the frame handle its own updates.
        const report=new DOMParser().parseFromString(source,'text/html');
        report.documentElement.lang=locale;report.documentElement.dir=locale==='ar'?'rtl':'ltr';
        report.documentElement.dataset.resolveLocalizedReport=locale;
        report.title=t(report.title);scan(report.body);
        for(const name of [locale+'.js','runtime.js']){
          const parentScript=[...document.scripts].find(script=>script.getAttribute('src')?.split('?')[0].endsWith('/assets/i18n/'+name));
          const script=report.createElement('script');
          script.src=parentScript?.getAttribute('src')||'/resolve/assets/i18n/'+name;
          script.dataset.resolveReportRuntime='true';report.head.append(script);
        }
        if(locale==='ar'){
          const style=report.createElement('link');style.rel='stylesheet';style.href='/resolve/assets/i18n/rtl.css';report.head.append(style);
        }
        el.setAttribute('srcdoc','<!doctype html>\n'+report.documentElement.outerHTML);
      }
    }
  }
  function scan(root){
    if(!root)return;
    if(root.nodeType===3){textNode(root);return;}
    if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
    if(root.nodeType===1)element(root);
    const walker=root.ownerDocument.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    for(let node=walker.nextNode();node;node=walker.nextNode())node.nodeType===3?textNode(node):element(node);
  }
  function watch(root){
    const observer=new MutationObserver(records=>{
      for(const record of records){
        if(record.type==='characterData')textNode(record.target);
        else if(record.type==='attributes')element(record.target);
        else for(const node of record.addedNodes)scan(node);
      }
    });
    observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:[...attributes,'srcdoc','aria-pressed']});
    return observer;
  }
  function validationMessage(field){
    if(field.validity.valueMissing)return t('Please complete this field.');
    if(field.validity.typeMismatch&&field.type==='email')return t('Enter a valid email address.');
    return t('Please check this value.');
  }
  function start(){
    const form=document.getElementById('resolvePilotForm');
    if(form){
      const input=document.createElement('input');input.type='hidden';input.name='visitor_language';input.value=locale;form.append(input);
      form.addEventListener('invalid',event=>{event.target.setCustomValidity('');event.target.setCustomValidity(validationMessage(event.target));},true);
      form.addEventListener('input',event=>event.target.setCustomValidity?.(''),true);
    }
    scan(document.body);watch(document.body);
    // Existing engines write English captions synchronously; translate on the same microtask turn.
    // Hash hrefs remain untouched: the original business-case navigation uses them as selectors.
    document.documentElement.dataset.i18nReady='true';
  }
  window.ResolveI18n={locale,t,formatNumber:(value,options={})=>new Intl.NumberFormat(locale,options).format(value),formatCurrency:(value,options={})=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR',...options}).format(value),plural:(source,count,variables={})=>t(source,{...variables,count}),getMissing:()=>[...missing].sort(),getCompositeFallbacks:()=>[...compositeFallbacks].sort(),isTranslationWrite:node=>ownText.get(node)===node.nodeValue,refresh:()=>scan(document.body)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
