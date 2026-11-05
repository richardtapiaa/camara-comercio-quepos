const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Los cuadros están en AVIF (pesan ~4 veces menos) y en WebP para los navegadores que no leen AVIF (Safari antes de 16.4).
// Se prueba con un AVIF de 2×2 píxeles. Los cuadros se generan con herramientas/cuadros-malecon.sh
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
  // En móvil, cuadros más livianos de la carpeta "-mobile"
  const carpeta = seccion.dataset.carpeta! + (innerWidth < 768 ? "-mobile" : "");
  const ruta = (n: number, extension: string) => `${carpeta}/frame_${String(n).padStart(3, "0")}.${extension}`;
  // Los cuadros se guardan comprimidos y solo se decodifican (fuera del hilo principal, con createImageBitmap) los
  // cercanos al actual. Si se dibujara directo la imagen, el navegador la decodificaría en ese momento y en escritorio
  // eso tarda 40-60 ms por cuadro: es lo que hacía que el scroll se pegara.
  const archivos: (Blob | null)[] = Array(total).fill(null);
  const decodificados = new Map<number, ImageBitmap>();
  const enCamino = new Set<number>();
  const RADIO = 5;
  let actual = 0;
  let dibujado = -1;
  let fuente: { ancho: number; alto: number } | null = null;
  let pantalla = window.innerHeight;

  // Dibuja el cuadro cubriendo el lienzo (como object-fit: cover)
  const dibujar = (i: number) => {
    // Si ese cuadro todavía no está decodificado, usa el decodificado más cercano
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
        // Ya no hace falta si el scroll se fue lejos (salvo que sea lo único que hay para mostrar)
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

  // Decodifica los cuadros alrededor del actual y libera los que quedaron lejos (cada uno ocupa ~5 MB en escritorio)
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
    // Si todavía no llegó ningún cuadro cercano, mostrar el descargado más próximo para no dejar el lienzo vacío
    if (decodificados.size || enCamino.size) return;
    for (let d = 0; d < total; d++) {
      const i = archivos[actual - d] ? actual - d : archivos[actual + d] ? actual + d : -1;
      if (i >= 0) return decodificar(i);
    }
  };

  // El lienzo solo tiene los píxeles que el video aporta: si la pantalla tiene más (celulares con densidad 2 o 3),
  // el navegador lo estira con CSS. Así se ve igual de nítido y cada cuadro mueve 2-3 veces menos píxeles.
  const medir = () => {
    const ancho = lienzo.clientWidth;
    const alto = lienzo.clientHeight;
    // El lienzo mide 100lvh: la altura de pantalla sin que cambie cuando se esconde la barra del navegador
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

  // Primero un cuadro de cada 16, luego cada 8, 4, 2 y 1: se ve algo enseguida y se va afinando
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
    // Sin animación: solo el primer cuadro
    cargar(0);
    return;
  }

  // Avance según cuánto se ha bajado dentro de la sección
  const lateral = "entradaLateral" in seccion.dataset ? lienzo.parentElement : null;
  // data-entrada-empuja: la sección de abajo, que se corre hasta un 30 % a la izquierda mientras esta la va tapando
  const empujada = seccion.dataset.entradaEmpuja
    ? document.querySelector(seccion.dataset.entradaEmpuja)?.querySelector<HTMLElement>("[data-malecon-lienzo]")?.parentElement
    : null;
  let cuadro = 0;
  const alDesplazar = () => {
    cuadro = 0;
    const rect = seccion.getBoundingClientRect();
    // Con data-entrada-lateral="n", las primeras n pantallas de scroll son para entrar desde la derecha y luego avanza el video
    const entrada = lateral ? pantalla * (Number(seccion.dataset.entradaLateral) || 1) : 0;
    const recorrido = rect.height - pantalla - entrada;
    const progreso = recorrido > 0 ? Math.min(1, Math.max(0, (-rect.top - entrada) / recorrido)) : 0;
    actual = Math.round(progreso * (total - 1));
    dibujar(actual);
    preparar();
    if (lateral) {
      const e = Math.min(1, Math.max(0, -rect.top / entrada));
      // data-entrada-holgura: cuánto más a la derecha arranca, en fracción del ancho (para que antes entre la lapa)
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

  // Empieza a cargar cuando la sección está a una pantalla y media de distancia
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
