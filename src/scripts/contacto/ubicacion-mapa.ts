const URL_IMAGEN = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile";

document.querySelectorAll<HTMLElement>("[data-mapa-estatico]").forEach((mapa) => {
  const capas = mapa.querySelector<HTMLElement>("[data-mapa-capas]");
  if (!capas) return;
  const lat = Number(mapa.dataset.lat);
  const lng = Number(mapa.dataset.lng);
  const zoomBase = Number(mapa.dataset.zoom);

  const dibujar = () => {
    const nitido = window.devicePixelRatio > 1;
    const zoom = zoomBase + (nitido ? 1 : 0);
    const lado = nitido ? 128 : 256;
    const mundo = 2 ** zoom;
    const radLat = (lat * Math.PI) / 180;
    const cx = ((lng + 180) / 360) * mundo;
    const cy = ((1 - Math.log(Math.tan(radLat) + 1 / Math.cos(radLat)) / Math.PI) / 2) * mundo;
    const { width, height } = mapa.getBoundingClientRect();
    const izquierda = cx * lado - width / 2;
    const arriba = cy * lado - height / 2;

    const fragmento = document.createDocumentFragment();
    for (let ty = Math.floor(arriba / lado); ty * lado < arriba + height; ty++) {
      for (let tx = Math.floor(izquierda / lado); tx * lado < izquierda + width; tx++) {
        const img = document.createElement("img");
        img.src = `${URL_IMAGEN}/${zoom}/${ty}/${((tx % mundo) + mundo) % mundo}`;
        img.alt = "";
        img.decoding = "async";
        img.width = img.height = lado;
        img.style.cssText = `position:absolute;left:${Math.round(tx * lado - izquierda)}px;top:${Math.round(ty * lado - arriba)}px;width:${lado}px;height:${lado}px;max-width:none`;
        fragmento.append(img);
      }
    }
    capas.replaceChildren(fragmento);
  };

  let ancho = 0;
  const alCambiarTamano = new ResizeObserver(([entrada]) => {
    const nuevo = Math.round(entrada.contentRect.width);
    if (nuevo !== ancho) {
      ancho = nuevo;
      dibujar();
    }
  });
  const alAcercarse = new IntersectionObserver(
    ([entrada]) => {
      if (!entrada.isIntersecting) return;
      alAcercarse.disconnect();
      alCambiarTamano.observe(mapa);
    },
    { rootMargin: "300px 0px" },
  );
  alAcercarse.observe(mapa);
});
