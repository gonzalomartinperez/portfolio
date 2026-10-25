import type { Technology } from "@content/technologies";

/**
 * Lucide icon names drawn for technologies without a brand mark. Each name is a symbol id in
 * `public/technology-illustrations.svg`; run `node tools/technology-illustrations.mjs --write`
 * after changing these maps so the sprite gains or drops the matching symbol.
 */
const categoryIllustrations: Record<string, string> = {
  "applied-ai": "bot",
  backend: "network",
  languages: "code-xml",
  frontend: "panels-top-left",
  data: "database",
  cloud: "cloud",
  quality: "shield-check",
  delivery: "workflow",
  fintech: "circle-dollar-sign",
};

const specificIllustrations: Record<string, string> = {
  "ai-chains": "workflow",
  "ai-testing": "file-check-2",
  embeddings: "network",
  chunking: "blocks",
  "prompt-engineering": "sliders-horizontal",
  "context-engineering": "layers",
  "fine-tuning": "sliders-horizontal",
  llmops: "activity",
  "server-sent-events": "send",
  "transaction-idempotency": "repeat-2",
  "transaction-reconciliation": "git-compare-arrows",
  "quote-aggregation-routing": "route",
  "transaction-signing": "signature",
  graphrag: "network",
  "llm-provider-fallback": "git-branch",
  "agent-harness": "sliders-horizontal",
  "product-analytics": "chart-no-axes-combined",
  "cross-chain-bridges": "git-compare-arrows",
  "fiat-on-ramp": "arrow-down-to-line",
  "fiat-off-ramp": "arrow-up-from-line",
  "agent-evaluation": "badge-check",
  reranking: "list-filter",
  "conversational-memory": "messages-square",
  "structured-outputs": "file-json",
  "prompt-injection-defenses": "shield-off",
  rag: "search",
  "ai-agents": "bot",
  "llm-integration": "sparkles",
  "vector-databases": "database",
  guardrails: "shield-check",
  "agentic-engineering": "workflow",
  "spec-driven-development": "file-check-2",
  pgvector: "database",
  alembic: "git-compare-arrows",
  sql: "database",
  webhooks: "webhook",
  "async-processing": "timer",
  "rest-apis": "braces",
  microservices: "boxes",
  "api-design": "braces",
  "system-design": "network",
  "distributed-systems": "network",
  "clean-architecture": "blocks",
  "hexagonal-architecture": "hexagon",
  "layered-architecture": "layers",
  mvc: "panels-top-left",
  "event-driven-architecture": "workflow",
  "reactive-systems": "activity",
  "sql-tuning": "gauge",
  indexing: "list-filter",
  caching: "timer",
  "data-modelling": "database",
  "design-systems": "blocks",
  microfrontends: "panels-top-left",
  "server-side-rendering": "panels-top-left",
  serverless: "cloud",
  "reverse-proxy": "route",
  "structured-logging": "file-text",
  rbac: "key-round",
  "end-to-end-encryption": "lock-keyhole",
  ldap: "fingerprint",
  "application-security": "shield-check",
  "input-validation": "file-check-2",
  agile: "repeat-2",
  scrum: "list-todo",
  kanban: "square-kanban",
  "technical-documentation": "book-open",
  "code-review": "git-pull-request",
  "token-swaps": "arrow-left-right",
  vaults: "vault",
  "protocol-integrations": "network",
  "perpetual-futures": "chart-no-axes-combined",
  "non-custodial-wallets": "wallet",
  "user-authorization": "key-round",
  "transaction-execution": "activity",
  defi: "circle-dollar-sign",
};

const fallbackIllustration = "code-xml";

export const technologyIllustrationSprite = "/technology-illustrations.svg";

export const technologyIllustrationNames = [
  ...new Set([
    ...Object.values(categoryIllustrations),
    ...Object.values(specificIllustrations),
    fallbackIllustration,
  ]),
].sort();

export function getTechnologyIllustration(technology: Pick<Technology, "category" | "id">) {
  return (
    specificIllustrations[technology.id] ??
    categoryIllustrations[technology.category] ??
    fallbackIllustration
  );
}
