# Mohammad Hammad Portfolio

A static, single-page portfolio built with vanilla HTML, CSS, and JavaScript and deployed on Vercel. The contact form posts to Web3Forms (https://api.web3forms.com/submit) using the public access key in a hidden form field. There is no build step or package installation.

## Run locally

From the project root, start a local static file server:

```powershell
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). Contact form submissions are sent to Web3Forms; the service needs an internet connection.

## Deploy

Deploy the static project root to Vercel. Keep the `assets/`, `js/`, and root HTML, CSS, and JavaScript files together. No compilation is required.

Before deploying:

1. Replace `https://YOUR-DOMAIN.example/` in the canonical link, Open Graph/Twitter metadata, Person JSON-LD, `sitemap.xml`, and `robots.txt` with the production origin.
2. Confirm the Web3Forms public access key in the form's hidden field.
3. Check that the resume PDF and all image assets are included.

## Project structure

- `index.html`, `style.css`, `script.js` — page structure, styles, and shared interactions.
- `js/` — theme, project, chatbot, and GitHub activity modules.
- Web3Forms — handles contact form submissions from the static site.
- `assets/images/` — optimized images served by the site.
- `assets/original/` — ignored source images; not needed in production.
- `tools/optimize-images.ps1` — image optimization helper.
