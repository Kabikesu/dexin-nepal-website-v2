document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("all-products") || document.getElementById("top-products") || document.getElementById("upcoming-products");
  const orbit = document.getElementById("product-orbit");
  const detail = document.getElementById("product-detail");
  const showcaseInfo = document.getElementById("product-showcase-info");
  if (!grid && !orbit && !detail) return;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const imageMarkup = product => product.image
    ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">`
    : `<div class="product-card-placeholder" aria-hidden="true"><span>DEXIN</span></div>`;
  const statusLabel = product => product.status === "upcoming" ? "Upcoming" : "Current";

  const updateShowcase = (product, index, total) => {
    if (!showcaseInfo || !product) return;
    showcaseInfo.classList.remove("is-changing");
    void showcaseInfo.offsetWidth;
    const type = showcaseInfo.querySelector(".showcase-type");
    const title = showcaseInfo.querySelector("h2");
    const description = showcaseInfo.querySelector(".showcase-description");
    const packageSize = showcaseInfo.querySelector(".showcase-package");
    const position = showcaseInfo.querySelector(".showcase-position");
    const link = showcaseInfo.querySelector(".showcase-link");
    type.textContent = `${statusLabel(product)} PRODUCT`;
    title.textContent = product.name;
    description.textContent = product.description || "Explore product details.";
    packageSize.textContent = product.packageSize || "";
    position.textContent = `${index + 1} / ${total}`;
    link.href = `product-detail.html?id=${encodeURIComponent(product.id || product.name)}`;
    showcaseInfo.classList.add("is-changing");
  };

  try {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error("Product data unavailable");
    const products = await response.json();
    if (!Array.isArray(products)) throw new Error("Invalid product data");

    const published = products.filter(product => product.published !== false && ["current", "upcoming"].includes(product.status));

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

    if (orbit) {
      const currentProducts = published.filter(p => p.status === "current");
      const orbitProducts = currentProducts.slice(0, Math.min(8, currentProducts.length));
      if (orbitProducts.length) {
        orbit.innerHTML = orbitProducts.map((product, index) => {
          const angle = index * (360 / orbitProducts.length);
          return `<a class="orbit-product" href="product-detail.html?id=${encodeURIComponent(product.id || product.name)}" style="--angle:${angle}deg" data-product-index="${index}" aria-label="View ${escapeHtml(product.name)}">${imageMarkup(product)}</a>`;
        }).join("");

        let activeIndex = 0;
        const showActive = () => updateShowcase(orbitProducts[activeIndex], activeIndex, orbitProducts.length);
        showActive();

        orbit.querySelectorAll(".orbit-product").forEach((item, index) => {
          item.addEventListener("mouseenter", () => updateShowcase(orbitProducts[index], index, orbitProducts.length));
          item.addEventListener("focus", () => updateShowcase(orbitProducts[index], index, orbitProducts.length));
          item.addEventListener("click", event => {
            activeIndex = index;
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          });
        });

        setInterval(() => {
          activeIndex = (activeIndex + 1) % orbitProducts.length;
          showActive();
        }, 4200);
      } else {
        orbit.innerHTML = "";
        if (showcaseInfo) showcaseInfo.innerHTML = '<p class="showcase-type">PRODUCTS</p><h2>Product showcase</h2><p class="showcase-description">Product images will appear here when published.</p>';
      }
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
    if (orbit) orbit.innerHTML = "";
    if (detail) detail.innerHTML = '<div class="product-empty"><p>Product information is not available yet.</p><a class="text-link" href="products.html">Back to products →</a></div>';
  }
});