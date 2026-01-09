// ===== SMOOTH SCROLL NAVIGATION =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                const navLinks = document.getElementById('navLinks');
                navLinks.classList.remove('active');
            }
        }
    });
});

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===== MOBILE MENU TOGGLE =====
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('active') && !e.target.closest('.navbar')) {
        navLinks.classList.remove('active');
        if (mobileMenuToggle) mobileMenuToggle.textContent = '☰';
    }
});

// ===== FADE-IN ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// ===== SERVICE DRAWER LOGIC (HYBRID UX) =====
const serviceDrawer = document.getElementById('serviceDrawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const drawerBody = document.getElementById('drawerBody');
const drawerCloseBtn = document.getElementById('drawerClose');

const serviceDetails = {
    'marketing-ops': {
        title: "Marketing Ops & HubSpot Foundation",
        hero: "Best for: Teams scaling past early traction",
        content: `
            <div class="drawer-section">
                <h3>What I Do</h3>
                <ul class="drawer-list">
                    <li>Design or rebuild HubSpot lifecycle stages</li>
                    <li>Clean up lead scoring and routing</li>
                    <li>Align HubSpot with sales workflows</li>
                    <li>Create campaign structures that ship fast</li>
                    <li>Set up attribution that actually makes sense</li>
                </ul>
            </div>
            <div class="drawer-section">
                <h3>What You Get</h3>
                <ul class="drawer-list">
                    <li>A CRM the team trusts</li>
                    <li>Faster execution</li>
                    <li>Clear visibility into what’s working</li>
                </ul>
            </div>
        `
    },
    'lifecycle': {
        title: "Lifecycle & Activation Systems",
        hero: "Best for: Products with users but low activation or expansion",
        content: `
            <div class="drawer-section">
                <h3>What I Do</h3>
                <ul class="drawer-list">
                    <li>Map the real customer journey</li>
                    <li>Build onboarding flows tied to product behavior</li>
                    <li>Design re-engagement and expansion triggers</li>
                    <li>Simplify messaging across email & in-product</li>
                </ul>
            </div>
            <div class="drawer-section">
                <h3>What You Get</h3>
                <ul class="drawer-list">
                    <li>Faster time-to-value for users</li>
                    <li>Better activation and retention</li>
                    <li>Revenue impact without more ad spend</li>
                </ul>
            </div>
        `
    },
    'abm': {
        title: "Lean ABM & Targeted Growth",
        hero: "Best for: B2B startups selling to specific accounts",
        content: `
            <div class="drawer-section">
                <h3>What I Do</h3>
                <ul class="drawer-list">
                    <li>Define who you should be targeting</li>
                    <li>Build account segmentation that sales can use</li>
                    <li>Design ABM workflows without heavy tooling</li>
                    <li>Align marketing signals with SDR outreach</li>
                </ul>
            </div>
            <div class="drawer-section">
                <h3>What You Get</h3>
                <ul class="drawer-list">
                    <li>Higher-quality conversations</li>
                    <li>Less wasted spend</li>
                    <li>A focused GTM motion</li>
                </ul>
            </div>
        `
    },
    'web-design': {
        title: "Strategic Web Design",
        hero: "Best for: Brands that need to look premium while scaling",
        content: `
            <div class="drawer-section">
                <h3>What I Do</h3>
                <ul class="drawer-list">
                    <li>High-fidelity UI/UX design</li>
                    <li>Conversion-focused landing pages</li>
                    <li>Design systems & component libraries</li>
                    <li>Interactive prototypes</li>
                    <li>Brand identity refinement</li>
                </ul>
            </div>
            <div class="drawer-section">
                <h3>What You Get</h3>
                <ul class="drawer-list">
                    <li>A site that builds trust instantly</li>
                    <li>Higher conversion rates</li>
                    <li>A design system that scales with you</li>
                </ul>
            </div>
        `
    },
    'brand-identity': {
        title: "Brand Identity & Systems",
        hero: "Best for: Companies that need a visual language, not just a logo",
        content: `
            <div class="drawer-section">
                <h3>What I Do</h3>
                <ul class="drawer-list">
                    <li>Complete visual identity design</li>
                    <li>Brand strategy & positioning</li>
                    <li>Social media asset kits</li>
                    <li>Sales deck & collateral design</li>
                    <li>Interaction design guidelines</li>
                </ul>
            </div>
            <div class="drawer-section">
                <h3>What You Get</h3>
                <ul class="drawer-list">
                    <li>A brand that commands premium pricing</li>
                    <li>Consistency across every touchpoint</li>
                    <li>Assets that scale with your team</li>
                </ul>
            </div>
        `
    },
    'fractional': {
        title: "Fractional Marketing Leadership",
        hero: "Best for: Founders who need execution + strategy",
        content: `
            <div class="drawer-section">
                <h3>What I Do</h3>
                <ul class="drawer-list">
                    <li>Own GTM and growth execution</li>
                    <li>Make tooling decisions</li>
                    <li>Build funnels and systems</li>
                    <li>Help with investor narrative and metrics</li>
                    <li>Act as a thought partner, not an agency</li>
                </ul>
            </div>
            <div class="drawer-section">
                <h3>What You Get</h3>
                <ul class="drawer-list">
                    <li>A marketing lead without a full-time hire</li>
                    <li>Speed and clarity</li>
                    <li>Someone accountable for outcomes</li>
                </ul>
            </div>
        `
    }
};

function openDrawer(serviceId) {
    const data = serviceDetails[serviceId];
    if (!data) return;

    drawerBody.innerHTML = `
        <div class="drawer-hero">
            <span class="eyebrow" style="margin-bottom: 0.5rem;">System Breakdown</span>
            <h2>${data.title}</h2>
            <p style="color: var(--color-primary); font-weight: 500;">${data.hero}</p>
        </div>
        ${data.content}
        <div style="margin-top: 3rem; text-align: center;">
            <a href="#contact" class="btn btn-primary" onclick="closeDrawer()">Book This System</a>
        </div>
    `;

    serviceDrawer.classList.add('active');
    drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    serviceDrawer.classList.remove('active');
    drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
}

// Event Listeners for Drawer
document.querySelectorAll('.open-drawer').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const serviceId = btn.getAttribute('data-service');
        openDrawer(serviceId);
    });
});

if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDrawer();
        if (typeof closeCaseStudy === 'function') closeCaseStudy();
    }
});

// ===== CONTACT FORM & CONFETTI =====
const contactForm = document.getElementById('contactForm');
const formSuccessMessage = document.getElementById('formSuccessMessage');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        // Form submits naturally to FormSubmit
        // We set a flag to show confetti on return
        localStorage.setItem('formSubmitted', 'true');

        const submitBtn = contactForm.querySelector('.form-submit');
        submitBtn.textContent = 'Scheduling...';
        submitBtn.disabled = true;
    });
}

// Check for return from FormSubmit
window.addEventListener('load', () => {
    if (localStorage.getItem('formSubmitted') === 'true') {
        localStorage.removeItem('formSubmitted');

        if (contactForm && formSuccessMessage) {
            contactForm.style.display = 'none';
            formSuccessMessage.style.display = 'block';

            // Trigger Confetti
            triggerConfetti();
        }
    }
});

function triggerConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);

        if (typeof confetti === 'function') {
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }
    }, 250);
}

// Simple smooth entrance for hero elements
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelectorAll('.hero-title, .hero-subtitle, .hero-cta').forEach((el, index) => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }, 100);
});

// ===== MOUSE FOLLOWER GRADIENT =====
document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.getElementById('home');
    const heroGradient = document.getElementById('heroGradient');

    if (heroSection && heroGradient) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            heroGradient.style.setProperty('--mouse-x', `${x}px`);
            heroGradient.style.setProperty('--mouse-y', `${y}px`);
        });
    }
});


// ===== LIGHTBOX (GALLERY ONLY) =====
// Only targets images inside elements with data-gallery="true"
// Uses event delegation for performance
(function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return; // Exit if not on a page with lightbox

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    // Open lightbox - event delegation on galleries
    document.addEventListener('click', (e) => {
        const galleryContainer = e.target.closest('[data-gallery="true"]');
        if (!galleryContainer) return;

        const clickedImg = e.target.closest('img');
        if (!clickedImg) return;

        // Open lightbox with clicked image
        lightboxImage.src = clickedImg.src;
        lightboxImage.alt = clickedImg.alt || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus close button for accessibility
        setTimeout(() => lightboxClose?.focus(), 100);
    });

    // Close lightbox function
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxImage.src = '';
    }

    // Close button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Click outside image closes
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxImage.parentElement) {
            closeLightbox();
        }
    });

    // ESC key closes (integrated with existing ESC handler)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
})();

// ===== STICKY CTA BAR =====
(function initStickyCta() {
    const stickyCta = document.getElementById('stickyCta');
    const heroSection = document.getElementById('home');

    if (!stickyCta || !heroSection) return;

    window.addEventListener('scroll', () => {
        if (heroSection.getBoundingClientRect().bottom < 0) {
            stickyCta.classList.add('visible');
        } else {
            stickyCta.classList.remove('visible');
        }
    });
})();

// ===== IDLE TIMER + GAME =====
(function initIdleGame() {
    const IDLE_TIMEOUT = 30000; // 30 seconds
    let idleTimer = null;
    let toastDismissed = false;
    let gameInitialized = false;

    const idleToast = document.getElementById('idleToast');
    const gameModal = document.getElementById('gameModal');

    if (!idleToast || !gameModal) return;

    const playBtn = document.getElementById('idlePlayBtn');
    const dismissBtn = document.getElementById('idleDismissBtn');
    const closeBtn = document.getElementById('gameCloseBtn');

    function resetIdleTimer() {
        if (toastDismissed) return;

        clearTimeout(idleTimer);
        hideToast();

        idleTimer = setTimeout(showToast, IDLE_TIMEOUT);
    }

    function showToast() {
        if (toastDismissed) return;
        idleToast.classList.add('visible');
    }

    function hideToast() {
        idleToast.classList.remove('visible');
    }

    function openGame() {
        hideToast();
        gameModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (!gameInitialized && typeof TetrisGame !== 'undefined') {
            TetrisGame.init('tetrisCanvas', 'nextPieceCanvas');
            gameInitialized = true;
        } else if (gameInitialized && typeof TetrisGame !== 'undefined') {
            TetrisGame.reset();
        }
    }

    function closeGame() {
        gameModal.classList.remove('active');
        document.body.style.overflow = '';
        resetIdleTimer();
    }

    // Event listeners
    if (playBtn) playBtn.addEventListener('click', openGame);
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            hideToast();
            toastDismissed = true;
            clearTimeout(idleTimer);
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeGame);

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && gameModal.classList.contains('active')) {
            closeGame();
        }
    });

    // Close on backdrop click
    gameModal.addEventListener('click', (e) => {
        if (e.target === gameModal) {
            closeGame();
        }
    });

    // Reset timer on user activity
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
        document.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Start the idle timer
    resetIdleTimer();

    // ===== SECRET BASEMENT =====
    const basement = document.getElementById('secretBasement');
    const basementPlayBtn = document.getElementById('basementPlayBtn');

    if (basement) {
        let userHasScrolled = false;

        // Only enable basement reveal after user actively scrolls
        window.addEventListener('scroll', () => {
            userHasScrolled = true;
        }, { once: true });

        // Reveal basement when scrolling to it (after user has scrolled)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && userHasScrolled) {
                    basement.classList.add('visible');
                }
            });
        }, { threshold: 0.3 });

        observer.observe(basement);

        // Basement play button
        if (basementPlayBtn) {
            basementPlayBtn.addEventListener('click', openGame);
        }
    }
})();
