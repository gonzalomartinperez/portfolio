import type { Locale } from "@config/locales";
import type { EvalCase } from "@content/types";
import { ExternalLink } from "@/shared/navigation/external-link";

/** A real case from a public eval bank: question, expected result, pass rule and source. */
export function EvalCaseBlock({
  evalCase,
  id,
  locale,
  className,
  headingLevel: Heading = "h4",
}: {
  evalCase: EvalCase;
  id: string;
  locale: Locale;
  className?: string;
  headingLevel?: "h3" | "h4";
}) {
  return (
    <section className={className} aria-labelledby={id}>
      <Heading className="eyebrow" id={id}>
        {evalCase.heading}
      </Heading>
      <dl>
        <dt>{evalCase.questionLabel}</dt>
        <dd className="muted">{evalCase.question}</dd>
        <dt>{evalCase.expectedLabel}</dt>
        <dd className="muted">{evalCase.expected}</dd>
        <dt>{evalCase.criterionLabel}</dt>
        <dd className="muted">{evalCase.criterion}</dd>
      </dl>
      <ExternalLink className="text-link" href={evalCase.href} locale={locale}>
        {evalCase.linkLabel}
      </ExternalLink>
    </section>
  );
}
