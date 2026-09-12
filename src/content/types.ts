/**
 * Content types for reviewed, public-safe profile data.
 *
 * Every figure published on this site is a `Metric`, and `Metric.qualifier` is required:
 * it states measurement conditions, or marks the figure as an estimate, or names whose
 * result it is. That requirement is the type system enforcing the editorial rule that a
 * number never appears on its own.
 */

export type Metric = {
  value: string;
  label: string;
  /** Measurement conditions, estimate disclosure, or whose result this is. */
  qualifier: string;
};

export type EvidenceLink = {
  label: string;
  href: string;
  /** Describes the destination for links that leave the site. */
  description?: string;
};

export type Role = {
  slug: string;
  company: string;
  companyHref?: string;
  position: string;
  period: string;
  /** Machine-readable start for ordering and structured data. */
  startedOn: string;
  location: string;
  arrangement: "Remote" | "On-site" | "Hybrid";
  /** One sentence of product or organisational context, before any personal claim. */
  context: string;
  /** What Gonzalo did, separated from the product-scale context above. */
  contributions: string[];
  /** Separates personal contribution from team or platform-wide outcomes. */
  attribution?: string;
  stack: string[];
  metrics?: Metric[];
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  period: string;
  summary: string;
  attribution: string;
  metrics: Metric[];
  stack: string[];
  links: EvidenceLink[];
};

export type StackGroup = {
  id: string;
  name: string;
  /** Where this capability was used, so the list is not an unsupported inventory. */
  evidence: string;
  items: string[];
};

export type Credential = {
  title: string;
  issuer: string;
  date: string;
};

export type Ranking = {
  position: string;
  source: string;
  edition: string;
  href: string;
};
