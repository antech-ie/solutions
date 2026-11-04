/* Open every language page at its introduction; in-page navigation remains available. */
(() => {
  'use strict';
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const clearOpeningAnchor = () => {
    history.replaceState(history.state, '', location.pathname + location.search);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };
  clearOpeningAnchor();
  window.addEventListener('pageshow', () => {
    clearOpeningAnchor();
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
  });
})();
