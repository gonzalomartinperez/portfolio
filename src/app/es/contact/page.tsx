import type { Metadata } from "next";
import { ContactView } from "@/views/contact-view";
import { pageMetadata } from "@/views/metadata";

export const metadata: Metadata = pageMetadata("es", "/contact");

export default function Page() {
  return (
    <div lang="es">
      <ContactView locale="es" />
    </div>
  );
}
