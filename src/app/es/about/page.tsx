import type { Metadata } from "next";
import { AboutView } from "@/views/about-view";
import { pageMetadata } from "@/views/metadata";

export const metadata: Metadata = pageMetadata("es", "/about");

export default function Page() {
  return (
    <div lang="es">
      <AboutView locale="es" />
    </div>
  );
}
