import * as React from "react";
import { gsap } from "gsap";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionContextValue = {
  abiertos: string[];
  alternar: (value: string) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const ItemContext = React.createContext<{ value: string; abierto: boolean } | null>(null);

type AccordionProps = React.HTMLAttributes<HTMLDivElement> & {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
};

export function Accordion({ type = "single", collapsible = false, defaultValue, className, ...props }: AccordionProps) {
  const [abiertos, setAbiertos] = React.useState<string[]>(
    defaultValue === undefined ? [] : Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  );

  const alternar = (value: string) => {
    setAbiertos((actuales) => {
      const abierto = actuales.includes(value);
      if (type === "multiple") return abierto ? actuales.filter((v) => v !== value) : [...actuales, value];
      if (abierto) return collapsible ? [] : actuales;
      return [value];
    });
  };

  return (
    <AccordionContext.Provider value={{ abiertos, alternar }}>
      <div className={className} {...props} />
    </AccordionContext.Provider>
  );
}

type AccordionItemProps = React.HTMLAttributes<HTMLDivElement> & { value: string };

export function AccordionItem({ value, className, ...props }: AccordionItemProps) {
  const contexto = React.useContext(AccordionContext);
  const abierto = contexto?.abiertos.includes(value) ?? false;

  return (
    <ItemContext.Provider value={{ value, abierto }}>
      <div data-state={abierto ? "open" : "closed"} className={className} {...props} />
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const contexto = React.useContext(AccordionContext);
  const item = React.useContext(ItemContext);

  return (
    <button
      type="button"
      aria-expanded={item?.abierto}
      onClick={() => item && contexto?.alternar(item.value)}
      className={cn("flex w-full items-center justify-between gap-4 py-4 text-left", className)}
      {...props}
    >
      {children}
      <Plus
        strokeWidth={1.5}
        className={cn("size-5 shrink-0 text-slate-900 transition-transform duration-[380ms] ease-out", item?.abierto && "rotate-45")}
      />
    </button>
  );
}

export function AccordionContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  const item = React.useContext(ItemContext);
  const abierto = item?.abierto ?? false;
  const marco = React.useRef<HTMLDivElement>(null);
  const contenido = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

    if (abierto) {
      tl.to(marco.current, { height: "auto", duration: 0.38, ease: "power2.out" }).fromTo(
        contenido.current,
        { autoAlpha: 0, y: -6 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
        "-=0.3"
      );
    } else {
      tl.to(contenido.current, { autoAlpha: 0, y: -4, duration: 0.15, ease: "power1.in" }).to(
        marco.current,
        { height: 0, duration: 0.3, ease: "power2.inOut" },
        "-=0.12"
      );
    }

    return () => {
      tl.kill();
    };
  }, [abierto]);

  return (
    <div ref={marco} className="h-0 overflow-hidden" aria-hidden={!abierto} inert={!abierto}>
      <div ref={contenido} className={cn("invisible pb-4 opacity-0", className)}>
        {children}
      </div>
    </div>
  );
}
