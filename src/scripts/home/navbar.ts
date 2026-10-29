import { gsap } from "gsap";

const header = document.getElementById("site-header");
const hero = document.getElementById("hero");
const toggle = document.getElementById("nav-toggle");
const menu = document.getElementById("nav-menu");
const dropdowns = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-dropdown]")).map((root) => ({
  root,
  toggle: root.querySelector<HTMLButtonElement>("[data-nav-dropdown-toggle]"),
  menu: root.querySelector<HTMLElement>("[data-nav-dropdown-menu]"),
  icon: root.querySelector<SVGElement>("[data-nav-dropdown-icon]"),
}));
type Dropdown = (typeof dropdowns)[number];
const isOpen = (dropdown: Dropdown) => dropdown.toggle?.getAttribute("aria-expanded") === "true";

const overlay = document.getElementById("nav-overlay");
const closeBtn = document.getElementById("nav-close");
const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

const setDropdownOpen = (dropdown: Dropdown, open: boolean, immediate = false) => {
  const { toggle: dropdownToggle, menu: dropdownMenu, icon: dropdownIcon } = dropdown;
  if (!dropdownToggle || !dropdownMenu) return;
  if (!open && !isOpen(dropdown)) return;
  dropdownToggle.setAttribute("aria-expanded", String(open));
  dropdownIcon?.classList.toggle("rotate-180", open);

  gsap.killTweensOf(dropdownMenu);
  if (!isMobile() || (!open && immediate)) {
    gsap.set(dropdownMenu, { clearProps: "height,opacity" });
    dropdownMenu.classList.toggle("hidden", !open);
    return;
  }
  if (open) {
    dropdownMenu.classList.remove("hidden");
    gsap.fromTo(
      dropdownMenu,
      { height: 0, opacity: 0 },
      { height: "auto", opacity: 1, duration: 0.35, ease: "power3.out" }
    );
  } else {
    gsap.to(dropdownMenu, {
      height: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
      onComplete: () => dropdownMenu.classList.add("hidden"),
    });
  }
};

let tl: gsap.core.Timeline | null = null;
let menuOpen = false;
// Ancho del panel, medido antes de tocar atributos para no forzar un recálculo del layout a mitad de la animación
let anchoMenu = 0;

// El scroll de la página no se bloquea con overflow: hidden (eso recalcula el layout de toda la página justo al
// empezar la animación): el fondo oscuro tiene touch-none y el panel overscroll-contain
const openMenu = () => {
  if (!tl) return;
  const ancho = menu?.offsetWidth ?? 0;
  if (ancho !== anchoMenu) {
    anchoMenu = ancho;
    tl.invalidate();
  }
  menuOpen = true;
  toggle?.setAttribute("aria-expanded", "true");
  toggle?.setAttribute("aria-label", "Cerrar menú");
  header?.setAttribute("data-menu-open", "true");
  header?.setAttribute("data-hidden", "false");
  tl.timeScale(1).play();
  gsap.delayedCall(0.1, () => menuOpen && closeBtn?.focus({ preventScroll: true }));
};

const closeMenu = () => {
  dropdowns.forEach((dropdown) => setDropdownOpen(dropdown, false, true));
  menuOpen = false;
  toggle?.setAttribute("aria-expanded", "false");
  toggle?.setAttribute("aria-label", "Abrir menú");
  header?.setAttribute("data-menu-open", "false");
  tl?.timeScale(1.3).reverse();
};

const mm = gsap.matchMedia();
mm.add("(max-width: 767px)", () => {
  if (!menu || !overlay) return;

  const lugarOriginal = document.createComment("nav-menu");
  overlay.before(lugarOriginal);
  document.body.append(overlay, menu);

  const pagina = Array.from(document.body.children).filter(
    (el) =>
      el !== menu &&
      el !== overlay &&
      !["SCRIPT", "STYLE", "TEMPLATE", "LINK", "ASTRO-DEV-TOOLBAR"].includes(el.tagName)
  );

  gsap.set(menu, { xPercent: 100, autoAlpha: 0 });
  gsap.set(overlay, { autoAlpha: 0 });

  tl = gsap
    .timeline({
      paused: true,
      onReverseComplete: () => {
        gsap.set(pagina, { clearProps: "transform,willChange" });
        gsap.set(menu, { clearProps: "willChange" });
        if (toggle) gsap.set(toggle, { clearProps: "opacity,visibility,transform" });
        if (menu.contains(document.activeElement)) toggle?.focus({ preventScroll: true });
      },
    })
    .to(toggle ?? [], { autoAlpha: 0, scale: 0.6, duration: 0.2, ease: "power2.in" }, 0)
    .to(overlay, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0)
    .to(menu, { autoAlpha: 1, duration: 0.01 }, 0)
    .to(menu, { xPercent: 0, duration: 0.38, ease: "power3.inOut" }, 0)
    .to(pagina, { x: () => -anchoMenu, duration: 0.38, ease: "power3.inOut" }, 0);

  // Al tocar el botón (antes del click) el navegador ya empieza a preparar las capas que se van a mover
  const prepararCapas = () => {
    if (!menuOpen) gsap.set([menu, ...pagina], { willChange: "transform" });
  };
  toggle?.addEventListener("pointerdown", prepararCapas);

  if (menuOpen) tl.progress(1);

  return () => {
    toggle?.removeEventListener("pointerdown", prepararCapas);
    tl?.kill();
    tl = null;
    gsap.set(pagina, { clearProps: "transform,willChange" });
    lugarOriginal.replaceWith(overlay, menu);
  };
});

toggle?.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
closeBtn?.addEventListener("click", () => {
  closeMenu();
  toggle?.focus();
});
overlay?.addEventListener("click", closeMenu);

dropdowns.forEach((dropdown) => {
  dropdown.toggle?.addEventListener("click", () => {
    const open = !isOpen(dropdown);
    if (open) dropdowns.forEach((otro) => otro !== dropdown && setDropdownOpen(otro, false, true));
    setDropdownOpen(dropdown, open);
  });

  dropdown.root.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
});

menu?.querySelectorAll(":scope > ul > li > a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("click", (event) => {
  if (isMobile()) return;
  dropdowns.forEach((dropdown) => {
    if (!event.composedPath().includes(dropdown.root)) setDropdownOpen(dropdown, false);
  });
});


document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const menuOpen = toggle?.getAttribute("aria-expanded") === "true";
  const dropdownOpen = dropdowns.find(isOpen);
  if (!menuOpen && !dropdownOpen) return;
  closeMenu();
  (menuOpen ? toggle : dropdownOpen?.toggle)?.focus();
});


const update = () => {
  if (!header) return;
  const y = window.scrollY;

  const heroRef = hero?.parentElement?.classList.contains("pin-spacer")
    ? hero.parentElement
    : hero;
  let siguiente = heroRef?.nextElementSibling ?? null;
  while (siguiente && ["SCRIPT", "STYLE", "TEMPLATE", "LINK"].includes(siguiente.tagName)) {
    siguiente = siguiente.nextElementSibling;
  }
  // Una isla de React (astro-island) no tiene caja propia (display: contents) y mide 0: se usa el final del hero
  if (siguiente && siguiente.getClientRects().length === 0) siguiente = null;
  const heroEnd = heroRef
    ? (siguiente ?? heroRef).getBoundingClientRect()[siguiente ? "top" : "bottom"] + window.scrollY
    : 0;
  const pastHero = y >= heroEnd - header.offsetHeight;

  // Solo se escribe si cambió: reescribir el mismo valor igual obliga al navegador a recalcular estilos
  const solid = pastHero ? "true" : "false";
  if (header.dataset.solid !== solid) header.dataset.solid = solid;
  if (header.dataset.hidden !== "false") header.dataset.hidden = "false";
};

// Una vez por cuadro como máximo (el scroll puede disparar varios eventos por cuadro)
let cuadroPendiente = 0;
window.addEventListener(
  "scroll",
  () => {
    cuadroPendiente ||= requestAnimationFrame(() => {
      cuadroPendiente = 0;
      update();
    });
  },
  { passive: true },
);


window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) closeMenu(); 
  update();
});

update();
