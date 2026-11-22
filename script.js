document.addEventListener('DOMContentLoaded', () => {

    // --- Preloader ---
    const preloader = document.querySelector('.preloader');
    const preloaderStartedAt = performance.now();
    const hidePreloader = () => preloader.classList.add('hidden');
    const preloaderHardTimeout = setTimeout(hidePreloader, 2500);
    setTimeout(() => {
        clearTimeout(preloaderHardTimeout);
        hidePreloader();
    }, Math.max(0, 600 - (performance.now() - preloaderStartedAt)));

    // --- Hero photo and orbit controls ---
    const heroImage = document.querySelector('.hero-image-container');
    const heroPhoto = document.querySelector('.hero-photo');
    const orbitContainer = document.querySelector('.orbit-icons');
    const heroChip = document.querySelector('.hero-tech-chip');
    const heroHint = document.querySelector('.hero-touch-hint');
    const heroReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const hasCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');

    const heroSkills = [
        { label: 'HTML5', icon: '<i class="fa-brands fa-html5" aria-hidden="true"></i>' },
        { label: 'CSS3', icon: '<i class="fa-brands fa-css3-alt" aria-hidden="true"></i>' },
        { label: 'JavaScript', icon: '<i class="fa-brands fa-js" aria-hidden="true"></i>' },
        { label: 'PHP', icon: '<i class="fa-brands fa-php" aria-hidden="true"></i>' },
        { label: 'Python', icon: '<i class="fa-brands fa-python" aria-hidden="true"></i>' },
        { label: 'Java', icon: '<i class="fa-brands fa-java" aria-hidden="true"></i>' },
        { label: 'C', icon: '<span class="skill-letter" aria-hidden="true">C</span>' },
        { label: 'Git', icon: '<i class="fa-brands fa-git-alt" aria-hidden="true"></i>' },
        { label: 'MySQL', icon: '<i class="fa-solid fa-database" aria-hidden="true"></i>' },
        { label: 'Pandas / Excel', icon: '<i class="fa-solid fa-table" aria-hidden="true"></i>' },
        { label: 'Power BI', icon: '<i class="fa-solid fa-chart-column" aria-hidden="true"></i>' },
        { label: 'Tailwind', icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12.8 3.8c1.9 1.9 2.7 4.2 2.3 6.8-.4 2.5-2 4.7-4.6 6.2-2.6 1.5-5.1 2-7.3 1.5 1.7 2.1 4.3 3.2 7.1 3.2 5.1 0 9.2-4.1 9.2-9.2 0-2.5-.9-4.8-2.6-6.5-.9-.8-2-.9-3.1-.2zM9.2 8.3c1.7-1.7 4-2.7 5.7-2.4-1.2 1.9-2.9 3.7-5.3 5.1-3.1 1.8-5.3 2.5-6.2 2.3.8-2.3 2.4-4.1 5.8-5z"/></svg>' }
    ];

    const heroOrbitState = {
        expanded: false,
        chipTimer: null,
        driftAngle: 0,
        isDriftPaused: false,
        hasInteracted: false
    };

    const showChip = (label) => {
        if (!heroChip) return;
        heroChip.textContent = label;
        heroChip.classList.add('visible');
        heroChip.setAttribute('aria-hidden', 'false');
        if (heroOrbitState.chipTimer) clearTimeout(heroOrbitState.chipTimer);
        heroOrbitState.chipTimer = window.setTimeout(() => {
            heroChip.classList.remove('visible');
            heroChip.setAttribute('aria-hidden', 'true');
        }, 2000);
    };

    const hideChip = () => {
        if (!heroChip) return;
        heroChip.classList.remove('visible');
        heroChip.setAttribute('aria-hidden', 'true');
        if (heroOrbitState.chipTimer) {
            clearTimeout(heroOrbitState.chipTimer);
            heroOrbitState.chipTimer = null;
        }
    };

    const dismissHint = () => {
        if (heroHint) heroHint.classList.remove('visible', 'pulse');
        try {
            sessionStorage.setItem('portfolio-hero-stack-hint', 'seen');
        } catch (error) {
            // Ignore sessionStorage errors.
        }
    };

    const updateHint = () => {
        if (!heroHint) return;
        let hasSeenHint = false;
        try {
            hasSeenHint = sessionStorage.getItem('portfolio-hero-stack-hint') === 'seen';
        } catch (error) {
            hasSeenHint = false;
        }
        const shouldShowHint = hasCoarsePointer.matches && !hasSeenHint && !heroOrbitState.expanded;
        heroHint.classList.toggle('visible', shouldShowHint);
        heroHint.classList.toggle('pulse', shouldShowHint);
    };

    const createOrbitIcons = () => {
        if (!orbitContainer) return [];
        orbitContainer.innerHTML = '';

        const buttons = heroSkills.map((skill) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'hero-skill-float';
            button.dataset.label = skill.label;
            button.setAttribute('aria-label', skill.label);
            button.setAttribute('data-label', skill.label);
            button.innerHTML = skill.icon;

            button.addEventListener('click', (event) => {
                event.stopPropagation();
                if (!heroOrbitState.expanded) return;
                showChip(skill.label);
            });

            button.addEventListener('pointerenter', () => {
                if (hasFinePointer.matches && heroOrbitState.expanded) {
                    showChip(skill.label);
                }
            });

            button.addEventListener('pointerleave', () => {
                hideChip();
            });

            orbitContainer.appendChild(button);
            return button;
        });

        return buttons;
    };

    const skillButtons = createOrbitIcons();

    const getRoundedRectLength = (width, height, radius) => {
        const r = Math.min(radius, width / 2, height / 2);
        const straightX = Math.max(0, width - (2 * r));
        const straightY = Math.max(0, height - (2 * r));
        return (2 * straightX) + (2 * straightY) + (Math.PI * r * 2);
    };

    const getPointOnRoundedRect = (distance, width, height, radius) => {
        const r = Math.min(radius, width / 2, height / 2);
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const topStraight = Math.max(0, width - (2 * r));
        const sideStraight = Math.max(0, height - (2 * r));
        const arcLength = (Math.PI * r) / 2;
        const segments = [
            { length: topStraight, start: { x: -halfWidth + r, y: -halfHeight }, end: { x: halfWidth - r, y: -halfHeight } },
            { length: arcLength, startAngle: -Math.PI / 2, endAngle: 0, center: { x: halfWidth - r, y: -halfHeight + r } },
            { length: sideStraight, start: { x: halfWidth, y: -halfHeight + r }, end: { x: halfWidth, y: halfHeight - r } },
            { length: arcLength, startAngle: 0, endAngle: Math.PI / 2, center: { x: halfWidth - r, y: halfHeight - r } },
            { length: topStraight, start: { x: halfWidth - r, y: halfHeight }, end: { x: -halfWidth + r, y: halfHeight } },
            { length: arcLength, startAngle: Math.PI / 2, endAngle: Math.PI, center: { x: -halfWidth + r, y: halfHeight - r } },
            { length: sideStraight, start: { x: -halfWidth, y: halfHeight - r }, end: { x: -halfWidth, y: -halfHeight + r } },
            { length: arcLength, startAngle: Math.PI, endAngle: 3 * Math.PI / 2, center: { x: -halfWidth + r, y: -halfHeight + r } }
        ];

        const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
        const normalizedDistance = ((distance % totalLength) + totalLength) % totalLength;
        let travelled = 0;

        for (const segment of segments) {
            const finishDistance = travelled + segment.length;
            if (normalizedDistance <= finishDistance) {
                const progress = segment.length === 0 ? 0 : (normalizedDistance - travelled) / segment.length;
                if ('start' in segment && 'end' in segment) {
                    return {
                        x: segment.start.x + (segment.end.x - segment.start.x) * progress,
                        y: segment.start.y + (segment.end.y - segment.start.y) * progress
                    };
                }

                const angle = segment.startAngle + (segment.endAngle - segment.startAngle) * progress;
                return {
                    x: segment.center.x + Math.cos(angle) * r,
                    y: segment.center.y + Math.sin(angle) * r
                };
            }
            travelled = finishDistance;
        }

        return { x: 0, y: -halfHeight };
    };

    const positionOrbit = () => {
        if (!heroPhoto || !orbitContainer || !skillButtons.length) return;

        const photoWidth = heroPhoto.offsetWidth || 200;
        const photoHeight = heroPhoto.offsetHeight || (photoWidth * 4 / 3);
        const borderRadius = Number.parseFloat(getComputedStyle(heroPhoto).borderRadius) || 22;
        const iconSize = hasCoarsePointer.matches
            ? (window.innerWidth <= 479 ? 20 : 26)
            : (window.innerWidth <= 767 ? 26 : 32);

        const gap = (iconSize / 2) + 14;
        const ringWidth = photoWidth + (gap * 2);
        const ringHeight = photoHeight + (gap * 2);
        const ringRadius = borderRadius + gap;
        const totalLength = getRoundedRectLength(ringWidth, ringHeight, ringRadius);

        skillButtons.forEach((button, index) => {
            const distance = ((index / skillButtons.length) * totalLength) + (heroOrbitState.driftAngle * 24);
            const orbitPoint = getPointOnRoundedRect(distance, ringWidth, ringHeight, ringRadius);
            const x = (photoWidth / 2) + orbitPoint.x - (iconSize / 2);
            const y = (photoHeight / 2) + orbitPoint.y - (iconSize / 2);
            button.style.width = `${iconSize}px`;
            button.style.height = `${iconSize}px`;
            button.style.fontSize = `${Math.max(14, iconSize * 0.56)}px`;
            button.style.transform = `translate(${x}px, ${y}px)`;
            button.style.opacity = heroOrbitState.expanded ? '1' : '0';
            button.style.visibility = heroOrbitState.expanded ? 'visible' : 'hidden';
            button.style.pointerEvents = heroOrbitState.expanded ? 'auto' : 'none';
        });
    };

    const setExpanded = (expanded) => {
        heroOrbitState.expanded = expanded;
        if (heroPhoto) {
            heroPhoto.setAttribute('aria-expanded', String(expanded));
        }

        skillButtons.forEach((button, index) => {
            button.classList.toggle('is-visible', expanded);
            button.style.opacity = expanded ? '1' : '0';
            button.style.visibility = expanded ? 'visible' : 'hidden';
            button.style.pointerEvents = expanded ? 'auto' : 'none';
            button.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;
        });

        positionOrbit();
        updateHint();

        if (!expanded) {
            hideChip();
        }
    };

    const toggleStack = () => {
        const shouldExpand = !heroOrbitState.expanded;
        try {
            if (!heroOrbitState.hasInteracted && sessionStorage) {
                heroOrbitState.hasInteracted = true;
                sessionStorage.setItem('portfolio-hero-stack-hint', 'seen');
            }
        } catch (error) {
            // Ignore storage errors.
        }
        setExpanded(shouldExpand);
        if (heroHint) {
            heroHint.classList.remove('visible', 'pulse');
        }
    };

    if (heroPhoto) {
        heroPhoto.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleStack();
        });

        heroPhoto.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleStack();
            }
        });

        heroPhoto.addEventListener('pointerenter', () => {
            if (hasFinePointer.matches && !hasCoarsePointer.matches) {
                setExpanded(true);
            }
        });

        heroPhoto.addEventListener('pointerleave', () => {
            if (hasFinePointer.matches && !hasCoarsePointer.matches) {
                setExpanded(false);
            }
        });
    }

    document.addEventListener('pointerdown', (event) => {
        if (!heroOrbitState.expanded) return;
        if (heroPhoto && heroPhoto.contains(event.target)) return;
        if (event.target && event.target.closest && event.target.closest('.hero-skill-float')) return;
        setExpanded(false);
        hideChip();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && heroOrbitState.expanded) {
            setExpanded(false);
            hideChip();
        }
    });

    window.addEventListener('scroll', () => {
        if (!heroOrbitState.expanded || hasFinePointer.matches) return;
        const photoRect = heroPhoto?.getBoundingClientRect();
        if (photoRect && (photoRect.bottom <= 0 || photoRect.top >= window.innerHeight)) {
            setExpanded(false);
        }
    }, { passive: true });

    const heroObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        heroOrbitState.isDriftPaused = !entry || !entry.isIntersecting;
    }, { threshold: 0.15 });

    if (heroImage) {
        heroObserver.observe(heroImage);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            heroOrbitState.isDriftPaused = true;
        }
    });

    const animateOrbitDrift = () => {
        if (heroOrbitState.expanded && !heroReducedMotion.matches && hasCoarsePointer.matches && !heroOrbitState.isDriftPaused && !document.hidden) {
            heroOrbitState.driftAngle += 0.0055;
            positionOrbit();
        }
        requestAnimationFrame(animateOrbitDrift);
    };

    const resizeObserver = new ResizeObserver(() => {
        positionOrbit();
        updateHint();
    });

    if (heroPhoto) {
        resizeObserver.observe(heroPhoto);
        const heroPhotoImage = heroPhoto.querySelector('img');
        heroPhotoImage?.addEventListener('load', positionOrbit);
    }

    window.addEventListener('resize', () => {
        positionOrbit();
        updateHint();
    });

    if (document.fonts?.ready) {
        document.fonts.ready.then(positionOrbit);
    }

    if (window.location.hostname === 'localhost' || window.location.search.includes('debug')) {
        const debugCheck = () => {
            if (!heroPhoto || !skillButtons.length || !heroOrbitState.expanded) return;
            const photoRect = heroPhoto.getBoundingClientRect();
            skillButtons.forEach((button) => {
                const iconRect = button.getBoundingClientRect();
                const intersectsPhoto = !(iconRect.right < photoRect.left || iconRect.left > photoRect.right || iconRect.bottom < photoRect.top || iconRect.top > photoRect.bottom);
                console.assert(!intersectsPhoto, 'Skill icon intersects the hero photo');
            });
        };
        window.addEventListener('resize', debugCheck);
        requestAnimationFrame(debugCheck);
    }

    updateHint();
    positionOrbit();
    setExpanded(false);
    requestAnimationFrame(animateOrbitDrift);
    // --- Navbar & Mobile Menu ---
    const navbar = document.querySelector('.navbar');
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');

    const mobileMenuQuery = window.matchMedia('(max-width: 768px)');
    const setMenuOpen = isOpen => {
        const shouldOpen = isOpen && mobileMenuQuery.matches;
        navLinks.classList.toggle('active', shouldOpen);
        document.body.classList.toggle('nav-open', shouldOpen);
        menuBtn.setAttribute('aria-expanded', String(shouldOpen));
        menuBtn.setAttribute('aria-label', shouldOpen ? 'Close navigation menu' : 'Open navigation menu');
        navLinks.inert = mobileMenuQuery.matches && !shouldOpen;
        navLinks.setAttribute('aria-hidden', String(mobileMenuQuery.matches && !shouldOpen));
    };

    setMenuOpen(false);
    menuBtn.addEventListener('click', () => {
        setMenuOpen(menuBtn.getAttribute('aria-expanded') !== 'true');
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
            setMenuOpen(false);
            menuBtn.focus();
        }
    });

    const handleMenuBreakpoint = () => setMenuOpen(false);
    if (mobileMenuQuery.addEventListener) {
        mobileMenuQuery.addEventListener('change', handleMenuBreakpoint);
    } else {
        mobileMenuQuery.addListener(handleMenuBreakpoint);
    }

    const backToTop = document.querySelector('.back-to-top');
    const scrollProgress = document.getElementById('scroll-progress');
    const experienceTimeline = document.querySelector('.experience-timeline');
    let scrollFrame = null;
    const updateScrollUI = () => {
        const scrollY = window.scrollY;
        navbar.classList.toggle('scrolled', scrollY > 50);
        const isBackToTopVisible = scrollY > 600;
        backToTop.classList.toggle('is-visible', isBackToTopVisible);
        backToTop.setAttribute('aria-hidden', String(!isBackToTopVisible));
        backToTop.tabIndex = isBackToTopVisible ? 0 : -1;

        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? Math.min(1, scrollY / scrollableHeight) : 0;
        scrollProgress.style.transform = `scaleX(${progress})`;
        scrollProgress.setAttribute('aria-valuenow', String(Math.round(progress * 100)));

        if (experienceTimeline) {
            const timelineRect = experienceTimeline.getBoundingClientRect();
            const timelineProgress = Math.max(0, Math.min(1,
                (window.innerHeight - timelineRect.top) / (timelineRect.height + window.innerHeight)
            ));
            experienceTimeline.style.setProperty('--timeline-progress', String(timelineProgress));
        }
        scrollFrame = null;
    };
    const requestScrollUIUpdate = () => {
        if (scrollFrame !== null) return;
        scrollFrame = requestAnimationFrame(updateScrollUI);
    };
    window.addEventListener('scroll', requestScrollUIUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUIUpdate, { passive: true });
    updateScrollUI();

    const timelineHoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    document.querySelectorAll('.experience-details').forEach(details => {
        details.addEventListener('pointerenter', () => {
            if (timelineHoverQuery.matches) details.open = true;
        });
        details.addEventListener('pointerleave', () => {
            if (timelineHoverQuery.matches && !details.contains(document.activeElement)) details.open = false;
        });
    });

    // Active Link Highlighting
    const sections = document.querySelectorAll('main section[id]');
    const updateActiveNav = current => {
        navItems.forEach(li => {
            li.classList.remove('active');
            if (current === '' ? li.getAttribute('href') === '#home' : li.getAttribute('href') === `#${current}`) {
                li.classList.add('active');
            }
        });
    };

    updateActiveNav('');
    let snapHighlightedSection = null;
    const activeSectionObserver = new IntersectionObserver(entries => {
        const intersectingSections = entries.filter(entry => entry.isIntersecting);
        if (intersectingSections.length === 0) return;

        const activeSection = intersectingSections.reduce((closest, entry) =>
            Math.abs(entry.boundingClientRect.top - window.innerHeight * 0.25) <
            Math.abs(closest.boundingClientRect.top - window.innerHeight * 0.25) ? entry : closest
        );
        updateActiveNav(activeSection.target.id);
        if (snapHighlightedSection && snapHighlightedSection !== activeSection.target) {
            snapHighlightedSection.classList.remove('snap-highlight');
        }
        snapHighlightedSection = activeSection.target;
        snapHighlightedSection.classList.add('snap-highlight');
    }, {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    });
    sections.forEach(section => activeSectionObserver.observe(section));

    // --- Typing Animation ---
    const typingText = document.querySelector('.typing-text');
    const typingContainer = document.querySelector('.typing-container');
    const words = (typingContainer?.dataset.roles || '').split('|').filter(Boolean);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimer = null;

    function type() {
        if (!typingText || !words.length || document.hidden || prefersReducedMotion) return;
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = 100;
        if (isDeleting) typeSpeed /= 2;

        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500;
        }

        typingTimer = setTimeout(type, typeSpeed);
    }

    if (typingText && words.length) {
        if (prefersReducedMotion) {
            typingText.textContent = words[0];
        } else {
            typingTimer = setTimeout(type, 1500);
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    clearTimeout(typingTimer);
                    typingTimer = null;
                } else if (typingTimer === null) {
                    typingTimer = setTimeout(type, 250);
                }
            });
        }
    }

    // --- Scroll Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((element, index) => {
        element.dataset.revealDirection = index % 2 === 0 ? 'left' : 'right';
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- About Stat Counters ---
    const statCounters = document.querySelectorAll('.about-stat-value[data-count]');
    const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const counter = entry.target;
            observer.unobserve(counter);
            const target = Number(counter.dataset.count);
            const decimals = Number(counter.dataset.decimals) || 0;
            const suffix = counter.dataset.suffix || '';
            if (!Number.isFinite(target)) return;
            if (prefersReducedMotion) {
                counter.textContent = `${target.toFixed(decimals)}${suffix}`;
                return;
            }
            const startTime = performance.now();
            const duration = 1200;
            const animateCounter = now => {
                const progress = Math.min(1, (now - startTime) / duration);
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                counter.textContent = `${(target * easedProgress).toFixed(decimals)}${suffix}`;
                if (progress < 1) requestAnimationFrame(animateCounter);
                else counter.textContent = `${target.toFixed(decimals)}${suffix}`;
            };
            requestAnimationFrame(animateCounter);
        });
    }, { threshold: 0.4 });
    statCounters.forEach(counter => statObserver.observe(counter));

    // --- Mobile Skills Accordion and Skill Item Stagger ---
    const skillsGrid = document.querySelector('.skills-grid');
    const skillCategoryToggles = document.querySelectorAll('.skill-category-toggle');
    const mobileSkillsQuery = window.matchMedia('(max-width: 599px)');
    const setSkillAccordionMode = isMobile => {
        skillCategoryToggles.forEach(toggle => {
            toggle.setAttribute('aria-expanded', String(!isMobile));
            const items = document.getElementById(toggle.getAttribute('aria-controls'));
            if (items) items.hidden = isMobile;
        });
    };
    setSkillAccordionMode(mobileSkillsQuery.matches);
    skillCategoryToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            if (!mobileSkillsQuery.matches) return;
            const willExpand = toggle.getAttribute('aria-expanded') !== 'true';
            toggle.setAttribute('aria-expanded', String(willExpand));
            const items = document.getElementById(toggle.getAttribute('aria-controls'));
            if (items) items.hidden = !willExpand;
        });
    });
    const handleSkillsBreakpoint = event => setSkillAccordionMode(event.matches);
    if (mobileSkillsQuery.addEventListener) mobileSkillsQuery.addEventListener('change', handleSkillsBreakpoint);
    else mobileSkillsQuery.addListener(handleSkillsBreakpoint);

    const skillStaggerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('skills-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.2 });
    if (skillsGrid) {
        skillsGrid.classList.add('skills-animated');
        skillStaggerObserver.observe(skillsGrid);
    }

    // --- Desktop Hero Cursor Spotlight ---
    const hero = document.querySelector('.hero');
    const spotlightQuery = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
    if (hero && spotlightQuery.matches && !prefersReducedMotion) {
        let spotlightFrame = null;
        let pointerPosition = null;
        hero.addEventListener('pointermove', event => {
            pointerPosition = { x: event.clientX, y: event.clientY };
            if (spotlightFrame !== null) return;
            spotlightFrame = requestAnimationFrame(() => {
                const rect = hero.getBoundingClientRect();
                hero.style.setProperty('--spotlight-x', `${pointerPosition.x - rect.left}px`);
                hero.style.setProperty('--spotlight-y', `${pointerPosition.y - rect.top}px`);
                hero.classList.add('spotlight-active');
                spotlightFrame = null;
            });
        }, { passive: true });
        hero.addEventListener('pointerleave', () => hero.classList.remove('spotlight-active'));
    }

    // --- Certificate Lightbox ---
    const certificateLightbox = document.getElementById('certificate-lightbox');
    const certificateImage = certificateLightbox?.querySelector('.certificate-lightbox-image');
    const certificateClose = certificateLightbox?.querySelector('.certificate-lightbox-close');
    let certificateOpener = null;
    let touchStart = null;

    const closeCertificate = () => {
        if (!certificateLightbox?.classList.contains('active')) return;
        certificateLightbox.classList.remove('active');
        certificateLightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
        certificateImage.removeAttribute('src');
        certificateImage.alt = '';
        certificateOpener?.focus();
        certificateOpener = null;
    };

    document.querySelectorAll('.certificate-view').forEach(button => {
        button.addEventListener('click', () => {
            certificateOpener = button;
            certificateImage.src = button.dataset.certificateSrc;
            certificateImage.alt = button.dataset.certificateAlt;
            certificateImage.width = Number(button.dataset.certificateWidth);
            certificateImage.height = Number(button.dataset.certificateHeight);
            certificateImage.loading = 'eager';
            certificateLightbox.classList.add('active');
            certificateLightbox.setAttribute('aria-hidden', 'false');
            document.body.classList.add('lightbox-open');
            setTimeout(() => {
                if (certificateLightbox.classList.contains('active')) certificateClose.focus();
            }, 50);
        });
    });

    certificateClose?.addEventListener('click', closeCertificate);
    certificateLightbox?.addEventListener('click', event => {
        if (event.target === certificateLightbox) closeCertificate();
    });

    certificateLightbox?.addEventListener('touchstart', event => {
        if (event.touches.length === 1) {
            touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        } else {
            touchStart = null;
        }
    }, { passive: true });

    certificateLightbox?.addEventListener('touchend', event => {
        if (!touchStart || event.changedTouches.length !== 1) return;
        const deltaY = event.changedTouches[0].clientY - touchStart.y;
        const deltaX = event.changedTouches[0].clientX - touchStart.x;
        if (deltaY > 100 && Math.abs(deltaX) < 75) closeCertificate();
        touchStart = null;
    }, { passive: true });

    document.addEventListener('keydown', event => {
        if (!certificateLightbox?.classList.contains('active')) return;
        if (event.key === 'Escape') {
            closeCertificate();
        } else if (event.key === 'Tab') {
            event.preventDefault();
            certificateClose.focus();
        }
    });

    // --- Certification Card Tilt Effect ---
    if (window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches) {
        const tiltCards = document.querySelectorAll('#certifications .tilt-card');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            });
        });
    }

    // --- Set Footer Year ---
    document.getElementById('year').textContent = new Date().getFullYear();

    // --- Contact Form Submission (AJAX) ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const contactToast = document.getElementById('contact-toast');
    const messageField = contactForm?.elements.namedItem('message');
    const messageCount = document.getElementById('message-count');
    const draftStorageKey = 'portfolio-contact-draft';
    const draftFields = contactForm ? ['name', 'email', 'subject', 'message'] : [];
    let toastTimer;

    if (contactForm && formStatus) {
        const showToast = (message, type = 'success') => {
            clearTimeout(toastTimer);
            contactToast.textContent = message;
            contactToast.className = `contact-toast ${type} visible`;
            toastTimer = setTimeout(() => {
                contactToast.classList.remove('visible');
            }, 5000);
        };

        const updateMessageCount = () => {
            messageCount.textContent = `${messageField.value.length} / 1000`;
        };

        const validateField = field => {
            const errorElement = document.getElementById(`${field.id}-error`);
            let message = '';
            if (!field.value.trim()) {
                message = 'This field is required.';
            } else if (field.type === 'email' && field.validity.typeMismatch) {
                message = 'Enter a valid email address.';
            } else if (field.value.length > 1000) {
                message = 'Use 1000 characters or fewer.';
            }

            errorElement.textContent = message;
            field.setAttribute('aria-invalid', String(Boolean(message)));
            return !message;
        };

        const validateForm = () => {
            let isValid = true;
            let firstInvalidField = null;
            draftFields.forEach(name => {
                const field = contactForm.elements.namedItem(name);
                if (!validateField(field)) {
                    isValid = false;
                    if (!firstInvalidField) firstInvalidField = field;
                }
            });
            if (firstInvalidField) firstInvalidField.focus();
            return isValid;
        };

        const saveDraft = () => {
            const draft = Object.fromEntries(draftFields.map(name => [
                name,
                contactForm.elements.namedItem(name).value
            ]));
            try {
                sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
            } catch (error) {
                console.warn('Unable to save the contact form draft:', error);
            }
        };

        try {
            const savedDraft = sessionStorage.getItem(draftStorageKey);
            if (savedDraft) {
                const draft = JSON.parse(savedDraft);
                draftFields.forEach(name => {
                    if (typeof draft[name] === 'string') {
                        contactForm.elements.namedItem(name).value = draft[name].slice(0, 1000);
                    }
                });
            }
        } catch (error) {
            console.warn('Unable to restore the contact form draft:', error);
        }

        draftFields.forEach(name => {
            const field = contactForm.elements.namedItem(name);
            field.addEventListener('input', () => {
                saveDraft();
                if (field.hasAttribute('aria-invalid')) validateField(field);
                if (name === 'message') updateMessageCount();
            });
            field.addEventListener('blur', () => validateField(field));
        });
        updateMessageCount();

        contactForm.addEventListener('submit', async event => {
            event.preventDefault();
            if (!validateForm()) return;

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;

            btnText.textContent = 'Sending...';
            submitBtn.disabled = true;
            submitBtn.classList.add('is-loading');
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm)
                });
                const data = await response.json().catch(() => null);

                if (!response.ok || data?.status !== 'success') {
                    throw new Error(data?.message || 'Unable to send your message. Please try again.');
                }

                contactForm.reset();
                try {
                    sessionStorage.removeItem(draftStorageKey);
                } catch (error) {
                    console.warn('Unable to clear the contact form draft:', error);
                }
                draftFields.forEach(name => {
                    const field = contactForm.elements.namedItem(name);
                    field.removeAttribute('aria-invalid');
                    document.getElementById(`${field.id}-error`).textContent = '';
                });
                updateMessageCount();
                showToast(data.message, 'success');
            } catch (error) {
                console.error('Contact form submission failed:', error);
                formStatus.textContent = error instanceof TypeError
                    ? 'A network error occurred. Please check your connection and try again.'
                    : error.message || 'Unable to send your message. Please try again.';
                formStatus.className = 'form-status error';
            } finally {
                btnText.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
            }
        });
    }

    // --- Copy Contact Email ---
    const copyEmailButton = document.querySelector('.copy-email-btn');
    const copyEmailStatus = document.getElementById('copy-email-status');
    if (copyEmailButton && copyEmailStatus) {
        let copyEmailTimer;
        copyEmailButton.addEventListener('click', async () => {
            try {
                const email = copyEmailButton.dataset.copyEmail;
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(email);
                } else {
                    const temporaryInput = document.createElement('textarea');
                    temporaryInput.value = email;
                    temporaryInput.setAttribute('readonly', '');
                    temporaryInput.style.position = 'fixed';
                    temporaryInput.style.opacity = '0';
                    document.body.appendChild(temporaryInput);
                    temporaryInput.select();
                    const copied = document.execCommand('copy');
                    temporaryInput.remove();
                    if (!copied) throw new Error('Clipboard access is unavailable in this browser.');
                }
                clearTimeout(copyEmailTimer);
                copyEmailStatus.textContent = 'Copied!';
                copyEmailButton.querySelector('span').textContent = 'Copied!';
                copyEmailTimer = setTimeout(() => {
                    copyEmailButton.querySelector('span').textContent = 'Copy email';
                    copyEmailStatus.textContent = '';
                }, 2500);
            } catch (error) {
                console.error('Unable to copy the contact email:', error);
                copyEmailStatus.textContent = 'Copy failed. Please select the email address above.';
            }
        });
    }
});
