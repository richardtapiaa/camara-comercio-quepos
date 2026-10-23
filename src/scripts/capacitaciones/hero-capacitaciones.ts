if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll<HTMLVideoElement>("[data-hero-capacitaciones-video]").forEach((video) => {
    video.removeAttribute("autoplay");
    video.pause();
  });
}
