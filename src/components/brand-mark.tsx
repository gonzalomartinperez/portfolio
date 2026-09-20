import Image from "next/image";
import styles from "./brand-mark.module.css";

const localMarks = new Set([
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

const rasterMarks = new Set(["deepinfra", "mockito", "privy"]);

export function BrandMark({ name, size = 20 }: { name: string; size?: number }) {
  if (localMarks.has(name) || rasterMarks.has(name))
    return (
      <Image
        alt=""
        aria-hidden="true"
        className={styles.original}
        src={`/brands/${name}.${rasterMarks.has(name) ? "png" : "svg"}`}
        width={size}
        height={size}
      />
    );
  return (
    <svg aria-hidden="true" className={styles.mark} height={size} role="presentation" width={size}>
      <use href={`/brands.svg#${name}`} />
    </svg>
  );
}
