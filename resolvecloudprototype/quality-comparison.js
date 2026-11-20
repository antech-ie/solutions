'use strict';

(() => {
  const reference = batches.find(batch => batch.name === 'B-2026-0001-01');
  if (!reference) return;
  const referenceSite = lineage(getNode(reference.asset)).find(node=>node.level==='site').name;
  const regimen = mixes[reference.mi].composition;
  const records = [
    {site:referenceSite,batch:reference.name,preparation:regimen,flow:reference.flow,approval:'Reference fixture',evidence:'Existing demo batch record',reference:true},
    {site:'Berlin Site',batch:'MOCK-BER-CET-07',preparation:mixes[(reference.mi+1)%mixes.length].composition,flow:reference.flow,approval:'Unverified',evidence:'No site-approved deviation or method-version record supplied'},
    {site:'Boston Site',batch:'MOCK-BOS-CET-14',preparation:regimen,flow:reference.flow+.2,approval:'Unverified',evidence:'Flow differs from the reference; approved flow range not linked'},
    {site:'Toronto Site',batch:'MOCK-TOR-CET-02',preparation:regimen,flow:reference.flow-.2,approval:'Approved local variant',evidence:'Fictional QA approval APR-TO-CU-02'},
    {site:'Lyon Site',batch:'MOCK-LYO-CET-05',preparation:regimen,flow:reference.flow,approval:'Matches reference',evidence:'Fictional batch; both fields match'},
    {site:'Dublin Site',batch:'MOCK-DUB-CET-09',preparation:regimen,flow:reference.flow,approval:'Matches reference',evidence:'Fictional batch; both fields match'}
  ];
  const different = record => record.preparation!==regimen||Math.abs(record.flow-reference.flow)>.001;
  const requiresReview = record => different(record)&&record.approval==='Unverified';
  const flow = value=>value.toFixed(1).replace(/\.0$/,'')+' mL/min';
  const total = records.filter(requiresReview).length;
  let origin;
  const dialog=document.createElement('dialog');
  dialog.className='qc-compare-dialog';
  dialog.setAttribute('aria-labelledby','qcCompareTitle');
  dialog.innerHTML='<div class="qc-compare-header"><div><p class="qc-compare-label">QUALITY · FICTIONAL COMPARISON</p><h2 id="qcCompareTitle">Cross-site method comparison</h2>'+
    '<p>'+reference.product+' · '+reference.method+'</p></div><button type="button" class="action" data-close-comparison autofocus>Close</button></div>'+
    '<div class="qc-compare-body"><div class="qc-compare-reference"><strong>Reference · '+reference.name+'</strong><span>'+referenceSite+' · '+regimen+' · '+flow(reference.flow)+'</span></div>'+
    '<p class="qc-compare-note">Compare recorded settings for the same demo product and test. A difference is a review lead. Approval and analytical acceptability are assessed separately.</p>'+
    '<label class="qc-compare-filter"><input type="checkbox"> Show matching batches and approved local variants</label><div id="qcCompareRows"></div></div>';
  document.body.append(dialog);
  const showAll=dialog.querySelector('input');
  const rowHost=dialog.querySelector('#qcCompareRows');
  function list(){
    const rows=records.filter(record=>showAll.checked||requiresReview(record));
    rowHost.innerHTML='<p class="qc-compare-note" role="status">'+total+' unverified departures · '+(records.length-1)+' comparison batches</p>'+
      '<div class="qc-compare-scroll"><table><thead><tr><th>Site / batch</th><th>Mobile phase</th><th>Flow</th><th>Review status / evidence</th></tr></thead><tbody>'+
      rows.map(record=>{
        const flag=requiresReview(record);
        return '<tr><td><b>'+record.site+'</b><small>'+record.batch+'</small></td>'+
          '<td'+(flag&&record.preparation!==regimen?' class="qc-compare-flag"':'')+'>'+record.preparation+'</td>'+
          '<td'+(flag&&Math.abs(record.flow-reference.flow)>.001?' class="qc-compare-flag"':'')+'>'+flow(record.flow)+'</td>'+
          '<td>'+(flag?'<b class="qc-compare-flag">Review required</b>':record.approval)+'<small>'+record.evidence+'</small></td></tr>';
      }).join('')+'</tbody></table></div>';
  }
  showAll.onchange=list;
  dialog.querySelector('[data-close-comparison]').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>origin?.focus({preventScroll:true}));
  function makeButton() {
    const button=document.createElement('button');
    button.type='button';button.className='action';
    button.textContent='Compare sites · '+total+' departures';
    button.onclick=()=>{origin=button;showAll.checked=false;list();dialog.showModal();};
    return button;
  }
  const oldOverview=renderDemoOverview;
  renderDemoOverview=function(){
    oldOverview();
    if(state.role==='QC / Quality'){
      const actions=document.querySelector('#overviewVisualization .dashboard-utilities');
      if(actions)actions.prepend(makeButton());
    }
  };
  const oldBatch=renderBatchContent;
  renderBatchContent=function(batch,records){
    oldBatch(batch,records);
    if(state.role==='QC / Quality'&&batch.product===reference.product&&batch.method===reference.method&&state.batchTab==='report'){
      document.querySelector('#batchContent .injection-detail-header')?.append(makeButton());
    }
  };
  if(state.nav==='overview'&&state.role==='QC / Quality')renderDemoOverview();
})();
