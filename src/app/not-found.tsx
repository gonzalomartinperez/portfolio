import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/content";
import { defaultLocale } from "@/content/locales";

const { siteCopy: copy } = getContent(defaultLocale);

export const metadata: Metadata = {
  title: copy.notFound.metaTitle,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="section frame">
      <p className="eyebrow">{copy.notFound.eyebrow}</p>
      <h1 className="flow-tight">{copy.notFound.title}</h1>
      <p className="lede flow-tight">{copy.notFound.body}</p>
      <div className="actions flow">
        <Link className="button button-primary" href="/">
          {copy.actions.goHome}
        </Link>
        <Link className="button button-secondary" href="/work">
          {copy.actions.seeWork}
        </Link>
      </div>
    </section>
  );
}
