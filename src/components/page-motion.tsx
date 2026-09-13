"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";

export function PageMotion({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const root = container.current;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    if (!pathname || !root || preference.matches) return;
    const animations = new Set<Animation>();
    const animate = (element: Element, keyframes: Keyframe[], duration: number) => {
      const animation = element.animate(keyframes, { duration, easing: "ease-out" });
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    };
    animate(root, [{ opacity: 0.94 }, { opacity: 1 }], 180);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          if (!preference.matches && entry.boundingClientRect.top > 0) {
            animate(
              entry.target,
              [
                { opacity: 0.85, transform: "translateY(8px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              240,
            );
          }
        }
      },
      { threshold: 0.05 },
    );
    root.querySelectorAll("section.section, section.section-tight").forEach((section) => {
      observer.observe(section);
    });
    const cancel = () => {
      observer.disconnect();
      for (const animation of animations) animation.cancel();
      animations.clear();
    };
    preference.addEventListener("change", cancel);
    return () => {
      cancel();
      preference.removeEventListener("change", cancel);
    };
  }, [pathname]);

  return <div ref={container}>{children}</div>;
}
