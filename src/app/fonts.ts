import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

/**
 * Defined once and imported where needed: every call to a font loader creates another
 * self-hosted instance. Declared in the root layout, so all three preload on every route.
 */

export const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const display = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const fontClassName = `${sans.variable} ${display.variable} ${mono.variable}`;
