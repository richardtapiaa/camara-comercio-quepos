const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const conexion = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
const ahorrarDatos = conexion?.saveData === true || /2g$/.test(conexion?.effectiveType ?? "");

const prefiereMp4 = navigator.vendor.startsWith("Apple");

const diferidos = Array.from(document.querySelectorAll<HTMLVideoElement>("video[data-video-diferido]"));
const enPantalla = new WeakSet<HTMLVideoElement>();
let diferidosIniciados = false;

const puedeReproducirse = (video: HTMLVideoElement) => !video.hasAttribute("data-video-diferido") || enPantalla.has(video);
const reproducir = (video: HTMLVideoElement) => {
  if (puedeReproducirse(video)) video.play().catch(() => {});
};

if (prefiereMp4) {
  diferidos.forEach((video) => {
    const webm = video.querySelectorAll('source[type^="video/webm"]');
    if (!webm.length) return;
    webm.forEach((fuente) => fuente.remove());
    video.load();
  });
}

const visibilidad = new IntersectionObserver((entradas) => {
  for (const { target, isIntersecting } of entradas) {
    const video = target as HTMLVideoElement;
    if (isIntersecting) enPantalla.add(video);
    else enPantalla.delete(video);
    if (!diferidosIniciados) continue;
    if (isIntersecting) reproducir(video);
    else video.pause();
  }
});
diferidos.forEach((video) => visibilidad.observe(video));

const iniciarDiferidos = () => {
  if (sinMovimiento || ahorrarDatos) return;
  diferidosIniciados = true;
  diferidos.forEach((video) => {
    video.preload = "auto";
    video.autoplay = true;
    if (enPantalla.has(video)) reproducir(video);
    else video.pause();
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
    if (video.autoplay) reproducir(video);
  };
  video.addEventListener("error", usarMp4, true);

  if (sinMovimiento) return;
  const reintentar = () => {
    if (video.autoplay && video.paused) reproducir(video);
  };
  document.addEventListener("touchstart", reintentar, { once: true, passive: true });
  document.addEventListener("click", reintentar, { once: true });
});
