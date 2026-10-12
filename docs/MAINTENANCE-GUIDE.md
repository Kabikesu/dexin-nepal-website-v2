# Website Maintenance Guide

This guide explains where to make common changes in the Dexin Manufacturing Nepal Website V2 repository. It is written for safe, small edits without changing the existing design or functionality.

## First rule: make the smallest change

- Do not rename, move, or delete existing files unless you have checked every reference to them.
- Do not replace an entire HTML, CSS, JavaScript, or JSON file just to change one item.
- Before editing, open the current file on the `main` branch and use GitHub's pencil button.
- Make one logical change per commit, then review the changed-file list.
- After deployment, check the affected page on desktop and mobile. Use **Ctrl + F5** to bypass the browser cache.

## Quick file finder

| What you want to change | Start here |
| --- | --- |
| Home page content and sections | `index.html` |
| Home page visual styling | `css/pages/home.css` |
| Shared header, footer, buttons, global styles | `css/style.css` |
| Mobile/tablet layout rules | `css/responsive.css` and the relevant page CSS |
| Navigation behavior (mobile menu/dropdowns) | `js/navigation.js` |
| About page text and sections | `about.html`; styling: `css/pages/about.css` |
| Product catalogue entries and product metadata | `data/products.json`, `data/product-details.json` |
| Product catalogue behavior / filtering / rendering | `js/products.js` |
| Product hero showcase behavior | `js/products-hero.js`; styling: `css/pages/products.css` |
| Top Products or Upcoming Products page layout/content | `top-products.html` or `upcoming-products.html`; related behavior is in `js/products.js` |
| Staff names, titles, departments, bios, and profile data | `data/staff.json` |
| Special Operations/leadership card and team rendering | `js/team.js` |
| Team page styling | `css/pages/team.css` |
| Careers vacancies and application settings | `data/vacancies.json` |
| Careers page behavior | `js/careers.js`; styling: `css/pages/careers.css` |
| Contact page content and layout | `contact.html`, `css/pages/contact.css`, `js/contact.js` |
| Gallery page behavior | `js/gallery.js`; styling: `css/pages/gallery.css` |
| Gallery data | `data/gallery.json` |
| Quality page content and layout | `quality.html`, `css/pages/quality.css` |
| Logo, hero, factory, staff, and certification images | Relevant subfolders under `images/` |
| Image optimization / image manifest behavior | `js/optimized-images.js`, `js/automatic-images.js`, and `data/image-manifest.json` |
| Image and product generation scripts | `scripts/` (read the script before running or changing it) |
| Shared page behavior and current-year footer | `js/main.js` |

## Folder map

- `*.html` — individual website pages and their page structure.
- `css/style.css` — shared/global styles. Keep page-specific rules in `css/pages/` where practical.
- `css/responsive.css` — shared responsive rules for smaller screens.
- `css/pages/` — page-specific styles such as `home.css`, `products.css`, `team.css`, and `careers.css`.
- `js/` — browser-side behavior. Each page's HTML shows which scripts it loads.
- `data/` — JSON content used by page scripts. Validate JSON syntax carefully; one missing comma or quote can prevent data from loading.
- `images/` — website image assets, organized by purpose.
- `scripts/` — maintenance/generation scripts. Read their instructions and inputs before use.
- `optimized-images/` — generated/optimized image assets; avoid hand-editing generated files unless the workflow requires it.

## Safe editing examples

### Change a staff member
1. Open `data/staff.json`.
2. Find the correct person or department.
3. Change only the required fields, preserving the JSON structure.
4. Preview the Our Team page after deployment.

### Change a product
1. Check `data/products.json` and `data/product-details.json` to identify which file owns the field you need.
2. Keep product names, image paths, status, and detail records consistent.
3. If the image is generated or mapped automatically, inspect the relevant script and manifest before manually changing generated data.
4. Preview All Products, Top Products, Upcoming Products, and a product detail page as applicable.

### Change colors, spacing, or typography
1. For a single page, start with its stylesheet in `css/pages/`.
2. For shared site-wide elements, inspect `css/style.css`.
3. For mobile-only problems, inspect `css/responsive.css`.
4. Avoid broad selectors or duplicate overrides unless necessary. Test desktop and mobile after each change.

### Change the navigation
Navigation markup appears in the page HTML files, while menu behavior is in `js/navigation.js`. Before changing the menu, search for the same markup across pages so the header remains consistent throughout the site.

## Important data-file note

`data/staff.json` is the current source used by `js/team.js` for the team directory. `data/team.json` is present as a separate file; do not assume it controls the visible team page without checking its script references first.

## Before committing

- [ ] Only the intended files changed.
- [ ] No unrelated wording, colors, spacing, or layout changed.
- [ ] HTML tags are properly closed.
- [ ] JSON remains valid (quotes and commas are correct).
- [ ] Image and script paths still point to existing files.
- [ ] The affected page works on desktop and mobile.
- [ ] The commit message explains the specific change.

## Deployment note

A successful GitHub commit does not by itself prove that the live website has finished deploying or looks correct. Check the hosting/deployment status and inspect the live page after the update.
