document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.getElementById("primary-nav");
  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      const icon = menuButton.querySelector("i");
      if (icon) icon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    });
    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
        const icon = menuButton.querySelector("i");
        if (icon) icon.className = "fa-solid fa-bars";
      });
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
        const icon = menuButton.querySelector("i");
        if (icon) icon.className = "fa-solid fa-bars";
      }
    });
  }

  // Service category filters
  const filterButtons = [...document.querySelectorAll(".filter-tab")];
  const cards = [...document.querySelectorAll(".service-card")];
  const emptyMessage = document.querySelector(".no-results");
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter || "all";
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      let visibleCount = 0;
      cards.forEach(card => {
        const show = selected === "all" || card.dataset.category === selected;
        card.hidden = !show;
        if (show) visibleCount += 1;
      });
      if (emptyMessage) emptyMessage.hidden = visibleCount !== 0;
    });
  });

  // Accessible FAQ accordion; multiple answers may remain open.
  document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      const answer = button.closest(".faq-item")?.querySelector(".faq-answer");
      button.setAttribute("aria-expanded", String(!expanded));
      if (answer) answer.hidden = expanded;
    });
  });
});