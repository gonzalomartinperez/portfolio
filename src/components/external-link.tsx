import type { AnchorHTMLAttributes } from "react";
import type { Locale } from "@/content/locales";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  locale: Locale;
};

/** Keep visitors on the portfolio when they inspect a client or evidence site. */
export function ExternalLink({ children, locale, ...props }: Props) {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only">
        {locale === "es" ? " (se abre en una pestaña nueva)" : " (opens in a new tab)"}
      </span>
    </a>
  );
}
