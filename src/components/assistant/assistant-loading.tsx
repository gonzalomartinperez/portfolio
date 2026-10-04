"use client";
import { usePathname } from "next/navigation";
export function AssistantLoading() {
  return (
    <p role="status">
      {usePathname().startsWith("/es") ? "Cargando el asistente…" : "Loading the assistant…"}
    </p>
  );
}
