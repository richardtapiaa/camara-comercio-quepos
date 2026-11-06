"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import Supercluster, { type AnyProps, type ClusterFeature, type PointFeature } from "supercluster";
import { IdCard, Info, MapPin, Maximize2, Search, X } from "lucide-react";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  useMap,
  type MapRef,
} from "@/components/ui/map";
import { cn } from "@/lib/utils";

setWorkerUrl(workerUrl);

const CARTO_KEY = import.meta.env.PUBLIC_CARTO_KEY ?? "";

const CANTON_QUEPOS: [[number, number], [number, number]] = [
  [-84.2542, 9.2535],
  [-83.839, 9.572],
];

const PADDING_CANTON = { top: 126, right: 30, bottom: 30, left: 30 };

const PADDING_CELULAR = { top: 180, right: 56, bottom: 90, left: 56 };

export type AfiliadoMapa = {
  id: string;
  nombre: string;
  categoria: string;
  descripcion?: string;
  logo: { src: string; ancho: number; alto: number };
  foto?: string;
  info?: string;
  web?: string;
  facebook?: string;
  instagram?: string;
  lat: number;
  lng: number;
};

type Grupo = ClusterFeature<AnyProps>;
type Punto = PointFeature<AfiliadoMapa>;

const esGrupo = (marcador: Grupo | Punto): marcador is Grupo => "cluster" in marcador.properties;

const ZOOM_MAXIMO_GRUPOS = 18;

export default function MapaAfiliadosMapcn({ afiliados }: { afiliados: AfiliadoMapa[] }) {
  const indice = useMemo(
    () =>
      new Supercluster<AfiliadoMapa>({ radius: 64, maxZoom: ZOOM_MAXIMO_GRUPOS }).load(
        afiliados.map((afiliado) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [afiliado.lng, afiliado.lat] },
          properties: afiliado,
        })),
      ),
    [afiliados],
  );
  const [seleccionado, setSeleccionado] = useState<AfiliadoMapa | null>(null);
  const [cerrando, setCerrando] = useState(false);

  const seleccionar = useCallback((afiliado: AfiliadoMapa) => {
    setCerrando(false);
    setSeleccionado(afiliado);
  }, []);
  const quitarTarjeta = useCallback(() => {
    setSeleccionado(null);
    setCerrando(false);
  }, []);
  const cerrarTarjeta = useCallback(() => setCerrando(true), []);

  const encuadre = useMemo(() => {
    const celular = window.matchMedia("(max-width: 767px)").matches;
    if (!celular || afiliados.length === 0) return { limites: CANTON_QUEPOS, padding: PADDING_CANTON };
    const lngs = afiliados.map((afiliado) => afiliado.lng);
    const lats = afiliados.map((afiliado) => afiliado.lat);
    const limites: [[number, number], [number, number]] = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ];
    return { limites, padding: PADDING_CELULAR };
  }, [afiliados]);

  return (
    <Map
      theme="light"
      styles={{
        light: `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json?key=${CARTO_KEY}`,
      }}
      bounds={encuadre.limites}
      fitBoundsOptions={{ padding: encuadre.padding }}
      attributionControl={{ compact: false }}
    >
      <ColoresMapa />
      <MapControls />
      <BuscadorAfiliados
        afiliados={afiliados}
        indice={indice}
        onSeleccionar={seleccionar}
        oculto={seleccionado !== null && !cerrando}
      />
      <MarcadoresAfiliados indice={indice} seleccionado={seleccionado} onSeleccionar={seleccionar} />
      {seleccionado && (
        <TarjetaAfiliado
          key={seleccionado.id}
          afiliado={seleccionado}
          cerrando={cerrando}
          onCerrar={cerrarTarjeta}
          onCerrada={quitarTarjeta}
        />
      )}
    </Map>
  );
}

const COLORES_MAPA: Record<string, [propiedad: "background-color" | "fill-color" | "line-color", color: string]> = {
  background: ["background-color", "#e8f1d9"],
  landcover: ["fill-color", "#bfe0a3"],
  landuse: ["fill-color", "#cfe6bd"],
  park_nature_reserve: ["fill-color", "#acd790"],
  park_national_park: ["fill-color", "#98cf7c"],
  landuse_residential: ["fill-color", "#f2e6cc"],
  water: ["fill-color", "#5fadd8"],
  water_shadow: ["fill-color", "#86c5e6"],
  waterway: ["line-color", "#86c5e6"],
};

const TERRENOS_EXTRA = [
  { id: "cultivos", tipo: "farmland", color: "#dbe8b4" },
  { id: "manglares", tipo: "wetland", color: "#9cd3bd" },
  { id: "playas", tipo: "beach", color: "#f6dd97" },
];

function ColoresMapa() {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;
    for (const [capa, [propiedad, color]] of Object.entries(COLORES_MAPA)) {
      if (map.getLayer(capa)) map.setPaintProperty(capa, propiedad, color);
    }
    if (!map.getSource("protomaps")) return;
    for (const { id, tipo, color } of TERRENOS_EXTRA) {
      if (map.getLayer(id)) continue;
      map.addLayer(
        {
          id,
          type: "fill",
          source: "protomaps",
          "source-layer": "landuse",
          filter: ["==", ["get", "kind"], tipo],
          paint: { "fill-color": color },
        },
        map.getLayer("waterway") ? "waterway" : undefined,
      );
    }
  }, [map, isLoaded]);

  return null;
}

function MarcadoresAfiliados({
  indice,
  seleccionado,
  onSeleccionar,
}: {
  indice: Supercluster<AfiliadoMapa>;
  seleccionado: AfiliadoMapa | null;
  onSeleccionar: (afiliado: AfiliadoMapa) => void;
}) {
  const { map } = useMap();
  const [vista, setVista] = useState<{ limites: [number, number, number, number]; zoom: number }>();

  useEffect(() => {
    if (!map) return;
    const actualizar = () => {
      const limites = map.getBounds();
      setVista({
        limites: [limites.getWest(), limites.getSouth(), limites.getEast(), limites.getNorth()],
        zoom: map.getZoom(),
      });
    };
    actualizar();
    map.on("moveend", actualizar);
    return () => {
      map.off("moveend", actualizar);
    };
  }, [map]);

  if (!map || !vista) return null;

  return indice.getClusters(vista.limites, vista.zoom).map((marcador) => {
    const [lng, lat] = marcador.geometry.coordinates;

    if (esGrupo(marcador)) {
      const { cluster_id, point_count } = marcador.properties;
      return (
        <MapMarker
          key={`grupo-${cluster_id}`}
          longitude={lng}
          latitude={lat}
          onClick={() => map.easeTo({ center: [lng, lat], zoom: indice.getClusterExpansionZoom(cluster_id) })}
        >
          <MarkerContent>
            <span className="flex size-11 items-center justify-center rounded-full bg-[#2578bd] motion-safe:animate-aparecer-marcador text-sm font-semibold text-white shadow-lg ring-4 ring-white/80 transition-transform hover:scale-110">
              {point_count}
            </span>
          </MarkerContent>
          <MarkerTooltip>{point_count} afiliados: clic para acercar</MarkerTooltip>
        </MapMarker>
      );
    }

    const afiliado = marcador.properties;
    return (
      <MapMarker
        key={afiliado.id}
        longitude={lng}
        latitude={lat}
        onClick={() => {
          onSeleccionar(afiliado);
          mostrarJuntoATarjeta(map, [lng, lat]);
        }}
      >
        <MarkerContent>
          <span
            className={cn(
              "flex h-12 min-w-12 max-w-24 items-center justify-center rounded-xl bg-white px-2 py-1.5 shadow-md transition-transform hover:scale-110 motion-safe:animate-aparecer-marcador",
              afiliado.id === seleccionado?.id ? "ring-2 ring-[#2780c9]" : "ring-1 ring-black/10",
            )}
          >
            <img
              src={afiliado.logo.src}
              width={afiliado.logo.ancho}
              height={afiliado.logo.alto}
              alt={afiliado.nombre}
              className="h-full w-auto max-w-full object-contain"
            />
          </span>
        </MarkerContent>
        <MarkerTooltip>{afiliado.nombre}</MarkerTooltip>
      </MapMarker>
    );
  });
}

function mostrarJuntoATarjeta(map: MapRef, centro: [number, number]) {
  const compu = window.matchMedia("(min-width: 768px)").matches;
  map.easeTo({ center: centro, offset: compu ? [226, 48] : [0, -170], duration: 600 });
}

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function zoomParaVerLogo(indice: Supercluster<AfiliadoMapa>, afiliado: AfiliadoMapa) {
  const alrededor: [number, number, number, number] = [
    afiliado.lng - 0.001,
    afiliado.lat - 0.001,
    afiliado.lng + 0.001,
    afiliado.lat + 0.001,
  ];
  for (let zoom = 16; zoom <= ZOOM_MAXIMO_GRUPOS; zoom++) {
    const suelto = indice
      .getClusters(alrededor, zoom)
      .some((marcador) => !esGrupo(marcador) && marcador.properties.id === afiliado.id);
    if (suelto) return zoom;
  }
  return ZOOM_MAXIMO_GRUPOS + 1;
}

function BuscadorAfiliados({
  afiliados,
  indice,
  onSeleccionar,
  oculto,
}: {
  afiliados: AfiliadoMapa[];
  indice: Supercluster<AfiliadoMapa>;
  onSeleccionar: (afiliado: AfiliadoMapa) => void;
  oculto: boolean;
}) {
  const { map } = useMap();
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!oculto) return;
    campo.current?.blur();
    setAbierto(false);
  }, [oculto]);

  const resultados = useMemo(() => {
    const buscado = normalizar(texto.trim());
    if (!buscado) return [];
    return afiliados
      .filter((afiliado) => normalizar(`${afiliado.nombre} ${afiliado.categoria}`).includes(buscado))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [afiliados, texto]);

  const elegir = (afiliado: AfiliadoMapa) => {
    if (!map) return;
    const compu = window.matchMedia("(min-width: 768px)").matches;
    if (compu) onSeleccionar(afiliado);
    map.flyTo({
      center: [afiliado.lng, afiliado.lat],
      zoom: Math.max(map.getZoom(), zoomParaVerLogo(indice, afiliado)),
      offset: compu ? [226, 48] : [0, 60],
      duration: 1800,
      curve: 1.4,
      essential: true,
    });
    setTexto("");
    setAbierto(false);
    campo.current?.blur();
  };

  const alPresionar = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      const paso = evento.key === "ArrowDown" ? 1 : -1;
      setActivo((actual) => (actual + paso + resultados.length) % Math.max(resultados.length, 1));
    } else if (evento.key === "Enter" && resultados[activo]) {
      elegir(resultados[activo]);
    } else if (evento.key === "Escape") {
      evento.stopPropagation();
      setTexto("");
      setAbierto(false);
    }
  };

  return (
    <div
      className={cn(
        "absolute inset-x-3 top-28 z-20 transition-[opacity,translate] duration-300 ease-out md:inset-x-auto md:right-8 md:top-32 md:w-80",
        oculto && "max-md:pointer-events-none max-md:-translate-y-4 max-md:opacity-0",
      )}
    >
      <label className="relative block">
        <span className="sr-only">Buscar afiliado en el mapa</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={campo}
          type="search"
          value={texto}
          placeholder="Buscar afiliado…"
          role="combobox"
          aria-expanded={abierto && texto.trim() !== ""}
          aria-controls="resultados-mapa"
          onChange={(evento) => {
            setTexto(evento.target.value);
            setActivo(0);
            setAbierto(true);
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setAbierto(false)}
          onKeyDown={alPresionar}
          className="h-12 w-full rounded-full border border-white/70 bg-white/85 pl-12 pr-4 text-[15px] text-slate-800 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.45)] outline-none backdrop-blur-xl placeholder:text-slate-400 focus:ring-2 focus:ring-[#2780c9]/40"
        />
      </label>

      {abierto && texto.trim() !== "" && (
        <ul
          id="resultados-mapa"
          role="listbox"
          className="mt-2 max-h-72 overflow-y-auto overscroll-contain rounded-2xl border border-white/70 bg-white/90 p-1.5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.5)] backdrop-blur-xl"
        >
          {resultados.length === 0 && <li className="px-3 py-3 text-sm text-slate-500">No hay afiliados con ese nombre</li>}
          {resultados.map((afiliado, indice) => (
            <li key={afiliado.id} role="option" aria-selected={indice === activo}>
              <button
                type="button"
                onMouseDown={(evento) => evento.preventDefault()}
                onClick={() => elegir(afiliado)}
                onMouseEnter={() => setActivo(indice)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                  indice === activo && "bg-[#E8F4FA]",
                )}
              >
                <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-black/5">
                  <img src={afiliado.logo.src} alt="" className="max-h-full max-w-full object-contain" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800">{afiliado.nombre}</span>
                  <span className="block text-xs text-slate-500">{afiliado.categoria}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ModalFoto({
  src,
  alt,
  origen,
  onCerrada,
}: {
  src: string;
  alt: string;
  origen: HTMLImageElement | null;
  onCerrada: () => void;
}) {
  const fondo = useRef<HTMLDivElement>(null);
  const imagen = useRef<HTMLImageElement>(null);
  const cerrando = useRef(false);

  const sobreOrigen = () => {
    const desde = origen?.getBoundingClientRect();
    const hasta = imagen.current?.getBoundingClientRect();
    if (!desde || !hasta?.width) return { scale: 0.9 };
    return {
      x: desde.left + desde.width / 2 - (hasta.left + hasta.width / 2),
      y: desde.top + desde.height / 2 - (hasta.top + hasta.height / 2),
      scale: desde.width / hasta.width,
    };
  };

  const cerrar = () => {
    if (cerrando.current) return;
    cerrando.current = true;
    gsap
      .timeline({ onComplete: onCerrada })
      .to(imagen.current, { ...sobreOrigen(), opacity: 0, duration: 0.45, ease: "power3.in" }, 0)
      .to(fondo.current, { opacity: 0, duration: 0.4, ease: "power2.in" }, 0.05);
  };

  useLayoutEffect(() => {
    const entrada = gsap
      .timeline()
      .from(fondo.current, { opacity: 0, duration: 0.4, ease: "power2.out" }, 0)
      .from(imagen.current, { ...sobreOrigen(), opacity: 0, duration: 0.6, ease: "power3.out" }, 0);
    return () => {
      entrada.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key !== "Escape") return;
      evento.stopImmediatePropagation();
      cerrar();
    };
    window.addEventListener("keydown", alPresionar, true);
    return () => window.removeEventListener("keydown", alPresionar, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div
      ref={fondo}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={cerrar}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-10"
    >
      <img
        ref={imagen}
        src={src}
        alt={alt}
        width={origen?.naturalWidth || undefined}
        height={origen?.naturalHeight || undefined}
        onClick={(evento) => evento.stopPropagation()}
        className="h-auto max-h-full w-auto max-w-full rounded-2xl object-contain shadow-2xl"
      />
      <button
        type="button"
        onClick={cerrar}
        aria-label="Cerrar la foto"
        className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 sm:right-6 sm:top-6"
      >
        <X className="size-5" />
      </button>
    </div>,
    document.body,
  );
}

const claseDato =
  "flex items-start gap-2.5 rounded-xl bg-white px-4 py-3 shadow-sm transition-colors hover:bg-slate-50";

function TarjetaAfiliado({
  afiliado,
  cerrando,
  onCerrar,
  onCerrada,
}: {
  afiliado: AfiliadoMapa;
  cerrando: boolean;
  onCerrar: () => void;
  onCerrada: () => void;
}) {
  const tarjeta = useRef<HTMLDivElement>(null);
  const contenido = useRef<HTMLDivElement>(null);
  const foto = useRef<HTMLImageElement>(null);
  const [fotoAbierta, setFotoAbierta] = useState(false);
  const [hayMas, setHayMas] = useState(false);

  useEffect(() => {
    const caja = contenido.current;
    if (!caja) return;
    const revisar = () => setHayMas(caja.scrollTop + caja.clientHeight < caja.scrollHeight - 4);
    revisar();
    caja.addEventListener("scroll", revisar, { passive: true });
    const observador = new ResizeObserver(revisar);
    observador.observe(caja);
    for (const hijo of caja.children) observador.observe(hijo);
    return () => {
      caja.removeEventListener("scroll", revisar);
      observador.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const entrada = gsap
      .timeline()
      .from(tarjeta.current, { yPercent: 110, opacity: 0, duration: 0.7, ease: "power3.out" });
    return () => {
      entrada.revert();
    };
  }, []);

  useEffect(() => {
    if (!cerrando) return;
    const salida = gsap
      .timeline({ onComplete: onCerrada })
      .to(tarjeta.current, { yPercent: 110, opacity: 0, duration: 0.45, ease: "power3.in", pointerEvents: "none" });
    return () => {
      salida.kill();
    };
  }, [cerrando, onCerrada]);

  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [onCerrar]);


  const enlace = afiliado.web
    ? { href: afiliado.web, texto: "Visitar sitio web" }
    : afiliado.facebook
      ? { href: afiliado.facebook, texto: "Ver en Facebook" }
      : afiliado.instagram
        ? { href: afiliado.instagram, texto: "Ver en Instagram" }
        : null;

  return (
    <div
      ref={tarjeta}
      role="dialog"
      aria-label={afiliado.nombre}
      className="absolute inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 flex max-h-[75%] flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)] backdrop-blur-xl md:inset-x-auto md:bottom-auto md:left-8 md:top-32 md:max-h-[calc(100%-10rem)] md:w-[420px]"
    >
      <div
        ref={contenido}
        className={cn(
          "min-h-0 overflow-y-auto overscroll-contain px-5 pt-5 [scrollbar-width:none] md:px-8 md:pt-8 [&::-webkit-scrollbar]:hidden",
          enlace ? "pb-6" : "pb-5 md:pb-8",
        )}
      >
        <div className="flex items-center gap-3">
          <img src={afiliado.logo.src} alt="" className="h-10 w-auto max-w-40 object-contain" />
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-colors hover:bg-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-[#2780c9] to-[#0f3d63]">
          {afiliado.foto && (
            <img ref={foto} src={afiliado.foto} alt={`Foto de ${afiliado.nombre}`} className="size-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-5 bottom-4 text-white">
            <h3 className="text-xl font-semibold leading-tight">{afiliado.nombre}</h3>
            {afiliado.descripcion && <p className="mt-0.5 text-sm text-white/85">{afiliado.descripcion}</p>}
          </div>
          {afiliado.foto && (
            <button
              type="button"
              onClick={() => setFotoAbierta(true)}
              aria-label="Ver la foto en grande"
              className="group absolute inset-0 cursor-zoom-in"
            >
              <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors group-hover:bg-black/55">
                <Maximize2 className="size-4" aria-hidden="true" />
              </span>
            </button>
          )}
        </div>

        {afiliado.foto && fotoAbierta && (
          <ModalFoto
            src={afiliado.foto}
            alt={`Foto de ${afiliado.nombre}`}
            origen={foto.current}
            onCerrada={() => setFotoAbierta(false)}
          />
        )}

        <div className="mt-4 grid gap-3 text-sm leading-snug text-slate-800">
          {afiliado.info && (
            <p className="flex items-start gap-2.5 rounded-xl bg-white px-4 py-3 leading-relaxed shadow-sm">
              <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              {afiliado.info}
            </p>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${afiliado.nombre} Quepos Costa Rica`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={claseDato}
          >
            <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            Ver el lugar en Google Maps
          </a>
          <a href={`/afiliados#${afiliado.id}`} className={claseDato}>
            <IdCard className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            Ver más información
          </a>
        </div>
      </div>

      <div className={cn("relative shrink-0", enlace && "px-5 pb-5 md:px-8 md:pb-8")}>
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-full h-12 bg-gradient-to-t from-white/90 to-transparent transition-opacity duration-200 motion-reduce:transition-none",
            hayMas ? "opacity-100" : "opacity-0",
          )}
        />
        {enlace && (
          <a
            href={enlace.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-full items-center justify-center rounded-full bg-neutral-800 text-lg text-white transition-colors hover:bg-neutral-700 md:h-16"
          >
            {enlace.texto} →
          </a>
        )}
      </div>
    </div>
  );
}
