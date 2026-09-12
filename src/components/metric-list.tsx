import type { Metric } from "@/content/types";

/** Renders figures with their qualifier. The qualifier is never optional — see content/types.ts. */
export function MetricList({ metrics }: { metrics: readonly Metric[] }) {
  return (
    <ul className="metric-grid">
      {metrics.map((metric) => (
        <li key={`${metric.value}-${metric.label}`}>
          <p className="metric-value">{metric.value}</p>
          <span className="metric-label">{metric.label}</span>
          <p className="metric-qualifier">{metric.qualifier}</p>
        </li>
      ))}
    </ul>
  );
}
