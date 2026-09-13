"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./gallery-carousel.module.css";

export type GallerySlide = { id: string; src: string; alt: string; width: number; height: number };
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLAnchorElement | null>(null);
  const activeSlide = activeIndex === null ? undefined : slides[activeIndex];
  const selectedFlow = flows.find((flow) => flow.id === filter);
  const visibleSlides = selectedFlow
    ? slides.filter((slide) => selectedFlow.shots.includes(slide.id))
    : slides;
  const closeLabel = locale === "es" ? "Cerrar galería" : "Close gallery";
  const enlargeLabel = locale === "es" ? "Ampliar" : "Enlarge";

  useEffect(() => {
    if (activeIndex === null) return;
    const dialog = dialogRef.current;
    if (!dialog?.open) dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

  function finishClose() {
    setActiveIndex(null);
    triggerRef.current?.focus();
  }
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
          <button
            type="button"
            key={flow.id}
            aria-pressed={filter === flow.id}
            onClick={() => setFilter(flow.id)}
            className={styles.filter}
          >
            {flow[locale]}
          </button>
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
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={label}
        onClose={finishClose}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            navigate(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        <div className={styles.toolbar}>
          <p aria-live="polite">{activeIndex === null ? "" : slideLabels[activeIndex]}</p>
          <button
            type="button"
            className={styles.control}
            onClick={() => dialogRef.current?.close()}
          >
            {closeLabel} <span aria-hidden="true">×</span>
          </button>
        </div>
        {activeSlide && (
          <figure className={styles.fullFigure}>
            <Image
              alt={activeSlide.alt}
              src={activeSlide.src}
              width={activeSlide.width}
              height={activeSlide.height}
              sizes="96vw"
              unoptimized
              className={styles.fullImage}
            />
            <figcaption aria-live="polite" className={styles.caption}>
              {activeSlide.alt}
            </figcaption>
          </figure>
        )}
        <div className={styles.navigation}>
          <button
            type="button"
            className={styles.control}
            aria-label={previousLabel}
            onClick={() => navigate(-1)}
          >
            ← {previousLabel}
          </button>
          <button
            type="button"
            className={styles.control}
            aria-label={nextLabel}
            onClick={() => navigate(1)}
          >
            {nextLabel} →
          </button>
        </div>
      </dialog>
    </section>
  );
}
