import type { Metadata } from "next";
import Link from "next/link";
import { PixelPortrait } from "@/components/pixel-portrait";
import { getContent } from "@/content";
import { defaultLocale } from "@/content/locales";
import { LocalizedLayout } from "@/views/root-layout";
import "./globals.css";

/**
 * The global not-found page.
 *
 * Each language group owns its own root layout, so an unmatched URL has no layout to inherit.
 * This file therefore renders the whole document itself, reusing the same shell so a visitor
 * who mistypes a URL still gets the navigation, the footer and a way back.
 */

const { siteCopy: copy } = getContent(defaultLocale);

export const metadata: Metadata = {
  title: copy.notFound.metaTitle,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <LocalizedLayout locale={defaultLocale}>
      <section className="section frame">
        <PixelPortrait size={72} />
        <p className="eyebrow flow-tight">{copy.notFound.eyebrow}</p>
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
    </LocalizedLayout>
  );
}
