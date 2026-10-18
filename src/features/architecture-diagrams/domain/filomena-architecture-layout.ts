import type { Locale } from "@config/locales";
import type { ArchitectureStep, Point } from "./architecture-types";

export const filomenaSteps: Record<Locale, ArchitectureStep[]> = {
  en: [
    { id: "web", title: "Web frontend", detail: "Next.js · React · TypeScript", tier: "surface" },
    { id: "api", title: "REST API", detail: "Laravel · REST", tier: "gateway" },
    { id: "data", title: "Exam data", detail: "MariaDB · indexes · query tuning", tier: "service" },
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
      detail: "MariaDB · índices · consultas",
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
};

export const filomenaConnections: [string, string][] = [
  ["web", "api"],
  ["api", "data"],
  ["api", "queues"],
];

export const filomenaDesktopPositions: Record<string, Point> = {
  web: { x: 0, y: 65 },
  api: { x: 275, y: 65 },
  data: { x: 550, y: 0 },
  queues: { x: 550, y: 130 },
  observability: { x: 275, y: 260 },
  delivery: { x: 0, y: 260 },
};

export const filomenaMobilePositions: Record<string, Point> = {
  web: { x: 85, y: 0 },
  api: { x: 85, y: 125 },
  data: { x: 0, y: 255 },
  queues: { x: 170, y: 255 },
  observability: { x: 0, y: 420 },
  delivery: { x: 170, y: 420 },
};
