"use client";

import { useEffect, useState } from "react";
import styles from "./theme-toggle.module.css";

type Theme = "light" | "dark";

/**
 * Pins an explicit theme, overriding the system preference in either direction.
 *
 * The resolved theme is unknown during server rendering, so the button starts with a neutral
 * label and becomes specific once mounted. That keeps the markup identical on both sides of
 * hydration while still telling the visitor what pressing it will do.
 */
export function ThemeToggle({
  neutralLabel,
  toLightLabel,
  toDarkLabel,
}: {
  neutralLabel: string;
  toLightLabel: string;
  toDarkLabel: string;
}) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      return;
    }
    // No stored choice means dark: the site does not follow the system preference.
    setTheme("dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem("theme", next);
    } catch {
      // A blocked storage API only costs persistence; the theme still applies for this visit.
    }
  };

  const label = theme ? (theme === "light" ? toDarkLabel : toLightLabel) : neutralLabel;

  return (
    <button aria-label={label} className={styles.toggle} onClick={toggle} type="button">
      <svg
        aria-hidden="true"
        className={styles.sun}
        fill="none"
        height="16"
        viewBox="0 0 24 24"
        width="16"
      >
        <circle cx="12" cy="12" fill="currentColor" r="4.2" />
        <g stroke="currentColor" strokeLinecap="round" strokeWidth="1.8">
          <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2" />
          <path d="M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6" />
        </g>
      </svg>
      <svg
        aria-hidden="true"
        className={styles.moon}
        fill="none"
        height="16"
        viewBox="0 0 24 24"
        width="16"
      >
        <path
          d="M20 13.4A8.2 8.2 0 1 1 10.6 4a6.6 6.6 0 0 0 9.4 9.4Z"
          fill="currentColor"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    </button>
  );
}
