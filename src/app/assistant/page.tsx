import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAssistantEnabled } from "@/features/assistant/application/availability";
export const metadata: Metadata = {
  title: "Assistant · Gonzalo Martin Perez",
  robots: { index: false, follow: true },
};
export default function AssistantPage() {
  if (!isAssistantEnabled(process.env.ASSISTANT_ENABLED)) notFound();
  return <h1 className="sr-only">Gonzalo’s assistant</h1>;
}
