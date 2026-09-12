"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./gallery-carousel.module.css";

export type GallerySlide = {
  id: string;
  src: string;
  alt: string;
};

/**
 * A scroll-snapping gallery.
 *
 * The track is a real scroll container, so touch, trackpad, arrow keys and screen-reader
 * navigation all work before any of this component's JavaScript runs. The buttons and the
 * counter are conveniences layered on top, and the current slide is derived from scroll
 * position rather than driving it — the browser stays the source of truth.
 *
 * There is no autoplay, which is what keeps it clear of WCAG 2.2 SC 2.2.2 entirely.
 */
export function GalleryCarousel({
  slides,
  label,
  previousLabel,
  nextLabel,
  slideLabels,
}: {
  slides: readonly GallerySlide[];
  label: string;
  previousLabel: string;
  nextLabel: string;
  /** One formatted label per slide, resolved on the server: functions cannot cross this boundary. */
  slideLabels: readonly string[];
}) {
  const trackRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);

  const syncIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.scrollWidth / slides.length;
    setIndex(Math.min(slides.length - 1, Math.round(track.scrollLeft / slideWidth)));
  }, [slides.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncIndex);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, [syncIndex]);

  const go = (delta: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.min(slides.length - 1, Math.max(0, index + delta));
    track.scrollTo({ left: (track.scrollWidth / slides.length) * target, behavior: "smooth" });
  };

  return (
    <section aria-roledescription="carousel" aria-label={label} className={styles.carousel}>
      {/* A focusable, labelled scroll region: the browser then handles arrow keys, touch and
          trackpad for free, and the list keeps its own semantics inside. */}
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be reachable by keyboard (WCAG 2.1.1), and a labelled region with tabindex is the documented way; the rule does not model scroll containers. */}
      <section aria-label={label} className={styles.track} ref={trackRef} tabIndex={0}>
        <ul className={styles.rail}>
          {slides.map((slide, position) => (
            <li
              aria-label={slideLabels[position]}
              aria-roledescription="slide"
              className={styles.slide}
              key={slide.id}
            >
              <Image
                alt={slide.alt}
                className={styles.image}
                height={720}
                loading={position < 2 ? "eager" : "lazy"}
                sizes="(min-width: 60rem) 56rem, 92vw"
                src={slide.src}
                unoptimized
                width={1600}
              />
              <p className={styles.caption}>{slide.alt}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.controls}>
        <button
          aria-label={previousLabel}
          className={styles.button}
          disabled={index === 0}
          onClick={() => go(-1)}
          type="button"
        >
          <span aria-hidden="true">←</span>
        </button>
        <p aria-live="polite" className={styles.counter}>
          {slideLabels[index]}
        </p>
        <button
          aria-label={nextLabel}
          className={styles.button}
          disabled={index === slides.length - 1}
          onClick={() => go(1)}
          type="button"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
