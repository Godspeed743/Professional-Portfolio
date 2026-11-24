# Mohammad Hammad Portfolio

A static, single-page portfolio built with vanilla HTML, CSS, and JavaScript and deployed on Vercel. The contact form posts to Web3Forms (https://api.web3forms.com/submit) using the public access key in a hidden form field. It is built with Vite and uses three.js, GSAP, Lenis and postprocessing for 3D and motion.

## Run locally

Requires Node ^20.19.0 or >=22.12.0.

```powershell
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve dist/ at http://localhost:4173
npm test         # Playwright smoke test (starts the dev server itself)
```

The standalone checks in `tests/*.js` take the server URL as an argument, for example `node tests/check.js http://localhost:5173`. Contact form submissions are sent to Web3Forms; the service needs an internet connection.

## Deploy

Vercel builds the site with `npm run build` and serves `dist/` (see `vercel.json`).

Before deploying:

1. The production origin (`https://portfolio-mu-six-gosjyvrdj4.vercel.app/`) is set in the canonical link, Open Graph/Twitter metadata, Person JSON-LD, `sitemap.xml`, and `robots.txt`. Update all of them if the domain changes.
2. Confirm the Web3Forms public access key in the form's hidden field.
3. Check that the resume PDF and all image assets are included.

## Project structure

- `index.html` — page structure and the Vite entry (loads `/src/main.js` and `/src/style.css`).
- `src/style.css`, `src/main.js` — styles and the module entry that imports `src/js/*`.
- `src/js/` — theme, project, chatbot, GitHub activity, and shared site interactions (`site.js`).
- `public/` — files copied to the site root unchanged: `assets/images/`, `favicon.svg`, `resume.pdf`, `robots.txt`, `sitemap.xml`.
- Web3Forms — handles contact form submissions from the static site.
- `assets/images/` — optimized images served by the site.
- `assets/original/` — ignored source images; not needed in production.
- `tools/optimize-images.ps1` — image optimization helper (writes to `public/assets/images/`).
