// ==========================================================
// Checkout modal + WhatsApp payment flow
// Monthly-only pricing version
// ==========================================================

// ---- Payment contact details ----
const PAYMENT_INFO = {
  whatsapp: "201500263132",
  instapay: "YouSpeakAcademy@instapay",
  vodafone: "010XXXXXXXX",
};

let overlay;
let currentMethod = "instapay";

// ---- Generate order code ----
function genOrderCode() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const d = new Date();

  const stamp =
    (d.getMonth() + 1).toString().padStart(2, "0") +
    d.getDate().toString().padStart(2, "0");

  return "YS-" + stamp + "-" + rand;
}

// ---- Get plan information ----
function getPlanInfo(btn) {
  const ticket = btn.closest(".ticket");

  if (!ticket) {
    console.error("Plan ticket not found.");
    return null;
  }

  const priceElement = ticket.querySelector(".js-price, .new");
  const priceBlock = ticket.querySelector(".price-block");

  const price =
    priceElement?.textContent.trim() || priceBlock?.dataset.m1 || "";

  const planName = btn.dataset.plan || "الخطة المختارة";

  if (!price) {
    console.error("Plan price not found.");
    return null;
  }

  return {
    planName,
    price,
    duration: "شهر واحد",
  };
}

// ---- Direct WhatsApp inquiry ----
function openWhatsAppInquiry(btn) {
  const plan = getPlanInfo(btn);

  if (!plan) return;

  const msg =
    'السلام عليكم، حابب أعرف تفاصيل أكتر عن خطة "' +
    plan.planName +
    '" (' +
    plan.duration +
    ") بسعر " +
    plan.price +
    " جنيه.";

  const url =
    "https://wa.me/" +
    PAYMENT_INFO.whatsapp +
    "?text=" +
    encodeURIComponent(msg);

  window.open(url, "_blank", "noopener,noreferrer");
}

// ---- Checkout modal ----
function openCheckout(btn) {
  const plan = getPlanInfo(btn);

  if (!plan) return;

  if (!overlay) {
    overlay = document.getElementById("checkoutOverlay");
  }

  if (!overlay) {
    console.error("Checkout modal not found.");
    return;
  }

  const orderCode = genOrderCode();

  document.querySelector(".co-plan").textContent = plan.planName;
  document.querySelector(".co-price").textContent = plan.price + " جنيه";

  document.querySelector(".co-duration").textContent =
    "(" + plan.duration + ")";

  document.querySelector(".co-code").textContent = orderCode;

  document.querySelectorAll(".co-price-inline").forEach((el) => {
    el.textContent = plan.price;
  });

  const inlineCode = document.querySelector(".co-code-inline");

  if (inlineCode) {
    inlineCode.textContent = orderCode;
  }

  const instapay = document.getElementById("instapayHandle");
  const vodafone = document.getElementById("vodafoneNumber");

  if (instapay) instapay.textContent = PAYMENT_INFO.instapay;
  if (vodafone) vodafone.textContent = PAYMENT_INFO.vodafone;

  const confirmBtn = document.getElementById("coConfirmBtn");

  if (confirmBtn) {
    const msg =
      'السلام عليكم، عايز أأكد حجز خطة "' +
      plan.planName +
      '" (' +
      plan.duration +
      ") بمبلغ " +
      plan.price +
      " جنيه.\nرقم الطلب: " +
      orderCode +
      "\nهبعت إيصال التحويل دلوقتي.";

    confirmBtn.href =
      "https://wa.me/" +
      PAYMENT_INFO.whatsapp +
      "?text=" +
      encodeURIComponent(msg);
  }

  const instapayTab = document.querySelector('.co-tab[data-method="instapay"]');

  if (instapayTab) {
    switchMethod(instapayTab);
  }

  overlay.classList.add("open");

  requestAnimationFrame(() => {
    overlay.classList.add("show");
  });

  document.body.style.overflow = "hidden";
}

// ---- Close checkout ----
function closeCheckout() {
  if (!overlay) return;

  overlay.classList.remove("show");
  document.body.style.overflow = "";

  setTimeout(() => {
    overlay.classList.remove("open");
  }, 200);
}

// ---- Switch payment method ----
function switchMethod(tab) {
  if (!tab) return;

  currentMethod = tab.dataset.method;

  document.querySelectorAll(".co-tab").forEach((t) => {
    t.classList.toggle("active", t === tab);
  });

  document.querySelectorAll("[data-method-panel]").forEach((panel) => {
    panel.style.display =
      panel.dataset.methodPanel === currentMethod ? "block" : "none";
  });
}

// ---- Copy payment information ----
function copyValue(elId, btn) {
  const element = document.getElementById(elId);

  if (!element) return;

  const text = element.textContent.trim();

  navigator.clipboard
    .writeText(text)
    .then(() => {
      const original = btn.textContent;

      btn.textContent = "اتنسخت ✓";
      btn.classList.add("copied");

      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1600);
    })
    .catch(() => {
      alert("انسخي: " + text);
    });
}

// ---- Initialize checkout ----
export function initCheckout() {
  overlay = document.getElementById("checkoutOverlay");

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCheckout();
  });

  // Expose functions for inline HTML onclick attributes.
  window.openWhatsAppInquiry = openWhatsAppInquiry;
  window.openCheckout = openCheckout;
  window.closeCheckout = closeCheckout;
  window.switchMethod = switchMethod;
  window.copyValue = copyValue;
}
