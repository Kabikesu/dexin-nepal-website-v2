/**
 * Gallery page
 *
 * Loads gallery albums from data/gallery.json, groups nested folders into
 * separate albums, and provides a full-screen image viewer with thumbnails.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("gallery-albums");
  const viewer = document.getElementById("gallery-viewer");
  const image = document.getElementById("viewer-image");
  const title = document.getElementById("viewer-title");
  const count = document.getElementById("viewer-count");
  const thumbs = document.getElementById("viewer-thumbnails");

  // Stop safely if this page does not contain the gallery elements.
  if (!root || !viewer) return;

  let albums = [];
  let activeAlbum = null;
  let activeIndex = 0;
  let lastFocused = null;
  let touchStartX = 0;

  // Load the gallery data without relying on a cached copy.
  try {
    const response = await fetch("data/gallery.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Gallery manifest unavailable");
    }

    const manifest = await response.json();
    albums = normalizeAlbums(manifest);
    renderAlbums();
  } catch (error) {
    root.innerHTML =
      '<p class="gallery-status">Gallery is being prepared. Please check back soon.</p>';
  }

  /**
   * Split images in nested folders into separate albums.
   * Images directly inside an album remain in that original album.
   */
  function normalizeAlbums(manifest) {
    const normalized = [];

    for (const album of manifest || []) {
      const grouped = new Map();

      for (const item of album.images || []) {
        const parts = String(item.src || "").split("/");
        const albumRoot = album.title;
        const rootIndex = parts.findIndex(part => part === albumRoot);
        const relativeParts = rootIndex >= 0 ? parts.slice(rootIndex + 1) : [];
        const nestedFolder = relativeParts.length > 1 ? relativeParts[0] : null;
        const key = nestedFolder || "__direct__";

        if (!grouped.has(key)) {
          grouped.set(key, []);
        }

        grouped.get(key).push(item);
      }

      for (const [key, images] of grouped) {
        if (key === "__direct__") {
          normalized.push({ ...album, images });
        } else {
          normalized.push({
            id: slugify(album.id + "-" + key),
            title: key,
            images
          });
        }
      }
    }

    return normalized;
  }

  // Convert a label into a URL-friendly identifier for generated albums.
  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // Render the album cards and connect each card to the image viewer.
  function renderAlbums() {
    if (!albums.length) {
      root.innerHTML =
        '<p class="gallery-status">No gallery albums are available yet. Add photos to the gallery folders to publish them automatically.</p>';
      return;
    }

    root.innerHTML = albums
      .map((album, index) => {
        const cover = album.images[0];

        return (
          '<button class="album-card" type="button" data-album-index="' +
          index +
          '"><span class="album-cover"><img loading="lazy" src="' +
          escapeAttr(cover.src) +
          '" alt="' +
          escapeAttr(album.title) +
          '"></span><span class="album-info"><span><strong class="album-info-title">' +
          escapeHtml(album.title) +
          '</strong></span><span class="album-info-count">' +
          album.images.length +
          " image" +
          (album.images.length === 1 ? "" : "s") +
          "</span></span></button>"
        );
      })
      .join("");

    root.querySelectorAll("[data-album-index]").forEach(card => {
      card.addEventListener("click", () => {
        openAlbum(Number(card.dataset.albumIndex));
      });
    });
  }

  // Open the selected album and remember where keyboard focus came from.
  function openAlbum(index) {
    activeAlbum = albums[index];
    activeIndex = 0;
    lastFocused = document.activeElement;

    renderViewer();
    viewer.hidden = false;
    document.body.style.overflow = "hidden";

    setTimeout(() => viewer.querySelector(".viewer-close")?.focus(), 0);
  }

  // Update the main image, counter, title, and thumbnail selection.
  function renderViewer() {
    if (!activeAlbum?.images?.length) return;

    const item = activeAlbum.images[activeIndex];

    image.src = item.src;
    image.alt = item.alt || activeAlbum.title;
    title.textContent = item.title || activeAlbum.title;
    count.textContent = activeIndex + 1 + " / " + activeAlbum.images.length;

    thumbs.innerHTML = activeAlbum.images
      .map((entry, index) => {
        return (
          '<button class="viewer-thumb ' +
          (index === activeIndex ? "is-active" : "") +
          '" type="button" data-thumb="' +
          index +
          '" aria-label="View image ' +
          (index + 1) +
          '"><img loading="lazy" src="' +
          escapeAttr(entry.src) +
          '" alt=""></button>'
        );
      })
      .join("");

    thumbs.querySelectorAll("[data-thumb]").forEach(thumb => {
      thumb.addEventListener("click", () => {
        activeIndex = Number(thumb.dataset.thumb);
        renderViewer();
        scrollActiveThumbIntoView();
      });
    });

    scrollActiveThumbIntoView();
  }

  // Keep the selected thumbnail visible in the thumbnail strip.
  function scrollActiveThumbIntoView() {
    thumbs
      .querySelector(".is-active")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  // Close the viewer, restore page scrolling, and return keyboard focus.
  function closeViewer() {
    viewer.hidden = true;
    document.body.style.overflow = "";
    image.src = "";
    activeAlbum = null;
    lastFocused?.focus?.();
  }

  // Move to the next or previous image, wrapping at either end of the album.
  function step(direction) {
    if (!activeAlbum) return;

    activeIndex =
      (activeIndex + direction + activeAlbum.images.length) %
      activeAlbum.images.length;

    renderViewer();
  }

  // Close buttons and the viewer backdrop.
  viewer.querySelectorAll("[data-viewer-close]").forEach(element => {
    element.addEventListener("click", closeViewer);
  });

  // Previous and next navigation controls.
  viewer.querySelector(".viewer-prev").addEventListener("click", () => step(-1));
  viewer.querySelector(".viewer-next").addEventListener("click", () => step(1));

  // Support swipe gestures on touch screens.
  viewer.querySelector(".viewer-main").addEventListener(
    "touchstart",
    event => {
      touchStartX = event.changedTouches[0]?.screenX || 0;
    },
    { passive: true }
  );

  viewer.querySelector(".viewer-main").addEventListener(
    "touchend",
    event => {
      const endX = event.changedTouches[0]?.screenX || 0;
      const difference = endX - touchStartX;

      if (Math.abs(difference) > 50) {
        step(difference < 0 ? 1 : -1);
      }
    },
    { passive: true }
  );

  // Keyboard support for closing and navigating the open viewer.
  document.addEventListener("keydown", event => {
    if (viewer.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeViewer();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  });

  // Escape text and attribute values before inserting them into HTML markup.
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character]));
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
});
