// Respaldo para los videos de fondo en iPhone:
// - Si Safari elige el .webm (AV1) y no lo puede reproducir, se quita el .webm y se vuelve a cargar con el .mp4
// - En modo de bajo consumo iOS bloquea la reproducción automática; se intenta de nuevo con el primer toque
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll<HTMLVideoElement>("video[autoplay], video[data-video-quepos]").forEach((video) => {
  const fuentesWebm = video.querySelectorAll<HTMLSourceElement>('source[type^="video/webm"]');

  const usarMp4 = () => {
    if (!video.querySelector('source[type^="video/webm"]')) return;
    fuentesWebm.forEach((fuente) => fuente.remove());
    video.load();
    if (video.autoplay) video.play().catch(() => {});
  };
  // Los errores de <source> no burbujean, por eso se escucha en captura
  video.addEventListener("error", usarMp4, true);

  if (!video.autoplay || sinMovimiento) return;
  const reintentar = () => {
    if (video.paused) video.play().catch(() => {});
  };
  document.addEventListener("touchstart", reintentar, { once: true, passive: true });
  document.addEventListener("click", reintentar, { once: true });
});
