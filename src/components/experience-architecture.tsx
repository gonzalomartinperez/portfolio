"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/content/locales";
import styles from "./experience-architecture.module.css";

export type ArchitectureKind = "rampy" | "teamcubation" | "cooperativa-obrera" | "filomena";

const DiagramCanvas = dynamic(() => import("./experience-architecture-canvas"), {
  ssr: false,
  loading: () => <div className={styles.loading} aria-hidden="true" />,
});

const descriptions: Record<ArchitectureKind, Record<Locale, { title: string; summary: string }>> = {
  rampy: {
    en: {
      title: "Product architecture",
      summary:
        "The React/Next.js web app is organized by feature domains on a shared design system; it and the React Native mobile app connect to a hexagonal Python/FastAPI backend. Its API and AI capabilities include agent workflows with Agno, LangChain, LangGraph, OpenAI API and Neo4j GraphRAG, alongside DeFi integrations. This is a capability map, not an exact request trace.",
    },
    es: {
      title: "Arquitectura del producto",
      summary:
        "La web React/Next.js está organizada por dominios y features sobre un design system compartido; junto con la app mobile React Native, se conecta con un backend Python/FastAPI de arquitectura hexagonal. Sus capacidades de API e IA incluyen agentes con Agno, LangChain, LangGraph, OpenAI API y GraphRAG con Neo4j, además de integraciones DeFi. Es un mapa de capacidades, no una traza exacta de cada solicitud.",
    },
  },
  teamcubation: {
    en: {
      title: "Portal, ingestion and AI architecture",
      summary:
        "The React/Single-SPA portal connected through a Spring WebFlux BFF to Java/Spring Boot and Node.js/NestJS services. S3 and SQS fed a separate Python/FastAPI Lambda for promotion ingestion. The AI lane shows the LangChain/LangGraph and OpenAI API harness with Neo4j-backed GraphRAG, agent orchestration, answer evaluation and domain guardrails. Separate lanes do not imply an undocumented connection between systems.",
    },
    es: {
      title: "Arquitectura del portal, la ingesta y la IA",
      summary:
        "El portal React/Single-SPA se conectaba mediante un BFF Spring WebFlux con servicios Java/Spring Boot y Node.js/NestJS. S3 y SQS alimentaban una Lambda Python/FastAPI separada para ingerir promociones. El bloque de IA muestra el harness con LangChain/LangGraph, OpenAI API y GraphRAG sobre Neo4j, con orquestación, evaluación de respuestas y guardrails de dominio. Los bloques separados no implican conexiones entre sistemas que no se hayan documentado.",
    },
  },
  "cooperativa-obrera": {
    en: {
      title: "Permissions system architecture",
      summary:
        "React/Next.js views followed the Python/FastAPI BFF contract. The BFF integrated Java/Spring Boot, Node.js/NestJS and PHP services through OpenAPI/Swagger contracts, hiding different databases and permission models behind a consistent admin experience.",
    },
    es: {
      title: "Arquitectura del sistema de permisos",
      summary:
        "Las vistas React/Next.js seguían el contrato del BFF Python/FastAPI. El BFF integraba servicios Java/Spring Boot, Node.js/NestJS y PHP mediante OpenAPI/Swagger, ocultando bases de datos y modelos de permisos distintos tras una experiencia uniforme para administradores.",
    },
  },
  filomena: {
    en: {
      title: "Exam platform architecture",
      summary:
        "The Next.js/React client uses one Laravel REST API backed by MySQL and Redis for caching and asynchronous work. Prometheus and Grafana observe the database, queues and workers; Docker images are built and deployed through GitHub Actions. The diagram groups request handling and operational capabilities; the layer descriptions below explain each responsibility.",
    },
    es: {
      title: "Arquitectura de la plataforma de exámenes",
      summary:
        "El cliente Next.js/React usa una API REST Laravel respaldada por MySQL y Redis para caché y trabajo asíncrono. Prometheus y Grafana observan la base de datos, las colas y los workers; las imágenes Docker se construyen y despliegan mediante GitHub Actions. El gráfico agrupa solicitudes y capacidades operativas; las descripciones siguientes explican cada responsabilidad.",
    },
  },
};

export function ExperienceArchitecture({
  kind,
  locale,
}: {
  kind: ArchitectureKind;
  locale: Locale;
}) {
  const content = descriptions[kind][locale];
  return (
    <figure className={`${styles.figure} ${styles[kind]}`} aria-label={content.title}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{locale === "es" ? "Sistema" : "System"}</p>
        <h4>{content.title}</h4>
      </div>
      <div className={styles.canvas}>
        <DiagramCanvas kind={kind} locale={locale} />
      </div>
      <figcaption className={styles.caption}>{content.summary}</figcaption>
    </figure>
  );
}
