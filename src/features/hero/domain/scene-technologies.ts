import type { Technology } from "@content/technologies";

const illustratedSceneTechnologies = new Set(["agent-evaluation", "graphrag", "pgvector", "rag"]);

// Curate the scene independently so catalogue growth does not crowd its layout.
const selectedSceneMarks = new Set([
  "celery",
  "langchain",
  "langgraph",
  "langsmith",
  "openai",
  "anthropic",
  "googlecloud",
  "pydantic",
  "mem0",
  "deepinfra",
  "rag",
  "pgvector",
  "agent-evaluation",
  "python",
  "typescript",
  "react",
  "nextdotjs",
  "nodedotjs",
  "nestjs",
  "openjdk",
  "spring",
  "fastapi",
  "postgresql",
  "redis",
  "sqlalchemy",
  "neo4j",
  "graphrag",
  "docker",
  "kubernetes",
  "amazonwebservices",
  "digitalocean",
  "githubactions",
  "pytest",
  "sentry",
  "expo",
]);

export function getSceneMarkIdentity(technology: Technology): string | undefined {
  if (technology.icon) {
    const identity = technology.icon === "springboot" ? "spring" : technology.icon;
    return selectedSceneMarks.has(identity) ? identity : undefined;
  }
  return illustratedSceneTechnologies.has(technology.id) ? technology.id : undefined;
}
