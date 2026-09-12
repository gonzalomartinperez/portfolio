import type { Metadata } from "next";
import { AboutView } from "@/views/about-view";
import { pageMetadata } from "@/views/metadata";

export const metadata: Metadata = pageMetadata("en", "/about");

export default function Page() {
  return <AboutView locale="en" />;
}
