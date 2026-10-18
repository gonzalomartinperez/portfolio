import { defaultLocale } from "@config/locales";
import { getContent } from "@content";
import type { Metadata } from "next";
import { NotFoundView } from "@/views/not-found-view";

const { siteCopy: copy } = getContent(defaultLocale);

export const metadata: Metadata = {
  title: copy.notFound.metaTitle,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView locale={defaultLocale} />;
}
