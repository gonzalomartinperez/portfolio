import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Assistant · Gonzalo Martin Perez",
  robots: { index: false, follow: true },
};
export default function AssistantPage() {
  return <h1 className="sr-only">Gonzalo’s assistant</h1>;
}
