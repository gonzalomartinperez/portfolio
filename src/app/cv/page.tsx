import type { Metadata } from "next";
import { CvView } from "@/views/cv-view";
import { pageMetadata } from "@/views/metadata";

export const metadata: Metadata = pageMetadata("en", "/cv");

export default function Page() {
  return <CvView locale="en" />;
}
