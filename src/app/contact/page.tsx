import type { Metadata } from "next";
import { ContactView } from "@/views/contact-view";
import { pageMetadata } from "@/views/metadata";

export const metadata: Metadata = pageMetadata("en", "/contact");

export default function Page() {
  return <ContactView locale="en" />;
}
