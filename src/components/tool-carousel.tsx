"use client";

import type { gsap } from "gsap";
import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { type Locale, localePath } from "@/content/locales";
import {
  compareTechnologyNames,
  publicTechnologyCatalog,
  type Technology,
  technologyGroups,
} from "@/content/technologies";
import { toolCarouselCopy } from "@/content/tool-carousel-copy";
import { usePageMotionPaused } from "./motion-state";
import { TechnologyMark } from "./technology-mark";
import styles from "./tool-carousel.module.css";

const rows: Technology[][] = [[], []];
for (const group of technologyGroups) {
  const tools = publicTechnologyCatalog
    .filter((technology) => technology.category === group.id)
    .sort(compareTechnologyNames);
  rows[rows[0].length <= rows[1].length ? 0 : 1].push(...tools);
}

function TechnologyRow({
  tools,
  locale,
  direction,
  paused,
  animated,
  label,
}: {
  tools: Technology[];
  locale: Locale;
  direction: -1 | 1;
  paused: boolean;
  animated: boolean;
  label: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLUListElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const canRun = useRef(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [touched, setTouched] = useState(false);
  const running = animated && visible && !hidden && !paused && !hovered && !touched;

  useEffect(() => {
    canRun.current = running;
    if (running) tween.current?.resume();
    else tween.current?.pause();
  }, [running]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(element);
    const updateVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    updateVisibility();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const element = viewport.current;
    const list = rail.current;
    if (!animated || !element || !list || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let disposed = false;
    let observer: ResizeObserver | undefined;
    let reset: (() => void) | undefined;
    void import("gsap").then(({ gsap }) => {
      if (disposed) return;
      const items = Array.from(list.children).filter(
        (item): item is HTMLElement => item instanceof HTMLElement,
      );
      const measure = () => {
        const progress = tween.current?.progress() ?? 0;
        tween.current?.kill();
        gsap.set(items, { x: 0 });
        const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
        const width = list.scrollWidth + gap;
        const positions = new Map(
          items.map((item) => [item, { left: item.offsetLeft, width: item.offsetWidth }]),
        );
        const speed = matchMedia("(max-width: 640px)").matches ? 18 : 24;
        tween.current = gsap.to(items, {
          x: direction * width,
          duration: width / speed,
          ease: "none",
          repeat: -1,
          paused: true,
          modifiers: {
            x: (value: string, target: HTMLElement) => {
              const position = positions.get(target);
              if (!position) return value;
              const start = -position.left - position.width - gap;
              return `${gsap.utils.wrap(start, start + width, Number.parseFloat(value))}px`;
            },
          },
        });
        tween.current.progress(progress);
        if (canRun.current) tween.current.resume();
      };
      measure();
      observer = new ResizeObserver(measure);
      observer.observe(element);
      reset = () => gsap.set(items, { clearProps: "transform" });
    });
    return () => {
      disposed = true;
      observer?.disconnect();
      tween.current?.kill();
      tween.current = null;
      reset?.();
    };
  }, [animated, direction]);

  return (
    <div
      ref={viewport}
      className={styles.viewport}
      data-tool-row
      data-direction={direction === -1 ? "left" : "right"}
      data-motion={animated ? (running ? "running" : "paused") : "static"}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
        setTouched(false);
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") setTouched(true);
      }}
      onPointerUp={() => setTouched(false)}
      onPointerCancel={() => setTouched(false)}
    >
      <ul ref={rail} className={styles.rail} aria-label={label}>
        {tools.map((tool) => (
          <li key={tool.id} data-tool-id={tool.id} data-category={tool.category}>
            <Link className={styles.tile} href={`${localePath(locale, "/stack")}#tech-${tool.id}`}>
              <span className={styles.mark}>
                <TechnologyMark technology={tool} size={32} />
              </span>
              <span>{tool.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ToolCarousel({ locale }: { locale: Locale }) {
  const copy = toolCarouselCopy[locale];
  const id = useId();
  const section = useRef<HTMLElement>(null);
  const globalPaused = usePageMotionPaused();
  const [localPaused, setLocalPaused] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(true);
  const [keyboardGrid, setKeyboardGrid] = useState(false);
  const keyboardInput = useRef(false);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(!preference.matches);
    update();
    preference.addEventListener("change", update);
    const trackKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Tab") keyboardInput.current = true;
    };
    const trackPointer = () => {
      keyboardInput.current = false;
    };
    document.addEventListener("keydown", trackKeyboard);
    document.addEventListener("pointerdown", trackPointer);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("keydown", trackKeyboard);
      document.removeEventListener("pointerdown", trackPointer);
    };
  }, []);

  useEffect(() => {
    if (!keyboardGrid) return;
    const frame = requestAnimationFrame(() => {
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && section.current?.contains(focused)) {
        focused.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [keyboardGrid]);

  return (
    <section
      ref={section}
      className={`section-tight frame ${styles.section}`}
      aria-labelledby={`${id}-heading`}
      data-tool-carousel
      data-animated={motionAllowed && !keyboardGrid}
      onFocusCapture={(event) => {
        if (
          event.target.closest("[data-tool-row]") &&
          (keyboardInput.current || event.target.matches(":focus-visible"))
        ) {
          setKeyboardGrid(true);
        }
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardGrid(false);
      }}
    >
      <noscript>
        <style>{`
          .${styles.section}[data-animated="true"] .${styles.viewport} { overflow: visible; mask-image: none; }
          .${styles.section}[data-animated="true"] .${styles.rail} { display: grid; width: auto; }
          .${styles.section}[data-animated="true"] .${styles.rail} li { width: auto; will-change: auto; }
          .${styles.control} { display: none; }
        `}</style>
      </noscript>
      <div className={styles.header}>
        <div className="section-head">
          <h2 id={`${id}-heading`}>{copy.heading}</h2>
          <p>{copy.description}</p>
        </div>
        {motionAllowed && (
          <button
            type="button"
            className={styles.control}
            aria-label={localPaused ? copy.resume : copy.pause}
            aria-pressed={localPaused}
            aria-controls={`${id}-rows`}
            onClick={() => setLocalPaused((value) => !value)}
          >
            {localPaused ? (
              <Play size={18} aria-hidden="true" />
            ) : (
              <Pause size={18} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      <div id={`${id}-rows`} className={styles.rows}>
        {rows.map((tools, index) => (
          <TechnologyRow
            key={index === 0 ? "left" : "right"}
            tools={tools}
            locale={locale}
            direction={index === 0 ? -1 : 1}
            paused={localPaused || globalPaused}
            animated={motionAllowed && !keyboardGrid}
            label={`${copy.row} ${index + 1}`}
          />
        ))}
      </div>
      <Link className={styles.catalogue} href={localePath(locale, "/stack")}>
        {copy.catalogue}
        <span aria-hidden="true"> ↗</span>
      </Link>
    </section>
  );
}
