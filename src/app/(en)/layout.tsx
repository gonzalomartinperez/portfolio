import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { layoutMetadata, sharedViewport } from "@/views/metadata";
import { LocalizedLayout } from "@/views/root-layout";
import "../globals.css";

export const metadata: Metadata = layoutMetadata("en");
export const viewport: Viewport = sharedViewport;

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return <LocalizedLayout locale="en">{children}</LocalizedLayout>;
}
