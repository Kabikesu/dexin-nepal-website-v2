document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("all-products") || document.getElementById("top-products") || document.getElementById("upcoming-products");
  const orbit = document.getElementById("product-orbit");
  const detail = document.getElementById("product-detail");
  if (!grid && !orbit && !detail) return;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

  try {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error("Product data unavailable");
    const products = await response.json();
    if (!Array.isArray(products)) throw new Error("Invalid product data");

    const card = product => `
      <a class="product-card reveal" href="product-detail.html?id=${encodeURIComponent(product.id || product.name)}">
        <div class="product-card-media"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy"></div>
        <div class="product-card-body"><small>${escapeHtml(product.type || "Product")}</small><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.description || "Explore product details.")}</p></div>
      </a>`;

    if (grid) {
      let visible = products;
      if (grid.id === "top-products") visible = products.filter(p => p.featured);
      if (grid.id === "upcoming-products") visible = products.filter(p => p.upcoming);
      grid.innerHTML = visible.length ? visible.map(card).join("") : '<p class="product-loading">No products are published in this section yet.</p>';
      grid.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
    }

    if (orbit) {
      const orbitProducts = products.slice(0, Math.min(8, products.length));
      orbit.innerHTML = orbitProducts.map((product, index) => {
        const angle = index * (360 / orbitProducts.length);
        return `<a class="orbit-product" href="product-detail.html?id=${encodeURIComponent(product.id || product.name)}" style="--angle:${angle}deg" aria-label="View ${escapeHtml(product.name)}"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy"><span>${escapeHtml(product.name)}</span></a>`;
      }).join("");
    }

    if (detail) {
      const id = new URLSearchParams(location.search).get("id");
      const product = products.find(p => String(p.id || p.name) === id);
      if (!product) {
        detail.innerHTML = '<div class="product-empty"><p>Product not found.</p><a class="text-link" href="products.html">Back to products →</a></div>';
        return;
      }
      document.title = `${product.name} | Dexin Manufacturing Nepal Pvt. Ltd.`;
      detail.innerHTML = `
        <div class="product-detail-grid">
          <div class="product-detail-media"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"></div>
          <div class="product-detail-copy"><p class="eyebrow">PRODUCT</p><small>${escapeHtml(product.type || "Product")}</small><h1>${escapeHtml(product.name)}</h1><p>${escapeHtml(product.description || "Product information will be published here.")}</p><a class="text-link" href="products.html">← Back to all products</a></div>
        </div>`;
    }
  } catch (error) {
    if (grid) grid.innerHTML = '<p class="product-loading">Product data is not available yet.</p>';
    if (orbit) orbit.innerHTML = "";
    if (detail) detail.innerHTML = '<div class="product-empty"><p>Product information is not available yet.</p><a class="text-link" href="products.html">Back to products →</a></div>';
  }
});