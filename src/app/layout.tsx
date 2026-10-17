import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { defaultLocale } from "@/content/locales";
import { solarTextureVersions } from "@/content/solar-textures";
import { isAssistantEnabled } from "@/features/assistant/application/availability";
import { AssistantHost } from "@/features/assistant/presentation/assistant-host";
import { AmbientField } from "@/features/solar-system/presentation/ambient-field";
import { PageMotion } from "@/shell/page-motion";
import { SiteFooter } from "@/shell/site-footer";
import { SiteHeader } from "@/shell/site-header";
import { layoutMetadata, sharedViewport } from "@/views/metadata";
import { ProfileJsonLd } from "@/views/profile-json-ld";
import { fontClassName } from "./fonts";
import "./globals.css";

export const metadata: Metadata = layoutMetadata(defaultLocale);
export const viewport: Viewport = sharedViewport;

/**
 * One root layout for both languages.
 *
 * Next.js reloads the page when navigating between separate root layouts, so a language switch
 * used to cost a full document load. Sharing a single layout makes it an ordinary client-side
 * navigation instead. The cost is that `<html lang>` is server-rendered as the default locale
 * and corrected on the client; each Spanish page still marks its own content with `lang="es"`
 * in the server HTML, which is what assistive technology actually reads.
 */
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={fontClassName} lang={defaultLocale} suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: this must run before first paint to prevent a theme flash; the content is a fixed literal.
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body>
        <AmbientField textureVersions={solarTextureVersions} />
        <SiteHeader />
        <main id="main">
          <PageMotion>{children}</PageMotion>
        </main>
        <SiteFooter />
        <ProfileJsonLd />
        {isAssistantEnabled(process.env.ASSISTANT_ENABLED) ? <AssistantHost /> : null}
      </body>
    </html>
  );
}
