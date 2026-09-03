const BRAINCELL_DOWNLOAD_URL = "";
const MEICAT_SHOP_URL = "";
const CAR_STUDIO_DOWNLOAD_URL = "";

const projects = document.querySelectorAll(".project");
const showcase = document.querySelector(".showcase");
const activeWorldPanel = document.querySelector(".active-world");
const activeName = document.querySelector(".active-world__name");
const activeType = document.querySelector(".active-world__type");
const meicatSlides = document.querySelectorAll(".meicat-slide");
const braincellSlides = document.querySelectorAll(".braincell-slide");
const carStudioSlides = document.querySelectorAll(".car-slide");
const previousButton = document.querySelector(".slide-control--previous");
const nextButton = document.querySelector(".slide-control--next");
const slideProgress = document.querySelector(".slide-progress");
const worldCta = document.querySelector(".world-cta");
const worldCtaLabel = document.querySelector(".world-cta__status-label");
const worldCtaButton = document.querySelector(".world-cta__button");
const worldCtaStatus = document.querySelector("#world-cta-status");
const oyenImage = document.querySelector(".oyen-anchor__image");
const chatFeatures = Array.from(document.querySelectorAll(".braincell-chat-feature"));
const liveEventFeatures = Array.from(document.querySelectorAll(".braincell-live-events-feature"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopExperience = document.querySelector(".desktop-experience");
let activeWorld = null;
let restingWorld = "braincell";
let meicatSlide = 0;
let braincellSlide = 0;
let carStudioSlide = 0;
let informationTimer = null;
let settlingTimer = null;
let featureMotionTimer = null;
let slideFadeTimer = null;
let isSlideNavigating = false;
let closePhaseTimer = null;
let isWorldClosing = false;
let chatFeatureAnimations = [];
let liveEventFeatureAnimations = [];

const BRAINCELL_FADE_OUT_MS = 200;
const BRAINCELL_FADE_IN_MS = 240;
const CHAT_GEOMETRY_MS = 760;
const CHAT_CLOSE_MS = 600;
const CHAT_OPEN_DELAYS = {
  "braincell-chat-feature--all-in-one": 0,
  "braincell-chat-feature--chat-overlay": 30,
  "braincell-chat-feature--lego": 65,
  "braincell-chat-feature--floating": 85,
  "braincell-chat-feature--rose": 115,
  "braincell-chat-feature--danmaku": 140,
};
const CHAT_CLOSE_DELAYS = {
  "braincell-chat-feature--rose": 0,
  "braincell-chat-feature--danmaku": 15,
  "braincell-chat-feature--lego": 30,
  "braincell-chat-feature--floating": 45,
  "braincell-chat-feature--all-in-one": 65,
  "braincell-chat-feature--chat-overlay": 80,
};
const CHAT_GEOMETRY_EASING = "cubic-bezier(0.2, 0.78, 0.24, 1)";
const CHAT_CLOSE_EASING = "cubic-bezier(0.42, 0, 0.86, 0.58)";
const LIVE_EVENTS_GEOMETRY_MS = 760;
const LIVE_EVENTS_CLOSE_MS = 600;
const LIVE_EVENTS_OPEN_DELAYS = {
  "braincell-live-events-feature--banner": 0,
  "braincell-live-events-feature--regular-live": 30,
  "braincell-live-events-feature--join": 55,
  "braincell-live-events-feature--fan": 85,
  "braincell-live-events-feature--question-mark": 115,
};
const LIVE_EVENTS_CLOSE_DELAYS = {
  "braincell-live-events-feature--question-mark": 0,
  "braincell-live-events-feature--fan": 15,
  "braincell-live-events-feature--join": 35,
  "braincell-live-events-feature--regular-live": 55,
  "braincell-live-events-feature--banner": 80,
};
const LIVE_EVENTS_GEOMETRY_EASING = "cubic-bezier(0.2, 0.78, 0.24, 1)";
const LIVE_EVENTS_CLOSE_EASING = "cubic-bezier(0.42, 0, 0.86, 0.58)";

function getChatFeatureDelay(feature, delays) {
  const matchingClass = Object.keys(delays).find((className) => feature.classList.contains(className));
  return matchingClass ? delays[matchingClass] : 0;
}

function captureChatFeatureRects() {
  return chatFeatures.map((feature) => feature.getBoundingClientRect());
}

function clearChatFeatureAnimations() {
  chatFeatureAnimations.forEach((animation) => animation.cancel());
  chatFeatureAnimations = [];
}

function animateChatFeaturesFromRects(startRects) {
  clearChatFeatureAnimations();
  const endRects = captureChatFeatureRects();

  chatFeatureAnimations = chatFeatures.map((feature, index) => {
    const start = startRects[index];
    const end = endRects[index];
    if (!start?.width || !start?.height || !end?.width || !end?.height) return null;
    const endRotate = getComputedStyle(feature).rotate;

    const animation = feature.animate([
      {
        transform: `translate3d(${start.left - end.left}px, ${start.top - end.top}px, 0) scale(${start.width / end.width}, ${start.height / end.height})`,
        transformOrigin: "top left",
        rotate: "0deg",
      },
      {
        transform: "translate3d(0, 0, 0) scale(1)",
        transformOrigin: "top left",
        rotate: endRotate,
      },
    ], {
      duration: CHAT_GEOMETRY_MS,
      delay: getChatFeatureDelay(feature, CHAT_OPEN_DELAYS),
      easing: CHAT_GEOMETRY_EASING,
      fill: "both",
    });

    return animation;
  }).filter(Boolean);
}

function captureChatRestRects() {
  showcase.classList.add("is-chat-rest-measure");
  const rects = captureChatFeatureRects();
  showcase.classList.remove("is-chat-rest-measure");
  return rects;
}

function animateChatFeaturesToPointOne() {
  clearChatFeatureAnimations();
  const startRects = captureChatFeatureRects();
  const endRects = captureChatRestRects();

  chatFeatureAnimations = chatFeatures.map((feature, index) => {
    const start = startRects[index];
    const end = endRects[index];
    if (!start?.width || !start?.height || !end?.width || !end?.height) return null;
    const startRotate = getComputedStyle(feature).rotate;

    return feature.animate([
      {
        transform: "translate3d(0, 0, 0) scale(1)",
        transformOrigin: "top left",
        rotate: startRotate,
      },
      {
        transform: `translate3d(${end.left - start.left}px, ${end.top - start.top}px, 0) scale(${end.width / start.width}, ${end.height / start.height})`,
        transformOrigin: "top left",
        rotate: "0deg",
      },
    ], {
      duration: CHAT_CLOSE_MS,
      delay: getChatFeatureDelay(feature, CHAT_CLOSE_DELAYS),
      easing: CHAT_CLOSE_EASING,
      fill: "both",
    });
  }).filter(Boolean);
}

function getLiveEventFeatureDelay(feature, delays) {
  const matchingClass = Object.keys(delays).find((className) => feature.classList.contains(className));
  return matchingClass ? delays[matchingClass] : 0;
}

function captureLiveEventFeatureRects() {
  return liveEventFeatures.map((feature) => feature.getBoundingClientRect());
}

function clearLiveEventFeatureAnimations() {
  liveEventFeatureAnimations.forEach((animation) => animation.cancel());
  liveEventFeatureAnimations = [];
}

function animateLiveEventFeaturesFromRects(startRects) {
  clearLiveEventFeatureAnimations();
  const endRects = captureLiveEventFeatureRects();

  liveEventFeatureAnimations = liveEventFeatures.map((feature, index) => {
    const start = startRects[index];
    const end = endRects[index];
    if (!start?.width || !start?.height || !end?.width || !end?.height) return null;
    const endRotate = getComputedStyle(feature).rotate;

    return feature.animate([
      {
        transform: `translate3d(${start.left - end.left}px, ${start.top - end.top}px, 0) scale(${start.width / end.width}, ${start.height / end.height})`,
        transformOrigin: "top left",
        rotate: "0deg",
      },
      {
        transform: "translate3d(0, 0, 0) scale(1)",
        transformOrigin: "top left",
        rotate: endRotate,
      },
    ], {
      duration: LIVE_EVENTS_GEOMETRY_MS,
      delay: getLiveEventFeatureDelay(feature, LIVE_EVENTS_OPEN_DELAYS),
      easing: LIVE_EVENTS_GEOMETRY_EASING,
      fill: "both",
    });
  }).filter(Boolean);
}

function captureLiveEventsRestRects() {
  showcase.classList.add("is-live-events-rest-measure");
  const rects = captureLiveEventFeatureRects();
  showcase.classList.remove("is-live-events-rest-measure");
  return rects;
}

function animateLiveEventFeaturesToPointOne() {
  clearLiveEventFeatureAnimations();
  const startRects = captureLiveEventFeatureRects();
  const endRects = captureLiveEventsRestRects();

  liveEventFeatureAnimations = liveEventFeatures.map((feature, index) => {
    const start = startRects[index];
    const end = endRects[index];
    if (!start?.width || !start?.height || !end?.width || !end?.height) return null;
    const startRotate = getComputedStyle(feature).rotate;

    return feature.animate([
      {
        transform: "translate3d(0, 0, 0) scale(1)",
        transformOrigin: "top left",
        rotate: startRotate,
      },
      {
        transform: `translate3d(${end.left - start.left}px, ${end.top - start.top}px, 0) scale(${end.width / start.width}, ${end.height / start.height})`,
        transformOrigin: "top left",
        rotate: "0deg",
      },
    ], {
      duration: LIVE_EVENTS_CLOSE_MS,
      delay: getLiveEventFeatureDelay(feature, LIVE_EVENTS_CLOSE_DELAYS),
      easing: LIVE_EVENTS_CLOSE_EASING,
      fill: "both",
    });
  }).filter(Boolean);
}

const hazeLayer = document.createElement("div");
hazeLayer.className = "pointer-haze-layer";
hazeLayer.setAttribute("aria-hidden", "true");

const hazePool = Array.from({ length: 12 }, () => {
  const element = document.createElement("span");
  element.className = "pointer-haze";
  hazeLayer.append(element);
  return { element, animation: null };
});

desktopExperience.append(hazeLayer);

let hazePoolIndex = 0;
let lastHazeX = 0;
let lastHazeY = 0;
let lastHazeTime = 0;
let hasHazePoint = false;

const emitPointerHaze = (x, y) => {
  const haze = hazePool[hazePoolIndex];
  hazePoolIndex = (hazePoolIndex + 1) % hazePool.length;
  haze.animation?.cancel();
  haze.element.style.left = `${x}px`;
  haze.element.style.top = `${y}px`;
  haze.animation = haze.element.animate([
    { opacity: 0, transform: "translate3d(-50%, -50%, 0) scale(0.85)", offset: 0 },
    { opacity: 0.58, transform: "translate3d(-50%, -50%, 0) scale(0.89)", offset: 0.12 },
    { opacity: 0, transform: "translate3d(-50%, -50%, 0) scale(1.08)", offset: 1 },
  ], {
    duration: 950,
    easing: "cubic-bezier(0.18, 0.65, 0.25, 1)",
    fill: "forwards",
  });
};

window.addEventListener("pointermove", (event) => {
  if (reducedMotion.matches || event.pointerType === "touch") return;

  const now = performance.now();

  if (!hasHazePoint) {
    emitPointerHaze(event.clientX, event.clientY);
    lastHazeX = event.clientX;
    lastHazeY = event.clientY;
    lastHazeTime = now;
    hasHazePoint = true;
    return;
  }

  const deltaX = event.clientX - lastHazeX;
  const deltaY = event.clientY - lastHazeY;
  const distance = Math.hypot(deltaX, deltaY);
  const distanceReady = distance >= 16;
  const timeReady = distance >= 5 && now - lastHazeTime >= 80;

  if (!distanceReady && !timeReady) return;

  const steps = distanceReady ? Math.min(Math.floor(distance / 16), 3) : 1;

  for (let step = 1; step <= steps; step += 1) {
    const progress = step / steps;
    emitPointerHaze(lastHazeX + deltaX * progress, lastHazeY + deltaY * progress);
  }

  lastHazeX = event.clientX;
  lastHazeY = event.clientY;
  lastHazeTime = now;
}, { passive: true });

document.documentElement.addEventListener("pointerleave", () => {
  hasHazePoint = false;
});

reducedMotion.addEventListener("change", () => {
  if (!reducedMotion.matches) return;

  window.clearTimeout(featureMotionTimer);
  showcase.classList.remove("is-braincell-motion-ready", "is-chat-motion-ready", "is-live-events-motion-ready");
  clearChatFeatureAnimations();
  clearLiveEventFeatureAnimations();
  hasHazePoint = false;
  hazePool.forEach((haze) => {
    haze.animation?.cancel();
    haze.element.style.opacity = "0";
  });
});

showcase.dataset.resting = restingWorld;

const braincellContent = [
  { name: "Braincell", type: "Creator workspace" },
  { name: "Chat", type: "Chat overlays and live messages" },
  { name: "Live Events", type: "Gifts, follows, boosts, joins, and live reactions" },
  { name: "Widgets", type: "Polls, questions, goals and more" },
  { name: "Mini Games", type: "Interactive stream games" },
];

const meicatContent = [
  { name: "Creator", type: "Creator" },
  { name: "Shop", type: "Shop" },
  { name: "SNS", type: "SNS" },
];

const carStudioContent = [
  { name: "Design Studio", type: "Design studio" },
  { name: "Create", type: "Build your overlay design" },
  { name: "Upload", type: "Upload to Braincell" },
];

const ctaContent = {
  meicat: {
    status: "Coming Soon",
    label: "Check Shop",
    accessibleName: "Check Meicat shop",
    unavailableText: "Meicat shop is not available yet.",
    url: MEICAT_SHOP_URL,
  },
  braincell: {
    status: "Beta",
    label: "Download App",
    accessibleName: "Download Braincell app",
    unavailableText: "Braincell download is not available yet.",
    url: BRAINCELL_DOWNLOAD_URL,
  },
  "car-studio": {
    status: "Coming Soon",
    label: "Download App",
    accessibleName: "Download Car Studio app",
    unavailableText: "Car Studio download is not available yet.",
    url: CAR_STUDIO_DOWNLOAD_URL,
  },
};

function revealOyen() {
  oyenImage.hidden = false;
}

if (oyenImage) {
  if (oyenImage.complete && oyenImage.naturalWidth > 0) {
    revealOyen();
  } else {
    oyenImage.addEventListener("load", revealOyen, { once: true });
  }
}

function renderSlides(slides, content, currentSlide) {
  const slide = content[currentSlide];

  slides.forEach((item, index) => {
    item.classList.toggle("is-current", index === currentSlide);
  });

  activeName.textContent = slide.name;
  activeType.textContent = slide.type;
  slideProgress.textContent = `${String(currentSlide + 1).padStart(2, "0")} / ${String(content.length).padStart(2, "0")}`;
  slideProgress.setAttribute("aria-label", `Slide ${currentSlide + 1} of ${content.length}`);
  previousButton.disabled = isSlideNavigating;
  nextButton.disabled = isSlideNavigating;
}

function renderBraincellSlide() {
  renderSlides(braincellSlides, braincellContent, braincellSlide);
}

function renderActiveSlides() {
  if (activeWorld === "meicat") renderSlides(meicatSlides, meicatContent, meicatSlide);
  if (activeWorld === "braincell") renderBraincellSlide();
  if (activeWorld === "car-studio") renderSlides(carStudioSlides, carStudioContent, carStudioSlide);
}

function finishBraincellSlideFade() {
  window.clearTimeout(slideFadeTimer);
  showcase.classList.remove(
    "is-braincell-slide-fading-out",
    "is-braincell-slide-fading-in",
  );
  isSlideNavigating = false;
  previousButton.disabled = false;
  nextButton.disabled = false;

  if (showcase.dataset.active === "braincell" && !reducedMotion.matches) {
    if (document.querySelector(".braincell-slide--workspace").classList.contains("is-current")) {
      showcase.classList.add("is-braincell-motion-ready");
    }
    if (document.querySelector(".braincell-slide--chat").classList.contains("is-current")) {
      showcase.classList.add("is-chat-motion-ready");
    }
    if (document.querySelector(".braincell-slide--gifts").classList.contains("is-current")) {
      showcase.classList.add("is-live-events-motion-ready");
    }
  }
}

function cancelBraincellSlideFade() {
  window.clearTimeout(slideFadeTimer);
  showcase.classList.remove(
    "is-braincell-slide-fading-out",
    "is-braincell-slide-fading-in",
  );
  isSlideNavigating = false;
  previousButton.disabled = false;
  nextButton.disabled = false;
}

function navigateBraincellSlide(direction) {
  if (isSlideNavigating || isWorldClosing || activeWorld !== "braincell" || showcase.classList.contains("is-settling")) return;

  const incomingSlide = (braincellSlide + direction + braincellContent.length) % braincellContent.length;

  if (reducedMotion.matches) {
    braincellSlide = incomingSlide;
    renderBraincellSlide();
    return;
  }

  isSlideNavigating = true;
  previousButton.disabled = true;
  nextButton.disabled = true;
  window.clearTimeout(featureMotionTimer);
  showcase.classList.remove("is-braincell-motion-ready", "is-chat-motion-ready", "is-live-events-motion-ready");
  showcase.classList.add("is-braincell-slide-fading-out");

  slideFadeTimer = window.setTimeout(() => {
    braincellSlide = incomingSlide;
    renderBraincellSlide();
    showcase.classList.remove("is-braincell-slide-fading-out");
    showcase.classList.add("is-braincell-slide-fading-in");
    slideFadeTimer = window.setTimeout(finishBraincellSlideFade, BRAINCELL_FADE_IN_MS);
  }, BRAINCELL_FADE_OUT_MS);
}

function changeActiveSlide(direction) {
  if (activeWorld === "meicat") {
    meicatSlide = (meicatSlide + direction + meicatContent.length) % meicatContent.length;
  }

  if (activeWorld === "braincell") {
    navigateBraincellSlide(direction);
    return;
  }

  if (activeWorld === "car-studio") {
    carStudioSlide = (carStudioSlide + direction + carStudioContent.length) % carStudioContent.length;
  }

  renderActiveSlides();
}

function renderWorldCta() {
  const cta = ctaContent[activeWorld];
  const isAvailable = cta.url.trim().length > 0;

  worldCtaLabel.textContent = cta.status;
  worldCtaButton.textContent = cta.label;
  worldCtaButton.setAttribute("aria-label", cta.accessibleName);
  worldCtaButton.setAttribute("aria-disabled", String(!isAvailable));
  worldCtaStatus.textContent = cta.unavailableText;
  worldCtaStatus.hidden = isAvailable;

  if (isAvailable) {
    worldCtaButton.removeAttribute("aria-describedby");
  } else {
    worldCtaButton.setAttribute("aria-describedby", "world-cta-status");
  }

  worldCta.classList.add("is-visible");
}

function beginWorldReturn(selectedWorld) {
  restingWorld = selectedWorld;
  showcase.dataset.resting = restingWorld;
  activeWorld = null;
  delete showcase.dataset.active;
  if (selectedWorld === "braincell" && braincellSlide === 1) clearChatFeatureAnimations();
  if (selectedWorld === "braincell" && braincellSlide === 2) clearLiveEventFeatureAnimations();
  showcase.classList.add("is-settling");
  activeWorldPanel.classList.remove("is-changing");

  projects.forEach((item) => {
    item.classList.remove("is-active");
    item.setAttribute("aria-pressed", "false");
  });

  informationTimer = window.setTimeout(() => {
    worldCta.classList.remove("is-visible");
  }, 800);

  settlingTimer = window.setTimeout(() => {
    showcase.classList.remove("is-settling", "is-braincell-closing");
    isWorldClosing = false;
    previousButton.disabled = false;
    nextButton.disabled = false;
  }, 950);
}

function selectWorld(project) {
  if (isWorldClosing) return;

  const selectedWorld = project.dataset.world;
  const isClosing = activeWorld === selectedWorld;
  const isSwitching = activeWorld !== null && !isClosing;

  window.clearTimeout(informationTimer);
  window.clearTimeout(settlingTimer);
  window.clearTimeout(featureMotionTimer);
  window.clearTimeout(closePhaseTimer);
  cancelBraincellSlideFade();
  showcase.classList.remove("is-braincell-motion-ready", "is-chat-motion-ready", "is-live-events-motion-ready");
  showcase.classList.remove("is-braincell-closing");
  clearChatFeatureAnimations();
  clearLiveEventFeatureAnimations();

  if (isClosing) {
    const isBraincellReassembly = selectedWorld === "braincell" && (braincellSlide === 0 || braincellSlide === 1 || braincellSlide === 2) && !reducedMotion.matches;

    if (isBraincellReassembly) {
      isWorldClosing = true;
      previousButton.disabled = true;
      nextButton.disabled = true;
      showcase.classList.add("is-braincell-closing");
      if (braincellSlide === 1) animateChatFeaturesToPointOne();
      if (braincellSlide === 2) animateLiveEventFeaturesToPointOne();
      closePhaseTimer = window.setTimeout(() => beginWorldReturn(selectedWorld), braincellSlide === 1 || braincellSlide === 2 ? 710 : 680);
      return;
    }

    beginWorldReturn(selectedWorld);
    return;
  }

  const chatOpeningRects = selectedWorld === "braincell" && braincellSlide === 1 && !reducedMotion.matches
    ? captureChatFeatureRects()
    : null;
  const liveEventsOpeningRects = selectedWorld === "braincell" && braincellSlide === 2 && !reducedMotion.matches
    ? captureLiveEventFeatureRects()
    : null;

  activeWorld = selectedWorld;
  showcase.classList.remove("is-settling");
  showcase.dataset.active = activeWorld;

  if (chatOpeningRects) animateChatFeaturesFromRects(chatOpeningRects);
  if (liveEventsOpeningRects) animateLiveEventFeaturesFromRects(liveEventsOpeningRects);

  projects.forEach((item) => {
    const isActive = item === project;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  if (isSwitching && !reducedMotion.matches) {
    activeWorldPanel.classList.add("is-changing");
    informationTimer = window.setTimeout(() => {
      renderActiveSlides();
      renderWorldCta();
      activeWorldPanel.classList.remove("is-changing");
    }, 140);
  } else {
    renderActiveSlides();
    renderWorldCta();
    activeWorldPanel.classList.remove("is-changing");
  }

  if (activeWorld === "braincell" && !reducedMotion.matches) {
    featureMotionTimer = window.setTimeout(() => {
      if (activeWorld !== "braincell") return;
      if (braincellSlide === 0) showcase.classList.add("is-braincell-motion-ready");
      if (braincellSlide === 1) showcase.classList.add("is-chat-motion-ready");
      if (braincellSlide === 2) showcase.classList.add("is-live-events-motion-ready");
    }, 980);
  }
}

worldCtaButton.addEventListener("click", () => {
  const cta = ctaContent[activeWorld];
  if (!cta || !cta.url.trim()) return;
  window.location.assign(cta.url);
});

previousButton.addEventListener("click", () => changeActiveSlide(-1));
nextButton.addEventListener("click", () => changeActiveSlide(1));

document.addEventListener("keydown", (event) => {
  if (!activeWorld) return;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    changeActiveSlide(-1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    changeActiveSlide(1);
  }
});

projects.forEach((project) => {
  project.addEventListener("click", () => selectWorld(project));

  project.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    selectWorld(project);
  });

});
