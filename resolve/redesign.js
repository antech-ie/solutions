/* Presentation enhancements only. Calculation and form logic remain in the preserved source. */
(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('.view-tabs [role="tab"]')];
  const hero = document.getElementById('hero-title');
  document.getElementById('chrom-dialog')?.setAttribute('aria-label','Enlarged operational chromatogram');
  hero.tabIndex = -1;
  const changePerspective=document.querySelector('.rv-change-perspective');
  const brochureArt={
    quality:['resolve-installed-on-hplc.webp','ReSolve controller and switching valve installed on a Waters HPLC system','ReSolve alongside a Waters HPLC system. Installation photograph; assess your own configuration.','photo'],
    sustainability:['routing-diagram.webp','Official ReSolve brochure artwork showing the HPLC system, branded controller, recovery return and waste path','ReSolve recovery flow. Select the artwork to enlarge. ReSolve routes mobile phase; it does not purify it. Method-specific assessment is required.','flow'],
    procurement:['controller.webp','ReSolve controller illustration showing a detector trace and recycling status','Product display illustration. Values shown are not method settings.','controller'],
    'supply-chain':['routing-diagram.webp','Brochure flow schematic linking the HPLC system, detector, ReSolve and return or waste paths','Illustrative flow path. ReSolve selects flow for reuse; it does not purify it.','flow'],
    value:['laboratory-vials.webp','Analyst working with laboratory sample vials','Connect laboratory workflow, analytical control and the site business case.','photo'],
    research:['signal-illustration.webp','Schematic chromatogram with separated peaks','Brochure signal illustration — not a measured study trace.','flow'],
    reports:['injection-report.webp','Brochure example injection report with operating events, routed volumes and a chromatogram','Brochure report example; separate from the SETU study and the client scenario reports.','report'],
    across:['controller-trace.webp','ReSolve controller example showing a trace and routing status','Illustrative controller display. Financial results come from your scenario inputs.','controller']
  };
  function updateBrochureArt(){
    const figure=document.getElementById('rv-route-art');
    if(!figure)return;
    const key=document.querySelector('.view-tabs [aria-selected="true"]').id.replace('nav-','');
    const videoJump=document.getElementById('rv-video-jump');
    if(videoJump)videoJump.href='#rv-video-'+key;
    if(figure.dataset.perspective===key)return;
    const [file,alt,caption,kind]=brochureArt[key];
    figure.dataset.perspective=key;figure.dataset.kind=kind;
    const artSource='/resolve/assets/'+(key==='quality'?'':'brochure/')+file;
    document.getElementById('rv-route-art-image').src=artSource;
    document.getElementById('rv-route-art-image').alt=alt;
    document.getElementById('rv-route-art-link').href=artSource;
    document.getElementById('rv-route-art-caption').textContent=caption;
  }
  updateBrochureArt();
  new MutationObserver(updateBrochureArt).observe(document.querySelector('.view-tabs'),{subtree:true,attributes:true,attributeFilter:['aria-selected']});
  if(changePerspective)document.getElementById('persona-hero').prepend(changePerspective);
  const navigate = () => {
    if(changePerspective)document.getElementById('persona-hero').prepend(changePerspective);
    document.getElementById('persona-hero').scrollIntoView({block:'start',behavior:'instant'});
    hero.focus({preventScroll:true});
  };
  tabs.forEach(tab => tab.addEventListener('click', navigate));
  document.querySelectorAll('.table-wrap,.quality-table-wrap').forEach((region,i) => {
    region.tabIndex=0;region.setAttribute('role','region');
    const heading=region.closest('section')?.querySelector('h2,h3');
    region.setAttribute('aria-label',(heading?.textContent||'Scientific results')+' — scrollable table '+(i+1));
    const hint=document.createElement('p');
    hint.className='rv-chart-scroll-hint';
    hint.textContent='This table scrolls horizontally. Swipe or focus it and use the arrow keys to read every column.';
    region.after(hint);
  });
  for(const id of ['injection-chart','op-chart','return-chart','investment-benefit-chart']) {
    const chart=document.getElementById(id);
    if(!chart)continue;
    chart.tabIndex=0;
    const hint=document.createElement('p');
    hint.className='rv-chart-scroll-hint';
    hint.textContent='Swipe or use the arrow keys to scroll the full chart. Labels and source values are retained.';
    chart.after(hint);
  }
  // A readable, keyboard-accessible equivalent for the analytical point chart.
  const sampleData=JSON.parse(document.getElementById('setu-injection-data').textContent);
  const analyte=document.getElementById('inj-analyte'),metric=document.getElementById('inj-metric');
  const values=document.createElement('details');
  values.className='rv-sample-values';
  values.innerHTML='<summary>Read the plotted sample values as a table</summary><div class="table-wrap" tabindex="0" role="region" aria-label="Fresh and recycled mobile-phase sample measurements"></div>';
  document.getElementById('injection-chart').after(values);
  const drawValues=()=>{
    const fresh=sampleData[analyte.value+'1'],recycled=sampleData[analyte.value+'2'];
    const index=Number(metric.value),label=metric.options[metric.selectedIndex].text;
    const table=document.createElement('table');
    const caption=table.createCaption();caption.textContent=analyte.options[analyte.selectedIndex].text+' · '+label+' · PMBrc / SETU sample injections';
    const header=table.createTHead().insertRow();
    for(const title of ['Sample','Fresh source vial','Recycled source vial','Sequence 1 · fresh','Sequence 2 · recycled']){const th=document.createElement('th');th.scope='col';th.textContent=title;header.append(th);}
    const body=table.createTBody();
    fresh.forEach((row,i)=>{const tr=body.insertRow();[row[0],row[1],recycled[i][1],row[index],recycled[i][index]].forEach((v,j)=>{const cell=j===0?document.createElement('th'):document.createElement('td');if(j===0)cell.scope='row';cell.textContent=String(v);tr.append(cell);});});
    values.querySelector('.table-wrap').replaceChildren(table);
  };
  analyte.addEventListener('change',drawValues);metric.addEventListener('change',drawValues);drawValues();
  // Restore direct links when navigating browser history, preserving all original anchors.
  addEventListener('hashchange', () => {
    const active=tabs.find(t=>'#'+t.getAttribute('aria-controls')===location.hash);
    if(active&&active.getAttribute('aria-selected')!=='true')active.click();
  });
  // Load the YouTube player only after a visitor chooses to play it.
  const stopVideos=()=>document.querySelectorAll('.rv-video-player').forEach(player=>{
    player.querySelector('iframe')?.remove();
    const button=player.querySelector('.rv-video-play');if(button)button.hidden=false;
  });
  document.querySelectorAll('.rv-video-play').forEach(button=>button.addEventListener('click',()=>{
    stopVideos();
    const iframe=document.createElement('iframe');
    iframe.src='https://www.youtube-nocookie.com/embed/I9TrFC4wMxU?autoplay=1&rel=0';
    iframe.title='Introducing ReSolve | The HPLC Mobile Phase Recycler';
    iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allowFullscreen=true;
    button.hidden=true;button.parentElement.append(iframe);iframe.focus();
  }));
  tabs.forEach(tab=>tab.addEventListener('click',stopVideos));
  if(location.hash && location.hash!=='#view-quality' && tabs.some(t=>'#'+t.getAttribute('aria-controls')===location.hash))navigate();
})();
