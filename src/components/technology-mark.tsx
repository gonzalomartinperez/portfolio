import {
  Activity,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  BadgeCheck,
  Blocks,
  BookOpen,
  Bot,
  Boxes,
  Braces,
  ChartNoAxesCombined,
  CircleDollarSign,
  Cloud,
  CodeXml,
  Database,
  FileCheck2,
  FileJson,
  FileText,
  Fingerprint,
  Gauge,
  GitBranch,
  GitCompareArrows,
  GitPullRequest,
  KeyRound,
  Layers,
  ListFilter,
  ListTodo,
  LockKeyhole,
  type LucideIcon,
  MessagesSquare,
  Network,
  PanelsTopLeft,
  Repeat2,
  Route,
  Search,
  Send,
  ShieldCheck,
  ShieldOff,
  Signature,
  SlidersHorizontal,
  Sparkles,
  SquareKanban,
  Timer,
  Vault,
  Wallet,
  Webhook,
  Workflow,
} from "lucide-react";
import type { Technology } from "@/content/technologies";
import { BrandMark } from "./brand-mark";
import styles from "./technology-mark.module.css";

const categoryIllustrations: Record<string, LucideIcon> = {
  "applied-ai": Bot,
  backend: Network,
  languages: CodeXml,
  frontend: PanelsTopLeft,
  data: Database,
  cloud: Cloud,
  quality: ShieldCheck,
  delivery: Workflow,
  fintech: CircleDollarSign,
};

const specificIllustrations: Record<string, LucideIcon> = {
  "ai-chains": Workflow,
  "ai-testing": FileCheck2,
  embeddings: Network,
  chunking: Blocks,
  "prompt-engineering": SlidersHorizontal,
  "context-engineering": Layers,
  "fine-tuning": SlidersHorizontal,
  llmops: Activity,
  "server-sent-events": Send,
  "transaction-idempotency": Repeat2,
  "transaction-reconciliation": GitCompareArrows,
  "quote-aggregation-routing": Route,
  "transaction-signing": Signature,
  graphrag: Network,
  "llm-provider-fallback": GitBranch,
  "agent-harness": SlidersHorizontal,
  "product-analytics": ChartNoAxesCombined,
  "cross-chain-bridges": GitCompareArrows,
  "fiat-on-ramp": ArrowDownToLine,
  "fiat-off-ramp": ArrowUpFromLine,
  "agent-evaluation": BadgeCheck,
  reranking: ListFilter,
  "conversational-memory": MessagesSquare,
  "structured-outputs": FileJson,
  "prompt-injection-defenses": ShieldOff,
  rag: Search,
  "ai-agents": Bot,
  "llm-integration": Sparkles,
  "vector-databases": Database,
  guardrails: ShieldCheck,
  "agentic-engineering": Workflow,
  "spec-driven-development": FileCheck2,
  pgvector: Database,
  alembic: GitCompareArrows,
  sql: Database,
  webhooks: Webhook,
  "async-processing": Timer,
  "rest-apis": Braces,
  microservices: Boxes,
  "api-design": Braces,
  "system-design": Network,
  "distributed-systems": Network,
  "hexagonal-architecture": Blocks,
  "layered-architecture": Layers,
  mvc: PanelsTopLeft,
  "event-driven-architecture": Workflow,
  "reactive-systems": Activity,
  "sql-tuning": Gauge,
  indexing: ListFilter,
  caching: Timer,
  "data-modelling": Database,
  "design-systems": Blocks,
  microfrontends: PanelsTopLeft,
  "server-side-rendering": PanelsTopLeft,
  serverless: Cloud,
  "reverse-proxy": Route,
  "structured-logging": FileText,
  rbac: KeyRound,
  "end-to-end-encryption": LockKeyhole,
  ldap: Fingerprint,
  "application-security": ShieldCheck,
  "input-validation": FileCheck2,
  agile: Repeat2,
  scrum: ListTodo,
  kanban: SquareKanban,
  "technical-documentation": BookOpen,
  "code-review": GitPullRequest,
  "token-swaps": ArrowLeftRight,
  vaults: Vault,
  "protocol-integrations": Network,
  "perpetual-futures": ChartNoAxesCombined,
  "non-custodial-wallets": Wallet,
  "user-authorization": KeyRound,
  "transaction-execution": Activity,
  defi: CircleDollarSign,
};

export function TechnologyMark({
  technology,
  size = 24,
}: {
  technology: Pick<Technology, "icon" | "category" | "id">;
  size?: number;
}) {
  if (technology.icon) return <BrandMark name={technology.icon} size={size} />;

  const Icon =
    specificIllustrations[technology.id] ?? categoryIllustrations[technology.category] ?? CodeXml;

  return (
    <Icon
      aria-hidden="true"
      focusable="false"
      data-representation="illustration"
      className={styles.illustration}
      size={size}
      strokeWidth={1.5}
    />
  );
}
