const solutionSources = {
  labEfficiency: {
    title: "UCL Laboratory Efficiency Assessment Framework",
    url: "https://www.ucl.ac.uk/about/sustainability/culture-and-engagement/leaf-laboratory-efficiency-assessment-framework",
  },
  benchmark: {
    title: "I2SL Labs2Zero and laboratory benchmarking",
    url: "https://www.i2sl.org/labs2zero/index.html",
  },
  water: {
    title: "EPA and I2SL guide to water efficiency in laboratories",
    url: "https://www.epa.gov/system/files/documents/2022-06/ws-I2SL-Laboratory-Water-Efficiency-Guide.pdf",
  },
  coldStorage: {
    title: "My Green Lab and I2SL Freezer Challenge",
    url: "https://mygreenlab.org/programs/freezer-challenge/",
  },
  freezerComparison: {
    title: "ENERGY STAR laboratory-grade refrigerators and freezers",
    url: "https://www.energystar.gov/products/lab_grade_refrigerators_freezers",
  },
  purchasing: {
    title: "My Green Lab ACT Ecolabel 2.0 scorecard",
    url: "https://mygreenlab.org/programs/act-ecolabel/act-2-0-scorecard/",
  },
  refills: {
    title: "Labcon Eclipse pipette-tip refills",
    url: "https://labcon.com/eclipse.html",
  },
  solventRecovery: {
    title: "Antech ReSolve isocratic HPLC solvent recovery",
    url: "https://antech.ie/resolve-hplc-solvent-recycler/",
  },
  hazardousWaste: {
    title: "Environmental Protection Agency hazardous waste in Ireland",
    url: "https://www.epa.ie/our-services/monitoring--assessment/waste/national-waste-statistics/hazardous/",
  },
  emissionsInventory: {
    title: "GHG Protocol Corporate Standard",
    url: "https://ghgprotocol.org/corporate-standard",
  },
  purchasedEnergy: {
    title: "GHG Protocol Scope 2 Guidance",
    url: "https://ghgprotocol.org/scope-2-guidance",
  },
  procedureValidation: {
    title: "EMA ICH Q2(R2) analytical procedure validation",
    url: "https://www.ema.europa.eu/en/scientific-guidelines/ich-q2r2-validation-analytical-procedures",
  },
  procedureDevelopment: {
    title: "EMA ICH Q14 analytical procedure development",
    url: "https://www.ema.europa.eu/en/scientific-guidelines/ich-q14-analytical-procedure-development",
  },
  changeManagement: {
    title: "EMA ICH Q10 pharmaceutical quality system",
    url: "https://www.ema.europa.eu/en/scientific-guidelines/ich-q10-pharmaceutical-quality-system",
  },
  goodManufacturingPractice: {
    title: "European Commission EudraLex Volume 4, chapters 6 and 7",
    url: "https://health.ec.europa.eu/medicinal-products/eudralex/eudralex-volume-4_en",
  },
  testingCompetence: {
    title: "ISO/IEC 17025 requirements for testing and calibration laboratories",
    url: "https://www.iso.org/standard/66912.html",
  },
  biologicsStability: {
    title: "FDA ICH Q5C stability testing for biotechnology and biological products",
    url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/q5c-quality-biotechnological-products-stability-testing-biotechnologicalbiological-products",
  },
  sharedEquipment: {
    title: "UCL research facilities and shared equipment",
    url: "https://www.ucl.ac.uk/research-innovation/research-environment/platforms-and-facilities/research-facilities-and-equipment",
  },
};

const solutionContent = {
  "operating-costs": {
    intro: "Find recurring costs inside individual workflows, from solvent purchase and waste collection to freezer electricity and instrument downtime.",
    sections: [
      {
        title: "Follow a month of activity",
        body: "Pick one process, such as an HPLC instrument group or a bank of freezers. Bring together purchasing records, waste collection charges, electricity data and completed work. Mark where a shared bill or meter needs an allocation and document how you made it.",
      },
      {
        title: "Test the effect of rising solvent prices",
        body: "Estimate annual spending at today’s price per litre and at a higher price based on your purchasing history or supplier quotes. Compare the scenarios at your current fresh-solvent demand and at the lower demand you could achieve on eligible methods.",
      },
      {
        title: "Compare costs over the equipment’s working life",
        body: "Estimate purchase, installation, consumables, servicing and disposal over the same period for each option. For cold storage, compare energy figures on a consistent test basis and check that capacity and operating temperature match your needs.",
      },
      {
        title: "Check the result against workload",
        body: "Track monthly spend alongside cost per accepted run or occupied storage position. Compare equivalent workloads and separate one-off transition costs, so the team can see which changes will affect the recurring budget.",
      },
    ],
    sources: [solutionSources.freezerComparison, solutionSources.labEfficiency],
  },
  circularity: {
    intro: "Improve laboratory circularity by recovering useful materials and measuring how much fresh material and waste the change actually avoids.",
    sections: [
      {
        title: "Identify a stream worth recovering",
        body: "Record what the lab buys and discards. Begin with one well-defined stream, such as mobile phase from a compatible isocratic HPLC method, and keep wash and disposal streams separate in the baseline.",
      },
      {
        title: "Measure reuse and its effects",
        body: "Track litres purchased, recovered and sent to waste over comparable workloads. Use appropriate factors for solvent production, transport and disposal if you estimate CO₂e, and account for any additional energy or materials involved in recovery.",
      },
    ],
    sources: [solutionSources.solventRecovery, solutionSources.emissionsInventory],
  },
  "solvent-supply": {
    intro: "Reduce reliance on fresh solvent and understand what shortages, longer lead times and price increases would mean for routine testing.",
    sections: [
      {
        title: "Measure exposure by solvent and grade",
        body: "List the grades your lab relies on, its approved suppliers, typical lead times and usable stock. Relate expected deliveries and drawdown to scheduled runs to see where testing would be most exposed.",
      },
      {
        title: "Compare ways to reduce fresh-solvent demand",
        body: "Model the effect of a delayed shipment or a price increase using local purchasing data. For suitable isocratic methods, estimate the demand that verified recovery could avoid while allowing for the volume the lab still needs to buy.",
      },
    ],
    sources: [solutionSources.solventRecovery, solutionSources.labEfficiency],
  },
  "method-consistency": {
    intro: "Understand where mobile-phase variation enters your HPLC workflow and what to check before changing how solvent is prepared or reused.",
    sections: [
      {
        title: "Trace preparation and use",
        body: "Review preparation records, solvent lots, hold times and the composition and pH specified by the approved method. Compare these records with retention time, system suitability and repeat runs to identify patterns worth investigating.",
      },
      {
        title: "Agree how to check a change",
        body: "Work with the method owner and quality team to set acceptance criteria and compare representative runs. Assess reuse for compatible isocratic methods under your own quality procedures.",
      },
    ],
    sources: [solutionSources.procedureValidation, solutionSources.procedureDevelopment, solutionSources.solventRecovery],
  },
  "solvent-waste": {
    intro: "Trace how solvents enter the lab, where methods use them and what reaches waste collection. That baseline helps identify where to reduce use or assess recovery.",
    sections: [
      {
        title: "Map the solvent streams",
        body: "Choose a representative instrument group and record purchase volumes, method consumption and waste collections for the same period. Separate analytical mobile phase from wash solvent and other waste streams in your records. Ask the site waste lead to confirm the records and disposal arrangements for each stream.",
      },
      {
        title: "Assess suitable isocratic HPLC methods",
        body: "Antech’s ReSolve uses the detector signal to route eligible mobile phase towards reuse or to waste. Review instrument and method suitability before a trial. Agree which analytical performance checks and site approvals will determine whether recovery is acceptable.",
      },
      {
        title: "Measure both use and disposal",
        body: "Record litres of fresh solvent purchased, litres routed to recovery and the amount sent for waste collection. Compare those figures with accepted injections over consistent periods, and investigate gaps between instrument-level data and site waste records.",
      },
    ],
    sources: [solutionSources.solventRecovery, solutionSources.hazardousWaste],
  },
  "resource-efficiency": {
    intro: "Use the way your equipment actually runs to identify avoidable water, electricity and material use across the lab.",
    sections: [
      {
        title: "Map the major water users",
        body: "List cooling, washing and purified-water equipment alongside its duty and run hours. The EPA and I2SL water guide uses a facility water balance to connect these uses to total consumption. Investigate once-through cooling where a suitable recirculating or air-cooled option could meet the same process duty.",
      },
      {
        title: "Review cold storage as a system",
        body: "Check where samples are stored, who owns them and how much usable capacity each unit provides. Compare proposed equipment at a relevant setpoint and capacity, using energy figures measured on a consistent basis. Keep sample requirements in the evaluation.",
      },
      {
        title: "Measure at the point of use",
        body: "Select a practical measure such as litres per cleaning cycle, kilowatt-hours per freezer per day or packaging mass per delivery. Record workload too, then test whether the change still delivers the required laboratory output.",
      },
    ],
    sources: [solutionSources.water, solutionSources.freezerComparison],
  },
  plastics: {
    intro: "Target the high-volume plastics you can change safely, starting with compatibility, packaging and the waste routes available to your site.",
    sections: [
      {
        title: "Find the items that dominate use",
        body: "Count orders for tips, racks, tubes and plates against a representative period of accepted work. Note the primary item and its packaging separately. Start with a high-volume item where an alternative meets the same cleanliness, fit and handling requirements.",
      },
      {
        title: "Compare refill options in one workflow",
        body: "Labcon’s Eclipse system is one example of a refill for compatible pipette-tip racks. Check the exact rack and tip pairing, any sterility requirements and how bench staff will handle refills. Ask quality and lab safety colleagues to review the proposed change.",
      },
      {
        title: "Measure what leaves the lab",
        body: "Compare packaging mass per 1,000 tips and cost per accepted run. Confirm which packaging and used items the site can separate and collect. Record the outcome under the waste stream the site actually uses.",
      },
    ],
    sources: [solutionSources.labEfficiency, solutionSources.refills, solutionSources.purchasing],
  },
  reporting: {
    intro: "Build a traceable record of lab resource use that site teams can compare over time and pass to the organisation’s reporting team.",
    sections: [
      {
        title: "Set the boundary and gather evidence",
        body: "Choose the labs, instruments and dates covered. Record electricity in kilowatt-hours, water and fresh solvent in litres, and collected waste in kilograms where those are the reported units. Keep the meter reading, invoice or collection record behind each figure, and record any estimates or missing data.",
      },
      {
        title: "Show totals and a measure of workload",
        body: "Report total use alongside a suitable activity measure, such as electricity per freezer-day or solvent per accepted injection. Keep the reporting period, calculation and definition of accepted work consistent. Explain changes in workload, equipment or measurement coverage so readers can interpret the trend.",
      },
      {
        title: "Hand measured data to the inventory team",
        body: "The GHG Protocol Corporate Standard addresses organisation-level emissions inventories, and its Scope 2 Guidance covers emissions from purchased energy. Share the measured energy data and its boundary with the inventory owner. Record any emission factor, method, geography and year alongside calculated emissions.",
      },
    ],
    sources: [solutionSources.emissionsInventory, solutionSources.purchasedEnergy, solutionSources.benchmark],
  },
  productivity: {
    intro: "Find where analysts spend hands-on time and where waiting or repeated work reduces laboratory throughput.",
    sections: [
      {
        title: "Track the work from receipt to review",
        body: "Follow a batch through sample receipt, mobile-phase preparation, instrument setup, testing and result review. Track analyst time spent preparing solvent, changing bottles and managing waste. Separate hands-on time from waiting so the team can identify the biggest bottleneck.",
      },
      {
        title: "Trial one operational change",
        body: "Try a shared booking rule, standard rack locations or a clearer handoff between preparation and testing. UCL’s LEAF framework includes equipment sharing and resource management, and the Freezer Challenge includes sample organisation. Pick a change with a named owner and a simple way to reverse it if needed.",
      },
      {
        title: "Check accepted output and rework",
        body: "Compare sample-to-result time, repeats and accepted runs per instrument-day before and after the trial. Include the sample mix and staffing context when interpreting the result, especially if workload changed during the trial.",
      },
    ],
    sources: [solutionSources.labEfficiency, solutionSources.coldStorage],
  },
  qc: {
    intro: "Evaluate savings in a QC workflow while keeping the approved method, valid results and release schedules in view.",
    sections: [
      {
        title: "Start with a method and its constraints",
        body: "Bring the intended use, instrument setup and approved system suitability criteria to the discussion. For solvent recovery, identify suitable isocratic candidates and record their current solvent use and sequence completion. Review each candidate with the method owner before trialling a change.",
      },
      {
        title: "Agree the evidence before a trial",
        body: "ICH Q2(R2) links validation to the intended purpose of an analytical procedure. Involve QA to agree the applicable assessment, experimental comparison and acceptance criteria. Record how test material, instruments and operating conditions will be represented in the comparison.",
      },
      {
        title: "Read resource use beside method performance",
        body: "Review system suitability, invalid runs, repeat tests and turnaround alongside solvent or energy saved. Set a period to check whether the trial outcome holds across routine work before recommending wider adoption.",
      },
    ],
    sources: [solutionSources.procedureValidation, solutionSources.goodManufacturingPractice, solutionSources.solventRecovery],
  },
  qa: {
    intro: "Keep sustainability projects traceable through the site quality system, from the initial change request to the routine review.",
    sections: [
      {
        title: "Describe precisely what changes",
        body: "Record the affected equipment, methods, materials, systems and records. Identify the current controls and the groups that own them. ICH Q10 places change management within the pharmaceutical quality system, so route relevant changes through the site process agreed with the quality owner.",
      },
      {
        title: "Set the evidence and approval points",
        body: "Agree what the risk assessment needs to cover, who will review it and which approval criteria apply. Confirm the appropriate qualification or method assessment, review supplier information and identify any instructions, training or records that need to be updated.",
      },
      {
        title: "Review the change in routine use",
        body: "Capture the decision, supporting evidence and effective date in the site record. Schedule a check for expected savings and unexpected effects on method performance, deviations or maintenance. Keep the approved operating and monitoring instructions available to the teams using them.",
      },
    ],
    sources: [solutionSources.changeManagement, solutionSources.procedureDevelopment, solutionSources.procedureValidation],
  },
  procurement: {
    intro: "Compare suppliers against the same requirements for performance, service, cost and environmental evidence.",
    sections: [
      {
        title: "Build the comparison around the lab’s actual need",
        body: "Ask users to define required capacity, throughput, operating conditions, consumable compatibility and service response. Request itemised prices for equipment, installation, consumables and planned maintenance so bids can be compared over the same period.",
      },
      {
        title: "Ask for evidence behind environmental claims",
        body: "Request the test standard, operating conditions and model number for quoted energy or water performance. The ACT Ecolabel scorecard shows how manufacturing, packaging, use and end-of-life information can inform laboratory purchasing. Compare options on matched specifications.",
      },
      {
        title: "Record what informed the award",
        body: "Keep the technical evaluation and supplier evidence with the commercial comparison. Review recurring costs, availability of consumables and support after installation. Feed actual performance back into the next sourcing exercise.",
      },
    ],
    sources: [solutionSources.purchasing, solutionSources.freezerComparison],
  },
  sustainability: {
    intro: "Turn laboratory sustainability goals into projects with a baseline, a responsible owner and a way to track results.",
    sections: [
      {
        title: "Choose opportunities using site evidence",
        body: "Bring purchasing, waste, energy and water records together with the lab team. UCL’s LEAF framework offers actions across those areas, and I2SL provides lab-building benchmarking. Use the relevant source to put local data in context and identify a manageable first project.",
      },
      {
        title: "Attach a decision to each indicator",
        body: "Pick measures the team can act on, such as solvent purchased per accepted run or electricity per freezer-day. Give each measure an owner, reporting interval and evidence source. Agree which figures will be measured directly and which need a documented estimate.",
      },
      {
        title: "Make the results comparable",
        body: "Capture the period, site boundary and workload for every project. Report changes in the way data is collected and keep the underlying records available. Share the result with the teams that can maintain the change and apply it to similar workflows.",
      },
    ],
    sources: [solutionSources.labEfficiency, solutionSources.benchmark, solutionSources.emissionsInventory],
  },
  operations: {
    intro: "Make the everyday work of managing instruments, cold storage and consumables easier to plan and measure.",
    sections: [
      {
        title: "Put ownership on the equipment list",
        body: "Give shared instruments and freezers an owner, a maintenance schedule and an escalation contact. Document when they’re needed for critical work so service, repairs and stock replenishment can be planned around demand.",
      },
      {
        title: "Make samples and stock easier to locate",
        body: "Use clearly assigned locations for samples and consumables. The Freezer Challenge includes cold-storage practices such as sample organisation. Review held stock with the responsible team before consolidating equipment or changing any storage arrangement.",
      },
      {
        title: "Work from downtime and exceptions",
        body: "Track unplanned downtime, maintenance completion, stockouts and late handovers. Review the causes with technical staff and choose one change to trial, such as earlier reorder points for a frequently used item or clearer booking for shared equipment.",
      },
    ],
    sources: [solutionSources.coldStorage, solutionSources.labEfficiency],
  },
  "site-management": {
    intro: "Prioritise site-level improvements by comparing building demand, equipment needs and the work each lab supports.",
    sections: [
      {
        title: "Separate building and process demand",
        body: "Use available submeter data to distinguish shared services from individual laboratory loads. Identify the labs with the largest utility use and note occupancy, equipment hours and operating constraints before setting priorities.",
      },
      {
        title: "Benchmark against comparable facilities",
        body: "I2SL’s Laboratory Benchmark Tool compares laboratory building performance across relevant peers and climate zones. Use benchmarking to choose where to investigate further. The EPA and I2SL water guide offers a complementary way to connect fixture and process demand to site water use.",
      },
      {
        title: "Plan changes with the teams responsible for the work",
        body: "Review continuity, safety and the effect on lab methods before modifying utilities or retiring equipment. Compare site utility totals after implementation and confirm that the affected labs are still meeting their operating requirements.",
      },
    ],
    sources: [solutionSources.benchmark, solutionSources.water],
  },
  pharma: {
    intro: "Look for resource savings in routine pharmaceutical testing while protecting method controls and the evidence behind release and stability decisions.",
    sections: [
      {
        title: "Compare common workflows across QC labs",
        body: "Identify routine method families, including release and stability testing. Group them by instrument, workload and resource use. This can make it easier to see whether solvent, consumables or recurring service costs dominate a particular workflow.",
      },
      {
        title: "Choose a change the quality system can assess",
        body: "For a proposed HPLC change, review instrument and method suitability with the QC and QA owners. ICH Q14 provides a science- and risk-based approach to analytical procedure development and maintenance. Apply the site’s change and validation processes to the planned scope.",
      },
      {
        title: "Connect savings to accepted testing",
        body: "Track solvent consumption or waste volume with accepted injections, repeats and turnaround. Build the comparison around the specific method and instruments evaluated, and agree the evidence needed before extending the change to another lab.",
      },
    ],
    sources: [solutionSources.procedureDevelopment, solutionSources.procedureValidation, solutionSources.goodManufacturingPractice],
  },
  biopharma: {
    intro: "Improve sample storage and consumables planning around the material, its stability requirements and the performance the laboratory needs to demonstrate.",
    sections: [
      {
        title: "Make storage demand visible",
        body: "Inventory occupied freezer and refrigerator space by material, owner and required storage condition. Check which items have assigned space and a clear retention decision. Assess the room for consolidation, maintenance and improved sample access with the material owners.",
      },
      {
        title: "Keep stability in the operating decision",
        body: "ICH Q5C covers stability testing for biotechnological and biological products. Use the applicable material requirements and the site’s approval process when evaluating storage or handling changes. Compare alternatives using comparable setpoints, usable capacity and data on how the equipment operates.",
      },
      {
        title: "Measure utilisation and equipment performance",
        body: "Monitor usable positions occupied, electricity per unit and sample access time. Review temperature records, excursions and equipment downtime alongside energy use so the effect on sample protection stays visible.",
      },
    ],
    sources: [solutionSources.biologicsStability, solutionSources.coldStorage, solutionSources.freezerComparison],
  },
  contract: {
    intro: "Improve resource use in a multi-client lab while keeping each method, scope of work and customer approval traceable.",
    sections: [
      {
        title: "Map resource use by client or assay family",
        body: "Review instrument hours, consumables, waste and repeat work by method or test group. Use a simple allocation rule for shared overhead and keep it visible in the estimate. That helps managers distinguish a change in the mix of jobs from a change in the way tests run.",
      },
      {
        title: "Check the agreed scope before making changes",
        body: "ISO/IEC 17025 describes the competence requirements for testing and calibration labs. EudraLex Volume 4 also addresses outsourced activities in applicable GMP settings. Check relevant method commitments, notification requirements and approvals with the lab quality and contract owners.",
      },
      {
        title: "Track delivery and technical quality",
        body: "Compare accepted output, repeats, on-time delivery and resource use per reportable test. Agree how each record is attributed and how any trial result will be communicated to the affected customers.",
      },
    ],
    sources: [solutionSources.testingCompetence, solutionSources.goodManufacturingPractice],
  },
  research: {
    intro: "Make flexible research environments more efficient through shared assets, clearer sample storage and documented workflow changes.",
    sections: [
      {
        title: "Find shared equipment before adding capacity",
        body: "Check which teams use similar instruments, how often and for what work. Central booking, training and a shared record of availability can make an existing platform easier to use. UCL’s research facilities illustrate how shared equipment and technical expertise can be organised.",
      },
      {
        title: "Include sample handling and storage in project planning",
        body: "Assign responsibility for the samples a project creates, including required conditions and review dates. Use the workflow to identify routine purchases and recurring utility use. UCL LEAF provides practical actions for equipment management, procurement and waste.",
      },
      {
        title: "Capture the outcome after a trial",
        body: "Compare equipment usage, availability and cost per session over a representative period. Record any constraints from the research design. Share the result with the teams using the platform so they can decide whether to retain or extend the change.",
      },
    ],
    sources: [solutionSources.sharedEquipment, solutionSources.labEfficiency],
  },
  academic: {
    intro: "Use teaching and research cycles to plan purchases, share equipment and make waste handling consistent between laboratory groups.",
    sections: [
      {
        title: "Plan consumption around the teaching timetable",
        body: "Estimate consumables and reagents for scheduled sessions, then compare planned and actual use. Review stock on hand before ordering and assign owners for shared stores. Where the instructor and safety team approve, test alternative quantities or packaging against the learning objectives.",
      },
      {
        title: "Make the local procedure easy to find",
        body: "Use student induction and technician briefings to explain where shared equipment is booked and which waste streams the site accepts. The Irish EPA provides context on hazardous waste streams and management, while site procedures set out the day-to-day instructions for the lab.",
      },
      {
        title: "Compare term to term",
        body: "Use measures such as material purchased per class, equipment sessions and waste collected per term. Record student numbers and changes in practical work so the next teaching cycle starts with a useful baseline.",
      },
    ],
    sources: [solutionSources.labEfficiency, solutionSources.hazardousWaste, solutionSources.sharedEquipment],
  },
};
