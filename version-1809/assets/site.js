document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-slide-dot]"));
    const prev = hero.querySelector("[data-slide-prev]");
    const next = hero.querySelector("[data-slide-next]");
    let active = 0;
    let timer = null;

    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    };

    const play = () => {
      timer = window.setInterval(() => show(active + 1), 5000);
    };

    const reset = () => {
      window.clearInterval(timer);
      play();
    };

    if (slides.length) {
      show(0);
      play();
    }

    if (prev) {
      prev.addEventListener("click", () => {
        show(active - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(active + 1);
        reset();
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.slideDot || 0));
        reset();
      });
    });
  }

  document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
    const input = scope.querySelector("[data-filter-input]");
    const select = scope.querySelector("[data-filter-select]");
    const container = scope.parentElement || document;
    const cards = Array.from(container.querySelectorAll("[data-card]"));
    const noResults = scope.querySelector("[data-no-results]");

    const applyFilter = () => {
      const keyword = (input?.value || "").trim().toLowerCase();
      const selected = (select?.value || "").trim().toLowerCase();
      let visible = 0;

      cards.forEach((card) => {
        const searchText = (card.dataset.search || card.textContent || "").toLowerCase();
        const matchKeyword = !keyword || searchText.includes(keyword);
        const matchSelect = !selected || searchText.includes(selected);
        const matched = matchKeyword && matchSelect;

        card.classList.toggle("is-hidden-card", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle("is-visible", visible === 0);
      }
    };

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (select) {
      select.addEventListener("change", applyFilter);
    }
  });
});
