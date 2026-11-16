# Mohammad Hammad Portfolio

A static, single-page portfolio built with vanilla HTML, CSS, and JavaScript. The contact form is handled by `contact.php`. There is no build step or package installation.

## Run locally

From the project root, start PHP's built-in development server:

```powershell
php -S localhost:8000
```

Open [http://localhost:8000](http://localhost:8000). The PHP mail function must be configured for contact-form email delivery; otherwise, the site still renders, but submissions cannot be sent.

## Deploy

Deploy the project root to a PHP-capable web host with PHP mail configured. Keep the `assets/`, `js/`, and `tools/` directories and the root HTML, CSS, JavaScript, and PHP files together. No compilation is required.

Before deploying:

1. Replace `https://YOUR-DOMAIN.example/` in the canonical link, Open Graph/Twitter metadata, Person JSON-LD, `sitemap.xml`, and `robots.txt` with the production origin.
2. Confirm the recipient configured in `contact.php` and configure the host's mail transport.
3. Check that the resume PDF and all image assets are included.

## Project structure

- `index.html`, `style.css`, `script.js` — page structure, styles, and shared interactions.
- `js/` — theme, project, chatbot, and GitHub activity modules.
- `contact.php` — same-origin contact form endpoint.
- `assets/images/` — optimized images served by the site.
- `assets/original/` — ignored source images; not needed in production.
- `tools/optimize-images.ps1` — image optimization helper.
