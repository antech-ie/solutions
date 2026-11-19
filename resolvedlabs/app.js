const groups={
solutions:{title:'Solutions',intro:'Find an approach for the outcome your lab needs.',groups:[['By outcome',['operating-costs','solvent-waste','circularity','solvent-supply','productivity','method-consistency','resource-efficiency','reporting','plastics']],['By laboratory role',['qc','qa','procurement','sustainability','operations','site-management']],['Industries',['pharma','biopharma','contract','research','academic']]]},
products:{title:'Products',intro:'Evaluate ReSolve and compare independent laboratory equipment and consumables.',groups:[['Antech product',['resolve']],['Product categories',['solvent-recovery','consumables','resource-technologies']],['Compare options',['catalog','manufacturers']]]},
services:{title:'Services',intro:'Expertise from first assessment to sustained improvement.',groups:[['Plan & implement',['assessments','consulting','implementation']],['Deploy & measure',['qualification','measurement']],['Training & education',['training','best-practices','workshops']]]},
resources:{title:'Resources',intro:'Evidence and practical knowledge for better decisions.',groups:[['Learn',['insights','guides','white-papers']],['See & participate',['case-studies','webinars']],['Customer support',['support','documentation','maintenance']]]},
about:{title:'About',intro:'A specialist business built around better laboratory outcomes.',groups:[['Resolved Labs',['who-we-are','mission','approach']],['Our ecosystem',['partners','manufacturers']],['Connect',['contact']]]}
};
const titles={ 'operating-costs':'Reduce operating costs','solvent-waste':'Reduce solvent use & hazardous waste','resource-efficiency':'Improve resource efficiency',plastics:'Reduce single-use plastics',reporting:'Support sustainability reporting',productivity:'Improve laboratory productivity',qc:'QC laboratory managers',qa:'Quality assurance',procurement:'Procurement',sustainability:'Sustainability managers',operations:'Laboratory operations','site-management':'Site management',pharma:'Pharmaceutical',biopharma:'Biopharmaceutical',contract:'Contract laboratories',research:'Research laboratories',academic:'Academic laboratories','solvent-recovery':'Solvent recovery',consumables:'Sustainable consumables','resource-technologies':'Resource efficiency technologies',catalog:'All products',manufacturers:'Manufacturers',resolve:'ReSolve solvent recovery',assessments:'Sustainability assessments',consulting:'Consulting & roadmaps',implementation:'Implementation support',qualification:'Installation, qualification & validation support',measurement:'Measurement & reporting',training:'Training & education','best-practices':'Laboratory best practices',workshops:'Workshops',insights:'Insights',guides:'Sustainability guides','white-papers':'White papers','case-studies':'Case studies',webinars:'Webinars',support:'Technical support',documentation:'Product documentation',maintenance:'Maintenance','who-we-are':'Who we are',mission:'Our mission',approach:'Our approach',partners:'Our partners',contact:'Speak to an expert',sitemap:'Website sitemap',architecture:'Architecture rationale'};
const descriptions={resolve:'ReSolve is the flagship HPLC mobile-phase solvent recovery system, suited to isocratic applications. It supports solvent recovery around the existing HPLC workflow; it does not change or replace the HPLC process.', 'solvent-waste':'Explore solvent recovery opportunities for suitable isocratic HPLC applications, alongside future waste-reduction expertise.', 'operating-costs':'Connect recurring laboratory costs with relevant technologies, implementation expertise and evidence.',qc:'Evaluate application suitability, operational priorities and the evidence needed for a practical laboratory decision.',qa:'Consider documented suitability, qualification needs and the laboratory’s own quality requirements before adopting a technology.',procurement:'Compare manufacturers, application fit, support needs and whole-life cost rather than purchase price alone.',sustainability:'Connect resource use and waste baselines with measurable implementation plans.',reporting:'Explore a prospective service for establishing baselines and documenting progress. No reporting capabilities are claimed for the current product.',manufacturers:'The catalogue is structured to accommodate ReSolve and future specialist manufacturers. No third-party manufacturer partnerships are represented as confirmed.',partners:'An open architecture for future specialist technology and delivery partners. No partner relationships are claimed in this prototype.',training:'Explore five proposed courses: sustainability foundations, solvent and waste reduction, procurement, cold storage and sustainability champions.',support:'Find a route to product assistance, documentation and maintenance enquiries. Support details and response commitments must be confirmed before launch.'};
registerExamples(groups,titles,descriptions);
Object.assign(titles, {
  circularity: "Recover and reuse resources",
  "solvent-supply": "Reduce solvent supply and price risk",
  productivity: "Improve laboratory productivity",
  "method-consistency": "Manage mobile-phase variation",
  "who-we-are": "Meet the ReSolve team",
});
titles['customer-login'] = 'Customer workspace demo';
titles['case-studies'] = sectionContent['case-studies'].title;
titles.webinars = sectionContent.webinars.title;
titles.partners = sectionContent.partners.title;
titles['white-papers'] = 'Technical papers';
if (!groups.services.groups[0][1].includes('implementation')) groups.services.groups[0][1].splice(2, 0, 'implementation');
const parents={}; Object.entries(groups).forEach(([key,g])=>g.groups.forEach(([,ids])=>ids.forEach(id=>{if(!parents[id])parents[id]=key})));parents.support='support';parents.documentation='support';parents.maintenance='support';parents.examples='solutions';parents['customer-login']='support';parents['customer-portal']='support';
for(const e of sustainabilityExamples)parents[e.id]='products';
for(const e of trainingExamples)parents[e.id]='services';
for(const e of consultingExamples)parents[e.id]='services';
const prospective=new Set(['consumables','resource-technologies','assessments','consulting','implementation','qualification','measurement','training','best-practices','workshops']);
for(const e of [...trainingExamples,...consultingExamples])prospective.add(e.id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(id,label)=>`<a href="#/${id}">${label||titles[id]||groups[id]?.title} ↗</a>`;
const badge = id => {
  const label = id === 'resolve' ? 'Antech product' : sectionContent[id]?.label || (prospective.has(id) ? 'Proposed' : '');
  return label ? `<span class="badge ${prospective.has(id) ? 'future' : ''}">${esc(label)}</span>` : '';
};
const card=(id,description)=>sustainabilityExamples.some(e=>e.id===id)?exampleCard(sustainabilityExamples.find(e=>e.id===id)):`<a class="card" href="#/${id}">${badge(id)}<h3>${titles[id]||groups[id]?.title}</h3><p>${description||descriptions[id]||'Explore the proposed pathway, relevant offerings and next steps.'}</p><span class="arrow">↗</span></a>`;
const main=document.querySelector('main'),nav=document.querySelector('#nav'),mega=document.querySelector('#mega');let opened=null,pinned=null,closeTimer;
nav.innerHTML=Object.entries(groups).map(([id,g])=>`<button class="nav-button" data-menu="${id}" aria-expanded="false" aria-controls="mega">${g.title}<span>⌄</span></button>`).join('');
function closeMenu(){opened=null;pinned=null;mega.innerHTML='';nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-expanded','false'))}
function openMenu(id){clearTimeout(closeTimer);opened=id;const g=groups[id];nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.menu===id)));mega.innerHTML=`<div class="menu-intro"><span class="eyebrow">Explore ${g.title}</span><h2>${esc(g.intro)}</h2><a class="text-link" href="#/${id}">View all ${g.title.toLowerCase()} ↗</a></div>`+g.groups.map(([name,ids])=>`<div class="menu-group"><h3>${name}</h3>${ids.map(i=>`<a href="#/${i}">${titles[i]}${i==='resolve'?'<small>Current · isocratic HPLC applications</small>':prospective.has(i)?'<small>Prospective</small>':''}</a>`).join('')}</div>`).join('')}
nav.addEventListener('click',e=>{const b=e.target.closest('button');if(b){if(pinned===b.dataset.menu)closeMenu();else{openMenu(b.dataset.menu);pinned=b.dataset.menu}} });
nav.querySelectorAll('button').forEach(b=>{b.addEventListener('pointerenter',e=>{if(!pinned&&e.pointerType==='mouse'&&matchMedia('(min-width:801px)').matches)openMenu(b.dataset.menu)});b.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();openMenu(b.dataset.menu);mega.querySelector('a').focus()}})});
document.querySelector('header').addEventListener('pointerleave',()=>{if(!pinned&&matchMedia('(min-width:801px)').matches)closeTimer=setTimeout(closeMenu,180)});mega.addEventListener('pointerenter',()=>clearTimeout(closeTimer));document.addEventListener('click',e=>{if(!e.target.closest('header'))closeMenu()});document.querySelector('header').addEventListener('focusout',e=>{if(!e.currentTarget.contains(e.relatedTarget))closeMenu()});
const mobile=document.querySelector('#mobile-toggle');mobile.onclick=()=>{const state=nav.classList.toggle('open');mobile.setAttribute('aria-expanded',state);mobile.setAttribute('aria-label',state?'Close navigation':'Open navigation');mobile.textContent=state?'×':'☰';if(!state)closeMenu()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const previous=opened;closeMenu();if(previous)nav.querySelector(`[data-menu="${previous}"]`).focus()}});
function pageHead(id,title,description){return `<section class="page-hero"><div class="breadcrumb"><a href="#/">Home</a> / ${parents[id]&&parents[id]!==id?`<a href="#/${parents[id]}">${groups[parents[id]]?.title||'Support'}</a> / `:''}${esc(title)}</div><span class="eyebrow">${groups[id]?'Explore Resolved Labs':id==='resolve'?'Current flagship product':'Resolved Labs · Concept prototype'}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></section>`}
function sitemap(){const support={title:'Support & customer area',groups:[['Customer assistance',['support','documentation','maintenance','customer-login','customer-portal']]]};return pageHead('sitemap','A clear structure. Room to grow.','Five primary sections, supported by customer utilities. Every destination below is interactive.')+`<section class="page-body"><div class="intro-note">Primary navigation → section → category or detail page. Challenge, role and industry pages cross-link to the same product and service records. They do not create duplicate catalogues.</div><div class="site-tree">${Object.entries({...groups,examples:{title:'10 sustainability examples',groups:[['Independent examples',sustainabilityExamples.map(e=>e.id)]]},training:{title:'Training examples',groups:[['Proposed programmes',trainingExamples.map(e=>e.id)]]},support,contact:{title:'Contact & site utilities',groups:[['Direct access',['contact','sitemap','architecture']]]}}).map(([id,g])=>`<div class="tree-branch"><a href="#/${id==='contact'?'contact':id}">${g.title} ↗</a>${g.groups.map(([label,ids])=>`<h3>${label}</h3>${ids.map(i=>`<a class="child" href="#/${i}">${titles[i]} ${prospective.has(i)?' · Planned':''}</a>`).join('')}`).join('')}</div>`).join('')}</div></section>`}
function architecture() {
  return editorialHero("architecture", "Review the current site structure, evidence and demo features before the next development pass.", {title: "Web developer review notes", label: "Site review"}) + `
    <div class="page-body editorial-body">
      ${editorialPanels("architecture", [
        {title: "Navigation and deep links", body: "Solutions groups content by challenge, role and industry. Products contains the catalogue, and Resources contains the technical library. The catalogue and examples library keep their filters in the URL, so a review link opens the same selection."},
        {title: "Evidence and demo boundaries", body: "ReSolve is Antech’s product. Other laboratory technologies and programmes are independent examples. The Cloud and customer workspace use sample data. The customer workspace clears its sample activity when closed. Enquiries go to Antech’s email address or official contact form."},
      ])}
      ${editorialRelated(["sitemap", "documentation", "case-studies"], "Review the site and its evidence")}
      <a class="button light editorial-back" href="./original/index.html">Open the original prototype</a>
    </div>`;
}
function listingPhotoCredit(photo, label) {
  const credit = photo.author && photo.source
    ? `<a href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer">${esc(photo.author)}</a>`
    : esc(photo.author || "");
  const license = photo.license && photo.licenseUrl
    ? ` · <a href="${esc(photo.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(photo.license)}</a> · Cropped for display`
    : "";
  return `${esc(label)}${credit ? ` by ${credit}` : ""}${license}`;
}

function picturedListingCard(id, photo, {description, context = "", measure = "", productPhoto = false}) {
  const label = productPhoto ? "Product photo" : "Illustrative photo";
  return `
    <article class="photo-example pictured-listing">
      <a class="card photo-card" href="#/${esc(id)}">
        <div class="photo-card-media"><img src="${esc(photo.src)}" alt="${esc(photo.alt)}" style="object-position:${esc(photo.position || "center")}" loading="lazy" decoding="async"></div>
        <div class="photo-card-copy">
          ${context ? `<span class="badge example">Independent example</span>` : badge(id)}
          <h3>${esc(titles[id])}</h3>
          ${context ? `<p class="photo-card-provider">${esc(context)}</p>` : ""}
          <p>${esc(description)}</p>
          ${measure ? `<p class="photo-card-measure"><strong>What to measure</strong>${esc(measure)}</p>` : ""}
        </div>
      </a>
      <p class="photo-credit">${listingPhotoCredit(photo, label)}</p>
    </article>`;
}

function solutionOverviewCard(id) {
  const photo = solutionCardImages[id];
  if (!photo) return card(id, solutionContent[id]?.intro);

  return picturedListingCard(id, photo, {
    description: solutionContent[id]?.intro || descriptions[id] || productContent[id]?.intro,
  });
}

function catalogueResultCard(id) {
  const photo = catalogueCardImages[id] || applicationDetailImages[id]?.[0];
  if (portfolioPhotos[id] || !photo) return card(id);

  const example = sustainabilityExamples.find(entry => entry.id === id);
  return picturedListingCard(id, photo, {
    description: productContent[id]?.intro || example?.summary || descriptions[id],
    context: example ? `${example.provider} · ${example.name}` : "",
    measure: example?.measure,
    productPhoto: id === "resolve",
  });
}
const catalogueCategories = {
  solvent: "Solvent recovery",
  consumables: "Sustainable consumables",
  efficiency: "Resource efficiency",
};
const manufacturerKey = name => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const catalogueItems = [
  {id: "resolve", category: "solvent", provider: "Antech", availability: "current"},
  ...sustainabilityExamples.filter(example => example.kind !== "Programme").map(example => ({
    id: example.id,
    category: example.category === "plastics" ? "consumables" : "efficiency",
    provider: example.provider,
    availability: "example",
  })),
];
const catalogueManufacturers = [...new Set(catalogueItems.map(item => item.provider))].sort();
const catalogueFilters = {category: "category", manufacturer: "manufacturer", availability: "availability"};
const examplesFilters = {category: "example-category", kind: "example-kind"};
const renderOptions = entries => entries.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join("");

function catalogue() {
  return editorialHero("catalog", productContent.catalog.intro, {title: "Laboratory product catalogue", label: "Products"}) + `
    <div class="page-body editorial-body">
      <p class="intro-note">Browse ReSolve by Antech and compare independently researched products. For programmes and laboratory practices, see the <a class="text-link" href="#/examples">sustainability examples</a>.</p>
      <div class="filters">
        <label>Category<select id="category"><option value="all">All categories</option>${renderOptions(Object.entries(catalogueCategories))}</select></label>
        <label>Manufacturer<select id="manufacturer"><option value="all">All manufacturers</option>${renderOptions(catalogueManufacturers.map(name => [manufacturerKey(name), name]))}</select></label>
        <label>Listing type<select id="availability"><option value="all">All types</option><option value="current">Antech product</option><option value="example">Independent examples</option></select></label>
        <button class="button light reset-filters" id="catalog-reset" type="button">Clear filters</button>
      </div>
      <p id="count" aria-live="polite"></p>
      <div class="cards" id="catalog-results"></div>
      ${editorialOverviewSections("catalog")}
    </div>`;
}

function bindListingFilters(id, fields, params, update) {
  const controls = Object.entries(fields).map(([key, controlId]) => [key, document.getElementById(controlId)]);
  const reset = document.getElementById(id + "-reset");
  const refresh = () => {
    const active = new URLSearchParams();
    for (const [key, control] of controls) {
      if (control.value !== "all") active.set(key, control.value);
    }
    reset.disabled = active.size === 0;
    update();
    const hash = "#/" + id + (active.size ? "?" + active : "");
    if (location.hash !== hash) history.replaceState(history.state, "", hash);
  };
  for (const [key, control] of controls) {
    const value = params.get(key);
    if (Array.from(control.options).some(option => option.value === value)) control.value = value;
    control.addEventListener("change", refresh);
  }
  reset.addEventListener("click", () => {
    for (const [, control] of controls) control.value = "all";
    controls[0][1].focus();
    refresh();
  });
  refresh();
}

function filterCatalogue() {
  const category = document.getElementById("category").value;
  const manufacturer = document.getElementById("manufacturer").value;
  const availability = document.getElementById("availability").value;
  const matches = catalogueItems.filter(item =>
    (category === "all" || item.category === category) &&
    (manufacturer === "all" || manufacturerKey(item.provider) === manufacturer) &&
    (availability === "all" || item.availability === availability));
  document.getElementById("count").textContent = `${matches.length} of ${catalogueItems.length} entries`;
  document.getElementById("catalog-results").innerHTML = matches.length
    ? matches.map(item => catalogueResultCard(item.id)).join("")
    : '<p class="empty">No entries match these filters. Clear a filter to see more products.</p>';
}

function routeContent(id) {
  if (!id) return home();
  if (id === "sitemap") return sitemap();
  if (id === "architecture") return architecture();
  if (id === "catalog") return catalogue();
  if (id === "contact") return enquiryPage();
  if (id === "resolve") return resolveProduct();
  if (id === "products") return productsPage();
  if (id === "solutions") return solutionsOverview();
  if (Object.hasOwn(solutionContent, id)) return solutionApplicationPage(id);
  if (Object.hasOwn(productSectionLinks, id)) return productCategoryPage(id);
  const content = sectionPage(id) ?? extendedPage(id);
  if (content !== null) return content;
  return pageHead("", "Page not found", "Use the navigation to find what you need.") +
    '<section class="page-body"><a class="button" href="#/">Return home</a></section>';
}

function render() {
  const fragment = location.hash.replace(/^#\/?/, "");
  const boundary = fragment.indexOf("?");
  const route = boundary === -1 ? fragment : fragment.slice(0, boundary);
  const params = new URLSearchParams(boundary === -1 ? "" : fragment.slice(boundary + 1));
  let id;
  try {
    id = decodeURIComponent(route);
  } catch {
    id = route;
  }
  closeMenu();
  nav.classList.remove("open");
  mobile.setAttribute("aria-expanded", "false");
  mobile.setAttribute("aria-label", "Open navigation");
  mobile.textContent = "☰";
  main.innerHTML = routeContent(id);
  const heading = id ? main.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim() : "Sustainable Laboratory Solutions";
  document.title = `${heading || "Resolved Labs"} | Resolved Labs`;
  const section = Object.hasOwn(groups, id) ? id : Object.hasOwn(parents, id) ? parents[id] : "";
  for (const button of nav.querySelectorAll("button")) {
    if (button.dataset.menu === section) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  }
  if (id === "catalog") bindListingFilters(id, catalogueFilters, params, filterCatalogue);
  if (id === "examples") bindListingFilters(id, examplesFilters, params, filterExamples);
  bindExperience(id);
  window.scrollTo(0, 0);
}
document.querySelector('#footer-links').innerHTML=['solutions','products','services','resources','about','training','customer-login','support','contact','architecture'].map(i=>link(i,titles[i]||groups[i]?.title)).join('')+'<a href="./cloud.html">ReSolve Cloud demo</a><a href="./virtual-demo/index.html">ReSolve virtual demo</a>';
const dialog = document.querySelector("dialog");
const query = document.querySelector("#query");
dialog.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  dialog.close();
});
const normalizeSearch = value => value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const searchRecords = [
  {id: "virtual-demo", href: reSolveAssets.demo, title: "ReSolve virtual demo", description: "Product walkthrough, recovery simulator and ROI calculator.", detail: "HPLC solvent savings chromatography"},
  {id: "cloud", href: "./cloud.html", title: "ReSolve Cloud demo", description: "Compare solvent recovery, data coverage and instrument performance across sample sites.", detail: "analytics reporting CSV export"},
  ...Object.entries(groups).map(([id, group]) => ({id, title: group.title, description: sectionContent[id]?.intro || group.intro, detail: ""})),
  ...Object.entries(titles).filter(([id]) => !["architecture", "customer-portal"].includes(id)).map(([id, title]) => {
    const editorial = solutionContent[id] || productContent[id] || sectionContent[id];
    const example = sustainabilityExamples.find(entry => entry.id === id);
    const description = editorial?.intro || descriptions[id] || "";
    const detail = [example?.provider, example?.name, ...((editorial?.sections || []).map(section => section.title + " " + section.body))].filter(Boolean).join(" ");
    return {id, title, description, detail};
  }),
].map(record => ({
  ...record,
  titleTokens: normalizeSearch(record.title),
  descriptionTokens: normalizeSearch(record.description),
  detailTokens: normalizeSearch(record.detail),
}));

function search() {
  const terms = normalizeSearch(query.value).split(" ").filter(Boolean);
  const suggestions = ["solutions", "resolve", "virtual-demo", "cloud", "catalog", "training", "support"];
  const matches = terms.length
    ? searchRecords.map(record => {
      const scores = terms.map(term => record.titleTokens.includes(term) ? 5
        : record.descriptionTokens.includes(term) ? 3
        : record.detailTokens.includes(term) ? 1 : 0);
      return {record, score: scores.every(Boolean) ? scores.reduce((sum, value) => sum + value, 0) : 0};
    }).filter(match => match.score > 0).sort((a, b) => b.score - a.score).map(match => match.record)
    : suggestions.map(id => searchRecords.find(record => record.id === id)).filter(Boolean);
  const links = matches.map(record =>
    `<a href="${esc(record.href || "#/" + record.id)}">${esc(record.title)}${record.description ? `<small>${esc(record.description)}</small>` : ""}</a>`
  ).join("");
  document.querySelector("#search-results").innerHTML =
    `<p aria-live="polite">${terms.length ? `${matches.length} ${matches.length === 1 ? "result" : "results"}` : "Suggested destinations"}</p>` +
    (links || '<p>Try a product name, manufacturer or laboratory topic.</p>');
}
document.querySelector('#search-open').onclick=()=>{closeMenu();dialog.showModal();query.value='';search();query.focus()};document.querySelector('#search-close').onclick=()=>dialog.close();query.oninput=search;dialog.addEventListener('click',e=>{if(e.target.closest('a'))dialog.close();if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});window.addEventListener('hashchange',()=>{render();main.focus({preventScroll:true})});render();

document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();main.focus();main.scrollIntoView()});


