import type { Metadata } from "next";
import { pageMetadata } from "@/views/metadata";
import { WorkView } from "@/views/work-view";

export const metadata: Metadata = pageMetadata("en", "/work");

export default function Page() {
  return <WorkView locale="en" />;
}
