(() => {
  const manifestUrl = "data/image-manifest.json";
  const titleFromPath = value => {
    const file = String(value || "").split("/").pop().replace(/\.[^.]+$/, "");
    return file.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
      .replace(/\b\\w/g, letter => letter.toUpperCase()) || "Dexin Manufacturing Nepal";
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
    if (ordered.length === 1) return;
    hero.classList.add("has-auto-hero");
    hero.querySelectorAll(".auto-hero-image").forEach(layer => layer.remove());
    const layers = [0, 1].map(() => {
      const layer = document.createElement("div");
      layer.className = "auto-hero-image";
      Object.assign(layer.style, {
        position:"absolute", inset:"0", zIndex:"-2", opacity:"0",
        transition:"opacity 1100ms ease", backgroundPosition:"center center",
        backgroundSize:"cover", backgroundRepeat:"no-repeat", pointerEvents:"none"
      });
      hero.prepend(layer);
      return layer;
    });
    const isSmall = () => window.matchMedia("(max-width: 900px)").matches;
    const paint = (layer, item) => {
      const src = JSON.stringify(item.src);
      const gradient = isSmall()
        ? "linear-gradient(180deg,rgba(8,8,8,.58) 0%,rgba(8,8,8,.64) 48%,rgba(8,8,8,.78) 100%),"
        : "linear-gradient(90deg,rgba(8,8,8,.78) 0%,rgba(8,8,8,.58) 42%,rgba(8,8,8,.28) 72%,rgba(8,8,8,.18) 100%),linear-gradient(180deg,rgba(8,8,8,.20),rgba(8,8,8,.38)),";
      layer.style.backgroundImage = gradient + "url(" + src + ")";
      layer.style.backgroundPosition = isSmall() ? "58% center" : "center center";
    };
    let current = 0;
    let activeLayer = 0;
    paint(layers[0], ordered[0]);
    layers[0].style.opacity = "1";
    const firstImage = hero.querySelector("[data-auto-hero-fallback]");
    if (firstImage) firstImage.src = ordered[0].src;
    window.setInterval(() => {
      const nextIndex = (current + 1) % ordered.length;
      const nextLayer = 1 - activeLayer;
      paint(layers[nextLayer], ordered[nextIndex]);
      layers[nextLayer].style.opacity = "1";
      layers[activeLayer].style.opacity = "0";
      current = nextIndex;
      activeLayer = nextLayer;
      if (firstImage) firstImage.src = ordered[nextIndex].src;
    }, 6000);
  };
  const setupRotator = (images, interval = 5000) => {
    document.querySelectorAll('[data-image-rotator="factory"]').forEach(img => {
      if (images.length < 2) return;
      let current = Math.max(0, images.findIndex(item => item.src === img.getAttribute("src")));
      img.style.transition = "opacity 350ms ease";
      window.setInterval(() => {
        img.style.opacity = "0.25";
        window.setTimeout(() => {
          current = (current + 1) % images.length;
          img.src = images[current].src;
          img.alt = images[current].alt || titleFromPath(images[current].src);
          img.onload = () => { img.style.opacity = "1"; };
          if (img.complete) img.style.opacity = "1";
        }, 350);
      }, interval);
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
  document.addEventListener("DOMContentLoaded", async () => {
    const manifest = await loadManifest();
    if (!manifest) return;
    setupHeroSlideshow(manifest.hero || []);
    setupRotator(manifest.factory || []);
    renderGrid("certifications", manifest.certifications || []);
    renderGrid("careers", manifest.careers || []);
  });
})();
