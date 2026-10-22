// Con "reducir movimiento" el video se queda quieto en su primer cuadro (se ve el poster)
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll<HTMLVideoElement>("[data-hero-afiliados-video]").forEach((video) => {
    video.removeAttribute("autoplay");
    video.pause();
  });
}
