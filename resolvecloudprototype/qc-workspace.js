'use strict';

(() => {
  const F=qcFixtures, seq=F.sequence, key='resolve-qc-case-history';
  const data=F.expected.map(row=>({...row,match:F.reconcile(row),controls:F.conditions(row),events:F.events(row)}));
  const eligible=data.filter(row=>row.expectedEligible);
  const matched=eligible.filter(row=>row.match.state==='Matched');
  const countMatch=value=>eligible.filter(row=>row.match.state===value).length;
  const duplicates=eligible.reduce((sum,row)=>sum+row.match.duplicateUploads,0);
  const coverage=eligible.length?(100*matched.length/eligible.length).toFixed(1)+'%':'Unknown';
  const location=['Enterprise','Germany',seq.site,seq.lab,seq.asset,seq.id];
  const get=n=>data.find(row=>row.n===Number(n));
  const byId=id=>F.cases.find(record=>record.id===id);
  const scopes=['Within approved conditions','Outside approved conditions','Unknown'];
  const time=name=>name?String(name).replace('T',' ').slice(0,19)+' UTC':'—';
  const E=value=>String(value??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const button=(label,action,val='',primary=false)=>'<button type="button" class="action'+(primary?' primary':'')+'" data-qc="'+action+'" data-v="'+E(val)+'">'+E(label)+'</button>';
  const note=value=>'<p class="qc-note">'+E(value)+'</p>';
  const badge=(value,tone='')=>'<span class="qc-marker '+tone+'">'+E(value)+'</span>';
  const table=(headers,rows)=>'<div class="qc-table" tabindex="0" role="region" aria-label="'+E(headers[0])+' table"><table><thead><tr>'+
    headers.map(v=>'<th scope="col">'+E(v)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+
    row.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  const cards=values=>'<dl class="qc-facts">'+values.map(([k,v])=>'<div><dt>'+E(k)+'</dt><dd>'+E(v)+'</dd></div>').join('')+'</dl>';
  const block=(label,contents)=>'<section class="qc-card"><h3>'+E(label)+'</h3>'+contents+'</section>';
  const alert=(text)=>'<p class="qc-alert" tabindex="-1" role="status" id="qcFeedback">'+E(text)+'</p>';
  let review={};
  try { review=JSON.parse(localStorage.getItem(key)||'{}')||{}; } catch {}
  let root, route={view:'queue'}, history=[], filters={}, reviewMode='QC triage', message='';
  const status=c=>review[c.id]?.state||c.status;
  const owner=c=>review[c.id]?.owner||c.owner;
  const overdue=c=>status(c)!=='Closed · simulated'&&review[c.id]?.due&&review[c.id].due<F.asOf.slice(0,10);
  const filterOptions={site:['Sites',seq.site],lab:['Labs',seq.lab],method:['Methods / versions',seq.method+' v'+seq.version],asset:['Assets',seq.asset],
    type:['Exception types',...new Set(F.cases.flatMap(c=>c.tags))],status:['Review states','Awaiting QC','Awaiting QA','Evidence requested','Closed · simulated']};

  function head(title,caption,actions='') {
    return '<div class="qc-head"><div><span>QUALITY INVESTIGATION · FICTIONAL DEMO</span><h2 id="qcTitle" tabindex="-1">'+E(title)+'</h2><p>'+E(caption)+
      '</p></div><div class="qc-actions">'+(route.view==='queue'?'':button('← Back','back'))+actions+'</div></div>'+(message?alert(message):'');
  }
  function open(view,params={}) {
    const focus=document.activeElement;
    history.push({route:{...route},y:window.scrollY,action:focus?.dataset.qc,value:focus?.dataset.v,reviewMode});
    route={view,...params}; message=''; draw('qcTitle');
  }
  function back() {
    const old=history.pop();
    route=old?.route||{view:'queue'};reviewMode=old?.reviewMode||'QC triage';message='';draw();
    const control=[...root.querySelectorAll('[data-qc]')].find(el=>el.dataset.qc===old?.action&&el.dataset.v===old?.value);
    (control||root.querySelector('#qcTitle'))?.focus({preventScroll:true});
    window.scrollTo(0,old?.y||0);
  }
  function filteredCases() {
    return F.cases.filter(c=>(!filters.type||c.tags.includes(filters.type))&&(!filters.status||status(c)===filters.status));
  }
  function queue() {
    const openCases=F.cases.filter(c=>status(c)!=='Closed · simulated');
    const current=F.recurrence.filter(r=>r.period==='17 Nov 2026');
    const metrics=[
      ['Evidence coverage',coverage,matched.length+' / '+eligible.length+' · '+countMatch('Unmatched')+' unmatched · '+countMatch('Ambiguous')+' ambiguous','coverage'],
      ['Approved conditions',data.filter(r=>r.controls.state===scopes[0]).length+' / '+eligible.length,'Within approved conditions at run time','conditions'],
      ['Investigation workload',openCases.length+' open',openCases.filter(overdue).length+' overdue · '+openCases.filter(c=>status(c)==='Awaiting QC').length+' awaiting QC · '+openCases.filter(c=>status(c)==='Awaiting QA').length+' awaiting QA','workload'],
      ['Recurrence',current.filter(r=>r.exception).length+' / '+current.length,'Routing exceptions in comparable runs','recurrence']
    ];
    const visible=filteredCases();
    return head('Investigation queue','Berlin QC Lab A · 17 Nov 2026 · snapshot '+time(F.asOf),
      button('Browse by location','browse',0)+button('Evidence sources','sources')+button('Controls map','controls'))+
      '<div class="qc-metrics">'+metrics.map(([label,value,caption,metric])=>'<button type="button" data-qc="metric" data-v="'+metric+'"><span>'+label+
        '</span><strong>'+value+'</strong><small>'+caption+'</small></button>').join('')+'</div>'+
      '<section class="qc-card"><h3>Cases · '+visible.length+'</h3><div class="qc-filters">'+
      Object.entries(filterOptions).map(([id,[title,...options]])=>'<label>'+title+'<select class="select" id="qcFilter-'+id+'" data-filter="'+id+'"><option value="">All</option>'+
        options.map(v=>'<option value="'+E(v)+'"'+(filters[id]===v?' selected':'')+'>'+E(v)+'</option>').join('')+'</select></label>').join('')+
      button('Clear filters','reset')+'</div>'+
      (visible.length?table(['Finding','Location and time','Potential impact','Missing evidence','Owner / next action','Status'],visible.map(c=>[
        button(c.title,'case',c.id)+ '<small>'+E(c.id+' · '+c.type)+'</small>',E(seq.site+' / '+seq.lab)+'<small>'+E(time(get(c.injection).start))+'</small>',
        E(c.impact),E(c.gaps[0]||'None recorded')+(c.gaps.length>1?'<small>+'+(c.gaps.length-1)+' more</small>':''),
        E(owner(c))+'<small>'+E(c.next)+'</small>',badge(status(c),overdue(c)?'bad':'')
      ])):note('No cases match these filters.'))+'</section>'+note('Scope: one Berlin sequence. Site, lab, method and asset filters show this available fixture. Exception and review filters narrow the case list; evidence metrics retain the sequence denominator.');
  }
  function rowIndex(rows) {
    return table(['Injection','Reconciliation','Run-time conditions','Analytical result','Record history'],rows.map(r=>[
      button(r.id,'injection',r.n),badge(r.match.state,r.match.state==='Matched'?'good':'warn'),badge(r.controls.state,r.controls.state===scopes[0]?'good':'warn'),
      E(r.analytical),E(r.resultType)]));
  }
  function metric() {
    if(route.metric==='coverage')return head('Evidence coverage',matched.length+' / '+eligible.length+' · '+coverage)+
      note(duplicates+' repeated device upload excluded by record identity and version. Logical match for Injection 21 retains both versions. Timestamp-only candidates use ±'+F.tolerance+' seconds.')+
      note('Denominator: CDS expected, planned eligible injections on this method and pairing. A missing expected sequence yields unknown coverage. Run-time compliance is a separate finding. Trial and aborted records remain visible.')+rowIndex(eligible);
    if(route.metric==='conditions')return head('Approved conditions at run time','Evaluated at injection start, including qualification in effect')+
      '<div class="qc-actions">'+scopes.map(s=>badge(s+' · '+data.filter(r=>r.controls.state===s).length)).join('')+'</div>'+rowIndex(data);
    if(route.metric==='workload')return head('Investigation workload','Status and overdue assessment at '+time(F.asOf))+
      table(['Finding','Status','Owner','Due date'],F.cases.map(c=>[button(c.title,'case',c.id),badge(status(c)),E(owner(c)),E(review[c.id]?.due||'Unassigned')]));
    return head('Comparable routing exceptions','17 Nov 2026 compared with 10 Nov 2026')+
      note('Same site, method version and instrument pairing. Each run uses four explicitly sampled reconciled records. Exclusions: other sequence records, aborted and ambiguous records. Association is an investigation lead. No verified CAPA effective date is available.')+
      table(['Run','Sampled record','Routing outcome'],F.recurrence.map(r=>[E(r.period),r.id.startsWith('INJ')?button(r.id,'injection',r.id.slice(4)):E(r.id),E(r.exception?'Routing anomaly':'None recorded')]));
  }
  function crumbs(level,record) {
    return '<nav class="qc-crumbs" aria-label="Investigation scope">'+location.slice(0,level+1).map((n,i)=>button(n,'browse',i)).join('<i aria-hidden="true">›</i>')+
      (record?'<i aria-hidden="true">›</i><strong aria-current="location">'+E(record.id)+'</strong>':'')+'</nav>';
  }
  function browse() {
    const level=Number(route.level);
    return head(location[level],'Simulated analytical evidence hierarchy',level?button('↑ Up','browse',level-1):'')+
      crumbs(level)+(level===5?rowIndex(data):block(['Country','Site','Lab','HPLC','Analytical sequence'][level],button(location[level+1],'browse',level+1,true)));
  }
  function sources() {
    return table(['Source','Authoritative fields','Last successful update','State'],F.sources.map(s=>[
      '<b>'+E(s.name)+'</b><small>'+E(s.ref)+'</small>',E(s.fields),E(time(s.updated)),badge(s.state,s.state==='Available'?'good':'warn')]));
  }
  const references=[
    ['EudraLex Vol. 4','Chapter 1: investigation/CAPA. Chapter 4: controlled documentation. Chapter 6: QC and laboratory records. Annex 11: systems and audit controls. Annex 15: validation and qualification.',
      'https://health.ec.europa.eu/medicinal-products/eudralex/eudralex-volume-4_en'],
    ['21 CFR Part 211','§§ 211.22, 211.160, 211.192, 211.194: quality-unit authority, laboratory controls, discrepancy review and complete lab records.',
      'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-C/part-211'],
    ['FDA Part 11 scope','Assess intended electronic records and signatures against predicate rules and intended use.',
      'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/part-11-electronic-records-electronic-signatures-scope-and-application'],
    ['FDA final data integrity guidance','Traceability, metadata and retention of dynamic records.','https://www.fda.gov/media/119267/download'],
    ['FDA final OOS guidance','Original results, repeat rationale and complete investigation records.','https://www.fda.gov/media/158416/download'],
    ['ICH Q2(R2), Q14, Q9(R1), Q10','Analytical validation and method development, risk decisions, pharmaceutical quality system and CAPA.','https://www.ema.europa.eu/en/human-regulatory-overview/research-development/scientific-guidelines/quality-guidelines/ich-guidelines-quality']
  ];
  function controls() {
    return table(['Reference','Evidence mapping'],references.map(([title,meaning,url])=>['<a href="'+url+'" target="_blank" rel="noreferrer">'+E(title)+'</a>',E(meaning)]))+
      note('Use the versions in the effective EU GMP index. The recent Chapter 4 and Annex 11 consultation texts are drafts. Annex 16 would apply if an EU batch certification workflow were introduced. This prototype records simulated QC and QA actions only.');
  }
  function chronology(r) {
    return table(['UTC timestamp / source','Event','Actor / reason','Previous → new','Approval'],r.events.map(e=>[
      E(time(e.at))+'<small>'+E(e.system)+'</small>',E(e.kind)+'<small>'+E(e.details)+'</small>',
      E(e.actor)+(e.actor?'<small>'+E(e.reason||'Reason not recorded')+'</small>':''),E(e.previous?e.previous+' → '+e.next:null),E(e.approval)]));
  }
  function trace(r) {
    const hasGap=r.n===8;
    const x=t=>90+6*t;
    const curve=(start,end)=>Array.from({length:end-start+1},(_,i)=>{
      const t=start+i;const y=57-44*Math.exp(-((t-28)**2)/43)-22*Math.exp(-((t-78)**2)/75)+2*Math.cos(t/4);
      return (i?'L':'M')+x(t)+' '+y.toFixed(1);
    }).join(' ');
    const line=(a,b,y,cls)=>'<line x1="'+x(a)+'" x2="'+x(b)+'" y1="'+y+'" y2="'+y+'" class="'+cls+'"/>';
    const bars=(y, observed)=>{
      if(r.n===6||observed&&hasGap)return line(0,110,y,'qc-unknown');
      if(hasGap)return line(0,48,y,'qc-reuse')+line(48,110,y,'qc-unknown');
      if([3,9,16].includes(r.n)){
        const start=r.n===9?35:28;
        return line(0,start,y,'qc-reuse')+line(start,55,y,'qc-waste')+line(55,110,y,'qc-reuse');
      }
      return line(0,110,y,'qc-reuse');
    };
    return '<div class="qc-trace-scroller"><svg class="qc-trace" viewBox="0 0 782 158" role="img" aria-label="Simulated detector, commanded routes and observed valve timeline">'+
      (hasGap?'<rect x="'+x(48)+'" y="7" width="372" height="118" class="qc-gap"/>':'')+
      '<text x="7" y="32">Detector</text><text x="7" y="83">Commanded</text><text x="7" y="113">Observed</text>'+
      '<path class="qc-signal" d="'+(hasGap?curve(0,52)+curve(84,110):curve(0,r.n===6?33:110))+'"/>'+
      r.events.filter(e=>e.offset&&e.offset<110).map(e=>'<line x1="'+x(e.offset)+'" x2="'+x(e.offset)+'" y1="7" y2="126" class="qc-tick"><title>'+E(e.kind)+'</title></line>').join('')+
      bars(80,false)+bars(110,true)+[0,20,40,60,80,100,110].map(n=>'<text x="'+x(n)+'" y="148" text-anchor="middle">'+n+' s</text>').join('')+
      '</svg></div>'+note(hasGap?'Telemetry stops at 48 seconds. Detector signal returns at 84 seconds. Observed valve position remains unknown.':'Elapsed seconds share the CDS injection start. Green = reuse, amber = waste, dashed = unknown. Trace is simulated.');
  }
  function injection() {
    const r=get(route.n), a=r.controls;
    const linked=route.id||F.cases.find(c=>c.injection===r.n)?.id;
    const observation=r.n===8?'Unknown · no independent valve feedback':r.n===6?'Unknown · ReSolve record absent':r.match.candidate.at(-1)?.feedback||'Unknown';
    const command=r.n===8?'Reuse last commanded; unknown after 48 s':r.n===6?'Unavailable':[3,9,16].includes(r.n)?'Waste during diversion window':'Reuse';
    return head('Injection '+F.pad(r.n),seq.id+' · '+time(r.start),
      button('↑ Sequence','browse',5)+(linked?button('Open linked case','case',linked):'')+
      '<label>Switch injection <select class="select" id="qcPickInjection">'+data.map(s=>'<option value="'+s.n+'"'+(s.n===r.n?' selected':'')+'>'+E(s.id)+'</option>').join('')+'</select></label>')+
      crumbs(5,r)+cards([['Solvent recovery',r.n===3?'Expected waste diversion · normal operation':r.n===8?'Unknown during gap':r.n===6?'Unknown':'Observed route available'],
      ['Analytical acceptability',r.analytical],['Evidence completeness',r.match.state],['At run time',a.state]])+
      block('Injection identity and mobile phase',cards([['Injection',r.id],['Sample',r.sample],['Analytical sequence',r.sequence],['Product lot',r.lot+' · stale LIMS context'],
        ['HPLC / recycler',seq.asset+' / '+seq.recycler],['Operator',r.operator],['Timestamp range',time(r.start)+' to '+time(r.end)],['Site timezone',seq.zone],
        ['Preparation / reservoir',seq.preparation+' / '+seq.reservoir],['Recipe',seq.recipe],['Approved hold reference',seq.holdRef],
        ['Commanded route',command],['Observed valve position',observation],['Measured volume',r.n===8||r.n===6?'Unavailable':'Simulated device measurement · '+(9+r.n%3)+' mL'],
        ['Estimated volume',r.n===8?'11 mL expected from planned run · calculated':'Not used']]))+
      block('Detector and routing report',trace(r))+
      block('Effective controlled records',cards([['Site-approved method',a.method?.id+' v'+a.method?.version+' · '+a.method?.approval],['Pairing',a.pairing],
        ['Configuration',r.configuration],['Configuration approval',a.configuration?.approval||'Missing'],['Qualification at run time',a.qualification?.id||'No in-date qualification'],
        ['Basis',a.reason],['Later qualification',a.subsequentQualification?a.subsequentQualification.id+' effective '+time(a.subsequentQualification.from)+' · later only':null]]))+
      block('Analytical evidence · CDS',cards([['System suitability',r.sst],['Original analytical result',r.result===null?'No reportable result':r.result+'% of target'],
        ['Specification',r.specification?r.specification.id+' · '+r.specification.min+'–'+r.specification.max+'%':null],['Record type',r.resultType],
        ['Processing history',r.processing.join(' · ')],['OOT assessment','Not assessed · no approved rule and sufficient comparable data']])+
        (r.n===13?note('The passing repeat did not clear the original OOS.')+button('Open original OOS','injection',12):r.n===12?button('Open passing repeat','injection',13):''))+
      block('Audit events and chronology',chronology(r))+
      block('Source record and reconciliation',cards([['Expected source',r.sequence+'/'+r.id],['Matching method',r.match.method],
        ['Candidate IDs / versions',r.match.candidate.map(e=>e.id+' v'+e.version).join(' · ')||'None'],['Duplicate uploads excluded',r.match.duplicateUploads]])+sources());
  }
  function suggested(c) {
    const r=get(c.injection);
    return c.injection===8?{start:F.iso(F.time(7,110)),end:F.iso(F.time(10)),boundary:'INJ-07 end / INJ-10 start'}:{start:r.start,end:r.end,boundary:''};
  }
  function affected(c,saved) {
    const record=get(c.injection);
    const rows=c.injection===8?F.links:[{kind:'Injection',id:record.id,certainty:'Confirmed',why:'CDS sequence and injection key'},
      {kind:'Product lot',id:record.lot,certainty:'Unresolved',why:'Refresh the linked LIMS record'}];
    if(c.injection!==8||!saved)return rows;
    const range=data.filter(r=>r.n!==8&&Date.parse(r.start)>=Date.parse(saved.start)&&Date.parse(r.start)<=Date.parse(saved.end));
    return rows.filter(r=>r.kind!=='Injection'||r.id==='INJ-08').concat(range.map(r=>({kind:'Injection',id:r.id,certainty:'Possible',why:'Within proposed exposure window on the same pairing'})));
  }
  function hypotheses(c) {
    return c.injection===8?[['Threshold change affected routing','Audit records a change before the gap.','Missing independent valve observation and ambiguous ReSolve match.'],
      ['Detector signal loss contributed to the gap','CDS records detection loss at 53 s.','Signal recovery does not verify valve position.']]:
      [['Exception warrants investigation',c.impact,c.gaps.join(' · ')||'Review the linked source and context.']];
  }
  function form(c,r) {
    const window=r.window||suggested(c);
    const fields='<label>Rationale / observations<textarea name="reason" rows="3" required maxlength="800"></textarea></label>'+
      '<label>Evidence reference<input name="reference" maxlength="150"></label>';
    const qc=reviewMode==='QC triage';
    const input=qc?
      '<label>Exposure start in UTC<input type="datetime-local" name="start" step="1" value="'+E(window.start.slice(0,19))+'"></label>'+
      '<label>Exposure end in UTC<input type="datetime-local" name="end" step="1" value="'+E(window.end.slice(0,19))+'"></label>'+
      '<label>Boundary record references<input name="boundary" maxlength="185" value="'+E(window.boundary)+'"></label>':
      '<label>Action owner<input name="owner" maxlength="100" value="'+E(owner(c))+'"></label><label>Due date<input type="date" name="due" value="'+E(r.due||'')+'"></label>'+
      '<label>Simulated QMS deviation / CAPA<input name="qms" maxlength="100" value="'+E(r.qms||'')+'"></label>';
    const action=(label,kind)=>'<button type="submit" class="action" value="'+kind+'">'+label+'</button>';
    return note(qc?'Record observations and propose the window between the last and next verified acceptable states. Proposed links require human review.':
      'Demo closure requires QC acknowledgement, a rationale and resolution of every material gap. QMS entries in this view are simulated.')+
      '<form id="qcReviewForm"><div class="qc-formgrid">'+fields+input+'</div><div class="qc-actions">'+(qc?
        action('Acknowledge & record','ack')+action('Send to QA','submit'):
        action('Request evidence','request')+action('Record decision','decision')+action('Close simulated review','close'))+'</div></form>';
  }
  function caseView() {
    const c=byId(route.id),r=review[c.id]||{history:[]},injectionRecord=get(c.injection);
    const window=r.window||suggested(c);
    return head(c.title,c.id+' · '+seq.site+' / '+seq.lab+' · '+time(injectionRecord.start),
      button('Open '+injectionRecord.id,'injection',c.injection,true)+button('Export inspection package','export',c.id))+
      '<div class="qc-actions">'+badge(status(c))+badge(c.gaps.length+' unresolved material gaps',c.gaps.length?'warn':'good')+
      '<span>Owner: '+E(owner(c))+'</span></div>'+note(c.impact)+
      '<div role="group" aria-label="Review perspective" class="qc-actions">'+['QC triage','QA review'].map(v=>'<button type="button" class="action" data-qc="mode" data-v="'+v+'" aria-pressed="'+(reviewMode===v)+'">'+v+'</button>').join('')+'</div>'+
      block('Review actions and evidence gaps',(c.gaps.length?'<ul>'+c.gaps.map(g=>'<li>'+E(g)+'</li>').join('')+'</ul>':note('No open material gap in this case fixture.'))+form(c,r))+
      block('Exposure scope and linked evidence',cards([['Start',time(window.start)],['End',time(window.end)],['Boundaries',window.boundary||'Unconfirmed']])+
        table(['Record type','Record ID','Link confidence','Why'],affected(c,r.window).map(a=>[
          E(a.kind),a.kind==='Injection'?button(a.id,'injection',a.id.slice(4)):E(a.id),badge(a.certainty,a.certainty==='Confirmed'?'good':'warn'),E(a.why)
        ])))+
      block('Hypotheses',table(['Hypothesis','Supporting evidence','Counter-evidence and gaps'],hypotheses(c).map(row=>row.map(E))))+
      block('Chronology',chronology(injectionRecord))+
      block('Reviewer history',r.history.length?table(['Captured time','Simulated user','Action','Rationale and references'],r.history.map(h=>[E(time(h.at)),E(h.actor),E(h.action),E(h.reason)])):note('No review actions have been recorded.'));
  }
  function save(event) {
    event.preventDefault();
    const c=byId(route.id),old=review[c.id]||{history:[]};
    if(!c||!event.submitter)return;
    const values=new FormData(event.target), value=k=>String(values.get(k)||'').trim();
    const rationale=value('reason'), action=event.submitter.value, qc=reviewMode==='QC triage';
    const fail=text=>{message=text;const prior=root.querySelector('#qcFeedback');if(prior)prior.remove();root.querySelector('.qc-head').insertAdjacentHTML('afterend',alert(text));root.querySelector('#qcFeedback').focus();};
    if(!rationale){fail('Enter a rationale.');return;}
    if(action==='close'&&(c.gaps.length||!old.acknowledged)){fail(c.gaps.length?'Closure blocked: '+c.gaps.length+' material evidence gaps remain.':'Closure blocked: QC acknowledgement is required.');return;}
    let patch;
    if(qc){
      const start=value('start'),end=value('end');
      if((start||end)&&(!start||!end||Date.parse(start+'Z')>=Date.parse(end+'Z'))){fail('Enter a start before the end. Use UTC.');return;}
      patch={acknowledged:true,state:action==='submit'?'Awaiting QA':'Awaiting QC'};
      if(start&&end)patch.window={start:start+'Z',end:end+'Z',boundary:value('boundary')};
    }else{
      patch={state:action==='close'?'Closed · simulated':action==='request'?'Evidence requested':'Awaiting QA',
        owner:value('owner'),due:value('due'),qms:value('qms'),decision:rationale};
    }
    const names={ack:'QC acknowledged',submit:'QC submitted to QA',request:'QA requested evidence',decision:'QA recorded decision',close:'QA closed simulated review'};
    const next={...review,[c.id]:{...old,...patch,history:[...old.history,{at:new Date().toISOString(),actor:qc?'Demo QC analyst':'Demo QA reviewer',
      action:names[action],reason:rationale+(value('reference')?' · '+value('reference'):'')}]}};
    try{localStorage.setItem(key,JSON.stringify(next));}catch{fail('Browser storage unavailable. The change was not saved.');return;}
    review=next;message='Saved in this browser’s simulated review history.';draw('qcFeedback');
  }
  function exportCase(c) {
    const r=review[c.id]||{history:[]}, injectionRecord=get(c.injection);
    const payload={schema:'ReSolve simulated inspection package v1',classification:'Fictional and unvalidated',case:{...c,status:status(c),owner:owner(c),due:r.due},
      scope:seq,snapshot:F.asOf,selectedInjection:injectionRecord,chronology:injectionRecord.events,hypotheses:hypotheses(c),
      authoritativeSources:F.sources.map(s=>({...s,locator:s.key==='cds'?seq.id+'/'+injectionRecord.id:s.ref,linkState:'Fictional pointer to original records'})),
      effectiveRecords:injectionRecord.controls,controlledVersions:F.controls,affectedScope:affected(c,r.window),exposureWindow:r.window||suggested(c),
      reconciliation:{expected:eligible.length,matched:matched.length,unmatched:countMatch('Unmatched'),ambiguous:countMatch('Ambiguous'),coverage,duplicatesExcluded:duplicates,toleranceSeconds:F.tolerance},
      included:data.map(row=>({id:row.id,type:row.resultType,linked:row.match.state,analytical:row.analytical})),
      exclusions:[{id:'RS-INJ-07 v1 / UPLOAD-RETRY',reason:'Duplicate upload, excluded from unique match count only'},{id:'INJ-02',reason:'Trial excluded from release assessment only'}],
      evidenceClassification:{detector:'Simulated',controlledValues:'Simulated',analyticalResults:'Simulated authoritative CDS fixtures',observedVolume:injectionRecord.n===8?'Unavailable':'Simulated device measurement',expectedVolume:injectionRecord.n===8?'11 mL · calculated from planned run':null},
      qms:r.qms||null,reviewerHistory:r.history,decision:r.decision||null,
      integrity:'Production export must resolve the CDS locators to original dynamic records and metadata, with governed retention and access.'};
    download(c.id+'-inspection.json',JSON.stringify(payload,null,2));
  }
  const views={queue,case:caseView,injection,metric,browse,sources:()=>head('Authoritative evidence sources','Fixture source authority and last successful update')+sources(),
    controls:()=>head('Reporting and regulatory evidence','Controls mapping for intended use')+controls()};
  function draw(focus) {
    root.innerHTML=views[route.view]();
    if(focus)root.querySelector('#'+focus)?.focus();
  }
  function handler(e) {
    const target=e.target.closest('[data-qc]');if(!target)return;
    const v=target.dataset.v;
    switch(target.dataset.qc){
      case 'back':back();break;
      case 'reset':filters={};draw('qcFilter-site');break;
      case 'case':open('case',{id:v});reviewMode='QC triage';draw('qcTitle');break;
      case 'injection':open('injection',{n:Number(v),id:route.id});break;
      case 'browse':open('browse',{level:Number(v)});break;
      case 'metric':open('metric',{metric:v});break;
      case 'mode':reviewMode=v;message='';draw();root.querySelector('[data-qc="mode"][data-v="'+v+'"]')?.focus();break;
      case 'export':exportCase(byId(v));break;
      default:open(target.dataset.qc);
    }
  }
  function setup() {
    if(state.role!=='QC / Quality'||state.nav!=='overview')return;
    const overview=$('overviewView'),node=getNode();
    if(!overview.hidden&&node.level==='enterprise'){
      root?.remove();root=document.createElement('section');root.id='qcWorkspace';root.className='qc-workspace';
      root.setAttribute('aria-label','QC and QA investigations');$('overviewVisualization').prepend(root);
      root.onclick=handler;
      root.onchange=event=>{
        const field=event.target;
        if(field.dataset.filter){filters[field.dataset.filter]=field.value;draw(field.id);}
        if(field.id==='qcPickInjection'){route.n=Number(field.value);draw(field.id);}
      };
      root.onsubmit=save;draw();
    }else if(node.level==='hplc'&&node.name===seq.asset&&lineage(node).some(x=>x.name===seq.lab)&&lineage(node).some(x=>x.name===seq.site)){
      const link=document.createElement('button');link.type='button';link.className='action qc-sequence-bridge';link.textContent='Open fictional investigation sequence '+seq.id;
      link.onclick=()=>{route={view:'browse',level:5};history=[];dashboardScope('enterprise');root?.querySelector('#qcTitle')?.focus();};
      $('explorerContent').prepend(link);
    }
  }
  const renderBeforeQuality=renderDemoApp;
  renderDemoApp=function(){renderBeforeQuality();setup();};
  window.addEventListener('keydown',event=>{
    if(event.altKey&&event.key==='ArrowLeft'&&root?.isConnected&&history.length){
      event.stopImmediatePropagation();event.preventDefault();back();
    }
  },true);
  setup();
})();
