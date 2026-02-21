
document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       Mobile Menu Toggle
       ========================================================================== */
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-button');

    function toggleMenu() {
        const isActive = menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = isActive ? 'hidden' : '';
        menuToggle.setAttribute('aria-expanded', isActive);
        mobileMenu.setAttribute('aria-hidden', !isActive);
    }

    menuToggle.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

    /* ==========================================================================
       Navbar — Transparent → Dark Glass on Scroll
       ========================================================================== */
    const navbar = document.getElementById('navbar');

    function handleNavbarScroll() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll(); // run on load

    /* ==========================================================================
       Scroll Reveal — IntersectionObserver
       ========================================================================== */
    const revealEls = document.querySelectorAll('[data-reveal]');

    if (revealEls.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        revealEls.forEach(el => revealObserver.observe(el));
    }

    /* ==========================================================================
       Animated Counters — for About Stats
       ========================================================================== */
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) return;
        const duration = 1600;
        const startTime = performance.now();

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    const statsSection = document.querySelector('.about-stats');
    if (statsSection) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const countEls = entry.target.querySelectorAll('[data-count]');
                    countEls.forEach(animateCounter);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        counterObserver.observe(statsSection);
    }

    /* ==========================================================================
       Group Projects by Title
       ========================================================================== */
    const groupedProjects = {};
    projects.forEach(p => {
        if (!groupedProjects[p.title]) {
            groupedProjects[p.title] = { title: p.title, category: p.category, images: [] };
        }
        groupedProjects[p.title].images.push(p.src);
    });

    const uniqueProjectsInfo = Object.values(groupedProjects);

    /* ==========================================================================
       Portfolio Rendering & Main Slider (Swiper.js)
       ========================================================================== */
    const wrapper = document.getElementById('portfolio-wrapper');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let swiperInstance = null;
    let modalSwiperInstance = null;

    function initMainSwiper() {
        if (swiperInstance) swiperInstance.destroy(true, true);

        swiperInstance = new Swiper('.portfolio-swiper', {
            slidesPerView: 1.15,
            centeredSlides: true,
            spaceBetween: 40,
            loop: true,
            grabCursor: true,
            speed: 600,
            keyboard: { enabled: true, onlyInViewport: true },
            slideToClickedSlide: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true,
            },
            navigation: {
                nextEl: '.portfolio-slider-container .swiper-button-next',
                prevEl: '.portfolio-slider-container .swiper-button-prev',
            },
            on: {
                click: function (swiper, event) {
                    if (swiper.clickedSlide) {
                        const card = swiper.clickedSlide.querySelector('.project-card');
                        if (card && swiper.clickedSlide.classList.contains('swiper-slide-active')) {
                            openModal(card.getAttribute('data-title'));
                        }
                    }
                }
            }
        });
    }

    function initModalSwiper() {
        if (modalSwiperInstance) modalSwiperInstance.destroy(true, true);

        modalSwiperInstance = new Swiper('.modal-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            grabCursor: true,
            keyboard: { enabled: true },
            pagination: { el: '.modal-pagination', clickable: true },
            navigation: { nextEl: '.modal-next', prevEl: '.modal-prev' }
        });
    }

    /* Modal */
    const projectModal  = document.getElementById('project-modal');
    const modalCloseOverlay = document.getElementById('modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalWrapper  = document.getElementById('modal-wrapper');
    const modalTitleEl  = document.getElementById('modal-title');

    function openModal(projectTitle) {
        const projectData = groupedProjects[projectTitle];
        if (!projectData) return;

        modalTitleEl.textContent = projectData.title;
        modalWrapper.innerHTML = '';

        projectData.images.forEach(imgSrc => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide modal-slide';
            slide.innerHTML = `<img src="${imgSrc}" alt="${projectData.title}" class="modal-img">`;
            modalWrapper.appendChild(slide);
        });

        projectModal.classList.add('active');
        projectModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        initModalSwiper();
        setTimeout(() => modalCloseBtn.focus(), 100);
    }

    function closeModal() {
        projectModal.classList.remove('active');
        projectModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (modalSwiperInstance) {
            modalSwiperInstance.destroy(true, true);
            modalSwiperInstance = null;
        }
    }

    modalCloseBtn.addEventListener('click', closeModal);
    modalCloseOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    function renderMainProjects(categoryFilter = 'Todos') {
        wrapper.innerHTML = '';

        let filteredProjects = uniqueProjectsInfo.filter(p =>
            categoryFilter === 'Todos' || p.category === categoryFilter
        );

        filteredProjects.forEach(project => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            const coverImage = project.images[0];

            slide.innerHTML = `
                <div class="project-card single-large-card" data-title="${project.title}" tabindex="0" role="button" aria-label="Abrir detalhes do projeto ${project.title}">
                    <img src="${coverImage}" alt="Capa do projeto ${project.title}" class="project-img main-project-img" loading="lazy">
                    <div class="project-overlay">
                        <span class="project-category">${project.category}</span>
                        <h3 class="project-title">${project.title}</h3>
                        <span class="project-view-btn" aria-hidden="true">Ver Projeto</span>
                    </div>
                </div>
            `;
            wrapper.appendChild(slide);
        });

        wrapper.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter') openModal(card.getAttribute('data-title'));
            });
        });

        initMainSwiper();
        if (swiperInstance) swiperInstance.slideTo(0, 0);
    }

    renderMainProjects();

    filterBtns.forEach(btn => {
        btn.addEventListener('click', e => {
            filterBtns.forEach(b => b.classList.remove('active'));
            const targetBtn = e.target;
            targetBtn.classList.add('active');
            renderMainProjects(targetBtn.getAttribute('data-filter'));
        });
    });

    /* ==========================================================================
       Smooth Scrolling for Anchor Links
       ========================================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const offsetTop = targetEl.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });
});
