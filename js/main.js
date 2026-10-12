/**
 * Shared page enhancements
 *
 * Updates the footer year and reveals elements as they enter the viewport.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Keep the copyright year current without editing each page every year.
  const year = document.getElementById("current-year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Find elements that should animate into view.
  const reveals = document.querySelectorAll(".reveal");

  // Use IntersectionObserver when available to avoid unnecessary work off-screen.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach(element => observer.observe(element));
  } else {
    // Older browsers still show the content, even without reveal animation.
    reveals.forEach(element => element.classList.add("is-visible"));
  }
});
