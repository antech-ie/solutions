
'use strict';

const qcFixtures = (() => {
  const minute = 60_000;
  const origin = Date.UTC(2026,10,17,9);
  const time = (number,offset=0) => origin + (number-1)*4*minute + offset*1000;
  const iso = ms => new Date(ms).toISOString();
  const pad = n => String(n).padStart(2,'0');
  const sequence = {
    id:'CDS-BER-SEQ-1711-A', site:'Berlin Site', lab:'QC Lab A', country:'Germany', asset:'HPLC-01',
    recycler:'RS-BER-000121', recipe:'W/MeOH 50:50', method:'MTH-BER-042', version:'7', pairing:'PAIR-BER-121',
    preparation:'MP-BER-1711-01', reservoir:'RES-BER-A-02', zone:'Europe/Berlin', holdRef:'SOP-MP-012 v4',
    start:iso(time(1)), end:iso(time(24,110)), recordedHold:'Within the fictional site limit', plannedEligibility:'Isocratic method and scheduled pairing'
  };
  const sources = [
    {key:'device',name:'ReSolve device log',fields:'Commands, telemetry, valve feedback and routing events',ref:'RS-LOG-1711',updated:iso(time(24,110)),state:'Partial'},
    {key:'cds',name:'Chromatography data system',fields:'Expected sequence, trace, processing history, suitability, results, specification',ref:sequence.id,updated:'2026-11-17T12:35:00.000Z',state:'Available'},
    {key:'lims',name:'LIMS',fields:'Sample IDs, lot context and analytical review status',ref:'LIMS-BER-1711',updated:'2026-11-16T11:00:00.000Z',state:'Stale · >24 h'},
    {key:'qms',name:'QMS and controlled records',fields:'Approvals, deviations, CAPA, configuration release and qualification',ref:'QMS-BER-SNAPSHOT-1711',updated:'2026-11-17T12:20:00.000Z',state:'Partial'},
    {key:'site',name:'Site mobile-phase records',fields:'Preparation, reservoir and approved hold or reuse limits',ref:sequence.preparation,updated:'2026-11-17T11:50:00.000Z',state:'Available'}
  ];
  const controls = {
    method:{id:sequence.method,version:'7',approval:'APR-MTH-042-7',from:'2026-11-10T08:00:00.000Z',scope:'Isocratic • HPLC-01 / RS-BER-000121'},
    configuration:[
      {id:'CFG-17',approval:'APR-CFG-17',from:'2026-11-12T08:00:00.000Z',to:null},
      {id:'CFG-18',approval:null,from:iso(time(8,42)),to:iso(time(10))}
    ],
    qualification:[
      {id:'OQ-BER-121-A',approval:'QA-OQ-121-A',from:'2026-11-12T08:00:00.000Z',to:iso(time(8,-2))},
      {id:'OQ-BER-121-B',approval:'QA-OQ-121-B',from:iso(time(9,160)),to:null}
    ]
  };
  const expected = Array.from({length:24},(_,i) => {
    const n=i+1;
    const resultType = ({2:'Trial',4:'Failed system suitability',6:'Aborted',12:'Original result',13:'Passing repeat',21:'Reprocessed record'})[n] || 'Original result';
    const result=n===12?109:n===13?101:n===2||n===4||n===6?null:98+n%5;
    const specification=result===null?null:{id:'SPEC-BER-042-v3',min:95,max:105,units:'% of target'};
    const oos=specification!==null&&(result<specification.min||result>specification.max);
    return {n,id:'INJ-'+pad(n),sample:'SMP-BER-'+pad(n===13 ? 12 : n),lot:n<16?'LOT-BER-6117':'LOT-BER-6118',sequence:sequence.id,
      start:iso(time(n)),end:iso(time(n,110)),operator:'Analyst QC-07',configuration:n===8||n===9?'CFG-18':'CFG-17',
      expectedEligible:true,resultType,processing:n===21?['ORIGINAL-21','REPROCESS-21-v2']:[n===13?'REPEAT-12':'ORIGINAL-'+pad(n)],
      analytical:n===4?'Failed system suitability':oos?'OOS':n===13?'Passing repeat':n===6?'Aborted · no result':n===2?'Trial · excluded from release assessment':'Within demo specification',
      result,specification,
      sst:n===4?'Failed':n===6?'Not assessed':'Passed'};
  });
  const device = expected.filter(r=>![6,8].includes(r.n)).map(r=>({
    id:'RS-'+r.id, injection:r.id, sequence:sequence.id, version:1, upload:'UPLOAD-A', at:r.start,
    feedback:[3,9,16].includes(r.n)?'Waste':'Reuse'
  }));
  device.push({...device.find(r=>r.injection==='INJ-07'),upload:'UPLOAD-RETRY'});
  device.push({...device.find(r=>r.injection==='INJ-21'),version:2,upload:'UPLOAD-LATE',feedback:'Reuse'});
  device.push(...[-2,3].map((offset,i)=>({id:'RS-CAND-08-'+(i+1),injection:null,sequence:null,version:1,upload:'UPLOAD-A',
    at:iso(time(8,offset)),feedback:null})));
  const tolerance=5;
  function reconcile(row) {
    const earliest = new Map();
    for (const value of device) {
      const key=value.id+'@'+value.version;
      if (!earliest.has(key)) earliest.set(key,value);
    }
    const unique=[...earliest.values()];
    const direct=unique.filter(v=>v.sequence===row.sequence&&v.injection===row.id);
    const candidate=direct.length?direct:unique.filter(v=>!v.injection&&Math.abs(Date.parse(v.at)-Date.parse(row.start))<=1000*tolerance);
    const count=new Set(candidate.map(v=>v.id)).size;
    return {state:count>1?'Ambiguous':count===0?'Unmatched':direct.length?'Matched':'Candidate only',
      method:direct.length?'Sequence and injection IDs':'Timestamp-only · ±'+tolerance+' s', candidate,
      duplicateUploads:device.filter(v=>candidate.some(c=>c.id===v.id)).length-candidate.length};
  }
  function conditions(row) {
    const instant=Date.parse(row.start);
    const qualification=controls.qualification.find(r=>Date.parse(r.from)<=instant&&(!r.to||Date.parse(r.to)>=Date.parse(row.end)));
    const cfg=controls.configuration.find(r=>r.id===row.configuration);
    const method=Date.parse(controls.method.from)<=instant ? controls.method : null;
    const configAtStart=cfg&&Date.parse(cfg.from)<=instant&&(!cfg.to||Date.parse(cfg.to)>instant);
    const reason=!qualification?'No in-date qualification at run time':!method?'Approved method record unavailable':
      !cfg?.approval||!configAtStart?'Release evidence unavailable for configuration in use':'Effective method, pairing, configuration and qualification verified in fixture';
    return {state:!qualification?'Outside approved conditions':!method||!cfg?.approval||!configAtStart?'Unknown':'Within approved conditions',
      reason,method,pairing:sequence.pairing,configuration:cfg,qualification:qualification||null,
      subsequentQualification:qualification?null:controls.qualification[1]};
  }
  function events(row) {
    const mk=(offset,system,kind,details,extra={})=>({id:row.id+'-EV-'+offset+'-'+kind.toLowerCase().replaceAll(' ','-'),
      offset,at:iso(time(row.n,offset)),system,kind,details,...extra});
    const list=[mk(0,'CDS','Injection started',row.operator)];
    if (row.n===6) return [...list,mk(33,'CDS','Aborted','No reportable analytical result. ReSolve record missing.')];
    if ([3,16].includes(row.n)) list.push(mk(28,'ReSolve','Waste diversion',row.n===3?'Expected diversion under released routing profile; independent valve feedback confirms Waste.':'Manual waste request; independent valve feedback confirms Waste.',
      {actor:row.n===3?'Routing controller':row.operator,previous:'Reuse',next:'Waste',reason:row.n===3?'Approved diversion window':'Analyst observation',approval:row.n===3?'APR-CFG-17':null}));
    if (row.n===8) list.push(
      mk(31,'ReSolve','Route commanded','Reuse commanded; command has no independent feedback in this interval.'),
      mk(42,'ReSolve','Threshold changed','Configuration change recorded before the evidence gap.',
        {actor:'Operator ENG-03',previous:'Demo band A',next:'Demo band B',reason:'Adjustment entered during sequence',approval:null}),
      mk(48,'ReSolve','Telemetry gap begins','Routing observation lost. Observed valve position is unknown.'),
      mk(53,'CDS','Detector signal lost','Independent device feedback is unavailable.'),
      mk(84,'CDS','Detector signal returns','Detector trace resumes; does not establish valve position.'));
    if (row.n===9) list.push(mk(35,'ReSolve','Routing anomaly','Unexpected commanded waste interval; observed valve position confirms Waste.'));
    if ([3,9,16].includes(row.n)) list.push(mk(55,'ReSolve','Reuse resumed','Commanded Reuse and observed valve feedback agree.'));
    if (row.n===18) list.push(mk(22,'CDS','Manual zero','Reason reference absent.',
      {actor:row.operator,previous:'Baseline drift flagged',next:'Zero command logged',reason:null,approval:null}));
    if (row.n===4||row.n===12) list.push(mk(109,'CDS',row.analytical,row.n===4?'Authoritative suitability result failed.':'Original result exceeds the linked specification.'));
    if (row.n===13) list.push(mk(109,'CDS','Repeat result','Passing repeat linked to INJ-12. Original result retained.'));
    if (row.n===21) list.push(mk(109,'CDS','Reprocessed','Original and second processing versions retained.'));
    return [...list,mk(110,'CDS','Acquisition ended','Chromatography acquisition record')];
  }
  const cases=[
    {id:'QC-0268',title:'Threshold change and telemetry gap', injection:8,type:'Threshold change / lost signal',tags:['Threshold change','Lost signal','Telemetry gap','Ambiguous match','Overdue qualification'],
      impact:'Observed routing is unknown. Assess solvent preparation and subsequent injections.',
      gaps:['One authoritative ReSolve-to-CDS match for INJ-08','Independent valve-position evidence during the telemetry gap','Approval and change rationale for CFG-18','Verified lot linkage from refreshed LIMS'],owner:'QC investigation team',next:'Reconcile original device and CDS records',status:'Awaiting QC'},
    {id:'QC-0266',title:'Expected injection has no ReSolve record',injection:6,type:'Unmatched record',tags:['Unmatched record'],
      impact:'Coverage is incomplete; CDS records an aborted run.',gaps:['ReSolve export or documented non-acquisition'],owner:'Interface support',next:'Verify sequence reconciliation',status:'Awaiting QC'},
    {id:'QC-0264',title:'System suitability failed',injection:4,type:'Failed system suitability',tags:['Failed system suitability','Analytical exception'],
      impact:'Quality assessment needed for the affected sequence.',gaps:['Approved suitability review'],owner:'QC supervisor',next:'Review CDS suitability and original run',status:'Awaiting QA'},
    {id:'QC-0272',title:'Original OOS result retained after passing repeat',injection:12,type:'OOS result',tags:['OOS result','Analytical exception'],
      impact:'Original result remains above specification; repeat does not resolve investigation.',gaps:['Approved investigation rationale and disposition reference'],owner:'Quality unit',next:'Review original and repeat processing records',status:'Awaiting QA'},
    {id:'QC-0269',title:'Unexpected routing during a qualification gap',injection:9,type:'Routing anomaly',tags:['Routing anomaly','Overdue qualification'],
      impact:'Operating configuration and qualification gap require assessment.',gaps:['Assessment against approved operating conditions'],owner:'Lab systems',next:'Compare commands, feedback and approved versions',status:'Awaiting QC'},
    {id:'QC-0276',title:'Manual waste diversion',injection:16,type:'Manual waste',tags:['Manual waste'],
      impact:'Waste position confirmed; review the operator’s logged intervention.',gaps:[],owner:'QC analyst',next:'Document intervention review',status:'Awaiting QC'},
    {id:'QC-0278',title:'Manual signal zero',injection:18,type:'Signal zero',tags:['Signal zero'],
      impact:'Assess impact of the manual detector action on the analytical record.',gaps:['Reason and approval reference'],owner:'QC analyst',next:'Obtain CDS audit record and analyst rationale',status:'Awaiting QC'}
  ];
  const links=[
    {kind:'Injection',id:'INJ-08',certainty:'Confirmed',why:'CDS sequence and injection keys are available; routing match still ambiguous.'},
    {kind:'Injection',id:'INJ-09',certainty:'Possible',why:'Inside the proposed window and assigned to the same pairing.'},
    {kind:'Analytical sequence',id:sequence.id,certainty:'Confirmed',why:'CDS expected sequence includes the selected injection.'},
    {kind:'Solvent preparation',id:sequence.preparation,certainty:'Possible',why:'Site pairing links the preparation to the assigned reservoir.'},
    {kind:'Reservoir',id:sequence.reservoir,certainty:'Possible',why:'Shared reservoir during the candidate exposure window.'},
    {kind:'Product lot',id:'LOT-BER-6117',certainty:'Unresolved',why:'LIMS link awaits refresh and confirmation.'}
  ];
  const recurrence=[
    {id:'PRIOR-01',period:'10 Nov 2026',exception:false},{id:'PRIOR-02',period:'10 Nov 2026',exception:true},
    {id:'PRIOR-03',period:'10 Nov 2026',exception:false},{id:'PRIOR-04',period:'10 Nov 2026',exception:false},
    ...[9,10,11,14].map(n=>({id:'INJ-'+pad(n),period:'17 Nov 2026',exception:n===9}))
  ];
  return {sequence,sources,controls,expected,reconcile,conditions,events,cases,links,recurrence,tolerance,
    trendRule:null,capaEffective:null,asOf:'2026-11-17T12:45:00.000Z',time,iso,pad};
})();
