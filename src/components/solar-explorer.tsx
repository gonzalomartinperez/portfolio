"use client";

import { Orbit, RotateCcw } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { Locale } from "@/content/locales";
import { setPageMotionPaused, usePageMotionPaused } from "./motion-state";
import styles from "./solar-explorer.module.css";
import {
  resetSolarView,
  rotateSolarView,
  selectSolarBody,
  setSolarExplorerHost,
  useSolarExplorer,
  zoomSolarView,
} from "./solar-explorer-state";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";

const bodies = [
  ["sun", "Sun", "Sol"],
  ["mercury", "Mercury", "Mercurio"],
  ["venus", "Venus", "Venus"],
  ["earth", "Earth", "Tierra"],
  ["moon", "Moon", "Luna"],
  ["mars", "Mars", "Marte"],
  ["jupiter", "Jupiter", "Júpiter"],
  ["saturn", "Saturn", "Saturno"],
  ["uranus", "Uranus", "Urano"],
  ["neptune", "Neptune", "Neptuno"],
  ["pluto", "Pluto · dwarf planet", "Plutón · planeta enano"],
] as const;

export function SolarExplorer({ locale }: { locale: Locale }) {
  const es = locale === "es";
  const [open, setOpen] = useState(false);
  const scroll = useRef(0);
  const paused = usePageMotionPaused();
  const explorer = useSolarExplorer();
  const attach = useCallback((node: HTMLDivElement | null) => setSolarExplorerHost(node), []);
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
        <div className={styles.controls}>
          <label className={styles.selection}>
            <span>{es ? "Destacar" : "Highlight"}</span>
            <select
              value={explorer.selected ?? ""}
              onChange={(event) => selectSolarBody(event.target.value || null)}
              disabled={!explorer.ready}
            >
              <option value="">{es ? "Sistema completo" : "Full system"}</option>
              {bodies.map(([id, en, spanish]) => (
                <option key={id} value={id}>
                  {es ? spanish : en}
                </option>
              ))}
            </select>
          </label>
          <Button
            variant="outline"
            onClick={() => zoomSolarView(-0.2)}
            disabled={!explorer.ready}
            aria-label={es ? "Acercar la vista" : "Zoom in"}
          >
            +
          </Button>
          <Button
            variant="outline"
            onClick={() => zoomSolarView(0.2)}
            disabled={!explorer.ready}
            aria-label={es ? "Alejar la vista" : "Zoom out"}
          >
            −
          </Button>
          <Button
            variant="outline"
            onClick={() => rotateSolarView(-Math.PI / 12)}
            disabled={!explorer.ready}
            aria-label={es ? "Rotar hacia la izquierda" : "Rotate left"}
          >
            ↶
          </Button>
          <Button
            variant="outline"
            onClick={() => rotateSolarView(Math.PI / 12)}
            disabled={!explorer.ready}
            aria-label={es ? "Rotar hacia la derecha" : "Rotate right"}
          >
            ↷
          </Button>
          <Button variant="outline" onClick={resetSolarView} disabled={!explorer.ready}>
            <RotateCcw aria-hidden="true" size={16} />
            {es ? "Restablecer" : "Reset view"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setPageMotionPaused(!paused)}
            aria-pressed={paused}
          >
            {paused ? (es ? "Reanudar" : "Resume") : es ? "Pausar" : "Pause"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
