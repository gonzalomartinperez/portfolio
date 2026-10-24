import type { AboutCopy } from "../about-copy";

export const aboutCopy: AboutCopy = {
  metaTitle: "About",
  metaDescription:
    "Gonzalo Martin Perez: AI engineering, software engineering, and product engineering. Background, engineering approach, and fully remote opportunities.",
  eyebrow: "About",
  title: "LLM agents, built into real products",
  intro:
    "I earned my degree in Information Systems Engineering from Universidad Nacional del Sur. Since 2024, I’ve combined independent projects with engineering roles in enterprise software, fintech, and blockchain integrations.",
  paragraphs: [
    "I built systems for merchants and enterprise back offices, connecting services and incorporating fintech and blockchain integrations. Filomena, my final-year project, marked the completion of my degree and grew into an exam platform used by five institutions in Argentina. We developed it as a three-person team.",
    "Today I own all engineering at Rampy, an early-stage fintech and blockchain startup whose non-custodial app opens the world of digital assets (swaps, yield vaults, perps and market news) to everyday people through a generative interface that turns complex concepts into simple ones. I work directly with three co-founders on a codebase I took over from earlier developers, and I own the AI assistant (the agents, their evals and the backend behind them) and the web and mobile app where people use it. Priorities move fast, so I balance getting useful changes into users’ hands with keeping the product easy to maintain and grow.",
    "I treat reliability as something to measure: typed contracts between the agent and the UI, automated tests, eval runs before each release, tracing in production and tools that only run inside explicit limits.",
    "When a small team needs it, I also handle deployment: Coolify, NGINX, Traefik and Caddy.",
    "I like the point where a vague product question becomes a measurable one: what the agent should do, how we test it and what it costs. That is usually where I help a small team most.",
  ],
  asideCurrently: "Currently",
  asideArrangement: "Working arrangement",
  asideLanguages: "Languages",
  asideAvailability: "Availability",
  focusEyebrow: "What I bring",
  focusHeading: "Connecting AI, product, and systems",
  focus: [
    {
      id: "ai",
      title: "AI integrated into the product",
      body: "Agents, GraphRAG, and tools grounded in the business context. Evaluations, guardrails, and observability help me understand their behavior and identify where they need to improve.",
    },
    {
      id: "product",
      title: "Web and mobile experiences",
      body: "Clear workflows, design systems, and reusable components. I connect interfaces with services and pay attention to perceived speed, accessibility, and error states.",
    },
    {
      id: "systems",
      title: "Enterprise software and fintech",
      body: "Service, permission, and data integrations with explicit contracts. I also connect products with DeFi protocols, markets, and wallets, accounting for the specifics of each operation.",
    },
  ],
  principlesEyebrow: "How I work",
  principlesHeading: "Engineering standards centered on the user",
  principlesIntro:
    "These standards guide how I turn a need into a working feature, from the first questions to what happens after release.",
  principles: [
    {
      title: "Start with what the user needs",
      body: "I first understand what the user needs to accomplish, what constrains the solution, and how we’ll know it works. That guides a clear, accessible, and useful experience.",
    },
    {
      title: "Build for change",
      body: "I organize code by domain, separate responsibilities, and define clear contracts. Reusable components and documented decisions make new features easier to understand, test, and maintain.",
    },
    {
      title: "Improve performance with evidence",
      body: "I measure the full journey, find where time is lost, and compare the results after each change. I prioritize what users notice: quick startup, responsive interactions, and smooth transitions.",
    },
    {
      title: "Give failures a way forward",
      body: "I plan for invalid inputs, permission issues, and failures in external services. I define clear responses, safe choices, and recovery paths. Observability helps me detect problems and act before they escalate.",
    },
    {
      title: "Verify quality through production",
      body: "I combine automated tests, integration checks, and human review of the user experience. After release, I monitor real behavior. For AI, I also evaluate responses, tool use, and guardrails against representative scenarios.",
    },
  ],
  lookingEyebrow: "My next step",
  lookingHeading: "AI and software engineering, with a product focus",
  lookingParagraphs: [
    "I’m looking for fully remote AI Engineer roles building LLM agents, RAG and GraphRAG systems, and the evals that keep them reliable. My core stack is Python/FastAPI, LangGraph, Claude, LangSmith and vector retrieval.",
    "I’m also open to software, backend, and full-stack engineering roles where I can contribute my experience with enterprise systems, web and mobile applications, and integrations. I enjoy contributing to product decisions and seeing features through from initial requirements to production.",
    "I’m open to new opportunities and available for interviews.",
  ],
};
