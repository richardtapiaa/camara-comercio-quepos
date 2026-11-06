const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const diferidos = document.querySelectorAll<HTMLVideoElement>("video[data-video-diferido]");
const iniciarDiferidos = () => {
  if (sinMovimiento) return;
  diferidos.forEach((video) => {
    video.preload = "auto";
    video.autoplay = true;
    video.play().catch(() => {});
  });
};
if (diferidos.length) {
  if (document.readyState === "complete") iniciarDiferidos();
  else window.addEventListener("load", iniciarDiferidos, { once: true });
}

document.querySelectorAll<HTMLVideoElement>("video[autoplay], video[data-video-diferido]").forEach((video) => {
  const fuentesWebm = video.querySelectorAll<HTMLSourceElement>('source[type^="video/webm"]');

  const usarMp4 = () => {
    if (!video.querySelector('source[type^="video/webm"]')) return;
    fuentesWebm.forEach((fuente) => fuente.remove());
    video.load();
    if (video.autoplay) video.play().catch(() => {});
  };
  video.addEventListener("error", usarMp4, true);

  if (sinMovimiento) return;
  const reintentar = () => {
    if (video.autoplay && video.paused) video.play().catch(() => {});
  };
  document.addEventListener("touchstart", reintentar, { once: true, passive: true });
  document.addEventListener("click", reintentar, { once: true });
});
