"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LocateFixed,
  Orbit,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { type CSSProperties, useCallback, useRef, useState } from "react";
import type { Locale } from "@/content/locales";
import { Button } from "../../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../../shared/ui/dialog";
import styles from "./solar-explorer.module.css";
import {
  resetSolarView,
  rotateSolarView,
  selectSolarBody,
  setSolarExplorerHost,
  useSolarExplorer,
  zoomSolarView,
} from "./solar-explorer-state";

type Kind = "star" | "planet" | "dwarf" | "moon";
/** Order follows distance from the Sun, with the Moon beside Earth. Colors tint the picker dot. */
const bodies = [
  { id: "sun", en: "Sun", es: "Sol", kind: "star", color: "#ffcf73" },
  { id: "mercury", en: "Mercury", es: "Mercurio", kind: "planet", color: "#a9a39b" },
  { id: "venus", en: "Venus", es: "Venus", kind: "planet", color: "#e8cf9b" },
  { id: "earth", en: "Earth", es: "Tierra", kind: "planet", color: "#4f9dff" },
  { id: "moon", en: "Moon", es: "Luna", kind: "moon", color: "#c9ccd3" },
  { id: "mars", en: "Mars", es: "Marte", kind: "planet", color: "#d9744a" },
  { id: "jupiter", en: "Jupiter", es: "Júpiter", kind: "planet", color: "#d8b28a" },
  { id: "saturn", en: "Saturn", es: "Saturno", kind: "planet", color: "#e5d3a1" },
  { id: "uranus", en: "Uranus", es: "Urano", kind: "planet", color: "#9fe8ff" },
  { id: "neptune", en: "Neptune", es: "Neptuno", kind: "planet", color: "#5d8dff" },
  { id: "pluto", en: "Pluto", es: "Plutón", kind: "dwarf", color: "#c9b29a" },
] as const satisfies readonly { id: string; en: string; es: string; kind: Kind; color: string }[];
const kinds: Record<Kind, { en: string; es: string }> = {
  star: { en: "Star", es: "Estrella" },
  planet: { en: "Planet", es: "Planeta" },
  dwarf: { en: "Dwarf planet", es: "Planeta enano" },
  moon: { en: "Earth's natural satellite", es: "Satélite natural de la Tierra" },
};
const systemColor = "#8ed9ff";
const rotationStep = Math.PI / 12;
const zoomStep = 0.2;

export function SolarExplorer({ locale }: { locale: Locale }) {
  const es = locale === "es";
  const [open, setOpen] = useState(false);
  const scroll = useRef(0);
  const explorer = useSolarExplorer();
  const attach = useCallback((node: HTMLDivElement | null) => setSolarExplorerHost(node), []);
  const selectedIndex = bodies.findIndex(({ id }) => id === explorer.selected);
  const selected = selectedIndex >= 0 ? bodies[selectedIndex] : undefined;
  const label = (body: (typeof bodies)[number]) => (es ? body.es : body.en);

  function changeOpen(value: boolean) {
    if (value) scroll.current = window.scrollY;
    else {
      setSolarExplorerHost(null);
      selectSolarBody(null);
      const top = scroll.current;
      requestAnimationFrame(() => window.scrollTo({ top, behavior: "instant" }));
    }
    setOpen(value);
  }
  /** Steps through the full system and every body, wrapping at either end. */
  function step(direction: 1 | -1) {
    const count = bodies.length + 1;
    const next = (selectedIndex + 1 + direction + count) % count;
    selectSolarBody(next === 0 ? null : bodies[next - 1].id);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={styles.trigger} data-solar-explore>
          <Orbit aria-hidden="true" size={16} />
          {es ? "Explorar el sistema solar" : "Explore the solar system"}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={styles.dialog}
        closeLabel={es ? "Volver al portfolio" : "Back to portfolio"}
      >
        <div ref={attach} className={styles.viewport} data-solar-viewport />
        <div className={styles.heading}>
          <DialogTitle>{es ? "Una pausa para explorar" : "A moment to explore"}</DialogTitle>
          <DialogDescription className={styles.description}>
            {es
              ? "Arrastra para rotar y acerca la vista con la rueda o dos dedos. Distancias y tiempos comprimidos para esta composición."
              : "Drag to rotate; use the wheel or pinch to zoom. Distances and time are compressed for this composition."}
          </DialogDescription>
        </div>
        {!explorer.ready && (
          <p role="status" className={styles.status}>
            {es
              ? "La vista 3D no está disponible. Puedes volver al portfolio y disfrutar del fondo estático."
              : "The 3D view is unavailable. Return to the portfolio to enjoy the static background."}
          </p>
        )}
        <p className={styles.caption} aria-live="polite" data-solar-caption>
          {selected ? (
            <>
              <strong>{label(selected)}</strong>
              <span>{es ? kinds[selected.kind].es : kinds[selected.kind].en}</span>
            </>
          ) : (
            <>
              <strong>{es ? "Sistema solar" : "Solar system"}</strong>
              <span>
                {es
                  ? "El Sol, ocho planetas, Plutón y la Luna"
                  : "The Sun, eight planets, Pluto and the Moon"}
              </span>
            </>
          )}
        </p>
        <div
          className={styles.dock}
          role="toolbar"
          aria-label={es ? "Controles del sistema solar" : "Solar system controls"}
        >
          <div className={styles.navigator}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => step(-1)}
              disabled={!explorer.ready}
              aria-label={es ? "Cuerpo anterior" : "Previous body"}
              title={es ? "Cuerpo anterior" : "Previous body"}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <label
              className={styles.selection}
              style={{ "--body-color": selected?.color ?? systemColor } as CSSProperties}
            >
              <span className={styles.visuallyHidden}>{es ? "Destacar" : "Highlight"}</span>
              <span className={styles.dot} aria-hidden="true" />
              <select
                value={explorer.selected ?? ""}
                onChange={(event) => selectSolarBody(event.target.value || null)}
                disabled={!explorer.ready}
              >
                <option value="">{es ? "Sistema completo" : "Full system"}</option>
                {bodies.map((body) => (
                  <option key={body.id} value={body.id}>
                    {body.kind === "dwarf"
                      ? `${label(body)} · ${es ? "planeta enano" : "dwarf planet"}`
                      : label(body)}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.chevron} aria-hidden="true" size={16} />
            </label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => step(1)}
              disabled={!explorer.ready}
              aria-label={es ? "Cuerpo siguiente" : "Next body"}
              title={es ? "Cuerpo siguiente" : "Next body"}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
          <span className={styles.divider} aria-hidden="true" />
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => zoomSolarView(-zoomStep)}
              disabled={!explorer.ready}
              aria-label={es ? "Acercar la vista" : "Zoom in"}
              title={es ? "Acercar la vista" : "Zoom in"}
            >
              <ZoomIn aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => zoomSolarView(zoomStep)}
              disabled={!explorer.ready}
              aria-label={es ? "Alejar la vista" : "Zoom out"}
              title={es ? "Alejar la vista" : "Zoom out"}
            >
              <ZoomOut aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => rotateSolarView(-rotationStep)}
              disabled={!explorer.ready}
              aria-label={es ? "Rotar hacia la izquierda" : "Rotate left"}
              title={es ? "Rotar hacia la izquierda" : "Rotate left"}
            >
              <RotateCcw aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => rotateSolarView(rotationStep)}
              disabled={!explorer.ready}
              aria-label={es ? "Rotar hacia la derecha" : "Rotate right"}
              title={es ? "Rotar hacia la derecha" : "Rotate right"}
            >
              <RotateCw aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={styles.reset}
              onClick={() => {
                selectSolarBody(null);
                resetSolarView();
              }}
              disabled={!explorer.ready}
            >
              <LocateFixed aria-hidden="true" />
              {es ? "Restablecer" : "Reset view"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
