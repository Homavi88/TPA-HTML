(() => {
  const slides = [...document.querySelectorAll(".slide")];
  const dotsWrap = document.querySelector(".dots");
  const nowEl = document.querySelector(".counter__now");
  const allEl = document.querySelector(".counter__all");
  const bar = document.querySelector(".progress__bar");
  const deck = document.querySelector("#deck");

  let index = 0;
  let locked = false;

  allEl.textContent = String(slides.length).padStart(2, "0");

  slides.forEach((slide, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", slide.dataset.title || `Слайд ${i + 1}`);
    button.addEventListener("click", () => go(i));
    dotsWrap.appendChild(button);
  });

  const dots = [...dotsWrap.querySelectorAll("button")];

  function animateCounts(slide) {
    slide.querySelectorAll("[data-count]").forEach((node) => {
      const end = Number(node.dataset.count);
      const prefix = node.dataset.prefix || "";
      const suffix = node.dataset.suffix || "";
      const start = performance.now();
      const duration = 1100;

      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        node.textContent = `${prefix}${Math.round(end * eased)}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
      };

      node.textContent = `${prefix}0${suffix}`;
      requestAnimationFrame(tick);
    });
  }

  function go(next) {
    if (locked) return;
    const target = Math.max(0, Math.min(slides.length - 1, next));
    if (target === index) return;

    locked = true;
    const current = slides[index];
    const incoming = slides[target];

    current.classList.remove("is-active");
    current.classList.add("is-exit");
    incoming.classList.add("is-active");

    index = target;
    sync();
    animateCounts(incoming);

    window.setTimeout(() => {
      current.classList.remove("is-exit");
      locked = false;
    }, 720);
  }

  function sync() {
    dots.forEach((dot, i) => dot.classList.toggle("is-on", i === index));
    nowEl.textContent = String(index + 1).padStart(2, "0");
    bar.style.width = `${((index + 1) / slides.length) * 100}%`;
  }

  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      go(index + (button.dataset.nav === "next" ? 1 : -1));
    });
  });

  window.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) < 12) return;
      go(index + (event.deltaY > 0 ? 1 : -1));
    },
    { passive: true }
  );

  window.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      go(index + 1);
    }
    if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      go(index - 1);
    }
    if (event.key === "Home") go(0);
    if (event.key === "End") go(slides.length - 1);
    if (event.key.toLowerCase() === "f") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  });

  let touchY = null;
  deck.addEventListener(
    "touchstart",
    (event) => {
      touchY = event.touches[0].clientY;
    },
    { passive: true }
  );
  deck.addEventListener(
    "touchend",
    (event) => {
      if (touchY == null) return;
      const delta = touchY - event.changedTouches[0].clientY;
      if (Math.abs(delta) > 40) go(index + (delta > 0 ? 1 : -1));
      touchY = null;
    },
    { passive: true }
  );

  sync();
  animateCounts(slides[0]);
})();
