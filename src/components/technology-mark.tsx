import type { Technology } from "@/content/technologies";
import { BrandMark } from "./brand-mark";
import styles from "./technology-mark.module.css";

const illustrations = {
  agent: "M8 7V5a4 4 0 0 1 8 0v2M5 7h14v12H5ZM9 11h.01M15 11h.01M9 15h6M2 11v4M22 11v4",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM15 15l6 6M7 8h6M7 11h4",
  database: "M3 5c0-4 18-4 18 0s-18 4-18 0ZM3 5v7c0 4 18 4 18 0V5M3 12v7c0 4 18 4 18 0v-7",
  network:
    "M9 9h6v6H9ZM2 2h4v4H2ZM18 2h4v4h-4ZM2 18h4v4H2ZM18 18h4v4h-4ZM6 6l3 3M15 9l3-3M6 18l3-3M15 15l3 3",
  code: "m8 5-6 7 6 7M16 5l6 7-6 7M14 3l-4 18",
  layers: "m12 2 10 5-10 5L2 7ZM2 12l10 5 10-5M2 17l10 5 10-5",
  screen: "M2 3h20v15H2ZM8 22h8M12 18v4M2 7h20",
  cloud: "M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13-2 6 6 0 0 1 0 12ZM9 13l3-3 3 3M12 10v11",
  shield: "m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6ZM8 12l3 3 5-6",
  test: "M8 2h8M9 2v7L3 19q-1 3 3 3h12q4 0 3-3L15 9V2M7 15h10",
  chart: "M3 2v19h19M7 16l4-6 4 3 6-9",
  flow: "M2 3h7v6H2ZM15 15h7v6h-7ZM9 6h9v9M5 9v9h10M15 12l3 3 3-3",
  chain: "m9 14 6-4M10 6l3-2a5 5 0 0 1 6 8l-3 2M14 18l-3 2a5 5 0 0 1-6-8l3-2",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM12 6v6l4 3",
  message: "M2 3h20v14H9l-5 4v-4H2ZM6 7h12M6 11h8",
  document: "M5 2h9l5 5v15H5ZM14 2v6h5M8 12h8M8 16h8",
} as const;

type Illustration = keyof typeof illustrations;

const categoryIllustrations: Record<string, Illustration> = {
  "applied-ai": "agent",
  backend: "network",
  languages: "code",
  frontend: "screen",
  data: "layers",
  cloud: "cloud",
  quality: "shield",
  delivery: "flow",
  fintech: "chain",
};

const specificIllustrations: Record<string, Illustration> = {
  rag: "search",
  "vector-databases": "database",
  pgvector: "database",
  guardrails: "shield",
  sql: "database",
  "sql-tuning": "database",
  indexing: "database",
  caching: "clock",
  "data-modelling": "database",
  "api-design": "network",
  "rest-apis": "network",
  "amazon-api-gateway": "network",
  "amazon-sqs": "flow",
  "amazon-cloudwatch": "chart",
  "event-driven-architecture": "flow",
  "reactive-systems": "flow",
  "responsive-design": "screen",
  "single-spa": "screen",
  microfrontends: "layers",
  mockito: "test",
  karate: "test",
  testcontainers: "test",
  micrometer: "chart",
  "structured-logging": "document",
  rbac: "shield",
  ldap: "shield",
  "microsoft-teams": "message",
  "technical-documentation": "document",
  "code-review": "code",
  "spec-driven-development": "document",
};

export function TechnologyMark({
  technology,
  size = 24,
}: {
  technology: Pick<Technology, "icon" | "category" | "id">;
  size?: number;
}) {
  if (technology.icon) return <BrandMark name={technology.icon} size={size} />;

  const illustration =
    specificIllustrations[technology.id] ?? categoryIllustrations[technology.category] ?? "code";

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-representation="illustration"
      className={styles.illustration}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={illustrations[illustration]} />
    </svg>
  );
}
