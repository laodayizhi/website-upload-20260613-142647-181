(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function getRoot() {
        return document.body.getAttribute('data-root') || './';
    }

    function hideBrokenImages() {
        qsa('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('missing-cover');
            });
        });
    }

    function initMobileNavigation() {
        var toggle = qs('[data-nav-toggle]');
        if (!toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function initLocalFilter() {
        var input = qs('[data-local-filter]');
        var list = qs('[data-filter-list]');
        if (!input || !list) {
            return;
        }
        var cards = qsa('[data-card]', list);
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
            });
        });
    }

    function createMovieCard(movie, root) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<a class="movie-card" href="' + root + 'movies/' + movie.filename + '">',
            '    <span class="poster-wrap">',
            '        <img src="' + root + movie.cover_no + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
            '    </span>',
            '    <span class="card-content">',
            '        <strong>' + escapeHtml(movie.title) + '</strong>',
            '        <small>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.category_name) + '</small>',
            '        <span class="card-line">' + escapeHtml(movie.one_line) + '</span>',
            '        <span class="tag-row">' + tags + '</span>',
            '    </span>',
            '</a>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var page = qs('[data-search-page]');
        if (!page || !window.MOVIES) {
            return;
        }
        var root = getRoot();
        var form = qs('[data-search-form]', page);
        var input = qs('[data-search-input]', page);
        var category = qs('[data-category-select]', page);
        var sort = qs('[data-sort-select]', page);
        var results = qs('[data-search-results]', page);
        var title = qs('[data-result-title]', page);
        var count = qs('[data-result-count]', page);
        var params = new URLSearchParams(window.location.search);
        input.value = params.get('q') || '';

        function render() {
            var query = input.value.trim().toLowerCase();
            var selectedCategory = category.value;
            var list = window.MOVIES.filter(function (movie) {
                var text = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category_name,
                    movie.one_line,
                    (movie.tags || []).join(' ')
                ].join(' ').toLowerCase();
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchCategory = selectedCategory === '全部' || movie.category_name === selectedCategory;
                return matchQuery && matchCategory;
            });

            list.sort(function (a, b) {
                if (sort.value === 'year') {
                    return String(b.year).localeCompare(String(a.year), 'zh-CN') || b.hotness - a.hotness;
                }
                if (sort.value === 'title') {
                    return String(a.title).localeCompare(String(b.title), 'zh-CN');
                }
                return b.hotness - a.hotness;
            });

            var shown = list.slice(0, 240);
            results.innerHTML = shown.map(function (movie) {
                return createMovieCard(movie, root);
            }).join('');
            hideBrokenImages();
            title.textContent = query ? '“' + input.value.trim() + '” 的搜索结果' : '全部影片';
            count.textContent = '共找到 ' + list.length + ' 部影片，当前显示前 ' + shown.length + ' 部。';
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var params = new URLSearchParams();
            if (input.value.trim()) {
                params.set('q', input.value.trim());
            }
            var nextUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
            window.history.replaceState(null, '', nextUrl);
            render();
        });
        input.addEventListener('input', render);
        category.addEventListener('change', render);
        sort.addEventListener('change', render);
        render();
    }

    function initPlayer() {
        var video = qs('[data-hls]');
        if (!video) {
            return;
        }
        var root = getRoot();
        var hlsSource = video.getAttribute('data-src');
        var mp4Source = video.getAttribute('data-mp4');
        var start = qs('[data-player-start]');
        var shell = video.closest('.player-shell');

        function useMp4() {
            if (mp4Source) {
                video.src = mp4Source;
            }
        }

        function useNativeHls() {
            video.src = hlsSource;
        }

        function useHlsLibrary() {
            import(root + 'assets/hls-vendor-dru42stk.js')
                .then(function (module) {
                    var Hls = module.H;
                    if (Hls && Hls.isSupported()) {
                        var hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: false
                        });
                        hls.loadSource(hlsSource);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                hls.destroy();
                                useMp4();
                            }
                        });
                    } else {
                        useMp4();
                    }
                })
                .catch(function () {
                    useMp4();
                });
        }

        if (window.location.protocol === 'file:') {
            useMp4();
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            useNativeHls();
        } else {
            useHlsLibrary();
        }

        if (start) {
            start.addEventListener('click', function () {
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
                if (shell) {
                    shell.classList.add('is-playing');
                }
            });
        }

        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('is-playing');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        hideBrokenImages();
        initMobileNavigation();
        initHero();
        initLocalFilter();
        initSearchPage();
        initPlayer();
    });
})();
