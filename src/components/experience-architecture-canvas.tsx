"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type FitViewOptions,
  Handle,
  MarkerType,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from "@xyflow/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Locale } from "@/content/locales";
import type { ArchitectureKind } from "./experience-architecture";
import styles from "./experience-architecture.module.css";

type DiagramNode = Node<
  {
    title: string;
    detail: string;
    tier: "surface" | "gateway" | "service";
    vertical: boolean;
    locale: Locale;
    panelId: string;
    sideSource?: Position;
    sideTarget?: boolean;
    onInspect: (title: string, detail: string, trigger: HTMLButtonElement) => void;
  },
  "architecture"
>;

type Step = { id: string; title: string; detail: string; tier: DiagramNode["data"]["tier"] };

const labels: Record<ArchitectureKind, Record<Locale, Step[]>> = {
  rampy: {
    en: [
      {
        id: "web",
        title: "Web frontend",
        detail: "React · Next.js · features · design system",
        tier: "surface",
      },
      {
        id: "mobile",
        title: "Mobile app",
        detail: "React Native · Kotlin · Swift",
        tier: "surface",
      },
      { id: "backend", title: "Backend", detail: "Python · FastAPI · hexagonal", tier: "gateway" },
      {
        id: "ai",
        title: "AI workflows",
        detail: "Agno · LangChain · LangGraph · OpenAI API · Neo4j",
        tier: "service",
      },
      {
        id: "defi",
        title: "Fintech",
        detail: "Morpho · Aave · Compound · LI.FI · Hyperliquid",
        tier: "service",
      },
      {
        id: "privy",
        title: "Login and wallets",
        detail: "Privy · authentication · wallets",
        tier: "gateway",
      },
      {
        id: "backoffice",
        title: "Back office",
        detail: "Built · expanding · management · telemetry · status",
        tier: "surface",
      },
    ],
    es: [
      {
        id: "web",
        title: "Frontend web",
        detail: "React · Next.js · features · design system",
        tier: "surface",
      },
      {
        id: "mobile",
        title: "App móvil",
        detail: "React Native · Kotlin · Swift",
        tier: "surface",
      },
      { id: "backend", title: "Backend", detail: "Python · FastAPI · hexagonal", tier: "gateway" },
      {
        id: "ai",
        title: "Flujos de IA",
        detail: "Agno · LangChain · LangGraph · OpenAI API · Neo4j",
        tier: "service",
      },
      {
        id: "defi",
        title: "Fintech",
        detail: "Morpho · Aave · Compound · LI.FI · Hyperliquid",
        tier: "service",
      },
      {
        id: "privy",
        title: "Acceso y wallets",
        detail: "Privy · autenticación · wallets",
        tier: "gateway",
      },
      {
        id: "backoffice",
        title: "Backoffice",
        detail: "Implementado · en ampliación · gestión · telemetría · estado",
        tier: "surface",
      },
    ],
  },
  teamcubation: {
    en: [
      { id: "portal", title: "Web frontend", detail: "React · Single-SPA", tier: "surface" },
      { id: "bff", title: "BFF", detail: "Spring WebFlux", tier: "gateway" },
      { id: "java", title: "Microservices", detail: "Java · Spring Boot", tier: "service" },
      { id: "node", title: "Microservices", detail: "Node.js · NestJS", tier: "service" },
      { id: "source", title: "Amazon S3", detail: "Promotion files", tier: "surface" },
      { id: "sqs", title: "Amazon SQS", detail: "Bulk ingestion queue", tier: "gateway" },
      { id: "java-db", title: "Service database", detail: "Java service data", tier: "service" },
      { id: "node-db", title: "Service database", detail: "Node.js service data", tier: "service" },
      {
        id: "lambda",
        title: "Ingestion Lambda",
        detail: "Python · FastAPI Lambda",
        tier: "service",
      },
      {
        id: "agent",
        title: "Promotion Assistance System",
        detail: "Harness · LangChain · LangGraph · OpenAI API",
        tier: "gateway",
      },
      {
        id: "graph",
        title: "GraphRAG",
        detail: "Neo4j · enterprise policies · promotions",
        tier: "service",
      },
    ],
    es: [
      { id: "portal", title: "Frontend web", detail: "React · Single-SPA", tier: "surface" },
      { id: "bff", title: "BFF", detail: "Spring WebFlux", tier: "gateway" },
      { id: "java", title: "Microservicios", detail: "Java · Spring Boot", tier: "service" },
      { id: "node", title: "Microservicios", detail: "Node.js · NestJS", tier: "service" },
      { id: "source", title: "Amazon S3", detail: "Archivos de promociones", tier: "surface" },
      { id: "sqs", title: "Amazon SQS", detail: "Cola de ingesta masiva", tier: "gateway" },
      {
        id: "java-db",
        title: "BD del servicio",
        detail: "Datos del servicio Java",
        tier: "service",
      },
      {
        id: "node-db",
        title: "BD del servicio",
        detail: "Datos del servicio Node.js",
        tier: "service",
      },
      {
        id: "lambda",
        title: "Lambda de ingesta",
        detail: "Lambda Python · FastAPI",
        tier: "service",
      },
      {
        id: "agent",
        title: "Sistema de asistencia de promociones",
        detail: "Harness · LangChain · LangGraph · OpenAI API",
        tier: "gateway",
      },
      {
        id: "graph",
        title: "GraphRAG",
        detail: "Neo4j · políticas empresariales · promociones",
        tier: "service",
      },
    ],
  },
  "cooperativa-obrera": {
    en: [
      { id: "web", title: "Web frontend", detail: "React · Next.js", tier: "surface" },
      { id: "bff", title: "BFF", detail: "Python · FastAPI BFF", tier: "gateway" },
      { id: "java", title: "Microservices", detail: "Java · Spring Boot", tier: "service" },
      { id: "node", title: "Microservices", detail: "Node.js · NestJS", tier: "service" },
      { id: "php", title: "Microservices", detail: "PHP", tier: "service" },
    ],
    es: [
      { id: "web", title: "Frontend web", detail: "React · Next.js", tier: "surface" },
      { id: "bff", title: "BFF", detail: "BFF Python · FastAPI", tier: "gateway" },
      { id: "java", title: "Microservicios", detail: "Java · Spring Boot", tier: "service" },
      { id: "node", title: "Microservicios", detail: "Node.js · NestJS", tier: "service" },
      { id: "php", title: "Microservicios", detail: "PHP", tier: "service" },
    ],
  },
  filomena: {
    en: [
      { id: "web", title: "Web frontend", detail: "Next.js · React · TypeScript", tier: "surface" },
      { id: "api", title: "REST API", detail: "Laravel · REST", tier: "gateway" },
      { id: "data", title: "Exam data", detail: "MySQL · indexes · query tuning", tier: "service" },
      {
        id: "queues",
        title: "Cache and queues",
        detail: "Redis · asynchronous work",
        tier: "service",
      },
      {
        id: "observability",
        title: "Observability",
        detail: "Prometheus · Grafana",
        tier: "service",
      },
      { id: "delivery", title: "Delivery", detail: "Docker · GitHub Actions", tier: "surface" },
    ],
    es: [
      {
        id: "web",
        title: "Frontend web",
        detail: "Next.js · React · TypeScript",
        tier: "surface",
      },
      { id: "api", title: "API REST", detail: "Laravel · REST", tier: "gateway" },
      {
        id: "data",
        title: "Datos de exámenes",
        detail: "MySQL · índices · consultas",
        tier: "service",
      },
      {
        id: "queues",
        title: "Caché y colas",
        detail: "Redis · trabajo asíncrono",
        tier: "service",
      },
      {
        id: "observability",
        title: "Observabilidad",
        detail: "Prometheus · Grafana",
        tier: "service",
      },
      { id: "delivery", title: "Delivery", detail: "Docker · GitHub Actions", tier: "surface" },
    ],
  },
};

const connections: Record<ArchitectureKind, [string, string][]> = {
  rampy: [
    ["web", "backend"],
    ["mobile", "backend"],
    ["privy", "backend"],
    ["web", "backoffice"],
    ["backend", "ai"],
    ["backend", "defi"],
  ],
  teamcubation: [
    ["portal", "bff"],
    ["bff", "java"],
    ["bff", "node"],
    ["source", "sqs"],
    ["sqs", "lambda"],
    ["lambda", "java"],
    ["lambda", "node"],
    ["java", "java-db"],
    ["node", "node-db"],
    ["bff", "agent"],
    ["agent", "graph"],
  ],
  "cooperativa-obrera": [
    ["web", "bff"],
    ["bff", "java"],
    ["bff", "node"],
    ["bff", "php"],
  ],
  filomena: [
    ["web", "api"],
    ["api", "data"],
    ["api", "queues"],
  ],
};

const desktopPositions: Record<ArchitectureKind, Record<string, { x: number; y: number }>> = {
  rampy: {
    web: { x: 0, y: 0 },
    mobile: { x: 0, y: 130 },
    backend: { x: 275, y: 65 },
    ai: { x: 550, y: 0 },
    defi: { x: 550, y: 130 },
    privy: { x: 0, y: 260 },
    backoffice: { x: 275, y: -130 },
  },
  teamcubation: {
    portal: { x: 120, y: 0 },
    bff: { x: 120, y: 140 },
    java: { x: 300, y: 440 },
    node: { x: 550, y: 440 },
    source: { x: 650, y: 0 },
    sqs: { x: 650, y: 140 },
    lambda: { x: 650, y: 280 },
    "java-db": { x: 300, y: 620 },
    "node-db": { x: 550, y: 620 },
    agent: { x: 0, y: 440 },
    graph: { x: 0, y: 620 },
  },
  "cooperativa-obrera": {
    web: { x: 0, y: 65 },
    bff: { x: 275, y: 65 },
    java: { x: 550, y: -40 },
    node: { x: 550, y: 65 },
    php: { x: 550, y: 170 },
  },
  filomena: {
    web: { x: 0, y: 65 },
    api: { x: 275, y: 65 },
    data: { x: 550, y: 0 },
    queues: { x: 550, y: 130 },
    observability: { x: 275, y: 260 },
    delivery: { x: 0, y: 260 },
  },
};

const mobilePositions: Record<ArchitectureKind, Record<string, { x: number; y: number }>> = {
  rampy: {
    web: { x: 0, y: 0 },
    mobile: { x: 170, y: 0 },
    backend: { x: 170, y: 145 },
    privy: { x: 0, y: 295 },
    backoffice: { x: 0, y: 145 },
    ai: { x: 0, y: 445 },
    defi: { x: 170, y: 445 },
  },
  teamcubation: {
    portal: { x: 0, y: 0 },
    bff: { x: 0, y: 140 },
    java: { x: 0, y: 440 },
    node: { x: 170, y: 440 },
    source: { x: 170, y: 0 },
    sqs: { x: 170, y: 140 },
    lambda: { x: 170, y: 280 },
    "java-db": { x: 0, y: 590 },
    "node-db": { x: 170, y: 590 },
    agent: { x: 0, y: 760 },
    graph: { x: 170, y: 760 },
  },
  "cooperativa-obrera": {
    web: { x: 85, y: 0 },
    bff: { x: 85, y: 125 },
    java: { x: 0, y: 255 },
    node: { x: 170, y: 255 },
    php: { x: 85, y: 390 },
  },
  filomena: {
    web: { x: 85, y: 0 },
    api: { x: 85, y: 125 },
    data: { x: 0, y: 255 },
    queues: { x: 170, y: 255 },
    observability: { x: 0, y: 420 },
    delivery: { x: 170, y: 420 },
  },
};
const SelectedNode = createContext<string | null>(null);

function ArchitectureNode({ id, data }: NodeProps<DiagramNode>) {
  const selected = useContext(SelectedNode) === id;
  return (
    <div className={`${styles.node} ${styles[data.tier]}`}>
      <Handle
        type="target"
        position={data.vertical ? Position.Top : Position.Left}
        className={styles.handle}
      />
      <button
        type="button"
        className={`${styles.nodeAction} nodrag nopan`}
        aria-label={`${data.locale === "es" ? "Ver detalles" : "View details"}: ${data.title}`}
        aria-expanded={selected}
        aria-controls={selected ? data.panelId : undefined}
        onClick={(event) => data.onInspect(data.title, data.detail, event.currentTarget)}
      >
        <strong>{data.title}</strong>
        <span>{data.detail}</span>
      </button>
      <Handle
        type="source"
        position={data.vertical ? Position.Bottom : Position.Right}
        className={styles.handle}
      />
      {data.sideSource && (
        <Handle
          type="source"
          id="side-source"
          position={data.sideSource}
          className={styles.handle}
        />
      )}
      {data.sideTarget && (
        <Handle type="target" id="side-target" position={Position.Left} className={styles.handle} />
      )}
    </div>
  );
}

const nodeTypes = { architecture: ArchitectureNode };

export default function DiagramCanvas({
  kind,
  locale,
}: {
  kind: ArchitectureKind;
  locale: Locale;
}) {
  const [vertical, setVertical] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [selected, setSelected] = useState<Pick<Step, "title" | "detail"> | null>(null);
  const panelId = useId();
  const inspectionPanel = useRef<HTMLElement | null>(null);
  const inspectionTrigger = useRef<{ id: string; canvas: HTMLElement } | null>(null);
  const inspect = useCallback((title: string, detail: string, trigger: HTMLButtonElement) => {
    const node = trigger.closest<HTMLElement>(".react-flow__node");
    const canvas = trigger.closest<HTMLElement>(".react-flow");
    inspectionTrigger.current = node?.dataset.id && canvas ? { id: node.dataset.id, canvas } : null;
    setSelected({ title, detail });
  }, []);
  const closeInspection = () => {
    setSelected(null);
    const origin = inspectionTrigger.current;
    origin?.canvas
      .querySelector<HTMLButtonElement>(`[data-id="${origin.id}"] button`)
      ?.focus({ preventScroll: true });
  };
  useEffect(() => {
    const query = window.matchMedia("(max-width: 620px)");
    const sync = () => {
      setVertical(query.matches);
      setFontScale(Number.parseFloat(getComputedStyle(document.documentElement).fontSize) / 16);
    };
    sync();
    query.addEventListener("change", sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
    return () => {
      query.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    if (!selected) return;
    const origin = inspectionTrigger.current;
    const panel = inspectionPanel.current;
    if (!origin || !panel) return;
    const place = () => {
      const canvas = origin.canvas.getBoundingClientRect();
      const header = document.querySelector("header")?.getBoundingClientRect();
      const visibleTop = Math.max(canvas.top, header?.bottom ?? 0, 0) + 8;
      const visibleBottom = Math.min(canvas.bottom - 64, window.innerHeight - 8);
      const availableHeight = visibleBottom - visibleTop;
      panel.hidden = availableHeight < 44;
      if (panel.hidden) return;
      panel.style.maxHeight = `${Math.floor(availableHeight)}px`;
      const trigger = origin.canvas.querySelector(`[data-id="${origin.id}"] button`);
      const anchor = trigger?.getBoundingClientRect();
      const below = (anchor?.bottom ?? visibleTop) + 12;
      const preferredTop =
        below + panel.offsetHeight <= visibleBottom
          ? below
          : (anchor?.top ?? visibleBottom) - panel.offsetHeight - 12;
      const top = Math.max(visibleTop, Math.min(preferredTop, visibleBottom - panel.offsetHeight));
      panel.style.top = `${top - canvas.top}px`;
    };
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    const observer = new ResizeObserver(place);
    observer.observe(panel);
    observer.observe(origin.canvas);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
      observer.disconnect();
    };
  }, [selected]);

  const nodes = useMemo<DiagramNode[]>(
    () =>
      labels[kind][locale].map((step) => ({
        id: step.id,
        type: "architecture",
        position: {
          x:
            (vertical ? mobilePositions[kind][step.id] : desktopPositions[kind][step.id]).x *
            fontScale,
          y:
            (vertical ? mobilePositions[kind][step.id] : desktopPositions[kind][step.id]).y *
            fontScale,
        },
        data: {
          title: step.title,
          detail: step.detail,
          tier: step.tier,
          vertical: vertical || kind === "teamcubation",
          locale,
          panelId,
          onInspect: inspect,
          sideSource:
            kind === "rampy" && vertical && step.id === "privy"
              ? Position.Right
              : kind === "teamcubation" && step.id === "bff"
                ? Position.Left
                : kind === "teamcubation" && step.id === "agent" && vertical
                  ? Position.Right
                  : undefined,
          sideTarget:
            (kind === "rampy" && vertical && step.id === "backend") ||
            (kind === "teamcubation" && (step.id === "agent" || (step.id === "graph" && vertical))),
        },
        draggable: false,
        selectable: false,
      })),
    [kind, locale, vertical, fontScale, panelId, inspect],
  );
  const edges: Edge[] = connections[kind].map(([source, target]) => ({
    id: `${source}-${target}`,
    source,
    target,
    type: "smoothstep",
    pathOptions:
      // Keep the AI branch in the gap below the wallet row.
      kind === "rampy" && vertical && source === "backend" && target === "ai"
        ? { stepPosition: 0.95 }
        : kind === "teamcubation" && source === "bff" && target === "node" && vertical
          ? { stepPosition: 0.9 }
          : undefined,
    sourceHandle:
      kind === "rampy" && vertical && source === "privy"
        ? "side-source"
        : kind === "teamcubation" &&
            ((source === "bff" && target === "agent") || (source === "agent" && vertical))
          ? "side-source"
          : undefined,
    targetHandle:
      kind === "rampy" && vertical && source === "privy"
        ? "side-target"
        : kind === "teamcubation" &&
            ((source === "bff" && target === "agent") || (target === "graph" && vertical))
          ? "side-target"
          : undefined,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 1.8 },
    animated: false,
  }));

  const fitViewOptions: FitViewOptions = {
    padding: {
      top: vertical ? "16px" : "32px",
      bottom: "56px",
      left: vertical ? (kind === "teamcubation" ? "32px" : "8px") : "32px",
      right: vertical ? "8px" : "32px",
    },
    maxZoom: vertical ? 1 : 1.1,
  };

  return (
    <SelectedNode.Provider value={selected ? (inspectionTrigger.current?.id ?? null) : null}>
      <ReactFlow
        key={`${kind}-${vertical ? "vertical" : "horizontal"}-${fontScale}`}
        onKeyDown={(event) => {
          if (event.key === "Escape" && selected) {
            event.preventDefault();
            closeInspection();
          }
        }}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        nodesDraggable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        zoomOnPinch={false}
        panActivationKeyCode={null}
        zoomActivationKeyCode={null}
        ariaLabelConfig={
          locale === "es"
            ? {
                "controls.zoomIn.ariaLabel": "Acercar diagrama",
                "controls.zoomOut.ariaLabel": "Alejar diagrama",
                "controls.fitView.ariaLabel": "Ajustar diagrama",
              }
            : undefined
        }
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={0.8} />
        <Controls
          showInteractive={false}
          fitViewOptions={fitViewOptions}
          orientation="horizontal"
          position="bottom-left"
          aria-label={locale === "es" ? "Controles del diagrama" : "Diagram controls"}
        />
        {selected && (
          <section
            id={panelId}
            ref={inspectionPanel}
            className={styles.inspection}
            aria-label={locale === "es" ? "Detalles del componente" : "Component details"}
          >
            <div role="status">
              <h5>{selected.title}</h5>
              <p className={styles.inspectionCopy}>{selected.detail}</p>
            </div>
            <button type="button" className={styles.inspectionClose} onClick={closeInspection}>
              {locale === "es" ? "Cerrar detalles" : "Close details"}
            </button>
          </section>
        )}
      </ReactFlow>
    </SelectedNode.Provider>
  );
}
