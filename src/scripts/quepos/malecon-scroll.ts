const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const formato = new Promise<"avif" | "webp">((listo) => {
  const prueba = new Image();
  prueba.onload = () => listo("avif");
  prueba.onerror = () => listo("webp");
  prueba.src =
    "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAAD5bWV0YQAAAAAAAAAvaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAFBpY3R1cmVIYW5kbGVyAAAAAA5waXRtAAAAAAABAAAAHmlsb2MAAAAARAAAAQABAAAAAQAAASEAAAATAAAAKGlpbmYAAAAAAAEAAAAaaW5mZQIAAAAAAQAAYXYwMUNvbG9yAAAAAGppcHJwAAAAS2lwY28AAAAUaXNwZQAAAAAAAAACAAAAAgAAABBwaXhpAAAAAAMICAgAAAAMYXYxQ4EADAAAAAATY29scm5jbHgAAgACAAIAAAAAF2lwbWEAAAAAAAAAAQABBAECgwQAAAAbbWRhdAoFGAA2wCAyCh/wAABYAABABMA=";
});

document.querySelectorAll<HTMLElement>("[data-malecon-scroll]").forEach((seccion) => {
  const lienzo = seccion.querySelector<HTMLCanvasElement>("[data-malecon-lienzo]")!;
  const ctx = lienzo.getContext("2d")!;
  const primero = Number(seccion.dataset.primero);
  const ultimo = Number(seccion.dataset.ultimo);
  const total = ultimo - primero + 1;
  const carpeta = seccion.dataset.carpeta! + (innerWidth < 768 ? "-mobile" : "");
  const ruta = (n: number, extension: string) => `${carpeta}/frame_${String(n).padStart(3, "0")}.${extension}`;
  const archivos: (Blob | null)[] = Array(total).fill(null);
  const decodificados = new Map<number, ImageBitmap>();
  const enCamino = new Set<number>();
  const RADIO = 5;
  let actual = 0;
  let dibujado = -1;
  let fuente: { ancho: number; alto: number } | null = null;
  let pantalla = window.innerHeight;

  const dibujar = (i: number) => {
    let elegido = -1;
    for (let d = 0; d < total && elegido < 0; d++) {
      if (decodificados.has(i - d)) elegido = i - d;
      else if (decodificados.has(i + d)) elegido = i + d;
    }
    if (elegido < 0 || elegido === dibujado) return;
    dibujado = elegido;
    const img = decodificados.get(elegido)!;
    const escala = Math.max(lienzo.width / img.width, lienzo.height / img.height);
    const ancho = img.width * escala;
    const alto = img.height * escala;
    ctx.drawImage(img, (lienzo.width - ancho) / 2, (lienzo.height - alto) / 2, ancho, alto);
  };

  const decodificar = (i: number) => {
    enCamino.add(i);
    createImageBitmap(archivos[i]!)
      .then((img) => {
        if (Math.abs(i - actual) > RADIO * 2 && decodificados.size) return img.close();
        decodificados.set(i, img);
        if (!fuente) {
          fuente = { ancho: img.width, alto: img.height };
          medir();
        }
        if (dibujado < 0 || Math.abs(i - actual) < Math.abs(dibujado - actual)) dibujar(actual);
      })
      .catch(() => {})
      .finally(() => enCamino.delete(i));
  };

  const preparar = () => {
    for (const [i, img] of decodificados) {
      if (Math.abs(i - actual) > RADIO * 2 && i !== dibujado) {
        img.close();
        decodificados.delete(i);
      }
    }
    for (let d = 0; d <= RADIO; d++) {
      for (const i of d ? [actual + d, actual - d] : [actual]) {
        if (archivos[i] && !decodificados.has(i) && !enCamino.has(i)) decodificar(i);
      }
    }
    if (decodificados.size || enCamino.size) return;
    for (let d = 0; d < total; d++) {
      const i = archivos[actual - d] ? actual - d : archivos[actual + d] ? actual + d : -1;
      if (i >= 0) return decodificar(i);
    }
  };

  const medir = () => {
    const ancho = lienzo.clientWidth;
    const alto = lienzo.clientHeight;
    pantalla = alto || window.innerHeight;
    let densidad = Math.min(window.devicePixelRatio || 1, 2);
    if (fuente) densidad = Math.min(densidad, 1 / Math.max(ancho / fuente.ancho, alto / fuente.alto));
    lienzo.width = Math.round(ancho * densidad);
    lienzo.height = Math.round(alto * densidad);
    dibujado = -1;
    dibujar(actual);
  };

  const cargar = (i: number) =>
    formato
      .then((extension) => fetch(ruta(primero + i, extension)))
      .then((respuesta) => (respuesta.ok ? respuesta.blob() : null))
      .then((archivo) => {
        archivos[i] = archivo;
        if (Math.abs(i - actual) <= RADIO || !decodificados.size) preparar();
      })
      .catch(() => {});

  const cargarTodos = async () => {
    const orden: number[] = [];
    const vistos = new Set<number>();
    for (const paso of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < total; i += paso) if (!vistos.has(i)) vistos.add(i), orden.push(i);
    }
    if (!vistos.has(total - 1)) orden.push(total - 1);
    const SIMULTANEOS = 6;
    let siguiente = 0;
    await Promise.all(
      Array.from({ length: SIMULTANEOS }, async () => {
        while (siguiente < orden.length) await cargar(orden[siguiente++]);
      }),
    );
  };

  new ResizeObserver(medir).observe(lienzo);

  if (sinMovimiento) {
    cargar(0);
    return;
  }

  const lateral = "entradaLateral" in seccion.dataset ? lienzo.parentElement : null;
  const empujada = seccion.dataset.entradaEmpuja
    ? document.querySelector(seccion.dataset.entradaEmpuja)?.querySelector<HTMLElement>("[data-malecon-lienzo]")?.parentElement
    : null;
  let cuadro = 0;
  const alDesplazar = () => {
    cuadro = 0;
    const rect = seccion.getBoundingClientRect();
    const entrada = lateral ? pantalla * (Number(seccion.dataset.entradaLateral) || 1) : 0;
    const recorrido = rect.height - pantalla - entrada;
    const progreso = recorrido > 0 ? Math.min(1, Math.max(0, (-rect.top - entrada) / recorrido)) : 0;
    actual = Math.round(progreso * (total - 1));
    dibujar(actual);
    preparar();
    if (lateral) {
      const e = Math.min(1, Math.max(0, -rect.top / entrada));
      const holgura = Number(seccion.dataset.entradaHolgura) || 0;
      lateral.style.transform = `translateX(${(1 - e) * (1 + holgura) * 100}%)`;
      lateral.style.borderRadius = `${40 * (1 - e)}px 0 0 ${40 * (1 - e)}px`;
      if (empujada) {
        const tapado = Math.min(1, Math.max(0, 1 - (1 - e) * (1 + holgura)));
        empujada.style.transform = `translateX(${-30 * tapado}%)`;
      }
    }
  };
  window.addEventListener("scroll", () => (cuadro ||= requestAnimationFrame(alDesplazar)), { passive: true });

  const observador = new IntersectionObserver(
    ([entrada]) => {
      if (!entrada.isIntersecting) return;
      observador.disconnect();
      cargarTodos();
    },
    { rootMargin: "150% 0px" },
  );
  observador.observe(seccion);
  alDesplazar();
});
