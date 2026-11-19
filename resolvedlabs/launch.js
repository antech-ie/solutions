const reSolveAssets = {
  analyst: "./assets/resolve-analyst.jpg",
  laboratory: "./assets/resolve-laboratory.webp",
  installed: "./assets/resolve-installed.jpg",
  screen: "./assets/resolve-screen.jpg",
  flow: "./assets/resolve-flow.png",
  wordmark: "./assets/eic/resolve-brand.svg",
  brochure: "./assets/resolve-brochure.pdf",
  demo: "./virtual-demo/index.html",
  evaluation: "https://antech.ie/wp-content/uploads/2026/07/ReSolve_PMBrc-Study-HPLC_Validation_Report-Rev-4.0-Final-BM-22072026.pdf",
  enquiry: "mailto:info@antech.ie?subject=Laboratory%20solutions%20enquiry",
};

const featuredExamples = ["example-findenser", "example-freezer", "example-refills"];
const portfolioPhotos = {
  "example-findenser": {
    file: "reflux.jpg",
    alt: "Row of glass condensers at a chemistry workbench",
    width: 1400,
    height: 788,
    position: "66% 57%",
    topic: "Water",
    measure: "Track cooling water per experiment.",
    author: "Kleison Leopoldino",
    source: "https://www.pexels.com/photo/modern-laboratory-with-glass-condensers-32769363/",
  },
  "example-freezer": {
    file: "cold-storage.jpg",
    alt: "Racks of capped sample tubes in a frosted laboratory freezer",
    width: 1280,
    height: 848,
    position: "50% 61%",
    topic: "Energy",
    measure: "Compare daily energy use at the same setpoint and storage capacity.",
    author: "Scott Covington / USFWS",
    source: "https://commons.wikimedia.org/wiki/File:Whitney_Genetics_Lab_eDNA_Frozen_Samples_(22726332679).jpg",
  },
  "example-refills": {
    file: "pipette-tips.jpg",
    alt: "Pipette tips arranged in an orange laboratory rack",
    width: 1280,
    height: 854,
    position: "48% 67%",
    topic: "Consumables",
    measure: "Compare rack and packaging waste per 1,000 tips.",
    author: "Gannu03",
    source: "https://commons.wikimedia.org/wiki/File:Disposable_Pipette_Tips_in_Laboratory_Tip_Boxes_02.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
};

function portfolioCredit(photo) {
  return `Illustrative photo by <a href="${photo.source}" target="_blank" rel="noopener noreferrer">${esc(photo.author)}</a>${photo.licenseUrl ? ` · <a href="${photo.licenseUrl}" target="_blank" rel="noopener noreferrer">${esc(photo.license)}</a> · Cropped for display` : ""}`;
}

function portfolioImage(photo) {
  return `<img src="./assets/portfolio/${photo.file}" width="${photo.width}" height="${photo.height}" alt="${esc(photo.alt)}" style="object-position: ${photo.position}" loading="lazy" decoding="async">`;
}

function photoExampleCard(example, photo) {
  return `
    <article class="photo-example">
      <a class="card example-card photo-card" href="#/${example.id}">
        <div class="photo-card-media">${portfolioImage(photo)}</div>
        <div class="photo-card-copy">
          <span class="eyebrow">${esc(photo.topic)}</span>
          <h3>${esc(example.title)}</h3>
          <p class="photo-card-provider">${esc(example.provider)} · ${esc(example.name)} · Independent example</p>
          <p>${esc(example.summary)}</p>
          <p class="photo-card-measure"><strong>What to measure</strong>${esc(photo.measure)}</p>
        </div>
      </a>
      <p class="photo-credit">${portfolioCredit(photo)}</p>
    </article>`;
}

function featuredExamplesSection(title, description) {
  return `
    <section class="section portfolio-section" aria-labelledby="examples-heading">
      <div class="section-head">
        <div><span class="eyebrow">Independent examples</span><h2 id="examples-heading">${esc(title)}</h2></div>
        <p>${esc(description)}</p>
      </div>
      <div class="cards portfolio-grid">${featuredExamples.map(id => card(id)).join("")}</div>
      <div class="portfolio-foot">
        <a class="button light" href="#/examples">Browse all 10 examples</a>
      </div>
    </section>`;
}

function benchGallery() {
  return `
    <section class="section bench-section" aria-labelledby="bench-heading">
      <div class="section-head">
        <div><span class="eyebrow">From the lab</span><h2 id="bench-heading">See ReSolve on the bench.</h2></div>
        <p>See the controller, its display and how it fits beside existing HPLC equipment.</p>
      </div>
      <div class="bench-gallery">
        <figure class="bench-installation">
          <img src="${reSolveAssets.installed}" alt="ReSolve controller installed on a Waters HPLC stack" loading="lazy">
          <figcaption>Installed alongside an HPLC system</figcaption>
        </figure>
        <figure>
          <img src="${reSolveAssets.analyst}" alt="Gloved hands using the ReSolve controller" loading="lazy">
          <figcaption>Operating the controller</figcaption>
        </figure>
        <figure>
          <img src="${reSolveAssets.screen}" alt="Close-up photograph of the ReSolve touchscreen showing a chromatogram" loading="lazy">
          <figcaption>The instrument display</figcaption>
        </figure>
      </div>
    </section>`;
}

function home() {
  return `
    <section class="hero launch-hero">
      <div>
        <img class="hero-wordmark" src="${reSolveAssets.wordmark}" width="320" height="99" alt="ReSolve by Antech">
        <h1>Smarter laboratories.<br><em>Lower costs. Less waste. Less&nbsp;CO₂.</em></h1>
        <p>See where your lab can reduce reliance on fresh solvent, free up analyst time and measure the impact. Start with ReSolve mobile-phase recovery for compatible HPLC methods.</p>
        <div class="buttons">
          <a class="button primary" href="#/solutions">Explore solutions</a>
          <a class="button outline" href="#/resolve">Discover ReSolve</a>
        </div>
      </div>
      <figure class="hero-picture">
        <img class="hero-illustration" src="./assets/eic/laboratory-cover.webp" width="1136" height="1286" alt="Laboratory analyst operating a touchscreen beside an HPLC system" fetchpriority="high">
      </figure>
    </section>
    <nav class="outcomes home-priorities" aria-label="Laboratory priorities">
      <div><a href="#/operating-costs"><span>Cost</span><strong>Reduce recurring operating costs</strong></a></div>
      <div><a href="#/circularity"><span>Circularity</span><strong>Recover and reuse resources</strong></a></div>
      <div><a href="#/solvent-supply"><span>Supply chain</span><strong>Reduce exposure to solvent supply and price shocks</strong></a></div>
      <div><a href="#/reporting"><span>Emissions</span><strong>Measure waste and carbon impact</strong></a></div>
    </nav>
    <section class="section home-feature" aria-labelledby="featured-tech-heading">
      <img class="home-feature-photo" src="${reSolveAssets.laboratory}" width="1500" height="1125" alt="ReSolve fitted to an HPLC system on a laboratory bench" loading="lazy">
      <div>
        <span class="eyebrow">Featured technology</span>
        <h2 id="featured-tech-heading">ReSolve solvent recovery</h2>
        <p>Explore mobile-phase recovery for suitable isocratic HPLC methods.</p>
      </div>
      <div class="product-links">
        <a class="button" href="#/resolve">See how ReSolve works</a>
      </div>
    </section>
    ${featuredExamplesSection("Where could your lab save resources?", "See how three different approaches work and what you can measure before making a change.")}
    <section class="section photo-cta">
      <figure>
        <!-- Photograph by Jahra Tasfia Reza, Pexels photo 39901214. -->
        <img src="./assets/portfolio/lab-operations.jpg" width="1200" height="800" alt="Gloved hand recording measurements on a laboratory worksheet" loading="lazy" decoding="async">
      </figure>
      <div>
        <h2>Start with what your lab can measure.</h2>
        <p>Bring one workflow you want to improve, along with any purchasing, waste or utility data you already have.</p>
        <a class="button" href="#/contact">Discuss your lab priorities</a>
      </div>
    </section>`;
}

function productsPage() {
  return `
    <section class="page-hero products-hero">
      <div class="breadcrumb"><a href="#/">Home</a> / Products</div>
      <div class="products-header">
        <div>
          <span class="eyebrow">Products and equipment</span>
          <h1>Laboratory products and equipment</h1>
          <p>Explore ReSolve, Antech’s solvent recovery system, and compare independent equipment and consumables by application.</p>
          <a class="button primary" href="#/resolve">View ReSolve</a>
          <a class="button outline" href="#/catalog">Browse the catalogue</a>
        </div>
        <figure class="products-hero-photo">
          <!-- Photograph by Ludovic Delot, Pexels photo 18471479. -->
          <img src="./assets/portfolio/lab-bench.jpg" width="1600" height="1200" alt="Laboratory workbenches with instruments and a sink" fetchpriority="high">
        </figure>
      </div>
    </section>
    <nav class="outcomes home-priorities" aria-label="Product categories">
      <div><a href="#/catalog?category=solvent"><span>Solvent recovery</span><strong>Isocratic HPLC</strong></a></div>
      <div><a href="#/catalog?category=consumables"><span>Lab consumables</span><strong>Tips and refill systems</strong></a></div>
      <div><a href="#/catalog?category=efficiency"><span>Resource efficiency</span><strong>Lab equipment</strong></a></div>
      <div><a href="#/manufacturers"><span>Manufacturers</span><strong>Compare independent examples</strong></a></div>
    </nav>
    <section class="section products-feature" aria-label="Antech product">
      ${catalogueFeature()}
    </section>
    ${featuredExamplesSection("Compare technologies by application", "Use the examples to compare options. Confirm compatibility and availability with each manufacturer.")}
    <div class="section">
      ${editorialOverviewSections("products")}
    </div>
    <section class="section photo-cta">
      ${editorialFigure(editorialPictures("procurement")[0])}
      <div>
        <h2>Need help evaluating a specific workflow?</h2>
        <p>Bring the equipment, application and quality requirements you want to compare.</p>
        <a class="button" href="#/contact">Discuss your application</a>
      </div>
    </section>`;
}

function resolveProduct() {
  const content = productContent.resolve;
  const actions = `<div class="product-links">
    <a class="button primary" href="#/contact">Discuss your application</a>
    <a class="button light" href="${reSolveAssets.brochure}">Product brochure (PDF)</a>
  </div>`;
  return editorialHero("resolve", content.intro, {label: "Antech product", actions}) + `
    <div class="page-body editorial-body">
      <section class="recovery-explainer" aria-labelledby="recovery-heading">
        <figure>
          <img src="./assets/eic/mobile-phase-recovery.png" width="4185" height="3078" alt="HPLC flow diagram and chromatogram showing the route back to the reservoir and the route to waste during peaks" loading="lazy" decoding="async">
          <figcaption><a href="./assets/eic/mobile-phase-recovery.png">Open the full-size flow diagram</a></figcaption>
        </figure>
        <div class="recovery-explainer-copy">
          <h2 id="recovery-heading">How ReSolve recovers mobile phase</h2>
          <p>ReSolve reads the detector signal during a compatible isocratic HPLC run. It sends the stream to waste during designated peak windows and returns eligible mobile phase to the reservoir between those windows.</p>
          <p>Assess method suitability and agree the required quality checks before using recovered mobile phase.</p>
          <a class="text-link" href="${reSolveAssets.demo}">Open the virtual demo</a>
        </div>
      </section>
      ${editorialPanels("resolve", content.sections)}
      ${editorialSources(content.sources)}
    </div>
    ${benchGallery()}`;
}

function catalogueFeature() {
  return `
    <article class="catalogue-feature">
      <div>
        <span class="eyebrow">Antech product</span>
        <img class="resolve-wordmark" src="${reSolveAssets.wordmark}" width="320" height="99" alt="ReSolve by Antech">
        <h2>ReSolve solvent recovery</h2>
        <p>ReSolve reads the HPLC detector signal and routes mobile phase to the reservoir or to waste. Review instrument and method fit for your isocratic workflow.</p>
        <div class="product-links">
          <a class="button" href="#/resolve">View product</a>
          <a class="button light" href="${reSolveAssets.demo}">Launch virtual demo</a>
        </div>
        <p class="evaluation-result"><strong>94.5% of detector effluent recovered</strong> in each of two 96-injection sequences using the isocratic method assessed by PMBrc/SETU.</p>
        <a class="text-link evaluation-link" href="${reSolveAssets.evaluation}" target="_blank" rel="noopener noreferrer">Read the PMBrc/SETU evaluation</a>
      </div>
      <img class="catalogue-photo" src="${reSolveAssets.installed}" width="1800" height="1350" alt="ReSolve mounted beside an HPLC instrument" loading="lazy">
    </article>`;
}

function enquiryPage() {
  return editorialHero("contact", "Ask Antech about ReSolve, technical support or a laboratory improvement you are considering.", {title: "Speak to a laboratory specialist", label: "Contact"}) + `
    <section class="page-body editorial-body">
      <div class="contact-panel">
        <h2>Get in touch with Antech</h2>
        <p>Include the equipment or workflow you use, the problem you want to solve and your location. For technical support, include the instrument model and a short description of the issue.</p>
        <div class="product-links">
          <a class="button" href="${reSolveAssets.enquiry}">Email info@antech.ie</a>
          <a class="button light" href="https://antech.ie/contact/">Open Antech’s contact form</a>
        </div>
        <p>For service resources and product documentation, see <a class="text-link" href="#/support">Technical support</a>.</p>
      </div>
    </section>`;
}
