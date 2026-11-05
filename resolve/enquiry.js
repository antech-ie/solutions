/* ReSolve enquiry delivery through Antech's own WordPress mail transport. */
(() => {
  'use strict';
  const endpoint = 'https://antech.ie/resolve-enquiry.php';
  const start = () => {
    const form = document.getElementById('resolvePilotForm');
    if (!form || form.dataset.deliveryReady) return;
    form.dataset.deliveryReady = 'true';
    const dialog = document.getElementById('mock-dialog');
    const status = document.getElementById('pilotFormStatus');
    const submit = form.querySelector('[type="submit"]');
    const t = text => window.ResolveI18n?.t(text) || text;
    const originalLabel = submit.textContent;
    let token = null, tokenAt = 0, tokenPromise = null, sent = false;
    const fallback = document.createElement('a');
    fallback.className = 'rv-enquiry-email-fallback';
    fallback.textContent = 'info@antech.ie';
    fallback.hidden = true;
    status.after(fallback);
    const values = () => Object.fromEntries(new FormData(form));
    function prepareFallback() {
      const data = values();
      const body = ['ReSolve demonstration enquiry', '', 'Name: ' + (data.name || ''),
        'Work email: ' + (data.email || ''), 'Company / site: ' + (data.company || ''),
        'Isocratic HPLC systems: ' + (data.hplc_systems || ''),
        'Perspective: ' + (data.perspective || ''), '', data.notes || ''].join('\n');
      fallback.href = 'mailto:info@antech.ie?subject=' + encodeURIComponent('ReSolve demonstration enquiry') + '&body=' + encodeURIComponent(body);
    }
    async function request(url, options = {}) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(url, {...options, credentials: 'omit', cache: 'no-store', signal: controller.signal});
        const data = await response.json();
        if (!response.ok || data.success !== true) throw new Error(data.code || 'delivery');
        return data;
      } finally { clearTimeout(timeout); }
    }
    function getToken() {
      if (token && Date.now() - tokenAt < 3500000) return Promise.resolve(token);
      if (!tokenPromise) {
        tokenPromise = request(endpoint).then(data => {
          token = data.token; tokenAt = Date.now(); return token;
        }).finally(() => { tokenPromise = null; });
      }
      return tokenPromise;
    }
    // Capture before legacy onclick/submit handlers so only one request is sent.
    document.querySelectorAll('[data-enquiry]').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault(); event.stopImmediatePropagation();
        if (sent) {
          form.reset(); token = null; sent = false;
        }
        const general = !!button.closest('#resolve-overview');
        document.getElementById('pilotPerspective').value = general ? 'General enquiry' :
          document.getElementById('hero-perspective')?.textContent.trim() || 'General enquiry';
        document.getElementById('enquiryCta').value = button.textContent.trim();
        if (!submit.disabled) {
          status.textContent = ''; status.className = 'pilot-form-status'; fallback.hidden = true;
        }
        dialog.showModal();
        getToken().catch(() => { /* Submission presents the error without discarding details. */ });
      }, true);
    });
    form.addEventListener('submit', async event => {
      event.preventDefault(); event.stopImmediatePropagation();
      if (submit.disabled || !form.reportValidity()) return;
      submit.disabled = true; submit.textContent = t('Sending…');
      status.className = 'pilot-form-status'; status.textContent = t('Sending your enquiry…');
      fallback.hidden = true; prepareFallback();
      try {
        const currentToken = await getToken();
        const data = await request(endpoint, {method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'},
          body: JSON.stringify({...values(), token: currentToken})});
        if (!/^RV-[A-F0-9]{10}$/.test(data.reference || '')) throw new Error('delivery');
        status.className = 'pilot-form-status success';
        status.textContent = t('Thank you. Your enquiry has been sent to Antech.') + ' ' + data.reference;
        sent = true;
        form.reset();
      } catch (error) {
        status.className = 'pilot-form-status error';
        status.textContent = t('We could not send your enquiry. Please try again, or email info@antech.ie.');
        fallback.hidden = false;
        // Keep the same token after uncertain delivery so retries are deduplicated.
        if (error.message === 'expired') { token = null; tokenAt = 0; }
      } finally {
        submit.disabled = false; submit.textContent = originalLabel;
      }
    }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();
