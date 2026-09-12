import type { Metadata } from "next";
import { pageMetadata } from "@/views/metadata";
import { WorkView } from "@/views/work-view";

export const metadata: Metadata = pageMetadata("es", "/work");

export default function Page() {
  return (
    <div lang="es">
      <WorkView locale="es" />
    </div>
  );
}
