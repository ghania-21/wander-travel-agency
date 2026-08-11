/**
 * planner.js
 * Drives the 8-step journey builder: state, step navigation,
 * interactive controls, validation, review and submission.
 */

(function () {
  const TOTAL_STEPS = 8;

  const state = {
    destinationId: null,
    departureDate: "",
    returnDate: "",
    adults: 2,
    children: 0,
    travelType: "Couple",
    interests: [],
    budget: 280000,
    accommodation: "Hotel",
    transportation: "Flight",
    pace: "Balanced",
    fullName: "",
    email: "",
    phone: "",
  };

  let currentStep = 1;
  let plannerGlobe = null;

  const el = (id) => document.getElementById(id);

  /* ---------------- Step navigation ---------------- */

  function goToStep(step) {
    currentStep = Math.min(Math.max(step, 1), TOTAL_STEPS);

    document.querySelectorAll(".step").forEach((s) => {
      s.classList.toggle("is-active", Number(s.dataset.step) === currentStep);
    });

    el("progressCurrent").textContent = String(currentStep).padStart(2, "0");
    el("progressFill").style.width = `${(currentStep / TOTAL_STEPS) * 100}%`;
    el("stepStatus").textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;
    el("backBtn").disabled = currentStep === 1;

    const nextBtn = el("nextBtn");
    if (currentStep === TOTAL_STEPS) {
      nextBtn.style.display = "none";
      renderReview();
    } else {
      nextBtn.style.display = "";
      nextBtn.innerHTML =
        currentStep === TOTAL_STEPS - 1 ? "Review <span class=\"arrow\">→</span>" : "Next <span class=\"arrow\">→</span>";
    }

    const activeSection = document.getElementById(`step-${currentStep}`);
    if (activeSection) {
      const heading = activeSection.querySelector("h2");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    }
    window.scrollTo({ top: document.querySelector(".planner-header").offsetHeight - 40, behavior: "smooth" });
  }

  /* ---------------- Step 1: Destination ---------------- */

  function setupDestination() {
    const input = el("destinationSearch");
    const list = el("destinationList");
    const hidden = el("destinationId");
    const errorEl = el("destError");

    function renderList(filter) {
      const q = (filter || "").toLowerCase().trim();
      const matches = DESTINATIONS.filter(
        (d) => !q || d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
      );
      list.innerHTML = matches
        .map(
          (d) => `
        <li role="option" aria-selected="${state.destinationId === d.id}">
          <button type="button" data-id="${d.id}" class="${state.destinationId === d.id ? "is-selected" : ""}">
            ${d.name} <small>${d.country}</small>
          </button>
        </li>`
        )
        .join("");
    }

    renderList("");

    input.addEventListener("input", () => renderList(input.value));

    list.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-id]");
      if (!btn) return;
      selectDestination(btn.dataset.id);
      renderList(input.value);
      setFieldState(null, errorEl, "", "");
    });

    function selectDestination(id) {
      const dest = findDestination(id);
      if (!dest) return;
      state.destinationId = dest.id;
      input.value = `${dest.name}, ${dest.country}`;
      hidden.value = dest.id;
      if (plannerGlobe) plannerGlobe.focusOn(dest.lat, dest.lon);
    }

    if (state.destinationId) selectDestination(state.destinationId);
  }

  function validateDestination() {
    const errorEl = el("destError");
    if (!state.destinationId) {
      setFieldState(null, errorEl, "error", "Please choose a destination to continue.");
      shakeField(document.querySelector(".search-field"));
      return false;
    }
    setFieldState(null, errorEl, "", "");
    return true;
  }

  /* ---------------- Step 2: Dates ---------------- */

  function setupDates() {
    const dep = el("departureDate");
    const ret = el("returnDate");
    const today = new Date().toISOString().split("T")[0];
    dep.min = today;
    ret.min = today;

    function recalc() {
      state.departureDate = dep.value;
      state.returnDate = ret.value;
      ret.min = dep.value || today;

      const badge = el("durationBadge");
      if (Validate.dateOrderValid(dep.value, ret.value)) {
        const days = Math.round((new Date(ret.value) - new Date(dep.value)) / 86400000);
        el("durationValue").textContent = days;
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    }

    dep.addEventListener("change", () => {
      recalc();
      validateDateField(dep, el("departureStatus"), "departure");
      if (ret.value) validateDateField(ret, el("returnStatus"), "return");
    });
    ret.addEventListener("change", () => {
      recalc();
      validateDateField(ret, el("returnStatus"), "return");
    });
  }

  function validateDateField(inputEl, statusEl, kind) {
    if (!inputEl.value) {
      setFieldState(inputEl, statusEl, "error", "This date is required.");
      return false;
    }
    if (kind === "return") {
      const dep = el("departureDate").value;
      if (!Validate.dateOrderValid(dep, inputEl.value)) {
        setFieldState(inputEl, statusEl, "error", "Return date must be after departure.");
        return false;
      }
    }
    setFieldState(inputEl, statusEl, "success", "");
    return true;
  }

  function validateDates() {
    const dep = el("departureDate");
    const ret = el("returnDate");
    const okDep = validateDateField(dep, el("departureStatus"), "departure");
    const okRet = validateDateField(ret, el("returnStatus"), "return");
    if (!okDep) shakeField(dep.closest(".field"));
    if (!okRet) shakeField(ret.closest(".field"));
    return okDep && okRet;
  }

  /* ---------------- Step 3: Travelers ---------------- */

  function setupTravelers() {
    const adultsOut = el("adultsValue");
    const childrenOut = el("childrenValue");

    function update() {
      adultsOut.textContent = state.adults;
      childrenOut.textContent = state.children;
      el("adultsMinus").disabled = state.adults <= 1;
      el("adultsPlus").disabled = state.adults >= 12;
      el("childrenMinus").disabled = state.children <= 0;
      el("childrenPlus").disabled = state.children >= 10;
    }

    el("adultsMinus").addEventListener("click", () => {
      state.adults = Math.max(1, state.adults - 1);
      update();
    });
    el("adultsPlus").addEventListener("click", () => {
      state.adults = Math.min(12, state.adults + 1);
      update();
    });
    el("childrenMinus").addEventListener("click", () => {
      state.children = Math.max(0, state.children - 1);
      update();
    });
    el("childrenPlus").addEventListener("click", () => {
      state.children = Math.min(10, state.children + 1);
      update();
    });

    update();

    setupPillGroup("travelTypeGroup", (value) => (state.travelType = value));
  }

  /* ---------------- Step 4: Interests ---------------- */

  function setupInterests() {
    const group = el("interestGroup");
    group.querySelectorAll(".choice-tile").forEach((tile) => {
      tile.addEventListener("click", () => {
        const value = tile.dataset.value;
        const idx = state.interests.indexOf(value);
        if (idx > -1) {
          state.interests.splice(idx, 1);
          tile.classList.remove("is-selected");
          tile.setAttribute("aria-pressed", "false");
        } else {
          state.interests.push(value);
          tile.classList.add("is-selected");
          tile.setAttribute("aria-pressed", "true");
        }
        if (state.interests.length) setFieldState(null, el("interestError"), "", "");
      });
      tile.setAttribute("aria-pressed", "false");
    });
  }

  function validateInterests() {
    if (!state.interests.length) {
      setFieldState(null, el("interestError"), "error", "Choose at least one interest.");
      shakeField(el("interestGroup"));
      return false;
    }
    setFieldState(null, el("interestError"), "", "");
    return true;
  }

  /* ---------------- Step 5: Budget ---------------- */

  function setupBudget() {
    const slider = el("budgetSlider");
    const fill = el("budgetFill");
    const handle = el("budgetHandle");
    const display = el("budgetValue");

    function paint() {
      const min = Number(slider.min);
      const max = Number(slider.max);
      const pct = ((Number(slider.value) - min) / (max - min)) * 100;
      fill.style.width = `${pct}%`;
      handle.style.left = `${pct}%`;
      const formatted = Number(slider.value).toLocaleString("en-US");
      display.textContent = formatted;
      slider.setAttribute("aria-valuetext", `Rs. ${formatted}`);
      state.budget = Number(slider.value);
    }

    slider.addEventListener("input", paint);
    paint();
  }

  /* ---------------- Step 6: Preferences ---------------- */

  function setupPreferences() {
    setupPillGroup("accomGroup", (value) => (state.accommodation = value));
    setupPillGroup("transportGroup", (value) => (state.transportation = value));
    setupPillGroup("paceGroup", (value) => (state.pace = value));
  }

  function setupPillGroup(groupId, onChange) {
    const group = el(groupId);
    if (!group) return;
    group.querySelectorAll(".choice-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        group.querySelectorAll(".choice-pill").forEach((p) => p.classList.remove("is-selected"));
        pill.classList.add("is-selected");
        onChange(pill.dataset.value);
      });
    });
  }

  /* ---------------- Step 7: Contact ---------------- */

  function setupContact() {
    const name = el("fullName");
    const email = el("email");
    const phone = el("phone");

    function checkName() {
      state.fullName = name.value;
      if (!Validate.required(name.value)) {
        setFieldState(name, el("nameStatus"), "error", "Please enter your name.");
        return false;
      }
      if (!Validate.name(name.value)) {
        setFieldState(name, el("nameStatus"), "error", "Please enter a valid name.");
        return false;
      }
      setFieldState(name, el("nameStatus"), "success", "Looks good");
      return true;
    }

    function checkEmail() {
      state.email = email.value;
      if (!Validate.required(email.value)) {
        setFieldState(email, el("emailStatus"), "error", "Please enter your email.");
        return false;
      }
      if (!Validate.email(email.value)) {
        setFieldState(email, el("emailStatus"), "error", "Please enter a valid email address.");
        return false;
      }
      setFieldState(email, el("emailStatus"), "success", "Looks good");
      return true;
    }

    function checkPhone() {
      state.phone = phone.value;
      if (!Validate.required(phone.value)) {
        setFieldState(phone, el("phoneStatus"), "error", "Please enter your phone number.");
        return false;
      }
      if (!Validate.phone(phone.value)) {
        setFieldState(phone, el("phoneStatus"), "error", "Please enter a valid phone number.");
        return false;
      }
      setFieldState(phone, el("phoneStatus"), "success", "Looks good");
      return true;
    }

    name.addEventListener("input", () => (state.fullName = name.value));
    name.addEventListener("blur", checkName);
    email.addEventListener("input", () => {
      state.email = email.value;
      if (email.dataset.touched) checkEmail();
    });
    email.addEventListener("blur", () => {
      email.dataset.touched = "1";
      checkEmail();
    });
    phone.addEventListener("input", () => {
      state.phone = phone.value;
      if (phone.dataset.touched) checkPhone();
    });
    phone.addEventListener("blur", () => {
      phone.dataset.touched = "1";
      checkPhone();
    });

    window.__validateContact = () => {
      const okName = checkName();
      const okEmail = checkEmail();
      const okPhone = checkPhone();
      if (!okName) shakeField(name.closest(".field"));
      if (!okEmail) shakeField(email.closest(".field"));
      if (!okPhone) shakeField(phone.closest(".field"));
      return okName && okEmail && okPhone;
    };
  }

  /* ---------------- Step 8: Review ---------------- */

  function renderReview() {
    const dest = findDestination(state.destinationId);
    if (!dest) return;

    el("reviewImage").src = dest.image;
    el("reviewImage").alt = `${dest.name}, ${dest.country}`;
    el("reviewFallback").style.background = dest.fallback;
    el("reviewDestName").textContent = dest.name;
    el("reviewDestCountry").textContent = dest.country;

    const days = Validate.dateOrderValid(state.departureDate, state.returnDate)
      ? Math.round((new Date(state.returnDate) - new Date(state.departureDate)) / 86400000)
      : "—";

    const dateRange = formatDateRange(state.departureDate, state.returnDate);
    const travelers = `${state.adults} Adult${state.adults > 1 ? "s" : ""}${
      state.children ? ` · ${state.children} Child${state.children > 1 ? "ren" : ""}` : ""
    }`;

    const items = [
      { label: "Dates", value: dateRange, step: 2 },
      { label: "Duration", value: `${days} Days`, step: 2 },
      { label: "Travelers", value: `${travelers} · ${state.travelType}`, step: 3 },
      { label: "Interests", value: state.interests.join(" · ") || "—", step: 4 },
      { label: "Budget", value: `Rs. ${Number(state.budget).toLocaleString("en-US")}`, step: 5 },
      { label: "Preferences", value: `${state.accommodation} · ${state.transportation} · ${state.pace}`, step: 6 },
      { label: "Contact", value: `${state.fullName || "—"}`, step: 7 },
    ];

    el("reviewList").innerHTML = items
      .map(
        (i) => `
      <div class="review-item">
        <div>
          <div class="r-label">${i.label}</div>
        </div>
        <div style="text-align:right;">
          <div class="r-value">${i.value}</div>
          <button type="button" class="edit" data-step="${i.step}">Edit</button>
        </div>
      </div>`
      )
      .join("");

    el("reviewList").querySelectorAll(".edit").forEach((btn) => {
      btn.addEventListener("click", () => goToStep(Number(btn.dataset.step)));
    });

    if (plannerGlobe) plannerGlobe.showRoute(ORIGIN, dest);
  }

  function formatDateRange(dep, ret) {
    if (!dep || !ret) return "—";
    const d = new Date(dep);
    const r = new Date(ret);
    const opts = { day: "numeric", month: "short" };
    const depStr = d.toLocaleDateString("en-GB", opts);
    const retStr = r.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return `${depStr} — ${retStr}`.toUpperCase();
  }

  /* ---------------- Validation per step ---------------- */

  function validateStep(step) {
    switch (step) {
      case 1:
        return validateDestination();
      case 2:
        return validateDates();
      case 3:
        return true; // counters are self-constrained
      case 4:
        return validateInterests();
      case 5:
        return true;
      case 6:
        return true;
      case 7:
        return window.__validateContact ? window.__validateContact() : true;
      default:
        return true;
    }
  }

  /* ---------------- Submission / success ---------------- */

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep(7)) {
      goToStep(7);
      return;
    }

    const dest = findDestination(state.destinationId);
    const journey = { ...state, destination: dest };
    sessionStorage.setItem("wanderJourney", JSON.stringify(journey));

    const days = Math.round((new Date(state.returnDate) - new Date(state.departureDate)) / 86400000);
    el("successDest").textContent = `${dest.name.toUpperCase()} — ${formatDateRange(state.departureDate, state.returnDate)}`;
    el("successMeta").textContent = `${days} Days · ${state.adults} Adults${state.children ? ` · ${state.children} Children` : ""}`;

    const overlay = el("successScreen");
    overlay.classList.add("is-visible");
    overlay.querySelector(".btn-primary").focus();
  }

  /* ---------------- Init ---------------- */

  function initGlobe() {
    const canvas = el("plannerGlobe");
    if (!canvas || !window.THREE) return;
    plannerGlobe = new WanderGlobe(canvas, {
      markers: DESTINATIONS.map((d) => ({ lat: d.lat, lon: d.lon, id: d.id })),
      interactive: false,
      autoRotate: true,
    });
  }

  function init() {
    initGlobe();
    setupDestination();
    setupDates();
    setupTravelers();
    setupInterests();
    setupBudget();
    setupPreferences();
    setupContact();

    el("backBtn").addEventListener("click", () => goToStep(currentStep - 1));
    el("nextBtn").addEventListener("click", () => {
      if (validateStep(currentStep)) goToStep(currentStep + 1);
    });
    el("plannerForm").addEventListener("submit", handleSubmit);

    goToStep(1);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
