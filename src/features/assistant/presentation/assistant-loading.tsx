"use client";
import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./assistant-host.module.css";

export function AssistantLoading() {
  const loading = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => loading.current?.focus(), []);
  return (
    <div ref={loading} className={styles.loading} role="status" tabIndex={-1}>
      <Sparkles aria-hidden="true" />
      <p>{pathname.startsWith("/es") ? "Cargando el asistente…" : "Loading the assistant…"}</p>
    </div>
  );
}
