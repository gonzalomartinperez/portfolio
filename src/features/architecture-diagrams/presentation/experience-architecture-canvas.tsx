"use client";

import type { Locale } from "@config/locales";
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
import { roundedRoute, routeConnection } from "../domain/architecture-edge-routing";
import type {
  ArchitectureGroup,
  ArchitectureKind,
  ArchitectureStep,
  Point,
} from "../domain/architecture-types";
import {
  enterpriseConnections,
  enterpriseLayout,
  enterpriseSteps,
} from "../domain/enterprise-architecture-layout";
import {
  filomenaConnections,
  filomenaDesktopPositions,
  filomenaMobilePositions,
  filomenaSteps,
} from "../domain/filomena-architecture-layout";
import styles from "./experience-architecture.module.css";

type DiagramNode = Node<
  {
    title: string;
    detail: string;
    tier: ArchitectureStep["tier"];
    vertical: boolean;
    locale: Locale;
    panelId: string;
    enterprise?: boolean;
    onInspect: (title: string, detail: string, trigger: HTMLButtonElement) => void;
  },
  "architecture"
>;

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
      {!data.deployment &&
        [Position.Top, Position.Right, Position.Bottom, Position.Left].flatMap((position) => [
          <Handle
            key={`source-${position}`}
            type="source"
            id={`source-${position}`}
            position={position}
            className={styles.groupHandle}
          />,
          <Handle
            key={`target-${position}`}
            type="target"
            id={`target-${position}`}
            position={position}
            className={styles.groupHandle}
          />,
        ])}
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
  const [selected, setSelected] = useState<Pick<ArchitectureStep, "title" | "detail"> | null>(null);
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
    const steps = kind === "filomena" ? filomenaSteps[locale] : enterpriseSteps(kind, locale);
    const cards: DiagramNode[] = steps.map((step) => {
      const position =
        layout?.positions[step.id] ??
        (vertical ? filomenaMobilePositions[step.id] : filomenaDesktopPositions[step.id]);
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
      zIndex: 0,
      draggable: false,
      selectable: false,
    }));
    return [...groups, ...cards];
  }, [kind, locale, layout, vertical, fontScale, panelId, inspect]);
  const edges = useMemo<Edge[]>(() => {
    if (kind === "filomena" || !layout)
      return filomenaConnections.map(([source, target]) => ({
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
        Object.fromEntries(
          layout.groups
            .filter((group) => !group.deployment)
            .map((group) => [
              group.id,
              { ...group.position, width: group.width, height: group.height },
            ]),
        ),
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
