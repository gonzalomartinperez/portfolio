/**
 * Technologies that have a brand glyph, in the order they are shown.
 *
 * The mark is always paired with the name, so the name alone still carries the meaning. A
 * technology without a glyph in the set is simply not in this list — it still appears as text
 * on the stack page, which is the authoritative listing.
 */
export const techMarks: { icon: string; name: string }[] = [
  { icon: "python", name: "Python" },
  { icon: "typescript", name: "TypeScript" },
  { icon: "openjdk", name: "Java" },
  { icon: "javascript", name: "JavaScript" },
  { icon: "nodedotjs", name: "Node.js" },
  { icon: "php", name: "PHP" },

  { icon: "springboot", name: "Spring Boot" },
  { icon: "spring", name: "Spring" },
  { icon: "fastapi", name: "FastAPI" },
  { icon: "nestjs", name: "NestJS" },
  { icon: "laravel", name: "Laravel" },

  { icon: "react", name: "React" },
  { icon: "nextdotjs", name: "Next.js" },
  { icon: "wordpress", name: "WordPress" },

  { icon: "langchain", name: "LangChain" },
  { icon: "anthropic", name: "Claude API" },
  { icon: "openai", name: "LLM integration" },

  { icon: "postgresql", name: "PostgreSQL" },
  { icon: "mysql", name: "MySQL" },
  { icon: "redis", name: "Redis" },
  { icon: "mongodb", name: "MongoDB" },

  { icon: "amazonwebservices", name: "AWS" },
  { icon: "awslambda", name: "Lambda" },
  { icon: "amazons3", name: "S3" },
  { icon: "docker", name: "Docker" },
  { icon: "kubernetes", name: "Kubernetes" },
  { icon: "helm", name: "Helm" },
  { icon: "linux", name: "Linux" },

  { icon: "git", name: "Git" },
  { icon: "githubactions", name: "GitHub Actions" },
  { icon: "gitlab", name: "GitLab CI/CD" },
  { icon: "apachemaven", name: "Maven" },

  { icon: "prometheus", name: "Prometheus" },
  { icon: "grafana", name: "Grafana" },
  { icon: "opentelemetry", name: "OpenTelemetry" },
  { icon: "sonarqube", name: "SonarQube" },
  { icon: "jest", name: "Jest" },

  { icon: "jira", name: "Jira" },
  { icon: "trello", name: "Trello" },
];
