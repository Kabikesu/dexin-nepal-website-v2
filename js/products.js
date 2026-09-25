document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("all-products") || document.getElementById("top-products") || document.getElementById("upcoming-products");
  const detail = document.getElementById("product-detail");
  const showcase = document.getElementById("feature-showcase");
  if (!grid && !detail && !showcase) return;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const imageMarkup = product => product.image
    ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">`
    : `<div class="product-card-placeholder" aria-hidden="true"><span>DEXIN</span></div>`;
  const statusLabel = product => product.status === "upcoming" ? "Upcoming" : "Current";

  const showcaseRoles = {
    product: {
      title: "Understand the product portfolio.",
      copy: "Ask for the information you need and bring the relevant product context together in one place.",
      prompt: "“Summarize our current products, package sizes, and the key information I need for a product review.”",
      output: "Product portfolio"
    },
    legal: {
      title: "Review product information with context.",
      copy: "Bring product records and supporting documents together so key information is easier to review.",
      prompt: "“Prepare a clear product information checklist for my review, including package and documentation fields.”",
      output: "Product review"
    },
    sales: {
      title: "Turn product information into a sales view.",
      copy: "Surface the products, package sizes, and portfolio details a sales team needs at a glance.",
      prompt: "“Create a concise sales-ready overview of our current products and package sizes.”",
      output: "Sales overview"
    },
    finance: {
      title: "See the portfolio from a planning view.",
      copy: "Organize product information into a clear operational snapshot for planning and review.",
      prompt: "“Summarize the current product portfolio into a simple planning snapshot.”",
      output: "Planning snapshot"
    }
  };

  const initShowcase = () => {
    if (!showcase) return;
    const roleTabs = [...showcase.querySelectorAll(".role-tab")];
    const stepTabs = [...showcase.querySelectorAll(".feature-step")];
    const title = document.getElementById("feature-title");
    const copy = document.getElementById("feature-copy");
    const prompt = document.getElementById("feature-prompt");
    const outputTitle = document.getElementById("output-title");
    const runButton = showcase.querySelector(".run-feature");
    const productVisual = document.getElementById("mock-product-visual");
    const productImage = document.getElementById("mock-product-image");
    const productName = document.getElementById("mock-product-name");
    const productPackage = document.getElementById("mock-product-package");

    const setRole = role => {
      const data = showcaseRoles[role] || showcaseRoles.product;
      title.textContent = data.title;
      copy.textContent = data.copy;
      prompt.textContent = data.prompt;
      outputTitle.textContent = data.output;
      roleTabs.forEach(tab => {
        const active = tab.dataset.role === role;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });
    };

    const setStep = step => {
      showcase.dataset.step = step;
      stepTabs.forEach(tab => {
        const active = tab.dataset.step === step;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });
    };

    roleTabs.forEach(tab => tab.addEventListener("click", () => setRole(tab.dataset.role)));
    stepTabs.forEach(tab => tab.addEventListener("click", () => setStep(tab.dataset.step)));
    runButton?.addEventListener("click", () => setStep("output"));
    setRole("product");
    setStep("input");
  };

  initShowcase();

  const loadProducts = async () => {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error("Product data unavailable");
    const products = await response.json();
    if (!Array.isArray(products)) throw new Error("Invalid product data");
    return products;
  };

  try {
    const products = await loadProducts();
    const published = products.filter(product => product.published !== false && ["current", "upcoming"].includes(product.status));

    if (productVisual && productImage && productName && productPackage) {
      const visualProducts = published.filter(product => product.image).slice(0, 8);
      let visualIndex = 0;
      let rotationTimer;

      const renderVisual = (index, animate = true) => {
        if (!visualProducts.length) { productVisual.hidden = true; return; }
        visualIndex = (index + visualProducts.length) % visualProducts.length;
        const product = visualProducts[visualIndex];
        const stage = productVisual.querySelector(".mock-product-stage");
        if (animate) stage.classList.add("is-changing");
        window.setTimeout(() => {
          productImage.src = product.image;
          productImage.alt = product.name;
          productName.textContent = product.name;
          productPackage.textContent = product.packageSize || (product.status === "upcoming" ? "Upcoming product" : "Current product");
          stage.classList.remove("is-changing");
        }, animate ? 160 : 0);
        productVisual.querySelectorAll(".mock-product-dots button").forEach((dot, i) => dot.classList.toggle("is-active", i === visualIndex));
      };

      const restartRotation = () => {
        window.clearInterval(rotationTimer);
        rotationTimer = window.setInterval(() => renderVisual(visualIndex + 1), 3800);
      };

      const dots = document.createElement("div");
      dots.className = "mock-product-dots";
      visualProducts.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Show product " + (i + 1));
        dot.addEventListener("click", () => { renderVisual(i); restartRotation(); });
        dots.appendChild(dot);
      });
      productVisual.appendChild(dots);
      productVisual.querySelector(".mock-product-prev")?.addEventListener("click", () => { renderVisual(visualIndex - 1); restartRotation(); });
      productVisual.querySelector(".mock-product-next")?.addEventListener("click", () => { renderVisual(visualIndex + 1); restartRotation(); });
      productVisual.addEventListener("mouseenter", () => window.clearInterval(rotationTimer));
      productVisual.addEventListener("mouseleave", restartRotation);
      productVisual.addEventListener("focusin", () => window.clearInterval(rotationTimer));
      productVisual.addEventListener("focusout", restartRotation);
      renderVisual(0, false);
      restartRotation();
    }

    const card = product => `
      <a class="product-card reveal" href="product-detail.html?id=${encodeURIComponent(product.id || product.name)}">
        <div class="product-card-media">
          ${imageMarkup(product)}
          <span class="product-status product-status-${escapeHtml(product.status)}">${escapeHtml(statusLabel(product))}</span>
        </div>
        <div class="product-card-body">
          <small>${escapeHtml(product.type || "Product")}</small>
          <h3>${escapeHtml(product.name)}</h3>
          ${product.packageSize ? `<p class="product-package">${escapeHtml(product.packageSize)}</p>` : ""}
          <p>${escapeHtml(product.description || "Explore product details.")}</p>
        </div>
      </a>`;

    if (grid) {
      let visible = published;
      if (grid.id === "top-products") visible = published.filter(p => p.featured);
      if (grid.id === "upcoming-products") visible = published.filter(p => p.status === "upcoming");
      grid.innerHTML = visible.length ? visible.map(card).join("") : '<p class="product-loading">No products are published in this section yet.</p>';
      grid.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
    }

    if (detail) {
      const id = new URLSearchParams(location.search).get("id");
      const product = published.find(p => String(p.id || p.name) === id);
      if (!product) {
        detail.innerHTML = '<div class="product-empty"><p>Product not found.</p><a class="text-link" href="products.html">Back to products →</a></div>';
        return;
      }

      document.title = `${product.name} | Dexin Manufacturing Nepal Pvt. Ltd.`;
      detail.innerHTML = `
        <div class="product-detail-grid">
          <div class="product-detail-media">${imageMarkup(product)}</div>
          <div class="product-detail-copy">
            <p class="eyebrow">${escapeHtml(statusLabel(product).toUpperCase())} PRODUCT</p>
            <small>${escapeHtml(product.type || "Product")}</small>
            <h1>${escapeHtml(product.name)}</h1>
            ${product.packageSize ? `<p><strong>Package Size:</strong> ${escapeHtml(product.packageSize)}</p>` : ""}
            <p>${escapeHtml(product.description || "Product information will be published here.")}</p>
            <a class="text-link" href="products.html">← Back to all products</a>
          </div>
        </div>`;
    }
  } catch (error) {
    if (grid) grid.innerHTML = '<p class="product-loading">Product data is not available yet.</p>';
    if (detail) detail.innerHTML = '<div class="product-empty"><p>Product information is not available yet.</p><a class="text-link" href="products.html">Back to products →</a></div>';
  }
});