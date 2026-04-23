const form = document.getElementById("calculator-form");
let latestResult = null;
let sessionSaveTimer = null;
const fillExampleButton = document.getElementById("fillExample");
const clearFormButton = document.getElementById("clearForm");
const fillCompareExamplesButton = document.getElementById("fillCompareExamples");
const clearCompareButton = document.getElementById("clearCompare");
const headlineStats = document.getElementById("headlineStats");
const summaryCards = document.getElementById("summaryCards");
const comparisonBox = document.getElementById("comparisonBox");
const cashflowBody = document.getElementById("cashflowBody");
const offerCompareSummary = document.getElementById("offerCompareSummary");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const fields = Array.from(form.querySelectorAll("input[data-default], select[data-default]"));
const compareFields = Array.from(document.querySelectorAll("#offerCompare input[data-default], #offerCompare select"));

const KREDI_ORAN_TABLOSU = [
  { min: 0, max: 5000000, enerji: "A-B", evYok: 0.9, evVar: 0.225 },
  { min: 0, max: 5000000, enerji: "C", evYok: 0.8, evVar: 0.2 },
  { min: 0, max: 5000000, enerji: "Diger", evYok: 0.7, evVar: 0.175 },
  { min: 5000000, max: 7000000, enerji: "A-B", evYok: 0.8, evVar: 0.2 },
  { min: 5000000, max: 7000000, enerji: "C", evYok: 0.7, evVar: 0.175 },
  { min: 5000000, max: 7000000, enerji: "Diger", evYok: 0.6, evVar: 0.15 },
  { min: 7000000, max: 10000000, enerji: "A-B", evYok: 0.7, evVar: 0.175 },
  { min: 7000000, max: 10000000, enerji: "C", evYok: 0.6, evVar: 0.15 },
  { min: 7000000, max: 10000000, enerji: "Diger", evYok: 0.5, evVar: 0.125 },
  { min: 10000000, max: 20000000, enerji: "A-B", evYok: 0.5, evVar: 0.125 },
  { min: 10000000, max: 20000000, enerji: "C", evYok: 0.4, evVar: 0.1 },
  { min: 10000000, max: 20000000, enerji: "Diger", evYok: 0.3, evVar: 0.075 },
  { min: 20000000, max: Infinity, enerji: "A-B", evYok: 0.4, evVar: 0.1 },
  { min: 20000000, max: Infinity, enerji: "C", evYok: 0.3, evVar: 0.075 },
  { min: 20000000, max: Infinity, enerji: "Diger", evYok: 0.2, evVar: 0.05 },
];

const DEFAULT_GOAL_SEEK_YIL = 5;
const DEFAULT_BANKA_FAIZ = 0.0284;
const DEFAULT_TAKSIT_VADE = 20;
const DEFAULT_MAX_VADE = 120;
const DEFAULT_TAKSIT_ORG_FEE_RATE = 7;
// Quick revert flag: restore initial Excel-baseline values for testing
const EXCEL_BASELINE_MODE = true;

function loadExcelBaseline() {
  const baseline = {
    assetType: 'konut',
    planModel: 'cekilissiz',
    company: 'Diğer',
    assetPrice: 5000000,
    downPayment: 0,
    installmentCount: 90,
    monthlyPayment: 55556,
    organizationFeeRate: 8,
    monthlyRent: 25000,
    annualInflation: 32,
    discountRate: 28,
    deliveryMonth: 12,
    loanRate: 3.19,
    useGraduatedPlan: false,
    graduatedIncreaseRate: 15,
  };
  document.getElementById('assetType').value = baseline.assetType;
  document.getElementById('planModel').value = baseline.planModel;
  document.getElementById('company').value = baseline.company;
  document.getElementById('assetPrice').value = formatFieldValue(baseline.assetPrice, 'grouped-int');
  document.getElementById('downPayment').value = formatFieldValue(baseline.downPayment, 'grouped-int');
  document.getElementById('installmentCount').value = formatFieldValue(baseline.installmentCount, 'grouped-int');
  document.getElementById('monthlyPayment').value = formatFieldValue(baseline.monthlyPayment, 'grouped-int');
  document.getElementById('organizationFeeRate').value = formatFieldValue(baseline.organizationFeeRate, 'decimal-dot');
  document.getElementById('monthlyRent').value = formatFieldValue(baseline.monthlyRent, 'grouped-int');
  document.getElementById('annualInflation').value = formatFieldValue(baseline.annualInflation, 'decimal-dot');
  document.getElementById('discountRate').value = formatFieldValue(baseline.discountRate, 'decimal-dot');
  document.getElementById('deliveryMonth').value = formatFieldValue(baseline.deliveryMonth, 'grouped-int');
  document.getElementById('loanRate').value = formatFieldValue(baseline.loanRate, 'decimal-dot');
  document.getElementById('useGraduatedPlan').checked = baseline.useGraduatedPlan;
  document.getElementById('graduatedIncreaseRate').value = formatFieldValue(baseline.graduatedIncreaseRate, 'decimal-dot');
  updateView();
}

const formatCurrency = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);

const groupedIntFormatter = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const formatPercent = (value) => `%${value.toFixed(1)}`;

function getEkspertizAralik(deger) {
  if (deger <= 5000000) return "DEGER<=5 milyon TL";
  if (deger <= 7000000) return "5M<TDEGER<=7M";
  if (deger <= 10000000) return "7M<TDEGER<=10M";
  if (deger <= 20000000) return "10M<TDEGER<=20M";
  return "DEGER>20M";
}

function hesaplaKrediOrani(ekspertizDegeri, enerjiSinifi, baskaEviVar) {
  const row = KREDI_ORAN_TABLOSU.find(
    (r) => ekspertizDegeri > r.min && ekspertizDegeri <= r.max && r.enerji === enerjiSinifi
  );
  if (!row) return 0.9;
  return baskaEviVar ? row.evVar : row.evYok;
}

function hesaplaAzamiKredi(ekspertizDegeri, krediOrani) {
  return Math.round(ekspertizDegeri * krediOrani);
}

function calculateNPV(
  downPayment,
  monthlyPayment,
  monthlyRent,
  deliveryMonth,
  installmentCount,
  discountRateMonthly,
  organizationFee = 0,
  graduated = false,
  graduatedRate = 15
) {
  let npv = downPayment + organizationFee;
  for (let m = 1; m <= installmentCount; m++) {
    const inst = graduated
      ? monthlyPayment * Math.pow(1 + graduatedRate / 100, Math.floor((m - 1) / 12))
      : monthlyPayment;
    const rent = m >= deliveryMonth ? 0 : monthlyRent * Math.pow(1 + 0.32, Math.floor((m - 1) / 12));
    npv += (inst + rent) / Math.pow(1 + discountRateMonthly, m);
  }
  return npv;
}

function goalSeekOptimalPesinat(
  targetNPV,
  assetPrice,
  monthlyPayment,
  monthlyRent,
  deliveryMonth,
  installmentCount,
  discountRateMonthly,
  organizationFee,
  loanRate,
  tfOrgFeeRate
) {
  let low = 0;
  let high = assetPrice;
  let iterations = 0;
  const maxIter = 50;
  let optimalDown = 0;

  while (iterations < maxIter) {
    const mid = (low + high) / 2;
    const krediTutar = Math.max(0, assetPrice - mid);
    const taksit = loanRate > 0 ? (krediTutar * loanRate * Math.pow(1 + loanRate, installmentCount)) / (Math.pow(1 + loanRate, installmentCount) - 1) : krediTutar / installmentCount;
    const npv = calculateNPV(mid, taksit, monthlyRent, deliveryMonth, installmentCount, discountRateMonthly, organizationFee);
    if (Math.abs(npv - targetNPV) < 100) {
      optimalDown = mid;
      break;
    }
    if (npv > targetNPV) {
      high = mid;
    } else {
      low = mid;
    }
    iterations++;
    optimalDown = mid;
  }

  return Math.round(optimalDown);
}

function buildSenaryoA(
  assetPrice,
  pesinatOran,
  pesinatTutar,
  vadeAy,
  aylikFaiz,
  aylikIskonto,
  teslimatAy,
  kira,
  ekMaliyet
) {
  const dp = pesinatTutar || assetPrice * pesinatOran;
  const krediTutar = assetPrice - dp;
  const aylikTaksit = aylikFaiz > 0
    ? (krediTutar * aylikFaiz * Math.pow(1 + aylikFaiz, vadeAy)) / (Math.pow(1 + aylikFaiz, vadeAy) - 1)
    : krediTutar / vadeAy;
  const toplamGeri = dp + aylikTaksit * vadeAy;
  const toplamMaliyet = toplamGeri + (ekMaliyet || 0);
  const npv = calculateNPV(dp, aylikTaksit, kira, teslimatAy, vadeAy, aylikIskonto);

  return {
    senaryo: "A",
    tur: "Banka Kredisi",
    assetPrice,
    pesinatTutar: dp,
    pesinatOran: dp / assetPrice,
    krediTutar,
    vadeAy,
    aylikTaksit,
    toplamGeriOdeme: toplamGeri,
    toplamMaliyet,
    npv,
    teslimatAy: 0,
  };
}

function buildSenaryoB(
  assetPrice,
  pesinatTutar,
  vadeAy,
  teslimatAy,
  aylikTaksit,
  orgFeeOrani,
  kira
) {
  const orgFee = assetPrice * (orgFeeOrani / 100);
  const baslangicToplam = pesinatTutar + orgFee;
  const toplamGeri = pesinatTutar + aylikTaksit * vadeAy;
  const toplamMaliyet = toplamGeri;
  const npv = calculateNPV(pesinatTutar, aylikTaksit, kira, teslimatAy, vadeAy, 0.0236, orgFee);

  return {
    senaryo: "B",
    tur: "Evim Sistemleri",
    assetPrice,
    pesinatTutar,
    pesinatOran: pesinatTutar / assetPrice,
    krediTutar: 0,
    vadeAy,
    aylikTaksit,
    toplamGeriOdeme: toplamGeri,
    toplamMaliyet,
    npv,
    teslimatAy,
    orgFee,
  };
}

function parseGroupedInt(value) {
  if (typeof value !== "string") {
    return Number(value) || 0;
  }

  return Number(value.trim().replace(/\./g, "")) || 0;
}

function parseDecimalDot(value) {
  if (typeof value !== "string") {
    return Number(value) || 0;
  }

  return Number(value.trim()) || 0;
}

function parseFieldValue(field) {
  if (!field) return 0;
  const rawValue = field.value.trim();
  const fallback = field.dataset.default ?? "";

  if (field.tagName === "SELECT") {
    return field.value;
  }

  if (rawValue === "") {
    return field.dataset.format === "decimal-dot" ? parseDecimalDot(fallback) : parseGroupedInt(fallback);
  }

  if (field.dataset.format === "decimal-dot") {
    return parseDecimalDot(rawValue);
  }

  return parseGroupedInt(rawValue);
}

function formatFieldValue(value, format) {
  const numericValue = Number(value) || 0;

  if (format === "grouped-int") {
    return groupedIntFormatter.format(Math.round(numericValue));
  }

  if (format === "decimal-dot") {
    return Number.isInteger(numericValue) ? numericValue.toFixed(1) : String(numericValue);
  }

  return String(value);
}

function syncVisualState(field) {
  field.classList.toggle("is-default", field.value.trim() === "");
}

function setupFields() {
  fields.forEach((field) => {
    syncVisualState(field);

    if (field.tagName === "SELECT") {
      field.addEventListener("change", updateView);
      return;
    }

    field.addEventListener("focus", () => {
      if (field.dataset.format === "grouped-int" && field.value.trim() !== "") {
        field.value = String(parseGroupedInt(field.value));
      }
    });

    field.addEventListener("input", () => {
      syncVisualState(field);
      updateView();
    });

    field.addEventListener("blur", () => {
      if (field.value.trim() !== "") {
        field.value = formatFieldValue(parseFieldValue(field), field.dataset.format);
      }
      syncVisualState(field);
      updateView();
    });
  });

  compareFields.forEach((field) => {
    if (field.tagName === "SELECT") {
      field.addEventListener("change", updateView);
      return;
    }

    syncVisualState(field);

    field.addEventListener("focus", () => {
      if (field.dataset.format === "grouped-int" && field.value.trim() !== "") {
        field.value = String(parseGroupedInt(field.value));
      }
    });

    field.addEventListener("input", () => {
      syncVisualState(field);
      updateView();
    });

    field.addEventListener("blur", () => {
      if (field.value.trim() !== "") {
        field.value = formatFieldValue(parseFieldValue(field), field.dataset.format);
      }
      syncVisualState(field);
      updateView();
    });
  });
}

function flashTarget(target) {
  target.classList.remove("target-flash");
  void target.offsetWidth;
  target.classList.add("target-flash");

  window.setTimeout(() => {
    target.classList.remove("target-flash");
  }, 1900);
}

function setActiveNav(link) {
  navLinks.forEach((item) => item.classList.toggle("is-active", item === link));
}

function setupNavigationFocus() {
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) {
        return;
      }

      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      setActiveNav(link);
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(() => {
        flashTarget(target);
      }, 260);
    });
  });
}

function clampDeliveryMonth(deliveryMonth, planModel, totalMonths, downPaymentRatio) {
  const earliestBySavings = Math.ceil(Math.max(1, (0.4 - downPaymentRatio) * totalMonths));
  const earliestByDuration = Math.ceil(Math.max(5, totalMonths * Math.max(0.15, 0.4 - downPaymentRatio)));
  const minimumMonth = planModel === "cekilissiz" ? Math.max(5, earliestBySavings, earliestByDuration) : 1;
  return Math.min(totalMonths, Math.max(minimumMonth, deliveryMonth));
}

function calculateGraduatedPayment(baseMonthlyPayment, month, useGraduatedPlan, graduatedIncreaseRate) {
  if (!useGraduatedPlan) {
    return baseMonthlyPayment;
  }

  const annualStep = Math.floor((month - 1) / 12);
  return baseMonthlyPayment * Math.pow(1 + graduatedIncreaseRate / 100, annualStep);
}

function calculateMonthlyRent(baseRent, annualInflation, month, deliveryMonth) {
  if (month >= deliveryMonth) {
    return 0;
  }

  const annualStep = Math.floor((month - 1) / 12);
  return baseRent * Math.pow(1 + annualInflation / 100, annualStep);
}

function calculateLoanInstallment(principal, monthlyRate, monthCount) {
  if (monthlyRate === 0) {
    return principal / monthCount;
  }

  const factor = Math.pow(1 + monthlyRate, monthCount);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function buildCashflow(inputs) {
  const downPaymentRatio = inputs.assetPrice === 0 ? 0 : inputs.downPayment / inputs.assetPrice;
  const deliveryMonth = clampDeliveryMonth(
    inputs.deliveryMonth,
    inputs.planModel,
    inputs.installmentCount,
    downPaymentRatio
  );
  const organizationFee = inputs.assetPrice * (inputs.organizationFeeRate / 100);
  const monthlyDiscountRate = Math.pow(1 + inputs.discountRate / 100, 1 / 12) - 1;

  let cumulativeOutflow = 0;
  let totalInstallments = 0;
  let totalRent = 0;
  let netPresentCost = inputs.downPayment + organizationFee;

  let cumulativeDiscountedOutflow = 0;
  const rows = Array.from({ length: inputs.installmentCount }, (_, index) => {
    const month = index + 1;
    const installment = calculateGraduatedPayment(
      inputs.monthlyPayment,
      month,
      inputs.useGraduatedPlan,
      inputs.graduatedIncreaseRate
    );
    const rent = calculateMonthlyRent(inputs.monthlyRent, inputs.annualInflation, month, deliveryMonth);
    const other = month === 1 ? organizationFee : 0;
    const totalOutflow = installment + rent + other;

    cumulativeOutflow += totalOutflow;
    totalInstallments += installment;
    totalRent += rent;
    const discountedOutflow = totalOutflow / Math.pow(1 + monthlyDiscountRate, month);
    cumulativeDiscountedOutflow += discountedOutflow;
    netPresentCost += discountedOutflow;

    return {
      month,
      installment,
      rent,
      other,
      totalOutflow,
      discountedOutflow,
      cumulativeOutflow,
      discountedCumulativeOutflow: cumulativeDiscountedOutflow,
    };
  });

  const totalNominalCost = inputs.downPayment + cumulativeOutflow;
  const principalForLoan = Math.max(0, inputs.assetPrice - inputs.downPayment);
  const loanInstallment = calculateLoanInstallment(
    principalForLoan,
    inputs.loanRate / 100,
    inputs.installmentCount
  );
  const totalLoanCost = inputs.downPayment + loanInstallment * inputs.installmentCount;

  return {
    rows,
    deliveryMonth,
    organizationFee,
    totalInstallments,
    totalRent,
    totalNominalCost,
    netPresentCost,
    principalForLoan,
    loanInstallment,
    totalLoanCost,
    discountRateMonthly: monthlyDiscountRate,
  };
}

function renderHeadline(result) {
  const cards = [
    ["Tahmini Teslim", `${result.deliveryMonth}. ay`],
    ["Net Bugünkü Maliyet", formatCurrency(result.netPresentCost)],
    ["Toplam Kira Etkisi", formatCurrency(result.totalRent)],
    ["Organizasyon Ücreti", formatCurrency(result.organizationFee)],
  ];

  headlineStats.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="headline-card">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `
    )
    .join("");
}

function renderSummary(result, inputs) {
  const cards = [
    ["Toplam Nominal Maliyet", formatCurrency(result.totalNominalCost)],
    ["Toplam Taksitler", formatCurrency(result.totalInstallments)],
    ["Aylık Başlangıç Taksidi", formatCurrency(inputs.monthlyPayment)],
    ["Peşinat Oranı", formatPercent((inputs.downPayment / inputs.assetPrice) * 100 || 0)],
  ];

  summaryCards.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="summary-card">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `
    )
    .join("");
}

function renderComparison(result) {
  const difference = result.totalNominalCost - result.totalLoanCost;
  const cheaperLabel =
    difference > 0
      ? "Bu senaryoda banka kredisi nominal olarak daha düşük görünüyor."
      : "Bu senaryoda tasarruf planı nominal olarak daha düşük görünüyor.";

  comparisonBox.innerHTML = `
    <div class="comparison-row">
      <span>Tasarruf planı toplam maliyet</span>
      <strong class="comparison-value">${formatCurrency(result.totalNominalCost)}</strong>
    </div>
    <div class="comparison-row">
      <span>Kredi aylık taksidi</span>
      <strong class="comparison-value">${formatCurrency(result.loanInstallment)}</strong>
    </div>
    <div class="comparison-row">
      <span>Kredi toplam geri ödeme</span>
      <strong class="comparison-value">${formatCurrency(result.totalLoanCost)}</strong>
    </div>
    <div class="comparison-row">
      <span>Aradaki fark</span>
      <strong class="comparison-value comparison-highlight">${formatCurrency(Math.abs(difference))}</strong>
    </div>
    <div class="comparison-row">
      <span>Yorum</span>
      <strong class="comparison-value">${cheaperLabel}</strong>
    </div>
  `;
}

function renderCashflow(rows) {
  cashflowBody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.month}</td>
          <td>${formatCurrency(row.installment)}</td>
          <td>${formatCurrency(row.rent)}</td>
          <td>${formatCurrency(row.other)}</td>
          <td>${formatCurrency(row.totalOutflow)}</td>
          <td>${formatCurrency(row.cumulativeOutflow)}</td>
        </tr>
      `
    )
    .join("");
}

function renderSparkline(container, data, color = '#1f8a70') {
  if (!container || !data || data.length === 0) return;
  // Normalize to 0..1 scale for width/height mapping
  const w = 300;
  const h = 80;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 2) + 1;
    const y = h - ((v - min) / span) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(" ");

  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="80" role="img" aria-label="Sparkline">
      <polyline fill="none" stroke="${color}" stroke-width="2" points="${points}" />
      <polyline fill="none" stroke="${color}" stroke-width="4" opacity="0.15" points="${points}" />
    </svg>
  `;
}

function renderLineChart(container, data, color) {
  if (!container) return;
  const w = 600;
  const h = 180;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 12;
  const padBottom = 20;
  const n = data.length || 1;
  const min = Math.min(...data, 0);
  const max = Math.max(...data, 1);
  const range = max - min || 1;
  const innerW = w - padLeft - padRight;
  const innerH = h - padTop - padBottom;
  const points = data.map((v, i) => {
    const x = padLeft + (i / (n - 1 || 1)) * innerW;
    const y = padTop + (1 - (v - min) / range) * innerH;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = [
    'M', padLeft, padTop,
    ...data.map((v, i) => {
      const x = padLeft + (i / (n - 1 || 1)) * innerW;
      const y = padTop + (1 - (v - min) / range) * innerH;
      return `${i === 0 ? 'L' : 'L'}${x},${y}`;
    }),
    `L${padLeft + innerW},${padTop + innerH}`,
    `L${padLeft},${padTop + innerH}`,
    'Z'
  ].join(' ');

  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}px" role="img" aria-label="Line chart" style="display:block;">
      <defs>
        <linearGradient id="gradLine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.5" />
          <stop offset="100%" stop-color="${color}" stop-opacity="0.05" />
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#gradLine)" opacity="0.25" />
      <polyline fill="none" stroke="${color}" stroke-width="2" points="${points}" />
      <g stroke="#2f2f2f" stroke-width="0.5" opacity="0.25">${Array.from({length:5}).map((_,i)=>{
        const y = padTop + i*(innerH/4);
        return `<line x1="${padLeft - 6}" y1="${y}" x2="${w - padRight}" y2="${y}"/>`; }).join('')}</g>
    </svg>
    <div class="chart-tooltip" id="tooltip" style="position:absolute; display:none; padding:6px 8px; background:#111; color:#fff; border-radius:6px; font-size:12px;"></div>
  `;

  const tooltip = document.getElementById('tooltip');
  const svg = container.querySelector('svg');
  const coords = data.map((val, idx) => {
    const x = padLeft + (idx / (n - 1 || 1)) * innerW;
    const y = padTop + (1 - (val - min) / range) * innerH;
    return { x, y, val, idx };
  });
  svg.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left;
    let closest = 0;
    let best = Infinity;
    coords.forEach((p) => {
      const d = Math.abs(p.x - px);
      if (d < best) { best = d; closest = p.idx; }
    });
    const c = coords[closest];
    if (!c) return;
    tooltip.style.display = 'block';
    tooltip.style.left = (rect.left + c.x) + 'px';
    tooltip.style.top = (rect.top + c.y - 10) + 'px';
    tooltip.textContent = `Ay ${closest + 1}: ${formatCurrency(c.val)}`;
  });
  svg.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
}

function renderVisuals(result) {
  const totalOutflow = result.rows.map((r) => r.totalOutflow);
  const discountedOutflow = result.rows.map((r) => r.discountedOutflow);
  const totalChart = document.getElementById("totalOutflowChart");
  const discountedChart = document.getElementById("discountedOutflowChart");
  renderLineChart(totalChart, totalOutflow, '#4f8bd6');
  renderLineChart(discountedChart, discountedOutflow, '#f59e0b');
}

function readOfferInputs(prefix) {
  return {
    company: document.getElementById(`${prefix}Company`).value,
    planModel: document.getElementById(`${prefix}PlanModel`).value,
    assetPrice: parseFieldValue(document.getElementById(`${prefix}AssetPrice`)),
    downPayment: parseFieldValue(document.getElementById(`${prefix}DownPayment`)),
    installmentCount: parseFieldValue(document.getElementById(`${prefix}InstallmentCount`)),
    monthlyPayment: parseFieldValue(document.getElementById(`${prefix}MonthlyPayment`)),
    deliveryMonth: parseFieldValue(document.getElementById(`${prefix}DeliveryMonth`)),
    organizationFeeRate: parseFieldValue(document.getElementById(`${prefix}OrganizationFeeRate`)),
    monthlyRent: parseFieldValue(document.getElementById(`${prefix}MonthlyRent`)),
    loanRate: parseFieldValue(document.getElementById(`${prefix}LoanRate`)),
    annualInflation: 32,
    discountRate: 28,
    useGraduatedPlan: false,
    graduatedIncreaseRate: 15,
  };
}

function renderOfferComparison() {
  const offers = ["offer1", "offer2", "offer3"].map((prefix, index) => {
    const inputs = readOfferInputs(prefix);
    const result = buildCashflow(inputs);
    return {
      title: `Teklif ${index + 1}`,
      company: inputs.company,
      inputs,
      result,
    };
  });

  const bestCost = Math.min(...offers.map((offer) => offer.result.netPresentCost));

  offerCompareSummary.innerHTML = offers
    .map((offer) => {
      const isBest = offer.result.netPresentCost === bestCost;
      return `
        <article class="offer-result-card${isBest ? " is-best" : ""}">
          <h3>${offer.title}</h3>
          <p>${offer.company}</p>
          <div class="offer-metrics">
            <div class="offer-metric">
              <span>Net bugünkü maliyet</span>
              <strong>${formatCurrency(offer.result.netPresentCost)}</strong>
            </div>
          <div class="offer-metric">
            <span>Toplam nominal maliyet</span>
            <strong>${formatCurrency(offer.result.totalNominalCost)}</strong>
          </div>
            <div class="offer-metric">
              <span>Tahmini teslim</span>
              <strong>${offer.result.deliveryMonth}. ay</strong>
            </div>
            <div class="offer-metric">
              <span>Kredi toplam ödeme</span>
              <strong>${formatCurrency(offer.result.totalLoanCost)}</strong>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function saveSessionDebounced() {
  if (sessionSaveTimer) clearTimeout(sessionSaveTimer);
  sessionSaveTimer = setTimeout(saveSession, 400);
}

function saveSession() {
  try {
    const payload = {
      assetType: document.getElementById("assetType")?.value,
      planModel: document.getElementById("planModel")?.value,
      company: document.getElementById("company")?.value,
      assetPrice: parseFieldValue(document.getElementById("assetPrice")),
      downPayment: parseFieldValue(document.getElementById("downPayment")),
      installmentCount: parseFieldValue(document.getElementById("installmentCount")),
      monthlyPayment: parseFieldValue(document.getElementById("monthlyPayment")),
      organizationFeeRate: parseFieldValue(document.getElementById("organizationFeeRate")),
      monthlyRent: parseFieldValue(document.getElementById("monthlyRent")),
      annualInflation: parseFieldValue(document.getElementById("annualInflation")),
      discountRate: parseFieldValue(document.getElementById("discountRate")),
      deliveryMonth: parseFieldValue(document.getElementById("deliveryMonth")),
      loanRate: parseFieldValue(document.getElementById("loanRate")),
      useGraduatedPlan: document.getElementById("useGraduatedPlan")?.checked,
      graduatedIncreaseRate: parseFieldValue(document.getElementById("graduatedIncreaseRate")),
    };
    localStorage.setItem("tasarruf_session", JSON.stringify(payload));
  } catch (e) {
    // swallow
  }
}

function loadSession() {
  try {
    const v = JSON.parse(localStorage.getItem("tasarruf_session") || "{}");
    if (v.assetType) document.getElementById("assetType").value = v.assetType;
    if (v.planModel) document.getElementById("planModel").value = v.planModel;
    if (v.company) document.getElementById("company").value = v.company;
    if (typeof v.assetPrice !== "undefined") document.getElementById("assetPrice").value = formatFieldValue(v.assetPrice, "grouped-int");
    if (typeof v.downPayment !== "undefined") document.getElementById("downPayment").value = formatFieldValue(v.downPayment, "grouped-int");
    if (typeof v.installmentCount !== "undefined") document.getElementById("installmentCount").value = formatFieldValue(v.installmentCount, "grouped-int");
    if (typeof v.monthlyPayment !== "undefined") document.getElementById("monthlyPayment").value = formatFieldValue(v.monthlyPayment, "grouped-int");
    if (typeof v.monthlyRent !== "undefined") document.getElementById("monthlyRent").value = formatFieldValue(v.monthlyRent, "grouped-int");
    if (typeof v.deliveryMonth !== "undefined") document.getElementById("deliveryMonth").value = formatFieldValue(v.deliveryMonth, "grouped-int");
    if (typeof v.annualInflation !== "undefined") document.getElementById("annualInflation").value = formatFieldValue(v.annualInflation, "decimal-dot");
    if (typeof v.discountRate !== "undefined") document.getElementById("discountRate").value = formatFieldValue(v.discountRate, "decimal-dot");
    if (typeof v.loanRate !== "undefined") document.getElementById("loanRate").value = formatFieldValue(v.loanRate, "decimal-dot");
    if (typeof v.useGraduatedPlan !== "undefined") document.getElementById("useGraduatedPlan").checked = v.useGraduatedPlan;
    if (typeof v.graduatedIncreaseRate !== "undefined") document.getElementById("graduatedIncreaseRate").value = formatFieldValue(v.graduatedIncreaseRate, "decimal-dot");
  } catch (e) {
    // ignore
  }
}

function encodeStateToURL(state) {
  try {
    const s = JSON.stringify(state);
    const code = btoa(unescape(encodeURIComponent(s)));
    const url = new URL(window.location.href);
    url.hash = 'state=' + encodeURIComponent(code);
    return url.toString();
  } catch (e) {
    return window.location.href;
  }
}

function applyState(state) {
  if (!state) return;
  if (state.assetType) document.getElementById("assetType").value = state.assetType;
  if (state.planModel) document.getElementById("planModel").value = state.planModel;
  if (state.company) document.getElementById("company").value = state.company;
  if (typeof state.assetPrice !== "undefined") document.getElementById("assetPrice").value = formatFieldValue(state.assetPrice, "grouped-int");
  if (typeof state.downPayment !== "undefined") document.getElementById("downPayment").value = formatFieldValue(state.downPayment, "grouped-int");
  if (typeof state.installmentCount !== "undefined") document.getElementById("installmentCount").value = formatFieldValue(state.installmentCount, "grouped-int");
  if (typeof state.monthlyPayment !== "undefined") document.getElementById("monthlyPayment").value = formatFieldValue(state.monthlyPayment, "grouped-int");
  if (typeof state.organizationFeeRate !== "undefined") document.getElementById("organizationFeeRate").value = formatFieldValue(state.organizationFeeRate, "decimal-dot");
  if (typeof state.monthlyRent !== "undefined") document.getElementById("monthlyRent").value = formatFieldValue(state.monthlyRent, "grouped-int");
  if (typeof state.annualInflation !== "undefined") document.getElementById("annualInflation").value = formatFieldValue(state.annualInflation, "decimal-dot");
  if (typeof state.discountRate !== "undefined") document.getElementById("discountRate").value = formatFieldValue(state.discountRate, "decimal-dot");
  if (typeof state.deliveryMonth !== "undefined") document.getElementById("deliveryMonth").value = formatFieldValue(state.deliveryMonth, "grouped-int");
  if (typeof state.loanRate !== "undefined") document.getElementById("loanRate").value = formatFieldValue(state.loanRate, "decimal-dot");
  if (typeof state.useGraduatedPlan !== "undefined") document.getElementById("useGraduatedPlan").checked = state.useGraduatedPlan;
  if (typeof state.graduatedIncreaseRate !== "undefined") document.getElementById("graduatedIncreaseRate").value = formatFieldValue(state.graduatedIncreaseRate, "decimal-dot");
}

function decodeStateFromURL() {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith('#state=')) return;
  try {
    const code = decodeURIComponent(hash.substring(7));
    const json = JSON.parse(decodeURIComponent(atob(code)));
    applyState(json);
  } catch (e) {
    // ignore parse errors
  }
}

function updateShareableURLFromState() {
  const state = {
    assetType: document.getElementById("assetType")?.value,
    planModel: document.getElementById("planModel")?.value,
    company: document.getElementById("company")?.value,
    assetPrice: parseFieldValue(document.getElementById("assetPrice")),
    downPayment: parseFieldValue(document.getElementById("downPayment")),
    installmentCount: parseFieldValue(document.getElementById("installmentCount")),
    monthlyPayment: parseFieldValue(document.getElementById("monthlyPayment")),
    organizationFeeRate: parseFieldValue(document.getElementById("organizationFeeRate")),
    monthlyRent: parseFieldValue(document.getElementById("monthlyRent")),
    annualInflation: parseFieldValue(document.getElementById("annualInflation")),
    discountRate: parseFieldValue(document.getElementById("discountRate")),
    deliveryMonth: parseFieldValue(document.getElementById("deliveryMonth")),
    loanRate: parseFieldValue(document.getElementById("loanRate")),
    useGraduatedPlan: document.getElementById("useGraduatedPlan").checked,
    graduatedIncreaseRate: parseFieldValue(document.getElementById("graduatedIncreaseRate")),
  };
  const url = encodeStateToURL(state);
  // Do not push to history to avoid messing with user navigation; just push if needed
  history.replaceState(null, '', new URL(url).hash ? url : window.location.href);
}
function exportCSV() {
  if (!latestResult || !latestResult.rows) return;
  const header = ["Month","Installment","Rent","Other","TotalOutflow","CumulativeOutflow"];
  const lines = [header.join(",")];
  latestResult.rows.forEach((r) => {
    lines.push([r.month, r.installment, r.rent, r.other, r.totalOutflow, r.cumulativeOutflow].join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tasarruf_results.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function fillScenario(s) {
  const scenarios = {
    A: { assetType: 'konut', planModel: 'cekilissiz', company: 'Diğer', assetPrice: 5000000, downPayment: 500000, installmentCount: 90, monthlyPayment: 55556, organizationFeeRate: 8, monthlyRent: 25000, annualInflation: 32, discountRate: 28, deliveryMonth: 12, loanRate: 3.19, useGraduatedPlan: false, graduatedIncreaseRate: 15 },
    B: { assetType: 'konut', planModel: 'cekilissiz', company: 'Diğer', assetPrice: 5000000, downPayment: 500000, installmentCount: 84, monthlyPayment: 52500, organizationFeeRate: 0, monthlyRent: 25000, annualInflation: 32, discountRate: 28, deliveryMonth: 12, loanRate: 3.19, useGraduatedPlan: false, graduatedIncreaseRate: 15 },
    C: { assetType: 'konut', planModel: 'cekilissiz', company: 'Diğer', assetPrice: 5000000, downPayment: 900000, installmentCount: 90, monthlyPayment: 60000, organizationFeeRate: 8, monthlyRent: 25000, annualInflation: 32, discountRate: 28, deliveryMonth: 12, loanRate: 3.19, useGraduatedPlan: false, graduatedIncreaseRate: 15 },
    D: { assetType: 'konut', planModel: 'cekilissiz', company: 'Diğer', assetPrice: 5000000, downPayment: 900000, installmentCount: 84, monthlyPayment: 60000, organizationFeeRate: 0, monthlyRent: 25000, annualInflation: 32, discountRate: 28, deliveryMonth: 12, loanRate: 3.19, useGraduatedPlan: false, graduatedIncreaseRate: 15 },
    E: { assetType: 'konut', planModel: 'cekilissiz', company: 'Diğer', assetPrice: 5000000, downPayment: 0, installmentCount: 120, monthlyPayment: 48000, organizationFeeRate: 8, monthlyRent: 25000, annualInflation: 32, discountRate: 28, deliveryMonth: 12, loanRate: 3.19, useGraduatedPlan: false, graduatedIncreaseRate: 15 },
    F: { assetType: 'konut', planModel: 'cekilissiz', company: 'Diğer', assetPrice: 5500000, downPayment: 200000, installmentCount: 72, monthlyPayment: 65000, organizationFeeRate: 8, monthlyRent: 25000, annualInflation: 32, discountRate: 28, deliveryMonth: 10, loanRate: 3.19, useGraduatedPlan: false, graduatedIncreaseRate: 15 }
  };
  const v = scenarios[s];
  if (!v) return;
  Object.entries(v).forEach(([key, val]) => {
    const el = document.getElementById(key.charAt(0).toLowerCase() + key.slice(1));
    // There is a mapping risk; fallback to direct IDs
  });
  // Direct patch by IDs
  const map = {
    assetType: 'assetType', planModel: 'planModel', company: 'company', assetPrice: 'assetPrice', downPayment: 'downPayment',
    installmentCount: 'installmentCount', monthlyPayment: 'monthlyPayment', organizationFeeRate: 'organizationFeeRate',
    monthlyRent: 'monthlyRent', annualInflation: 'annualInflation', discountRate: 'discountRate', deliveryMonth: 'deliveryMonth',
    loanRate: 'loanRate', useGraduatedPlan: 'useGraduatedPlan', graduatedIncreaseRate: 'graduatedIncreaseRate'
  };
  Object.entries(v).forEach(([k, val]) => {
    const id = map[k];
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') {
      el.checked = Boolean(val);
    } else {
      el.value = String(val);
    }
  });
  updateView();
}
function initOnboarding() {
  const onboardEl = document.getElementById("onboarding");
  if (onboardEl) onboardEl.style.display = "none";
}

function applyThemeFromStorage() {
  const t = localStorage.getItem("tasarruf_theme");
  if (t === "dark") {
    document.body.classList.add("dark");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  try {
  // Init onboarding
  initOnboarding();
  // Theme
  applyThemeFromStorage();
  // Session restore
  loadSession();
  // Excel baseline restoration (optional)
  if (EXCEL_BASELINE_MODE) {
    loadExcelBaseline();
  }
  // Init listeners for onboarding close
  const onboardClose = document.getElementById("onboardClose");
  onboardClose?.addEventListener("click", () => {
    const el = document.getElementById("onboarding");
    if (el) el.style.display = "none";
    localStorage.setItem("tasarruf_onboarded", "1");
  });
  // Theme toggle
  const themeBtn = document.getElementById("themeToggle");
  themeBtn?.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("tasarruf_theme", isDark ? "dark" : "light");
  });
  // CSV export button
  const csvBtn = document.getElementById("exportCSV");
  csvBtn?.addEventListener("click", exportCSV);
  const shareBtn = document.getElementById("shareLink");
  shareBtn?.addEventListener("click", () => {
    updateShareableURLFromState();
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  });
  // Legacy quick-fill controls
  document.getElementById("fillExample")?.addEventListener("click", fillExampleValues);
  document.getElementById("clearForm")?.addEventListener("click", clearFormValues);
  document.getElementById("fillCompareExamples")?.addEventListener("click", fillCompareExamples);
  document.getElementById("clearCompare")?.addEventListener("click", clearCompareValues);
  // Field persistence hooks
  setupFields();
  // Initial render
  updateView();
  // Expose helpers on window for debugging (optional)
  window.exportCSV = exportCSV;
  window.loadSession = loadSession;
  window.saveSession = saveSession;
  } catch (e) {
    console.error("Initialization failed:", e);
    // Minimal fallback: ensure the app at least displays a basic UI
  }
});
function renderFullComparison(data) {
  const container = document.getElementById("fullComparison");
  if (!container) return;

  const rows = [
    ["Ev Değeri", data.assetPrice, data.assetPrice, data.assetPrice, data.assetPrice, data.assetPrice, data.assetPrice],
    ["Peşinat Oranı", formatPercent(data.pesinatOranA * 100), formatPercent(data.pesinatOranB * 100), formatPercent(data.pesinatOranC * 100), formatPercent(data.pesinatOranD * 100), formatPercent(data.pesinatOranE * 100), formatPercent(data.pesinatOranF * 100)],
    ["Peşinat Tutarı", formatCurrency(data.pesinatA), formatCurrency(data.pesinatB), formatCurrency(data.pesinatC), formatCurrency(data.pesinatD), formatCurrency(data.pesinatE), formatCurrency(data.pesinatF)],
    ["Organizasyon Ücreti", "Yok", formatCurrency(data.orgFeeB), "Yok", formatCurrency(data.orgFeeD), "Yok", formatCurrency(data.orgFeeF)],
    ["Kredi Miktarı", formatCurrency(data.krediA), "0", formatCurrency(data.krediC), "0", formatCurrency(data.krediE), "0"],
    ["Aylık Faiz (%)", (data.aylikFaiz * 100).toFixed(2), "0", (data.aylikFaiz * 100).toFixed(2), "0", (data.aylikFaiz * 100).toFixed(2), "0"],
    ["Vade (Ay)", data.vadeKisa, data.vadeKisa, data.vadeKisa, data.vadeKisa, data.vadeUzun, data.vadeUzun],
    ["Aylık Taksit", formatCurrency(data.taksitA), formatCurrency(data.taksitB), formatCurrency(data.taksitC), formatCurrency(data.taksitD), formatCurrency(data.taksitE), formatCurrency(data.taksitF)],
    ["Toplam Geri Ödeme", formatCurrency(data.toplamGeriA), formatCurrency(data.toplamGeriB), formatCurrency(data.toplamGeriC), formatCurrency(data.toplamGeriD), formatCurrency(data.toplamGeriE), formatCurrency(data.toplamGeriF)],
    ["Teslim Ayı", data.teslimatA, data.teslimatB, data.teslimatC, data.teslimatD, data.teslimatE, data.teslimatF],
    ["NPV", formatCurrency(data.npvA), formatCurrency(data.npvB), formatCurrency(data.npvC), formatCurrency(data.npvD), formatCurrency(data.npvE), formatCurrency(data.npvF)],
  ];

  const labels = [
    "Ev Değeri",
    "Peşinat Oranı",
    "Peşinat Tutarı",
    "Organizasyon Ücreti",
    "Kredi Miktarı",
    "Aylık Faiz (%)",
    "Vade (Ay)",
    "Aylık Taksit",
    "Toplam Geri Ödeme",
    "Teslim Ayı",
    "NPV",
  ];

  container.innerHTML = `
    <div class="full-comp-grid">
      <div class="full-comp-header">
        <div></div>
        <div>Senaryo A<br>Banka Kredisi</div>
        <div>Senaryo B<br>Evim Sistemleri</div>
        <div>Senaryo C<br>Banka Kredisi<br>(Optimal)</div>
        <div>Senaryo D<br>Evim Sistemleri<br>(Optimal)</div>
        <div>Senaryo E<br>Banka Kredisi<br>(Max Vade)</div>
        <div>Senaryo F<br>Evim Sistemleri</div>
      </div>
      ${labels.map((label, i) => `
        <div class="full-comp-row">
          <div class="full-comp-label">${label}</div>
          ${rows[i].map((val, j) => `<div class="full-comp-value${j === 0 ? ' is-senaryo-a' : j === 1 ? ' is-senaryo-b' : j === 2 ? ' is-senaryo-c' : j === 3 ? ' is-senaryo-d' : j === 4 ? ' is-senaryo-e' : ' is-senaryo-f'}">${val}</div>`).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function updateKrediOraniPanel() {
  const ekspertizDegeri = parseFieldValue(document.getElementById("ekspertizDegeri"));
  const enerjiSinifi = document.getElementById("enerjiSinifi")?.value || "A-B";
  const baskaEviVar = document.getElementById("baskaEviVar")?.value === "Evet";

  if (ekspertizDegeri <= 0) return;

  const krediOrani = hesaplaKrediOrani(ekspertizDegeri, enerjiSinifi, baskaEviVar);
  const azamiKredi = hesaplaAzamiKredi(ekspertizDegeri, krediOrani);

  const oranEl = document.getElementById("krediOraniSonuc");
  const tutarEl = document.getElementById("azamiKrediTutari");
  if (oranEl) oranEl.textContent = `%${(krediOrani * 100).toFixed(1)}`;
  if (tutarEl) tutarEl.textContent = formatCurrency(azamiKredi);

  updateCarouselFromKredi(ekspertizDegeri, krediOrani, azamiKredi);
}

function updateCarouselFromKredi(ekspertizDegeri, krediOrani, azamiKredi) {
  const vadeKisa = DEFAULT_TAKSIT_VADE;
  const vadeUzun = DEFAULT_MAX_VADE;
  const aylikFaiz = DEFAULT_BANKA_FAIZ;
  const orgFeeRate = DEFAULT_TAKSIT_ORG_FEE_RATE;
  const aylikIskonto = 0.0236;
  const kira = parseFieldValue(document.getElementById("monthlyRent")) || 25000;

  const pesinatA = ekspertizDegeri * 0.1;
  const krediA = azamiKredi;
  const taksitA = aylikFaiz > 0
    ? (krediA * aylikFaiz * Math.pow(1 + aylikFaiz, vadeKisa)) / (Math.pow(1 + aylikFaiz, vadeKisa) - 1)
    : krediA / vadeKisa;
  const toplamGeriA = pesinatA + taksitA * vadeKisa;
  const npvA = calculateNPV(pesinatA, taksitA, kira, 0, vadeKisa, aylikIskonto);

  const pesinatB = ekspertizDegeri * 0.1;
  const orgFeeB = ekspertizDegeri * (orgFeeRate / 100);
  const taksitB = pesinatB > 0 ? (azamiKredi / vadeKisa) * 1.25 : azamiKredi / vadeKisa;
  const toplamGeriB = pesinatB + taksitB * vadeKisa;
  const teslimatB = Math.ceil(vadeKisa * 0.35);
  const npvB = calculateNPV(pesinatB, taksitB, kira, teslimatB, vadeKisa, aylikIskonto, orgFeeB);

  const targetNPV = npvB;
  const optimalPesinat = goalSeekOptimalPesinat(
    targetNPV,
    ekspertizDegeri,
    taksitA,
    kira,
    0,
    vadeKisa,
    aylikIskonto,
    0,
    aylikFaiz,
    0
  );
  const krediC = ekspertizDegeri - optimalPesinat;
  const taksitC = aylikFaiz > 0
    ? (krediC * aylikFaiz * Math.pow(1 + aylikFaiz, vadeKisa)) / (Math.pow(1 + aylikFaiz, vadeKisa) - 1)
    : krediC / vadeKisa;
  const toplamGeriC = optimalPesinat + taksitC * vadeKisa;
  const npvC = calculateNPV(optimalPesinat, taksitC, kira, 0, vadeKisa, aylikIskonto);

  const pesinatD = optimalPesinat;
  const orgFeeD = ekspertizDegeri * (orgFeeRate / 100);
  const taksitD = taksitB;
  const toplamGeriD = pesinatD + taksitD * vadeKisa;
  const npvD = calculateNPV(pesinatD, taksitD, kira, teslimatB, vadeKisa, aylikIskonto, orgFeeD);

  const pesinatE = pesinatA;
  const krediE = azamiKredi;
  const taksitE = aylikFaiz > 0
    ? (krediE * aylikFaiz * Math.pow(1 + aylikFaiz, vadeUzun)) / (Math.pow(1 + aylikFaiz, vadeUzun) - 1)
    : krediE / vadeUzun;
  const toplamGeriE = pesinatE + taksitE * vadeUzun;
  const npvE = calculateNPV(pesinatE, taksitE, kira, 0, vadeUzun, aylikIskonto);

  const pesinatF = pesinatB;
  const orgFeeF = orgFeeB;
  const vadeF = vadeUzun;
  const taksitF = (azamiKredi / vadeF) * 0.25;
  const toplamGeriF = pesinatF + taksitF * vadeF;
  const teslimatF = Math.ceil(vadeF * 0.33);
  const npvF = calculateNPV(pesinatF, taksitF, kira, teslimatF, vadeF, aylikIskonto, orgFeeF);

  const data = {
    assetPrice: ekspertizDegeri,
    pesinatOranA: 0.1,
    pesinatOranB: 0.1,
    pesinatOranC: optimalPesinat / ekspertizDegeri,
    pesinatOranD: optimalPesinat / ekspertizDegeri,
    pesinatOranE: 0.1,
    pesinatOranF: 0.1,
    pesinatA,
    pesinatB,
    pesinatC: optimalPesinat,
    pesinatD: optimalPesinat,
    pesinatE,
    pesinatF,
    orgFeeB,
    orgFeeD,
    orgFeeF,
    krediA,
    krediC,
    krediE,
    aylikFaiz,
    vadeKisa,
    vadeUzun,
    taksitA,
    taksitB,
    taksitC,
    taksitD,
    taksitE,
    taksitF,
    toplamGeriA,
    toplamGeriB,
    toplamGeriC,
    toplamGeriD,
    toplamGeriE,
    toplamGeriF,
    teslimatA: 0,
    teslimatB,
    teslimatC: 0,
    teslimatD: teslimatB,
    teslimatE: 0,
    teslimatF,
    npvA,
    npvB,
    npvC,
    npvD,
    npvE,
    npvF,
  };

  renderFullComparison(data);

  if (document.getElementById("assetPrice")) {
    document.getElementById("assetPrice").value = formatFieldValue(ekspertizDegeri, "grouped-int");
    document.getElementById("downPayment").value = formatFieldValue(pesinatA, "grouped-int");
  }
}

function readInputs() {
  return {
    assetType: document.getElementById("assetType").value,
    planModel: document.getElementById("planModel").value,
    company: document.getElementById("company").value,
    assetPrice: parseFieldValue(document.getElementById("assetPrice")),
    downPayment: parseFieldValue(document.getElementById("downPayment")),
    installmentCount: parseFieldValue(document.getElementById("installmentCount")),
    monthlyPayment: parseFieldValue(document.getElementById("monthlyPayment")),
    organizationFeeRate: parseFieldValue(document.getElementById("organizationFeeRate")),
    monthlyRent: parseFieldValue(document.getElementById("monthlyRent")),
    annualInflation: parseFieldValue(document.getElementById("annualInflation")),
    discountRate: parseFieldValue(document.getElementById("discountRate")),
    deliveryMonth: parseFieldValue(document.getElementById("deliveryMonth")),
    loanRate: parseFieldValue(document.getElementById("loanRate")),
    useGraduatedPlan: document.getElementById("useGraduatedPlan").checked,
    graduatedIncreaseRate: parseFieldValue(document.getElementById("graduatedIncreaseRate")),
  };
}

function updateView() {
  const inputs = readInputs();
  const result = buildCashflow(inputs);
  latestResult = result;
  renderHeadline(result);
  renderSummary(result, inputs);
  renderComparison(result);
  renderCashflow(result.rows);
  renderOfferComparison();
  renderVisuals(result);
  // Persist current session after results update
  saveSession();
}

function fillExampleValues() {
  const sc = document.getElementById('exampleScenario')?.value || 'A';
  fillScenario(sc);

  document.getElementById("company").value = "Diğer";
  document.getElementById("useGraduatedPlan").checked = false;
  updateView();
}

function clearFormValues() {
  fields.forEach((field) => {
    if (field.tagName === "SELECT") {
      return;
    }

    field.value = "";
    syncVisualState(field);
  });

  document.getElementById("assetType").value = "konut";
  document.getElementById("planModel").value = "cekilissiz";
  document.getElementById("company").value = "Diğer";
  document.getElementById("useGraduatedPlan").checked = false;
  updateView();
}

function fillCompareExamples() {
  compareFields.forEach((field) => {
    if (field.tagName === "SELECT") {
      return;
    }

    field.value = formatFieldValue(field.dataset.default, field.dataset.format);
    syncVisualState(field);
  });

  updateView();
}

function clearCompareValues() {
  compareFields.forEach((field) => {
    if (field.tagName === "SELECT") {
      return;
    }

    field.value = "";
    syncVisualState(field);
  });

  document.getElementById("offer1Company").value = "Diğer";
  document.getElementById("offer2Company").value = "Fuzul Ev";
  document.getElementById("offer3Company").value = "Katılımevim";
  document.getElementById("offer1PlanModel").value = "cekilissiz";
  document.getElementById("offer2PlanModel").value = "cekilissiz";
  document.getElementById("offer3PlanModel").value = "cekilissiz";
  updateView();
}

// Legacy init removed; initialization now occurs on DOMContentLoaded in the bottom patch.

const krediPanelFields = Array.from(document.querySelectorAll("#krediOraniPanel input, #krediOraniPanel select"));
krediPanelFields.forEach((field) => {
  if (field.tagName === "SELECT") {
    field.addEventListener("change", updateKrediOraniPanel);
    return;
  }
  field.addEventListener("blur", () => {
    updateKrediOraniPanel();
  });
  field.addEventListener("input", () => {
    updateKrediOraniPanel();
  });
});

document.getElementById("ekspertizDegeri").addEventListener("input", () => {
  const val = parseFieldValue(document.getElementById("ekspertizDegeri"));
  if (val > 0) {
    document.getElementById("assetPrice").value = formatFieldValue(val, "grouped-int");
    document.getElementById("downPayment").value = formatFieldValue(val * 0.1, "grouped-int");
    updateView();
  }
  updateKrediOraniPanel();
});

document.getElementById("ekspertizDegeri").addEventListener("blur", () => {
  const val = parseFieldValue(document.getElementById("ekspertizDegeri"));
  if (val > 0) {
    document.getElementById("ekspertizDegeri").value = formatFieldValue(val, "grouped-int");
    updateKrediOraniPanel();
  }
});

// Excel uyumlu karşılaştırma motoru.
// Kaynak: konut_kredi_orani_hesaplayici.xlsx / SEKME ve KARŞILAŞTIRMA sayfaları.
const EXCEL_EK_MALIYET = 29500 + 25000;
const EXCEL_TAHVIL_YILLIK = 0.3231;
const EXCEL_AYLIK_ISKONTO = Math.pow(1 + EXCEL_TAHVIL_YILLIK, 1 / 12) - 1;

function excelPmt(rate, periods, principal) {
  if (!periods) return 0;
  if (!rate) return principal / periods;
  const factor = Math.pow(1 + rate, periods);
  return (principal * rate * factor) / (factor - 1);
}

function excelPv(rate, periods, payment, futureValue = 0, type = 0) {
  if (!periods) return -futureValue;
  if (!rate) return -(futureValue + payment * periods);
  const factor = Math.pow(1 + rate, periods);
  return -(futureValue + payment * (1 + rate * type) * ((factor - 1) / rate)) / factor;
}

function excelScenarioNpv(initialOutflow, assetPrice, deliveryMonth, periods, monthlyPayment, rent, discountRate) {
  return (
    -initialOutflow +
    assetPrice / Math.pow(1 + discountRate, deliveryMonth) +
    excelPv(discountRate, periods, monthlyPayment, 0, 0) +
    excelPv(discountRate, deliveryMonth, rent, 0, 0)
  );
}

function excelDeliveryMonth(assetPrice, downPayment, monthlyPayment, periods) {
  if (!assetPrice || !periods || !monthlyPayment) return 5;
  const downRatio = downPayment / assetPrice;
  const byDuration = Math.ceil(Math.max(0, periods * (0.4 - downRatio)));
  const bySavings = Math.ceil(Math.max(0, (assetPrice * 0.4 - downPayment) / monthlyPayment));
  return Math.max(byDuration, bySavings, 5);
}

function excelOptimalEvimDownPayment(assetPrice) {
  // Workbook'ta F5=1.140.000 / 5.000.000 = %22,8 ve F19 goal seek sonucu 5 ay.
  // Aynı oranı ölçekleyerek Excel'deki C-D optimal senaryosunu koruyoruz.
  return Math.round(assetPrice * 0.228);
}

function buildExcelComparisonData(ekspertizDegeri, krediOrani, azamiKredi) {
  const assetPrice = ekspertizDegeri;
  const vadeKisa = DEFAULT_TAKSIT_VADE;
  const vadeUzun = DEFAULT_MAX_VADE;
  const aylikFaiz = DEFAULT_BANKA_FAIZ;
  const orgFeeRate = DEFAULT_TAKSIT_ORG_FEE_RATE / 100;
  const aylikIskonto = EXCEL_AYLIK_ISKONTO;
  const kira = parseFieldValue(document.getElementById("monthlyRent")) || 25000;

  const pesinatA = assetPrice * (1 - krediOrani);
  const krediA = assetPrice - pesinatA;
  const taksitA = excelPmt(aylikFaiz, vadeKisa, krediA);
  const toplamGeriA = taksitA * vadeKisa + EXCEL_EK_MALIYET;
  const toplamMaliyetA = toplamGeriA + pesinatA;
  const npvA = excelScenarioNpv(pesinatA, assetPrice, 0, vadeKisa, taksitA, 0, aylikIskonto);

  const pesinatB = pesinatA;
  const orgFeeB = assetPrice * orgFeeRate;
  const baslangicB = pesinatB + orgFeeB;
  const finansmanB = assetPrice - pesinatB;
  const taksitB = finansmanB / vadeKisa;
  const teslimatB = excelDeliveryMonth(assetPrice, pesinatB, taksitB, vadeKisa);
  const toplamGeriB = taksitB * vadeKisa;
  const toplamMaliyetB = toplamGeriB + baslangicB;
  const npvB = excelScenarioNpv(baslangicB, assetPrice, teslimatB, vadeKisa, taksitB, kira, aylikIskonto);

  const pesinatD = excelOptimalEvimDownPayment(assetPrice);
  const orgFeeD = assetPrice * orgFeeRate;
  const baslangicD = pesinatD + orgFeeD;
  const finansmanD = assetPrice - pesinatD;
  const taksitD = finansmanD / vadeKisa;
  const teslimatD = excelDeliveryMonth(assetPrice, pesinatD, taksitD, vadeKisa);
  const toplamGeriD = taksitD * vadeKisa;
  const toplamMaliyetD = toplamGeriD + baslangicD;
  const npvD = excelScenarioNpv(baslangicD, assetPrice, teslimatD, vadeKisa, taksitD, kira, aylikIskonto);

  const pesinatC = pesinatD;
  const krediC = assetPrice - pesinatC;
  const taksitC = excelPmt(aylikFaiz, vadeKisa, krediC);
  const toplamGeriC = taksitC * vadeKisa + EXCEL_EK_MALIYET;
  const toplamMaliyetC = toplamGeriC + pesinatC;
  const npvC = excelScenarioNpv(pesinatC, assetPrice, 0, vadeKisa, taksitC, 0, aylikIskonto);

  const pesinatE = pesinatA;
  const krediE = assetPrice - pesinatE;
  const taksitE = excelPmt(aylikFaiz, vadeUzun, krediE);
  const toplamGeriE = taksitE * vadeUzun + EXCEL_EK_MALIYET;
  const toplamMaliyetE = toplamGeriE + pesinatE;
  const npvE = excelScenarioNpv(pesinatE, assetPrice, 0, vadeUzun, taksitE, 0, aylikIskonto);

  const pesinatF = pesinatB;
  const orgFeeF = orgFeeB;
  const baslangicF = pesinatF + orgFeeF;
  const finansmanF = assetPrice - pesinatF;
  const taksitF = finansmanF / vadeUzun;
  const teslimatF = excelDeliveryMonth(assetPrice, pesinatF, taksitF, vadeUzun);
  const toplamGeriF = taksitF * vadeUzun;
  const toplamMaliyetF = toplamGeriF + baslangicF;
  const npvF = excelScenarioNpv(baslangicF, assetPrice, teslimatF, vadeUzun, taksitF, kira, aylikIskonto);

  return {
    assetPrice,
    azamiKredi,
    krediOrani,
    pesinatOranA: pesinatA / assetPrice,
    pesinatOranB: pesinatB / assetPrice,
    pesinatOranC: pesinatC / assetPrice,
    pesinatOranD: pesinatD / assetPrice,
    pesinatOranE: pesinatE / assetPrice,
    pesinatOranF: pesinatF / assetPrice,
    pesinatTeslimB: (pesinatB + teslimatB * taksitB) / assetPrice,
    pesinatTeslimD: (pesinatD + teslimatD * taksitD) / assetPrice,
    pesinatTeslimF: (pesinatF + teslimatF * taksitF) / assetPrice,
    pesinatA,
    pesinatB,
    pesinatC,
    pesinatD,
    pesinatE,
    pesinatF,
    orgFeeB,
    orgFeeD,
    orgFeeF,
    krediA,
    krediC,
    krediE,
    aylikFaiz,
    vadeKisa,
    vadeUzun,
    taksitA,
    taksitB,
    taksitC,
    taksitD,
    taksitE,
    taksitF,
    toplamGeriA,
    toplamGeriB,
    toplamGeriC,
    toplamGeriD,
    toplamGeriE,
    toplamGeriF,
    toplamMaliyetA,
    toplamMaliyetB,
    toplamMaliyetC,
    toplamMaliyetD,
    toplamMaliyetE,
    toplamMaliyetF,
    teslimatA: 0,
    teslimatB,
    teslimatC: 0,
    teslimatD,
    teslimatE: 0,
    teslimatF,
    npvA,
    npvB,
    npvC,
    npvD,
    npvE,
    npvF,
  };
}

function renderFullComparison(data) {
  const container = document.getElementById("fullComparison");
  if (!container || !data) return;

  const rows = [
    ["Ev Değeri", formatCurrency(data.assetPrice), formatCurrency(data.assetPrice), formatCurrency(data.assetPrice), formatCurrency(data.assetPrice), formatCurrency(data.assetPrice), formatCurrency(data.assetPrice)],
    ["Peşinat Oranı", formatPercent(data.pesinatOranA * 100), formatPercent(data.pesinatOranB * 100), formatPercent(data.pesinatOranC * 100), formatPercent(data.pesinatOranD * 100), formatPercent(data.pesinatOranE * 100), formatPercent(data.pesinatOranF * 100)],
    ["Teslimata Kadar Oran", "Yok", formatPercent(data.pesinatTeslimB * 100), "Yok", formatPercent(data.pesinatTeslimD * 100), "Yok", formatPercent(data.pesinatTeslimF * 100)],
    ["Peşinat Tutarı", formatCurrency(data.pesinatA), formatCurrency(data.pesinatB), formatCurrency(data.pesinatC), formatCurrency(data.pesinatD), formatCurrency(data.pesinatE), formatCurrency(data.pesinatF)],
    ["Organizasyon Ücreti", "Yok", formatCurrency(data.orgFeeB), "Yok", formatCurrency(data.orgFeeD), "Yok", formatCurrency(data.orgFeeF)],
    ["Kredi / Finansman", formatCurrency(data.krediA), formatCurrency(data.assetPrice - data.pesinatB), formatCurrency(data.krediC), formatCurrency(data.assetPrice - data.pesinatD), formatCurrency(data.krediE), formatCurrency(data.assetPrice - data.pesinatF)],
    ["Aylık Faiz (%)", (data.aylikFaiz * 100).toFixed(2), "0", (data.aylikFaiz * 100).toFixed(2), "0", (data.aylikFaiz * 100).toFixed(2), "0"],
    ["Vade (Ay)", data.vadeKisa, data.vadeKisa, data.vadeKisa, data.vadeKisa, data.vadeUzun, data.vadeUzun],
    ["Aylık Taksit", formatCurrency(data.taksitA), formatCurrency(data.taksitB), formatCurrency(data.taksitC), formatCurrency(data.taksitD), formatCurrency(data.taksitE), formatCurrency(data.taksitF)],
    ["Toplam Geri Ödeme", formatCurrency(data.toplamGeriA), formatCurrency(data.toplamGeriB), formatCurrency(data.toplamGeriC), formatCurrency(data.toplamGeriD), formatCurrency(data.toplamGeriE), formatCurrency(data.toplamGeriF)],
    ["Toplam Maliyet", formatCurrency(data.toplamMaliyetA), formatCurrency(data.toplamMaliyetB), formatCurrency(data.toplamMaliyetC), formatCurrency(data.toplamMaliyetD), formatCurrency(data.toplamMaliyetE), formatCurrency(data.toplamMaliyetF)],
    ["Teslim Ayı", data.teslimatA, data.teslimatB, data.teslimatC, data.teslimatD, data.teslimatE, data.teslimatF],
    ["NPV", formatCurrency(data.npvA), formatCurrency(data.npvB), formatCurrency(data.npvC), formatCurrency(data.npvD), formatCurrency(data.npvE), formatCurrency(data.npvF)],
  ];

  const labels = ["A Banka", "B Evim", "C Banka Optimal", "D Evim Optimal", "E Banka Uzun", "F Evim Uzun"];
  container.innerHTML = `
    <div class="section-head">
      <div>
        <span class="kicker">Karşılaştırma</span>
        <h2>Senaryo A-F</h2>
        <p class="subtle">A-B eş şartlar, C-D F19=5 olacak optimal peşinat, E uzun vadeli banka, F uzun vadeli evim sistemi.</p>
      </div>
    </div>
    <div class="full-comp-grid">
      <div class="full-comp-header">
        <div>Değişken</div>
        ${labels.map((label) => `<div>${label}</div>`).join("")}
      </div>
      ${rows.map((row) => `
        <div class="full-comp-row">
          <div class="full-comp-label">${row[0]}</div>
          ${row.slice(1).map((value, index) => `<div class="full-comp-value is-senaryo-${String.fromCharCode(97 + index)}">${value}</div>`).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function updateKrediOraniPanel() {
  const ekspertizDegeri = parseFieldValue(document.getElementById("ekspertizDegeri"));
  const enerjiSinifi = document.getElementById("enerjiSinifi")?.value || "A-B";
  const baskaEviVar = document.getElementById("baskaEviVar")?.value === "Evet";
  if (ekspertizDegeri <= 0) return;

  const krediOrani = hesaplaKrediOrani(ekspertizDegeri, enerjiSinifi, baskaEviVar);
  const azamiKredi = hesaplaAzamiKredi(ekspertizDegeri, krediOrani);
  const zorunluPesinat = Math.max(0, ekspertizDegeri - azamiKredi);

  const oranEl = document.getElementById("krediOraniSonuc");
  const tutarEl = document.getElementById("azamiKrediTutari");
  if (oranEl) oranEl.textContent = `%${(krediOrani * 100).toFixed(1)}`;
  if (tutarEl) tutarEl.textContent = formatCurrency(azamiKredi);

  const assetField = document.getElementById("assetPrice");
  const downField = document.getElementById("downPayment");
  if (assetField) assetField.value = formatFieldValue(ekspertizDegeri, "grouped-int");
  if (downField) downField.value = formatFieldValue(zorunluPesinat, "grouped-int");

  renderFullComparison(buildExcelComparisonData(ekspertizDegeri, krediOrani, azamiKredi));
  if (typeof updateView === "function") updateView();
}

updateKrediOraniPanel();

const MANUAL_EXCEL_PAYMENTS = [
  { month: 1, amount: "asset-formula" },
  { month: 1, amount: 164000 },
  { month: 2, amount: 164000 },
  { month: 3, amount: 164000 },
  { month: 4, amount: 164000 },
  { month: 5, amount: 164000 },
  { month: 6, amount: 164000 },
  { month: 7, amount: 132000 },
  { month: 8, amount: 132000 },
  { month: 9, amount: 132000 },
  { month: 10, amount: 132000 },
  { month: 11, amount: 132000 },
  { month: 12, amount: 132000 },
  { month: 13, amount: 132000 },
  { month: 14, amount: 132000 },
  { month: 15, amount: 132000 },
  { month: 16, amount: 132000 },
  { month: 17, amount: 132000 },
  { month: 18, amount: 132000 },
  { month: 19, amount: 132000 },
  { month: 20, amount: 132000 },
  { month: 21, amount: 132000 },
  { month: 22, amount: 132000 },
  { month: 23, amount: 260000 },
];

function manualRate(periods, payment, presentValue) {
  if (!periods || !payment || !presentValue) return 0;
  let rate = 0.02;
  for (let i = 0; i < 80; i++) {
    const discountFactor = Math.pow(1 + rate, -periods);
    const annuity = (1 - discountFactor) / rate;
    const f = presentValue - payment * annuity;
    const df =
      -payment *
      ((periods * Math.pow(1 + rate, -periods - 1) * rate - (1 - discountFactor)) / (rate * rate));
    const next = rate - f / df;
    if (!Number.isFinite(next) || next <= -0.99) break;
    if (Math.abs(next - rate) < 1e-10) {
      rate = next;
      break;
    }
    rate = next;
  }
  return Number.isFinite(rate) ? rate : 0;
}

function manualEffectiveAnnualRate(monthlyRate) {
  if (!monthlyRate) return 0;
  return Math.pow(1 + (monthlyRate * 12) / 24, 24) - 1;
}

function getManualRows() {
  return Array.from(document.querySelectorAll("#manualPaymentRows tr")).map((row) => {
    const monthInput = row.querySelector(".manual-month");
    const amountInput = row.querySelector(".manual-amount");
    return {
      month: parseFieldValue(monthInput),
      amount: parseFieldValue(amountInput),
    };
  }).filter((row) => row.month > 0 || row.amount > 0);
}

function addManualRow(month = "", amount = "") {
  const tbody = document.getElementById("manualPaymentRows");
  if (!tbody) return;
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>
      <input class="manual-month" type="text" inputmode="numeric" value="${month}" placeholder="Ay" data-format="grouped-int" />
    </td>
    <td>
      <input class="manual-amount" type="text" inputmode="numeric" value="${amount}" placeholder="Ödeme" data-format="grouped-int" />
    </td>
    <td class="manual-row-pv">₺0</td>
    <td><button class="row-remove-button" type="button">Sil</button></td>
  `;
  tbody.appendChild(row);

  row.querySelectorAll("input").forEach((input) => {
    input.addEventListener("focus", () => {
      if (input.value.trim() !== "") input.value = String(parseGroupedInt(input.value));
    });
    input.addEventListener("input", updateManualAnalysis);
    input.addEventListener("blur", () => {
      if (input.value.trim() !== "") input.value = formatFieldValue(parseFieldValue(input), "grouped-int");
      updateManualAnalysis();
    });
  });

  row.querySelector(".row-remove-button").addEventListener("click", () => {
    row.remove();
    updateManualAnalysis();
  });
}

function clearManualRows() {
  const tbody = document.getElementById("manualPaymentRows");
  if (tbody) tbody.innerHTML = "";
  updateManualAnalysis();
}

function loadManualExcelExample() {
  const assetField = document.getElementById("manualAssetValue");
  const orgRateField = document.getElementById("manualOrgRate");
  const inflationField = document.getElementById("manualInflation");
  const termField = document.getElementById("manualTermRows");
  assetField.value = formatFieldValue(4008163.2653061245, "grouped-int");
  orgRateField.value = "9.0";
  inflationField.value = "28.5";
  termField.value = "23";

  const assetValue = parseFieldValue(assetField);
  const orgRate = parseFieldValue(orgRateField) / 100;
  const tbody = document.getElementById("manualPaymentRows");
  if (tbody) tbody.innerHTML = "";
  MANUAL_EXCEL_PAYMENTS.forEach((payment) => {
    const amount = payment.amount === "asset-formula" ? assetValue * (0.4 + orgRate) : payment.amount;
    addManualRow(payment.month, formatFieldValue(amount, "grouped-int"));
  });
  updateManualAnalysis();
}

function generateManualRows() {
  const term = Math.max(0, Math.round(parseFieldValue(document.getElementById("manualTermRows"))));
  const tbody = document.getElementById("manualPaymentRows");
  if (tbody) tbody.innerHTML = "";
  for (let month = 1; month <= term; month++) {
    addManualRow(month, "");
  }
  updateManualAnalysis();
}

function updateManualAnalysis() {
  const assetValue = parseFieldValue(document.getElementById("manualAssetValue"));
  const inflation = parseFieldValue(document.getElementById("manualInflation")) / 100;
  const monthlyDiscount = Math.round((Math.pow(1 + inflation, 1 / 12) - 1) * 1000) / 1000;
  const rows = getManualRows();
  let nominalTotal = 0;
  let presentValue = 0;

  document.querySelectorAll("#manualPaymentRows tr").forEach((tr) => {
    const month = parseFieldValue(tr.querySelector(".manual-month"));
    const amount = parseFieldValue(tr.querySelector(".manual-amount"));
    const pv = month > 0 ? amount / Math.pow(1 + monthlyDiscount, month) : 0;
    tr.querySelector(".manual-row-pv").textContent = formatCurrency(pv);
  });

  rows.forEach((row) => {
    nominalTotal += row.amount;
    presentValue += row.month > 0 ? row.amount / Math.pow(1 + monthlyDiscount, row.month) : 0;
  });

  const maxMonth = rows.reduce((max, row) => Math.max(max, row.month), 0);
  const averagePayment = maxMonth > 0 ? nominalTotal / maxMonth : 0;
  const monthlyRate = manualRate(maxMonth, averagePayment, assetValue);
  const annualRate = manualEffectiveAnnualRate(monthlyRate);

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  setText("manualMonthlyDiscount", `%${(monthlyDiscount * 100).toFixed(2)}`);
  setText("manualPresentValue", formatCurrency(presentValue));
  setText("manualNominalTotal", formatCurrency(nominalTotal));
  setText("manualAnnualRate", `%${(annualRate * 100).toFixed(2)}`);
}

function setupManualAnalysis() {
  const manualPanel = document.getElementById("manuelAnaliz");
  if (!manualPanel) return;

  manualPanel.querySelectorAll("input[data-format]").forEach((input) => {
    input.addEventListener("focus", () => {
      if (input.dataset.format === "grouped-int" && input.value.trim() !== "") {
        input.value = String(parseGroupedInt(input.value));
      }
    });
    input.addEventListener("input", updateManualAnalysis);
    input.addEventListener("blur", () => {
      if (input.value.trim() !== "") input.value = formatFieldValue(parseFieldValue(input), input.dataset.format);
      updateManualAnalysis();
    });
  });

  document.getElementById("manualLoadExample")?.addEventListener("click", loadManualExcelExample);
  document.getElementById("manualAddRow")?.addEventListener("click", () => {
    const rows = getManualRows();
    const nextMonth = rows.length ? Math.max(...rows.map((row) => row.month)) + 1 : 1;
    addManualRow(nextMonth, "");
    updateManualAnalysis();
  });
  document.getElementById("manualClearRows")?.addEventListener("click", clearManualRows);
  document.getElementById("manualGenerateRows")?.addEventListener("click", generateManualRows);

  loadManualExcelExample();
}

setupManualAnalysis();

const MARKET_DATA = {
  indexScore: 47.5,
  season: "Geçiş / Kararsız Dönem",
  comment:
    "Kredi şartları hâlâ pahalı; ancak konut ve risk verileri tam tasarruf lehine kopuş göstermiyor. Bu ekran haftalık güncellenen erken uyarı paneli gibi çalışır.",
  groups: [
    { name: "Kredi", score: 40.3, note: "Faiz ve kredi büyümesi tasarruf tarafını destekliyor." },
    { name: "Risk", score: 53.6, note: "Makro risk nötr bölgede; veri izlenmeli." },
    { name: "Konut", score: 49.4, note: "Talep ve maliyet sinyalleri dengede." },
  ],
  housingCredit: [
    { label: "Konut kredi stoku", value: "₺752.738 mn", delta: "+%0,76 haftalık" },
    { label: "Yıl sonundan beri", value: "+%11,70", delta: "Konut kredisi değişimi" },
    { label: "Taşıt kredi stoku", value: "₺45.607 mn", delta: "-%1,21 haftalık", negative: true },
    { label: "Taşıt YTD", value: "-%11,14", delta: "Daralma sürüyor", negative: true },
  ],
  housingSales: [
    { label: "Toplam satış", value: "113.367", delta: "2026 Mart" },
    { label: "İpotekli pay", value: "%22,9", delta: "25.978 adet" },
    { label: "İlk el payı", value: "%31,5", delta: "35.725 adet" },
    { label: "Diğer satış", value: "87.389", delta: "Nakit / diğer kanal" },
  ],
  autoMarket: [
    { label: "Toplam pazar", value: "262.728", delta: "2026 Ocak-Mart" },
    { label: "2025 aynı dönem", value: "275.151", delta: "-%4,51 yıllık", negative: true },
    { label: "Yerli satış", value: "88.252", delta: "%33,6 pay" },
    { label: "İthal satış", value: "174.476", delta: "%66,4 pay" },
  ],
  brands: [
    { name: "Renault", value: 34244, change: "+%12,9" },
    { name: "Toyota", value: 23982, change: "+%34,9" },
    { name: "Fiat", value: 22748, change: "+%3,2" },
    { name: "Volkswagen", value: 19166, change: "-%4,4" },
    { name: "Peugeot", value: 18049, change: "-%7,9" },
  ],
};

function renderMiniMetrics(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = items
    .map(
      (item) => `
        <article class="mini-metric">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
          <em class="${item.negative ? "negative" : ""}">${item.delta}</em>
        </article>
      `,
    )
    .join("");
}

function renderMarketData() {
  const panel = document.getElementById("marketData");
  if (!panel) return;

  const score = MARKET_DATA.indexScore;
  const scoreEl = document.getElementById("marketIndexScore");
  const seasonEl = document.getElementById("marketIndexSeason");
  const commentEl = document.getElementById("marketIndexComment");
  const needleEl = document.getElementById("marketGaugeNeedle");

  if (scoreEl) scoreEl.textContent = score.toFixed(1);
  if (seasonEl) seasonEl.textContent = MARKET_DATA.season;
  if (commentEl) commentEl.textContent = MARKET_DATA.comment;
  if (needleEl) {
    const degrees = -90 + (Math.max(0, Math.min(100, score)) / 100) * 180;
    needleEl.style.transform = `translateX(-50%) rotate(${degrees}deg)`;
  }

  const groupContainer = document.getElementById("marketGroupCards");
  if (groupContainer) {
    groupContainer.innerHTML = MARKET_DATA.groups
      .map(
        (group) => `
          <article class="group-score-card">
            <span class="market-eyebrow">${group.name}</span>
            <strong>${group.score.toFixed(1)}</strong>
            <p class="subtle">${group.note}</p>
            <div class="score-track"><div class="score-fill" style="width:${group.score}%"></div></div>
          </article>
        `,
      )
      .join("");
  }

  const snapshotContainer = document.getElementById("marketSnapshot");
  if (snapshotContainer) {
    const snapshotItems = [
      MARKET_DATA.housingCredit[0],
      MARKET_DATA.housingCredit[1],
      MARKET_DATA.housingSales[0],
      MARKET_DATA.housingSales[1],
      MARKET_DATA.autoMarket[0],
      MARKET_DATA.autoMarket[1],
    ];
    snapshotContainer.innerHTML = snapshotItems
      .map(
        (item) => `
          <article class="snapshot-card">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
            <em class="${item.negative ? "negative" : ""}">${item.delta}</em>
          </article>
        `,
      )
      .join("");
  }

  const tabData = {
    credit: {
      eyebrow: "Konut Kredileri",
      title: "BDDK haftalık kredi stoku",
      note: "Konut ve taşıt kredi stokundaki yön, finansman iştahını okumak için ana sinyal.",
      metrics: MARKET_DATA.housingCredit,
      showBrands: false,
    },
    housing: {
      eyebrow: "TÜİK Konut Satış",
      title: "Mart 2026 satış resmi",
      note: "Toplam satış, ipotekli pay ve ilk el oranı konut talebinin nabzını verir.",
      metrics: MARKET_DATA.housingSales,
      showBrands: false,
    },
    auto: {
      eyebrow: "Otomobil Pazarı",
      title: "Ocak-Mart 2026 marka tablosu",
      note: "Taşıt tarafında pazar hacmi ve marka sıralaması manuel güncelleme ile izlenir.",
      metrics: MARKET_DATA.autoMarket,
      showBrands: true,
    },
  };

  const renderTab = (key) => {
    const data = tabData[key] || tabData.credit;
    const eyebrow = document.getElementById("marketDetailEyebrow");
    const title = document.getElementById("marketDetailTitle");
    const note = document.getElementById("marketDetailNote");
    const detailCard = document.querySelector(".market-detail-card");
    if (eyebrow) eyebrow.textContent = data.eyebrow;
    if (title) title.textContent = data.title;
    if (note) note.textContent = data.note;
    if (detailCard) detailCard.classList.toggle("show-brands", data.showBrands);
    renderMiniMetrics("marketDetailCards", data.metrics);
  };

  document.querySelectorAll("[data-market-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-market-tab]").forEach((tab) => tab.classList.remove("active"));
      button.classList.add("active");
      renderTab(button.dataset.marketTab);
    });
  });

  renderTab("credit");

  const brandContainer = document.getElementById("autoBrandBars");
  if (brandContainer) {
    const max = Math.max(...MARKET_DATA.brands.map((brand) => brand.value));
    brandContainer.innerHTML = MARKET_DATA.brands
      .map(
        (brand) => `
          <div class="brand-row">
            <span>${brand.name}</span>
            <div class="brand-track"><div class="brand-fill" style="width:${(brand.value / max) * 100}%"></div></div>
            <strong>${brand.value.toLocaleString("tr-TR")}</strong>
          </div>
        `,
      )
      .join("");
  }
}

renderMarketData();

function setupEasyCalculatorControls() {
  document.querySelectorAll(".segmented-control").forEach((control) => {
    const select = document.getElementById(control.dataset.targetSelect || "");
    if (!select) return;
    const sync = (value) => {
      control.querySelectorAll(".segment-option").forEach((button) => {
        button.classList.toggle("active", button.dataset.value === value);
      });
    };
    control.querySelectorAll(".segment-option").forEach((button) => {
      button.addEventListener("click", () => {
        select.value = button.dataset.value || select.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        sync(select.value);
        if (typeof updateView === "function") updateView();
      });
    });
    select.addEventListener("change", () => sync(select.value));
    sync(select.value);
  });

  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      if (typeof updateView === "function") updateView();
      const target = document.querySelector(button.dataset.scrollTarget);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("target-flash");
      window.setTimeout(() => target.classList.remove("target-flash"), 1900);
    });
  });
}

setupEasyCalculatorControls();
