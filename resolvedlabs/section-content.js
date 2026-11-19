const resourceDocuments = {
  brochure: {title: "ReSolve product brochure (PDF)", url: "./virtual-demo/library/resolve-brochure-rev2.pdf"},
  manual: {title: "ReSolve user manual, Rev 1.0 (PDF)", url: "./virtual-demo/library/resolve-user-manual-rev1.pdf"},
  evaluation: {title: "PMBrc / SETU performance evaluation (PDF)", url: "./virtual-demo/library/pmbrc-validation-july-2026.pdf"},
  evaluationSummary: {title: "PMBrc / SETU results summary (PDF)", url: "./virtual-demo/library/pmbrc-evaluation-summary.pdf"},
  whitePaper: {title: "Antech regulatory and sustainability white paper (PDF)", url: "./virtual-demo/library/resolve-regulatory-sustainability-whitepaper.pdf"},
  sampleReport: {title: "Example ReSolve injection report (PDF)", url: "./virtual-demo/library/resolve-example-injection-report.pdf"},
};

const sectionSources = {
  antech: {title: "About Antech Solutions", url: "https://antech.ie/about-us/"},
  contact: {title: "Antech office and contact details", url: "https://antech.ie/contact/"},
  support: {title: "Antech service and support plans", url: "https://antech.ie/service-support-plans/"},
  studio: {title: "ReSolve Studio virtual demo", url: "./virtual-demo/index.html"},
  cloud: {title: "ReSolve Cloud demo", url: "./cloud.html"},
};

const sectionPhotoRoutes = {
  services: ["biopharma", "reporting", "operations"],
  assessments: ["site-management", "procurement", "reporting"],
  consulting: ["operating-costs", "site-management", "research"],
  implementation: ["operations", "qa", "qc"],
  qualification: ["resolve", "qc", "qa"],
  measurement: ["reporting", "operating-costs", "sustainability"],
  training: ["research", "examples", "biopharma"],
  "best-practices": ["operations", "sustainability", "plastics"],
  workshops: ["biopharma", "solvent-waste", "procurement"],
  "package-diagnostic": ["reporting"],
  "package-roadmap": ["operating-costs"],
  "package-pilot": ["operations"],
  "package-partner": ["site-management"],
  "course-foundations": ["examples"],
  "course-solvents": ["solvent-waste"],
  "course-procurement": ["procurement"],
  "course-coldstorage": ["sustainability"],
  "course-champions": ["biopharma"],
  resources: ["qc", "reporting", "academic"],
  insights: ["research", "productivity", "reporting"],
  guides: ["academic", "example-findenser", "sustainability"],
  "white-papers": ["reporting", "resolve", "operating-costs"],
  "case-studies": ["resolve", "solvent-waste", "qc"],
  webinars: ["resolve", "productivity", "qc"],
  support: ["operations", "resolve", "qa"],
  documentation: ["qc", "resolve", "reporting"],
  maintenance: ["site-management", "operations", "resolve"],
  "customer-login": ["reporting"],
  about: ["site-management", "research", "reporting"],
  "who-we-are": ["site-management", "resolve", "research"],
  mission: ["research", "resource-efficiency", "reporting"],
  approach: ["qa", "qc", "reporting"],
  partners: ["biopharma", "resolve", "procurement"],
  contact: ["biopharma"],
};

const sectionContent = {
  services: {
    intro: "Explore how a laboratory project could move from a resource-use baseline to a site-approved pilot, with options for training and follow-up.",
    sections: [
      {title: "Start with one laboratory and a clear question", body: "Select a workflow to assess, name its owner and pull together the records you already have. Typical starting points include solvent orders and waste collections, equipment use and utility bills."},
      {title: "Agree the scope before planning delivery", body: "The assessment packages, implementation plans and courses below show potential ways to work together. For established Antech instrument support, check the scope for your equipment and site directly with Antech."},
    ],
    sources: [sectionSources.support],
    groups: [
      {title: "Assess and plan", ids: ["assessments", "consulting"]},
      {title: "Implement and measure", ids: ["implementation", "qualification", "measurement"]},
      {title: "Train your team", ids: ["training", "best-practices", "workshops"]},
    ],
    actions: [{title: "Discuss a laboratory project", url: "#/contact"}],
  },
  assessments: {
    label: "Proposed service",
    intro: "Build a baseline for one laboratory and identify which opportunities are worth a closer look.",
    sections: [
      {title: "Bring recent operating records", body: "Gather purchase records, waste transfer summaries, utility readings and a list of the equipment in scope. A short walk-through with the lab lead can identify shared meters, unusual periods and gaps in the records."},
      {title: "Agree what to investigate first", body: "Rank opportunities against the evidence available, potential benefit and effort to test. For each priority, name an owner and decide what would make the next test worthwhile. The diagnostic example shows a possible scope and deliverables."},
    ],
    sources: [solutionSources.labEfficiency, solutionSources.benchmark],
    related: ["package-diagnostic", "consulting", "reporting"],
    actions: [{title: "View the diagnostic example", url: "#/package-diagnostic"}],
  },
  consulting: {
    label: "Proposed service",
    intro: "Use a phased roadmap to choose which laboratory improvements to fund, test and review.",
    sections: [
      {title: "Set the investment criteria", body: "Start with the operating problem, expected benefit and any constraints on quality, safety or capacity. Record the current costs and assumptions, so managers can see where a more reliable estimate would affect the decision."},
      {title: "Build in decisions at each stage", body: "The illustrative packages cover baseline assessment, business case, pilot and progress review. Each identifies the information a team would need and the outputs it could review before approving the next stage."},
    ],
    sources: [solutionSources.labEfficiency, solutionSources.benchmark],
    groups: [{title: "Illustrative consulting packages", ids: ["package-diagnostic", "package-roadmap", "package-pilot", "package-partner"]}],
    actions: [{title: "Discuss scope with Antech", url: "#/contact"}],
  },
  implementation: {
    label: "Proposed service",
    intro: "Plan a small, site-approved pilot with clear responsibilities and a review date before expanding to other workflows.",
    sections: [
      {title: "Write the pilot brief", body: "Define the equipment, method or process in scope. Set the baseline, acceptable range and stop criteria, and identify who can approve changes. Share the plan with the people who operate the workflow and the relevant site owners."},
      {title: "Review operating results before expanding", body: "Capture the checks agreed for the pilot, any interruptions and feedback from the team using it. Compare the results with the baseline and record the improvement, any trade-offs and the approvals needed for a wider rollout."},
    ],
    sources: [solutionSources.labEfficiency, solutionSources.changeManagement],
    related: ["package-pilot", "qualification", "measurement"],
    actions: [{title: "Read the pilot example", url: "#/package-pilot"}],
  },
  qualification: {
    intro: "Identify the installation, qualification and analytical evidence your site needs when evaluating a change to an existing HPLC workflow.",
    sections: [
      {title: "Confirm instrument and method fit first", body: "Prepare the HPLC make and model, detector type, method family and current operating range. The ReSolve brochure covers suitable isocratic applications. Antech can confirm the documentation available for your equipment and the support scope for your site."},
      {title: "Let the site define the acceptance criteria", body: "Agree the relevant installation and operating checks with the instrument owner and quality team. For a regulated analytical procedure, document the change assessment and decide what testing the site needs for its intended use. The PMBrc study supports evaluation of the conditions it tested."},
    ],
    sources: [resourceDocuments.brochure, resourceDocuments.evaluation, solutionSources.procedureValidation, solutionSources.changeManagement],
    related: ["qa", "documentation", "implementation"],
    actions: [{title: "Ask about instrument qualification", url: "#/contact"}],
  },
  measurement: {
    label: "Proposed service",
    intro: "Agree the metrics, sources and review dates that will show how a laboratory change is performing.",
    sections: [
      {title: "Write a definition someone else can reproduce", body: "Name the owner and source of each measure, define the reporting period and keep the units consistent. For solvent recovery, record fresh solvent purchased, detector effluent returned and solvent waste collected as distinct measures."},
      {title: "Use comparable periods and show gaps", body: "Capture instrument or batch coverage and include a workload measure where relevant. Keep cost and emissions assumptions alongside the results. The Cloud demo illustrates how a site view could roll up to a corporate view using sample data."},
    ],
    sources: [solutionSources.benchmark, solutionSources.purchasedEnergy, resourceDocuments.sampleReport],
    related: ["reporting", "package-partner", "insights"],
    actions: [sectionSources.cloud],
  },
  training: {
    label: "Proposed training",
    intro: "Preview five possible courses on laboratory efficiency, from everyday practices to solvent use, procurement and cold storage.",
    sections: [
      {title: "Choose a topic for the people doing the work", body: "A foundations session could help a mixed laboratory team identify waste and resource use. The specialist examples focus on decisions that QC, operations, procurement and site sustainability teams make in their own workflows."},
      {title: "Plan something participants can use afterwards", body: "Possible outputs include a solvent-flow map, purchasing scorecard, freezer review checklist and pilot charter. The course pages describe proposed formats and activities. Ask Antech about scope and availability."},
    ],
    sources: [solutionSources.labEfficiency, solutionSources.coldStorage],
    groups: [{title: "Proposed course outlines", ids: ["course-foundations", "course-solvents", "course-procurement", "course-coldstorage", "course-champions"]}],
    actions: [{title: "Enquire about a training need", url: "#/contact"}],
  },
  "best-practices": {
    label: "Working practices",
    intro: "Find everyday changes a laboratory team can review with the people responsible for the workflow.",
    sections: [
      {title: "Organise equipment, samples and stock", body: "Assign ownership for shared equipment and agree where materials are kept. Use an inventory review to identify expired stock or duplicate purchasing. Check sample retention requirements with the owner before changing storage arrangements."},
      {title: "Test a change and record the result", body: "Start with one useful improvement, give it an owner and compare what happens over similar periods. Involve the responsible quality and safety teams where the change affects an approved procedure or equipment setting."},
    ],
    sources: [solutionSources.labEfficiency, solutionSources.coldStorage],
    related: ["operations", "guides", "training"],
    actions: [{title: "Browse sustainability guides", url: "#/guides"}],
  },
  workshops: {
    label: "Proposed workshops",
    intro: "Preview practical sessions built around a single decision your team needs to make.",
    sections: [
      {title: "Bring records the group can work with", body: "A solvent workshop could use purchase and waste records to sketch a flow map. A procurement session could compare equivalent supplier evidence. A cold-storage session could start with an equipment list and sample retention priorities."},
      {title: "Leave a short action list with owners", body: "A proposed session would end with one agreed next step, the person responsible and a date to review it. Explore the outlines below and contact Antech if you want to discuss a format for your team."},
    ],
    sources: [solutionSources.labEfficiency, solutionSources.purchasing, solutionSources.coldStorage],
    groups: [{title: "Practical workshop outlines", ids: ["course-solvents", "course-procurement", "course-coldstorage"]}],
    actions: [{title: "Discuss a workshop topic", url: "#/contact"}],
  },
  resources: {
    intro: "Find the ReSolve technical manual, independent evaluation and sustainability guides for planning changes in the laboratory.",
    sections: [
      {title: "Read the original technical evidence", body: "The ReSolve brochure covers the equipment and workflow. The user manual explains operation and injection reporting. The PMBrc / SETU evaluation describes the independent study and the specific isocratic method it tested."},
      {title: "Use the guides for your own planning", body: "Compare laboratory resources, explore examples of equipment and working practices, or watch the ReSolve Studio walkthrough for an illustrated view of the solvent-routing sequence."},
    ],
    sources: [resourceDocuments.manual, resourceDocuments.evaluation, solutionSources.labEfficiency],
    groups: [
      {title: "Product evidence", ids: ["documentation", "case-studies", "white-papers"]},
      {title: "Learn and compare", ids: ["insights", "guides", "webinars"]},
      {title: "Get help", ids: ["support", "maintenance", "customer-login"]},
    ],
    actions: [{title: "Find product documentation", url: "#/documentation"}],
  },
  insights: {
    intro: "Understand what common laboratory metrics can tell you about costs, solvent use and the quality of your evidence.",
    sections: [
      {title: "Separate recovery from reduced purchasing", body: "Detector effluent returned to a reservoir measures recovery in a specific setup. Purchasing also depends on preparations, changes and wash volumes. Compare purchasing against similar workloads to estimate whether a change reduced demand for fresh solvent."},
      {title: "Look for changes in workload and coverage", body: "Pair resource totals with an activity measure, such as accepted injections or freezer-days. Record which instruments and time periods the measurement covers, and make changes in coverage visible before interpreting trends."},
    ],
    sources: [resourceDocuments.whitePaper, solutionSources.benchmark],
    related: ["operating-costs", "reporting", "solvent-waste"],
    actions: [{title: "Explore reporting measures", url: "#/reporting"}],
  },
  guides: {
    intro: "Start with practical references for laboratory efficiency, water, cold storage and buying decisions.",
    sections: [
      {title: "Walk the laboratory and identify hotspots", body: "Use a laboratory efficiency framework to review equipment use, consumables and waste practices. For water, list processes such as cooling, washing and equipment supply, then check the EPA and I2SL guide for measures suited to those uses."},
      {title: "Compare options with evidence that matches your use", body: "For cold storage, check capacity, temperature and the test conditions behind energy figures. For purchasing, compare comparable applications and request the evidence behind the environmental data."},
    ],
    sources: [solutionSources.labEfficiency, solutionSources.water, solutionSources.freezerComparison, solutionSources.purchasing],
    related: ["examples", "resource-efficiency", "procurement"],
    actions: [{title: "Browse real-world examples", url: "#/examples"}],
  },
  "white-papers": {
    title: "Regulatory and sustainability white paper",
    intro: "Read Antech’s discussion of mobile-phase recovery, qualification considerations and the assumptions behind a savings estimate.",
    sections: [
      {title: "Read the proposed evaluation framework", body: "The paper outlines considerations for assessing a change to a suitable isocratic HPLC workflow. Review it alongside the independent PMBrc / SETU study and agree the evidence needed for your intended use with your quality team."},
      {title: "Follow the boundaries of the estimate", body: "The worked example distinguishes throughput returned during use from fresh solvent purchasing and net operating benefit. Use your own instrument workload, preparation volumes and disposal costs when modelling a site scenario."},
    ],
    sources: [resourceDocuments.whitePaper, resourceDocuments.evaluation, solutionSources.procedureValidation],
    related: ["case-studies", "solvent-waste", "qualification"],
    actions: [resourceDocuments.whitePaper],
  },
  "case-studies": {
    title: "Independent performance evidence",
    intro: "Review the PMBrc / SETU study of ReSolve under the specific isocratic conditions assessed.",
    sections: [
      {title: "See what the study tested", body: "The researchers ran two 96-injection sequences with paracetamol and ibuprofen. Mobile phase recovered in the first sequence was reused in the second. The recorded recovery was 94.5% of detector effluent in each sequence."},
      {title: "Check how closely the conditions match your workflow", body: "The full study shows the method and chromatographic results. Compare those conditions with your application before estimating results. For a purchasing or waste estimate, include preparation, flushing and wash solvent in your own baseline."},
    ],
    sources: [resourceDocuments.evaluation, resourceDocuments.evaluationSummary],
    related: ["resolve", "documentation", "qualification"],
    actions: [resourceDocuments.evaluation, resourceDocuments.evaluationSummary],
  },
  webinars: {
    title: "Recorded product walkthrough",
    intro: "Follow the narrated ReSolve Studio walkthrough and explore the solvent-routing sequence at your own pace.",
    sections: [
      {title: "Watch what happens during an injection", body: "The walkthrough follows mobile phase from the HPLC detector to either the recovery reservoir or the waste container. The visuals show how detection and diversion are represented during the demonstration."},
      {title: "Use the simulator to discuss your assumptions", body: "Try the recovery and return-on-investment tools with illustrative inputs. Write down the instrument, method and workload you would need to confirm before using an estimate in a decision."},
    ],
    sources: [sectionSources.studio, resourceDocuments.sampleReport],
    related: ["resolve", "case-studies", "documentation"],
    actions: [{title: "Open the narrated virtual demo", url: sectionSources.studio.url}],
  },
  support: {
    intro: "Prepare the details Antech needs to review a ReSolve product or service enquiry.",
    sections: [
      {title: "Identify the instrument and the issue", body: "Include the instrument and ReSolve model, device serial number if available, and a short description of what happened and when. If the issue relates to a run, note the method and relevant device or injection report details through your approved support process."},
      {title: "Use the manual and the Antech contact route", body: "Consult the user manual for the relevant screen or report export. For a service request, contact the team with your site, instrument and relevant service agreement details."},
    ],
    sources: [resourceDocuments.manual, sectionSources.contact, sectionSources.support],
    related: ["documentation", "maintenance", "qualification"],
    actions: [{title: "Contact Antech support", url: "#/contact"}],
  },
  documentation: {
    intro: "Open the ReSolve brochure, user manual and example injection report for specifications, operation and reporting.",
    sections: [
      {title: "Check what the equipment requires", body: "The product brochure introduces the workflow and lists the technical specifications. Use the user manual for device controls, configuration and reporting. Check the document revision against the installed device with Antech before operational use."},
      {title: "See what an injection report contains", body: "The example report shows a chromatogram alongside the method settings, diverted intervals and recorded volumes for the demonstration injection. Use it to understand the report layout while assessing the records your site needs."},
    ],
    sources: [resourceDocuments.brochure, resourceDocuments.manual, resourceDocuments.sampleReport],
    related: ["case-studies", "support", "white-papers"],
    actions: [resourceDocuments.manual, resourceDocuments.brochure],
  },
  maintenance: {
    intro: "Plan a maintenance enquiry around the installed equipment, its service history and a suitable window for the laboratory.",
    sections: [
      {title: "Bring the asset and service record", body: "Identify the ReSolve device and connected HPLC instrument, the last known service and any issues seen during use. Share the activities the lab needs to keep running when discussing access and timing."},
      {title: "Agree the work and return-to-use checks", body: "Confirm the instrument coverage with Antech and identify who owns the site checks after work is complete. Record the activity under your laboratory’s equipment procedure and keep the resulting service record with the asset history."},
    ],
    sources: [sectionSources.support, resourceDocuments.manual],
    related: ["support", "documentation", "qualification"],
    actions: [{title: "Enquire about maintenance", url: "#/contact"}],
  },
  about: {
    intro: "Resolved Labs brings together practical laboratory efficiency guidance, independent examples and ReSolve, Antech’s isocratic HPLC solvent recovery system.",
    sections: [
      {title: "Antech’s laboratory instrumentation background", body: "Antech Solutions was founded in 2000 and is based in Waterford, Ireland. Its published portfolio includes analytical instrumentation, chromatography supplies and instrument services."},
      {title: "A resource for laboratory decisions", body: "Explore options by problem, laboratory role or industry. Follow the linked study, manufacturer material or programme guidance to compare what applies to your own workflow."},
    ],
    sources: [sectionSources.antech, solutionSources.solventRecovery],
    groups: [
      {title: "About Resolved Labs", ids: ["who-we-are", "mission", "approach"]},
      {title: "Contributors and suppliers", ids: ["partners", "manufacturers"]},
    ],
    actions: [{title: "Contact the Antech team", url: "#/contact"}],
  },
  "who-we-are": {
    intro: "Meet Antech Solutions, the Waterford-based analytical instrumentation business behind ReSolve.",
    team: [
      {name: "Richard", role: "Marketing and sales", image: "richard.webp", detail: "Leads sales and develops distributor channels."},
      {name: "Dermot", role: "Development", image: "dermot.webp", detail: "Leads product development and manufacturing."},
      {name: "Joe", role: "Implementation", image: "joe.webp", detail: "Leads installation, qualification, validation and technical support."},
      {name: "Paddy", role: "Administration", image: "paddy.webp", detail: "Coordinates administration and project reporting."},
    ],
    sections: [
      {title: "Analytical instruments and support", body: "Founded in 2000, Antech supplies analytical equipment including Raman and near-infrared instrumentation. The company publishes separate information about its instrument service and support plans."},
      {title: "A starting point for laboratory efficiency", body: "On Resolved Labs, Antech’s ReSolve system sits alongside practical guides and independent examples. The product pages identify who supplies each technology and link to the source behind it."},
    ],
    sources: [sectionSources.antech, sectionSources.contact, solutionSources.solventRecovery],
    related: ["mission", "resolve", "approach"],
    actions: [{title: "Read about Antech Solutions", url: sectionSources.antech.url}],
  },
  mission: {
    intro: "Help laboratory teams find practical ways to use fewer resources while maintaining the quality of their work.",
    sections: [
      {title: "Work from the laboratory’s actual priorities", body: "A useful improvement starts with a specific issue such as recurring solvent disposal, limited freezer capacity or a difficult purchasing comparison. The application guides connect these needs with measurements the team can use."},
      {title: "Make outcomes visible", body: "Define the starting point, record assumptions and compare results after a change. Clear records help teams judge whether the change fits their work and whether there is a case to extend it."},
    ],
    sources: [solutionSources.labEfficiency, solutionSources.benchmark],
    related: ["approach", "resource-efficiency", "reporting"],
    actions: [{title: "Explore laboratory solutions", url: "#/solutions"}],
  },
  approach: {
    intro: "Start with the workflow, assess the evidence and check the results against the laboratory’s own priorities.",
    sections: [
      {title: "Define the problem and select comparable evidence", body: "Map the work as it runs today and identify what the laboratory wants to improve. Check manufacturer information, independent testing and similar applications for evidence that matches the equipment and conditions in scope."},
      {title: "Agree the test and document what changes", body: "Select a small test and agree the baseline, success measures and site approvals up front. Bring the operational results and implementation costs back to the people deciding whether to adopt it."},
    ],
    sources: [solutionSources.labEfficiency, resourceDocuments.evaluation],
    related: ["assessments", "implementation", "measurement"],
    actions: [{title: "Plan an initial assessment", url: "#/assessments"}],
  },
  partners: {
    title: "Contributors and technology providers",
    intro: "See who developed ReSolve, who evaluated it independently and where the catalogue examples come from.",
    sections: [
      {title: "Antech and the independent study", body: "Antech supplies ReSolve. PMBrc at South East Technological University conducted the published independent performance evaluation under the conditions described in its report."},
      {title: "Providers of independent examples", body: "The catalogue identifies the manufacturer or organisation behind each example and links to its material. For availability and support on those examples, check with the named provider directly."},
    ],
    sources: [sectionSources.antech, resourceDocuments.evaluation],
    related: ["manufacturers", "case-studies", "examples"],
    actions: [{title: "Compare technology providers", url: "#/manufacturers"}],
  },
};

function sectionCard(id) {
  if (id === "resolve" || sustainabilityExamples.some(example => example.id === id)) return catalogueResultCard(id);

  const photo = editorialPictures(id)[0];
  const content = sectionContent[id];
  const description = content?.intro || solutionContent[id]?.intro || productContent[id]?.intro || descriptions[id]
    || (id === "customer-login" ? "Explore a fictional customer workspace with sample projects and support requests." : "");
  return `
    <article class="photo-example pictured-listing">
      <a class="card photo-card" href="#/${esc(id)}">
        <div class="photo-card-media"><img src="${esc(photo.src)}" alt="${esc(photo.alt)}" style="object-position:${esc(photo.position || "center")}" loading="lazy" decoding="async"></div>
        <div class="photo-card-copy">
          ${content?.label?.startsWith("Proposed") || id.startsWith("course-") || id.startsWith("package-") ? '<span class="badge future">Proposed</span>' : ""}
          <h3>${esc(content?.title || titles[id] || groups[id]?.title)}</h3>
          ${description ? `<p>${esc(description)}</p>` : ""}
        </div>
      </a>
      <p class="photo-credit">${listingPhotoCredit(photo, photo.illustrative === false ? "Product photo" : "Illustrative photo")}</p>
    </article>`;
}

function sectionPage(id) {
  const content = Object.hasOwn(sectionContent, id) ? sectionContent[id] : null;
  if (!content) return null;

  const parent = groups[id] ? id : parents[id] === "support" ? "resources" : parents[id];
  const label = content.label || groups[parent]?.title || "Resolved Labs";
  const actions = content.actions?.length
    ? `<div class="product-links">${content.actions.map(({title, url}, index) =>
      `<a class="button ${index === 0 ? "primary" : "light"}" href="${esc(url)}">${esc(title)}</a>`).join("")}</div>`
    : "";
  const cardGroups = content.groups || (content.related ? [{title: "Explore related resources", ids: content.related}] : []);
  const team = content.team ? `<section class="team-section" aria-labelledby="team-heading">
    <h2 id="team-heading">ReSolve leadership</h2>
    <ul class="team-grid">
      ${content.team.map(({name, role, image, detail}) => `<li>
        <div class="team-portrait"><img src="./assets/eic/${esc(image)}" alt="" loading="lazy" decoding="async"></div>
        <h3>${esc(name)}</h3>
        <p class="team-role">${esc(role)}</p>
        <p>${esc(detail)}</p>
      </li>`).join("")}
    </ul>
  </section>` : "";
  return editorialHero(id, content.intro, {title: content.title || titles[id] || groups[id]?.title, label, actions, parent}) + `
    <div class="page-body editorial-body">
      ${team}
      ${editorialPanels(id, content.sections)}
      ${cardGroups.map(group => `<section class="related editorial-related">
        <h2>${esc(group.title)}</h2><div class="cards">${group.ids.map(sectionCard).join("")}</div>
      </section>`).join("")}
      ${editorialSources(content.sources)}
    </div>`;
}
