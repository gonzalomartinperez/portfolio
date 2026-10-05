import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Asistente · Gonzalo Martin Perez",
  robots: { index: false, follow: true },
};
export default function AssistantPage() {
  return <h1 className="sr-only">Asistente de Gonzalo</h1>;
}
