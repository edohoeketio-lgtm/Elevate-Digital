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

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===== MOBILE MENU TOGGLE =====
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

mobileMenuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
        navLinks.classList.remove('active');
        mobileMenuToggle.textContent = '☰';
    }
});

// ===== ENHANCED FADE-IN ANIMATIONS ON SCROLL =====
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Add staggered delay for elements in the same section
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
        }
    });
}, observerOptions);

// Observe all elements with fade-in class
document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// ===== PORTFOLIO FILTERING =====
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');

        // Filter portfolio items with smooth transition
        portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');

            if (filter === 'all' || category.includes(filter)) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 10);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
});

// ===== TESTIMONIAL CAROUSEL =====
const testimonials = document.querySelectorAll('.testimonial');
const testimonialDots = document.querySelectorAll('.testimonial-dot');
let currentTestimonial = 1;

function showTestimonial(index) {
    // Hide all testimonials
    testimonials.forEach(testimonial => {
        testimonial.style.display = 'none';
        testimonial.classList.remove('active');
    });

    // Remove active class from all dots
    testimonialDots.forEach(dot => {
        dot.classList.remove('active');
    });

    // Show selected testimonial
    const selectedTestimonial = document.querySelector(`[data-testimonial="${index}"]`);
    const selectedDot = document.querySelector(`.testimonial-dot[data-slide="${index}"]`);

    if (selectedTestimonial && selectedDot) {
        selectedTestimonial.style.display = 'block';
        selectedTestimonial.classList.add('active');
        selectedDot.classList.add('active');
    }
}

// Dot click handlers
testimonialDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide'));
        currentTestimonial = slideIndex;
        showTestimonial(slideIndex);
    });
});

// Auto-rotate testimonials every 8 seconds
setInterval(() => {
    currentTestimonial = currentTestimonial >= testimonials.length ? 1 : currentTestimonial + 1;
    showTestimonial(currentTestimonial);
}, 8000);

// ===== CONTACT FORM VALIDATION =====
const contactForm = document.getElementById('contactForm');
const formSuccessMessage = document.getElementById('formSuccessMessage');

contactForm.addEventListener('submit', (e) => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const budget = document.getElementById('budget').value;
    const message = document.getElementById('message').value.trim();

    // Basic validation
    if (!name || !email || !budget || !message) {
        e.preventDefault();
        alert('Please fill in all required fields.');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        e.preventDefault();
        alert('Please enter a valid email address.');
        return;
    }

    // Copy email to _replyto field for FormSubmit
    document.getElementById('replyToField').value = email;

    // Form will submit naturally to FormSubmit
    // Show loading state on submit button
    const submitBtn = contactForm.querySelector('.form-submit');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Since we're redirecting with _next, we need to handle success differently
    // We'll use localStorage to show success message on return
    localStorage.setItem('formSubmitted', 'true');
});

// Check if form was just submitted (after redirect from FormSubmit)
window.addEventListener('load', () => {
    if (localStorage.getItem('formSubmitted') === 'true') {
        localStorage.removeItem('formSubmitted');

        // Show success message
        contactForm.style.display = 'none';
        formSuccessMessage.style.display = 'block';

        // Trigger confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Confetti from left side
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });

            // Confetti from right side
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        // Reset form after 5 seconds
        setTimeout(() => {
            formSuccessMessage.style.display = 'none';
            contactForm.style.display = 'block';
            contactForm.reset();
            const submitBtn = contactForm.querySelector('.form-submit');
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
        }, 5000);
    }
});

// ===== SMOOTH PAGE ENTRANCE =====
window.addEventListener('load', () => {
    document.body.style.opacity = '1';

    // Add smooth entrance to hero section
    setTimeout(() => {
        const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-cta');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }, 100);
});

// Initialize body styles for smooth entrance
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.visibility = 'visible';
    document.body.style.transition = 'opacity 0.6s ease';
});

// ===== PARALLAX SCROLL EFFECT FOR HERO =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = 1 - (scrolled / window.innerHeight);
    }
});

// ===== CASE STUDY MODAL FUNCTIONALITY =====
const caseStudyModal = document.getElementById('caseStudyModal');
const caseStudyOverlay = document.getElementById('caseStudyOverlay');
const closeModalBtn = document.getElementById('closeModal');

// Case study data - Replace with real data when you have actual case study content
const caseStudiesData = {
    'ecommerce': {
        title: 'E-commerce Redesign',
        tags: ['Web Design', 'UX/UI'],
        heroImage: 'images/ecommerce_redesign.png',
        overview: 'A complete redesign of a fashion e-commerce platform, focusing on improving user experience and conversion rates. We reimagined the entire customer journey from landing page to checkout.',
        challenge: 'The client\'s existing e-commerce site had a high bounce rate and low conversion rate. Users were abandoning their carts, and the site lacked mobile responsiveness. They needed a modern, user-friendly design that would increase sales.',
        solution: 'We conducted comprehensive user research and created a mobile-first design with intuitive navigation, improved product filtering, one-click checkout, and enhanced product imagery. The new design featured a clean aesthetic with strategic CTAs and social proof elements.',
        metrics: [
            { value: '150%', label: 'Increase in Conversions' },
            { value: '65%', label: 'Reduced Bounce Rate' },
            { value: '3.2x', label: 'Mobile Traffic Growth' }
        ]
    },
    'social-media': {
        title: 'Social Media Campaign',
        tags: ['Marketing', 'Social Media'],
        heroImage: 'images/social_media_campaign.png',
        overview: 'A comprehensive social media marketing campaign for a lifestyle brand looking to expand their reach and engagement across Instagram, Facebook, and TikTok.',
        challenge: 'The brand had limited social media presence and struggled to create engaging content that resonated with their target audience. They needed a strategy to build brand awareness and drive traffic to their e-commerce store.',
        solution: 'We developed a content strategy focused on user-generated content, influencer partnerships, and engaging video content. We created a consistent posting schedule, implemented targeted advertising campaigns, and launched interactive stories and reels.',
        metrics: [
            { value: '420%', label: 'Follower Growth' },
            { value: '8.5%', label: 'Engagement Rate' },
            { value: '280%', label: 'Website Traffic Increase' }
        ]
    },
    'hubspot-crm': {
        title: 'HubSpot CRM Setup',
        tags: ['HubSpot', 'CRM'],
        heroImage: 'images/hubspot_crm_setup.png',
        overview: 'Complete HubSpot CRM implementation for a B2B SaaS company, including sales pipeline setup, email marketing automation, and reporting dashboards.',
        challenge: 'The company was using multiple disconnected tools for sales, marketing, and customer service. They needed a unified system to track leads, automate workflows, and gain insights into their sales funnel.',
        solution: 'We implemented HubSpot CRM with custom pipelines, automated email sequences, lead scoring, and comprehensive reporting. We also provided training for the sales and marketing teams to ensure smooth adoption.',
        metrics: [
            { value: '90%', label: 'Time Saved on Admin' },
            { value: '45%', label: 'More Qualified Leads' },
            { value: '200%', label: 'Sales Productivity Boost' }
        ]
    },
    'saas-landing': {
        title: 'SaaS Landing Page',
        tags: ['Web Design', 'Conversion'],
        heroImage: 'images/saas_landing_page.png',
        overview: 'High-converting landing page design for a project management SaaS platform launching a new product tier. The goal was to maximize sign-ups and free trial conversions.',
        challenge: 'The existing landing page had a cluttered layout, unclear value proposition, and poor mobile experience. The conversion rate was below industry standards at just 1.2%.',
        solution: 'We created a clean, conversion-focused design with a clear hero section, benefit-driven copy, social proof elements, interactive product demos, and a streamlined sign-up flow. A/B testing was implemented to continuously optimize performance.',
        metrics: [
            { value: '385%', label: 'Conversion Rate Increase' },
            { value: '52%', label: 'Trial-to-Paid Conversion' },
            { value: '4.8/5', label: 'User Experience Score' }
        ]
    },
    'marketing-automation': {
        title: 'Marketing Automation',
        tags: ['Marketing', 'HubSpot', 'Automation'],
        heroImage: 'images/marketing_automation.png',
        overview: 'Implementation of advanced marketing automation workflows using HubSpot for a healthcare technology company to nurture leads and improve customer retention.',
        challenge: 'The company had a complex, multi-touch sales cycle but was manually managing all email communications. They were losing leads due to delayed follow-ups and lacked personalization in their outreach.',
        solution: 'We designed and implemented sophisticated automation workflows including lead nurturing sequences, behavioral triggers, personalized content delivery, and re-engagement campaigns. We also integrated their CRM data for smarter segmentation.',
        metrics: [
            { value: '310%', label: 'Lead Engagement Increase' },
            { value: '75%', label: 'Marketing Time Saved' },
            { value: '180%', label: 'Email Performance Boost' }
        ]
    },
    'corporate-website': {
        title: 'Corporate Website',
        tags: ['Web Design', 'Branding'],
        heroImage: 'images/corporate_website.png',
        overview: 'Modern corporate website redesign for a professional services firm, focusing on showcasing expertise, building trust, and generating quality leads.',
        challenge: 'The firm\'s website was outdated, didn\'t reflect their premium positioning, and failed to effectively communicate their value proposition. They needed a professional online presence to compete with larger firms.',
        solution: 'We created a sophisticated website with compelling case studies, team profiles, thought leadership content, and clear service offerings. The design incorporated modern animations, professional photography, and strategic calls-to-action throughout.',
        metrics: [
            { value: '220%', label: 'Organic Traffic Growth' },
            { value: '165%', label: 'Lead Generation Increase' },
            { value: '4.2min', label: 'Average Session Duration' }
        ]
    }
};

// Open case study modal
function openCaseStudy(caseStudyId) {
    const caseStudy = caseStudiesData[caseStudyId];

    if (!caseStudy) {
        console.error('Case study not found:', caseStudyId);
        return;
    }

    // Populate modal content
    document.getElementById('caseStudyTitle').textContent = caseStudy.title;

    // Add tags
    const tagsContainer = document.getElementById('caseStudyTags');
    tagsContainer.innerHTML = '';
    caseStudy.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'portfolio-tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });

    // Set hero image
    const heroImageContainer = document.getElementById('caseStudyHeroImage');
    heroImageContainer.innerHTML = `<img src="${caseStudy.heroImage}" alt="${caseStudy.title}" />`;

    // Set text content
    document.getElementById('caseStudyOverview').textContent = caseStudy.overview;
    document.getElementById('caseStudyChallenge').textContent = caseStudy.challenge;
    document.getElementById('caseStudySolution').textContent = caseStudy.solution;

    // Add metrics
    const metricsContainer = document.getElementById('caseStudyMetrics');
    metricsContainer.innerHTML = '';
    caseStudy.metrics.forEach(metric => {
        const metricElement = document.createElement('div');
        metricElement.className = 'case-study-metric';
        metricElement.innerHTML = `
            <div class="case-study-metric-value">${metric.value}</div>
            <div class="case-study-metric-label">${metric.label}</div>
        `;
        metricsContainer.appendChild(metricElement);
    });

    // Show modal
    caseStudyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close case study modal
function closeCaseStudy() {
    caseStudyModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners for closing modal
closeModalBtn.addEventListener('click', closeCaseStudy);
caseStudyOverlay.addEventListener('click', closeCaseStudy);

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseStudyModal.classList.contains('active')) {
        closeCaseStudy();
    }
});

// Add click handlers to all portfolio items
document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('click', () => {
        const caseStudyId = item.getAttribute('data-case-study');
        if (caseStudyId) {
            openCaseStudy(caseStudyId);
        }
    });
});
