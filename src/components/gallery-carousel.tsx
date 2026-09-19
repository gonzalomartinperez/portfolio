"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./gallery-carousel.module.css";

export type GallerySlide = { id: string; src: string; alt: string; width: number; height: number };

function EnlargedImage({ slide, locale }: { slide: GallerySlide; locale: "en" | "es" }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  return (
    <div className={styles.imageFrame} aria-busy={status === "loading"}>
      {status === "loading" && (
        <>
          <Skeleton className={styles.skeleton} />
          <span className="sr-only" role="status">
            {locale === "es" ? "Cargando imagen" : "Loading image"}
          </span>
        </>
      )}
      {status !== "error" && (
        <Image
          alt={slide.alt}
          src={slide.src}
          width={slide.width}
          height={slide.height}
          sizes="96vw"
          unoptimized
          className={styles.fullImage}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
        />
      )}
      {status === "error" && (
        <p role="alert" className={styles.imageError}>
          {locale === "es" ? "No se pudo cargar la imagen. " : "The image could not be loaded. "}
          <a href={slide.src}>
            {locale === "es" ? "Abrir el archivo original" : "Open the original file"}
          </a>
        </p>
      )}
    </div>
  );
}
const flows = [
  {
    id: "access",
    en: "Access",
    es: "Acceso",
    shots: ["001", "004", "005", "006", "007", "011", "012", "015", "017", "019"],
  },
  {
    id: "preparation",
    en: "Exam preparation",
    es: "Preparación",
    shots: ["023", "026", "028", "029", "032", "033", "034", "038"],
  },
  {
    id: "delivery",
    en: "Exam delivery",
    es: "Examen",
    shots: ["040", "052", "053", "057", "058", "059", "060", "063", "066", "068"],
  },
  {
    id: "results",
    en: "Monitoring & results",
    es: "Monitoreo y resultados",
    shots: [
      "043",
      "044",
      "045",
      "049",
      "051",
      "070",
      "074",
      "075",
      "076",
      "077",
      "078",
      "079",
      "086",
      "090",
      "091",
    ],
  },
];

export function GalleryCarousel({
  slides,
  label,
  previousLabel,
  nextLabel,
  slideLabels,
  locale = "en",
}: {
  slides: readonly GallerySlide[];
  label: string;
  previousLabel: string;
  nextLabel: string;
  slideLabels: readonly string[];
  locale?: "en" | "es";
}) {
  const [filter, setFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLAnchorElement | null>(null);
  const activeSlide = activeIndex === null ? undefined : slides[activeIndex];
  const selectedFlow = flows.find((flow) => flow.id === filter);
  const visibleSlides = selectedFlow
    ? slides.filter((slide) => selectedFlow.shots.includes(slide.id))
    : slides;
  const closeLabel = locale === "es" ? "Cerrar galería" : "Close gallery";
  const enlargeLabel = locale === "es" ? "Ampliar" : "Enlarge";

  function navigate(delta: number) {
    setActiveIndex((index) =>
      index === null ? null : (index + delta + slides.length) % slides.length,
    );
  }

  return (
    <section aria-label={label} className={styles.gallery}>
      <fieldset
        className={styles.filters}
        aria-label={locale === "es" ? "Filtrar pantallas" : "Filter screens"}
      >
        {[{ id: "all", en: "All screens", es: "Todas las pantallas" }, ...flows].map((flow) => (
          <Button
            variant={filter === flow.id ? "default" : "outline"}
            size="sm"
            type="button"
            key={flow.id}
            aria-pressed={filter === flow.id}
            onClick={() => setFilter(flow.id)}
            className={styles.filter}
          >
            {flow[locale]}
          </Button>
        ))}
      </fieldset>
      <p aria-live="polite" className={styles.count}>
        {visibleSlides.length} / {slides.length}
      </p>
      <ul className={styles.grid}>
        {visibleSlides.map((slide) => (
          <li key={slide.id}>
            <figure className={styles.figure}>
              <a
                className={styles.enlarge}
                href={slide.src}
                aria-label={`${enlargeLabel}: ${slide.alt}`}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  triggerRef.current = event.currentTarget;
                  setActiveIndex(slides.indexOf(slide));
                }}
              >
                <Image
                  alt={slide.alt}
                  src={slide.src}
                  width={slide.width}
                  height={slide.height}
                  sizes="(min-width: 52rem) 32rem, 92vw"
                  unoptimized
                  className={styles.image}
                />
                <span className={styles.enlargeHint} aria-hidden="true">
                  ↗
                </span>
              </a>
              <figcaption className={styles.caption}>{slide.alt}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <Dialog
        open={activeIndex !== null}
        onOpenChange={(open) => {
          if (!open) setActiveIndex(null);
        }}
      >
        <DialogContent
          className={styles.dialog}
          closeLabel={closeLabel}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              navigate(event.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          <div className={styles.toolbar}>
            <DialogTitle>{label}</DialogTitle>
            <p aria-live="polite">{activeIndex === null ? "" : slideLabels[activeIndex]}</p>
          </div>
          <DialogDescription aria-live="polite">{activeSlide?.alt}</DialogDescription>
          {activeSlide && (
            <EnlargedImage key={activeSlide.id} slide={activeSlide} locale={locale} />
          )}
          <div className={styles.navigation}>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className={styles.control}
              aria-label={previousLabel}
              onClick={() => navigate(-1)}
            >
              ← {previousLabel}
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className={styles.control}
              aria-label={nextLabel}
              onClick={() => navigate(1)}
            >
              {nextLabel} →
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
