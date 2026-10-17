export type ArchitectureKind = "rampy" | "teamcubation" | "cooperativa-obrera" | "filomena";

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
export type EnterpriseKind = Exclude<ArchitectureKind, "filomena">;
