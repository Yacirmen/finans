export function InteractionScript() {
  const script = String.raw`
(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    const money = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
    const decimal = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const example = {
      company: "Diğer",
      assetPrice: "3000000",
      downPayment: "1000000",
      term: "48",
      monthlyPayment: "41667",
      delivery: "12",
      serviceFee: "11.8",
      rent: "25000",
      inflation: "32",
      creditRate: "3.19",
      yearlyIncrease: "15",
    };

    const assetPresets = {
      Konut: { assetPrice: 3000000, downPayment: 1000000, term: 48, monthlyPayment: 41667, delivery: 13, serviceFee: 7.5, rent: 25000, bankRate: 2.8, bankTerm: 120 },
      Araba: { assetPrice: 1850000, downPayment: 550000, term: 36, monthlyPayment: 38250, delivery: 6, serviceFee: 6.2, rent: 12000, bankRate: 3.15, bankTerm: 48 },
    };

    const modelTweaks = {
      cekilissiz: { deliveryDelta: 0, feeDelta: 0, monthlyDelta: 0 },
      cekilisli: { deliveryDelta: -1, feeDelta: 4.3, monthlyDelta: 0 },
    };

    const integerFields = ["assetPrice", "downPayment", "monthlyPayment", "rent"];
    const integerBankFields = ["amount"];
    const integerLimitFields = ["housingValue", "vehicleValue", "needValue"];

    const getCalculator = () => document.querySelector("[data-calculator]");
    const getCalculatorCard = () => getCalculator()?.querySelector("[data-calculator-card]");
    const getCompanySelect = () => getCalculator()?.querySelector("[data-company-select]");
    const getCompanyTrigger = () => getCompanySelect()?.querySelector("[data-company-trigger]");
    const getCompanyMenu = () => getCompanySelect()?.querySelector("[data-company-menu]");
    const getCompanyLabel = () => getCompanySelect()?.querySelector("[data-company-label]");
    const getCompanyChevron = () => getCompanySelect()?.querySelector("[data-company-chevron]");
    const field = (name) => getCalculator()?.querySelector('[data-field="' + name + '"]');
    const bankField = (name) => getCalculator()?.querySelector('[data-bank-field="' + name + '"]');
    const preview = (name) => document.querySelector('[data-preview="' + name + '"]');
    const activeSegmentValue = (segmentName) => getCalculator()?.querySelector('[data-segment="' + segmentName + '"].active')?.dataset.value || "";

    const parseNumber = (value) => {
      const raw = String(value || "").trim();
      const normalized = raw.includes(",")
        ? raw.replace(/\./g, "").replace(",", ".")
        : /^\d+\.\d{1,2}$/.test(raw)
          ? raw
          : raw.replace(/\./g, "");
      const number = Number(normalized);
      return Number.isFinite(number) && number >= 0 ? number : 0;
    };

    const formatMoney = (value) => "₺" + money.format(Math.max(0, Math.round(value || 0)));
    const formatPercent = (value) => "%" + decimal.format(value || 0);

    const pulse = (element, className = "button-ack", duration = 320) => {
      if (!element) return;
      element.classList.remove(className);
      void element.offsetWidth;
      element.classList.add(className);
      window.setTimeout(() => element.classList.remove(className), duration);
    };

    const acknowledge = (...elements) => {
      elements.filter(Boolean).forEach((element) => pulse(element, "surface-ack", 420));
    };

    const focusCalculator = () => {
      const card = getCalculatorCard();
      if (!card) return;
      pulse(card, "calculator-focus", 980);
    };

    const setToggle = (button, active) => {
      button.dataset.on = String(active);
      const track = button.querySelector("span");
      const knob = track?.querySelector("span");
      track?.classList.toggle("bg-[var(--green)]", active);
      track?.classList.toggle("bg-slate-200", !active);
      knob?.classList.toggle("left-6", active);
      knob?.classList.toggle("left-1", !active);
    };

    const setPreviewText = (name, value) => {
      const node = preview(name);
      if (!node) return;
      if (node.textContent !== value) {
        node.textContent = value;
        pulse(node, "preview-swap", 300);
      }
    };

    const formatThousandsInput = (input) => {
      if (!input) return;
      const digits = String(input.value || "").replace(/\D/g, "");
      input.value = digits ? money.format(Number(digits)) : "";
    };

    const monthlyDiscountRate = (annualInflation) => Math.pow(1 + annualInflation / 100, 1 / 12) - 1;

    const calculatePvPayments = (payment, term, annualInflation) => {
      const r = monthlyDiscountRate(annualInflation);
      if (!payment || !term) return 0;
      return Array.from({ length: term }).reduce((sum, _, index) => sum + payment / Math.pow(1 + r, index + 1), 0);
    };

    const calculateBankInstallment = (principal, rate, term) => {
      if (!principal || !rate || !term) return 0;
      const monthlyRate = rate / 100;
      const factor = Math.pow(1 + monthlyRate, term);
      return principal * monthlyRate * factor / (factor - 1);
    };

    const getLimitSection = () => document.querySelector("[data-loan-limit]");
    const limitField = (name) => getLimitSection()?.querySelector('[data-limit-field="' + name + '"]');
    const limitPreview = (name) => getLimitSection()?.querySelector('[data-limit-preview="' + name + '"]');
    const activeLimitTab = () => getLimitSection()?.querySelector('[data-limit-tab-button][data-active="true"]')?.dataset.limitTabButton || "housing";

    const setLimitPreviewText = (name, value) => {
      const node = limitPreview(name);
      if (!node) return;
      if (node.textContent !== value) {
        node.textContent = value;
        pulse(node, "preview-swap", 300);
      }
    };

    const calculateHousingLimit = (value, energyClass, hasAnotherHome) => {
      const safeValue = Math.max(0, value || 0);
      const rules = [
        { max: 5000000, noHome: { "A-B": 0.9, C: 0.8, Diger: 0.7 }, hasHome: { "A-B": 0.225, C: 0.2, Diger: 0.175 } },
        { max: 7000000, noHome: { "A-B": 0.8, C: 0.7, Diger: 0.6 }, hasHome: { "A-B": 0.2, C: 0.175, Diger: 0.15 } },
        { max: 10000000, noHome: { "A-B": 0.7, C: 0.6, Diger: 0.5 }, hasHome: { "A-B": 0.175, C: 0.15, Diger: 0.125 } },
        { max: 20000000, noHome: { "A-B": 0.5, C: 0.4, Diger: 0.3 }, hasHome: { "A-B": 0.125, C: 0.1, Diger: 0.075 } },
        { max: Number.POSITIVE_INFINITY, noHome: { "A-B": 0.4, C: 0.3, Diger: 0.2 }, hasHome: { "A-B": 0.1, C: 0.075, Diger: 0.05 } },
      ];
      const rule = rules.find((item) => safeValue <= item.max) || rules[rules.length - 1];
      const ratio = hasAnotherHome ? rule.hasHome[energyClass] : rule.noHome[energyClass];
      return { ratio, amount: safeValue * ratio };
    };

    const calculateVehicleLimit = (value) => {
      const safeValue = Math.max(0, value || 0);
      if (safeValue > 2000000) {
        return { eligible: false, ratio: 0, amount: 0, message: "2.000.000 TL üstü taşıt bedelinde kredi kullandırılamaz." };
      }
      let ratio = 0.7;
      if (safeValue > 1200000) ratio = 0.2;
      else if (safeValue > 800000) ratio = 0.3;
      else if (safeValue > 400000) ratio = 0.5;
      return { eligible: true, ratio, amount: safeValue * ratio, message: "" };
    };

    const calculateNeedTerm = (value) => {
      const safeValue = Math.max(0, value || 0);
      if (safeValue <= 125000) return 36;
      if (safeValue <= 250000) return 24;
      return 12;
    };

    const syncLoanLimit = () => {
      const section = getLimitSection();
      if (!section) return;

      const tab = activeLimitTab();
      section.querySelectorAll("[data-limit-panel]").forEach((panel) => panel.classList.toggle("hidden", panel.dataset.limitPanel !== tab));
      section.querySelectorAll("[data-limit-summary]").forEach((panel) => panel.classList.toggle("hidden", panel.dataset.limitSummary !== tab));

      if (tab === "housing") {
        const value = parseNumber(limitField("housingValue")?.value);
        const energyClass = limitField("energyClass")?.value || "A-B";
        const hasAnotherHome = (limitField("homeOwnership")?.value || "yok") === "var";
        const result = calculateHousingLimit(value, energyClass, hasAnotherHome);
        setLimitPreviewText("title", "Konut kredi modülü");
        setLimitPreviewText("housingRatio", "%" + decimal.format(result.ratio * 100));
        setLimitPreviewText("housingAmount", formatMoney(result.amount));
      }

      if (tab === "vehicle") {
        const value = parseNumber(limitField("vehicleValue")?.value);
        const result = calculateVehicleLimit(value);
        setLimitPreviewText("title", "Taşıt kredi modülü");
        setLimitPreviewText("vehicleAmount", result.eligible ? formatMoney(result.amount) : "Kredi yok");
        setLimitPreviewText("vehicleMessage", result.eligible ? "Uygulanan oran: %" + decimal.format(result.ratio * 100) : result.message);
      }

      if (tab === "need") {
        const value = parseNumber(limitField("needValue")?.value);
        const term = calculateNeedTerm(value);
        setLimitPreviewText("title", "İhtiyaç kredi modülü");
        setLimitPreviewText("needTerm", term + " ay");
        setLimitPreviewText(
          "needMessage",
          value <= 125000 ? "0 - 125.000 TL bandı için 36 ay" : value <= 250000 ? "125.000,01 - 250.000 TL bandı için 24 ay" : "250.000 TL üstü için 12 ay",
        );
      }
    };

    const syncCompanySelect = () => {
      const currentValue = field("company")?.value || "Diğer";
      const label = getCompanyLabel();
      const select = getCompanySelect();
      if (label) label.textContent = currentValue;
      select?.querySelectorAll("[data-company-option]").forEach((option) => {
        option.dataset.active = String(option.dataset.value === currentValue);
      });
    };

    const closeCompanyMenu = () => {
      const menu = getCompanyMenu();
      const trigger = getCompanyTrigger();
      const chevron = getCompanyChevron();
      if (!menu || !trigger) return;
      menu.classList.add("hidden");
      trigger.setAttribute("aria-expanded", "false");
      chevron?.classList.remove("rotate-180");
    };

    const openCompanyMenu = () => {
      const menu = getCompanyMenu();
      const trigger = getCompanyTrigger();
      const chevron = getCompanyChevron();
      if (!menu || !trigger) return;
      menu.classList.remove("hidden");
      trigger.setAttribute("aria-expanded", "true");
      chevron?.classList.add("rotate-180");
    };

    const updateDeliveryBar = () => {
      const bar = getCalculator()?.querySelector("[data-delivery-bar]");
      const delivery = parseNumber(field("delivery")?.value);
      if (bar) bar.style.width = Math.min(100, Math.max(18, delivery * 5.2)) + "%";
    };

    const updateBankPanelVisibility = () => {
      const compareBank = getCalculator()?.querySelector('[data-toggle="compareBank"]')?.dataset.on === "true";
      const bankPanel = getCalculator()?.querySelector("[data-bank-panel]");
      if (bankPanel) bankPanel.classList.toggle("hidden", !compareBank);
    };

    const syncSummary = () => {
      const calculator = getCalculator();
      if (!calculator) return;

      const assetType = activeSegmentValue("assetType") || "Konut";
      const model = activeSegmentValue("model") || "cekilissiz";
      const assetPrice = parseNumber(field("assetPrice")?.value);
      const downPayment = parseNumber(field("downPayment")?.value);
      const term = parseNumber(field("term")?.value);
      const monthlyPayment = parseNumber(field("monthlyPayment")?.value);
      const delivery = parseNumber(field("delivery")?.value);
      const serviceFee = parseNumber(field("serviceFee")?.value);
      const rent = parseNumber(field("rent")?.value);
      const inflation = parseNumber(field("inflation")?.value) || 32;
      const compareBank = calculator.querySelector('[data-toggle="compareBank"]')?.dataset.on === "true";

      const feeAmount = assetPrice * serviceFee / 100;
      const totalNominal = downPayment + feeAmount + monthlyPayment * term;
      const pvPayments = calculatePvPayments(monthlyPayment, term, inflation);
      const benefitPv = assetPrice / Math.pow(1 + monthlyDiscountRate(inflation), Math.max(1, delivery));
      const orgAndDown = downPayment + feeAmount;
      const netInitialCost = Math.max(orgAndDown + pvPayments - benefitPv, 0);

      setPreviewText("term", term ? term + " ay" : "—");
      setPreviewText("delivery", String(delivery || "—"));
      setPreviewText("assetType", assetType);
      setPreviewText("model", model === "cekilisli" ? "Çekilişli" : "Çekilişsiz");
      setPreviewText("assetPrice", formatMoney(assetPrice));
      setPreviewText("downPayment", formatMoney(downPayment));
      setPreviewText("monthlyPayment", formatMoney(monthlyPayment));
      setPreviewText("serviceFee", formatPercent(serviceFee));
      setPreviewText("rent", formatMoney(rent) + "/ay");
      setPreviewText("totalNominal", formatMoney(totalNominal));
      setPreviewText("benefitPv", formatMoney(benefitPv));
      setPreviewText("orgAndDown", formatMoney(orgAndDown));
      setPreviewText("paymentsPv", formatMoney(pvPayments));
      setPreviewText("netInitialCost", formatMoney(netInitialCost));

      const bankAmount = parseNumber(bankField("amount")?.value);
      const bankRate = parseNumber(bankField("rate")?.value);
      const bankTerm = parseNumber(bankField("term")?.value);
      const bankInstallment = calculateBankInstallment(bankAmount, bankRate, bankTerm);

      setPreviewText("bankAmount", compareBank ? formatMoney(bankAmount) : "Kapalı");
      setPreviewText("bankRate", compareBank ? formatPercent(bankRate) : "Kapalı");
      setPreviewText("bankTerm", compareBank ? bankTerm + " ay" : "Kapalı");
      setPreviewText("bankInstallment", compareBank ? formatMoney(bankInstallment) : "Kapalı");
    };

    const applyScenario = (changedByUser = false) => {
      const calculator = getCalculator();
      if (!calculator) return;

      const assetType = activeSegmentValue("assetType") || "Konut";
      const model = activeSegmentValue("model") || "cekilissiz";
      const preset = assetPresets[assetType] || assetPresets.Konut;
      const tweak = modelTweaks[model] || modelTweaks.cekilissiz;
      const escalating = calculator.querySelector('[data-toggle="escalating"]')?.dataset.on === "true";
      const manualPlan = calculator.querySelector('[data-toggle="manualPlan"]')?.dataset.on === "true";

      if (!manualPlan || !changedByUser) {
        const nextValues = {
          assetPrice: preset.assetPrice,
          downPayment: preset.downPayment,
          term: preset.term,
          monthlyPayment: Math.max(5000, preset.monthlyPayment + tweak.monthlyDelta + (escalating ? -2800 : 0)),
          delivery: Math.max(1, preset.delivery + tweak.deliveryDelta),
          serviceFee: Math.max(1, preset.serviceFee + tweak.feeDelta),
          rent: preset.rent,
        };

        Object.entries(nextValues).forEach(([name, value]) => {
          const input = field(name);
          if (input) {
            input.value = String(value);
            if (integerFields.includes(name)) formatThousandsInput(input);
          }
        });
      }

      if (!changedByUser) {
        const bankAmount = Math.max(0, parseNumber(field("assetPrice")?.value) - parseNumber(field("downPayment")?.value));
        if (bankField("amount")) {
          bankField("amount").value = String(bankAmount);
          formatThousandsInput(bankField("amount"));
        }
        if (bankField("rate")) bankField("rate").value = String(preset.bankRate);
        if (bankField("term")) bankField("term").value = String(preset.bankTerm);
      }

      updateBankPanelVisibility();
      updateDeliveryBar();
      syncCompanySelect();
      syncSummary();
    };

    const renderResult = () => {
      const calculator = getCalculator();
      if (!calculator) return;

      const assetPrice = parseNumber(field("assetPrice")?.value);
      const downPayment = parseNumber(field("downPayment")?.value);
      const term = parseNumber(field("term")?.value);
      const monthly = parseNumber(field("monthlyPayment")?.value);
      const delivery = parseNumber(field("delivery")?.value);
      const rent = parseNumber(field("rent")?.value);
      const serviceFeeRate = parseNumber(field("serviceFee")?.value);
      const compareBank = calculator.querySelector('[data-toggle="compareBank"]')?.dataset.on === "true";
      const error = calculator.querySelector("[data-form-error]");

      if (!assetPrice || !term || !monthly) {
        if (error) {
          error.textContent = "Lütfen varlık fiyatı, taksit sayısı ve aylık ödeme alanlarını doldurun.";
          error.classList.remove("hidden");
        }
        return;
      }

      error?.classList.add("hidden");

      const serviceFeeAmount = assetPrice * serviceFeeRate / 100;
      const totalPaid = downPayment + serviceFeeAmount + monthly * term;
      const waitingCost = delivery * rent;
      const netCost = totalPaid + waitingCost - assetPrice;
      const bankComparison = parseNumber(bankField("amount")?.value) * 1.08;
      const panel = document.querySelector("[data-result-panel]");
      if (!panel) return;

      panel.classList.remove("hidden");
      panel.innerHTML = [
        ["Net maliyet", formatMoney(netCost)],
        ["Toplam ödeme", formatMoney(totalPaid)],
        ["Hizmet bedeli", formatMoney(serviceFeeAmount)],
        ["Banka kıyası", compareBank ? formatMoney(bankComparison) : "Kapalı"],
      ]
        .map(([label, value]) => '<div><span class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">' + label + '</span><strong class="mt-2 block text-xl font-bold text-slate-900">' + value + "</strong></div>")
        .join("");

      pulse(panel, "choice-pop", 520);
      syncSummary();
    };

    const openLoginModal = () => {
      const existing = document.querySelector("[data-login-modal]");
      if (existing) existing.remove();
      const modal = document.createElement("div");
      modal.dataset.loginModal = "true";
      modal.className = "fixed inset-0 z-[80] grid place-items-center bg-slate-950/35 p-4";
      modal.innerHTML = '<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"><h2 class="text-2xl font-bold text-slate-950">Giriş alanı</h2><p class="mt-3 text-sm leading-6 text-slate-600">Demo arayüzde hesap girişi bağlanmadı; teklif karşılaştırma ve hesaplama araçlarını kullanabilirsiniz.</p><button class="mt-5 h-11 w-full rounded-xl bg-[#16a05a] text-sm font-bold text-white" data-close-login>Kapat</button></div>';
      document.body.appendChild(modal);
      modal.querySelector("[data-close-login]")?.addEventListener("click", () => modal.remove());
      modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.remove();
      });
    };

    const openNetInfoModal = () => {
      const existing = document.querySelector("[data-net-modal]");
      if (existing) existing.remove();
      const modal = document.createElement("div");
      modal.dataset.netModal = "true";
      modal.className = "fixed inset-0 z-[80] grid place-items-center bg-slate-950/35 p-4";
      modal.innerHTML = '<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 class="text-xl font-bold text-slate-900">Net Maliyet</h2><p class="mt-3 text-sm leading-7 text-slate-600">Net başlangıç maliyeti; peşinat, organizasyon ücreti ve bugünkü değer etkisini aynı zeminde toplayan karşılaştırma katmanıdır.</p><button class="mt-5 h-11 w-full rounded-xl bg-[#16a05a] text-sm font-bold text-white" data-close-net>Kapat</button></div>';
      document.body.appendChild(modal);
      modal.querySelector("[data-close-net]")?.addEventListener("click", () => modal.remove());
      modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.remove();
      });
    };

    document.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const calculator = getCalculator();
      const calculatorCard = getCalculatorCard();
      const summaryPanel = document.querySelector("[data-summary-panel]");
      const menuButton = document.querySelector("[data-mobile-menu-button]");
      const menu = document.querySelector("[data-mobile-menu]");

      const segmentButton = target.closest("[data-segment]");
      if (segmentButton instanceof HTMLElement && calculator) {
        calculator.querySelectorAll('[data-segment="' + segmentButton.dataset.segment + '"]').forEach((item) => item.classList.remove("active"));
        segmentButton.classList.add("active");
        pulse(segmentButton);
        acknowledge(calculatorCard, summaryPanel);
        applyScenario();
        return;
      }

      const toggleButton = target.closest("[data-toggle]");
      if (toggleButton instanceof HTMLElement && calculator) {
        setToggle(toggleButton, toggleButton.dataset.on !== "true");
        pulse(toggleButton);
        acknowledge(calculator.querySelector("[data-bank-panel]"), summaryPanel);
        applyScenario(true);
        return;
      }

      const companyTrigger = target.closest("[data-company-trigger]");
      if (companyTrigger instanceof HTMLElement) {
        const isOpen = companyTrigger.getAttribute("aria-expanded") === "true";
        if (isOpen) closeCompanyMenu();
        else openCompanyMenu();
        pulse(companyTrigger);
        return;
      }

      const companyOption = target.closest("[data-company-option]");
      if (companyOption instanceof HTMLElement) {
        const input = field("company");
        if (input) {
          input.value = companyOption.dataset.value || "Diğer";
          syncCompanySelect();
          closeCompanyMenu();
          pulse(getCompanyTrigger());
          acknowledge(calculatorCard, summaryPanel);
          syncSummary();
        }
        return;
      }

      const fillExampleButton = target.closest("[data-fill-example]");
      if (fillExampleButton instanceof HTMLElement && calculator) {
        pulse(fillExampleButton);
        Object.entries(example).forEach(([name, value]) => {
          const input = field(name);
          if (input) {
            input.value = value;
            if (integerFields.includes(name)) formatThousandsInput(input);
          }
        });
        calculator.querySelectorAll("[data-segment]").forEach((item) => item.classList.remove("active"));
        calculator.querySelector('[data-segment="assetType"][data-value="Konut"]')?.classList.add("active");
        calculator.querySelector('[data-segment="model"][data-value="cekilisli"]')?.classList.add("active");
        calculator.querySelectorAll("[data-toggle]").forEach((toggle) => setToggle(toggle, toggle.dataset.toggle === "compareBank"));
        syncCompanySelect();
        applyScenario();
        calculator.scrollIntoView({ behavior: "smooth", block: "start" });
        focusCalculator();
        return;
      }

      const clearButton = target.closest("[data-clear-form]");
      if (clearButton instanceof HTMLElement && calculator) {
        pulse(clearButton);
        calculator.querySelectorAll("[data-field]").forEach((input) => {
          input.value = "";
        });
        calculator.querySelectorAll("[data-bank-field]").forEach((input) => {
          input.value = "";
        });
        document.querySelector("[data-result-panel]")?.classList.add("hidden");
        calculator.querySelector("[data-form-error]")?.classList.add("hidden");
        calculator.querySelectorAll("[data-toggle]").forEach((toggle) => setToggle(toggle, false));
        syncCompanySelect();
        closeCompanyMenu();
        updateBankPanelVisibility();
        updateDeliveryBar();
        syncSummary();
        return;
      }

      const calculateButton = target.closest("[data-calculate]");
      if (calculateButton instanceof HTMLElement) {
        pulse(calculateButton);
        acknowledge(summaryPanel);
        renderResult();
        return;
      }

      const runScenarioButton = target.closest("[data-run-scenario]");
      if (runScenarioButton instanceof HTMLElement && calculator) {
        pulse(runScenarioButton);
        calculator.querySelector("[data-fill-example]")?.dispatchEvent(new Event("click", { bubbles: true }));
        window.setTimeout(() => {
          calculator.querySelector("[data-calculate]")?.dispatchEvent(new Event("click", { bubbles: true }));
        }, 160);
        return;
      }

      const compareCta = target.closest("[data-compare-cta]");
      if (compareCta instanceof HTMLElement && calculator) {
        pulse(compareCta);
        const compareToggle = calculator.querySelector('[data-toggle="compareBank"]');
        if (compareToggle) setToggle(compareToggle, true);
        window.setTimeout(() => {
          calculator.scrollIntoView({ behavior: "smooth", block: "start" });
          focusCalculator();
          updateBankPanelVisibility();
          syncSummary();
        }, 40);
        return;
      }

      const loginButton = target.closest("[data-login-button]");
      if (loginButton instanceof HTMLElement) {
        event.preventDefault();
        pulse(loginButton);
        openLoginModal();
        return;
      }

      const netInfoButton = target.closest("[data-net-info]");
      if (netInfoButton instanceof HTMLElement) {
        pulse(netInfoButton);
        openNetInfoModal();
        return;
      }

      const downloadPdfButton = target.closest("[data-download-pdf]");
      if (downloadPdfButton instanceof HTMLElement) {
        pulse(downloadPdfButton);
        window.print();
        return;
      }

      const copyLinkButton = target.closest("[data-copy-link]");
      if (copyLinkButton instanceof HTMLElement) {
        pulse(copyLinkButton);
        try {
          await navigator.clipboard.writeText(window.location.href);
          const original = copyLinkButton.textContent;
          copyLinkButton.textContent = "Link Kopyalandı";
          window.setTimeout(() => {
            copyLinkButton.textContent = original;
          }, 1400);
        } catch (error) {
          console.warn("copy failed", error);
        }
        return;
      }

      const blogRead = target.closest("[data-blog-read]");
      if (blogRead instanceof HTMLElement) {
        event.preventDefault();
        const detail = blogRead.closest("[data-blog-card]")?.querySelector("[data-blog-detail]");
        detail?.classList.toggle("hidden");
        blogRead.textContent = detail?.classList.contains("hidden") ? "Devamını Oku →" : "Kapat ↑";
        return;
      }

      const blogAll = target.closest("[data-blog-all]");
      if (blogAll instanceof HTMLElement) {
        event.preventDefault();
        document.querySelectorAll("[data-blog-detail]").forEach((detail) => detail.classList.remove("hidden"));
        document.querySelectorAll("[data-blog-read]").forEach((link) => {
          link.textContent = "Kapat ↑";
        });
        return;
      }

      const mobileMenuButton = target.closest("[data-mobile-menu-button]");
      if (mobileMenuButton instanceof HTMLElement) {
        const isOpen = !menu?.classList.contains("hidden");
        menu?.classList.toggle("hidden", isOpen);
        mobileMenuButton.setAttribute("aria-expanded", String(!isOpen));
        return;
      }

      const limitTabButton = target.closest("[data-limit-tab-button]");
      if (limitTabButton instanceof HTMLElement) {
        const section = getLimitSection();
        section?.querySelectorAll("[data-limit-tab-button]").forEach((button) => {
          button.dataset.active = String(button === limitTabButton);
        });
        pulse(limitTabButton);
        acknowledge(section);
        syncLoanLimit();
        return;
      }

      const mobileMenuLink = target.closest("[data-mobile-menu] a");
      if (mobileMenuLink instanceof HTMLElement) {
        menu?.classList.add("hidden");
        menuButton?.setAttribute("aria-expanded", "false");
        return;
      }

      const companySelect = getCompanySelect();
      if (!companySelect || companySelect.contains(target)) return;
      closeCompanyMenu();
    });

    document.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.matches("[data-limit-field]")) {
        if (integerLimitFields.includes(target.dataset.limitField)) {
          formatThousandsInput(target);
        }
        syncLoanLimit();
        return;
      }
      if (!target.matches("[data-field], [data-bank-field]")) return;
      if (integerFields.includes(target.dataset.field) || integerBankFields.includes(target.dataset.bankField)) {
        formatThousandsInput(target);
      }
      updateDeliveryBar();
      syncSummary();
    });

    document.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      if (target.matches("[data-limit-field]")) {
        syncLoanLimit();
      }
    });

    document.addEventListener("focusout", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
      if (target instanceof HTMLInputElement && target.matches("[data-limit-field]")) {
        if (integerLimitFields.includes(target.dataset.limitField)) {
          formatThousandsInput(target);
        }
        syncLoanLimit();
        return;
      }
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.matches("[data-field], [data-bank-field]")) return;
      if (integerFields.includes(target.dataset.field) || integerBankFields.includes(target.dataset.bankField)) {
        formatThousandsInput(target);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeCompanyMenu();
      }
    });

    const scrollToHash = () => {
      if (!location.hash) return;
      const target = document.querySelector(location.hash);
      if (!(target instanceof HTMLElement)) return;
      const run = () => {
        const top = target.getBoundingClientRect().top + window.scrollY - 92;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        if (target === getCalculator()) focusCalculator();
      };
      setTimeout(run, 80);
      setTimeout(run, 500);
    };

    document.querySelectorAll("[data-field], [data-bank-field]").forEach((input) => {
      if (integerFields.includes(input.dataset.field) || integerBankFields.includes(input.dataset.bankField)) {
        formatThousandsInput(input);
      }
    });

    syncCompanySelect();
    applyScenario();
    document.querySelectorAll("[data-limit-field]").forEach((input) => {
      if (input instanceof HTMLInputElement && integerLimitFields.includes(input.dataset.limitField)) {
        formatThousandsInput(input);
      }
    });
    syncLoanLimit();
    window.addEventListener("hashchange", scrollToHash);
    scrollToHash();
  });
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
