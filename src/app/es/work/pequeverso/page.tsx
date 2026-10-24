import type { Metadata } from "next";
import { pageMetadata } from "@/views/metadata";
import { PequeversoView } from "@/views/pequeverso-view";

export const metadata: Metadata = pageMetadata("es", "/work/pequeverso");

export default function Page() {
  return (
    <div lang="es">
      <PequeversoView locale="es" />
    </div>
  );
}
