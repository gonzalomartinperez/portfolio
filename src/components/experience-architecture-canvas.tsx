"use client";

import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  type Edge,
  type EdgeProps,
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
import { roundedRoute, routeConnection } from "./architecture-edge-routing";
import {
  type ArchitectureGroup,
  enterpriseConnections,
  enterpriseLayout,
  enterpriseSteps,
  type Point,
} from "./enterprise-architecture-layout";
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
    enterprise?: boolean;
    onInspect: (title: string, detail: string, trigger: HTMLButtonElement) => void;
  },
  "architecture"
>;

type Step = { id: string; title: string; detail: string; tier: DiagramNode["data"]["tier"] };

const labels: Record<"filomena", Record<Locale, Step[]>> = {
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

const connections: Record<"filomena", [string, string][]> = {
  filomena: [
    ["web", "api"],
    ["api", "data"],
    ["api", "queues"],
  ],
};

const desktopPositions: Record<"filomena", Record<string, { x: number; y: number }>> = {
  filomena: {
    web: { x: 0, y: 65 },
    api: { x: 275, y: 65 },
    data: { x: 550, y: 0 },
    queues: { x: 550, y: 130 },
    observability: { x: 275, y: 260 },
    delivery: { x: 0, y: 260 },
  },
};

const mobilePositions: Record<"filomena", Record<string, { x: number; y: number }>> = {
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
    <div
      className={`${styles.node} ${styles[data.tier]} ${data.enterprise ? styles.enterpriseNode : ""}`}
    >
      {!data.enterprise && (
        <Handle
          type="target"
          position={data.vertical ? Position.Top : Position.Left}
          className={styles.handle}
        />
      )}
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
      {!data.enterprise && (
        <Handle
          type="source"
          position={data.vertical ? Position.Bottom : Position.Right}
          className={styles.handle}
        />
      )}
      {data.enterprise &&
        [Position.Top, Position.Right, Position.Bottom, Position.Left].flatMap((position) => [
          <Handle
            key={`source-${position}`}
            type="source"
            id={`source-${position}`}
            position={position}
            className={styles.handle}
          />,
          <Handle
            key={`target-${position}`}
            type="target"
            id={`target-${position}`}
            position={position}
            className={styles.handle}
          />,
        ])}
    </div>
  );
}

type GroupNode = Node<ArchitectureGroup & Record<string, unknown>, "architectureGroup">;
function ArchitectureGroupNode({ data }: NodeProps<GroupNode>) {
  return (
    <div className={`${styles.group} ${data.deployment ? styles.deployment : ""}`}>
      <strong>{data.title}</strong>
      {data.detail && <span>{data.detail}</span>}
    </div>
  );
}
type RoutedEdge = Edge<{ points: Point[]; scale: number }, "architectureRoute">;
function ArchitectureEdge({ id, data, markerStart, markerEnd, style }: EdgeProps<RoutedEdge>) {
  if (!data) return null;
  return (
    <BaseEdge
      id={id}
      path={roundedRoute(data.points, data.scale)}
      markerStart={markerStart}
      markerEnd={markerEnd}
      style={style}
    />
  );
}
const nodeTypes = { architecture: ArchitectureNode, architectureGroup: ArchitectureGroupNode };
const edgeTypes = { architectureRoute: ArchitectureEdge };

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

  const layout = useMemo(
    () => (kind === "filomena" ? null : enterpriseLayout(kind, vertical, locale)),
    [kind, vertical, locale],
  );
  const nodes = useMemo<(DiagramNode | GroupNode)[]>(() => {
    const steps = kind === "filomena" ? labels.filomena[locale] : enterpriseSteps(kind, locale);
    const cards: DiagramNode[] = steps.map((step) => {
      const position =
        layout?.positions[step.id] ??
        (vertical ? mobilePositions.filomena[step.id] : desktopPositions.filomena[step.id]);
      return {
        id: step.id,
        type: "architecture",
        position: { x: position.x * fontScale, y: position.y * fontScale },
        style: layout
          ? { width: layout.width * fontScale, height: layout.height * fontScale }
          : undefined,
        data: {
          title: step.title,
          detail: step.detail,
          tier: step.tier,
          vertical,
          locale,
          panelId,
          onInspect: inspect,
          enterprise: !!layout,
        },
        draggable: false,
        selectable: false,
      };
    });
    const groups: GroupNode[] = (layout?.groups ?? []).map((group) => ({
      id: group.id,
      type: "architectureGroup",
      position: { x: group.position.x * fontScale, y: group.position.y * fontScale },
      style: { width: group.width * fontScale, height: group.height * fontScale },
      data: { ...group },
      zIndex: -1,
      draggable: false,
      selectable: false,
    }));
    return [...groups, ...cards];
  }, [kind, locale, layout, vertical, fontScale, panelId, inspect]);
  const edges = useMemo<Edge[]>(() => {
    if (kind === "filomena" || !layout)
      return connections.filomena.map(([source, target]) => ({
        id: `${source}-${target}`,
        source,
        target,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 1.8 },
        animated: false,
      }));
    return enterpriseConnections[kind].map((connection) => {
      const route = routeConnection(
        connection.source,
        connection.target,
        layout.positions,
        layout.width,
        layout.height,
      );
      return {
        id: `${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: `source-${route.sourcePort}`,
        targetHandle: `target-${route.targetPort}`,
        type: "architectureRoute",
        data: { points: route.points, scale: fontScale },
        markerStart: connection.bidirectional
          ? { type: MarkerType.ArrowClosed, orient: "auto-start-reverse" }
          : undefined,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 1.6, strokeDasharray: connection.containment ? "5 4" : undefined },
        animated: false,
      };
    });
  }, [kind, layout, fontScale]);

  const fitViewOptions: FitViewOptions = {
    padding: {
      top: vertical ? "16px" : "32px",
      bottom: "56px",
      left: vertical ? "8px" : "32px",
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
        edgeTypes={edgeTypes}
        fitView
        minZoom={layout ? 0.1 : 0.5}
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
