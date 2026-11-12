document.addEventListener('DOMContentLoaded', () => {

    // 1. Automatically update copyright system year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Mobile Responsive Hamburg Navigation Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');

            // Switch icon look depending on menu state
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
    }

    // 3. Dynamic header contraction adjustment on page scroll
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 4. Scroll Reveal Intersections (Fade-in features)
    const fadeElements = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    fadeElements.forEach(element => {
        appearOnScroll.observe(element);
    });
});
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("current-year").textContent = new Date().getFullYear();
});
// This gets the width and height of the screen right now
let width = window.innerWidth;
let height = window.innerHeight;

console.log("Width is: " + width + "px");
console.log("Height is: " + height + "px");

// This watches the screen and tells you if the user resizes the window
window.addEventListener('resize', function() {
  console.log("New width: " + window.innerWidth);
});
