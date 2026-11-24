# Copilot Instructions for Mohammad Hammad Portfolio

## Project overview
- This is a static single-page portfolio for Mohammad Hammad, focused on Data Science and Full-Stack development.
- Keep the site as a vanilla HTML/CSS/JavaScript project with no frameworks, bundlers, or build step.
- Keep the site static; the contact form posts to Web3Forms (https://api.web3forms.com/submit) using the public access key in a hidden form field.
- Maintain the current structure and section order in `index.html`.
- The project assets include the root HTML, CSS, and JavaScript files, editable chatbot and project data under `js/`, and optimized images under `assets/`.

## Core implementation rules
- Keep the dark neon aesthetic and reuse the CSS variables defined in `:root` (`--neon-cyan`, `--neon-purple`, `--bg-main`, and related tokens). Do not hardcode color values when a theme variable already exists.
- Prefer mobile-first CSS and maintain the project’s responsive scale with standard breakpoints: 360, 480, 600, 768, 1024, and 1280.
- Use `dvh` instead of `vh` for full-height layouts.
- Ensure all interactive targets meet a minimum touch size of 44x44px.
- Set form/input font sizes to at least 16px so iOS Safari does not trigger zoom on focus.
- Never rely on `:hover` for essential behavior. Any hover-only interaction must also have a touch or focus equivalent.
- Respect `prefers-reduced-motion` and avoid unnecessary animation or motion that could be distracting.
- Do not add libraries, frameworks, or CDNs unless explicitly requested. Keep Font Awesome in place if it is already used.
- Ensure there is no horizontal scroll at any width from 320px upward.
- Keep the existing dark neon theme consistent across sections, typography, buttons, accents, and surfaces.
- Keep theme preference handling in `js/theme.js`; use the `body.light-theme` CSS variable overrides and preserve the early anti-flash theme setup in `index.html`.
- Keep comments brief and only add them for non-obvious logic.

## Content and code expectations
- Preserve the current project identity: clean, modern, technical, data-driven, and visually polished.
- Keep the portfolio static and lightweight; avoid unnecessary dependencies or complexity.
- Maintain semantic HTML structure and accessible behavior.
- Keep JavaScript plain and focused; do not introduce framework patterns or tooling.
- Keep chatbot response content and keywords in `js/chatbot-data.js`; do not add résumé claims that are not verified.
- Keep GitHub activity loading and its session cache in `js/github-activity.js`; it must remain public, token-free, and hidden when the API is unavailable.
- Keep project content in the `window.portfolioProjects` array in `js/projects.js`; render cards from the data and retain the static `<noscript>` fallback.
- Preserve the current ordering of major sections in `index.html` when making changes.
- Do not modify unrelated files or introduce unrelated features.

## Quality bar for future tasks
- Make changes that are surgical and consistent with the current design system.
- Validate responsiveness and accessibility in a browser-like review before concluding a task.
- Favor reusable CSS variables and existing patterns over one-off styles.
- Avoid regressions in the dark neon theme, layout behavior, and mobile usability.
