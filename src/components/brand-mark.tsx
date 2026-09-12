import Image from "next/image";
import styles from "./brand-mark.module.css";

const localMarks = new Set([
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
]);

export function BrandMark({ name, size = 20 }: { name: string; size?: number }) {
  if (localMarks.has(name))
    return (
      <Image
        alt=""
        aria-hidden="true"
        className={styles.original}
        src={`/brands/${name}.svg`}
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
