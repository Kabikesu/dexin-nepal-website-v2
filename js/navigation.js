/**
 * Main navigation interactions
 *
 * Handles the mobile navigation toggle, top-level dropdowns, nested
 * submenus, and closing menus when the user clicks outside them.
 */

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  // Open or close the mobile navigation and keep the accessibility state in sync.
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  // Open one top-level dropdown at a time.
  document.querySelectorAll(".nav-dropdown-toggle").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();

      const parent = button.closest(".nav-dropdown");

      document.querySelectorAll(".nav-dropdown.open").forEach(dropdown => {
        if (dropdown !== parent) {
          dropdown.classList.remove("open");
        }
      });

      parent.classList.toggle("open");
    });
  });

  // Open one nested submenu at a time.
  document.querySelectorAll(".nav-submenu-toggle").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();

      const parent = button.closest(".nav-dropdown-submenu");

      document.querySelectorAll(".nav-dropdown-submenu.open").forEach(submenu => {
        if (submenu !== parent) {
          submenu.classList.remove("open");
        }
      });

      parent.classList.toggle("open");
    });
  });

  // Close open menus when the user clicks elsewhere on the page.
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-dropdown.open, .nav-dropdown-submenu.open")
      .forEach(dropdown => dropdown.classList.remove("open"));
  });
});
