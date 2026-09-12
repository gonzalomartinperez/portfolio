import type { Metadata } from "next";
import { pageMetadata } from "@/views/metadata";
import { StackView } from "@/views/stack-view";

export const metadata: Metadata = pageMetadata("en", "/stack");

export default function Page() {
  return <StackView locale="en" />;
}
