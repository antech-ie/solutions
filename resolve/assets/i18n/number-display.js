/* Locale presentation only: the original calculation engines retain their numeric inputs. */
(() => {
  'use strict';
  const locale = document.documentElement.lang || 'en';
  if (locale === 'en') return;
  const rawReaders = '#calc-solvent-baseline,#bc-baseline-litres,#calc-annual-litres,#calc-annual-saving,[data-disposal-saving]';
  const outputs = 'td,output,[data-roi],[id$="-output"],[id$="-total"],[id$="-saving"],[id$="-litres"],[id$="-npv"],[id$="-roi"],[id$="-payback"]';
  const written = new WeakMap();
  const token = /(?<![\p{L}\p{N}])[-−]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?![\p{L}\p{N}])/gu;
  function formatToken(source) {
    if (!/[,.]/.test(source) && source.replace(/\D/g, '').length < 4) return source;
    const negative = source.startsWith('−');
    const numeric = Number(source.replaceAll(',', '').replace('−', '-'));
    if (!Number.isFinite(numeric)) return source;
    const precision = (source.split('.')[1] || '').length;
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: precision, maximumFractionDigits: precision
    }).format(numeric);
    return negative && formatted.startsWith('-') ? '−' + formatted.slice(1) : formatted;
  }
  const localize = value => value.replace(token, formatToken);
  function localizedSource(source) {
    const values=[];
    const skeleton=source.replace(token,value=>{values.push(formatToken(value));return '{rvnum'+(values.length-1)+'}';});
    const translated=window.ResolveI18n?.t(skeleton)||skeleton;
    return translated.replace(/\{rvnum(\d+)\}/g,(_,index)=>values[Number(index)]);
  }
  function format(element) {
    if (!element.matches(outputs) || element.children.length || element.closest('[translate="no"]')) return;
    const source = element.textContent;
    if (!source.trim() || written.get(element) === source || /\d:\d|\d[–/]\d/.test(source)) return;
    const rawReader=element.matches(rawReaders);
    // Static HTML is already translated; its decimal commas must never be reparsed as
    // English thousands separators. Likewise, ignore writes owned by the translator.
    if (!rawReader && (source===element.getAttribute('data-resolve-initial-text') ||
      window.ResolveI18n?.isTranslationWrite(element.firstChild))) return;
    // Only existing grouped/decimal measurements, or explicit monetary values, are reformatted.
    // Date years, vial identifiers, timestamps and document references are left intact.
    if (!/\d,\d{3}|\d\.\d|€/.test(source)) return;
    const translated = rawReader ? localizedSource(source) : localize(source);
    if (rawReader) {
      // Five legacy projections read these cells back. Their text must stay byte-stable.
      // A generated visual value and accessible label expose the locale presentation.
      if (!element.hasAttribute('data-resolve-number')) {
        element.style.setProperty('--rv-number-size', getComputedStyle(element).fontSize);
      }
      if (element.getAttribute('data-resolve-number') !== translated) {
        element.setAttribute('data-resolve-number', translated);
        element.setAttribute('aria-label', translated);
      }
      written.set(element, source);
    } else if (translated !== source) {
      written.set(element, translated);
      element.textContent = translated;
    } else written.set(element, source);
  }
  function scan(root) {
    const element = root.nodeType === 3 ? root.parentElement : root;
    if (!element || element.nodeType !== 1) return;
    format(element);
    element.querySelectorAll(outputs).forEach(format);
  }
  function start() {
    scan(document.body);
    new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') scan(record.target);
        else { scan(record.target); for (const node of record.addedNodes) scan(node); }
      }
    }).observe(document.body, {subtree:true,childList:true,characterData:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
