import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAssistantEnabled } from "@/features/assistant/application/availability";
import { assistantMetadata } from "@/views/metadata";
export const metadata: Metadata = assistantMetadata("es", "Asistente · Gonzalo Martin Perez");
export default function AssistantPage() {
  if (!isAssistantEnabled(process.env.ASSISTANT_ENABLED)) notFound();
  return <h1 className="sr-only">Asistente de Gonzalo</h1>;
}
