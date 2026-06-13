import { H as Hls } from "./hls-vendor.js";

document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector("#video-player[data-stream]");
  const overlay = document.querySelector(".player-overlay");
  const triggers = Array.from(document.querySelectorAll("[data-player-trigger]"));

  if (!video) {
    return;
  }

  const stream = video.dataset.stream;
  let prepared = false;
  let hls = null;

  const prepare = () => {
    if (prepared || !stream) {
      return;
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  };

  const play = () => {
    prepare();
    const action = video.play();

    if (action && typeof action.catch === "function") {
      action.catch(() => {});
    }
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", play);
  });

  video.addEventListener("click", () => {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", () => {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", () => {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
    }
  });
});
