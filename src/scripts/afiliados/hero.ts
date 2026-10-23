if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll<HTMLVideoElement>("[data-hero-afiliados-video]").forEach((video) => {
    video.removeAttribute("autoplay");
    video.pause();
  });
}
