# Dexin Manufacturing Nepal Pvt. Ltd. — Website V2

Official website codebase for Dexin Manufacturing Nepal Pvt. Ltd.

## Start here

**Need to make a website change?** Read the [Website Maintenance Guide](docs/MAINTENANCE-GUIDE.md) first. It maps common edits to the correct files and explains how to avoid unintended changes.

## Website navigation

Home | About | Products | Gallery | Quality | Staff Portal | Company | Contact

- Products: All Products, Top Products, Upcoming Products.
- Company: Our Team, Careers.
- Staff Portal: internal staff access links.

## Project structure

- `*.html` — website pages and page structure.
- `css/style.css` — shared styles and site-wide components.
- `css/responsive.css` — shared mobile and tablet rules.
- `css/pages/` — page-specific styles.
- `js/` — interactive behavior and rendering.
- `data/` — product, staff, gallery, vacancy, and image metadata.
- `images/` — logo, hero, factory, staff, product, gallery, and certification assets.
- `scripts/` — image, product, and gallery maintenance/generation scripts.
- `optimized-images/` — optimized image assets.

## Common edits

| Task | File |
| --- | --- |
| Change staff names, roles, or department data | `data/staff.json` |
| Change product catalogue data | `data/products.json` and `data/product-details.json` |
| Change vacancy content and career settings | `data/vacancies.json` |
| Change team rendering or the special Operations card | `js/team.js` |
| Change shared navigation behavior | `js/navigation.js` |
| Change shared site styling | `css/style.css` |
| Change a page's styling | Relevant file in `css/pages/` |

## Design principles

- Preserve the existing Dexin red, charcoal, and white corporate identity.
- Prefer small, targeted changes over broad rewrites.
- Keep content in data files when the page already uses a data-driven approach.
- Do not rename or move files without checking all references.
- Check the affected page on desktop and mobile after each change.

## Deployment

This is a static HTML/CSS/JavaScript website designed for static hosting. A GitHub commit confirms the source update, not that hosting has completed deployment; inspect the deployment status and live page after changes.
