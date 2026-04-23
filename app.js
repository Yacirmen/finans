const TL_FORMAT = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const PERCENT_FORMAT = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const scenarios = {
  A: {
    assetPrice: 3000000,
    downPayment: 1000000,
    installmentCount: 48,
    monthlyPayment: 41667,
    deliveryMonth: 13,
    organizationFeeRate: 7.5,
    monthlyRent: 25000,
    annualInflation: 32,
    discountRate: 28,
    loanRate: 3.19,
    graduatedIncreaseRate: 15,
  },
  B: {
    assetPrice: 5000000,
    downPayment: 500000,
    installmentCount: 90,
    monthlyPayment: 55556,
    deliveryMonth: 12,
    organizationFeeRate: 8,
    monthlyRent: 25000,
    annualInflation: 32,
    discountRate: 28,
    loanRate: 3.19,
    graduatedIncreaseRate: 15,
  },
  C: {
    assetPrice: 4008163,
    downPayment: 350000,
    installmentCount: 23,
    monthlyPayment: 216667,
    deliveryMonth: 6,
    organizationFeeRate: 9,
    monthlyRent: 25000,
    annualInflation: 28.5,
    discountRate: 28.5,
    loanRate: 3.19,
    graduatedIncreaseRate: 12,
  },
};

const marketData = {
  indexScore: 47.5,
  season: "Geçiş / Kararsız Dönem",
  comment: "Kredi şartları pahalı; konut ve risk verileri henüz tek tarafa kopuş göstermiyor.",
  groups: [
    { name: "Kredi", score: 40.3, note: "Faiz ve kredi büyümesi tasarruf tarafını destekliyor." },
    { name: "Risk", score: 53.6, note: "Makro risk nötr bölgede; veri izlenmeli." },
    { name: "Konut", score: 49.4, note: "Talep ve maliyet sinyalleri dengede." },
  ],
};

const heroTabs = {
  calculation: {
    label: "Hesaplama",
    title: "Net maliyetinizi anında görün",
    text: "Peşinat, teslim süresi, kira ve organizasyon bedeli tek modelde toplanır.",
    cta: "Hesaplayıcıyı aç",
    target: "#calculator",
  },
  compare: {
    label: "Karşılaştırma",
    title: "Teklifleri aynı zeminde kıyaslayın",
    text: "Aylık ödeme, teslim ayı, hizmet bedeli ve toplam maliyet tek tabloda karşılaştırılır.",
    cta: "Teklifleri incele",
    target: "#offerCompare",
  },
  limit: {
    label: "Kredi Limit",
    title: "Bankadan çıkabilecek maksimum tutarı hesaplayın",
    text: "Ekspertiz değeri, enerji sınıfı ve ikinci konut bilgisine göre azami kredi alanı görünür.",
    cta: "Limit alanına bak",
    target: "#loanLimit",
  },
  index: {
    label: "Endeks",
    title: "Piyasanın kredi mi tasarruf mu dediğini okuyun",
    text: "Konut, taşıt, kredi ve risk sinyalleri karar termometresinde tek skor haline gelir.",
    cta: "Endeksi gör",
    target: "#marketData",
  },
};

const loanTable = [
  { max: 5000000, firstHome: { "A-B": 0.9, C: 0.8, Diger: 0.7 }, otherHome: { "A-B": 0.225, C: 0.2, Diger: 0.175 } },
  { max: 7000000, firstHome: { "A-B": 0.8, C: 0.7, Diger: 0.6 }, otherHome: { "A-B": 0.2, C: 0.175, Diger: 0.15 } },
  { max: 10000000, firstHome: { "A-B": 0.7, C: 0.6, Diger: 0.5 }, otherHome: { "A-B": 0.175, C: 0.15, Diger: 0.125 } },
  { max: 20000000, firstHome: { "A-B": 0.5, C: 0.4, Diger: 0.3 }, otherHome: { "A-B": 0.125, C: 0.1, Diger: 0.075 } },
  { max: Infinity, firstHome: { "A-B": 0.4, C: 0.3, Diger: 0.2 }, otherHome: { "A-B": 0.1, C: 0.075, Diger: 0.05 } },
];

function money(value) {
  return `₺${TL_FORMAT.format(Math.round(Number(value) || 0))}`;
}

function plainMoney(value) {
  return `${TL_FORMAT.format(Math.round(Number(value) || 0))} TL`;
}

function parseNumber(value) {
  if (typeof value !== "string") return Number(value) || 0;
  return Number(value.replace(/\./g, "").replace(",", ".")) || 0;
}

function setInput(id, value) {
  const input = document.getElementById(id);
  if (input) input.value = TL_FORMAT.format(value).replace(/,/g, ".");
}

function setDecimal(id, value) {
  const input = document.getElementById(id);
  if (input) input.value = String(value).replace(".", ",");
}

function readInput(id) {
  return parseNumber(document.getElementById(id)?.value || document.getElementById(id)?.dataset.default || "0");
}

function formatInputs() {
  document.querySelectorAll("input[inputmode='numeric']").forEach((input) => {
    input.addEventListener("blur", () => {
      const value = parseNumber(input.value || input.dataset.default || "0");
      input.value = value ? TL_FORMAT.format(value).replace(/,/g, ".") : "";
    });
  });
}

function monthlyRateFromAnnual(rate) {
  return Math.pow(1 + rate / 100, 1 / 12) - 1;
}

function loanInstallment(principal, monthlyRatePercent, monthCount) {
  const rate = monthlyRatePercent / 100;
  if (!principal || !monthCount) return 0;
  if (!rate) return principal / monthCount;
  const factor = Math.pow(1 + rate, monthCount);
  return (principal * rate * factor) / (factor - 1);
}

function buildCashflow(inputs) {
  const discountMonthly = monthlyRateFromAnnual(inputs.discountRate);
  const orgFee = inputs.assetPrice * (inputs.organizationFeeRate / 100);
  let cumulative = inputs.downPayment + orgFee;
  let presentValue = inputs.downPayment + orgFee;
  const rows = [];

  for (let month = 1; month <= inputs.installmentCount; month += 1) {
    const annualStep = Math.floor((month - 1) / 12);
    const installment = inputs.useGraduatedPlan
      ? inputs.monthlyPayment * Math.pow(1 + inputs.graduatedIncreaseRate / 100, annualStep)
      : inputs.monthlyPayment;
    const rent = month < inputs.deliveryMonth
      ? inputs.monthlyRent * Math.pow(1 + inputs.annualInflation / 100, annualStep)
      : 0;
    const total = installment + rent;
    cumulative += total;
    presentValue += total / Math.pow(1 + discountMonthly, month);
    rows.push({ month, installment, rent, other: month === 1 ? orgFee : 0, total, cumulative });
  }

  const principal = Math.max(0, inputs.assetPrice - inputs.downPayment);
  const bankMonthly = loanInstallment(principal, inputs.loanRate, inputs.installmentCount);
  const bankTotal = inputs.downPayment + bankMonthly * inputs.installmentCount;
  const nominalTotal = inputs.downPayment + orgFee + rows.reduce((sum, row) => sum + row.installment + row.rent, 0);

  return { rows, orgFee, presentValue, nominalTotal, bankMonthly, bankTotal };
}

function getInputs() {
  return {
    assetPrice: readInput("assetPrice"),
    downPayment: readInput("downPayment"),
    installmentCount: Math.max(1, readInput("installmentCount")),
    monthlyPayment: readInput("monthlyPayment"),
    deliveryMonth: Math.max(1, readInput("deliveryMonth")),
    organizationFeeRate: readInput("organizationFeeRate"),
    monthlyRent: readInput("monthlyRent"),
    annualInflation: readInput("annualInflation"),
    discountRate: readInput("discountRate"),
    loanRate: readInput("loanRate"),
    graduatedIncreaseRate: readInput("graduatedIncreaseRate"),
    useGraduatedPlan: Boolean(document.getElementById("useGraduatedPlan")?.checked),
  };
}

function renderCalculator() {
  const inputs = getInputs();
  const result = buildCashflow(inputs);
  const diff = result.nominalTotal - result.bankTotal;
  const cheaper = diff <= 0 ? "Tasarruf planı" : "Banka kredisi";

  document.getElementById("headlineStats").innerHTML = `
    <article class="stat-card"><span>Net bugünkü maliyet</span><strong>${money(result.presentValue)}</strong></article>
    <article class="stat-card"><span>Tahmini teslim</span><strong>${inputs.deliveryMonth}. ay</strong></article>
  `;

  document.getElementById("summaryCards").innerHTML = `
    <article class="summary-card"><span>Toplam nominal maliyet</span><strong>${money(result.nominalTotal)}</strong></article>
    <article class="summary-card"><span>Banka kredisi toplamı</span><strong>${money(result.bankTotal)}</strong></article>
    <article class="summary-card"><span>Aylık kredi taksiti</span><strong>${money(result.bankMonthly)}</strong></article>
  `;

  document.getElementById("comparisonBox").innerHTML = `
    <p>Bu senaryoda daha düşük nominal maliyet: <strong>${cheaper}</strong></p>
    <p>Fark: <strong>${money(Math.abs(diff))}</strong></p>
  `;

  document.getElementById("cashflowBody").innerHTML = result.rows.slice(0, 120).map((row) => `
    <tr>
      <td>${row.month}</td>
      <td>${money(row.installment)}</td>
      <td>${money(row.rent)}</td>
      <td>${money(row.other)}</td>
      <td>${money(row.total + row.other)}</td>
      <td>${money(row.cumulative)}</td>
    </tr>
  `).join("");
}

function fillScenario(key = "A") {
  const scenario = scenarios[key] || scenarios.A;
  setInput("assetPrice", scenario.assetPrice);
  setInput("downPayment", scenario.downPayment);
  setInput("installmentCount", scenario.installmentCount);
  setInput("monthlyPayment", scenario.monthlyPayment);
  setInput("deliveryMonth", scenario.deliveryMonth);
  setDecimal("organizationFeeRate", scenario.organizationFeeRate);
  setInput("monthlyRent", scenario.monthlyRent);
  setDecimal("annualInflation", scenario.annualInflation);
  setDecimal("discountRate", scenario.discountRate);
  setDecimal("loanRate", scenario.loanRate);
  setDecimal("graduatedIncreaseRate", scenario.graduatedIncreaseRate);
  renderCalculator();
}

function clearCalculator() {
  document.querySelectorAll("#calculator input").forEach((input) => {
    if (input.type === "checkbox") input.checked = false;
    else input.value = "";
  });
  renderCalculator();
}

function renderLoanLimit() {
  const value = readInput("ekspertizDegeri");
  const energy = document.getElementById("enerjiSinifi")?.value || "A-B";
  const otherHome = document.getElementById("baskaEviVar")?.value === "Evet";
  const row = loanTable.find((item) => value <= item.max) || loanTable[loanTable.length - 1];
  const ratio = otherHome ? row.otherHome[energy] : row.firstHome[energy];
  const maxLoan = value * ratio;
  document.getElementById("krediOraniSonuc").textContent = `%${PERCENT_FORMAT.format(ratio * 100)}`;
  document.getElementById("azamiKrediTutari").textContent = plainMoney(maxLoan);
}

function offerMarkup(index) {
  const defaults = [
    { company: "Eminevim", down: 500000, months: 90, pay: 52500, delivery: 12, fee: 8 },
    { company: "Fuzul Ev", down: 750000, months: 84, pay: 58000, delivery: 10, fee: 7.5 },
    { company: "Katılımevim", down: 1000000, months: 72, pay: 64000, delivery: 8, fee: 6.8 },
  ][index - 1];

  return `
    <h3>Teklif ${index}</h3>
    <label>Şirket<input id="offer${index}Company" value="${defaults.company}" /></label>
    <label>Varlık Fiyatı<input id="offer${index}AssetPrice" inputmode="numeric" value="5.000.000" /></label>
    <label>Peşinat<input id="offer${index}DownPayment" inputmode="numeric" value="${TL_FORMAT.format(defaults.down).replace(/,/g, ".")}" /></label>
    <label>Taksit Sayısı<input id="offer${index}InstallmentCount" inputmode="numeric" value="${defaults.months}" /></label>
    <label>Aylık Ödeme<input id="offer${index}MonthlyPayment" inputmode="numeric" value="${TL_FORMAT.format(defaults.pay).replace(/,/g, ".")}" /></label>
    <label>Teslim Ayı<input id="offer${index}DeliveryMonth" inputmode="numeric" value="${defaults.delivery}" /></label>
    <label>Organizasyon (%)<input id="offer${index}OrganizationFeeRate" inputmode="decimal" value="${String(defaults.fee).replace(".", ",")}" /></label>
    <label>Kira<input id="offer${index}MonthlyRent" inputmode="numeric" value="25.000" /></label>
  `;
}

function renderOffers() {
  document.querySelectorAll(".offer-card").forEach((card) => {
    const index = Number(card.dataset.offer);
    card.innerHTML = offerMarkup(index);
  });
}

function calculateOffers() {
  const summaries = [1, 2, 3].map((index) => {
    const asset = parseNumber(document.getElementById(`offer${index}AssetPrice`)?.value || "0");
    const down = parseNumber(document.getElementById(`offer${index}DownPayment`)?.value || "0");
    const months = parseNumber(document.getElementById(`offer${index}InstallmentCount`)?.value || "0");
    const pay = parseNumber(document.getElementById(`offer${index}MonthlyPayment`)?.value || "0");
    const fee = parseNumber(document.getElementById(`offer${index}OrganizationFeeRate`)?.value || "0");
    const delivery = parseNumber(document.getElementById(`offer${index}DeliveryMonth`)?.value || "0");
    const total = down + asset * (fee / 100) + pay * months;
    return { index, total, delivery };
  });
  const best = Math.min(...summaries.map((item) => item.total));
  document.getElementById("offerCompareSummary").innerHTML = summaries.map((item) => `
    <article class="offer-result">
      <span>Teklif ${item.index}${item.total === best ? " · En düşük" : ""}</span>
      <strong>${money(item.total)}</strong>
      <small>Teslim: ${item.delivery}. ay</small>
    </article>
  `).join("");
}

function renderMarket() {
  document.getElementById("marketIndexScore").textContent = marketData.indexScore.toFixed(1);
  document.getElementById("marketIndexSeason").textContent = marketData.season;
  document.getElementById("marketIndexComment").textContent = marketData.comment;
  document.getElementById("marketGroupCards").innerHTML = marketData.groups.map((group) => `
    <article class="market-group">
      <strong>${group.name}</strong>
      <span>${group.score.toFixed(1)}</span>
      <p>${group.note}</p>
    </article>
  `).join("");
}

function setupNavigationFlash() {
  document.querySelectorAll(".site-nav a, .hero-actions a, .header-cta").forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      window.setTimeout(() => {
        target.classList.add("target-flash");
        window.setTimeout(() => target.classList.remove("target-flash"), 1800);
      }, 250);
    });
  });
}

function setupHeroTabs() {
  const panel = document.getElementById("heroTabPanel");
  if (!panel) return;

  const render = (key) => {
    const data = heroTabs[key] || heroTabs.calculation;
    panel.innerHTML = `
      <span class="eyebrow">${data.label}</span>
      <h2>${data.title}</h2>
      <p>${data.text}</p>
      <a href="${data.target}">${data.cta}</a>
    `;
    document.querySelectorAll(".hero-tab").forEach((button) => {
      const isActive = button.dataset.heroTab === key;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
  };

  document.querySelectorAll(".hero-tab").forEach((button) => {
    button.addEventListener("click", () => render(button.dataset.heroTab));
  });

  panel.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    window.setTimeout(() => {
      target.classList.add("target-flash");
      window.setTimeout(() => target.classList.remove("target-flash"), 1800);
    }, 250);
  });
}

function boot() {
  formatInputs();
  renderOffers();
  renderMarket();
  fillScenario("A");
  renderLoanLimit();
  calculateOffers();
  setupHeroTabs();
  setupNavigationFlash();

  document.getElementById("calculator-form").addEventListener("submit", (event) => {
    event.preventDefault();
    renderCalculator();
  });
  document.querySelectorAll("#calculator input, #calculator select").forEach((field) => {
    field.addEventListener("input", renderCalculator);
    field.addEventListener("change", renderCalculator);
  });
  document.getElementById("fillExample").addEventListener("click", () => fillScenario(document.getElementById("exampleScenario").value));
  document.getElementById("clearForm").addEventListener("click", clearCalculator);
  document.querySelectorAll("#loanLimit input, #loanLimit select").forEach((field) => {
    field.addEventListener("input", renderLoanLimit);
    field.addEventListener("change", renderLoanLimit);
  });
  document.getElementById("fillCompareExamples").addEventListener("click", () => {
    renderOffers();
    calculateOffers();
  });
  document.getElementById("clearCompare").addEventListener("click", () => {
    document.querySelectorAll("#offerCompare input").forEach((input) => {
      input.value = "";
    });
    calculateOffers();
  });
  document.getElementById("offerCompare").addEventListener("input", calculateOffers);
}

document.addEventListener("DOMContentLoaded", boot);
