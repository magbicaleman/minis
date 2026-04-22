const shell = document.querySelector(".app-shell");
const slides = Array.from(document.querySelectorAll(".slide"));
const railItems = Array.from(document.querySelectorAll(".rail-item"));
const progressFill = document.querySelector("#progressFill");
const slideCounter = document.querySelector("#slideCounter");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const overviewButton = document.querySelector("#overviewButton");

let currentIndex = 0;
let touchStartX = 0;

function twoDigit(value) {
  return String(value).padStart(2, "0");
}

function setSlide(index, updateHash = true) {
  currentIndex = Math.max(0, Math.min(index, slides.length - 1));
  window.scrollTo(0, 0);

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentIndex);
  });

  railItems.forEach((item, itemIndex) => {
    item.classList.toggle("is-active", itemIndex === currentIndex);
  });

  const progress = ((currentIndex + 1) / slides.length) * 100;
  progressFill.style.width = `${progress}%`;
  slideCounter.textContent = `${twoDigit(currentIndex + 1)} / ${twoDigit(slides.length)}`;
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === slides.length - 1;

  if (updateHash) {
    history.replaceState(null, "", `#slide-${currentIndex + 1}`);
  }
}

function move(delta) {
  if (shell.classList.contains("overview")) return;
  setSlide(currentIndex + delta);
}

function hydrateFromHash() {
  const match = window.location.hash.match(/slide-(\d+)/);
  if (!match) {
    setSlide(0, false);
    return;
  }
  setSlide(Number(match[1]) - 1, false);
}

railItems.forEach((item) => {
  item.addEventListener("click", () => {
    shell.classList.remove("overview");
    setSlide(Number(item.dataset.goto));
  });
});

slides.forEach((slide, index) => {
  slide.addEventListener("click", () => {
    if (!shell.classList.contains("overview")) return;
    shell.classList.remove("overview");
    setSlide(index);
  });
});

prevButton.addEventListener("click", () => move(-1));
nextButton.addEventListener("click", () => move(1));

overviewButton.addEventListener("click", () => {
  shell.classList.toggle("overview");
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    move(1);
  }

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    move(-1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    shell.classList.remove("overview");
    setSlide(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    shell.classList.remove("overview");
    setSlide(slides.length - 1);
  }

  if (event.key.toLowerCase() === "o") {
    shell.classList.toggle("overview");
  }

  if (event.key === "Escape") {
    shell.classList.remove("overview");
  }
});

window.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].clientX;
  },
  { passive: true },
);

window.addEventListener(
  "touchend",
  (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 48) return;
    move(delta < 0 ? 1 : -1);
  },
  { passive: true },
);

window.addEventListener("hashchange", hydrateFromHash);
hydrateFromHash();
