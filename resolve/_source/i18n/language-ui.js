/* The URL determines language. Visitors open the language panel when they need it. */
(() => {
  'use strict';
  const preferenceKey = 'resolve.language.preference.v1';
  let initialized = false;

  function init() {
    if (initialized) return;
    const banner = document.getElementById('rv-language-banner');
    const control = document.getElementById('rv-language-control');
    const toggle = document.getElementById('rv-language-toggle');
    const proceed = document.getElementById('rv-language-continue');
    if (!banner || !control || !toggle || !proceed) return;
    initialized = true;
    const cards = Array.from(banner.querySelectorAll('a[data-locale]'));
    const locale = document.documentElement.lang || 'en';
    const selected = cards.find(card => card.dataset.locale.toLowerCase() === locale.toLowerCase()) || cards[0];
    const selectedLocale = selected.dataset.locale;
    const label = control.querySelector('.rv-language-current');
    label.textContent = selected.querySelector('.rv-language-native').textContent;
    label.lang = selectedLocale;
    label.dir = selectedLocale === 'ar' ? 'rtl' : 'ltr';
    cards.forEach(card => {
      if (card === selected) card.setAttribute('aria-current', 'page');
      else card.removeAttribute('aria-current');
    });
    const brandBar = document.querySelector('.brand-bar');
    if (brandBar) brandBar.append(control);
    if (brandBar && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        control.classList.toggle('rv-language-control--floating', !entries[0].isIntersecting);
      }).observe(brandBar);
    }

    function remember(value) {
      try { localStorage.setItem(preferenceKey, value); } catch (_) { /* URL navigation remains available. */ }
    }
    function expand(open, focusHeading) {
      banner.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open && focusHeading) {
        banner.scrollIntoView({ block: 'start', behavior: 'instant' });
        document.getElementById('rv-language-title').focus({ preventScroll: true });
      }
    }
    function updateLinks() {
      const root = banner.dataset.resolveRoot || '/resolve/';
      cards.forEach(card => {
        const code = card.dataset.locale;
        card.setAttribute('href', root + (code === 'en' ? '' : code.toLowerCase() + '/'));
      });
    }
    updateLinks();
    expand(false, false);
    toggle.addEventListener('click', () => {
      const opening = banner.hidden;
      expand(opening, opening);
      if (!opening) remember(selectedLocale);
    });
    proceed.addEventListener('click', () => {
      remember(selectedLocale);
      expand(false, false);
      toggle.focus({ preventScroll: true });
    });
    cards.forEach(card => card.addEventListener('click', () => {
      updateLinks();
      remember(card.dataset.locale);
    }));
    window.addEventListener('hashchange', updateLinks);
    banner.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        remember(selectedLocale);
        expand(false, false);
        toggle.focus({ preventScroll: true });
      }
    });
  }

  window.ResolveLanguageUI = Object.freeze({ init, preferenceKey });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
