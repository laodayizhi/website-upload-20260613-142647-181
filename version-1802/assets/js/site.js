(function () {
    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = select('[data-menu-toggle]');
        var menu = select('[data-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = select('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var previous = select('[data-hero-prev]', hero);
        var next = select('[data-hero-next]', hero);
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                var active = current === index;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        var panel = select('.filter-panel');
        if (!panel) {
            return;
        }
        var input = select('[data-filter-input]', panel);
        var region = select('[data-filter-region]', panel);
        var year = select('[data-filter-year]', panel);
        var category = select('[data-filter-category]', panel);
        var cards = selectAll('[data-card]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input) {
            input.value = query;
        }

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function apply() {
            var q = valueOf(input);
            var selectedRegion = valueOf(region);
            var selectedYear = valueOf(year);
            var selectedCategory = valueOf(category);
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
                var matched = true;
                if (q && text.indexOf(q) === -1) {
                    matched = false;
                }
                if (selectedRegion && cardRegion !== selectedRegion) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }
                if (selectedCategory && cardCategory !== selectedCategory) {
                    matched = false;
                }
                card.hidden = !matched;
            });
        }

        [input, region, year, category].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
