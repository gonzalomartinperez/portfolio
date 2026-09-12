import type { Metadata } from "next";
import { EducationView } from "@/views/education-view";
import { pageMetadata } from "@/views/metadata";

export const metadata: Metadata = pageMetadata("es", "/education");

export default function Page() {
  return <EducationView locale="es" />;
}
