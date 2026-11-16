window.portfolioProjects = [
    {
        id: 'data-cleaning-mysql',
        title: 'Data Cleaning with MySQL',
        shortDescription: 'Clean and transform raw CSV data into a structured, analysis-ready dataset using MySQL Workbench.',
        longDescription: 'This project prepares raw CSV data for analysis in MySQL Workbench. The workflow removes duplicate records, handles missing values, standardizes inconsistent values, and removes unnecessary columns.',
        tags: ['MySQL Workbench', 'Data Cleaning', 'SQL'],
        category: 'data-science',
        image: 'assets/images/project-data-cleaning.webp',
        githubUrl: 'https://github.com/Godspeed743/Data-Cleaning-with-MySQL',
        highlights: [
            'Removed duplicate records and handled null values.',
            'Standardized data for more consistent analysis.',
            'Removed unnecessary columns from the dataset.'
        ]
    },
    {
        id: 'blinking-stars',
        title: 'Blinking Stars - Healthcare Platform',
        shortDescription: 'A responsive multi-page website for a therapy center with PHP, MySQL, and WhatsApp inquiry support.',
        longDescription: 'A responsive healthcare services website for a therapy center. The project combines a multi-page frontend with a PHP backend and MySQL database, plus automated inquiries and WhatsApp communication.',
        tags: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL', 'Tailwind CSS'],
        category: 'web',
        image: 'assets/images/project-healthcare-platform.webp',
        githubUrl: 'https://github.com/Godspeed743/BlinkingStars-Healthcare-Service-Platform',
        liveUrl: 'https://blinkingstars.in/',
        highlights: [
            'Built a responsive multi-page experience.',
            'Integrated PHP and MySQL for backend workflows.',
            'Added automated inquiries and WhatsApp communication.'
        ]
    },
    {
        id: 'perfume-ecommerce',
        title: 'Perfume E-Commerce Website',
        shortDescription: 'An online store for Mohammad Al Qamar Perfumes with WhatsApp ordering and inventory integration.',
        longDescription: 'A functional e-commerce website created for Mohammad Al Qamar Perfumes. The storefront supports product browsing and ordering, with WhatsApp order notifications and Google Sheets inventory synchronization.',
        tags: ['HTML', 'CSS', 'JavaScript', 'PHP', 'WhatsApp API', 'Google Sheets'],
        category: 'web',
        image: 'assets/images/project-perfume-ecommerce.webp',
        githubUrl: 'https://github.com/Godspeed743/Perfume-Eccomerce-Website',
        liveUrl: 'https://mqperfume.com/',
        highlights: [
            'Created a mobile-responsive online storefront.',
            'Integrated WhatsApp order notifications.',
            'Connected inventory updates with Google Sheets.'
        ]
    },
    {
        id: 'stock-market-capm',
        title: 'Stock Market Price Prediction - CAPM Web App',
        shortDescription: 'A Streamlit financial dashboard for stock analysis, technical indicators, ARIMA forecasts, and CAPM metrics.',
        longDescription: 'A Streamlit-based financial analytics app combining stock data, technical indicators, and CAPM investment modeling. It presents interactive charts, 30-day ARIMA price forecasts, and expected return and beta calculations using Yahoo Finance data.',
        tags: ['Python', 'NumPy', 'Pandas', 'Streamlit', 'yfinance', 'ARIMA'],
        category: 'data-science',
        image: 'assets/images/project-stock-market.webp',
        githubUrl: 'https://github.com/Godspeed743/Stock-Market-Price-Prediction-CAPM-Web-APP',
        highlights: [
            'Fetches stock data from Yahoo Finance.',
            'Combines technical indicators with 30-day ARIMA forecasts.',
            'Calculates CAPM expected return and beta metrics.'
        ]
    },
    {
        id: 'global-covid-trends',
        title: 'Analyzing Global COVID-19 Trends & Prediction',
        shortDescription: 'A June–July 2025 analysis of global COVID-19 data with dashboards, feature engineering, and forecasting.',
        longDescription: 'Completed in June–July 2025, this project analyzes WHO, Johns Hopkins University, and Kaggle COVID-19 datasets. It combines exploratory data analysis, visualization dashboards, feature engineering, forecasting, and clustering to examine global trends.',
        tags: ['Python', 'WHO', 'Johns Hopkins', 'Kaggle', 'EDA', 'Matplotlib', 'Power BI', 'Linear Regression', 'Clustering'],
        category: 'data-science',
        image: null,
        githubUrl: '',
        // TODO: Add the GitHub repository URL when it is available.
        highlights: [
            'Analyzed COVID-19 datasets from WHO, Johns Hopkins University, and Kaggle.',
            'Created exploratory visualizations and dashboards with Matplotlib and Power BI.',
            'Applied feature engineering and Linear Regression forecasting.',
            'Used clustering to explore patterns in global pandemic data.'
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const projects = window.portfolioProjects;
    const section = document.getElementById('projects');
    const grid = document.getElementById('project-grid');
    const filters = section?.querySelector('.project-filters');
    const dotsContainer = section?.querySelector('.project-carousel-dots');
    const modal = document.getElementById('project-detail-modal');
    const backdrop = document.getElementById('project-detail-backdrop');
    const modalContent = document.getElementById('project-detail-content');
    const closeButton = modal?.querySelector('.project-detail-close');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileCarousel = window.matchMedia('(max-width: 639px)');
    let activeFilter = 'all';
    let activeProject = null;
    let returnFocus = null;
    let cardObserver = null;
    let touchStartY = null;
    let filterAnimationId = 0;
    let filterTimeouts = [];
    const cardById = new Map();

    if (!Array.isArray(projects) || !section || !grid || !filters || !modal ||
        !backdrop || !modalContent || !closeButton || !dotsContainer) {
        console.error('Projects could not initialize because project data or markup is missing.');
        return;
    }

    const createElement = (tag, className, text) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    };

    function createProjectImage(project, detail = false) {
        const imageFrame = createElement('div', `project-image${detail ? ' project-detail-image' : ''}`);
        if (!project.image) {
            imageFrame.classList.add('project-image-placeholder');
            imageFrame.setAttribute('role', 'img');
            imageFrame.setAttribute('aria-label', `${project.title} chart preview placeholder`);
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-chart-line';
            icon.setAttribute('aria-hidden', 'true');
            imageFrame.appendChild(icon);
            return imageFrame;
        }

        const picture = document.createElement('picture');
        const fallback = project.image.replace(/\.webp$/i, '.jpeg');
        const source = document.createElement('source');
        source.srcset = project.image;
        source.type = 'image/webp';
        const image = document.createElement('img');
        image.src = fallback;
        image.alt = `${project.title} project preview`;
        image.width = 800;
        image.height = 500;
        image.loading = detail ? 'eager' : 'lazy';
        image.decoding = 'async';
        picture.append(source, image);
        imageFrame.appendChild(picture);
        return imageFrame;
    }

    function createProjectCard(project) {
        const card = createElement('article', 'project-card tilt-card');
        card.dataset.projectId = project.id;
        card.dataset.category = project.category;
        card.tabIndex = 0;
        card.setAttribute('aria-haspopup', 'dialog');
        card.setAttribute('aria-label', `Open details for ${project.title}`);
        card.appendChild(createProjectImage(project));

        const overlay = createElement('div', 'project-overlay');
        if (project.liveUrl) {
            const liveLink = createElement('a', 'project-link');
            liveLink.href = project.liveUrl;
            liveLink.target = '_blank';
            liveLink.rel = 'noopener noreferrer';
            liveLink.setAttribute('aria-label', `${project.title} live demo (opens in a new tab)`);
            const liveIcon = document.createElement('i');
            liveIcon.className = 'fa-solid fa-external-link-alt';
            liveIcon.setAttribute('aria-hidden', 'true');
            liveLink.appendChild(liveIcon);
            overlay.appendChild(liveLink);
        }
        if (project.githubUrl) {
            const githubLink = createElement('a', 'project-link');
            githubLink.href = project.githubUrl;
            githubLink.target = '_blank';
            githubLink.rel = 'noopener noreferrer';
            githubLink.setAttribute('aria-label', `${project.title} GitHub repository (opens in a new tab)`);
            const githubIcon = document.createElement('i');
            githubIcon.className = 'fa-brands fa-github';
            githubIcon.setAttribute('aria-hidden', 'true');
            githubLink.appendChild(githubIcon);
            overlay.appendChild(githubLink);
        }
        card.querySelector('.project-image').appendChild(overlay);

        const info = createElement('div', 'project-info');
        info.appendChild(createElement('h3', 'project-title', project.title));
        info.appendChild(createElement('p', 'project-desc', project.shortDescription));
        const tags = createElement('div', 'project-tech');
        project.tags.forEach(tag => tags.appendChild(createElement('span', '', tag)));
        info.appendChild(tags);
        card.appendChild(info);
        card.addEventListener('click', event => {
            if (event.target.closest('a')) return;
            openProject(project, card);
        });
        card.addEventListener('keydown', event => {
            if (event.target !== card || !['Enter', ' '].includes(event.key)) return;
            event.preventDefault();
            openProject(project, card);
        });
        cardById.set(project.id, card);
        return card;
    }

    projects.forEach(project => grid.appendChild(createProjectCard(project)));
    grid.hidden = false;
    filters.hidden = false;
    dotsContainer.hidden = false;

    function addDetailAction(label, url, className) {
        if (!url) return;
        const link = createElement('a', `btn ${className}`, label);
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        modalContent.querySelector('.project-detail-actions').appendChild(link);
    }

    function openProject(project, opener = document.activeElement, updateHash = true) {
        if (!project || activeProject?.id === project.id) return;
        activeProject = project;
        returnFocus = opener;
        modalContent.replaceChildren();

        modalContent.appendChild(createProjectImage(project, true));
        modalContent.appendChild(createElement('p', 'project-detail-category',
            project.category === 'web' ? 'Web Development' : 'Data Science'));
        const title = createElement('h2', 'project-detail-title', project.title);
        title.id = 'project-detail-title';
        modalContent.appendChild(title);
        modalContent.appendChild(createElement('p', 'project-detail-description', project.longDescription));

        const highlightsHeading = createElement('h3', '', 'Highlights');
        modalContent.appendChild(highlightsHeading);
        const highlights = document.createElement('ul');
        highlights.className = 'project-detail-highlights';
        project.highlights.forEach(highlight => highlights.appendChild(createElement('li', '', highlight)));
        modalContent.appendChild(highlights);

        const tagsHeading = createElement('h3', '', 'Technologies');
        modalContent.appendChild(tagsHeading);
        const tags = createElement('div', 'project-tech project-detail-tags');
        project.tags.forEach(tag => tags.appendChild(createElement('span', '', tag)));
        modalContent.appendChild(tags);

        const actions = createElement('div', 'project-detail-actions');
        modalContent.appendChild(actions);
        addDetailAction('GitHub', project.githubUrl, 'project-detail-button');
        addDetailAction('Live project', project.liveUrl, 'project-detail-button');

        modal.classList.add('active');
        backdrop.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        modal.inert = false;
        document.body.classList.add('project-modal-open');
        document.querySelector('main').inert = true;
        document.querySelector('footer')?.setAttribute('inert', '');
        document.querySelector('.chatbot-container')?.setAttribute('inert', '');
        setTimeout(() => {
            if (activeProject?.id === project.id) closeButton.focus({ preventScroll: true });
        }, 50);

        if (updateHash && location.hash !== `#project-${project.id}`) {
            history.pushState({ projectModal: project.id }, '', `#project-${project.id}`);
        }
    }

    function closeProject(updateHash = true) {
        if (!activeProject) return;
        const closedId = activeProject.id;
        activeProject = null;
        modal.classList.remove('active');
        backdrop.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        modal.inert = true;
        document.body.classList.remove('project-modal-open');
        document.querySelector('main').inert = false;
        document.querySelector('footer')?.removeAttribute('inert');
        document.querySelector('.chatbot-container')?.removeAttribute('inert');
        if (updateHash && location.hash === `#project-${closedId}`) {
            history.replaceState(history.state, '', `${location.pathname}${location.search}#projects`);
        }
        returnFocus?.focus({ preventScroll: true });
        returnFocus = null;
    }

    closeButton.addEventListener('click', () => closeProject());
    backdrop.addEventListener('click', () => closeProject());
    document.addEventListener('keydown', event => {
        if (!activeProject) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            closeProject();
        } else if (event.key === 'Tab') {
            const focusable = [...modal.querySelectorAll(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )];
            const first = focusable[0] || closeButton;
            const last = focusable[focusable.length - 1] || closeButton;
            if (!modal.contains(document.activeElement) ||
                (event.shiftKey && document.activeElement === first)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    modal.addEventListener('touchstart', event => {
        touchStartY = event.touches.length === 1 ? event.touches[0].clientY : null;
    }, { passive: true });
    modal.addEventListener('touchend', event => {
        if (touchStartY === null || event.changedTouches.length !== 1) return;
        if (event.changedTouches[0].clientY - touchStartY > 100 && mobileCarousel.matches) {
            closeProject();
        }
        touchStartY = null;
    }, { passive: true });

    function syncHash() {
        const match = location.hash.match(/^#project-(.+)$/);
        if (!match) {
            if (activeProject) closeProject(false);
            return;
        }
        const project = projects.find(item => item.id === match[1]);
        if (project) openProject(project, cardById.get(project.id), false);
    }
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('popstate', syncHash);

    function currentVisibleCards() {
        return projects
            .filter(project => activeFilter === 'all' || project.category === activeFilter)
            .map(project => cardById.get(project.id));
    }

    function updateDots() {
        const visibleCards = currentVisibleCards();
        dotsContainer.replaceChildren();
        if (visibleCards.length < 2) {
            dotsContainer.hidden = true;
            return;
        }
        dotsContainer.hidden = false;
        const visibility = new Map(visibleCards.map(card => [card, 0]));
        const setCurrent = activeCard => {
            [...dotsContainer.children].forEach((dot, index) => {
                const isActive = visibleCards[index] === activeCard;
                dot.classList.toggle('active', isActive);
                if (isActive) dot.setAttribute('aria-current', 'true');
                else dot.removeAttribute('aria-current');
            });
        };
        if (cardObserver) cardObserver.disconnect();
        cardObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => visibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0));
            const activeCard = visibleCards.reduce((best, card) =>
                visibility.get(card) > visibility.get(best) ? card : best
            );
            setCurrent(activeCard);
        }, { root: grid, threshold: [0, 0.25, 0.5, 0.75, 1] });

        visibleCards.forEach((card, index) => {
            cardObserver.observe(card);
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = `carousel-dot${index === 0 ? ' active' : ''}`;
            dot.setAttribute('aria-label', `Show project ${index + 1}`);
            if (index === 0) dot.setAttribute('aria-current', 'true');
            dot.addEventListener('click', () => {
                grid.scrollTo({
                    left: grid.scrollLeft + card.getBoundingClientRect().left - grid.getBoundingClientRect().left,
                    behavior: reducedMotion.matches ? 'auto' : 'smooth'
                });
            });
            dotsContainer.appendChild(dot);
        });
    }

    function applyFilter(filter, clickedButton) {
        if (filter === activeFilter) return;
        filterTimeouts.forEach(timeout => clearTimeout(timeout));
        filterTimeouts = [];
        const transitionId = ++filterAnimationId;
        const allCards = [...cardById.values()];
        const renderedBefore = new Set(allCards.filter(card => !card.hidden));
        const before = new Map([...renderedBefore].map(card => [card, card.getBoundingClientRect()]));
        activeFilter = filter;
        filters.querySelectorAll('.project-filter').forEach(button => {
            const selected = button === clickedButton;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });

        projects.forEach(project => {
            const card = cardById.get(project.id);
            const shouldShow = filter === 'all' || project.category === filter;
            card.classList.remove('project-card-entering', 'project-card-exiting');
            card.hidden = false;
            card.inert = !shouldShow;
            if (!shouldShow && renderedBefore.has(card) && !reducedMotion.matches) {
                card.classList.add('project-card-exiting');
                filterTimeouts.push(setTimeout(() => {
                    if (transitionId !== filterAnimationId ||
                        activeFilter === 'all' || project.category === activeFilter) return;
                    card.classList.remove('project-card-exiting');
                    card.hidden = true;
                    const visibleAfterExit = currentVisibleCards();
                    visibleAfterExit.forEach(visibleCard => {
                        const previous = before.get(visibleCard);
                        if (!previous) return;
                        const next = visibleCard.getBoundingClientRect();
                        const deltaX = previous.left - next.left;
                        const deltaY = previous.top - next.top;
                        if (deltaX || deltaY) {
                            visibleCard.animate(
                                [{ transform: `translate(${deltaX}px, ${deltaY}px)` }, { transform: 'translate(0, 0)' }],
                                { duration: 260, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
                            );
                        }
                    });
                }, 180));
            } else if (!shouldShow) {
                card.hidden = true;
            } else if (!renderedBefore.has(card) && !reducedMotion.matches) {
                card.classList.add('project-card-entering');
                filterTimeouts.push(setTimeout(() => {
                    if (transitionId === filterAnimationId) card.classList.remove('project-card-entering');
                }, 240));
            }
        });

        const visibleCards = currentVisibleCards();
        visibleCards.forEach(card => {
            const previous = before.get(card);
            const next = card.getBoundingClientRect();
            if (reducedMotion.matches) return;
            if (!previous) return;
            const deltaX = previous.left - next.left;
            const deltaY = previous.top - next.top;
            if ((deltaX || deltaY) && !card.classList.contains('project-card-exiting')) {
                card.animate(
                    [{ transform: `translate(${deltaX}px, ${deltaY}px)` }, { transform: 'translate(0, 0)' }],
                    { duration: 260, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
                );
            }
        });
        grid.scrollTo({ left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
        updateDots();
    }

    filters.addEventListener('click', event => {
        const button = event.target.closest('.project-filter');
        if (button) applyFilter(button.dataset.projectFilter, button);
    });

    if (window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches) {
        grid.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('mousemove', event => {
                const rect = card.getBoundingClientRect();
                const rotateX = ((event.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -8;
                const rotateY = ((event.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 8;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            });
        });
    }

    updateDots();
    syncHash();
});
