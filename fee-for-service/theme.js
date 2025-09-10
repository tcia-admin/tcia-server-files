// TCIA Fee For Service - Interactive behaviors
// Modular JS to support tabs, nav, accordion, ripple, reveal animations, and form handling.

(function () {
    const q = (sel, root = document) => root.querySelector(sel);
    const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // Tab System
    const tabBtns = qa('.tab-btn');
    const tabContents = qa('.tab-content');
    
    function switchTab(targetTab) {
        // Remove active class from all tabs and contents
        tabBtns.forEach(btn => btn.classList.remove('tab-btn--active'));
        tabContents.forEach(content => content.classList.remove('tab-content--active'));
        
        // Add active class to clicked tab
        const activeBtn = q(`[data-tab="${targetTab}"]`);
        const activeContent = q(`#${targetTab}`);
        
        if (activeBtn && activeContent) {
            activeBtn.classList.add('tab-btn--active');
            activeContent.classList.add('tab-content--active');
            
            // Scroll to tabs container if switching from button clicks
            const tabsContainer = q('.tabs-container');
            if (tabsContainer && window.innerWidth <= 768) {
                tabsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
    
    // Handle tab button clicks
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
    
    // Handle CTA button tab switching
    qa('[data-tab]').forEach(btn => {
        if (!btn.classList.contains('tab-btn')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = btn.getAttribute('data-tab');
                switchTab(targetTab);
            });
        }
    });

    // Nav toggle (mobile)
    const nav = q('.nav');
    const toggle = q('.nav__toggle');
    if (nav && toggle) {
        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('is-open') && 
                !nav.contains(e.target)) {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // FAQ Accordion behavior
    qa('.faq-question').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            // Close any other open items within same FAQ container
            const container = trigger.closest('.faq-container');
            if (container) {
                qa('.faq-question[aria-expanded="true"]', container).forEach((openBtn) => {
                    if (openBtn !== trigger) openBtn.setAttribute('aria-expanded', 'false');
                });
            }
            trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
    });

    // Form handling
    const partnershipForm = q('#partnership-form');
    if (partnershipForm) {
        partnershipForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(partnershipForm);
            const data = Object.fromEntries(formData.entries());
            
            // Collect checkbox values
            const supportNeeded = [];
            qa('input[name="supportNeeded"]:checked').forEach(checkbox => {
                supportNeeded.push(checkbox.value);
            });
            data.supportNeeded = supportNeeded;
            
            // Basic validation
            const requiredFields = ['organizationName', 'contactName', 'contactEmail', 'projectStage', 'focusArea', 'projectDescription'];
            const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
            
            if (missingFields.length > 0) {
                alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.contactEmail)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Submit button state
            const submitBtn = partnershipForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                console.log('Form data submitted:', data);
                alert('Thank you for your application! We will be in touch within 2-3 business days.');
                partnershipForm.reset();
                
                // Reset submit button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Switch to overview tab after submission
                switchTab('overview');
            }, 2000);
        });
    }

    // Ripple effect
    qa('[data-ripple]').forEach((el) => {
        el.addEventListener('click', (e) => {
            const rect = el.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const size = Math.max(rect.width, rect.height) * 0.6;
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            el.appendChild(ripple);
            setTimeout(() => ripple.remove(), 650);
        }, { passive: true });
    });

    // Reveal on scroll
    const reveals = qa('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        reveals.forEach((el) => io.observe(el));
    } else {
        // Fallback if IO not supported
        reveals.forEach((el) => el.classList.add('is-visible'));
    }

    // Dynamic year in footer
    const yearEl = q('[data-year]');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Fun easter egg: Konami-like sequence triggers confetti burst
    const eggKeys = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    const buffer = [];
    window.addEventListener('keydown', (e) => {
        buffer.push(e.key);
        if (buffer.length > eggKeys.length) buffer.shift();
        if (eggKeys.every((k, i) => buffer[i] === k)) {
            triggerConfetti();
        }
    });

    function triggerConfetti() {
        const container = q('#confetti');
        if (!container) return;
        const count = 120;
        for (let i = 0; i < count; i++) {
            const piece = document.createElement('i');
            piece.style.position = 'fixed';
            piece.style.left = Math.random() * 100 + 'vw';
            piece.style.top = '-2vh';
            piece.style.width = '8px';
            piece.style.height = '14px';
            piece.style.background = `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`;
            piece.style.opacity = '0.9';
            piece.style.transform = `rotate(${Math.random() * 360}deg)`;
            piece.style.transition = 'transform 1.8s ease-out, top 1.8s ease-out, opacity 2s ease-out';
            container.appendChild(piece);
            // async position update
            requestAnimationFrame(() => {
                piece.style.top = '110vh';
                piece.style.transform = `translateY(100vh) rotate(${360 + Math.random() * 360}deg)`;
                piece.style.opacity = '0';
            });
            setTimeout(() => piece.remove(), 2200);
        }
    }
})();


