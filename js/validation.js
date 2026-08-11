/**
 * validation.js
 * Small, dependency-free validation helpers. No alert() — every
 * result is written inline and wired for aria-live announcement.
 */

const Validate = {
  required(value) {
    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
  },

  email(value) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return re.test(value.trim());
  },

  phone(value) {
    // Accepts international formats with optional +, spaces, dashes.
    const digits = value.replace(/[\s\-()]/g, "");
    const re = /^\+?\d{7,15}$/;
    return re.test(digits);
  },

  name(value) {
    return value.trim().length >= 2 && /^[a-zA-Z\u00C0-\u024F\s.'-]+$/.test(value.trim());
  },

  dateNotEmpty(value) {
    return Boolean(value);
  },

  dateOrderValid(departure, ret) {
    if (!departure || !ret) return false;
    const d = new Date(departure);
    const r = new Date(ret);
    if (isNaN(d.getTime()) || isNaN(r.getTime())) return false;
    return r.getTime() > d.getTime();
  },

  budgetInRange(value, min, max) {
    const n = Number(value);
    return !isNaN(n) && n >= min && n <= max;
  },
};

/**
 * Applies a visual + accessible state to a field.
 * state: "error" | "success" | "" (neutral / reset)
 */
function setFieldState(inputEl, statusEl, state, message) {
  if (inputEl) {
    inputEl.classList.remove("is-valid");
    if (state === "error") {
      inputEl.setAttribute("aria-invalid", "true");
    } else {
      inputEl.removeAttribute("aria-invalid");
      if (state === "success") inputEl.classList.add("is-valid");
    }
  }
  if (statusEl) {
    statusEl.dataset.state = state || "";
    if (state === "error") {
      statusEl.innerHTML = `<span class="icon" aria-hidden="true">✕</span> ${message}`;
    } else if (state === "success") {
      statusEl.innerHTML = `<span class="icon" aria-hidden="true">✓</span> ${message || "Looks good"}`;
    } else {
      statusEl.innerHTML = "";
    }
  }
}

function shakeField(el) {
  if (!el) return;
  el.classList.remove("fade-shake");
  // Force reflow so the animation can retrigger.
  void el.offsetWidth;
  el.classList.add("fade-shake");
}
