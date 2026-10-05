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
        "The web app, its expanding backoffice and the Python/FastAPI backend run on DigitalOcean; the mobile app connects from users’ devices. The backend separates authentication, wallets, backoffice, agent orchestration and DeFi services. Privy, model providers and DeFi protocols are external integrations. Data and memory are grouped by function, independently of hosting. Web code follows feature domains and a shared design system; the backend uses hexagonal architecture. The diagram connects capabilities rather than every internal service. Double arrows show exchange; dashed arrows show membership.",
    },
    es: {
      title: "Arquitectura del producto",
      summary:
        "La web, su backoffice en ampliación y el backend Python/FastAPI se despliegan en DigitalOcean; la app móvil se conecta desde los dispositivos. El backend separa autenticación, wallets, backoffice, orquestación de agentes y servicios DeFi. Privy, los proveedores de modelos y los protocolos DeFi son integraciones externas. Datos y memoria se agrupan por función, independientemente de su alojamiento. El código web sigue dominios por features y un design system compartido; el backend aplica arquitectura hexagonal. El gráfico conecta capacidades, sin detallar cada servicio interno. Las flechas dobles indican intercambio; las punteadas, pertenencia.",
    },
  },
  teamcubation: {
    en: {
      title: "Portal, ingestion and AI architecture",
      summary:
        "Deployed on AWS, the React/Single-SPA portal connects through an API Gateway to a Spring WebFlux BFF to access Java/Spring Boot and Node.js/NestJS microservices and the Promotion Assistance System, built with LangChain, LangGraph and OpenAI API. The frontend is organized by feature and uses a design system; the backend uses layered architecture. Inside that agentic system, the harness handles agent orchestration, answer evaluation and domain guardrails, while Neo4j-backed GraphRAG and PostgreSQL/pgvector retrieval connect enterprise policies and promotion information. A bulk promotion pipeline runs from S3 through SQS and a Python/FastAPI Lambda to the microservices and their respective PostgreSQL databases. CloudWatch supports observability across the deployment.",
    },
    es: {
      title: "Arquitectura del portal, la ingesta y la IA",
      summary:
        "Desplegado en AWS, el portal React/Single-SPA accede mediante un API Gateway y un BFF Spring WebFlux a microservicios Java/Spring Boot y Node.js/NestJS, y al Sistema de asistencia de promociones, construido con LangChain, LangGraph y OpenAI API. El frontend se organiza por features y utiliza un design system; el backend aplica arquitectura en capas. Dentro de este sistema agéntico, el harness coordina los agentes, evalúa las respuestas y aplica guardrails de dominio; GraphRAG sobre Neo4j y la recuperación vectorial con PostgreSQL/pgvector relacionan políticas empresariales y promociones. El flujo masivo de promociones pasa de S3 a SQS y una Lambda Python/FastAPI, y desde allí a los microservicios y sus respectivas bases de datos PostgreSQL. CloudWatch aporta observabilidad al despliegue.",
    },
  },
  "cooperativa-obrera": {
    en: {
      title: "Permissions system architecture",
      summary:
        "The backend used layered architecture within an on-premise deployment. The React/Next.js frontend was organized by feature and used a design system, with views following the Python/FastAPI BFF contract. The BFF integrated Java/Spring Boot, Node.js/NestJS and PHP services through OpenAPI/Swagger contracts, integrating microservices backed by MySQL or MariaDB and different permission models behind a consistent admin experience.",
    },
    es: {
      title: "Arquitectura del sistema de permisos",
      summary:
        "El backend aplicaba arquitectura en capas dentro de un despliegue on-premise. El frontend React/Next.js se organizaba por features y utilizaba un design system, con vistas que seguían el contrato del BFF Python/FastAPI. El BFF integraba servicios Java/Spring Boot, Node.js/NestJS y PHP mediante OpenAPI/Swagger, integrando microservicios con bases de datos MySQL o MariaDB y distintos modelos de permisos tras una experiencia uniforme para administradores.",
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
