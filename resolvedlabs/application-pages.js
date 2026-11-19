const applicationRecommendations = {
  "operating-costs": ["reporting", "example-freezer", "resolve"],
  "solvent-waste": ["resolve", "qc", "reporting"],
  "resource-efficiency": ["example-findenser", "example-freezer", "operations"],
  plastics: ["example-refills", "example-tipnovus", "example-biobased"],
  reporting: ["sustainability", "operations", "example-act"],
  productivity: ["operations", "example-coldstorage", "procurement"],
  qc: ["qa", "solvent-waste", "resolve"],
  qa: ["qc", "pharma", "reporting"],
  procurement: ["example-act", "example-refills", "operating-costs"],
  sustainability: ["reporting", "resource-efficiency", "example-coldstorage"],
  operations: ["example-coldstorage", "productivity", "example-autoclave"],
  "site-management": ["operations", "reporting", "example-freezer"],
  pharma: ["qc", "qa", "resolve"],
  biopharma: ["example-refills", "example-coldstorage", "qa"],
  contract: ["qc", "operating-costs", "reporting"],
  research: ["example-findenser", "example-vacuum", "resource-efficiency"],
  academic: ["example-coldstorage", "plastics", "sustainability"],
};

const productSectionLinks = {
  "solvent-recovery": {category: "solvent", entries: ["resolve"]},
  consumables: {category: "consumables", entries: ["example-refills", "example-tipnovus", "example-biobased"]},
  "resource-technologies": {category: "efficiency", entries: ["example-findenser", "example-freezer", "example-vacuum", "example-autoclave", "example-fumehood"]},
  manufacturers: {category: "all"},
};

const productPhotoPairings = {
  products: ["resource-technologies", "procurement", "qc"],
  "example-tipnovus": ["example-refills", "example-biobased", "plastics"],
  "example-biobased": ["example-refills", "example-tipnovus", "procurement"],
  "example-vacuum": ["example-findenser", "research", "resource-efficiency"],
  "example-autoclave": ["operations", "qa", "resource-efficiency"],
  "example-coldstorage": ["example-freezer", "reporting", "operations"],
  "example-fumehood": ["resource-technologies", "site-management"],
};

const resolveDetailPhotos = [
  {src:"./assets/resolve-laboratory.webp", alt:"ReSolve controller connected to an HPLC instrument on a laboratory bench", author:"Antech", illustrative:false, position:"52% 46%"},
  {src:"./assets/resolve-flow.png", alt:"Diagram of mobile phase routing through an HPLC system and ReSolve", author:"Antech", label:"Workflow illustration", contain:true},
  {src:"./assets/resolve-screen.jpg", alt:"Close-up of the ReSolve touchscreen with a chromatogram", author:"Antech", illustrative:false, position:"50% 43%"},
  {src:"./assets/resolve-analyst.jpg", alt:"Gloved hands operating the ReSolve controller", author:"Antech", illustrative:false},
];

function listingPhoto(id) {
  const portfolio = portfolioPhotos[id];
  if (portfolio) return {...portfolio, src: "./assets/portfolio/" + portfolio.file};

  return catalogueCardImages[id] || solutionCardImages[id] || applicationDetailImages[id]?.[0];
}

function editorialPictures(id) {
  const own = id === "resolve" ? resolveDetailPhotos : applicationDetailImages[id] || [];
  const related = applicationRecommendations[id] || productSectionLinks[id]?.entries || productPhotoPairings[id] || [];
  const fallback = ["operations", "reporting", "qc", "resource-efficiency", "procurement"].map(listingPhoto);
  const topicPhotos = (sectionPhotoRoutes[id] || []).map(listingPhoto);
  const candidates = [...own, ...topicPhotos, listingPhoto(id), ...related.map(listingPhoto), ...fallback].filter(Boolean);
  const unique = new Map();
  for (const photo of candidates) {
    if (!unique.has(photo.src)) unique.set(photo.src, photo);
  }
  return [...unique.values()];
}

function editorialFigure(photo, eager = false) {
  const label = photo.label || (photo.illustrative === false ? "Product photo" : "Illustrative photo");
  return `<figure class="editorial-figure${photo.contain ? " editorial-diagram" : ""}">
    <img src="${esc(photo.src)}" alt="${esc(photo.alt)}" style="object-position:${esc(photo.position || "center")}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>
    <figcaption>${listingPhotoCredit(photo, label)}</figcaption>
  </figure>`;
}

function editorialHero(id, intro, {title = titles[id] || groups[id]?.title, label = "Application guide", actions = "", parent = parents[id]} = {}) {
  const parentTitle = groups[parent]?.title || titles[parent];
  const breadcrumb = parentTitle && parent !== id
    ? `<a href="#/${esc(parent)}">${esc(parentTitle)}</a> / `
    : "";
  return `<section class="page-hero editorial-hero">
    <p class="breadcrumb"><a href="#/">Home</a> / ${breadcrumb}${esc(titles[id] || groups[id]?.title)}</p>
    <div class="editorial-hero-grid">
      <div><span class="eyebrow">${esc(label)}</span><h1>${esc(title)}</h1><p>${esc(intro)}</p>${actions}</div>
      ${editorialFigure(editorialPictures(id)[0], true)}
    </div>
  </section>`;
}

function editorialPanels(id, sections, offset = 1) {
  const photos = editorialPictures(id);
  return `<div class="editorial-panels">${sections.map((section, index) => `
    <section class="editorial-panel">
      ${editorialFigure(photos[(index + offset) % photos.length])}
      <div class="editorial-panel-copy">
        <h2>${esc(section.title)}</h2>
        ${section.body.split(/\n\s*\n/).map(paragraph => `<p>${esc(paragraph)}</p>`).join("")}
      </div>
    </section>`).join("")}</div>`;
}

function editorialSources(sources) {
  const links = [...new Map(sources.map(source => [source.url, source])).values()];
  return `<aside class="editorial-sources" aria-label="Sources">
    <p><strong>Sources and further reading</strong></p>
    <ul>${links.map(source => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a></li>`).join("")}</ul>
  </aside>`;
}

function editorialRelatedCard(id) {
  if (id === "resolve" || sustainabilityExamples.some(example => example.id === id)) {
    return catalogueResultCard(id);
  }
  return picturedListingCard(id, editorialPictures(id)[0], {
    description: solutionContent[id]?.intro || productContent[id]?.intro || descriptions[id] || "Explore the application and the options available for your lab.",
  });
}

function editorialRelated(ids, title = "Explore related applications") {
  return `<section class="related editorial-related"><h2>${esc(title)}</h2><div class="cards">${ids.map(editorialRelatedCard).join("")}</div></section>`;
}

function solutionApplicationPage(id) {
  const content = solutionContent[id];
  return editorialHero(id, content.intro, {label: "Laboratory solution"}) + `
    <div class="page-body editorial-body">
      ${editorialPanels(id, content.sections)}
      ${editorialSources(content.sources)}
      ${editorialRelated(applicationRecommendations[id])}
      <a class="button light editorial-back" href="#/contact">Discuss this application with Antech</a>
    </div>`;
}

function independentExamplePage(example) {
  const content = productContent[example.id];
  const label = example.kind === "Programme" ? "Independent programme" : "Independent example";
  const related = productPhotoPairings[example.id];
  return editorialHero(example.id, content.intro, {label, parent: "examples"}) + `
    <div class="page-body editorial-body">
      <p class="editorial-context"><strong>${esc(example.name)}</strong> · ${esc(example.provider)} · ${esc(categoryNames[example.category])}</p>
      ${editorialPanels(example.id, content.sections)}
      ${editorialSources([{title: `${example.provider} · ${example.name}`, url: example.url}, ...content.sources])}
      ${related ? editorialRelated(related) : ""}
      <a class="button light editorial-back" href="#/examples">Browse all sustainability examples</a>
    </div>`;
}

function productCategoryPage(id) {
  const content = productContent[id];
  const {category, entries} = productSectionLinks[id];
  const matches = entries || catalogueItems.filter(item => item.availability === "example").map(item => item.id);
  return editorialHero(id, content.intro, {label: "Products"}) + `
    <div class="page-body editorial-body">
      ${editorialPanels(id, content.sections)}
      ${editorialSources(content.sources)}
      ${editorialRelated(matches, id === "manufacturers" ? "Compare independent examples" : "Explore relevant products")}
      <a class="button light editorial-back" href="#/catalog?category=${esc(category)}">Browse the catalogue</a>
    </div>`;
}

function editorialOverviewSections(id) {
  const data = productContent[id];
  return editorialPanels(id, data.sections) + editorialSources(data.sources);
}

function solutionsOverview() {
  return editorialHero("solutions", "Explore practical ways to reduce resource use, measure progress and assess options for your laboratory application.", {label: "Laboratory solutions"}) + `
    <div class="page-body editorial-body">
      ${groups.solutions.groups.map(([label, ids]) => `<section class="related editorial-related"><h2>${esc(label)}</h2>
        <div class="cards">${ids.map(solutionOverviewCard).join("")}</div>
      </section>`).join("")}
    </div>`;
}

function examplesLibraryPage() {
  return editorialHero("examples", productContent.examples.intro, {title: "Sustainability examples for laboratories", label: "Examples library"}) + `
    <div class="page-body editorial-body">
      <div class="intro-note">Use these independent examples to compare approaches. Confirm fit and availability with the relevant provider.</div>
      <div class="filters">
        <label>Explore by challenge<select id="example-category"><option value="all">All challenges</option>${Object.entries(categoryNames).map(([key, value]) => `<option value="${esc(key)}">${esc(value)}</option>`).join("")}</select></label>
        <label>Example type<select id="example-kind"><option value="all">All types</option><option value="technology">Technology</option><option value="consumable">Consumable</option><option value="programme">Programme</option></select></label>
        <button class="button light reset-filters" id="examples-reset" type="button">Clear filters</button>
      </div>
      <p id="example-count" aria-live="polite"></p>
      <div class="cards" id="example-results"></div>
      ${editorialOverviewSections("examples")}
      ${editorialRelated(["reporting", "resolve", "sustainability"], "Apply the examples to your lab")}
    </div>`;
}
