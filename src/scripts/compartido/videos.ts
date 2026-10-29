// Videos de fondo:
// - Los de los heroes (data-video-diferido) muestran su primer cuadro (como póster o como imagen debajo del video) y
//   empiezan a descargarse cuando la página terminó de cargar, para no competir con lo que se ve primero (en 4G lento,
//   3 MB de video retrasaban toda la página). Con "reducir movimiento" se quedan en ese cuadro.
// - Si Safari elige el .webm (AV1) y no lo puede reproducir, se quita el .webm y se vuelve a cargar con el .mp4
// - En modo de bajo consumo iOS bloquea la reproducción automática; se intenta de nuevo con el primer toque
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
  // Los errores de <source> no burbujean, por eso se escucha en captura
  video.addEventListener("error", usarMp4, true);

  if (sinMovimiento) return;
  const reintentar = () => {
    if (video.autoplay && video.paused) video.play().catch(() => {});
  };
  document.addEventListener("touchstart", reintentar, { once: true, passive: true });
  document.addEventListener("click", reintentar, { once: true });
});
