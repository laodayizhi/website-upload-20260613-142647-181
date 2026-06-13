(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

  shells.forEach(function (shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");

    if (!video || !overlay) {
      return;
    }

    var sourceElement = video.querySelector("source");
    var source = sourceElement ? sourceElement.getAttribute("src") : video.getAttribute("src");
    var attached = false;
    var hls = null;

    function attach() {
      if (attached || !source) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.setAttribute("src", source);
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        attached = true;
        return;
      }

      video.setAttribute("src", source);
      attached = true;
    }

    function play() {
      attach();
      overlay.classList.add("is-hidden");
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", play);

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
  });
})();
