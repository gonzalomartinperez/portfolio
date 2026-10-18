"use client";

import type { Locale } from "@config/locales";
import dynamic from "next/dynamic";
import type { ArchitectureKind } from "../domain/architecture-types";
import styles from "./experience-architecture.module.css";

const DiagramCanvas = dynamic(() => import("./experience-architecture-canvas"), {
  ssr: false,
  loading: () => <div className={styles.loading} aria-hidden="true" />,
});

export function ArchitectureCanvasLoader({
  kind,
  locale,
}: {
  kind: ArchitectureKind;
  locale: Locale;
}) {
  return <DiagramCanvas kind={kind} locale={locale} />;
}
