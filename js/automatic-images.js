(() => {
  const manifestUrl = "data/image-manifest.json";
  const titleFromPath = value => {
    const file = String(value || "").split("/").pop().replace(/\.[^.]+$/, "");
    return file.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
      .replace(/\b\w/g, letter => letter.toUpperCase()) || "Dexin Manufacturing Nepal";
  };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));
  const loadManifest = async () => {
    try {
      const response = await fetch(manifestUrl, { cache: "no-cache" });
      if (!response.ok) throw new Error("Image manifest unavailable");
      return await response.json();
    } catch (error) {
      return null;
    }
  };
  const setupHeroSlideshow = images => {
    const hero = document.querySelector(".home-hero");
    if (!hero || !images.length) return;
    const ordered = [...images];
    hero.classList.add("has-auto-hero");
    hero.querySelectorAll(".auto-hero-image, .hero-slider-controls").forEach(node => node.remove());

    const layers = [0, 1].map(() => {
      const layer = document.createElement("div");
      layer.className = "auto-hero-image";
      Object.assign(layer.style, {
        position: "absolute", inset: "0", zIndex: "0", opacity: "0",
        transform: "scale(1.045)", transition: "opacity 1000ms ease, transform 7000ms ease",
        backgroundPosition: "center center", backgroundSize: "cover",
        backgroundRepeat: "no-repeat", pointerEvents: "none"
      });
      hero.prepend(layer);
      return layer;
    });

    const controls = document.createElement("div");
    controls.className = "hero-slider-controls";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", "Factory hero slideshow controls");
    controls.innerHTML = `
      <button class="hero-slide-arrow hero-slide-prev" type="button" aria-label="Previous factory image"><span aria-hidden="true">←</span></button>
      <button class="hero-slide-play" type="button" aria-label="Pause slideshow" aria-pressed="false"><span aria-hidden="true">Ⅱ</span></button>
      <div class="hero-slide-progress" aria-label="Choose a factory image"></div>
      <span class="hero-slide-count" aria-live="polite"></span>
      <button class="hero-slide-arrow hero-slide-next" type="button" aria-label="Next factory image"><span aria-hidden="true">→</span></button>`;
    hero.append(controls);

    const progress = controls.querySelector(".hero-slide-progress");
    const count = controls.querySelector(".hero-slide-count");
    const playButton = controls.querySelector(".hero-slide-play");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isSmall = () => window.matchMedia("(max-width: 900px)").matches;
    const paint = (layer, item) => {
      const gradient = isSmall()
        ? "linear-gradient(180deg,rgba(5,5,5,.42) 0%,rgba(5,5,5,.46) 48%,rgba(5,5,5,.58) 100%),"
        : "linear-gradient(90deg,rgba(3,3,3,.52) 0%,rgba(3,3,3,.40) 30%,rgba(3,3,3,.25) 52%,rgba(3,3,3,.14) 76%,rgba(3,3,3,.08) 100%),linear-gradient(180deg,rgba(3,3,3,.10),rgba(3,3,3,.20)),";
      layer.style.backgroundImage = gradient + "url(" + JSON.stringify(item.src) + ")";
      layer.style.backgroundPosition = isSmall() ? "58% center" : "center center";
    };

    progress.innerHTML = ordered.map((item, index) =>
      '<button class="hero-slide-step" type="button" data-slide="' + index +
      '" aria-label="Show image ' + (index + 1) + ': ' +
      escapeHtml(item.title || titleFromPath(item.src)) + '">' +
      '<span class="hero-slide-track"><span></span></span></button>'
    ).join("");

    let current = 0;
    let activeLayer = 0;
    let timer = null;
    let playing = !reducedMotion.matches;
    const duration = 9000;
    const fallbackImage = hero.querySelector("[data-auto-hero-fallback]");
    const steps = [...progress.querySelectorAll(".hero-slide-step")];

    const updateControls = () => {
      steps.forEach((step, index) => {
        step.classList.toggle("is-active", index === current);
        step.setAttribute("aria-current", index === current ? "true" : "false");
        const fill = step.querySelector(".hero-slide-track span");
        fill.style.animationDuration = duration + "ms";
        fill.style.animationPlayState = playing && index === current ? "running" : "paused";
        fill.style.animationName = playing && index === current ? "dexin-hero-progress" : "none";
        fill.style.width = "0";
      });
      count.textContent = String(current + 1).padStart(2, "0") + " / " + String(ordered.length).padStart(2, "0");
      playButton.setAttribute("aria-label", playing ? "Pause slideshow" : "Play slideshow");
      playButton.setAttribute("aria-pressed", String(!playing));
      playButton.querySelector("span").textContent = playing ? "Ⅱ" : "▶";
    };

    const schedule = () => {
      window.clearTimeout(timer);
      if (playing && !document.hidden && ordered.length > 1) {
        timer = window.setTimeout(() => goTo((current + 1) % ordered.length), duration);
      }
    };

    const goTo = index => {
      const next = (index + ordered.length) % ordered.length;
      if (next === current && layers[activeLayer].style.opacity === "1") {
        schedule();
        return;
      }
      const nextLayer = 1 - activeLayer;
      paint(layers[nextLayer], ordered[next]);
      layers[nextLayer].style.transitionDuration = reducedMotion.matches ? "0ms, 0ms" : "1000ms, 9000ms";
      layers[nextLayer].style.transform = "scale(1.045)";
      requestAnimationFrame(() => {
        layers[nextLayer].style.opacity = "1";
        layers[nextLayer].style.transform = "scale(1)";
        layers[activeLayer].style.opacity = "0";
        layers[activeLayer].style.transform = "scale(1.035)";
      });
      current = next;
      activeLayer = nextLayer;
      if (fallbackImage) fallbackImage.src = ordered[current].src;
      updateControls();
      schedule();
    };

    paint(layers[0], ordered[0]);
    layers[0].style.opacity = "1";
    layers[0].style.transform = "scale(1)";
    if (fallbackImage) fallbackImage.src = ordered[0].src;
    updateControls();
    schedule();

    controls.addEventListener("click", event => {
      const step = event.target.closest("[data-slide]");
      if (step) {
        goTo(Number(step.dataset.slide));
        return;
      }
      if (event.target.closest(".hero-slide-prev")) goTo(current - 1);
      if (event.target.closest(".hero-slide-next")) goTo(current + 1);
      if (event.target.closest(".hero-slide-play")) {
        playing = !playing;
        updateControls();
        schedule();
      }
    });

    document.addEventListener("visibilitychange", schedule);
    reducedMotion.addEventListener?.("change", event => {
      if (event.matches) {
        playing = false;
        updateControls();
        schedule();
      }
    });
    window.addEventListener("resize", () => {
      layers.forEach((layer, index) => paint(layer, ordered[index === activeLayer ? current : (current + ordered.length - 1) % ordered.length]));
    }, { passive: true });
  };
  const setupRotator = (images, interval = 15000) => {
    document.querySelectorAll('[data-image-rotator="factory"]').forEach(img => {
      if (images.length < 2) return;
      let current = images.findIndex(item => decodeURI(item.src) === decodeURI(img.getAttribute("src") || ""));
      if (current < 0) current = 0;
      img.style.transition = "opacity 450ms ease";
      img.src = images[current].src;
      img.alt = images[current].alt || titleFromPath(images[current].src);
      const rotate = () => {
        const nextIndex = (current + 1) % images.length;
        const next = images[nextIndex];
        const preload = new Image();
        preload.onload = () => {
          img.style.opacity = "0";
          window.setTimeout(() => {
            img.src = next.src;
            img.alt = next.alt || titleFromPath(next.src);
            img.style.opacity = "1";
            current = nextIndex;
            window.setTimeout(rotate, interval);
          }, 450);
        };
        preload.onerror = () => {
          current = nextIndex;
          window.setTimeout(rotate, interval);
        };
        preload.src = next.src;
      };
      window.setTimeout(rotate, interval);
    });
  };
  const ensureViewer = () => {
    let viewer = document.querySelector(".image-viewer");
    if (viewer) return viewer;
    viewer = document.createElement("div");
    viewer.className = "image-viewer";
    viewer.hidden = true;
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");
    viewer.setAttribute("aria-label", "Image preview");
    viewer.innerHTML = '<div class="image-viewer-panel"><button class="image-viewer-close" type="button" aria-label="Close image preview">×</button><img alt=""><p class="image-viewer-caption"></p></div>';
    document.body.appendChild(viewer);
    const close = () => { viewer.hidden = true; document.body.style.overflow = ""; };
    viewer.addEventListener("click", event => { if (event.target === viewer || event.target.closest(".image-viewer-close")) close(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !viewer.hidden) close(); });
    viewer.closeViewer = close;
    return viewer;
  };
  const openViewer = (item) => {
    const viewer = ensureViewer();
    viewer.querySelector("img").src = item.src;
    viewer.querySelector("img").alt = item.alt || item.title || "";
    viewer.querySelector(".image-viewer-caption").textContent = item.title || item.alt || "";
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    viewer.querySelector(".image-viewer-close").focus();
  };
  const renderGrid = (key, images) => {
    const grid = document.querySelector('[data-image-grid="' + key + '"]');
    if (!grid) return;
    const placeholder = grid.querySelector(".cert-placeholder");
    if (!images.length) {
      if (placeholder) placeholder.hidden = false;
      if (key === "careers") {
        const section = grid.closest("[data-careers-gallery]");
        if (section) section.hidden = true;
      }
      return;
    }
    if (placeholder) placeholder.remove();
    if (key === "careers") {
      const section = grid.closest("[data-careers-gallery]");
      if (section) section.hidden = false;
    }
    grid.innerHTML = images.map(item => {
      const src = escapeHtml(item.src);
      const title = escapeHtml(item.title || titleFromPath(item.src));
      const alt = escapeHtml(item.alt || item.title || titleFromPath(item.src));
      return '<figure class="' + (key === "careers" ? "career-image-card" : "certification-card") + '"><button type="button" data-preview-src="' + src + '" data-preview-title="' + title + '" data-preview-alt="' + alt + '" aria-label="Enlarge ' + title + '"><img src="' + src + '" alt="' + alt + '" loading="lazy" decoding="async"><span' + (key === "careers" ? "" : ' class="certification-caption"') + '>' + title + '</span></button></figure>';
    }).join("");
    grid.addEventListener("click", event => {
      const button = event.target.closest("[data-preview-src]");
      if (!button) return;
      openViewer({src:button.dataset.previewSrc,title:button.dataset.previewTitle,alt:button.dataset.previewAlt});
    });
  };
  const initializeAutomaticImages = async () => {
    const manifest = await loadManifest();
    if (!manifest) {
      console.warn("Dexin automatic images: manifest could not be loaded.");
      return;
    }
    setupHeroSlideshow(manifest.hero || []);
    setupRotator(manifest.factory || []);
    renderGrid("certifications", manifest.certifications || []);
    renderGrid("careers", manifest.careers || []);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAutomaticImages, { once: true });
  } else {
    initializeAutomaticImages();
  }
})();
