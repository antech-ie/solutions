
'use strict';

// This layer changes presentation and interaction only. The ReSolve model and its inputs live in index.html.
const themeToggle = document.getElementById('themeToggle');
function applyWorkspaceTheme(dark) {
  document.documentElement.dataset.workspaceTheme = dark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.textContent = dark ? 'Light mode' : 'Dark mode';
}
let workspaceTheme;
try { workspaceTheme = localStorage.getItem('resolve-theme'); } catch {}
applyWorkspaceTheme(workspaceTheme ? workspaceTheme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);
themeToggle.onclick = () => {
  const dark = document.documentElement.dataset.workspaceTheme !== 'dark';
  applyWorkspaceTheme(dark);
  try { localStorage.setItem('resolve-theme', dark ? 'dark' : 'light'); } catch {}
};

const metricDrawer = document.createElement('dialog');
metricDrawer.className = 'metric-drawer';
metricDrawer.setAttribute('aria-labelledby','metricDrawerTitle');
metricDrawer.innerHTML = '<div class="metric-drawer-top"><span id="metricDrawerTitle">Metric breakdown</span>' +
  '<button type="button" class="action" id="metricDrawerClose" autofocus>Close</button></div>' +
  '<div class="metric-drawer-body"></div>';
document.body.append(metricDrawer);

const drawerBody = metricDrawer.querySelector('.metric-drawer-body');
let drawerContext = null;
metricDrawer.querySelector('#metricDrawerClose').onclick = () => metricDrawer.close();
metricDrawer.addEventListener('close', () => {
  drawerBody.replaceChildren();
  if (!drawerContext) return;
  if (state.nav === 'overview' && state.id === drawerContext.scope) {
    const trigger = drawerContext.lead ? '.lead-finding-action' :
      '.dashboard-kpis [data-dash-metric="' + CSS.escape(drawerContext.metric) + '"]';
    document.querySelector(trigger)?.focus({preventScroll:true});
    window.scrollTo(drawerContext.x,drawerContext.y);
  } else {
    document.getElementById('pageTitle').focus({preventScroll:true});
  }
  drawerContext = null;
});

const renderExistingOverview = renderDemoOverview;
renderDemoOverview = function() {
  const focusedYear = metricDrawer.contains(document.activeElement) ? document.activeElement.dataset.dashYear : null;
  const drawerScroll = drawerBody.scrollTop;
  renderExistingOverview();
  const host = document.getElementById('overviewVisualization');
  host.querySelectorAll('[data-dash-metric]').forEach(trigger => {
    trigger.setAttribute('aria-haspopup','dialog');
    trigger.onclick = () => {
      drawerContext = {scope:state.id, metric:trigger.dataset.dashMetric,
        lead:trigger.classList.contains('lead-finding-action'), x:window.scrollX, y:window.scrollY};
      state.drillMetric = drawerContext.metric;
      render();
      const breakdown = host.querySelector('#activeMetric');
      if (!breakdown) return;
      drawerBody.replaceChildren(breakdown);
      metricDrawer.showModal();
      drawerBody.scrollTop = 0;
    };
  });
  if (metricDrawer.open) {
    const breakdown = host.querySelector('#activeMetric');
    drawerBody.replaceChildren(...(breakdown ? [breakdown] : []));
    if (state.id !== drawerContext?.scope) {
      drawerBody.scrollTop = 0;
      metricDrawer.querySelector('#metricDrawerClose').focus({preventScroll:true});
    } else {
      drawerBody.scrollTop = drawerScroll;
      if (focusedYear) {
        drawerBody.querySelector('[data-dash-year="' + focusedYear + '"]')?.focus({preventScroll:true});
      }
    }
  }
};
const renderExistingApp = renderDemoApp;
renderDemoApp = function() {
  renderExistingApp();
  if (metricDrawer.open && (state.nav !== 'overview' || document.getElementById('overviewView').hidden)) {
    drawerContext = null;
    metricDrawer.close();
    document.getElementById('pageTitle').focus({preventScroll:true});
  }
};

document.getElementById('perspectiveTabs').addEventListener('keydown', event => {
  if (!event.target.matches('[data-perspective]')) return;
  const buttons = [...event.currentTarget.querySelectorAll('button')];
  const index = buttons.indexOf(event.target);
  const destinations = {Left:index-1,Right:index+1,Home:0,End:buttons.length-1};
  const next = destinations[event.key.replace(/^Arrow/,'')];
  if (next === undefined) return;
  event.preventDefault();
  buttons[(next+buttons.length)%buttons.length].focus();
});
window.addEventListener('keydown', event => {
  if (event.altKey && event.key === 'ArrowLeft' && metricDrawer.open) {
    event.preventDefault();
    event.stopImmediatePropagation();
    metricDrawer.close();
  }
},true);

if (state.nav === 'overview' && !document.getElementById('overviewView').hidden) renderDemoOverview();

const statusTip = document.createElement('div');
statusTip.className = 'instrument-tooltip';
statusTip.hidden = true;
statusTip.setAttribute('aria-hidden','true');
document.body.append(statusTip);
let statusTarget = null;
function showInstrumentStatus(button) {
  statusTarget = button;
  statusTip.textContent = button.dataset.statusDetail;
  statusTip.hidden = false;
  const bounds = button.getBoundingClientRect();
  statusTip.style.left = Math.max(8,Math.min(bounds.left,innerWidth-statusTip.offsetWidth-8)) + 'px';
  statusTip.style.top = (bounds.top > statusTip.offsetHeight + 8 ? bounds.top-statusTip.offsetHeight-5 : bounds.bottom+5) + 'px';
}
function hideInstrumentStatus() {
  statusTip.hidden = true;
  statusTarget = null;
}
document.addEventListener('pointerover', event => {
  const button = event.target.closest('.instrument-status');
  if (button && event.pointerType !== 'touch') showInstrumentStatus(button);
});
document.addEventListener('pointerout', event => {
  if (statusTarget?.contains(event.target) && !statusTarget.contains(event.relatedTarget) &&
      document.activeElement !== statusTarget) hideInstrumentStatus();
});
document.addEventListener('focusin', event => {
  const button = event.target.closest('.instrument-status');
  if (button) showInstrumentStatus(button);
  else hideInstrumentStatus();
});
document.addEventListener('click', event => {
  const button = event.target.closest('.instrument-status');
  if (button) showInstrumentStatus(button);
  else hideInstrumentStatus();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') hideInstrumentStatus();
});
window.addEventListener('scroll',hideInstrumentStatus,true);

function previewMapCountry(country, pointer) {
  const map=country.closest('.footprint-map');
  const tooltip=map.querySelector('[data-world-tooltip]');
  if(!country.hasAttribute('data-map-active')||tooltip.hidden){
    map.querySelector('[data-map-active]')?.removeAttribute('data-map-active');
    country.setAttribute('data-map-active','');
    tooltip.textContent=country.dataset.worldCountry;
    map.querySelector('[data-world-preview]').textContent=country.dataset.worldCountry;
    tooltip.hidden=false;
  }
  const bounds=map.querySelector('.world-map-scroll').getBoundingClientRect();
  const shape=country.getBoundingClientRect();
  const x=pointer ? pointer.clientX : shape.left+shape.width/2;
  const y=pointer ? pointer.clientY : shape.top+shape.height/2;
  const left=Math.max(6,Math.min(x-bounds.left+12,bounds.width-tooltip.offsetWidth-6));
  const above=y-bounds.top-tooltip.offsetHeight-9;
  const top=Math.max(6,Math.min(above>=6?above:y-bounds.top+13,bounds.height-tooltip.offsetHeight-6));
  tooltip.style.left=left+'px';
  tooltip.style.top=top+'px';
}

function clearMapCountry(country) {
  if(!country.hasAttribute('data-map-active'))return;
  country.removeAttribute('data-map-active');
  const map=country.closest('.footprint-map');
  map.querySelector('[data-world-tooltip]').hidden=true;
  map.querySelector('[data-world-preview]').textContent='Choose a country to see its sites.';
}

const mapCountry = event => event.target.closest?.('[data-world-country]');
document.addEventListener('pointermove',event=>{
  const country=mapCountry(event);
  if(country&&event.pointerType!=='touch')previewMapCountry(country,event);
});
document.addEventListener('pointerout',event=>{
  const country=mapCountry(event);
  if(!country||country.hasAttribute('data-map-armed'))return;
  const focused=document.activeElement;
  if(focused?.matches('[data-world-country]')&&focused.closest('.footprint-map')===country.closest('.footprint-map'))previewMapCountry(focused);
  else clearMapCountry(country);
});
document.addEventListener('focusin',event=>{
  const country=mapCountry(event);
  if(country)previewMapCountry(country);
});
document.addEventListener('focusout',event=>{
  const country=mapCountry(event);
  if(country&&!country.hasAttribute('data-map-armed'))clearMapCountry(country);
});
document.addEventListener('click',event=>{
  const country=mapCountry(event);
  if(!country||event.pointerType!=='touch'||country.hasAttribute('data-map-armed'))return;
  event.preventDefault();
  event.stopPropagation();
  country.closest('.footprint-map').querySelector('[data-map-armed]')?.removeAttribute('data-map-armed');
  country.setAttribute('data-map-armed','');
  previewMapCountry(country,event);
  country.closest('.footprint-map').querySelector('[data-world-preview]').textContent += ' · tap again to open';
},true);
document.addEventListener('keydown',event=>{
  const country=mapCountry(event);
  if(country&&['Enter',' '].includes(event.key)){
    event.preventDefault();
    country.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  }
});

(() => {
  const persona = 'Sustainability / ESG';
  const number = new Intl.NumberFormat('en-IE', { maximumFractionDigits: 0 });
  const stageDefinitions = [
    ['production','Solvent manufacture','Scope 3 · Category 1','Purchased solvent. Use supplier or geography-specific production factors.'],
    ['packaging','Packaging','Scope 3 · Category 1','Account for purchased packaging once if the solvent factor already includes it.'],
    ['delivery','Inbound delivery','Scope 3 · Category 4 where applicable','Third-party inbound transport. Transport within the reporting company’s control follows its own inventory boundary.'],
    ['use','Lab energy','Scope 2 for purchased electricity','Direct emissions from owned or controlled sources are Scope 1. The demo applies the same lab-use factor to both scenarios and uses no metered energy.'],
    ['recycling','ReSolve recycling burden','Depends on who operates it','Separate the process burden from any solvent displacement. Use Scope 2 for purchased electricity, Scope 1 for direct emissions and review the category for outsourced services.'],
    ['disposal','Waste treatment','Scope 3 · Category 5 for third-party treatment','Use actual waste classification, mass and treatment records. Owned or controlled treatment can have direct Scope 1 emissions.']
  ];
  const stageByKey = new Map(stageDefinitions.map(stage => [stage[0],stage]));
  let selectedStage = null;

  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));
  const carbon = value => {
    const size = Math.abs(value);
    if (size >= 10000) return number.format(value / 1000) + ' t CO₂e';
    if (!size || size >= 10) return number.format(value) + ' kg CO₂e';
    if (size < 0.001) return (value < 0 ? '−' : '') + '<1 g CO₂e';
    return number.format(value * 1000) + ' g CO₂e';
  };
  const difference = (baseline, project) => baseline - project;
  const effect = (baseline, project) => {
    const value = difference(baseline, project);
    return (value > 0 ? '+' : '') + carbon(value);
  };
  const modelCells = (baseline,project,available=true) => available ?
    '<td>'+escape(carbon(baseline))+'</td><td>'+escape(carbon(project))+'</td><td><strong>'+escape(effect(baseline,project))+'</strong></td>' :
    '<td>—</td><td>—</td><td>—</td>';
  const table = (title, rows) => '<div class="sustainability-table" role="region" tabindex="0" aria-label="'+escape(title)+'"><table>'+
    '<thead><tr><th scope="col">'+escape(title)+'</th><th scope="col">Without ReSolve</th><th scope="col">With ReSolve</th>'+
    '<th scope="col">Difference</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  const card = (title, value, caption) => '<div><span>'+escape(title)+'</span><strong>'+escape(value)+'</strong><small>'+escape(caption)+'</small></div>';

  function scenarioCard(title,caption,style,values) {
    return '<div class="sustainability-scenario '+style+'"><h3>'+escape(title)+'</h3><p>'+escape(caption)+'</p><dl>'+
      values.map(([label,value])=>'<div><dt>'+escape(label)+'</dt><dd>'+escape(value)+'</dd></div>').join('')+'</dl></div>';
  }

  function renderReport(node) {
    const records = getScopeBatches(node.id);
    const m = carbonScope(records);
    const available = records.length > 0;
    const current = stageByKey.get(selectedStage);
    const visibleYears = [2020,2021,2022,2023,2024,2025,2026];
    const childNodes = node.level === 'hplc' || node.level === 'batch' ? [] : node.children.map(id=>getNode(id));
    const report = document.createElement('section');
    report.id = 'sustainabilityReport';
    report.className = 'demo-panel sustainability-report';
    report.setAttribute('aria-labelledby','sustainabilityTitle');
    const stageRows = stageDefinitions.map(([key,label]) => {
      const {baseline,project} = m.stages[key];
      return '<tr><th scope="row"><button type="button" class="action" data-carbon-stage="'+key+'" aria-pressed="'+(key===selectedStage)+'">'+
        escape(label)+'</button></th>'+modelCells(baseline,project,available)+'</tr>';
    }).join('') + '<tr class="sustainability-total"><th scope="row">Total lifecycle estimate</th>'+modelCells(m.baseline,m.project,available)+'</tr>';
    const materialRows = [
      ['Mobile phase processed',m.totalL,m.totalL],
      ['Fresh preparation required',m.totalL,m.wasteL],
      ['Mobile phase sent to waste treatment',m.totalL,m.wasteL]
    ].map(([label,baseline,project])=>'<tr><th scope="row">'+escape(label)+'</th>'+
      (available ? '<td>'+escape(units(baseline))+'</td><td>'+escape(units(project))+'</td><td><strong>'+
        escape(units(difference(baseline,project)))+'</strong></td>' : '<td>—</td><td>—</td><td>—</td>')+'</tr>').join('');
    const scenarioValues=(emissions,volume)=>[
      ['Lifecycle emissions',available ? carbon(emissions) : '—'],
      ['Mobile phase sent to waste',available ? units(volume) : '—'],
      ['Fresh preparation required',available ? units(volume) : '—']
    ];
    const comparison = '<div class="sustainability-scenarios" aria-label="Today and With ReSolve scenario summary">'+
      scenarioCard('Today','Modelled baseline without ReSolve','today',scenarioValues(m.baseline,m.totalL))+
      scenarioCard('With ReSolve','Modelled reuse scenario','with-resolve',scenarioValues(m.project,m.wasteL))+'</div>'+
      '<details class="demo-disclosure sustainability-method"><summary>Show the waste and solvent calculation</summary>'+
      '<p>Today’s model sends the full processed volume to waste. With ReSolve, it sends the recorded waste-routed volume and assumes the reuse-routed portion is reused one for one.</p>'+
      (available ? '<p><strong>Modelled waste prevented:</strong> '+escape(units(m.totalL))+' − '+escape(units(m.wasteL))+' = '+escape(units(m.totalL-m.wasteL))+
      '. The same assumption gives the difference in fresh mobile phase required. Display values are rounded independently.</p>' : '')+
      '<p>These are mobile-phase volumes. Hazardous waste prevented in kilograms requires a verified classification, mass and treatment record. Fresh mobile phase displaced is different from virgin organic solvent displaced.</p></details>';
    const rank = current && available ? childNodes.map(child=>{
      const batches = getScopeBatches(child.id);
      return {child,batches,stage:carbonScope(batches).stages[selectedStage]};
    }).sort((a,b)=>Math.abs(difference(b.stage.baseline,b.stage.project))-Math.abs(difference(a.stage.baseline,a.stage.project))) : [];
    const breakdown = !current ? '' : '<section id="sustainabilityBreakdown" class="sustainability-section">'+
      '<h3 tabindex="-1">'+escape(current[1])+' · location evidence</h3><p>'+escape(current[2]+' · '+current[3])+'</p>'+
      (rank.length ? table('Location',rank.map(({child,batches,stage})=>'<tr><th scope="row"><button type="button" class="action" data-sustainability-location="'+
        child.id+'">'+escape(displayName(child))+' ›</button></th>'+modelCells(stage.baseline,stage.project,batches.length>0)+'</tr>').join('')) :
        '<p>'+(available ? 'Open the existing batch or injection records below to inspect the routing inputs.' : 'There are no batch records for the selected filters.')+'</p>')+'</section>';
    report.innerHTML = '<div class="demo-panel-head"><div><h2 id="sustainabilityTitle">Carbon &amp; Waste Report</h2><p>'+
      escape(displayName(node))+' · '+fmt(records.length)+(records.length===1 ? ' demo batch' : ' demo batches')+
      ' · modelled comparison for the same analytical workload</p></div></div>'+
      '<div class="sustainability-body"><div class="sustainability-filters"><label>Reporting year <select id="sustainabilityYear" class="select">'+
      option('all','All demo years',state.year)+visibleYears.map(year=>option(year,year,state.year)).join('')+'</select></label>'+
      '<label>Mobile phase <select id="sustainabilityRecipe" class="select">'+option('all','All recipes',state.mix)+
      mixes.map((mix,index)=>option(index,mix.short,state.mix)).join('')+'</select></label></div>'+
      comparison+'<div class="sustainability-metrics">'+
      card('Mobile phase processed',available ? units(m.totalL) : '—','Volume covered by the selected records')+
      card('Routed for reuse',available ? units(m.reusedL) : '—',available ? pct(m.score)+' of processed volume' : 'No selected records')+
      card('Sent to waste',available ? units(m.wasteL) : '—','Volume routed to waste by ReSolve')+
      card('Modelled CO₂e avoided',available ? carbon(m.avoided) : '—','Baseline minus ReSolve pathway')+'</div>'+
      '<p class="sustainability-note"><strong>Actual reuse is unverified.</strong> This model assumes that '+
      (available ? escape(units(m.reusedL)) : 'the volume routed for reuse')+' displaces the equivalent volume of fresh mobile phase. '+
      'Confirm reuse, solvent displacement and waste classification before external reporting.</p>'+
      '<section class="sustainability-section"><h3>Lifecycle comparison</h3><p>Choose a stage for the location breakdown. A positive difference indicates lower modelled emissions with ReSolve.</p>'+
      table('Lifecycle stage',stageRows)+'</section>'+breakdown+
      '<section class="sustainability-section"><h3>Material flow comparison</h3><p>Same workload. Fresh preparation and waste treatment are modelled using one-for-one displacement.</p>'+
      table('Mobile phase volume',materialRows)+'</section>'+
      '<details class="demo-disclosure sustainability-method"><summary>Scope mapping and model assumptions</summary>'+
      '<p>These are comparative project estimates. Keep them separate from the reporting organisation’s Scope 1, 2 and 3 inventory.</p>'+
      '<dl>'+stageDefinitions.map(([,label,scope,assumption])=>'<div><dt>'+escape(label+' · '+scope)+'</dt><dd>'+escape(assumption)+'</dd></div>').join('')+'</dl>'+
      '<p>Volume is split by recipe and converted to mass using demo densities. Without ReSolve assumes fresh preparation and waste treatment for all processed volume. The ReSolve pathway assumes fresh replacement and treatment for the waste portion and adds a recycling-process burden for the reuse-routed portion.</p>'+
      '<p>Factors are illustrative placeholders. Verify solvent recipes, supplier factors, electricity and freight data, and disposal records. The 2026 sample uses a different sampling pattern.</p>'+
      '<p><a href="https://ghgprotocol.org/scope-3-calculation-guidance-2" target="_blank" rel="noreferrer">GHG Protocol calculation guidance</a> · '+
      '<a href="https://ghgprotocol.org/blog/inventory-and-project-accounting" target="_blank" rel="noreferrer">Project and inventory accounting</a></p></details></div>';
    for (const [id,key] of [['sustainabilityYear','year'],['sustainabilityRecipe','mix']]) {
      report.querySelector('#'+id).onchange = event => {
        state[key] = event.target.value;
        render();
        document.getElementById(id)?.focus({preventScroll:true});
      };
    }
    report.querySelectorAll('[data-carbon-stage]').forEach(button => button.onclick = () => {
      const key = button.dataset.carbonStage;
      selectedStage = selectedStage === key ? null : key;
      report.replaceWith(renderReport(node));
      document.querySelector('[data-carbon-stage="'+key+'"]')?.focus({preventScroll:true});
    });
    report.querySelectorAll('[data-sustainability-location]').forEach(button => button.onclick = () => {
      dashboardScope(button.dataset.sustainabilityLocation,null);
      document.querySelector('#sustainabilityBreakdown h3')?.focus();
    });
    return report;
  }

  const originalRenderApp = renderDemoApp;
  renderDemoApp = function() {
    document.getElementById('sustainabilityReport')?.remove();
    originalRenderApp();
    if (state.role !== persona || state.nav !== 'overview') return;
    const node = getNode();
    const overview = document.getElementById('overviewView');
    const report = renderReport(node);
    if (overview.hidden) {
      document.getElementById('explorerView').prepend(report);
      return;
    }
    const dashboard = document.getElementById('overviewVisualization');
    const finding = dashboard.querySelector('.lead-finding');
    dashboard.querySelector('.dashboard-kpis')?.remove();
    const duplicateNote = [...dashboard.children].find(child=>child.textContent.startsWith('Estimated CO₂e uses demo lifecycle factors'));
    duplicateNote?.remove();
    if (finding) finding.replaceWith(report); else dashboard.prepend(report);
    const locations = dashboard.querySelector('.dashboard-locations');
    if (locations) {
      const disclosure = document.createElement('details');
      disclosure.className = 'demo-disclosure sustainability-geography';
      disclosure.innerHTML = '<summary>Browse by location</summary>';
      locations.replaceWith(disclosure);
      disclosure.append(locations);
    }
    document.getElementById('pageDesc').textContent = 'Compare lifecycle emissions, solvent routing and waste. Drill into locations when you need the evidence.';
  };

  const originalBatchContent = renderBatchContent;
  renderBatchContent = function(batch,records) {
    originalBatchContent(batch,records);
    if (state.role !== persona || state.batchTab !== 'report') return;
    const row = records.find(record=>record.n===state.injection) || records[0];
    if (!row) return;
    const m = carbonScope([{mi:batch.mi,total:row.volume,reuse:row.reuse,waste:row.waste}]);
    const evidence = document.createElement('section');
    evidence.className = 'injection-detail-panel sustainability-section';
    evidence.innerHTML = '<h3>Carbon evidence for this injection</h3><p>Modelled from the selected injection’s routed volumes and demo emission factors.</p>'+
      table('Lifecycle stage',stageDefinitions.map(([key,label])=>'<tr><th scope="row">'+escape(label)+'</th>'+
        modelCells(m.stages[key].baseline,m.stages[key].project)+'</tr>').join('')+
        '<tr class="sustainability-total"><th scope="row">Total lifecycle estimate</th>'+modelCells(m.baseline,m.project)+'</tr>');
    document.querySelector('.injection-detail')?.append(evidence);
  };
})();
