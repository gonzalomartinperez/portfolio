import type { Metadata } from "next";
import { HomeView } from "@/views/home-view";
import { layoutMetadata } from "@/views/metadata";

const spanishHome = layoutMetadata("es");
const spanishTitle = spanishHome.title as { default: string };

/** The root layout's English metadata does not apply to the Spanish home; its title is absolute so the template does not repeat the name. */
export const metadata: Metadata = { ...spanishHome, title: { absolute: spanishTitle.default } };

export default function Page() {
  return (
    <div lang="es">
      <HomeView locale="es" />
    </div>
  );
}
