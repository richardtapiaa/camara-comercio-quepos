import * as React from "react";


type Props = React.ComponentPropsWithRef<"textarea">;

const AreaTextoAutoajustable = ({ ref, value, ...props }: Props) => {
  const area = React.useRef<HTMLTextAreaElement | null>(null);

  const ajustar = React.useCallback(() => {
    const elemento = area.current;
    if (!elemento) return;
    // Al poner la altura en "auto" la página puede encogerse un instante y mover el scroll; se guarda y se repone
    const scrollAntes = window.scrollY;
    elemento.style.height = "auto";
    const bordes = elemento.offsetHeight - elemento.clientHeight;
    const alto = elemento.scrollHeight + bordes;
    elemento.style.height = `${alto}px`;
    const maximo = Number.parseFloat(getComputedStyle(elemento).maxHeight);
    elemento.style.overflowY = Number.isFinite(maximo) && alto > maximo ? "auto" : "hidden";
    if (window.scrollY !== scrollAntes) window.scrollTo({ top: scrollAntes });
  }, []);

  React.useLayoutEffect(ajustar, [value, ajustar]);

  React.useEffect(() => {
    const elemento = area.current;
    if (!elemento) return;
    let anchoAnterior = elemento.clientWidth;
    const observador = new ResizeObserver(() => {
      if (elemento.clientWidth === anchoAnterior) return;
      anchoAnterior = elemento.clientWidth;
      ajustar();
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [ajustar]);

  const asignarRef = (elemento: HTMLTextAreaElement | null) => {
    area.current = elemento;
    if (typeof ref === "function") ref(elemento);
    else if (ref) ref.current = elemento;
  };

  return <textarea ref={asignarRef} value={value} {...props} />;
};

export default AreaTextoAutoajustable;
