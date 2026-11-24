document.addEventListener('DOMContentLoaded', () => {
    const strip = document.getElementById('github-activity');
    if (!strip) return;

    const cacheKey = 'github-activity-godspeed743';
    const cacheDuration = 30 * 60 * 1000;

    const readCache = () => {
        try {
            const cached = JSON.parse(sessionStorage.getItem(cacheKey));
            const data = cached?.data;
            if (cached && Date.now() - cached.savedAt < cacheDuration &&
                Number.isFinite(data?.profile?.public_repos) &&
                Number.isFinite(data?.profile?.followers) &&
                Array.isArray(data?.repositories)) {
                return cached.data;
            }
        } catch {
            // Continue with a fresh request when session storage is unavailable or invalid.
        }
        return null;
    };

    const writeCache = data => {
        try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), data }));
        } catch {
            // The activity strip remains usable without session storage.
        }
    };

    const renderActivity = data => {
        const stats = strip.querySelector('.github-activity-stats');
        const repositories = strip.querySelector('.github-repositories');

        [
            ['repositories', data.profile.public_repos],
            ['followers', data.profile.followers]
        ].forEach(([name, value]) => {
            const stat = stats.querySelector(`[data-github-stat="${name}"]`);
            stat.classList.remove('github-skeleton');
            stat.querySelector('.github-stat-value').textContent = String(value);
        });

        repositories.replaceChildren();
        data.repositories.forEach(repository => {
            const link = document.createElement('a');
            link.className = 'github-repo';
            link.href = repository.html_url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            const name = document.createElement('span');
            name.className = 'github-repo-name';
            name.textContent = repository.name;

            const meta = document.createElement('span');
            meta.className = 'github-repo-meta';
            const language = document.createElement('span');
            language.textContent = repository.language || 'No language';
            const stars = document.createElement('span');
            const starIcon = document.createElement('i');
            starIcon.className = 'fa-solid fa-star';
            starIcon.setAttribute('aria-hidden', 'true');
            stars.append(starIcon, document.createTextNode(' '));
            stars.append(document.createTextNode(String(repository.stargazers_count)));
            meta.append(language, stars);
            link.append(name, meta);
            repositories.append(link);
        });

        strip.setAttribute('aria-busy', 'false');
    };

    const loadActivity = async () => {
        const cached = readCache();
        if (cached) {
            renderActivity(cached);
            return;
        }

        try {
            const [profileResponse, repositoriesResponse] = await Promise.all([
                fetch('https://api.github.com/users/Godspeed743', {
                    headers: { Accept: 'application/vnd.github+json' }
                }),
                fetch('https://api.github.com/users/Godspeed743/repos?sort=updated&per_page=100', {
                    headers: { Accept: 'application/vnd.github+json' }
                })
            ]);

            if (!profileResponse.ok || !repositoriesResponse.ok) {
                strip.hidden = true;
                return;
            }

            const [profile, repositories] = await Promise.all([
                profileResponse.json(),
                repositoriesResponse.json()
            ]);
            if (!Number.isFinite(profile.public_repos) || !Number.isFinite(profile.followers) ||
                !Array.isArray(repositories)) {
                strip.hidden = true;
                return;
            }

            const data = {
                profile: {
                    public_repos: profile.public_repos,
                    followers: profile.followers
                },
                repositories: repositories
                    .filter(repository => repository && repository.name && repository.html_url)
                    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
                    .slice(0, 3)
                    .map(repository => ({
                        name: repository.name,
                        html_url: repository.html_url,
                        language: repository.language,
                        stargazers_count: Number(repository.stargazers_count) || 0
                    }))
            };

            writeCache(data);
            renderActivity(data);
        } catch {
            strip.hidden = true;
        }
    };

    loadActivity();
});
