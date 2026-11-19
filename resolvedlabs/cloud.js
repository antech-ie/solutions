(() => {
  "use strict";

  const dayMs = 86_400_000;
  const snapshot = Date.UTC(2026, 10, 15);
  const pageSize = 8;
  const recentDays = 7;
  const reviewThreshold = 0.03;
  const sites = [
    { key: "south", name: "South Campus", location: "Ireland · Central QC", count: 5, rate: 0.855 },
    { key: "west", name: "West Campus", location: "Ireland · Operations QC", count: 5, rate: 0.827 },
    { key: "midlands", name: "Midlands Lab", location: "Ireland · Quality Control", count: 4, rate: 0.791 },
    { key: "north", name: "North Campus", location: "Ireland · Analytical Services", count: 4, rate: 0.812 }
  ];
  const instruments = sites.flatMap((site) =>
    Array.from({ length: site.count }, (_, index) => ({
      id: site.key + "-" + (index + 1),
      name: "HPLC " + String(index + 1).padStart(2, "0"),
      site,
      index,
      gap: (site.key === "west" && index === 3) || (site.key === "north" && index === 2)
    }))
  );

  const dateFormat = new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", timeZone: "UTC" });
  const fullDate = new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const litres = new Intl.NumberFormat("en-IE", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const whole = new Intl.NumberFormat("en-IE", { maximumFractionDigits: 0 });
  const percent = new Intl.NumberFormat("en-IE", { style: "percent", maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const number = new Intl.NumberFormat("en-IE", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const $ = (id) => document.getElementById(id);
  const dateOn = (daysAgo) => snapshot - daysAgo * dayMs;
  const volume = (millilitres) => litres.format(millilitres / 1000) + " L";
  const date = (daysAgo) => dateFormat.format(dateOn(daysAgo));
  const isoDate = (daysAgo) => new Date(dateOn(daysAgo)).toISOString().slice(0, 10);
  const siteSelect = $("site");
  const instrumentSelect = $("instrument");
  const periodSelect = $("period");
  let page = 0;
  let selectedRecords = [];
  let runById = new Map();
  let activeBar = null;

  function createDemoRecords() {
    const result = [];
    for (let age = 0; age < 360; age++) {
      const weekday = new Date(dateOn(age)).getUTCDay();
      if (weekday === 0 || weekday === 6) continue;
      for (const [order, instrument] of instruments.entries()) {
        if (instrument.gap && age < 13) continue;
        for (let sequence = 1; sequence <= 2; sequence++) {
          const seed = (age * 17 + order * 23 + sequence * 11) % 43;
          const injections = 23 + seed;
          const processed = injections * (14 + (seed % 11)) + 95;
          const trend = Math.cos((age + order) / 18) * 0.012;
          const drop = instrument.site.key === "midlands" && age < 100 ? 0.066 : 0;
          const rate = instrument.site.rate + (instrument.index - 1) * 0.009 + (seed % 15 - 7) * 0.003 + trend - drop;
          const recovered = Math.round(processed * rate);
          const code = isoDate(age).slice(2).replaceAll("-", "");
          result.push({
            id: "RS-" + code + "-" + String(order + 1).padStart(2, "0") + sequence,
            age,
            instrument,
            sequence,
            injections,
            processed,
            recovered,
            waste: processed - recovered
          });
        }
      }
    }
    return result;
  }

  const allRecords = createDemoRecords();

  function totals(records) {
    const sum = { processed: 0, recovered: 0, waste: 0, rate: null };
    for (const record of records) {
      sum.processed += record.processed;
      sum.recovered += record.recovered;
      sum.waste += record.waste;
    }
    if (sum.processed > 0) sum.rate = sum.recovered / sum.processed;
    return sum;
  }

  function reporting(records, from = 0) {
    return new Set(records.filter((row) => row.age < from + recentDays).map((row) => row.instrument.id));
  }

  function recordWindow(start, end, scope) {
    const keys = new Set(scope.map((instrument) => instrument.id));
    return allRecords.filter((row) => row.age >= start && row.age < end && keys.has(row.instrument.id));
  }

  function installOptions() {
    for (const site of sites) siteSelect.add(new Option(site.name, site.key));
    installInstrumentOptions();
  }

  function installInstrumentOptions(value = "") {
    instrumentSelect.replaceChildren(new Option("All instruments", ""));
    const selectedSite = siteSelect.value;
    for (const instrument of instruments) {
      if (selectedSite && instrument.site.key !== selectedSite) continue;
      const label = selectedSite ? instrument.name : instrument.site.name + " · " + instrument.name;
      instrumentSelect.add(new Option(label, instrument.id));
    }
    instrumentSelect.value = value;
  }

  function selection() {
    return {
      length: Number(periodSelect.value),
      site: sites.find((site) => site.key === siteSelect.value),
      instrument: instruments.find((instrument) => instrument.id === instrumentSelect.value)
    };
  }

  function compareValue(current, prior) {
    if (!prior) return "Prior period unavailable";
    const movement = ((current - prior) / prior) * 100;
    const sign = movement > 0 ? "+" : movement < 0 ? "−" : "";
    return sign + number.format(Math.abs(movement)) + "% vs prior period";
  }

  function pointDifference(rate, priorRate) {
    if (rate === null || priorRate === null) return null;
    return (rate - priorRate) * 100;
  }

  function renderMetrics(current, prior, activeCount, scopeLength, count) {
    const points = pointDifference(current.rate, prior.rate);
    const rateChange = points === null
      ? "Prior period unavailable"
      : (points > 0 ? "+" : points < 0 ? "−" : "") + number.format(Math.abs(points)) + " pp vs prior period";
    const cards = [
      ["Solvent recovered", litres.format(current.recovered / 1000) + " <small>L</small>", compareValue(current.recovered, prior.recovered)],
      ["Recovery rate", current.rate === null ? "—" : percent.format(current.rate), rateChange],
      ["Liquid routed to waste", litres.format(current.waste / 1000) + " <small>L</small>", compareValue(current.waste, prior.waste)],
      ["Reporting instruments", activeCount + "<small> / " + scopeLength + "</small>", "With a record in the latest seven days"]
    ];
    $("metrics").innerHTML = cards.map(([name, value, detail]) =>
      '<article class="metric"><div class="metric-name">' + name + "</div><strong>" +
      value + "</strong><p>" + detail + "</p></article>"
    ).join("");
    $("selection-status").textContent = whole.format(count) + " sequences in scope. " + volume(current.recovered) + " recovered.";
  }

  function renderChart(rows, days) {
    const count = days === 30 ? 5 : 6;
    const interval = days / count;
    const buckets = Array.from({ length: count }, (_, index) => {
      const youngest = days - (index + 1) * interval;
      const oldest = youngest + interval - 1;
      const balance = totals(rows.filter((row) => row.age >= youngest && row.age <= oldest));
      return {
        label: date(oldest),
        labelLong: date(oldest) + " – " + date(youngest),
        returned: balance.recovered,
        waste: balance.waste,
        total: balance.processed
      };
    });
    const maximum = Math.max(...buckets.map((bucket) => bucket.total));
    const scale = maximum < 20_000 ? 4000 : maximum < 120_000 ? 20_000 : 40_000;
    const ceiling = Math.max(scale, Math.ceil(maximum / scale) * scale);
    const axis = Array.from({ length: 5 }, (_, index) =>
      "<span>" + whole.format((ceiling / 1000) * (1 - index / 4)) + (index === 0 ? " L" : "") + "</span>"
    ).join("");
    const chart = $("chart");
    activeBar = null;
    $("chart-summary").textContent = "Focus or select a bar to see its volume.";
    chart.innerHTML =
      '<div class="chart-grid"><div class="chart-axis" aria-hidden="true">' + axis + "</div>" +
      '<div class="chart-plot" style="--buckets:' + count + '">' + buckets.map((bucket, index) => {
        const accessible = bucket.labelLong + ", " + volume(bucket.returned) + " returned and " + volume(bucket.waste) + " to waste";
        return '<button class="chart-bar" type="button" aria-pressed="false" data-bar="' + index +
          '" aria-label="' + accessible + '"><span class="plot-bar" aria-hidden="true">' +
          '<span class="segment waste-key" style="--height:' + bucket.waste / ceiling * 100 + '%"></span>' +
          '<span class="segment return-key" style="--height:' + bucket.returned / ceiling * 100 + '%"></span></span>' +
          '<span class="plot-label" aria-hidden="true">' + bucket.label + "</span></button>";
      }).join("") + "</div></div>";

    function describe(index) {
      const bucket = buckets[index];
      $("chart-summary").textContent = bucket.labelLong + " · " + volume(bucket.returned) + " returned · " + volume(bucket.waste) + " to waste";
    }

    for (const button of chart.querySelectorAll("[data-bar]")) {
      button.addEventListener("focus", () => describe(Number(button.dataset.bar)));
      button.addEventListener("mouseenter", () => describe(Number(button.dataset.bar)));
      button.addEventListener("click", () => {
        if (activeBar) activeBar.setAttribute("aria-pressed", "false");
        activeBar = button;
        activeBar.setAttribute("aria-pressed", "true");
        describe(Number(activeBar.dataset.bar));
      });
    }
  }

  function renderReview(scope, current, prior, active, selectedInstrument) {
    const issues = [];
    for (const instrument of scope) {
      if (active.has(instrument.id)) continue;
      const last = allRecords.find((record) => record.instrument === instrument);
      const lastSeen = last ? "Last reported " + date(last.age) + "." : "No records received.";
      issues.push({
        key: instrument.id,
        site: instrument.site.key,
        warn: true,
        title: instrument.name + " reporting gap",
        detail: instrument.site.name + " · " + lastSeen
      });
    }
    for (const site of new Set(scope.map((instrument) => instrument.site))) {
      const siteWindow = (records) => records.filter((record) => record.instrument.site === site);
      const points = pointDifference(totals(siteWindow(current)).rate, totals(siteWindow(prior)).rate);
      if (points === null || points > -reviewThreshold * 100) continue;
      issues.push({
        key: selectedInstrument?.id || "",
        site: site.key,
        warn: false,
        title: (selectedInstrument ? selectedInstrument.name : site.name) + " recovery fell",
        detail: (selectedInstrument ? site.name + " · " : "") +
          "Down " + number.format(Math.abs(points)) + " pp versus the prior period. Review run mix and operating conditions."
      });
    }
    $("issue-count").textContent = String(issues.length);
    $("issue-count").hidden = issues.length === 0;
    $("insights").innerHTML = issues.length ? issues.map((issue) =>
      '<button class="insight ' + (issue.warn ? "warn" : "") + '" type="button" data-drill-site="' + issue.site +
      '" data-drill-instrument="' + issue.key + '"><strong>' + issue.title + "</strong><span>" + issue.detail + "</span></button>"
    ).join("") : '<p class="empty">No reporting gaps or recovery declines above the demo threshold in this selection.</p>';
  }

  function renderComparison(chosen, current, active) {
    const scope = chosen.site
      ? instruments.filter((instrument) => instrument.site === chosen.site).map((instrument) => ({
          key: instrument.id,
          siteKey: instrument.site.key,
          label: instrument.name,
          note: instrument.site.name,
          instruments: [instrument]
        }))
      : sites.map((site) => ({
          key: "",
          siteKey: site.key,
          label: site.name,
          note: site.location,
          instruments: instruments.filter((instrument) => instrument.site === site)
        }));
    const rows = chosen.instrument ? scope.filter((row) => row.siteKey === chosen.instrument.site.key && (!row.key || row.key === chosen.instrument.id)) : scope;
    const byInstrument = Boolean(chosen.site);
    $("comparison-heading").textContent = byInstrument ? chosen.site.name + " instruments" : "Site comparison";
    $("comparison-note").textContent = byInstrument ? "Select an instrument to inspect its run records." : "Select a site to inspect its instruments.";
    $("compare-first").textContent = byInstrument ? "Instrument" : "Site";
    $("comparison-rows").innerHTML = rows.map((row) => {
      const balance = totals(current.filter((record) => row.instruments.includes(record.instrument)));
      const online = row.instruments.filter((instrument) => active.has(instrument.id)).length;
      const rate = balance.rate === null ? "—" : percent.format(balance.rate);
      const meter = balance.rate === null ? "" : '<progress class="rate-meter" max="100" value="' + (balance.rate * 100) + '" aria-hidden="true"></progress>';
      const status = byInstrument ? online ? "Reporting" : "Gap" : online + " / " + row.instruments.length;
      return '<tr><th scope="row"><button class="row-button" type="button" data-drill-site="' + row.siteKey +
        '" data-drill-instrument="' + row.key + '">' + row.label + "</button><small>" + row.note +
        "</small></th><td>" + volume(balance.recovered) + '</td><td><span class="rate-cell">' + rate + meter +
        "</span></td><td>" + volume(balance.waste) + '</td><td class="' + (online < row.instruments.length ? "reporting-gap" : "") +
        '">' + status + "</td></tr>";
    }).join("");
  }

  function renderRecords() {
    const total = selectedRecords.length;
    const start = page * pageSize;
    const shown = selectedRecords.slice(start, start + pageSize);
    runById = new Map(shown.map((record) => [record.id, record]));
    $("record-description").textContent = whole.format(total) + " synthetic sequences match these filters. Select a sequence to inspect its volume balance.";
    $("record-rows").innerHTML = total ? shown.map((row) =>
      '<tr><th scope="row"><button class="row-button" type="button" data-run="' + row.id + '">' + row.id +
      "</button><small>" + fullDate.format(dateOn(row.age)) + "</small></th><td>" + row.instrument.site.name +
      "<small>" + row.instrument.name + "</small></td><td>" + row.injections + "</td><td>" + volume(row.processed) +
      "</td><td>" + volume(row.recovered) + "</td><td>" + volume(row.waste) + "</td></tr>"
    ).join("") : '<tr><td colspan="6">No sequence records for this selection.</td></tr>';
    $("pager").hidden = total <= pageSize;
    $("record-range").textContent = whole.format(start + 1) + "–" + whole.format(Math.min(start + pageSize, total)) + " of " + whole.format(total);
    $("prev").disabled = page === 0;
    $("next").disabled = start + pageSize >= total;
    $("export").disabled = total === 0;
  }

  function update() {
    const chosen = selection();
    const scope = chosen.instrument ? [chosen.instrument] : instruments.filter((instrument) => !chosen.site || instrument.site === chosen.site);
    const current = recordWindow(0, chosen.length, scope);
    const prior = recordWindow(chosen.length, chosen.length * 2, scope);
    const active = reporting(current);
    selectedRecords = current;
    page = 0;
    $("date-range").textContent = date(chosen.length - 1) + " – " + fullDate.format(snapshot);
    $("reset").hidden = !chosen.site && !chosen.instrument && chosen.length === 90;
    renderMetrics(totals(current), totals(prior), active.size, scope.length, current.length);
    renderChart(current, chosen.length);
    renderReview(scope, current, prior, active, chosen.instrument);
    renderComparison(chosen, current, active);
    renderRecords();
  }

  function openRun(row) {
    if (!row) return;
    $("run-heading").textContent = row.id;
    const boxes = [
      ["Processed", row.processed], ["Returned", row.recovered], ["To waste", row.waste]
    ];
    $("run-details").innerHTML = "<dl><dt>Instrument</dt><dd>" + row.instrument.site.name + " · " + row.instrument.name +
      "</dd><dt>Run date</dt><dd>" + fullDate.format(dateOn(row.age)) + "</dd><dt>Injections</dt><dd>" +
      row.injections + "</dd><dt>Recovery rate</dt><dd>" + percent.format(row.recovered / row.processed) +
      '</dd></dl><div class="run-boxes">' + boxes.map(([label, millilitres]) =>
        "<div><span>" + label + "</span><strong>" + whole.format(millilitres) + " mL</strong></div>"
      ).join("") + '</div><p class="dialog-note">Demo record. Volumes shown here use the original millilitre precision.</p>';
    $("run").showModal();
  }

  function exportRecords() {
    const header = ["data_status", "sequence_id", "date_utc", "site", "instrument", "injections",
      "processed_ml", "recovered_ml", "waste_ml", "recovery_rate_percent"];
    const rows = selectedRecords.map((row) => [
      "synthetic", row.id, isoDate(row.age), row.instrument.site.name, row.instrument.name, row.injections,
      row.processed, row.recovered, row.waste, (100 * row.recovered / row.processed).toFixed(2)
    ]);
    const csv = [header, ...rows].map((line) => line.map((value) =>
      '"' + String(value).replaceAll('"', '""') + '"'
    ).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "resolve-cloud-demo-" + isoDate(0) + ".csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function drill(siteKey, instrumentKey) {
    siteSelect.value = siteKey;
    installInstrumentOptions(instrumentKey);
    update();
    const target = $(instrumentKey ? "records-heading" : "comparison-heading");
    target.tabIndex = -1;
    target.focus();
  }

  $("snapshot-date").textContent = "Demo snapshot · " + fullDate.format(snapshot);
  installOptions();
  update();
  siteSelect.addEventListener("change", () => {
    installInstrumentOptions();
    update();
  });
  instrumentSelect.addEventListener("change", () => {
    const instrument = instruments.find((item) => item.id === instrumentSelect.value);
    if (instrument && !siteSelect.value) {
      siteSelect.value = instrument.site.key;
      installInstrumentOptions(instrument.id);
    }
    update();
  });
  periodSelect.addEventListener("change", update);
  $("reset").addEventListener("click", () => {
    siteSelect.value = "";
    periodSelect.value = "90";
    installInstrumentOptions();
    update();
    siteSelect.focus();
  });
  $("definitions-open").addEventListener("click", () => $("definitions").showModal());
  $("export").addEventListener("click", exportRecords);
  $("prev").addEventListener("click", () => {
    page--;
    renderRecords();
    if ($("prev").disabled) $("next").focus();
  });
  $("next").addEventListener("click", () => {
    page++;
    renderRecords();
    if ($("next").disabled) $("prev").focus();
  });
  document.addEventListener("click", (event) => {
    const drillButton = event.target.closest("[data-drill-site]");
    const runButton = event.target.closest("[data-run]");
    if (drillButton) drill(drillButton.dataset.drillSite, drillButton.dataset.drillInstrument);
    if (runButton) openRun(runById.get(runButton.dataset.run));
  });
})();
