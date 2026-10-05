import type { Locale } from "@/content/locales";
import type { ArchitectureKind } from "./experience-architecture";

export type Point = { x: number; y: number };
export type ArchitectureStep = {
  id: string;
  title: string;
  detail: string;
  tier: "surface" | "gateway" | "service";
};
export type ArchitectureGroup = {
  id: string;
  title: string;
  detail?: string;
  position: Point;
  width: number;
  height: number;
  deployment?: boolean;
};
export type Connection = {
  source: string;
  target: string;
  bidirectional?: boolean;
  containment?: boolean;
};
type EnterpriseKind = Exclude<ArchitectureKind, "filomena">;

const translated = (locale: Locale, en: string, es: string) => (locale === "es" ? es : en);
export function enterpriseSteps(kind: EnterpriseKind, locale: Locale): ArchitectureStep[] {
  const t = (en: string, es: string) => translated(locale, en, es);
  const step = (
    id: string,
    title: string,
    detail: string,
    tier: ArchitectureStep["tier"] = "service",
  ) => ({ id, title, detail, tier });
  if (kind === "rampy")
    return [
      step("web", t("Web frontend", "Frontend web"), "React · Next.js", "surface"),
      step("mobile", t("Mobile app", "App móvil"), "React Native · Kotlin · Swift", "surface"),
      step(
        "backoffice",
        "Backoffice web",
        t("Management · monitoring · telemetry", "Gestión · monitoreo · telemetría"),
        "surface",
      ),
      step(
        "backend",
        t("APIs and use cases", "APIs y casos de uso"),
        "Python · FastAPI",
        "gateway",
      ),
      step(
        "auth",
        t("Authentication service", "Servicio de autenticación"),
        t("Login and identity", "Acceso e identidad"),
      ),
      step(
        "wallets",
        t("Wallet service", "Servicio de wallets"),
        t("Wallet management", "Gestión de wallets"),
      ),
      step(
        "backoffice-api",
        t("Backoffice services", "Servicios de backoffice"),
        t("Management · status · telemetry", "Gestión · estado · telemetría"),
      ),
      step(
        "ai",
        t("Harness and orchestration", "Harness y orquestación"),
        "Agno · LangChain · LangGraph",
        "gateway",
      ),
      step("graph", "GraphRAG", t("Knowledge retrieval", "Recuperación de conocimiento")),
      step(
        "defi",
        t("DeFi / blockchain services", "Servicios DeFi / blockchain"),
        t("Protocol integrations", "Integraciones de protocolos"),
      ),
      step(
        "privy",
        "Privy",
        t("External identity and wallets", "Identidad y wallets externas"),
        "gateway",
      ),
      step("vector", "PostgreSQL · pgvector", t("Vector retrieval", "Recuperación vectorial")),
      step("memory", "Mem0", t("Contextual memory", "Memoria contextual")),
      step("neo4j", "Neo4j", t("Knowledge graph", "Grafo de conocimiento")),
      step("vertex", "Vertex AI", t("Model provider", "Proveedor de modelos")),
      step("deepinfra", "DeepInfra", t("Model provider", "Proveedor de modelos")),
      step("openai", "OpenAI API", t("Model provider", "Proveedor de modelos")),
      step("lending", t("Lending and vaults", "Lending y vaults"), "Aave · Morpho · Compound"),
      step("swaps", "Swaps", "LI.FI"),
      step("perps", t("Perpetuals", "Perpetuos"), "Hyperliquid"),
    ];
  if (kind === "teamcubation")
    return [
      step("portal", t("Web frontend", "Frontend web"), "React · Single-SPA", "surface"),
      step("gateway", "API Gateway", t("Portal access", "Acceso del portal"), "gateway"),
      step("bff", "BFF", "Spring WebFlux", "gateway"),
      step("java", t("Microservices", "Microservicios"), "Java · Spring Boot"),
      step("node", t("Microservices", "Microservicios"), "Node.js · NestJS"),
      step("java-db", "PostgreSQL", t("Java service data", "Datos del servicio Java")),
      step("node-db", "PostgreSQL", t("Node.js service data", "Datos del servicio Node.js")),
      step("source", "Amazon S3", t("Promotion files", "Archivos de promociones"), "surface"),
      step("sqs", "Amazon SQS", t("Bulk ingestion queue", "Cola de ingesta masiva"), "gateway"),
      step("lambda", t("Ingestion Lambda", "Lambda de ingesta"), "Python · FastAPI"),
      step(
        "agent",
        t("Promotion Assistance System", "Sistema de asistencia de promociones"),
        "LangChain · LangGraph · OpenAI API",
        "gateway",
      ),
      step(
        "harness",
        "Agent harness",
        t("Orchestration · evaluations · guardrails", "Orquestación · evaluaciones · guardrails"),
      ),
      step(
        "graph",
        "GraphRAG",
        t("Enterprise policies · promotions", "Políticas empresariales · promociones"),
      ),
      step("neo4j", "Neo4j", t("Knowledge graph", "Grafo de conocimiento")),
      step("cloudwatch", "Amazon CloudWatch", t("Observability", "Observabilidad"), "surface"),
    ];
  return [
    step(
      "web",
      t("Web frontend / Backoffice", "Frontend web / Backoffice"),
      "React · Next.js",
      "surface",
    ),
    step("bff", "BFF", "Python · FastAPI · OpenAPI / Swagger", "gateway"),
    step("java", t("Microservices", "Microservicios"), "Java · Spring Boot"),
    step("node", t("Microservices", "Microservicios"), "Node.js · NestJS"),
    step("php", t("Services", "Servicios"), "PHP"),
  ];
}

export const enterpriseConnections: Record<EnterpriseKind, Connection[]> = {
  rampy: [
    { source: "backoffice", target: "web", containment: true },
    { source: "web", target: "backend" },
    { source: "mobile", target: "backend" },
    { source: "backend", target: "backoffice-api" },
    { source: "backend", target: "agentic-group" },
    { source: "backend", target: "defi" },
    { source: "backend-group", target: "privy", bidirectional: true },
    { source: "agentic-group", target: "data-group", bidirectional: true },
    { source: "agentic-group", target: "models-group", bidirectional: true },
    { source: "defi", target: "protocols-group", bidirectional: true },
  ],
  teamcubation: [
    { source: "portal", target: "gateway" },
    { source: "gateway", target: "bff" },
    { source: "bff", target: "java" },
    { source: "bff", target: "node" },
    { source: "source", target: "sqs" },
    { source: "sqs", target: "lambda" },
    { source: "lambda", target: "java" },
    { source: "lambda", target: "node" },
    { source: "java", target: "java-db" },
    { source: "node", target: "node-db" },
    { source: "bff", target: "agent" },
    { source: "agent", target: "harness" },
    { source: "harness", target: "graph" },
    { source: "graph", target: "neo4j" },
  ],
  "cooperativa-obrera": [
    { source: "web", target: "bff" },
    { source: "bff", target: "java" },
    { source: "bff", target: "node" },
    { source: "bff", target: "php" },
  ],
};

export function enterpriseLayout(kind: EnterpriseKind, vertical: boolean, locale: Locale) {
  const t = (en: string, es: string) => translated(locale, en, es);
  const groups: ArchitectureGroup[] = [];
  const positions: Record<string, Point> = {};
  const place = (ids: string[], x: number, y: number, dx = 0, dy = 180) =>
    ids.forEach((id, index) => {
      positions[id] = { x: x + index * dx, y: y + index * dy };
    });
  const group = (
    id: string,
    title: string,
    x: number,
    y: number,
    width: number,
    height: number,
    detail?: string,
    deployment = false,
  ) => groups.push({ id, title, detail, position: { x, y }, width, height, deployment });
  if (kind === "rampy") {
    if (vertical) {
      place(["web", "backoffice"], 24, 245, 184, 0);
      place(["mobile"], 208, 0);
      place(["backend"], 116, 460);
      place(["auth", "wallets"], 24, 650, 184, 0);
      place(["backoffice-api", "defi"], 24, 850, 184, 0);
      place(["ai", "graph"], 24, 1110, 184, 0);
      place(["privy"], 116, 1370);
      place(["vector", "memory"], 24, 1620, 184, 0);
      place(["neo4j"], 24, 1810);
      place(["vertex", "deepinfra"], 24, 2060, 184, 0);
      place(["openai"], 24, 2250);
      place(["lending", "swaps"], 24, 2500, 184, 0);
      place(["perps"], 24, 2690);
      group(
        "deployment",
        "DigitalOcean",
        0,
        170,
        382,
        1130,
        t("Hosted product and services", "Producto y servicios alojados"),
        true,
      );
      group(
        "backend-group",
        t("Backend / own services", "Backend / servicios propios"),
        10,
        390,
        362,
        890,
        "Python · FastAPI",
      );
      group("agentic-group", t("Agentic system", "Sistema agéntico"), 16, 1050, 350, 205);
      group(
        "data-group",
        t("Data and memory", "Datos y memoria"),
        0,
        1550,
        382,
        425,
        t(
          "Functional group · hosting unspecified",
          "Grupo funcional · alojamiento no especificado",
        ),
      );
      group(
        "models-group",
        t("External model providers", "Proveedores externos de modelos"),
        0,
        1990,
        382,
        425,
      );
      group("protocols-group", t("DeFi protocols", "Protocolos DeFi"), 0, 2430, 382, 425);
    } else {
      place(["mobile"], 580, 0);
      place(["web", "backoffice"], 40, 245, 270, 0);
      place(["backend"], 310, 450);
      place(["auth", "wallets", "backoffice-api"], 40, 650, 270, 0);
      place(["ai", "graph", "defi"], 40, 900, 270, 0);
      place(["privy"], 310, 1140);
      place(["vector", "memory", "neo4j"], 40, 1400, 270, 0);
      place(["vertex", "deepinfra", "openai"], 40, 1690, 270, 0);
      place(["lending", "swaps", "perps"], 40, 1980, 270, 0);
      group(
        "deployment",
        "DigitalOcean",
        0,
        170,
        820,
        915,
        t("Hosted product and services", "Producto y servicios alojados"),
        true,
      );
      group(
        "backend-group",
        t("Backend / own services", "Backend / servicios propios"),
        20,
        380,
        780,
        680,
        "Python · FastAPI",
      );
      group("agentic-group", t("Agentic system", "Sistema agéntico"), 30, 835, 490, 210);
      group(
        "data-group",
        t("Data and memory", "Datos y memoria"),
        0,
        1320,
        820,
        235,
        t(
          "Grouped by function, independently of hosting",
          "Agrupados por función, independientemente del alojamiento",
        ),
      );
      group(
        "models-group",
        t("External model providers", "Proveedores externos de modelos"),
        0,
        1620,
        820,
        235,
      );
      group("protocols-group", t("DeFi protocols", "Protocolos DeFi"), 0, 1910, 820, 235);
    }
  } else if (kind === "teamcubation") {
    if (vertical) {
      place(["portal", "gateway", "bff"], 24, 90, 0, 185);
      place(["source", "sqs", "lambda"], 208, 90, 0, 185);
      place(["java", "node"], 24, 690, 184, 0);
      place(["java-db", "node-db"], 24, 890, 184, 0);
      place(["agent", "harness"], 24, 1220, 184, 0);
      place(["graph", "neo4j"], 24, 1430, 184, 0);
      place(["cloudwatch"], 116, 1670);
      group(
        "deployment",
        "AWS",
        0,
        0,
        382,
        1860,
        t("Enterprise platform deployment", "Despliegue de la plataforma empresarial"),
        true,
      );
      group(
        "agentic-group",
        t("Promotion assistance", "Asistencia de promociones"),
        10,
        1150,
        362,
        455,
      );
    } else {
      place(["portal", "gateway", "bff"], 310, 90, 0, 185);
      place(["source", "sqs", "lambda"], 580, 90, 0, 185);
      place(["java", "node"], 310, 720, 270, 0);
      place(["java-db", "node-db"], 310, 920, 270, 0);
      place(["agent", "harness", "graph", "neo4j"], 40, 460, 0, 190);
      place(["cloudwatch"], 310, 1150);
      group(
        "deployment",
        "AWS",
        0,
        0,
        820,
        1320,
        t("Enterprise platform deployment", "Despliegue de la plataforma empresarial"),
        true,
      );
      group(
        "agentic-group",
        t("Promotion assistance", "Asistencia de promociones"),
        20,
        395,
        230,
        795,
      );
    }
  } else {
    if (vertical) {
      place(["web", "bff"], 116, 95, 0, 200);
      place(["java", "node"], 24, 530, 184, 0);
      place(["php"], 116, 730);
      group(
        "deployment",
        t("On-premise infrastructure", "Infraestructura on-premise"),
        0,
        0,
        382,
        910,
        t("Enterprise deployment", "Despliegue empresarial"),
        true,
      );
    } else {
      place(["web", "bff"], 310, 90, 0, 210);
      place(["java", "node", "php"], 40, 530, 270, 0);
      group(
        "deployment",
        t("On-premise infrastructure", "Infraestructura on-premise"),
        0,
        0,
        820,
        720,
        t("Enterprise deployment", "Despliegue empresarial"),
        true,
      );
    }
  }
  if (vertical) {
    for (const point of Object.values(positions))
      point.x = point.x === 24 ? 16 : point.x === 208 ? 194 : point.x === 116 ? 105 : point.x;
    for (const group of groups) group.width -= 22;
  }
  return { positions, groups, width: vertical ? 150 : 190, height: 128 };
}
