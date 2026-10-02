document.addEventListener("DOMContentLoaded", async () => {
  const stage = document.getElementById("hero-product-showcase");
  const ring = document.getElementById("hero-product-ring");
  const mainImage = document.getElementById("hero-product-main-image");
  const mainName = document.getElementById("hero-product-name");
  const mainType = document.getElementById("hero-product-type");
  const counter = document.getElementById("hero-product-counter");
  if (!stage || !ring || !mainImage || !mainName || !mainType) return;

  const fallback = [
    ["Cocozhi","Coffee","images/products/coffee/Cocozhi.jpg"],
    ["Cordyceps Coffee 3 in 1","Coffee","images/products/coffee/Cordyceps Coffee 3 in 1.jpg"],
    ["Lingzhi Coffee 3 in 1","Coffee","images/products/coffee/Lingzhi Coffee 3 in 1.jpg"],
    ["Ganocelium (GL-90) Capsule","Nutraceuticals","images/products/nutraceuticals/Ganocelium GL-90.jpg"],
    ["Reishi Gano (RG-90) Capsule","Nutraceuticals","images/products/nutraceuticals/Reishi Gano RG-90.jpg"],
    ["Spirulina Powder - 50 gm","Nutraceuticals","images/products/nutraceuticals/Spirulina 50g Powder.png"],
    ["Spirulina Tablets 120","Nutraceuticals","images/products/nutraceuticals/Spirulina 120 Tablet.png"],
    ["Spirulina Tablets 360","Nutraceuticals","images/products/nutraceuticals/Spirulina 360 Tablet  .png"],
    ["Spirulina Capsule 120","Nutraceuticals","images/products/nutraceuticals/Spirulina 120 Capsule .png"],
    ["Spirulina Capsule 360","Nutraceuticals","images/products/nutraceuticals/Spirulina 360 Capsule .png"],
    ["Cordyceps Capsule 360","Nutraceuticals","images/products/nutraceuticals/Cordyceps Capsule 360.jpg"],
    ["Cordyceps Tablets 120","Nutraceuticals","images/products/nutraceuticals/Cordyceps Tablets 120.jpg"],
    ["Cordyceps Tablets 360","Nutraceuticals","images/products/nutraceuticals/Cordyceps Tablets 360.jpg"],
    ["LionsMane Capsule 120","Nutraceuticals","images/products/nutraceuticals/LionsMane Capsule 120.jpg"],
    ["LionsMane Capsule 360","Nutraceuticals","images/products/nutraceuticals/LionsMane Capsule 360.jpg"],
    ["LionsMane Tablets 360","Nutraceuticals","images/products/nutraceuticals/LionsMane Tablets 360.jpg"]
  ];

  let products = [];
  try {
    const response = await fetch("data/products.json", { cache: "no-store" });
    if (!response.ok) throw new Error("manifest unavailable");
    products = (await response.json()).filter(p => p && p.image && p.published !== false && ["current","upcoming"].includes(p.status));
  } catch {
    products = fallback.map((p, i) => ({ id: String(i), name:p[0], type:p[1], image:p[2] }));
  }
  if (!products.length) return;

  const items = products.filter(p => p.image);
  const nodes = [];
  const count = Math.min(items.length, 18);

  for (let i = 0; i < count; i++) {
    const product = items[i];
    const button = document.createElement("a");
    button.className = "hero-product-orbit-item";
    button.href = "product-detail.html?id=" + encodeURIComponent(product.id || product.name);
    button.setAttribute("aria-label", "View " + product.name);
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    img.loading = i < 8 ? "eager" : "lazy";
    img.decoding = "async";
    button.appendChild(img);
    ring.appendChild(button);
    nodes.push(button);
  }

  let rotation = 0, activeIndex = 0, raf = 0, last = performance.now(), paused = false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setActive = index => {
    activeIndex = ((index % count) + count) % count;
    const product = items[activeIndex];
    mainImage.src = product.image;
    mainImage.alt = product.name;
    mainName.textContent = product.name;
    mainType.textContent = product.type || "Product";
    if (counter) counter.textContent = String(activeIndex + 1).padStart(2, "0") + " / " + String(count).padStart(2, "0");
    nodes.forEach((node, i) => node.classList.toggle("is-active", i === activeIndex));
  };

  const layout = () => {
    const width = stage.clientWidth;
    const small = window.innerWidth <= 560, mobile = window.innerWidth <= 760;
    const rx = small ? Math.min(width * .42, 150) : mobile ? Math.min(width * .44, 225) : Math.min(width * .46, 350);
    const ry = small ? 122 : mobile ? 160 : 225;
    const step = Math.PI * 2 / count;
    let best = 0, bestScore = -Infinity;
    nodes.forEach((node, i) => {
      const angle = rotation + i * step, x = Math.cos(angle) * rx, y = Math.sin(angle) * ry;
      const depth = (Math.sin(angle) + 1) / 2;
      const scale = .58 + depth * .42;
      node.style.transform = "translate3d(" + x + "px," + y + "px,0) scale(" + scale + ")";
      node.style.opacity = (.12 + depth * .88).toFixed(3);
      node.style.zIndex = String(10 + Math.round(depth * 20));
      node.style.pointerEvents = depth > .18 ? "auto" : "none";
      node.classList.toggle("is-front", depth > .82);
      if (depth > bestScore) { bestScore = depth; best = i; }
    });
    if (best !== activeIndex && bestScore > .78) setActive(best);
  };

  const tick = now => {
    if (!paused && !reduceMotion) rotation += Math.min(now - last, 50) * .00012;
    last = now; layout(); raf = requestAnimationFrame(tick);
  };

  stage.addEventListener("mouseenter", () => paused = true);
  stage.addEventListener("mouseleave", () => { paused = false; last = performance.now(); });
  stage.addEventListener("focusin", () => paused = true);
  stage.addEventListener("focusout", () => { paused = false; last = performance.now(); });

  setActive(0); layout();
  if (!reduceMotion) raf = requestAnimationFrame(tick);
  window.addEventListener("resize", layout, { passive: true });
});