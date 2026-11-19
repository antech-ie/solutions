const productContent = {
  products: {
    intro: "Explore ReSolve for suitable isocratic HPLC methods and compare equipment and consumables from independent manufacturers.",
    sections: [
      {
        title: "Start with the work your lab does",
        body: "Choose a recurring method, purchase or piece of equipment. Record the performance it must deliver and the resources it uses today. Compare alternatives against the same work, such as one accepted analytical sequence, one validated cycle or the same usable storage capacity.",
      },
      {
        title: "Check the evidence behind each option",
        body: "Read the technical specification, test conditions and exclusions for the model or SKU you are considering. Ask the provider for supporting documents and check the availability, application fit and service support for your site.",
      },
    ],
    sources: [
      { title: "Antech ReSolve product information", url: "https://antech.ie/resolve-hplc-solvent-recycler/" },
      { title: "My Green Lab ACT Ecolabel", url: "https://mygreenlab.org/programs/act-ecolabel/" },
    ],
  },
  catalog: {
    intro: "Filter the catalogue by application, manufacturer or availability. ReSolve is the current Antech product. The other listings are independent examples for comparison.",
    sections: [
      {
        title: "Compare what each option uses for the same job",
        body: "Compare freezer electricity at the same setpoint and usable capacity, autoclave water per accepted load, or packaging for the same number of usable tips. Include idle power, water and parts where they affect the comparison.",
      },
      {
        title: "Confirm details before ordering",
        body: "Ask for the exact model or part number, documentation, regional availability and ongoing support. Keep the provider’s test data with the assumptions used in your comparison.",
      },
    ],
    sources: [
      { title: "ENERGY STAR laboratory cold storage buying guidance", url: "https://www.energystar.gov/products/lab_grade_refrigerators_freezers" },
      { title: "My Green Lab ACT product database", url: "https://actdatabase.mygreenlab.org/" },
    ],
  },
  examples: {
    intro: "Explore technology and programme examples for reducing resource use in analytical labs. Filter by challenge or example type, then open a card for the source and a starting point for comparison.",
    sections: [
      {
        title: "Identify one opportunity to test",
        body: "Start with a process you can describe and measure. For example, record cooling-water use during reflux, packaging mass for a fixed number of tips, or daily electricity at an agreed freezer setpoint.",
      },
      {
        title: "Define what a successful trial looks like",
        body: "For a tip trial, agree which transfer and carryover checks must pass. For a freezer change, record the required sample temperature and usable space. Keep those limits and the test conditions next to the resource figures.",
      },
    ],
    sources: [
      { title: "Radleys Findenser application guidance", url: "https://www.radleys.com/blog/how-to-optimise-the-performance-of-your-findenser/" },
      { title: "Labcon Eclipse refill information", url: "https://labcon.com/eclipse.html" },
      { title: "ENERGY STAR laboratory refrigerators and freezers", url: "https://www.energystar.gov/products/lab_grade_refrigerators_freezers" },
    ],
  },
  "solvent-recovery": {
    intro: "Screen repeated isocratic HPLC runs for opportunities to reclaim mobile phase and measure how much fresh solvent and waste the method produces.",
    sections: [
      {
        title: "Start with a stable isocratic method",
        body: "Identify frequent sequences that run at a constant mobile-phase composition. Review the detector signal and baseline with the method owner, then agree how to assess retention time, peak area and system suitability before changing a routine method.",
      },
      {
        title: "Keep three volume totals",
        body: "Track fresh mobile phase prepared, volume recovered and waste collected. Compare equivalent sequences with similar accepted injection counts. Estimate cost from supplier prices and disposal charges, separating recovery volume from actual reductions in solvent purchasing.",
      },
    ],
    sources: [
      { title: "Antech guide to isocratic mobile-phase recycling", url: "https://antech.ie/sustainability-in-pharma-why-recycle-isocratic-hplc-mobile-phase/" },
      { title: "PMBrc and SETU performance evaluation", url: "https://antech.ie/wp-content/uploads/2026/07/ReSolve_PMBrc-Study-HPLC_Validation_Report-Rev-4.0-Final-BM-22072026.pdf" },
    ],
  },
  consumables: {
    intro: "Compare refill packs, alternative feedstocks and application-specific tip reuse against your laboratory’s existing liquid-handling workflow.",
    sections: [
      {
        title: "Separate three purchasing decisions",
        body: "Refill packs let a compatible rack stay in use. Bio-based tips may use a mass-balance declaration, which assigns renewable feedstock to products through supply-chain records. Tip washing allows reuse in workflows that pass the lab’s own checks. Assess fit, filter and purity requirements for each approach.",
      },
      {
        title: "Measure per 1,000 accepted transfers",
        body: "Track tips and racks purchased, packaging discarded and any repeat work. For washing, include water, cleaning materials and staff time. Ask quality and lab teams to agree the evidence needed for carryover and transfer performance.",
      },
    ],
    sources: [
      { title: "Labcon Eclipse refills", url: "https://labcon.com/eclipse.html" },
      { title: "Eppendorf epT.I.P.S. BioBased", url: "https://www.eppendorf.com/ie-en/Products/Lab-Consumables/Pipette-Tips/epTIPS-BioBased-p-PF-7756363" },
      { title: "Grenova consumable washing", url: "https://grenovarobotics.com/consumable-washing/" },
    ],
  },
  "resource-technologies": {
    intro: "Compare air-cooled reflux, oil-free vacuum, cold storage, sterilisation and ventilation against the duties your equipment has to meet.",
    sections: [
      {
        title: "Use a comparison that matches the application",
        body: "For chemistry equipment, document the solvent, scale and operating conditions. For a freezer, keep the required temperature and usable space comparable. For sterilisation, compare the same validated load and include what equipment uses when it is idle.",
      },
      {
        title: "Bring facilities and lab teams into the comparison",
        body: "Check ventilation, available utilities and maintenance access with facilities. Record the expected operating hours, replacement parts and service requirements so the lab can compare costs across the equipment’s working life.",
      },
    ],
    sources: [
      { title: "Radleys Findenser application guidance", url: "https://www.radleys.com/blog/how-to-optimise-the-performance-of-your-findenser/" },
      { title: "ENERGY STAR laboratory refrigerators and freezers", url: "https://www.energystar.gov/products/lab_grade_refrigerators_freezers" },
      { title: "Priorclave steam sterilisation energy and water", url: "https://www.priorclave.com/en-gb/why-priorclave/autoclave-energy-water-consumption/" },
    ],
  },
  manufacturers: {
    intro: "Browse the manufacturers behind the independent catalogue examples and open their technical sources to evaluate a specific application.",
    sections: [
      {
        title: "Ask for evidence at model or SKU level",
        body: "Request current data sheets, test conditions, consumable compatibility and service information for the exact product. If a supplier provides an environmental label, check the product identifier, reported impact categories and evidence behind the figures.",
      },
      {
        title: "Build a supplier comparison",
        body: "Record performance criteria, resource use, maintenance, replacement items and local support in the same format for each option. Confirm price and regional availability with the provider. The independent catalogue examples are research references.",
      },
    ],
    sources: [
      { title: "My Green Lab ACT Ecolabel", url: "https://mygreenlab.org/programs/act-ecolabel/" },
      { title: "My Green Lab ACT product database", url: "https://actdatabase.mygreenlab.org/" },
    ],
  },
  resolve: {
    intro: "ReSolve is Antech’s mobile-phase recycler for suitable isocratic HPLC methods. It uses the detector signal to route fluid back to the reservoir or to waste.",
    sections: [
      {
        title: "See where the recycler fits",
        body: "A valve downstream of the detector routes fluid according to the configured detector baseline and peak detection. Check the detector output and injection-start connection against the technical specification. Review the configuration with your instrument and method owners.",
      },
      {
        title: "What the independent study measured",
        body: "PMBrc at SETU reported that ReSolve recovered 94.5% of the mobile phase in each of two 96-injection sequences for a paracetamol and ibuprofen isocratic HPLC assay. The second sequence reused mobile phase from the first. The report compares retention time, peak area, peak shape, resolution and baseline noise for those runs.",
      },
      {
        title: "Build a method-specific baseline",
        body: "Record the fresh volume prepared, recovery volume and waste volume. Compare equivalent runs and review system suitability against agreed criteria. Use actual changes in purchases and disposal volume when estimating savings.",
      },
    ],
    sources: [
      { title: "Antech ReSolve specifications and downloads", url: "https://antech.ie/resolve-hplc-solvent-recycler/" },
      { title: "PMBrc and SETU performance evaluation", url: "https://antech.ie/wp-content/uploads/2026/07/ReSolve_PMBrc-Study-HPLC_Validation_Report-Rev-4.0-Final-BM-22072026.pdf" },
    ],
  },
  "example-findenser": {
    intro: "Radleys Findenser is an air-cooled condenser for suitable reflux work. It can remove the need for a running cooling-water connection during that step.",
    sections: [
      {
        title: "Check the solvent and reaction scale",
        body: "Review the manufacturer’s suitability guidance for the solvent, flask size, working volume and ambient conditions. Keep a record of heating intensity and any solvent loss when you assess an existing reflux method.",
      },
      {
        title: "Compare equivalent runs",
        body: "Measure cooling-water use for the current reflux setup. Compare resource use, observed solvent loss and the quality of the result at the same scale and duration. Account for any remaining water use elsewhere in the workflow.",
      },
    ],
    sources: [{ title: "Radleys Findenser application guidance", url: "https://www.radleys.com/blog/how-to-optimise-the-performance-of-your-findenser/" }],
  },
  "example-tipnovus": {
    intro: "Grenova’s TipNovus washers clean and dry compatible pipette tips. The lab decides which workflows can use washed tips based on its own checks.",
    sections: [
      {
        title: "Choose a defined liquid-handling workflow",
        body: "Ask for supported tip and rack formats for the specific model. Select a recurring application and agree its carryover, cleanliness and transfer-performance criteria with the method owner before any routine reuse.",
      },
      {
        title: "Work out how racks move through the lab",
        body: "Grenova offers benchtop and automation-ready configurations. Map where staff collect used racks, whether they need to rerack the tips, how long and where clean racks are held, and how they return to the bench or liquid handler. Check whether washing and drying can keep pace with demand on a busy day.",
      },
      {
        title: "Test against fresh tips before changing practice",
        body: "Compare reused tips with fresh tips in an approved pilot using the same application and acceptance criteria. Record the tip SKU, wash programme, reuse count and any rejected tips. Use the results to agree when racks can return to service and when a fresh rack is required.",
      },
      {
        title: "Count water, detergent and staff time",
        body: "Record tips purchased and discarded, wash water and cleaning consumables per fixed number of accepted transfers. Track rejected or repeated runs and staff time alongside the reduction in new tips.",
      },
    ],
    sources: [
      { title: "Grenova TipNovus product information", url: "https://grenovarobotics.com/product/tipnovus/" },
      { title: "Grenova consumable washing portfolio", url: "https://grenovarobotics.com/consumable-washing/" },
    ],
  },
  "example-biobased": {
    intro: "Eppendorf offers epT.I.P.S. BioBased polypropylene tips, including reloads. Its mass-balance records assign renewable feedstock to the product through the supply chain.",
    sections: [
      {
        title: "Match the exact tip specification",
        body: "Confirm pipette fit, volume range, filter, purity grade and sterility for the SKU. Ask for the relevant mass-balance and packaging documentation so the purchasing team can identify which claims apply to that product.",
      },
      {
        title: "Check how the reload fits your bench",
        body: "Eppendorf lists compatible reusable boxes for its reload variants. Check the box and tray combination for the tip you buy, how your team will handle sterile trays and how reusable boxes are identified and stored. Compare the complete setup with the current rack before ordering for multiple benches.",
      },
      {
        title: "Keep the evidence with the item record",
        body: "Eppendorf makes product and lot-specific purity documents available alongside an ISCC sustainability declaration. File the documents alongside the item number in purchasing. Keep the quality evidence used to accept a lot separate from the supply-chain evidence used for environmental reporting.",
      },
      {
        title: "Check where used tips and packaging go",
        body: "Weigh packaging for 1,000 tips and document which parts the site can recycle. Route used tips according to their material, contamination and the laboratory’s waste rules. The renewable-feedstock declaration answers a separate purchasing question.",
      },
    ],
    sources: [
      { title: "Eppendorf epT.I.P.S. BioBased product and reload variants", url: "https://www.eppendorf.com/ie-en/Products/Lab-Consumables/Pipette-Tips/epTIPS-BioBased-p-PF-7756363" },
      { title: "Eppendorf BioBased certification and declarations", url: "https://www.eppendorf.com/ie-en/lab-academy/lab-solutions/eppendorf-consumables-biobased/" },
    ],
  },
  "example-vacuum": {
    intro: "VACUUBRAND diaphragm pumps provide oil-free vacuum for duties such as filtration and solvent evaporation. The manufacturer lists separate models for different pressure and media requirements.",
    sections: [
      {
        title: "Match the pump to the task",
        body: "Record the required operating pressure, flow demand and media. Check the model’s pumping speed at the working pressure, wetted materials and arrangements for vapour collection or exhaust handling.",
      },
      {
        title: "Choose the right level of vacuum control",
        body: "A filtration bench may need steady suction. A rotary evaporator may need to hold a particular pressure as the solvent changes. Check how each system regulates pressure. A fixed-speed pump can also use an external controller. Use the manufacturer’s guide if the task requires a deeper vacuum than a diaphragm pump can provide.",
      },
      {
        title: "Specify the connections and accessories",
        body: "Check hose and connector sizes, the controller and any inlet separator or exhaust condenser with the supplier. These parts depend on the instrument and vapours in the process. Include their service needs and consumables in the quote alongside the pump.",
      },
      {
        title: "Compare the complete setup",
        body: "If the baseline uses a water aspirator, measure water consumption for the same completed work. Record electricity, maintenance materials and time to complete the task for each configuration.",
      },
    ],
    sources: [
      { title: "VACUUBRAND diaphragm pump specifications", url: "https://www.vacuubrand.com/vacuum-pumps/diaphragm-pumps" },
      { title: "VACUUBRAND vacuum selection and connection guide", url: "https://www.vacuubrand.com/fileadmin/vacuubrand/Downloads/Brochures/Connection_Guide_EN.pdf" },
    ],
  },
  "example-freezer": {
    intro: "Stirling Ultracold’s VAULT100 is an upright ultra-low-temperature freezer with a free-piston Stirling engine. Use its published test conditions alongside your own sample-storage requirements.",
    sections: [
      {
        title: "Compare at a matched setpoint",
        body: "Stirling reports 5.8 kWh per day at steady state under the ENERGY STAR test method at −80 °C. Compare that figure with data measured on the same basis. Log your site’s demand separately, including door openings and ambient conditions.",
      },
      {
        title: "Check space and temperature recovery",
        body: "Compare actual usable rack space, temperature recovery after door openings, alarm capabilities, servicing and any backup requirements. Put energy use beside the capacity and sample-protection criteria the freezer must meet.",
      },
    ],
    sources: [
      { title: "Stirling Ultracold VAULT100 specifications", url: "https://www.stirlingultracold.com/upright-ultra-low-temperature-freezers/" },
      { title: "ENERGY STAR laboratory refrigerators and freezers", url: "https://www.energystar.gov/products/lab_grade_refrigerators_freezers" },
    ],
  },
  "example-autoclave": {
    intro: "Priorclave’s purpose-built autoclaves illustrate how load type, cycle frequency and configuration affect laboratory sterilisation water and energy use.",
    sections: [
      {
        title: "Describe loads and daily use",
        body: "Write down typical and peak loads, the number of cycles per day and the throughput you need. Ask how each configuration generates steam and uses water for cooling and drain tempering, including between cycles.",
      },
      {
        title: "Compare chamber layouts with real loads",
        body: "Priorclave groups loads by type, including liquids, glassware and porous materials. Ask suppliers to show how your usual containers and baskets fit, how much room is needed for loading, and what options support the required cycle monitoring. Compare how long a successful load takes from loading through cooling and release.",
      },
      {
        title: "Get facilities involved before ordering",
        body: "Request model-specific requirements for power, water quality, steam if applicable, drainage and heat released into the room. Review access for installation and servicing. Put any utility upgrades, water treatment and service downtime into the comparison before selecting a configuration.",
      },
      {
        title: "Measure an accepted cycle",
        body: "Compare water and electricity for the same validated load and include idle consumption across the operating day. Keep sterilisation acceptance and throughput in the comparison so resource figures reflect work that meets the laboratory’s requirements.",
      },
    ],
    sources: [
      { title: "Priorclave steam sterilisation energy and water guidance", url: "https://www.priorclave.com/en-gb/why-priorclave/autoclave-energy-water-consumption/" },
      { title: "Priorclave laboratory autoclave load types", url: "https://www.priorclave.com/en-gb/autoclave-load-types-overview/" },
      { title: "Priorclave water supply, electrical load and cooling guidance", url: "https://www.priorclave.com/en-gb/support/faq/" },
    ],
  },
  "example-fumehood": {
    intro: "Erlab GreenFumeHood 3 uses filters and sensors so a compatible hood can return air to the room. Each chemical application needs an assessment before the lab decides whether a filtered hood is suitable.",
    sections: [
      {
        title: "Start with chemistry and containment",
        body: "Give Erlab and the site safety team the chemical list, typical quantities and frequency of use. Ask them to document suitable filters, alarm checks and which applications still need ducted extraction. Submit changes in chemistry or use for review.",
      },
      {
        title: "Include energy and filter replacement",
        body: "Ask facilities how a filtered hood would affect building ventilation for the same application. Compare fan power and conditioned-air demand using site data. Include filter life, replacement cost, monitoring and disposal.",
      },
    ],
    sources: [
      { title: "Erlab GreenFumeHood 3 and application assessment", url: "https://www.erlab.com/en/integration-kits-for-exhaust-hoods/erlab-greenfumehood-3-technology/" },
      { title: "Erlab guide to choosing a filtered fume hood (PDF)", url: "https://info.erlab.com/hubfs/Product%20Brochures/Education/GFH_White_Paper_FINAL.pdf" },
    ],
  },
  "example-refills": {
    intro: "Labcon’s Eclipse refills restock compatible 96-tip racks so the rack can stay in service across multiple refills.",
    sections: [
      {
        title: "Check repeat use of the rack",
        body: "Confirm the compatible rack, pipette and tip specification. Review the transfer process and choose the variant that meets your purity and sterility requirements. Include the time and storage space needed to manage refills.",
      },
      {
        title: "Weigh packaging on the same basis",
        body: "Compare delivered rack and packaging mass for 1,000 usable tips. Allocate reusable rack weight over the number of refills you expect in practice, and account for replacement racks and the actual disposal route.",
      },
    ],
    sources: [{ title: "Labcon Eclipse refills and rack transfer", url: "https://labcon.com/eclipse.html" }],
  },
  "example-act": {
    intro: "My Green Lab’s ACT Ecolabel provides third-party-verified environmental information on participating laboratory products to support procurement decisions.",
    sections: [
      {
        title: "Look up the product being quoted",
        body: "Find the exact model or item in the ACT database and save the label with your purchasing assessment. Review the information available for like-for-like alternatives and note the boundaries and categories covered by each label.",
      },
      {
        title: "Bring the label into your evaluation",
        body: "Record which spending decisions were supported by reviewed environmental evidence. Assess laboratory fit, quality and total cost against your procurement requirements alongside the label data.",
      },
    ],
    sources: [
      { title: "My Green Lab ACT Ecolabel overview", url: "https://mygreenlab.org/programs/act-ecolabel/" },
      { title: "My Green Lab ACT product database", url: "https://actdatabase.mygreenlab.org/" },
    ],
  },
  "example-coldstorage": {
    intro: "The International Laboratory Freezer Challenge is a My Green Lab and I2SL programme for organising teams around better cold-storage practices.",
    sections: [
      {
        title: "Start with a freezer inventory",
        body: "Record unit location, owner, setpoint and sample retention needs. Review inventories and plan maintenance with sample owners. Follow the site’s approval process for any setpoint change, disposal or transfer.",
      },
      {
        title: "Plan maintenance around sample protection",
        body: "My Green Lab includes scheduled defrosting in its cold-storage guidance. Identify eligible units with the equipment owner, arrange suitable temporary space, and agree how staff will track samples during the move. Confirm alarms and equipment readiness before units return to service.",
      },
      {
        title: "Review capacity across the site",
        body: "Use a shared register to see where storage is full, where agreed space is available and where units are nearing replacement. Discuss consolidation with sample owners and facilities staff. Check that the site will still have suitable backup capacity before taking a freezer out of service.",
      },
      {
        title: "Keep one action log for each unit",
        body: "Track completed maintenance, inventory coverage and usable space. Where metering is available, record daily electricity before and after changes along with setpoint and loading conditions. The programme’s scoresheet gives teams a way to log their actions.",
      },
    ],
    sources: [
      { title: "My Green Lab and I2SL Freezer Challenge", url: "https://mygreenlab.org/programs/freezer-challenge/" },
      { title: "My Green Lab preventive maintenance and inventory guidance", url: "https://mygreenlab.org/how-to-green-lab/" },
      { title: "International Laboratory Freezer Challenge programme and scoresheet", url: "https://freezerchallenge.mygreenlab.org/" },
    ],
  },
};
