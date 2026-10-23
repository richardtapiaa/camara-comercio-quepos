const el = document.getElementById("mapa-quepos");

const init = async (el: HTMLElement) => {
  const [{ default: L }, { default: markerIcon }, { default: markerIcon2x }, { default: markerShadow }] =
    await Promise.all([
      import("leaflet"),
      import("leaflet/dist/images/marker-icon.png"),
      import("leaflet/dist/images/marker-icon-2x.png"),
      import("leaflet/dist/images/marker-shadow.png"),
      import("leaflet/dist/leaflet.css"),
    ]);

  const lat = Number(el.dataset.lat);
  const lng = Number(el.dataset.lng);

  const map = L.map(el, {
    center: [lat, lng],
    zoom: Number(el.dataset.zoom),
    minZoom: 0,
    maxZoom: 18,
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
    boxZoom: false,
    keyboard: false,
    dragging: false,
  });

  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 18,
    attribution:
      "© <a href='https://www.esri.com/'>Esri</a> | DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community",
  }).addTo(map);

  const icon = L.icon({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const content = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "mapa-popup-title";
  title.textContent = el.dataset.title ?? "";
  const img = document.createElement("img");
  img.className = "mapa-popup-logo";
  img.src = el.dataset.logo ?? "";
  img.alt = el.dataset.title ?? "";
  content.append(title, img);

  L.marker([lat, lng], { icon, title: el.dataset.title }).addTo(map).bindPopup(content, { autoClose: false, closeOnClick: false }).openPopup();
};

if (el) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      init(el);
    },
    { rootMargin: "600px" },
  );
  observer.observe(el);
}
