"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { type Locale, localePath } from "@/content/locales";
import { publicTechnologyCatalog } from "@/content/technologies";
import { toolCarouselCopy, toolCarouselIds } from "@/content/tool-carousel-copy";
import { TechnologyMark } from "./technology-mark";
import styles from "./tool-carousel.module.css";

export function ToolCarousel({ locale }: { locale: Locale }) {
  const copy = toolCarouselCopy[locale];
  const id = useId();
  const rail = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const tools = toolCarouselIds.map((toolId) => {
    const tool = publicTechnologyCatalog.find((entry) => entry.id === toolId);
    if (!tool) throw new Error(`Missing carousel technology: ${toolId}`);
    return tool;
  });

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () =>
      setEdges({
        start: element.scrollLeft <= 1,
        end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
      });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, []);

  function move(direction: -1 | 1) {
    const element = rail.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <section
      className={`section-tight frame ${styles.section}`}
      aria-labelledby={`${id}-heading`}
      data-tool-carousel
    >
      <div className={styles.header}>
        <div className="section-head">
          <h2 id={`${id}-heading`}>{copy.heading}</h2>
          <p>{copy.description}</p>
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            aria-label={copy.previous}
            aria-controls={`${id}-rail`}
            disabled={edges.start}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={copy.next}
            aria-controls={`${id}-rail`}
            disabled={edges.end}
            onClick={() => move(1)}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul ref={rail} id={`${id}-rail`} className={styles.rail}>
        {tools.map((tool) => (
          <li key={tool.id}>
            <Link className={styles.tile} href={`${localePath(locale, "/stack")}#tech-${tool.id}`}>
              <span className={styles.mark}>
                <TechnologyMark technology={tool} size={40} />
              </span>
              <span>{tool.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link className={styles.catalogue} href={localePath(locale, "/stack")}>
        {copy.catalogue}
        <span aria-hidden="true"> ↗</span>
      </Link>
    </section>
  );
}
