const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll<HTMLVideoElement>("[data-video-quepos]").forEach((video) => {
  if (sinMovimiento) return;
  new IntersectionObserver(
    ([entrada]) => {
      if (entrada.isIntersecting) video.play().catch(() => {});
      else video.pause();
    },
    { rootMargin: "200px" },
  ).observe(video);
});

document.querySelectorAll<HTMLElement>("[data-video-quepos-datos]").forEach((caja) => {
  const datos = [...caja.querySelectorAll<HTMLElement>(".video-quepos-dato")];
  const puntos = [...caja.querySelectorAll<HTMLButtonElement>(".video-quepos-punto")];
  let actual = 0;
  let espera: number | undefined;

  const mostrar = (i: number) => {
    actual = i;
    datos.forEach((dato, k) => {
      dato.classList.toggle("es-activo", k === i);
      dato.setAttribute("aria-hidden", String(k !== i));
    });
    puntos.forEach((punto, k) => {
      punto.classList.toggle("es-activo", k === i);
      punto.setAttribute("aria-current", String(k === i));
    });
  };
  const programar = () => {
    window.clearInterval(espera);
    if (!sinMovimiento) espera = window.setInterval(() => mostrar((actual + 1) % datos.length), 6000);
  };

  puntos.forEach((punto, i) =>
    punto.addEventListener("click", () => {
      mostrar(i);
      programar();
    }),
  );
  programar();
});
