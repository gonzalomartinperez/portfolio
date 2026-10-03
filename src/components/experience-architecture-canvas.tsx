"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from "@xyflow/react";
import { useEffect, useState } from "react";
import type { Locale } from "@/content/locales";
import type { ArchitectureKind } from "./experience-architecture";
import styles from "./experience-architecture.module.css";

type DiagramNode = Node<
  {
    title: string;
    detail: string;
    tier: "surface" | "gateway" | "service";
    vertical: boolean;
  },
  "architecture"
>;

type Step = { id: string; title: string; detail: string; tier: DiagramNode["data"]["tier"] };

const labels: Record<ArchitectureKind, Record<Locale, Step[]>> = {
  rampy: {
    en: [
      {
        id: "web",
        title: "Web",
        detail: "React · Next.js · features · design system",
        tier: "surface",
      },
      { id: "mobile", title: "Mobile", detail: "React Native · Kotlin · Swift", tier: "surface" },
      { id: "backend", title: "Backend", detail: "Python · FastAPI · hexagonal", tier: "gateway" },
      {
        id: "ai",
        title: "AI workflows",
        detail: "Agno · LangChain · LangGraph · OpenAI API · Neo4j",
        tier: "service",
      },
      { id: "defi", title: "Fintech", detail: "Morpho · Aave · Compound", tier: "service" },
    ],
    es: [
      {
        id: "web",
        title: "Web",
        detail: "React · Next.js · features · design system",
        tier: "surface",
      },
      { id: "mobile", title: "Mobile", detail: "React Native · Kotlin · Swift", tier: "surface" },
      { id: "backend", title: "Backend", detail: "Python · FastAPI · hexagonal", tier: "gateway" },
      {
        id: "ai",
        title: "Flujos de IA",
        detail: "Agno · LangChain · LangGraph · OpenAI API · Neo4j",
        tier: "service",
      },
      { id: "defi", title: "Fintech", detail: "Morpho · Aave · Compound", tier: "service" },
    ],
  },
  teamcubation: {
    en: [
      { id: "portal", title: "Merchant portal", detail: "React · Single-SPA", tier: "surface" },
      { id: "bff", title: "BFF", detail: "Spring WebFlux", tier: "gateway" },
      { id: "java", title: "Services", detail: "Java · Spring Boot", tier: "service" },
      { id: "node", title: "Services", detail: "Node.js · NestJS", tier: "service" },
      { id: "source", title: "Ingestion", detail: "Amazon S3 · SQS", tier: "surface" },
      { id: "lambda", title: "Processing", detail: "Python · FastAPI Lambda", tier: "service" },
    ],
    es: [
      { id: "portal", title: "Portal de comercios", detail: "React · Single-SPA", tier: "surface" },
      { id: "bff", title: "BFF", detail: "Spring WebFlux", tier: "gateway" },
      { id: "java", title: "Servicios", detail: "Java · Spring Boot", tier: "service" },
      { id: "node", title: "Servicios", detail: "Node.js · NestJS", tier: "service" },
      { id: "source", title: "Ingesta", detail: "Amazon S3 · SQS", tier: "surface" },
      { id: "lambda", title: "Procesamiento", detail: "Lambda Python · FastAPI", tier: "service" },
    ],
  },
  "cooperativa-obrera": {
    en: [
      { id: "web", title: "Admin views", detail: "React · Next.js", tier: "surface" },
      { id: "bff", title: "Shared contract", detail: "Python · FastAPI BFF", tier: "gateway" },
      { id: "java", title: "Services", detail: "Java · Spring Boot", tier: "service" },
      { id: "node", title: "Services", detail: "Node.js · NestJS", tier: "service" },
      { id: "php", title: "Services", detail: "PHP", tier: "service" },
    ],
    es: [
      { id: "web", title: "Vistas admin", detail: "React · Next.js", tier: "surface" },
      { id: "bff", title: "Contrato común", detail: "BFF Python · FastAPI", tier: "gateway" },
      { id: "java", title: "Servicios", detail: "Java · Spring Boot", tier: "service" },
      { id: "node", title: "Servicios", detail: "Node.js · NestJS", tier: "service" },
      { id: "php", title: "Servicios", detail: "PHP", tier: "service" },
    ],
  },
};

const connections: Record<ArchitectureKind, [string, string][]> = {
  rampy: [
    ["web", "backend"],
    ["mobile", "backend"],
    ["backend", "ai"],
    ["backend", "defi"],
  ],
  teamcubation: [
    ["portal", "bff"],
    ["bff", "java"],
    ["bff", "node"],
    ["source", "lambda"],
  ],
  "cooperativa-obrera": [
    ["web", "bff"],
    ["bff", "java"],
    ["bff", "node"],
    ["bff", "php"],
  ],
};

const desktopPositions: Record<ArchitectureKind, Record<string, { x: number; y: number }>> = {
  rampy: {
    web: { x: 0, y: 0 },
    mobile: { x: 0, y: 130 },
    backend: { x: 275, y: 65 },
    ai: { x: 550, y: 0 },
    defi: { x: 550, y: 130 },
  },
  teamcubation: {
    portal: { x: 0, y: 0 },
    bff: { x: 275, y: 0 },
    java: { x: 550, y: -45 },
    node: { x: 550, y: 70 },
    source: { x: 0, y: 185 },
    lambda: { x: 275, y: 185 },
  },
  "cooperativa-obrera": {
    web: { x: 0, y: 65 },
    bff: { x: 275, y: 65 },
    java: { x: 550, y: -40 },
    node: { x: 550, y: 65 },
    php: { x: 550, y: 170 },
  },
};

const mobilePositions: Record<ArchitectureKind, Record<string, { x: number; y: number }>> = {
  rampy: {
    web: { x: 0, y: 0 },
    mobile: { x: 170, y: 0 },
    backend: { x: 85, y: 145 },
    ai: { x: 0, y: 295 },
    defi: { x: 170, y: 295 },
  },
  teamcubation: {
    portal: { x: 85, y: 0 },
    bff: { x: 85, y: 120 },
    java: { x: 0, y: 245 },
    node: { x: 170, y: 245 },
    source: { x: 85, y: 390 },
    lambda: { x: 85, y: 510 },
  },
  "cooperativa-obrera": {
    web: { x: 85, y: 0 },
    bff: { x: 85, y: 125 },
    java: { x: 0, y: 255 },
    node: { x: 170, y: 255 },
    php: { x: 85, y: 390 },
  },
};
function ArchitectureNode({ data }: NodeProps<DiagramNode>) {
  return (
    <div className={`${styles.node} ${styles[data.tier]}`}>
      <Handle
        type="target"
        position={data.vertical ? Position.Top : Position.Left}
        className={styles.handle}
      />
      <strong>{data.title}</strong>
      <span>{data.detail}</span>
      <Handle
        type="source"
        position={data.vertical ? Position.Bottom : Position.Right}
        className={styles.handle}
      />
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
  useEffect(() => {
    const query = window.matchMedia("(max-width: 620px)");
    const sync = () => setVertical(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const nodes: DiagramNode[] = labels[kind][locale].map((step) => ({
    id: step.id,
    type: "architecture",
    position: vertical ? mobilePositions[kind][step.id] : desktopPositions[kind][step.id],
    data: { title: step.title, detail: step.detail, tier: step.tier, vertical },
    draggable: false,
    selectable: false,
  }));
  const edges: Edge[] = connections[kind].map(([source, target]) => ({
    id: `${source}-${target}`,
    source,
    target,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 1.8 },
    animated: false,
  }));

  return (
    <ReactFlow
      key={`${kind}-${vertical ? "vertical" : "horizontal"}`}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: vertical ? 0.04 : 0.16, maxZoom: vertical ? 1 : 1.1 }}
      nodesDraggable={false}
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
        aria-label={locale === "es" ? "Controles del diagrama" : "Diagram controls"}
      />
    </ReactFlow>
  );
}
