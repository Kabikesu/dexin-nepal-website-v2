document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("all-products-grid");
  const filters = [...document.querySelectorAll(".product-filter")];
  if (!grid) return;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const published = product => product.published !== false && ["current","upcoming"].includes(product.status);

  const imageMarkup = product => product.image
    ? '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" loading="lazy">'
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

    const render = filter => {
      let visible = items;
      if (filter === "current" || filter === "upcoming") visible = items.filter(p => p.status === filter);
      if (filter === "Coffee" || filter === "Nutraceuticals") visible = items.filter(p => p.type === filter);
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
    render("all");
  } catch (error) {
    grid.innerHTML = '<p class="product-loading">Product data is not available yet.</p>';
  }
});