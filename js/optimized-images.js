(() => {
  const mapUrl = "data/image-optimization-map.json";
  const normalize = value => {
    try { return decodeURI(String(value || "").split("?")[0]).replace(/^\.\//, ""); }
    catch { return String(value || "").split("?")[0].replace(/^\.\//, ""); }
  };
  const applyMap = map => {
    const swap = img => {
      if (!(img instanceof HTMLImageElement) || img.dataset.optimizedImage === "true") return;
      const raw = img.getAttribute("src");
      const optimized = map[normalize(raw)];
      if (!optimized) return;
      img.dataset.optimizedImage = "true";
      img.dataset.originalImage = raw;
      img.addEventListener("error", () => {
        if (img.dataset.originalImage) img.src = img.dataset.originalImage;
      }, { once: true });
      img.src = optimized;
      const srcset = img.getAttribute("srcset");
      if (srcset) {
        img.setAttribute("srcset", srcset.split(",").map(part => {
          const bits = part.trim().split(/\s+/);
          const replacement = map[normalize(bits[0])];
          if (replacement) bits[0] = replacement;
          return bits.join(" ");
        }).join(", "));
      }
    };
    document.querySelectorAll("img[src]").forEach(swap);
    const observer = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches?.("img[src]")) swap(node);
        node.querySelectorAll?.("img[src]").forEach(swap);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };
  const start = async () => {
    try {
      const response = await fetch(mapUrl, { cache: "no-cache" });
      if (!response.ok) return;
      applyMap(await response.json());
    } catch (error) {
      console.warn("Dexin optimized image map could not be loaded.", error);
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
