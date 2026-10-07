const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
const solarImageFallback = "assets/solar-fallback.svg";
const translations = window.siteTranslations;
let currentLanguage = "en";
const englishTextByKey = new Map(Object.entries(translations.en).map(([key, value]) => [value, key]));
const originalTextNodes = new WeakMap();
let selectedProjectFilter = "all";
let activeProjectId = null;
let lastEstimate = null;
let updateSelectedMapLocation = () => {};

const translate = (key, values = {}) => {
  const template = translations[currentLanguage][key] ?? translations.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
};

const translateEnglishText = (text) => {
  const key = englishTextByKey.get(text);
  return key ? translate(key) : text;
};

const protectImage = (image) => {
  if (!(image instanceof HTMLImageElement) || image.dataset.fallbackBound === "true") return;
  image.dataset.fallbackBound = "true";
  image.addEventListener("error", () => {
    if (image.dataset.usingFallback === "true") {
      image.hidden = true;
      return;
    }
    image.dataset.usingFallback = "true";
    image.src = solarImageFallback;
  });
  if (image.complete && image.naturalWidth === 0 && image.getAttribute("src")) {
    image.dispatchEvent(new Event("error"));
  }
};

document.querySelectorAll("img").forEach(protectImage);

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isExpanded));
    menuButton.setAttribute("aria-label", translate(isExpanded ? "openNavigation" : "closeNavigation"));
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", translate("openNavigation"));
      navigation.classList.remove("is-open");
    }
  });
}

const projectProfiles = [
  { id: "akola-home", location: "Akola", type: "Residential", capacity: "To be confirmed", translationKey: "projectDescAkolaHome", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84" },
  { id: "akola-business", location: "Akola", type: "Commercial", capacity: "To be confirmed", translationKey: "projectDescAkolaBusiness", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=84" },
  { id: "akot-home", location: "Akot", type: "Residential", capacity: "To be confirmed", translationKey: "projectDescAkot", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=84" },
  { id: "murtizapur-business", location: "Murtizapur", type: "Commercial", capacity: "To be confirmed", translationKey: "projectDescMurtizapur", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=84" },
  { id: "telhara-industry", location: "Telhara", type: "Industrial", capacity: "To be confirmed", translationKey: "projectDescTelhara", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=84" },
  { id: "balapur-home", location: "Balapur", type: "Residential", capacity: "To be confirmed", translationKey: "projectDescBalapur", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84" },
  { id: "patur-business", location: "Patur", type: "Commercial", capacity: "To be confirmed", translationKey: "projectDescPatur", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=84" },
  { id: "barshitakli-home", location: "Barshitakli", type: "Residential", capacity: "To be confirmed", translationKey: "projectDescBarshitakli", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=84" },
  { id: "amravati-industry", location: "Amravati", type: "Industrial", capacity: "To be confirmed", translationKey: "projectDescAmravati", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=84" },
  { id: "buldhana-home", location: "Buldhana", type: "Residential", capacity: "To be confirmed", translationKey: "projectDescBuldhana", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84" },
  { id: "washim-business", location: "Washim", type: "Commercial", capacity: "To be confirmed", translationKey: "projectDescWashim", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=84" },
];

const projectGrid = document.querySelector("#project-grid");
const filterButtons = [...document.querySelectorAll(".filter-button")];
let projectCards = [];

const renderProjectCards = () => {
  if (!projectGrid) return;
  projectGrid.innerHTML = projectProfiles.map((profile, index) => {
    const translatedType = translate(`project${profile.type}`);
    const title = currentLanguage === "mr"
      ? `${translatedType} सौरऊर्जा नियोजन — ${profile.location}`
      : `${profile.type} solar concept — ${profile.location}`;
    const description = translate(profile.translationKey);
    const typeLabel = currentLanguage === "mr" ? translatedType : profile.type;
    const cardDescription = currentLanguage === "mr"
      ? `${typeLabel} सौरऊर्जा नियोजन नमुना — ${profile.location}; पूर्ण प्रकल्पाचा दावा नाही`
      : `${profile.type} solar planning profile for ${profile.location}; sample concept, not a completed project`;
    return `<button class="project-card${index === 0 ? " project-large" : ""}" type="button" data-profile-id="${profile.id}" data-kind="${profile.type.toLowerCase()}" data-location="${profile.location}" data-title="${profile.type} solar concept — ${profile.location}" data-detail="${profile.translationKey}" data-capacity="${profile.capacity}" data-image="${profile.image}">
      <img src="${profile.image}" alt="${cardDescription}" loading="lazy">
      <span class="project-overlay"><span>${typeLabel.toUpperCase()} · ${profile.location.toUpperCase()}</span><strong>${translatedType} ${translate("projectRooftop")}<br>${profile.location}</strong><span class="project-capacity">${translate("projectCapacity", { capacity: translate("toBeConfirmed") })}</span><span class="project-open">${translate("projectOpen")} ↗</span></span>
    </button>`;
  }).join("");
  projectCards = [...projectGrid.querySelectorAll(".project-card")];
  projectCards.forEach((card) => {
    protectImage(card.querySelector("img"));
    card.addEventListener("click", () => showProjectDialog(card));
  });
  updateProjectFilter(selectedProjectFilter);
};

const updateProjectFilter = (selectedFilter) => {
  selectedProjectFilter = selectedFilter;
  const selectedButton = filterButtons.find((button) => button.dataset.filter === selectedFilter);
  filterButtons.forEach((button) => {
    const isSelected = button === selectedButton;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  projectCards.forEach((card) => {
    const matches = selectedFilter === "all"
      || card.dataset.kind === selectedFilter.toLowerCase()
      || card.dataset.location === selectedFilter;
    card.hidden = !matches;
    card.classList.toggle("project-large", selectedFilter === "all" && card.dataset.location === "Akola");
  });
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => updateProjectFilter(button.dataset.filter ?? "all"));
});

const mapLocations = [
  { name: "Akola", lat: 20.7002, lng: 77.0082, density: "High", translationKey: "akolaSummary", primary: true },
  { name: "Akot", lat: 21.0967, lng: 77.0584, density: "Medium", translationKey: "akotSummary" },
  { name: "Telhara", lat: 21.0296, lng: 76.8389, density: "Growing", translationKey: "telharaSummary" },
  { name: "Balapur", lat: 20.6667, lng: 76.7736, density: "Growing", translationKey: "balapurSummary" },
  { name: "Patur", lat: 20.4603, lng: 76.9374, density: "Growing", translationKey: "paturSummary" },
  { name: "Murtizapur", lat: 20.7333, lng: 77.3667, density: "Medium", translationKey: "murtizapurSummary" },
  { name: "Barshitakli", lat: 20.529, lng: 77.209, density: "Growing", translationKey: "barshitakliSummary" },
  { name: "Amravati", lat: 20.932, lng: 77.752, density: "Medium", translationKey: "amravatiSummary" },
  { name: "Buldhana", lat: 20.531, lng: 76.184, density: "Growing", translationKey: "buldhanaSummary" },
  { name: "Washim", lat: 20.111, lng: 77.133, density: "Growing", translationKey: "washimSummary" },
];

const mapElement = document.querySelector("#vidarbha-map");
const mapMarkers = document.querySelector("#map-markers");
const mapRoutes = document.querySelector("#map-routes");
const mapCityName = document.querySelector("#map-city-name");
const mapCityCopy = document.querySelector("#map-city-copy");
const mapDensity = document.querySelector("#map-density");
const mapProfileCount = document.querySelector("#map-profile-count");
const mapContactLink = document.querySelector(".map-contact-link");
const mapProjectLink = document.querySelector(".map-project-link");
let selectedMapLocation = mapLocations[0];

const renderMapProfileCount = (location) => {
  if (!mapProfileCount) return;
  const profileCount = projectProfiles.filter((profile) => profile.location === location.name).length;
  mapProfileCount.textContent = translate(profileCount === 1 ? "profileCount" : "profilesCount", { count: profileCount });
};

if (mapElement && mapMarkers && mapRoutes && mapCityName && mapCityCopy && mapDensity) {
  const mapBounds = { minLng: 76.12, maxLng: 77.9, minLat: 19.98, maxLat: 21.22, width: 800, height: 520, padX: 35, padY: 33 };
  const pointFor = ({ lat, lng }) => ({
    x: mapBounds.padX + ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * (mapBounds.width - mapBounds.padX * 2),
    y: mapBounds.padY + ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * (mapBounds.height - mapBounds.padY * 2),
  });
  const akolaPoint = pointFor(mapLocations[0]);

  mapRoutes.innerHTML = mapLocations.slice(1).map((location, index) => {
    const point = pointFor(location);
    const bend = (index % 2 === 0 ? -1 : 1) * (12 + index * 2);
    const middleX = (akolaPoint.x + point.x) / 2;
    const middleY = (akolaPoint.y + point.y) / 2 + bend;
    return `<path class="map-route" d="M${akolaPoint.x},${akolaPoint.y} Q${middleX},${middleY} ${point.x},${point.y}"/>`;
  }).join("");

  mapMarkers.innerHTML = mapLocations.map((location) => {
    const point = pointFor(location);
    const densityClass = location.density.toLowerCase();
    const accessibleLabel = `${location.name}, ${translate(`density${location.density}`)}${location.primary ? ", primary Akola hub" : ""}`;
    const inwardLabel = location.lng > 77.65 ? " map-marker-label-west" : "";
    return `<button class="map-marker${location.primary ? " map-marker-primary" : ""}${inwardLabel}" type="button" style="left:${(point.x / mapBounds.width) * 100}%;top:${(point.y / mapBounds.height) * 100}%" data-city="${location.name}" data-density="${location.density}" aria-label="${accessibleLabel}" aria-pressed="${location.primary ? "true" : "false"}"><span class="marker-dot marker-${densityClass}"></span><span class="marker-label">${location.name}</span></button>`;
  }).join("");

  const showLocation = (location) => {
    selectedMapLocation = location;
    mapCityName.textContent = location.name;
    mapCityCopy.textContent = translate(location.translationKey);
    mapDensity.textContent = translate(`density${location.density}`);
    mapDensity.className = `density-tag density-${location.density.toLowerCase()}`;
    mapContactLink?.setAttribute("data-map-location", location.name);
    renderMapProfileCount(location);
    mapMarkers.querySelectorAll(".map-marker").forEach((marker) => {
      marker.setAttribute("aria-pressed", String(marker.dataset.city === location.name));
      marker.setAttribute("aria-label", `${marker.dataset.city}, ${translate(`density${marker.dataset.density}`)}${marker.dataset.city === "Akola" ? `, ${currentLanguage === "mr" ? "अकोला मुख्य सेवा केंद्र" : "primary Akola hub"}` : ""}`);
    });
  };
  updateSelectedMapLocation = showLocation;

  mapMarkers.addEventListener("click", (event) => {
    const marker = event.target instanceof Element ? event.target.closest(".map-marker") : null;
    const location = mapLocations.find((item) => item.name === marker?.getAttribute("data-city"));
    if (location) showLocation(location);
  });
  mapContactLink?.addEventListener("click", () => {
    const citySelect = document.querySelector("#contact-city");
    const location = mapContactLink.getAttribute("data-map-location");
    if (citySelect instanceof HTMLSelectElement && location && [...citySelect.options].some((option) => option.value === location || option.textContent === location)) {
      citySelect.value = location;
    }
  });
  mapProjectLink?.addEventListener("click", () => {
    const location = mapContactLink?.getAttribute("data-map-location");
    if (location) updateProjectFilter(location);
  });
  showLocation(mapLocations[0]);
}

const projectDialog = document.querySelector("#project-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDetail = document.querySelector("#dialog-detail");
const dialogImage = document.querySelector(".dialog-image");
const dialogClose = document.querySelector(".dialog-close");
const dialogEyebrow = document.querySelector(".dialog-copy .eyebrow");
const dialogContactLink = projectDialog?.querySelector(".dialog-copy a");

const showProjectDialog = (card) => {
  if (!projectDialog || !dialogTitle || !dialogDetail || !dialogImage) return;
  const profile = projectProfiles.find((item) => item.id === card.dataset.profileId);
  if (!profile) return;
  activeProjectId = profile.id;
  const translatedType = translate(`project${profile.type}`);
  dialogTitle.textContent = currentLanguage === "mr"
    ? `${translatedType} सौरऊर्जा नियोजन — ${profile.location}`
    : `${profile.type} solar concept — ${profile.location}`;
  dialogDetail.textContent = translate("projectDetails", {
    location: profile.location,
    type: translatedType,
    capacity: translate("toBeConfirmed"),
    description: translate(profile.translationKey),
  });
  if (dialogEyebrow) {
    const line = dialogEyebrow.querySelector(".eyebrow-line");
    dialogEyebrow.textContent = translate("dialogEyebrow");
    if (line) dialogEyebrow.prepend(line);
  }
  if (dialogContactLink) {
    const arrow = dialogContactLink.querySelector("span");
    dialogContactLink.textContent = translate("discussProject");
    if (arrow) dialogContactLink.append(arrow);
  }
  delete dialogImage.dataset.usingFallback;
  dialogImage.src = profile.image;
  dialogImage.alt = currentLanguage === "mr"
    ? `${translatedType} सौरऊर्जा नियोजन नमुना, ${profile.location}`
    : `${profile.type} solar planning profile for ${profile.location}`;
  dialogImage.hidden = false;
  protectImage(dialogImage);
  if (!projectDialog.open) projectDialog.showModal();
  document.body.classList.add("dialog-open");
};

if (projectDialog && dialogClose) {
  renderProjectCards();
  const closeProjectDialog = () => {
    activeProjectId = null;
    projectDialog.close();
    document.body.classList.remove("dialog-open");
  };

  dialogClose.addEventListener("click", closeProjectDialog);
  projectDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
  projectDialog.addEventListener("click", (event) => {
    if (event.target === projectDialog) closeProjectDialog();
  });
  dialogContactLink?.addEventListener("click", closeProjectDialog);
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (projectDialog instanceof HTMLDialogElement && projectDialog.open) projectDialog.close();
  if (menuButton && navigation) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", translate("openNavigation"));
    navigation.classList.remove("is-open");
  }
});

const calculator = document.querySelector("#solar-calculator");
const calculatorError = document.querySelector("#calculator-error");
const estimateResult = document.querySelector("#estimate-result");
const numberFormatter = () => new Intl.NumberFormat(currentLanguage === "mr" ? "mr-IN" : "en-IN", { maximumFractionDigits: 1 });
const currencyFormatter = () => new Intl.NumberFormat(currentLanguage === "mr" ? "mr-IN" : "en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const renderEstimate = () => {
  if (!estimateResult || !lastEstimate) return;
  const number = numberFormatter();
  const currency = currencyFormatter();
  estimateResult.innerHTML = `
      <h4>${translate("estimateResultTitle")}</h4>
      <div class="estimate-grid">
        <div class="estimate-item"><span>${translate("recommendedSize")}</span><strong>${number.format(lastEstimate.systemKw)} kW</strong></div>
        <div class="estimate-item"><span>${translate("monthlyGeneration")}</span><strong>${number.format(lastEstimate.monthlyGeneration)} ${translate("units")}</strong></div>
        <div class="estimate-item"><span>${translate("annualSavings")}</span><strong>${currency.format(lastEstimate.annualSavings)}</strong></div>
        <div class="estimate-item"><span>${translate("payback")}</span><strong>${number.format(lastEstimate.paybackYears)} ${translate("yearUnit")}</strong></div>
      </div>
      <p class="estimate-note">${translate("estimateNote")}</p>`;
  estimateResult.hidden = false;
};

if (calculator instanceof HTMLFormElement && calculatorError && estimateResult) {
  calculator.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(calculator);
    const monthlyBill = Number(formData.get("monthlyBill"));
    const roofArea = Number(formData.get("roofArea"));

    if (!calculator.checkValidity() || !Number.isFinite(monthlyBill) || !Number.isFinite(roofArea)) {
      calculatorError.textContent = translate("calculatorError");
      estimateResult.hidden = true;
      return;
    }

    calculatorError.textContent = "";
    const consumptionBasedKw = monthlyBill / 960;
    const roofBasedKw = roofArea / 100;
    const systemKw = Math.max(0.5, Math.min(consumptionBasedKw, roofBasedKw));
    const monthlyGeneration = systemKw * 4.5 * 30;
    const annualSavings = Math.min(monthlyBill, monthlyGeneration * 8) * 12;
    const indicativeCost = systemKw * 65000;
    const paybackYears = indicativeCost / annualSavings;
    lastEstimate = { systemKw, monthlyGeneration, annualSavings, paybackYears };
    renderEstimate();
  });
}

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const contactChannel = document.querySelector("#contact-channel");

document.querySelectorAll("[data-contact-channel='WhatsApp']").forEach((link) => {
  link.addEventListener("click", () => {
    if (contactChannel instanceof HTMLSelectElement) contactChannel.value = "WhatsApp";
  });
});

if (contactForm instanceof HTMLFormElement && formStatus) {
  formStatus.dataset.statusState = "preview";
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) {
      formStatus.dataset.statusState = "error";
      formStatus.textContent = translate("contactError");
      formStatus.classList.remove("is-notice");
      formStatus.classList.add("is-error");
      const invalidField = contactForm.querySelector(":invalid");
      if (invalidField instanceof HTMLElement) {
        invalidField.setAttribute("aria-invalid", "true");
        invalidField.focus();
      }
      return;
    }

    contactForm.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute("aria-invalid"));
    formStatus.dataset.statusState = "notice";
    formStatus.textContent = translate("contactNotice");
    formStatus.classList.remove("is-error");
    formStatus.classList.add("is-notice");
  });
  contactForm.addEventListener("input", (event) => {
    const field = event.target;
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
      if (field.checkValidity()) field.removeAttribute("aria-invalid");
    }
  });
}

const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());

const languageToggle = document.querySelector("#language-toggle");
const translatedAttributes = [
  ["a.brand", "aria-label"],
  [".skip-link", "aria-label"],
  [".primary-nav", "aria-label"],
  [".intro-strip", "aria-label"],
  [".round-link", "aria-label"],
  [".subsidy-offer", "aria-label"],
  ["#vidarbha-map", "aria-label"],
  ["#project-filters", "aria-label"],
  [".dialog-close", "aria-label"],
  [".menu-toggle", "aria-label"],
  ["#monthly-bill", "placeholder"],
  ["#roof-area", "placeholder"],
  ["#contact-name", "placeholder"],
  ["#contact-phone", "placeholder"],
  ["#contact-message", "placeholder"],
];
const originalAttributes = new WeakMap();

const applyLanguage = (language) => {
  currentLanguage = language === "mr" ? "mr" : "en";
  const isMarathi = currentLanguage === "mr";
  document.documentElement.lang = isMarathi ? "mr-IN" : "en";
  document.title = translate("pageTitle");
  document.querySelector('meta[name="description"]')?.setAttribute("content", translate("description"));

  if (languageToggle) {
    languageToggle.textContent = translate("languageSwitch");
    languageToggle.lang = isMarathi ? "en" : "mr";
    languageToggle.setAttribute("aria-label", translate("switchLanguage"));
    languageToggle.setAttribute("aria-pressed", String(isMarathi));
  }

  renderProjectCards();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!(node.parentElement instanceof Element) || node.parentElement.closest(".brand-name, #language-toggle")) continue;
    if (!originalTextNodes.has(node)) originalTextNodes.set(node, node.nodeValue ?? "");
    const original = originalTextNodes.get(node) ?? "";
    const trimmed = original.trim();
    if (!trimmed) continue;
    const leftSpace = original.match(/^\s*/)?.[0] ?? "";
    const rightSpace = original.match(/\s*$/)?.[0] ?? "";
    node.nodeValue = `${leftSpace}${translateEnglishText(trimmed)}${rightSpace}`;
  }

  translatedAttributes.forEach(([selector, attribute]) => {
    document.querySelectorAll(selector).forEach((element) => {
      const htmlElement = element;
      let original = originalAttributes.get(htmlElement);
      if (!original) {
        original = new Map();
        originalAttributes.set(htmlElement, original);
      }
      if (!original.has(attribute)) original.set(attribute, htmlElement.getAttribute(attribute) ?? "");
      const englishValue = original.get(attribute) ?? "";
      htmlElement.setAttribute(attribute, translateEnglishText(englishValue));
    });
  });

  document.querySelectorAll(".project-card img").forEach((image, index) => {
    const profile = projectProfiles[index];
    if (!profile) return;
    image.alt = isMarathi
      ? `${translate(`project${profile.type}`)} सौरऊर्जा नियोजन नमुना — ${profile.location}; पूर्ण प्रकल्पाचा दावा नाही`
      : `${profile.type} solar planning profile for ${profile.location}; sample concept, not a completed project`;
  });
  document.querySelectorAll(".hero-image, .solution-card img, .approach-image img").forEach((image) => {
    const englishAlt = image.dataset.englishAlt ?? image.alt;
    image.dataset.englishAlt = englishAlt;
    image.alt = translateEnglishText(englishAlt);
  });
  document.querySelectorAll(".person-photo img").forEach((image, index) => {
    image.alt = translate(index === 0 ? "altFounderHrushikesh" : "altFounderJay");
  });
  updateSelectedMapLocation(selectedMapLocation);

  if (lastEstimate) renderEstimate();
  if (calculatorError?.textContent.trim()) calculatorError.textContent = translate("calculatorError");
  if (formStatus) {
    const statusKey = formStatus.dataset.statusState === "notice"
      ? "contactNotice"
      : formStatus.dataset.statusState === "error"
        ? "contactError"
        : "contactPreview";
    formStatus.textContent = translate(statusKey);
  }
  if (activeProjectId) {
    const activeCard = projectCards.find((card) => card.dataset.profileId === activeProjectId);
    if (activeCard) showProjectDialog(activeCard);
  }
};

languageToggle?.addEventListener("click", () => {
  applyLanguage(currentLanguage === "en" ? "mr" : "en");
});

applyLanguage("en");

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const animatedSections = document.querySelectorAll(".solutions-section, .approach-section, .people-section, .projects-section, .testimonials-section, .calculator-section, .map-section");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("section-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  animatedSections.forEach((section) => {
    section.classList.add("section-reveal");
    revealObserver.observe(section);
  });
}
