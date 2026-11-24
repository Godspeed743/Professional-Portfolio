// Vite entry point. Import order matches the old classic <script> order:
// data modules set window.* globals first, then the UI modules read them
// inside their DOMContentLoaded handlers.
import './js/theme.js';
import './js/chatbot-data.js';
import './js/github-activity.js';
import './js/projects.js';
import './js/chatbot.js';
import './js/site.js';
