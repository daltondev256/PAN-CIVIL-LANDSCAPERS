document.addEventListener('DOMContentLoaded', () => {

    // 1. Structural Calendar Copyright Year Automations
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 2. Interactive Service Category Filtering System
    const filterTabs = document.querySelectorAll('.filter-tab');
    const serviceCards = document.querySelectorAll('.service-card');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update Active Tab State
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const selectedCategory = tab.getAttribute('data-category');

            // Render filtration opacity animations
            serviceCards.forEach(card => {
                const cardType = card.getAttribute('data-type');
                if (selectedCategory === 'all' || cardType === selectedCategory) {
                    card.style.display = 'flex';
                    card.style.animation = 'none'; // reset animation trigger
                    setTimeout(() => card.style.animation = 'fadeInUp 0.4s forwards', 10);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 3. FAQ Accordion Expanding Actions
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('active');
        });
    });

    // 4. Modal Database & Controller Interactions
    const modalData = {
        'lawn-modal': {
            title: 'Commercial Lawn Maintenance',
            content: '<p>Our premier package designed for corporate campuses, institutional grounds, and expansive residential estates. Includes:</p><ul><li>Bi-weekly structural cutting runs using precision heavy industrial mowing engines.</li><li>Biological edge profiling for neat boundary definitions.</li><li>Comprehensive lawn core aeration & root system nutrient restoration feeding programs.</li></ul>'
        },
        'hardscape-modal': {
            title: 'Custom Hardscape Construction',
            content: '<p>Blending earthwork with structural layout elements. Features:</p><ul><li>Bespoke structural stone paving work matching your architecture footprint layout.</li><li>Engineered protective dry-stack retaining boundary masonry walls.</li><li>Elegant running water recycling garden fountain installations.</li></ul>'
        },
        'planting-modal': {
            title: 'Vibrant Seasonal Plantings',
            content: '<p>Expert horticultural installations providing vibrant year-round biological aesthetic textures:</p><ul><li>Detailed soil pH testing and customized localized organic structural compost balancing.</li><li>Handpicked flower selection schemes featuring exotic high-bloom plant breeds.</li><li>Complete integrated premium surface mulch distribution layers.</li></ul>'
        },
        'overhaul-modal': {
            title: 'Full Compound Overhaul',
            content: '<p>The definitive total site transformation workflow designed to radically change low-utility land space:</p><ul><li>Complete architectural excavation, slope re-profiling, and sub-surface drainage track arrays.</li><li>Premium deep-root continuous sod turf installation layers.</li><li>Integrated structural smart low-voltage perimeter architectural illumination packages.</li></ul>'
        }
    };

    const modalOverlay = document.getElementById('service-detail-modal');
    const modalInnerContent = document.getElementById('modal-dynamic-content');
    const closeBtn = document.querySelector('.close-modal-btn');
    const detailButtons = document.querySelectorAll('.learn-more-btn');

    detailButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const dataKey = btn.getAttribute('data-modal');
            const data = modalData[dataKey];

            if (data) {
                modalInnerContent.innerHTML = `
                    <h2 style="color:#1b3a1b; margin-bottom:15px; font-weight:600;">${data.title}</h2>
                    <div style="font-size:0.9rem; color:#555; line-height:1.7;">${data.content}</div>
                    <a href="contact.html" style="display:inline-block; margin-top:25px; padding:10px 20px; background-color:#1b3a1b; color:#fff; text-decoration:none; border-radius:6px; font-size:0.85rem; font-weight:500;">Book Consultation</a>
                `;
                modalOverlay.classList.add('active');
            }
        });
    });

    closeBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });
});
