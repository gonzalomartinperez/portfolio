import Image from "next/image";
import privyMark from "../../public/brands/privy.png";
import styles from "./brand-mark.module.css";

const localMarks = new Set([
  "solidity",
  "coolify",
  "singular",
  "neo4j",
  "android-studio",
  "zerodev",
  "sqlmodel",
  "stripe",
  "swift",
  "lifi",
  "pytest",
  "sentry",
  "expo",
  "reactquery",
  "zod",
  "vitest",
  "googlegemini",
  "googlecloud",
  "openai",
  "sqlalchemy",
  "pydantic",
  "pandas",
  "numpy",
  "pytorch",
  "tensorflow",
  "prisma",
  "typeorm",
  "googleanalytics",
  "meta",
  "celery",
  "hostinger",
  "agno",
  "mem0",
  "single-spa",
  "infisical",
  "karate",
  "testcontainers",
  "micrometer",
  "aave",
  "compound",
  "amazon-api-gateway",
  "amazon-sqs",
  "amazon-cloudwatch",
  "microsoft-teams",
  "morpho",
  "digitalocean",
  "kotlin",
  "openjdk",
  "javascript",
  "php",
  "spring",
  "fastapi",
  "nestjs",
  "laravel",
  "react",
  "nextdotjs",
  "wordpress",
  "postgresql",
  "mysql",
  "mariadb",
  "mongodb",
  "redis",
  "docker",
  "kubernetes",
  "helm",
  "git",
  "githubactions",
  "gitlab",
  "apachemaven",
  "prometheus",
  "grafana",
  "opentelemetry",
  "sonarqube",
  "jest",
  "jira",
  "trello",
  "hibernate",
  "junit",
  "langgraph",
  "modelcontextprotocol",
  "openapi",
  "python",
  "typescript",
  "nodedotjs",
  "springboot",
  "slack",
  "discord",
  "testinglibrary",
]);

const rasterMarks = new Set([
  "deepinfra",
  "mockito",
  "privy",
  "hyperliquid",
  "viem",
  "firebase",
  "moonpay",
  "clarity",
]);

export function BrandMark({ name, size = 20 }: { name: string; size?: number }) {
  if (localMarks.has(name) || rasterMarks.has(name))
    return (
      <Image
        alt=""
        aria-hidden="true"
        className={
          name === "privy"
            ? `${styles.original} ${styles.privy}`
            : name === "hyperliquid"
              ? `${styles.original} ${styles.hyperliquid}`
              : styles.original
        }
        src={
          name === "privy" ? privyMark : `/brands/${name}.${rasterMarks.has(name) ? "png" : "svg"}`
        }
        width={name === "privy" || name === "mockito" ? Math.round(size * 1.8) : size}
        height={size}
      />
    );
  return (
    <svg aria-hidden="true" className={styles.mark} height={size} role="presentation" width={size}>
      <use href={`/brands.svg#${name}`} />
    </svg>
  );
}
