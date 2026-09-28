document.addEventListener("DOMContentLoaded", async () => {
  const allGrid = document.getElementById("all-products-grid");
  const topGrid = document.getElementById("top-products");
  const upcomingGrid = document.getElementById("upcoming-products");
  const grid = allGrid || topGrid || upcomingGrid;
  const filters = [...document.querySelectorAll(".product-filter")];
  if (!grid) return;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const published = product => product.published !== false && ["current","upcoming"].includes(product.status);

  const imageMarkup = product => product.image
    ? '<div class="product-image-fit"><img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" loading="lazy"></div>'
    : '<div class="product-image-empty"><span>DEXIN</span><small>Image coming soon</small></div>';

  const card = product => '<a class="product-card product-card-editorial reveal" data-status="' + escapeHtml(product.status) + '" data-type="' + escapeHtml(product.type) + '" href="product-detail.html?id=' + encodeURIComponent(product.id || product.name) + '">' +
    '<div class="product-card-media">' + imageMarkup(product) +
    '<span class="product-status product-status-' + escapeHtml(product.status) + '">' + (product.status === "upcoming" ? "Upcoming" : "Current") + '</span></div>' +
    '<div class="product-card-body"><div class="product-card-meta"><small>' + escapeHtml(product.type || "Product") + '</small><span>↗</span></div>' +
    '<h3>' + escapeHtml(product.name) + '</h3>' +
    (product.packageSize ? '<p class="product-package">' + escapeHtml(product.packageSize) + '</p>' : '') +
    '</div></a>';

  try {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error("Product data unavailable");
    const products = await response.json();
    const items = products.filter(published);

    const renderHeroProducts = catalogue => {
      const stage = document.getElementById("hero-product-orbit");
      if (!stage || !catalogue.length) return;

      const makeHeroItem = (product, index) => {
        const card = document.createElement("a");
        card.className = "hero-product-orbit-card";
        card.href = "product-detail.html?id=" + encodeURIComponent(product.id || product.name);
        card.setAttribute("aria-label", "View " + product.name);
        card.dataset.index = String(index);

        const media = document.createElement("span");
        media.className = "hero-product-item";

        if (product.image) {
          const img = document.createElement("img");
          img.src = product.image;
          img.alt = product.name;
          img.loading = index < 8 ? "eager" : "lazy";
          img.decoding = "async";
          media.appendChild(img);
        } else {
          media.classList.add("hero-product-item-empty");
          const brand = document.createElement("span");
          brand.textContent = "DEXIN";
          const status = document.createElement("small");
          status.textContent = "IMAGE COMING SOON";
          media.append(brand, status);
        }

        const name = document.createElement("span");
        name.className = "hero-product-name";
        name.textContent = product.name;

        const type = document.createElement("span");
        type.className = "hero-product-type";
        type.textContent = product.type || "Product";

        card.append(media, name, type);
        return card;
      };

      stage.replaceChildren(...catalogue.map(makeHeroItem));

      const cards = [...stage.children];
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let rotation = 0;
      let lastTime = performance.now();
      let rafId = 0;
      let paused = false;

      const setLayout = (time, staticFrame = false) => {
        const width = stage.parentElement?.clientWidth || 650;
        const mobile = window.innerWidth <= 760;
        const small = window.innerWidth <= 560;
        const radiusX = small ? Math.min(width * 0.40, 175) : mobile ? Math.min(width * 0.43, 245) : Math.min(width * 0.45, 350);
        const radiusY = small ? 135 : mobile ? 170 : 235;
        const cardWidth = small ? 116 : mobile ? 145 : 168;
        const cardHeight = small ? 138 : mobile ? 170 : 198;
        const step = (Math.PI * 2) / cards.length;

        cards.forEach((card, index) => {
          const angle = rotation + (index * step);
          const x = Math.cos(angle) * radiusX;
          const y = Math.sin(angle) * radiusY;
          const depth = (Math.sin(angle) + 1) / 2;
          const scale = 0.74 + (depth * 0.34);
          const visible = depth > 0.18;
          const opacity = visible ? 0.32 + (depth * 0.68) : 0;
          const z = 1 + Math.round(depth * 10);
          card.style.pointerEvents = visible ? "auto" : "none";

          card.style.width = cardWidth + "px";
          card.style.height = cardHeight + "px";
          card.style.transform = "translate3d(" + x + "px," + y + "px,0) scale(" + scale + ")";
          card.style.opacity = opacity.toFixed(3);
          card.style.zIndex = String(z);
          card.classList.toggle("is-front", depth > 0.78);
        });

        if (!staticFrame) rafId = requestAnimationFrame(tick);
      };

      const tick = time => {
        if (!paused && !reduceMotion) {
          const delta = Math.min(time - lastTime, 40);
          rotation += delta * 0.000075;
        }
        lastTime = time;
        setLayout(time);
      };

      const pause = () => { paused = true; };
      const resume = () => { paused = false; lastTime = performance.now(); };

      stage.addEventListener("mouseenter", pause);
      stage.addEventListener("mouseleave", resume);
      stage.addEventListener("focusin", pause);
      stage.addEventListener("focusout", resume);
      window.addEventListener("resize", () => setLayout(performance.now(), true), { passive: true });

      setLayout(performance.now(), true);
      if (!reduceMotion) rafId = requestAnimationFrame(tick);
    };

    renderHeroProducts(items);

    const render = filter => {
      let visible = items;
      if (topGrid) visible = items.filter(p => p.featured === true);
      if (upcomingGrid) visible = items.filter(p => p.status === "upcoming");
      if (allGrid && (filter === "current" || filter === "upcoming")) visible = items.filter(p => p.status === filter);
      if (allGrid && (filter === "Coffee" || filter === "Nutraceuticals")) visible = items.filter(p => p.type === filter);
      grid.innerHTML = visible.length ? visible.map(card).join("") : '<p class="product-loading">No products are available in this view yet.</p>';
      grid.querySelectorAll(".reveal").forEach((el, i) => {
        setTimeout(() => el.classList.add("is-visible"), Math.min(i * 35, 350));
      });
    };

    filters.forEach(button => button.addEventListener("click", () => {
      filters.forEach(item => { item.classList.remove("is-active"); item.setAttribute("aria-selected","false"); });
      button.classList.add("is-active");
      button.setAttribute("aria-selected","true");
      render(button.dataset.filter);
    }));
    if (topGrid && !items.some(p => p.featured === true)) {
      topGrid.innerHTML = '<p class="product-loading">Featured products will appear here when selected in the product data.</p>';
    } else {
      render("all");
    }
  } catch (error) {
    grid.innerHTML = '<p class="product-loading">Product data is not available yet.</p>';
  }
});