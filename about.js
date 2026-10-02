/**
 * PANCIVIL LANDSCAPERS - About Us Interactive Engine
 * Handles modern UI interactions, numeric metrics animations, and viewport entry states.
 */

document.addEventListener("DOMContentLoaded", () => {
    initDynamicYear();
    initScrollAnimations();
    initMetricCounters();
});

/**
 * Automatically sets the correct current calendar year parameters inside footer layout text slots.
 */
function initDynamicYear() {
    const currentYearEl = document.getElementById("current-year");
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
}

/**
 * Monitors element transitions onto the active viewport using high-performance intersection intersection patterns.
 */
function initScrollAnimations() {
    const animationTargets = document.querySelectorAll('.modern-pillar-card, .split-card');
    
    const observerOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: "0px"
    };

    const intersectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Apply a styling variable or direct class layer to trigger CSS transitions smoothly
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animationTargets.forEach(target => {
        // Enforce baseline preparation states programmatically before observer sequences kick in
        target.style.opacity = "0";
        target.style.transform = "translateY(20px)";
        target.style.transition = "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
        intersectionObserver.observe(target);
    });
}

/**
 * Triggers counting animations from base values up to target figures when elements cross view boundaries.
 */
function initMetricCounters() {
    const counterElements = document.querySelectorAll('.counter');
    
    const counterObserverOptions = {
        root: null,
        threshold: 0.5
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetElement = entry.target;
                const rawTargetValue = targetElement.textContent;
                const finalNumericValue = parseInt(rawTargetValue, 10);
                
                // Track formatting suffix icons (like '+' or '%') to append them cleanly post-animation
                const structuralSuffix = rawTargetValue.replace(/[0-9]/g, '');
                
                animateCount(targetElement, finalNumericValue, structuralSuffix);
                observer.unobserve(targetElement);
            }
        });
    }, counterObserverOptions);

    counterElements.forEach(counter => counterObserver.observe(counter));
}

/**
 * Smooth fluid mathematical animation tick loop logic utilizing browser core frame patterns.
 */
function animateCount(element, maxLimit, suffixSign) {
    let currentIterationValue = 0;
    const totalAnimationDuration = 1500; // Time in milliseconds
    const trackingStartTime = performance.now();

    function executionFrameStep(currentTimeStamp) {
        const structuralElapsedTime = currentTimeStamp - trackingStartTime;
        const animationProgressRatio = Math.min(structuralElapsedTime / totalAnimationDuration, 1);
        
        // Apply an intentional deceleration ease curve logic for smooth premium feeling endings
        const easeOutQuadProgress = animationProgressRatio * (2 - animationProgressRatio);
        currentIterationValue = Math.floor(easeOutQuadProgress * maxLimit);
        
        element.textContent = currentIterationValue + suffixSign;

        if (animationProgressRatio < 1) {
            requestAnimationFrame(executionFrameStep);
        } else {
            element.textContent = maxLimit + suffixSign;
        }
    }

    requestAnimationFrame(executionFrameStep);
}
