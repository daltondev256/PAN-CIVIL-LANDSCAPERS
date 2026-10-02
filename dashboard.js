document.addEventListener("DOMContentLoaded", () => {
    initDynamicDate();
    initSidebarNavigation();
});

/**
 * Handles generating and writing current calendar parameters inside UI views.
 */
function initDynamicDate() {
    const currentYearEl = document.getElementById("current-year");
    const dashboardDateEl = document.getElementById("dashboard-date");
    const now = new Date();
    
    // Automatically set accurate footer copyright metadata 
    if (currentYearEl) {
        currentYearEl.textContent = now.getFullYear();
    }

    // Format current month string values for layout headers
    if (dashboardDateEl) {
        const options = { month: 'long', year: 'numeric' };
        dashboardDateEl.textContent = now.toLocaleDateString('en-US', options);
    }
}

/**
 * Manages click behavior and state updates across control elements.
 */
function initSidebarNavigation() {
    const menuItems = document.querySelectorAll(".sidebar-menu li");

    menuItems.forEach(item => {
        item.addEventListener("click", function() {
            // Remove active classes across array items
            menuItems.forEach(i => i.classList.remove("active"));
            
            // Reapply styling indicators on selected target elements
            this.classList.add("active");
            
            // Future expansion: Trigger asynchronous item filtering using dataset views
            const targetSection = this.getAttribute("data-target");
            console.log(`Navigating view section focus to: ${targetSection}`);
        });
    });
}
