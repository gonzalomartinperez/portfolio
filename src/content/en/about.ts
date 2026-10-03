import type { AboutCopy } from "../about-copy";

export const aboutCopy: AboutCopy = {
  metaTitle: "About",
  metaDescription:
    "Gonzalo Martin Perez: software engineering, applied AI, and product engineering. Background, engineering approach, and fully remote opportunities.",
  eyebrow: "About",
  title: "Product engineering, with applied AI at its core",
  intro:
    "I earned my degree in Information Systems Engineering from Universidad Nacional del Sur. Since 2024, I’ve combined independent projects with engineering roles in enterprise software, fintech, and blockchain integrations.",
  paragraphs: [
    "I built systems for merchants and enterprise back offices, connecting services and incorporating fintech and blockchain integrations. Filomena, my final-year project, marked the completion of my degree and grew into an exam platform used by five institutions in Argentina. We developed it as a three-person team.",
    "Today I’m an AI Engineer at Rampy, a fast-moving startup where I work directly with three founders. I help shape ideas, make technical decisions and carry features through testing and deployment. Priorities evolve, so I balance getting useful changes into users’ hands with making the product easier to maintain and grow.",
    "I connect applied AI with software engineering standards: performance, reliability, scalability, maintainability, and security. I put them into practice through clear contracts, automated tests, agent evaluations, observability, and controlled tool execution.",
    "I enjoy understanding how the pieces of a system fit together, talking through alternatives, and breaking complex problems into smaller steps to build end-to-end solutions. I like working with a team, learning, and adding value.",
  ],
  asideCurrently: "Currently",
  asideArrangement: "Working arrangement",
  asideLanguages: "Languages",
  asideAvailability: "Availability",
  experienceAsOf: (asOf) => `As of ${asOf}`,
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
    "I’m looking for fully remote AI engineering roles building agentic systems and applied AI solutions. My focus is Python/FastAPI, LangChain/LangGraph, RAG/GraphRAG, and retrieval over vector databases.",
    "I’m also open to software, backend, and full-stack engineering roles where I can contribute my experience with enterprise systems, web and mobile applications, and integrations. I enjoy contributing to product decisions and seeing features through from initial requirements to production.",
    "I’m open to new opportunities and available for interviews.",
  ],
};
