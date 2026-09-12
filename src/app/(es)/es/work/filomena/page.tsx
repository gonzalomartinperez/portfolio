import type { Metadata } from "next";
import { FilomenaView } from "@/views/filomena-view";
import { pageMetadata } from "@/views/metadata";

export const metadata: Metadata = pageMetadata("es", "/work/filomena");

export default function Page() {
  return <FilomenaView locale="es" />;
}
