export function InteractionScript() {
  const script = `
(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  };

  ready(() => {
    const calculator = document.querySelector("[data-calculator]");
    const money = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
    const example = {
      company: "Diğer",
      assetPrice: "3000000",
      downPayment: "1000000",
      term: "48",
      monthlyPayment: "41667",
      delivery: "13",
      serviceFee: "7.5",
      rent: "25000",
      inflation: "32",
      creditRate: "3.19",
      yearlyIncrease: "15",
    };

    const parseNumber = (value) => {
      const raw = String(value || "").trim();
      const normalized = raw.includes(",")
        ? raw.replace(/\\./g, "").replace(",", ".")
        : /^\\d+\\.\\d{1,2}$/.test(raw)
          ? raw
          : raw.replace(/\\./g, "");
      const number = Number(normalized);
      return Number.isFinite(number) && number > 0 ? number : 0;
    };
    const formatMoney = (value) => "₺ " + money.format(Math.max(0, Math.round(value || 0)));
    const field = (name) => calculator?.querySelector('[data-field="' + name + '"]');

    const setToggle = (button, active) => {
      button.dataset.on = String(active);
      const track = button.querySelector("span");
      const knob = track?.querySelector("span");
      track?.classList.toggle("bg-[var(--green)]", active);
      track?.classList.toggle("bg-slate-200", !active);
      knob?.classList.toggle("left-6", active);
      knob?.classList.toggle("left-1", !active);
    };

    const updateDeliveryBar = () => {
      const delivery = parseNumber(field("delivery")?.value);
      const bar = calculator?.querySelector("[data-delivery-bar]");
      if (bar) bar.style.width = Math.min(100, Math.max(8, delivery * 3.7)) + "%";
    };

    const renderResult = () => {
      if (!calculator) return;
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
          error.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
      error?.classList.add("hidden");
      const serviceFeeAmount = assetPrice * serviceFeeRate / 100;
      const totalPaid = downPayment + serviceFeeAmount + monthly * term;
      const waitingCost = delivery * rent;
      const netCost = totalPaid + waitingCost - assetPrice;
      const bankComparison = Math.max(0, assetPrice - downPayment) * 1.62;
      const panel = calculator.querySelector("[data-result-panel]");
      if (!panel) return;
      panel.classList.remove("hidden");
      panel.innerHTML = [
        ["Net maliyet", formatMoney(netCost)],
        ["Toplam ödeme", formatMoney(totalPaid)],
        ["Hizmet bedeli", formatMoney(serviceFeeAmount)],
        ["Banka kıyası", compareBank ? formatMoney(bankComparison) : "Kapalı"],
      ].map(([label, value]) => '<div><span class="text-xs font-black uppercase tracking-wide text-slate-500">' + label + '</span><strong class="mt-2 block text-xl font-black text-slate-950">' + value + '</strong></div>').join("");
      panel.classList.add("scale-[1.015]", "shadow-[0_0_0_6px_rgba(6,148,95,0.14),0_18px_34px_rgba(6,148,95,0.16)]");
      setTimeout(() => panel.classList.remove("scale-[1.015]", "shadow-[0_0_0_6px_rgba(6,148,95,0.14),0_18px_34px_rgba(6,148,95,0.16)]"), 1000);
      setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
      console.info("[calculator] result updated", { assetPrice, downPayment, term, monthly, serviceFeeAmount, totalPaid, netCost, bankComparison });
    };

    calculator?.querySelectorAll("[data-segment]").forEach((button) => {
      button.addEventListener("click", () => {
        calculator.querySelectorAll('[data-segment="' + button.dataset.segment + '"]').forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      });
    });

    calculator?.querySelectorAll("[data-toggle]").forEach((button) => {
      button.addEventListener("click", () => setToggle(button, button.dataset.on !== "true"));
    });

    calculator?.querySelectorAll("[data-field]").forEach((input) => {
      input.addEventListener("input", updateDeliveryBar);
    });

    calculator?.querySelector("[data-fill-example]")?.addEventListener("click", () => {
      Object.entries(example).forEach(([name, value]) => {
        const input = field(name);
        if (input) input.value = value;
      });
      calculator.querySelectorAll("[data-segment]").forEach((item) => item.classList.remove("active"));
      calculator.querySelector('[data-segment="assetType"][data-value="Konut"]')?.classList.add("active");
      calculator.querySelector('[data-segment="model"][data-value="Çekilişsiz"]')?.classList.add("active");
      calculator.querySelectorAll("[data-toggle]").forEach((toggle) => setToggle(toggle, toggle.dataset.toggle === "compareBank"));
      calculator.querySelector("[data-result-panel]")?.classList.add("hidden");
      calculator.querySelector("[data-form-error]")?.classList.add("hidden");
      updateDeliveryBar();
      calculator.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    calculator?.querySelector("[data-clear-form]")?.addEventListener("click", () => {
      calculator.querySelectorAll("[data-field]").forEach((input) => { input.value = ""; });
      calculator.querySelector("[data-result-panel]")?.classList.add("hidden");
      calculator.querySelector("[data-form-error]")?.classList.add("hidden");
      calculator.querySelectorAll("[data-toggle]").forEach((toggle) => setToggle(toggle, false));
      updateDeliveryBar();
    });

    calculator?.querySelector("[data-calculate]")?.addEventListener("click", renderResult);
    document.querySelectorAll("[data-compare-cta]").forEach((link) => {
      link.addEventListener("click", () => {
        const compareToggle = calculator?.querySelector('[data-toggle="compareBank"]');
        if (compareToggle) setToggle(compareToggle, true);
        setTimeout(() => calculator?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
      });
    });

    document.querySelectorAll("[data-login-button]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const existing = document.querySelector("[data-login-modal]");
        if (existing) existing.remove();
        const modal = document.createElement("div");
        modal.dataset.loginModal = "true";
        modal.className = "fixed inset-0 z-[80] grid place-items-center bg-slate-950/35 p-4";
        modal.innerHTML = '<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"><h2 class="text-2xl font-black text-slate-950">Giriş alanı</h2><p class="mt-3 text-sm leading-6 text-slate-600">Demo arayüzde hesap girişi bağlanmadı; teklif karşılaştırma ve hesaplama araçlarını kullanabilirsiniz.</p><button class="mt-5 h-11 w-full rounded-xl bg-[var(--green)] text-sm font-black text-white" data-close-login>Kapat</button></div>';
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
      document.querySelectorAll("[data-blog-read]").forEach((link) => { link.textContent = "Kapat ↑"; });
    });
    updateDeliveryBar();

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
  });
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
