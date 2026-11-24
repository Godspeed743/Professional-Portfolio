document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeColorMeta = document.getElementById('theme-color-meta');
    const systemTheme = window.matchMedia('(prefers-color-scheme: light)');

    function applyTheme(theme, persist = false) {
        const isLight = theme === 'light';
        document.documentElement.classList.toggle('light-theme', isLight);
        document.documentElement.dataset.theme = theme;
        document.body.classList.toggle('light-theme', isLight);
        document.body.classList.toggle('dark-theme', !isLight);
        themeColorMeta?.setAttribute('content', isLight ? '#ffffff' : '#000000');
        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', String(isLight));
            themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
            themeToggle.querySelector('span').textContent = isLight ? 'Dark' : 'Light';
            const icon = themeToggle.querySelector('i');
            icon.classList.toggle('fa-sun', !isLight);
            icon.classList.toggle('fa-moon', isLight);
        }
        if (persist) {
            try {
                localStorage.setItem('portfolio-theme', theme);
            } catch (error) {
                console.error('Unable to save theme preference:', error);
            }
        }
    }

    const initialTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    applyTheme(initialTheme);

    themeToggle?.addEventListener('click', () => {
        applyTheme(document.body.classList.contains('light-theme') ? 'dark' : 'light', true);
    });

    const handleSystemThemeChange = event => {
        try {
            if (localStorage.getItem('portfolio-theme')) return;
        } catch (error) {
            console.error('Unable to read theme preference:', error);
        }
        applyTheme(event.matches ? 'light' : 'dark');
    };
    if (systemTheme.addEventListener) systemTheme.addEventListener('change', handleSystemThemeChange);
    else systemTheme.addListener(handleSystemThemeChange);
});
