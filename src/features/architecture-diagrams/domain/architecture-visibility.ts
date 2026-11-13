import type { ArchitectureKind } from "./architecture-types";

/**
 * Owner decision (2026-11-13, OD-76): employer architecture diagrams are hidden on the public
 * site and enabled on demand; the Filomena case study (the owner's own public project) shows its
 * diagram. Layouts, copy and tests stay in the repository; flip a kind to `true` to show it.
 */
export const architectureDiagramVisibility: Record<ArchitectureKind, boolean> = {
  rampy: false,
  teamcubation: false,
  "cooperativa-obrera": false,
  filomena: true,
};

export function isArchitectureDiagramEnabled(kind: ArchitectureKind): boolean {
  return architectureDiagramVisibility[kind];
}
