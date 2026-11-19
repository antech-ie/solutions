const categoryNames={energy:'Energy & ventilation',water:'Water & utilities',plastics:'Plastics & consumables',procurement:'Procurement',operations:'Laboratory practice'};
let portalSession=false,portalTab='overview',completedCourses=new Set(),demoTickets=[];
function exampleCard(e){const photo = portfolioPhotos[e.id]; if (photo) return photoExampleCard(e, photo); return `<a class="card example-card" href="#/${e.id}"><span class="badge example">Researched example · ${e.kind}</span><small class="provider">${esc(e.provider)} / ${esc(e.name)}</small><h3>${esc(e.title)}</h3><p>${esc(e.summary)}</p><span class="arrow">↗</span></a>`}
function filterExamples() {
  const category = document.getElementById("example-category").value;
  const kind = document.getElementById("example-kind").value;
  const matches = sustainabilityExamples.filter(example =>
    (category === "all" || example.category === category) &&
    (kind === "all" || example.kind.toLowerCase() === kind));
  document.getElementById("example-count").textContent = `${matches.length} of ${sustainabilityExamples.length} examples`;
  document.getElementById("example-results").innerHTML = matches.length
    ? matches.map(example => catalogueResultCard(example.id)).join("")
    : '<p class="empty">No examples match these filters. Clear a filter to see more examples.</p>';
}
function trainingPage(){return pageHead('training','Practical learning. Better laboratory habits.','Five illustrative training programmes for laboratory teams, procurement professionals and sustainability champions.')+`<section class="page-body"><div class="intro-note">Proposed Resolved Labs training examples. Formats, durations and learning materials are illustrative. No scheduled courses, accreditation or external certification are offered in this prototype.</div><div class="cards">${trainingExamples.map(e=>`<a class="card" href="#/${e.id}"><span class="badge future">Proposed course</span><p class="provider">${esc(e.format)}</p><h3>${esc(e.title)}</h3><p>${esc(e.summary)}</p><span class="arrow">↗</span></a>`).join('')}</div></section>`}
function courseDetail(e){return pageHead(e.id,e.title,e.summary)+`<section class="page-body"><div class="two-col"><div><span class="badge future">Illustrative training programme</span><h2>What participants will explore</h2><ol class="learning-list">${e.modules.map(m=>`<li>${esc(m)}</li>`).join('')}</ol><h3>Take-away</h3><p>${esc(e.output)}</p></div><aside class="package-panel"><h3>Course at a glance</h3><p><strong>Format</strong><br>${esc(e.format)}</p><p><strong>For</strong><br>${esc(e.audience)}</p><p class="small-note">Example curriculum only. Dates, fees and delivery are to be confirmed. No external accreditation is implied.</p><a class="button" href="#/contact">Discuss training needs ↗</a><p><a class="text-link" href="#/customer-login">Preview the customer learning area ↗</a></p></aside></div><p><a class="text-link" href="#/training">← All training examples</a></p></section>`}
function consultingPage(){return pageHead('consulting','From a clear diagnosis to sustained progress.','Four proposed consulting packages connect laboratory priorities, commercial decisions and practical implementation.')+`<section class="page-body"><div class="intro-note">Illustrative Resolved Labs packages. Scope, delivery time and commercial terms would be agreed for each engagement. These are prospective services, not accredited audits or guaranteed savings programmes.</div><div class="package-grid">${consultingExamples.map(e=>`<a class="card" href="#/${e.id}"><span class="eyebrow">${e.phase}</span><h3>${e.title}</h3><p>${e.summary}</p><span class="package-duration">${e.duration}</span><span class="arrow">↗</span></a>`).join('')}</div></section>`}
function packageDetail(e){return pageHead(e.id,e.title,e.summary)+`<section class="page-body"><div class="two-col"><div><span class="badge future">Proposed consulting package</span><h2>A defined starting point.<br>A useful set of outputs.</h2><h3>Who it is for</h3><p>${e.audience}</p><h3>What we would review</h3><p>${e.inputs}</p><h3>Illustrative deliverables</h3><ul class="learning-list">${e.deliverables.map(d=>`<li>${d}</li>`).join('')}</ul></div><aside class="package-panel"><span class="eyebrow">${e.phase}</span><h3>${e.duration}</h3><p>Timing depends on scope, laboratory access and data availability. Fees would be scoped after an initial conversation.</p><p class="small-note">${e.boundary}</p><a class="button" href="#/contact">Discuss this package ↗</a></aside></div><p><a class="text-link" href="#/consulting">← Compare the four consulting packages</a></p></section>`}
function loginPage(){
  return pageHead('customer-login','Customer workspace demo','Explore how Antech could share project updates, documents, training and support in one workspace.')+`
    <section class="page-body portal-entry">
      <div>
        <h2>What you can try</h2>
        <ul class="learning-list">
          <li>Review project milestones and next actions</li>
          <li>Download a sample document and track course progress</li>
          <li>Create a sample support request</li>
        </ul>
      </div>
      <div class="package-panel form">
        <span class="badge example">Interactive demo</span>
        <h2>Explore a sample workspace</h2>
        <p>The workspace uses fictional records. Changes last until you close the workspace or reload the page.</p>
        <button class="button" id="demo-open" type="button">Open sample workspace ↗</button>
      </div>
    </section>`;
}
function portalPage(){
  if(!portalSession)return loginPage();
  return pageHead('customer-portal','Customer workspace demo','Sample account for Northfield Analytical')+`
    <section class="page-body" id="demo-workspace">
      <div class="portal-banner"><span>Fictional company and records</span><button id="demo-close" class="text-button" type="button">Close workspace</button></div>
      <nav class="portal-tabs" aria-label="Customer workspace sections">${[['overview','Overview'],['documents','Documents'],['training','Training'],['support','Support']].map(([id,label])=>`<button type="button" data-portal-tab="${id}" aria-pressed="${portalTab===id}">${label}</button>`).join('')}</nav>
      <div id="portal-content">${portalContent()}</div>
    </section>`;
}
function demoTicket(ticket,index){
  return `<div class="ticket"><span class="badge">Sample request DEMO-${1001+index}</span><h3>${esc(ticket.summary)}</h3><p>${esc(ticket.topic)} · Sample status: awaiting triage</p></div>`;
}
function portalContent(){if(portalTab==='documents')return `<div class="section-head"><div><span class="eyebrow">Sample document library</span><h2>Sample documents</h2></div><p>Downloads are short sample text files, clearly marked as fictional. They are not technical product documentation.</p></div>${[['diagnostic','Diagnostic summary','Example assessment scope and opportunity register'],['roadmap','Sustainability roadmap','Example actions, owners and decision gates'],['training','Training action worksheet','Example learning prompts and action plan']].map(([id,title,desc])=>`<div class="document-row"><div><h3>${title}</h3><p>${desc} · Sample only</p></div><button class="button light" data-download="${id}">Download sample ↓</button></div>`).join('')}`;
 if(portalTab==='training')return `<span class="eyebrow">Learning record · Sample data</span><h2>Course progress</h2><p id="learning-progress" aria-live="polite">${completedCourses.size} of ${trainingExamples.length} demo courses marked complete</p><div class="cards">${trainingExamples.map(e=>`<article class="card"><span class="badge ${completedCourses.has(e.id)?'':'future'}">${completedCourses.has(e.id)?'Demo completed':'Demo assigned'}</span><h3>${e.title}</h3><p>${e.format}</p><p><a class="text-link" href="#/${e.id}">View syllabus ↗</a></p><button class="button light" data-complete="${e.id}" ${completedCourses.has(e.id)?'disabled':''}>${completedCourses.has(e.id)?'Marked complete':'Mark demo complete'}</button></article>`).join('')}</div>`;
 if(portalTab==='support')return `
   <div class="two-col">
     <div>
       <h2>Sample support requests</h2>
       <p>Create a fictional request to see how the support queue works. Requests stay in this demo session.</p>
       <div id="demo-ticket-list">${demoTickets.length?demoTickets.map(demoTicket).join(''):'<p class="empty">No requests in this demo session.</p>'}</div>
     </div>
     <form class="form package-panel" id="demo-support">
       <h3>Create a sample request</h3>
       <label>Request topic<select name="topic"><option>Assessment project</option><option>Product application question</option><option>Training access</option><option>Document request</option></select></label>
       <label>Summary<input name="summary" required maxlength="160" placeholder="Use fictional information only"></label>
       <button class="button" type="submit">Create sample request ↗</button>
       <p role="status" id="demo-support-status"></p>
     </form>
   </div>`;
 return `<div class="portal-stats"><div><span>Active project</span><strong>Sustainable Labs Diagnostic</strong><small>Illustrative engagement</small></div><div><span>Next milestone</span><strong>Baseline review</strong><small>Sample status: in progress</small></div><div><span>Learning record</span><strong>${completedCourses.size} / 5 courses</strong><small>Demo completion tracking</small></div></div><div class="two-col"><article class="package-panel"><span class="eyebrow">Project milestones</span><h2>Assessment milestones</h2><ol class="milestones"><li class="done">Kick-off & scope agreed <small>Sample completed</small></li><li class="active">Data gathering & baseline review <small>Sample in progress</small></li><li>Opportunity workshop <small>Sample planned</small></li><li>Diagnostic readout <small>Sample planned</small></li></ol></article><article><span class="eyebrow">Next actions · Sample list</span><h2>Next steps</h2><a class="row-link" href="#/package-diagnostic">Review diagnostic scope <span>↗</span></a><button class="row-link tab-shortcut" data-portal-tab="documents">Read the sample roadmap <span>↗</span></button><button class="row-link tab-shortcut" data-portal-tab="training">Explore assigned learning <span>↗</span></button><button class="row-link tab-shortcut" data-portal-tab="support">Create a sample request <span>↗</span></button><p class="small-note">This dashboard demonstrates a possible customer experience. It is not a live project-management, compliance or reporting system.</p></article></div>`}
function downloadDemo(id){const content={'diagnostic':'Diagnostic scope: one fictional analytical laboratory. Review purchasing, waste, energy and water data. Example opportunity: improve sample inventory. No customer findings or validated results are included.','roadmap':'Example roadmap: establish baseline; review opportunities; agree a pilot; measure results. Owners, dates, benefits and budgets require customer agreement.','training':'Example worksheet: identify one laboratory hotspot, choose a measurable action, assign an owner and agree a review date.'}[id];if(!content)return;const blob=new Blob([`RESOLVED LABS — FICTIONAL DEMO DOCUMENT\n\n${content}\n\nSample only. Not product instructions, qualification evidence or a customer report.`],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`resolved-labs-demo-${id}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function bindExperience(id){
 const open = document.querySelector('#demo-open');
 if (open) open.onclick = () => {
   portalSession = true;
   portalTab = 'overview';
   if (location.hash === '#/customer-portal') {
     render();
     document.querySelector('main').focus({preventScroll:true});
   } else {
     location.hash = '/customer-portal';
   }
 };

 const workspace = document.querySelector('#demo-workspace');
 if (!workspace) return;
 const content = workspace.querySelector('#portal-content');
 workspace.onclick = event => {
   const button = event.target.closest('button');
   if (!button) return;

   if (button.id === 'demo-close') {
     portalSession = false;
     completedCourses.clear();
     demoTickets = [];
     location.hash = '/customer-login';
   } else if (button.dataset.portalTab) {
     portalTab = button.dataset.portalTab;
     workspace.querySelectorAll('.portal-tabs [data-portal-tab]').forEach(tab => {
       tab.setAttribute('aria-pressed', String(tab.dataset.portalTab === portalTab));
     });
     const shortcut = !button.closest('.portal-tabs');
     content.innerHTML = portalContent();
     if (shortcut) {
       const heading = content.querySelector('h2');
       heading.tabIndex = -1;
       heading.focus();
     }
   } else if (button.dataset.download) {
     downloadDemo(button.dataset.download);
   } else if (button.dataset.complete) {
     completedCourses.add(button.dataset.complete);
     const course = button.closest('article');
     const badge = course.querySelector('.badge');
     badge.classList.remove('future');
     badge.textContent = 'Demo completed';
     button.textContent = 'Marked complete';
     content.querySelector('#learning-progress').textContent = `${completedCourses.size} of ${trainingExamples.length} demo courses marked complete`;
     const heading = course.querySelector('h3');
     heading.tabIndex = -1;
     heading.focus();
     button.disabled = true;
   }
 };

 workspace.onsubmit = event => {
   const form = event.target;
   if (form.id !== 'demo-support') return;
   event.preventDefault();
   const data = new FormData(form);
   const summary = String(data.get('summary')).trim();
   const status = content.querySelector('#demo-support-status');
   if (!summary) {
     status.textContent = 'Enter a short summary for the sample request.';
     form.elements.summary.focus();
     return;
   }

   const index = demoTickets.length;
   const ticket = {topic: String(data.get('topic')), summary};
   demoTickets.push(ticket);
   const list = content.querySelector('#demo-ticket-list');
   list.querySelector('.empty')?.remove();
   list.insertAdjacentHTML('beforeend', demoTicket(ticket,index));
   form.reset();
   status.textContent = `Sample request DEMO-${1001+index} added to this workspace.`;
 };
}
function extendedPage(id){const example=sustainabilityExamples.find(e=>e.id===id);if(example)return independentExamplePage(example);const course=trainingExamples.find(e=>e.id===id);if(course)return courseDetail(course);const pkg=consultingExamples.find(e=>e.id===id);if(pkg)return packageDetail(pkg);if(id==='examples')return examplesLibraryPage();if(id==='customer-login')return loginPage();if(id==='customer-portal')return portalPage();return null}
