import type { Metadata } from "next";
import { pageMetadata } from "@/views/metadata";
import { PequeversoView } from "@/views/pequeverso-view";

export const metadata: Metadata = pageMetadata("en", "/work/pequeverso");

export default function Page() {
  return <PequeversoView locale="en" />;
}
