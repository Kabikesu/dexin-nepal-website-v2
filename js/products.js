document.addEventListener("DOMContentLoaded", async () => {
  const allGrid = document.getElementById("all-products-grid");
  const topGrid = document.getElementById("top-products");
  const upcomingGrid = document.getElementById("upcoming-products");
  const grid = allGrid || topGrid || upcomingGrid;
  const homeProductStage = document.getElementById("product-orbit");
  const filters = [...document.querySelectorAll(".product-filter")];
  const topCategoryButtons = [...document.querySelectorAll(".top-product-submenu-item")];
  const topCategoryDetail = document.getElementById("top-product-category-detail");
  const topCategoryProductsTitle = document.getElementById("top-product-products-title");
  const topCategoryContent = {
    "DXN Coffee": {
      eyebrow: "DXN Coffee",
      title: "Discover the Essence of Wellness with DXN Coffee",
      intro: "Indulge in a cup of DXN Coffee, where taste meets health in perfect harmony. Crafted with premium coffee beans and enriched with Ganoderma lucidum (Lingzhi), DXN Coffee offers an extraordinary experience that delights your senses while supporting your well-being.",
      image: "https://www.dxn2u.com/topproduct/images/COFFEE.jpg",
      imageAlt: "DXN Coffee Beans",
      sections: [
        {
          title: "Why Choose DXN Coffee?",
          blocks: [
            {heading:"Premium Ingredients", bullets:[
              "Made with high-quality coffee beans for a rich, aromatic flavour.",
              "Infused with Ganoderma extract, a powerful mushroom known for its health benefits."
            ]}
          ]
        }
      ]
    },
    "DXN RG & GL": {
      eyebrow: "DXN RG & GL",
      title: "DXN RG & GL: Your Path to Holistic Wellness",
      intro: "DXN’s Reishi Gano (RG) and Ganocelium (GL) capsules are premium dietary supplements made from the Ganoderma lucidum mushroom, also known as Lingzhi. Revered for centuries in traditional medicine, this “King of Herbs” offers powerful health benefits that promote balance and vitality.",
      image: "https://www.dxn2u.com/topproduct/images/LINGZHI.jpg",
      imageAlt: "DXN RG GL",
      sections: [
        {
          title: "Why Choose DXN RG and GL?",
          blocks: [
            {heading:"Derived from the Finest Ganoderma", bullets:[
              "RG (Reishi Gano): Made from a mature Ganoderma mushroom, RG is rich in triterpenes, which support detoxification and immune function.",
              "GL (Ganocelium): Made from mycelium of young Ganoderma mushrooms, GL is packed with polysaccharides, vitamins, and minerals for cellular health."
            ]}
          ]
        }
      ]
    },
    "DXN Spirulina": {
      eyebrow: "DXN Spirulina",
      title: "Unlock the Power of Nature with DXN Spirulina",
      intro: "DXN Spirulina is your ultimate superfood supplement, packed with essential nutrients to support your health and vitality. Known as a “complete food,” spirulina is a natural, nutrient-dense algae that offers a wide range of health benefits. With DXN’s commitment to quality, you can enjoy all the goodness of spirulina in its purest form.",
      image: "https://www.dxn2u.com/topproduct/images/SPIRULINA.jpg",
      imageAlt: "DXN Spirulina",
      sections: [
        {
          title: "Why Choose DXN Spirulina?",
          blocks: [
            {heading:"Rich in Essential Nutrients", bullets:[
              "Packed with vitamins, minerals, proteins, and antioxidants.",
              "A natural source of iron, calcium, and B vitamins to fuel your body."
            ]}
          ]
        },
        {
          title: "Who Can Benefit from DXN Spirulina?",
          paragraphs:[
            "Health-conscious individuals looking for a daily nutritional boost.",
            "Athletes and fitness enthusiasts needing a natural protein source.",
            "Busy professionals and students seeking enhanced energy and focus.",
            "Vegetarians and vegans requiring a plant-based nutrient supplement."
          ]
        },
        {
          title: "How to Enjoy DXN Spirulina",
          blocks: [
            {bullets:[
              "Tablets: Convenient and easy to take on the go.",
              "Powder: Mix it into smoothies, juices, or water for a nutritional boost.",
              "Recipes: Add it to soups, salads, or baked goods for a vibrant, healthy twist."
            ]}
          ]
        }
      ]
    },
    "DXN Cocozhi": {
      eyebrow: "DXN Cocozhi",
      title: "Savour the Creamy Goodness of DXN Cocozhi",
      intro: "DXN Cocozhi is a delicious and nutritious beverage made with the finest cocoa and enriched with Ganoderma lucidum, offering the perfect combination of taste and health benefits. Whether you are looking to unwind after a long day or need a comforting boost, DXN Cocozhi is your go-to drink for both pleasure and wellness.",
      image: "https://www.dxn2u.com/topproduct/images/COCOZHI.jpg",
      imageAlt: "DXN Cocozhi",
      sections: [
        {
          title: "Why Choose DXN Cocozhi?",
          blocks: [
            {heading:"A Rich and Creamy Cocoa Experience", bullets:[
              "Made with premium cocoa, DXN Cocozhi offers a velvety smooth texture and a rich, indulgent taste that satisfies your cravings without the guilt.",
              "Naturally sweetened and free from artificial flavours, it provides a wholesome cocoa experience."
            ]}
          ]
        },
        {
          title: "Health Benefits of DXN Cocozhi",
          blocks: [
            {heading:"Boosts Energy Naturally", paragraphs:["Offers a natural energy boost without the need for caffeine or sugar-laden drinks."]},
            {heading:"Supports Heart Health", paragraphs:["Contains antioxidants that contribute to cardiovascular health and improved circulation."]},
            {heading:"Aids Digestion", paragraphs:["The combination of Ganoderma and cocoa can support healthy digestion and gut function."]},
            {heading:"Promotes Mental Clarity", paragraphs:["Helps enhance focus and concentration with its balanced nutritional profile."]}
          ]
        },
        {
          title: "How to Enjoy DXN Cocozhi",
          blocks: [
            {bullets:[
              "Tear open a sachet of DXN Cocozhi.",
              "Add the powder to a cup of hot water.",
              "Stir well and savour the creamy, chocolatey goodness."
            ]}
          ]
        }
      ]
    }
  };
  if (!grid && !homeProductStage) return;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const published = product => product.published !== false && ["current","upcoming"].includes(product.status);

  const imageMarkup = product => product.image
    ? '<div class="product-image-fit"><img class="product-image-normalized" src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" loading="lazy"></div>'
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
        const cardWidth = small ? 88 : mobile ? 108 : 126;
        const cardHeight = small ? 102 : mobile ? 122 : 146;
        const step = (Math.PI * 2) / cards.length;

        cards.forEach((card, index) => {
          const angle = rotation + (index * step);
          const x = Math.cos(angle) * radiusX;
          const y = Math.sin(angle) * radiusY;
          const depth = (Math.sin(angle) + 1) / 2;
          const scale = 0.76 + (depth * 0.25);
          const visible = depth > 0.18;
          const opacity = visible ? 0.32 + (depth * 0.68) : 0;
          const z = 1 + Math.round(depth * 10);
          card.style.pointerEvents = visible ? "auto" : "none";

          card.style.width = cardWidth + "px";
          card.style.setProperty("--hero-card-media-height", cardHeight + "px");
          card.style.height = "auto";
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

    const renderHomeProducts = catalogue => {
      const stage = document.getElementById("product-orbit");
      if (!stage || !catalogue.length) return;

      const makeItem = (product, index) => {
        const card = document.createElement("a");
        card.className = "hero-product-orbit-card";
        card.href = "product-detail.html?id=" + encodeURIComponent(product.id || product.name);
        card.setAttribute("aria-label", "View " + product.name);

        const media = document.createElement("span");
        media.className = "hero-product-item";

        if (product.image) {
          const img = document.createElement("img");
          img.src = product.image;
          img.alt = product.name;
          img.loading = index < 10 ? "eager" : "lazy";
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

        card.append(media, name);
        return card;
      };

      stage.replaceChildren(...catalogue.map(makeItem));

      const cards = [...stage.children];
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let offset = 0;
      let lastTime = performance.now();
      let paused = false;

      const layout = () => {
        const width = stage.parentElement?.clientWidth || 1000;
        const mobile = window.innerWidth <= 760;
        const small = window.innerWidth <= 560;
        const spacing = small ? 82 : mobile ? 112 : Math.min(174, Math.max(122, width / 8.1));
        const center = (cards.length - 1) / 2;

        cards.forEach((card, index) => {
          let distance = index - center + offset;
          const wrapped = ((distance + cards.length / 2) % cards.length) - cards.length / 2;
          const abs = Math.abs(wrapped);
          const x = wrapped * spacing;
          const scale = abs < .5 ? 1.18 : Math.max(.72, 1.03 - abs * .08);
          const opacity = abs > 5 ? 0 : Math.max(.42, 1 - abs * .12);
          const z = 20 - Math.round(abs * 2);

          card.style.transform = "translate3d(" + x + "px,-50%,0) scale(" + scale + ")";
          card.style.opacity = opacity.toFixed(3);
          card.style.zIndex = String(z);
          card.style.pointerEvents = opacity > .2 ? "auto" : "none";
          card.classList.toggle("is-front", abs < .5);
        });
      };

      const tick = time => {
        if (!paused && !reduceMotion) {
          offset += Math.min(time - lastTime, 40) * 0.00042;
          if (offset >= 1) offset -= 1;
        }
        lastTime = time;
        layout();
        if (!reduceMotion) requestAnimationFrame(tick);
      };

      stage.addEventListener("mouseenter", () => { paused = true; });
      stage.addEventListener("mouseleave", () => { paused = false; lastTime = performance.now(); });
      stage.addEventListener("focusin", () => { paused = true; });
      stage.addEventListener("focusout", () => { paused = false; lastTime = performance.now(); });
      window.addEventListener("resize", layout, { passive: true });

      layout();
      if (!reduceMotion) requestAnimationFrame(tick);
    };
    renderHomeProducts(items);

    const normalizeProductImages = root => {
      root.querySelectorAll(".product-image-normalized").forEach(img => {
        const applyScale = () => {
          const box = img.parentElement;
          if (!box || !img.naturalWidth || !img.naturalHeight) return;

          const boxRatio = box.clientWidth / Math.max(box.clientHeight, 1);
          const imageRatio = img.naturalWidth / img.naturalHeight;

          // Estimate how much of the contain box the image occupies.
          const containFraction = imageRatio >= boxRatio
            ? boxRatio / imageRatio
            : imageRatio / boxRatio;

          // Bring different source proportions toward a similar visual area.
          // Never enlarge enough to crop the image.
          const targetFraction = 0.76;
          const scale = Math.min(1, Math.sqrt(targetFraction / Math.max(containFraction, 0.18)));

          img.style.setProperty("--product-visual-scale", scale.toFixed(3));
        };

        if (img.complete) applyScale();
        else img.addEventListener("load", applyScale, { once: true });
      });
    };

    const render = filter => {
      let visible = items;
      if (topGrid) visible = items.filter(p => p.featured === true && (!filter || p.topCategory === filter));
      if (upcomingGrid) visible = items.filter(p => p.status === "upcoming");
      if (allGrid && (filter === "current" || filter === "upcoming")) visible = items.filter(p => p.status === filter);
      if (allGrid && (filter === "Coffee" || filter === "Nutraceuticals")) visible = items.filter(p => p.type === filter);
      if (!grid) return;
      grid.innerHTML = visible.length ? visible.map(card).join("") : '<p class="product-loading">No products are available in this view yet.</p>';
      normalizeProductImages(grid);
      grid.querySelectorAll(".reveal").forEach((el, i) => {
        setTimeout(() => el.classList.add("is-visible"), Math.min(i * 35, 350));
      });
    };

    const renderCategoryDetail = category => {
      const data = topCategoryContent[category];
      if (!topCategoryDetail || !data) return;

      const sections = data.sections.map(section => {
        const blocks = (section.blocks || []).map(block => {
          const heading = block.heading ? '<h4>' + escapeHtml(block.heading) + '</h4>' : '';
          const paragraphs = (block.paragraphs || []).map(p => '<p>' + escapeHtml(p) + '</p>').join('');
          const bullets = block.bullets ? '<ul>' + block.bullets.map(item => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>' : '';
          return '<div class="top-product-copy-block">' + heading + paragraphs + bullets + '</div>';
        }).join('');
        const paragraphs = (section.paragraphs || []).map(p => '<p>' + escapeHtml(p) + '</p>').join('');
        return '<section class="top-product-detail-section"><h3>' + escapeHtml(section.title) + '</h3>' + paragraphs + blocks + '</section>';
      }).join('');

      topCategoryDetail.innerHTML =
        '<div class="top-product-detail-media"><img src="' + escapeHtml(data.image) + '" alt="' + escapeHtml(data.imageAlt) + '" loading="lazy"><span>' + escapeHtml(data.imageAlt) + '</span></div>' +
        '<div class="top-product-detail-copy"><span class="section-label">' + escapeHtml(data.eyebrow) + '</span><h2>' + escapeHtml(data.title) + '</h2><p class="top-product-detail-intro">' + escapeHtml(data.intro) + '</p>' + sections + '</div>';
      if (topCategoryProductsTitle) topCategoryProductsTitle.textContent = category;
    };

    topCategoryButtons.forEach(button => button.addEventListener("click", () => {
      const category = button.dataset.topCategory || "";
      topCategoryButtons.forEach(item => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderCategoryDetail(category);
      render(category);
    }));

    filters.forEach(button => button.addEventListener("click", () => {
      filters.forEach(item => { item.classList.remove("is-active"); item.setAttribute("aria-selected","false"); });
      button.classList.add("is-active");
      button.setAttribute("aria-selected","true");
      render(button.dataset.filter);
    }));
    if (topGrid && !items.some(p => p.featured === true)) {
      topGrid.innerHTML = '<p class="product-loading">Featured products will appear here when selected in the product data.</p>';
    } else if (topGrid) {
      const requestedCategory = new URLSearchParams(window.location.search).get("category");
      const validCategories = Object.keys(topCategoryContent);
      const category = validCategories.includes(requestedCategory) ? requestedCategory : "DXN Coffee";
      renderCategoryDetail(category);
      render(category);
      topCategoryButtons.forEach(button => {
        button.classList.toggle("is-active", button.dataset.topCategory === category);
      });
    } else {
      render("all");
    }
  } catch (error) {
    if (grid) grid.innerHTML = '<p class="product-loading">Product data is not available yet.</p>';
  }
});