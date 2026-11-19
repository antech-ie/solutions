const applicationDetailImages = (() => {
  const photo = (file, alt, author, source, properties = {}) => ({
    src: `./assets/${file}`,
    alt,
    author,
    source,
    ...properties,
  });
  const pexels = (file, alt, author, slug, position) => photo(
    `application-details/${file}.jpg`,
    alt,
    author,
    `https://www.pexels.com/photo/${slug}/`,
    { position },
  );
  const commons = (file, alt, author, filename, properties) => photo(
    `application-details/${file}.jpg`,
    alt,
    author,
    `https://commons.wikimedia.org/wiki/File:${filename}`,
    { illustrative: true, ...properties },
  );
  const shareAlike4 = {
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  };

  const instrumentReview = pexels(
    "instrument-review",
    "Gowned laboratory worker operating an instrument touchscreen",
    "Tima Miroshnichenko",
    "a-man-in-white-lab-gown-touching-a-computer-screen-9574477",
    "48% 51%",
  );
  const resultsReview = pexels(
    "results-review",
    "Three laboratory staff reviewing information together at a computer",
    "Mikhail Nilov",
    "team-of-scientists-working-together-8851457",
    "56% 48%",
  );
  const labTeam = pexels(
    "lab-team",
    "Gloved hands working with pipettes, beakers and tube racks",
    "Polina Tankilevitch",
    "scientists-in-laboratory-3735780",
    "50% 53%",
  );
  const inventoryShelves = pexels(
    "inventory-shelves",
    "Rows of cardboard cartons held on stockroom shelves",
    "ALHawraa",
    "warehouse-storage-with-stacked-cardboard-boxes-38195854",
    "50% 57%",
  );
  const glassware = pexels(
    "glassware",
    "Flasks and test tubes holding coloured liquids on a laboratory bench",
    "Ron Lach",
    "flasks-for-chemistry-and-test-tubes-10187143",
    "57% 48%",
  );
  const sampleInventory = pexels(
    "sample-inventory",
    "Gloved worker arranging capped sample tubes in a rack",
    "Andy Coffie",
    "laboratory-technician-organizing-test-tubes-33658644",
    "62% 51%",
  );
  const pipetteStation = pexels(
    "pipette-station",
    "Laboratory pipettes of different sizes stored together on a bench",
    "Thirdman",
    "close-up-of-equipment-in-a-laboratory-8940470",
    "54% 64%",
  );
  const resultsDiscussion = pexels(
    "results-discussion",
    "Two laboratory workers holding and discussing a printed record",
    "simon",
    "focused-scientists-talking-about-research-in-laboratory-1018568",
    "56% 48%",
  );
  const labBench = photo(
    "portfolio/lab-bench.jpg",
    "Laboratory workbenches with instruments and a sink",
    "Ludovic Delot",
    "https://www.pexels.com/photo/a-laboratory-with-a-sink-counter-and-bench-18471479/",
    { position: "52% 62%" },
  );
  const clipboard = photo(
    "portfolio/lab-operations.jpg",
    "Gloved scientist recording laboratory measurements on a clipboard",
    "Jahra Tasfia Reza",
    "https://www.pexels.com/photo/scientist-recording-data-on-clipboard-in-lab-39901214/",
    { position: "57% 52%" },
  );
  const coldStorage = photo(
    "portfolio/cold-storage.jpg",
    "Racks of capped sample tubes in a frosted laboratory freezer",
    "Scott Covington / USFWS",
    "https://commons.wikimedia.org/wiki/File:Whitney_Genetics_Lab_eDNA_Frozen_Samples_(22726332679).jpg",
    { position: "50% 61%", license: "Public domain" },
  );
  const pipetteTest = pexels(
    "pipette-test",
    "Gloved hands using a pipette to transfer liquid to a small vessel",
    "Jess Loiterton",
    "close-up-of-a-person-using-lab-equipment-9259943",
    "50% 53%",
  );
  const testPlate = pexels(
    "test-plate",
    "Laboratory worker transferring a sample to a test card with a pipette",
    "Tima Miroshnichenko",
    "a-person-putting-samples-on-white-paper-9574396",
    "55% 65%",
  );
  const vacuumPump = commons(
    "vacuum-pump",
    "KNF diaphragm vacuum pump and hose on a laboratory bench",
    "Cirosantilli2",
    "KNF_Laboport_series_laboratory_vacuum_pump.jpg",
    { ...shareAlike4, position: "50% 59%", label: "Illustrative photo of a KNF pump" },
  );
  const evaporatorControls = commons(
    "rotary-evaporator-controls",
    "Glass rotary evaporator next to a laboratory instrument control panel",
    "Waag Society",
    "Rotary_evaporator.jpg",
    {
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      position: "51% 58%",
    },
  );
  const vacuumFiltration = commons(
    "vacuum-filtration",
    "Laboratory filtration flask connected by a red hose to a water aspirator at the sink",
    "Freundchen",
    "Filtrationseinrichtung1.jpg",
    {
      license: "CC BY 2.5",
      licenseUrl: "https://creativecommons.org/licenses/by/2.5/",
      position: "52% 60%",
    },
  );
  const autoclaveLoad = commons(
    "autoclave-load",
    "Foil-covered laboratory glassware on a bench for steam sterilisation",
    "Luis Fernando Flores LAB",
    "Autoclave_sterilization.jpg",
    { ...shareAlike4, position: "54% 58%" },
  );
  const autoclaveChamber = commons(
    "autoclave-chamber",
    "Wheel and locking mechanism on a laboratory autoclave door",
    "Diane A. Reid / National Cancer Institute",
    "Autoclave_door.jpg",
    { license: "Public domain", position: "49% 55%" },
  );
  const autoclaveUnits = commons(
    "autoclave-units",
    "Multiple large autoclaves installed side by side for laboratory equipment sterilisation",
    "Jeffrey M. Vinocur",
    "Large_autoclaves.JPG",
    {
      license: "CC BY 2.5",
      licenseUrl: "https://creativecommons.org/licenses/by/2.5/",
      position: "51% 52%",
    },
  );
  const freezerFrost = commons(
    "ultralow-freezer",
    "Heavy frost on shelving inside an ultra-low temperature laboratory freezer",
    "Ajay Kumar Chaurasiya",
    "Deep_Freezer.jpg",
    { ...shareAlike4, position: "40% 54%" },
  );
  const researchFreezer = commons(
    "research-freezer",
    "Upright freezer for research specimen storage at the American Museum of Natural History",
    "Jim Griffin",
    "Refrigerator_at_-79C_for_Current_Research_-_Flickr_-_JFGryphon.jpg",
    {
      license: "CC0 1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      position: "50% 48%",
    },
  );
  const resolveInstallation = photo(
    "resolve-installed.jpg",
    "ReSolve mounted beside an HPLC instrument",
    "Antech",
    "https://antech.ie/resolve-hplc-solvent-recycler/",
    { position: "55% 39%", illustrative: false },
  );

  return {
    solutions: [labTeam, resultsDiscussion],
    examples: [glassware, labTeam],
    catalog: [labBench, pipetteStation],
    reporting: [resultsReview, instrumentReview, clipboard, resultsDiscussion],
    "resource-efficiency": [labBench, instrumentReview, labTeam],
    operations: [instrumentReview, sampleInventory, resultsDiscussion],
    "site-management": [labBench, inventoryShelves, instrumentReview],
    procurement: [inventoryShelves, resultsDiscussion, pipetteStation],
    "example-act": [inventoryShelves, resultsDiscussion, pipetteStation],
    "example-tipnovus": [
      catalogueCardImages["example-tipnovus"],
      pipetteStation,
      solutionCardImages.plastics,
      testPlate,
      clipboard,
    ],
    "example-biobased": [
      catalogueCardImages["example-biobased"],
      pipetteTest,
      solutionCardImages.plastics,
      resultsDiscussion,
      inventoryShelves,
    ],
    "example-vacuum": [
      catalogueCardImages["example-vacuum"],
      vacuumPump,
      evaporatorControls,
      solutionCardImages["resource-efficiency"],
      vacuumFiltration,
    ],
    "example-autoclave": [
      catalogueCardImages["example-autoclave"],
      autoclaveLoad,
      autoclaveChamber,
      autoclaveUnits,
      clipboard,
    ],
    "example-coldstorage": [
      coldStorage,
      sampleInventory,
      freezerFrost,
      researchFreezer,
      clipboard,
    ],
    consumables: [pipetteStation, sampleInventory, labTeam],
    "resource-technologies": [labBench, instrumentReview, glassware],
    "solvent-recovery": [resolveInstallation, glassware, clipboard],
    manufacturers: [labBench, inventoryShelves, resultsDiscussion],
    "example-findenser": [solutionCardImages["resource-efficiency"], glassware, clipboard],
    "example-freezer": [researchFreezer, sampleInventory, instrumentReview],
    "example-refills": [pipetteStation, labTeam, sampleInventory],
  };
})();
