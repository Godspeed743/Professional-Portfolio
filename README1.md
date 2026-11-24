# Mohammad Hammad: Portfolio

A fast, responsive personal portfolio for **Mohammad Hammad**, a Data Science &amp; Machine Learning enthusiast and Frontend / Full-Stack developer. Built with plain HTML, CSS and JavaScript: no framework and no build step.

**🔗 Live site:** [YOUR-SITE.vercel.app](https://YOUR-SITE.vercel.app)

<!-- Add a screenshot here once you have one, for example: ![Portfolio preview](docs/preview.png) -->

> **Status:** Phase 1 (first public release). See the [roadmap](#roadmap).

## ✨ Features

- **Interactive hero:** a photo with tech-stack icons that appear around it on hover (desktop) or tap (phones and tablets), with keyboard support
- **Light and dark theme** that follows the system setting and remembers your choice
- **Fully responsive:** designed for phones, tablets and desktops, with a mobile skills accordion and a swipeable project carousel
- **Skills section** with 9 categories (see below)
- **Projects:** filterable cards (All / Web / Data Science) driven from a single data file
- **Experience &amp; education timeline**, plus a **certifications** section with viewable certificates
- **Built-in chatbot assistant** that answers questions about skills, projects, education and how to get in touch
- **Contact form** with validation, a character counter, draft saving and spam protection
- **GitHub activity** strip loaded from the public GitHub API
- **Accessibility and SEO:** skip link, keyboard navigation, respects reduced-motion settings, Open Graph tags, JSON-LD, sitemap and robots.txt

## 🧰 Skills shown on the site

| Category | Technologies |
|---|---|
| Core Languages | Python, C, C++, Java, PHP |
| Data Science & ML | Pandas, NumPy, Scikit-learn, Data Visualization, Matplotlib, Power BI, Jupyter |
| Web Development | HTML5, CSS3, JavaScript, Tailwind CSS, MySQL |
| Software Development | Algorithms, OOP, REST APIs, Debugging, Docker, Linux |
| App Development | Flutter, React Native, Kotlin, Swift, Firebase, Figma |
| Tools & Platforms | Git, GitHub, VS Code, Excel, Streamlit |
| Vibe Coding | Cursor, Claude Code, GitHub Copilot, Prompt Design, AI Agents, Rapid Prototyping |
| Digital Marketing | SEO, Analytics, Google Ads, Meta Ads, Email Marketing, Content |
| Video Editing | Premiere Pro, DaVinci Resolve, After Effects, CapCut, Audio Mixing, Color Grading |

## 🏗️ Tech stack

| | |
|---|---|
| **Frontend** | HTML5, CSS3 (custom properties, Grid, Flexbox), vanilla JavaScript |
| **Icons and fonts** | Font Awesome 6, Google Fonts |
| **Contact form** | [Web3Forms](https://web3forms.com) (no server code needed) |
| **Hosting** | Vercel (static site) |
| **Optional checks** | Node.js and Playwright (browser tests) |

## 📁 Project structure

```
.
├── index.html                  # page structure and content
├── style.css                   # all styles
├── script.js                   # shared interactions (navigation, hero, forms, animations)
├── js/
│   ├── theme.js                # light / dark theme
│   ├── projects.js             # project data and filtering
│   ├── chatbot.js              # chatbot widget
│   ├── chatbot-data.js         # chatbot answers (edit this to change replies)
│   └── github-activity.js      # GitHub activity strip
├── assets/images/              # optimized WebP / JPEG images
├── favicon.svg
├── Mohammad_Hammad_Resume.pdf
├── robots.txt
├── sitemap.xml
├── tests/                      # optional automated browser checks (development only)
├── tools/optimize-images.ps1   # image optimization helper (development only)
└── .vercelignore               # keeps development files out of the deployed site
```

## 🚀 Run locally

No installation is needed to view the site. From the project folder, start any static server:

```bash
python -m http.server 8080
```

Then open <http://localhost:8080>. (On Windows you may need `py -m http.server 8080`.)

## ✉️ Set up the contact form

The form sends messages through Web3Forms.

1. Get a free access key at [web3forms.com](https://web3forms.com).
2. In `index.html`, find the hidden input named `access_key` and set its `value` to your key.
3. Send one real test message after deploying, and check your spam folder the first time.

The access key is meant to be public, so it is safe in the page source.

## 🌍 Deploy on Vercel

1. Push this repository to GitHub.
2. In Vercel choose **Add New → Project** and import the repository.
3. Set **Framework Preset** to **Other**. Leave the build command and output directory empty.
4. Deploy.
5. Replace `https://YOUR-SITE.vercel.app` (and the older `https://YOUR-DOMAIN.example/` placeholder, if it is still present) in the canonical link, Open Graph / Twitter tags, JSON-LD, `sitemap.xml` and `robots.txt` with your real address.

## 🧪 Automated checks (optional)

The `tests/` folder has Playwright scripts that check the layout at many screen sizes, the hero icons, the skills section and the contact form (using a fake form service, so no email is sent).

```bash
npm install
npx playwright install chromium
python -m http.server 8080          # keep this running in a second terminal

node tests/check.js http://localhost:8080
node tests/orbit-check.js http://localhost:8080
node tests/skills-check.js http://localhost:8080
node tests/contact-check.js http://localhost:8080
```

## 🧩 Customize

| To change | Edit |
|---|---|
| Projects | `js/projects.js` |
| Skills | the Skills section in `index.html` |
| Chatbot answers | `js/chatbot-data.js` |
| Colors and fonts | the CSS variables at the top of `style.css` |
| Resume | replace `Mohammad_Hammad_Resume.pdf` (keep the file name) |

## 🗺️ Roadmap

- [x] **Phase 1:** responsive portfolio, interactive hero, 9-category skills section, projects, timeline, chatbot, contact form
- [ ] Add the GitHub link for the COVID-19 trends project
- [ ] Add images for the two pending certifications
- [ ] Add a screenshot to this README

## 📬 Contact

**Mohammad Hammad**: [GitHub](https://github.com/Godspeed743) · [mohdhammad743@gmail.com](mailto:mohdhammad743@gmail.com)

## 📄 License

© 2026 Mohammad Hammad. The personal photos, text, resume and certificates on this site are not for reuse. If you would like to share the code under an open-source license, add a `LICENSE` file to the repository.
