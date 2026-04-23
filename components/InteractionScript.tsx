export function InteractionScript() {
  const script = `
(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  };

  ready(() => {
    const calculator = document.querySelector("[data-calculator]");
    const calculatorCard = calculator?.querySelector("[data-calculator-card]");
    if (!calculator) return;

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

    const parseNumber = (value) => {
      const raw = String(value || "").trim();
      const normalized = raw.includes(",")
        ? raw.replace(/\\./g, "").replace(",", ".")
        : /^\\d+\\.\\d{1,2}$/.test(raw)
          ? raw
          : raw.replace(/\\./g, "");
      const number = Number(normalized);
      return Number.isFinite(number) && number >= 0 ? number : 0;
    };

    const formatMoney = (value) => "₺" + money.format(Math.max(0, Math.round(value || 0)));
    const formatPercent = (value) => "%" + decimal.format(value || 0);
    const field = (name) => calculator.querySelector('[data-field="' + name + '"]');
    const bankField = (name) => calculator.querySelector('[data-bank-field="' + name + '"]');
    const preview = (name) => document.querySelector('[data-preview="' + name + '"]');
    const activeSegmentValue = (segmentName) => calculator.querySelector('[data-segment="' + segmentName + '"].active')?.dataset.value || "";

    const companySelect = calculator.querySelector("[data-company-select]");
    const companyTrigger = companySelect?.querySelector("[data-company-trigger]");
    const companyMenu = companySelect?.querySelector("[data-company-menu]");
    const companyLabel = companySelect?.querySelector("[data-company-label]");
    const companyChevron = companySelect?.querySelector("[data-company-chevron]");

    const pulse = (element, className = "button-ack", duration = 320) => {
      if (!element) return;
      element.classList.remove(className);
      void element.offsetWidth;
      element.classList.add(className);
      window.setTimeout(() => element.classList.remove(className), duration);
    };

    const focusCalculator = () => {
      if (!calculatorCard) return;
      pulse(calculatorCard, "calculator-focus", 980);
    };

    const acknowledge = (...elements) => {
      elements.filter(Boolean).forEach((element) => pulse(element, "surface-ack", 460));
    };

    const integerFields = ["assetPrice", "downPayment", "monthlyPayment", "rent"];
    const integerBankFields = ["amount"];

    const syncCompanySelect = () => {
      const currentValue = field("company")?.value || "Diğer";
      if (companyLabel) companyLabel.textContent = currentValue;
      companySelect?.querySelectorAll("[data-company-option]").forEach((option) => {
        option.dataset.active = String(option.dataset.value === currentValue);
      });
    };

    const closeCompanyMenu = () => {
      if (!companyMenu || !companyTrigger) return;
      companyMenu.classList.add("hidden");
      companyTrigger.setAttribute("aria-expanded", "false");
      companyChevron?.classList.remove("rotate-180");
    };

    const openCompanyMenu = () => {
      if (!companyMenu || !companyTrigger) return;
      companyMenu.classList.remove("hidden");
      companyTrigger.setAttribute("aria-expanded", "true");
      companyChevron?.classList.add("rotate-180");
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
      const digits = String(input.value || "").replace(/\\D/g, "");
      if (!digits) {
        input.value = "";
        return;
      }
      input.value = money.format(Number(digits));
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

    const updateDeliveryBar = () => {
      const delivery = parseNumber(field("delivery")?.value);
      const bar = calculator.querySelector("[data-delivery-bar]");
      if (bar) bar.style.width = Math.min(100, Math.max(18, delivery * 5.2)) + "%";
    };

    const updateBankPanelVisibility = () => {
      const compareBank = calculator.querySelector('[data-toggle="compareBank"]')?.dataset.on === "true";
      const bankPanel = calculator.querySelector("[data-bank-panel]");
      if (bankPanel) bankPanel.classList.toggle("hidden", !compareBank);
    };

    const syncSummary = () => {
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
        const bankRate = preset.bankRate;
        const bankTerm = preset.bankTerm;
        if (bankField("amount")) {
          bankField("amount").value = String(bankAmount);
          formatThousandsInput(bankField("amount"));
        }
        if (bankField("rate")) bankField("rate").value = String(bankRate);
        if (bankField("term")) bankField("term").value = String(bankTerm);
      }

      updateBankPanelVisibility();
      updateDeliveryBar();
      syncCompanySelect();
      syncSummary();
    };

    const renderResult = () => {
      const assetPrice = parseNumber(field("assetPrice")?.value);
      const downPayment = parseNumber(field("downPayment")?.value);
      const term = parseNumber(field("term")?.value);
      const monthly = parseNumber(field("monthlyPayment")?.value);
      const delivery = parseNumber(field("delivery")?.value);
      const serviceFeeRate = parseNumber(field("serviceFee")?.value);
      const rent = parseNumber(field("rent")?.value);
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
        .map(([label, value]) => '<div><span class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">' + label + '</span><strong class="mt-2 block text-xl font-bold text-slate-900">' + value + '</strong></div>')
        .join("");

      pulse(panel, "choice-pop", 520);
      syncSummary();
    };

    calculator.querySelectorAll("[data-segment]").forEach((button) => {
      button.addEventListener("click", () => {
        calculator.querySelectorAll('[data-segment="' + button.dataset.segment + '"]').forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        pulse(button);
        acknowledge(calculatorCard, document.querySelector("[data-summary-panel]"));
        applyScenario();
      });
    });

    calculator.querySelectorAll("[data-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        setToggle(button, button.dataset.on !== "true");
        pulse(button);
        acknowledge(calculator.querySelector("[data-bank-panel]"), document.querySelector("[data-summary-panel]"));
        applyScenario(true);
      });
    });

    companyTrigger?.addEventListener("click", () => {
      const isOpen = companyTrigger.getAttribute("aria-expanded") === "true";
      if (isOpen) closeCompanyMenu();
      else openCompanyMenu();
      pulse(companyTrigger);
    });

    companySelect?.querySelectorAll("[data-company-option]").forEach((option) => {
      option.addEventListener("click", () => {
        const input = field("company");
        if (!input) return;
        input.value = option.dataset.value || "Diğer";
        syncCompanySelect();
        closeCompanyMenu();
        pulse(companyTrigger);
        acknowledge(calculatorCard, document.querySelector("[data-summary-panel]"));
        syncSummary();
      });
    });

    document.addEventListener("click", (event) => {
      if (!companySelect || companySelect.contains(event.target)) return;
      closeCompanyMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeCompanyMenu();
    });

    calculator.querySelectorAll("[data-field], [data-bank-field]").forEach((input) => {
      input.addEventListener("input", () => {
        if (integerFields.includes(input.dataset.field) || integerBankFields.includes(input.dataset.bankField)) {
          formatThousandsInput(input);
        }
        updateDeliveryBar();
        syncSummary();
      });
      input.addEventListener("blur", () => {
        if (integerFields.includes(input.dataset.field) || integerBankFields.includes(input.dataset.bankField)) {
          formatThousandsInput(input);
        }
      });
    });

    calculator.querySelector("[data-fill-example]")?.addEventListener("click", () => {
      pulse(calculator.querySelector("[data-fill-example]"));
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
    });

    calculator.querySelector("[data-clear-form]")?.addEventListener("click", () => {
      pulse(calculator.querySelector("[data-clear-form]"));
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
    });

    calculator.querySelector("[data-calculate]")?.addEventListener("click", (event) => {
      pulse(event.currentTarget);
      acknowledge(document.querySelector("[data-summary-panel]"));
      renderResult();
    });

    document.querySelector("[data-run-scenario]")?.addEventListener("click", (event) => {
      pulse(event.currentTarget);
      calculator.querySelector("[data-fill-example]")?.dispatchEvent(new Event("click", { bubbles: true }));
      window.setTimeout(() => {
        calculator.querySelector("[data-calculate]")?.dispatchEvent(new Event("click", { bubbles: true }));
      }, 160);
    });

    document.querySelectorAll("[data-compare-cta]").forEach((link) => {
      link.addEventListener("click", () => {
        pulse(link);
        const compareToggle = calculator.querySelector('[data-toggle="compareBank"]');
        if (compareToggle) setToggle(compareToggle, true);
        window.setTimeout(() => {
          calculator.scrollIntoView({ behavior: "smooth", block: "start" });
          focusCalculator();
          updateBankPanelVisibility();
          syncSummary();
        }, 40);
      });
    });

    document.querySelector("[data-net-info]")?.addEventListener("click", (event) => {
      const button = event.currentTarget;
      pulse(button);
      const existing = document.querySelector("[data-net-modal]");
      if (existing) existing.remove();
      const modal = document.createElement("div");
      modal.dataset.netModal = "true";
      modal.className = "fixed inset-0 z-[80] grid place-items-center bg-slate-950/35 p-4";
      modal.innerHTML = '<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 class="text-xl font-bold text-slate-900">Net Maliyet</h2><p class="mt-3 text-sm leading-7 text-slate-600">Net başlangıç maliyeti; peşinat, organizasyon ücreti ve bugünkü değer etkisini aynı zeminde toplayan karşılaştırma katmanıdır.</p><button class="mt-5 h-11 w-full rounded-xl bg-[#16a05a] text-sm font-bold text-white" data-close-net>Kapat</button></div>';
      document.body.appendChild(modal);
      modal.querySelector("[data-close-net]")?.addEventListener("click", () => modal.remove());
      modal.addEventListener("click", (modalEvent) => {
        if (modalEvent.target === modal) modal.remove();
      });
    });

    document.querySelector("[data-download-pdf]")?.addEventListener("click", (event) => {
      pulse(event.currentTarget);
      window.print();
    });

    document.querySelector("[data-copy-link]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      pulse(button);
      try {
        await navigator.clipboard.writeText(window.location.href);
        const original = button.textContent;
        button.textContent = "Link Kopyalandı";
        window.setTimeout(() => {
          button.textContent = original;
        }, 1400);
      } catch (error) {
        console.warn("copy failed", error);
      }
    });

    document.querySelectorAll("[data-login-button]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        pulse(link);
        const existing = document.querySelector("[data-login-modal]");
        if (existing) existing.remove();
        const modal = document.createElement("div");
        modal.dataset.loginModal = "true";
        modal.className = "fixed inset-0 z-[80] grid place-items-center bg-slate-950/35 p-4";
        modal.innerHTML = '<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"><h2 class="text-2xl font-bold text-slate-950">Giriş alanı</h2><p class="mt-3 text-sm leading-6 text-slate-600">Demo arayüzde hesap girişi bağlanmadı; teklif karşılaştırma ve hesaplama araçlarını kullanabilirsiniz.</p><button class="mt-5 h-11 w-full rounded-xl bg-[#16a05a] text-sm font-bold text-white" data-close-login>Kapat</button></div>';
        document.body.appendChild(modal);
        modal.querySelector("[data-close-login]")?.addEventListener("click", () => modal.remove());
        modal.addEventListener("click", (modalEvent) => {
          if (modalEvent.target === modal) modal.remove();
        });
      });
    });

    document.querySelectorAll("[data-blog-read]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const detail = link.closest("[data-blog-card]")?.querySelector("[data-blog-detail]");
        detail?.classList.toggle("hidden");
        link.textContent = detail?.classList.contains("hidden") ? "Devamını Oku →" : "Kapat ↑";
      });
    });

    document.querySelector("[data-blog-all]")?.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelectorAll("[data-blog-detail]").forEach((detail) => detail.classList.remove("hidden"));
      document.querySelectorAll("[data-blog-read]").forEach((link) => {
        link.textContent = "Kapat ↑";
      });
    });

    const menuButton = document.querySelector("[data-mobile-menu-button]");
    const menu = document.querySelector("[data-mobile-menu]");
    menuButton?.addEventListener("click", () => {
      const isOpen = !menu?.classList.contains("hidden");
      menu?.classList.toggle("hidden", isOpen);
      menuButton.setAttribute("aria-expanded", String(!isOpen));
    });

    menu?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.add("hidden");
        menuButton?.setAttribute("aria-expanded", "false");
      });
    });

    const scrollToHash = () => {
      if (!location.hash) return;
      const target = document.querySelector(location.hash);
      const run = () => {
        if (!target) return;
        const top = target.getBoundingClientRect().top + window.scrollY - 92;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        if (target === calculator) focusCalculator();
      };
      setTimeout(run, 80);
      setTimeout(run, 500);
    };

    calculator.querySelectorAll("[data-field], [data-bank-field]").forEach((input) => {
      if (integerFields.includes(input.dataset.field) || integerBankFields.includes(input.dataset.bankField)) {
        formatThousandsInput(input);
      }
    });

    syncCompanySelect();
    applyScenario();
    window.addEventListener("hashchange", scrollToHash);
    scrollToHash();
  });
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
