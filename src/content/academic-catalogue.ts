export type AcademicLocale = "en" | "es";
type CourseRow = readonly [
  code: string,
  es: string,
  en: string,
  year: number,
  semester: number,
  grade: number | "AP",
  completed: string,
];

const rows: readonly CourseRow[] = [
  [
    "5793",
    "Resolución de Problemas y Algoritmos",
    "Problem Solving and Algorithms",
    1,
    1,
    9,
    "2020-07-31",
  ],
  [
    "5912",
    "Elementos de Álgebra y de Geometría",
    "Elements of Algebra and Geometry",
    1,
    1,
    8,
    "2020-09-01",
  ],
  ["5551", "Análisis Matemático I", "Calculus I", 1, 1, 8, "2020-09-03"],
  [
    "7713",
    "Introducción a la Programación Orientada a Objetos",
    "Introduction to Object-Oriented Programming",
    1,
    2,
    9,
    "2021-02-25",
  ],
  [
    "7791",
    "Lenguajes Formales y Autómatas",
    "Formal Languages and Automata",
    1,
    2,
    10,
    "2020-12-29",
  ],
  [
    "7714",
    "Introducción a la Ingeniería de Software",
    "Introduction to Software Engineering",
    1,
    2,
    8,
    "2020-12-18",
  ],
  ["5552", "Análisis Matemático II", "Calculus II", 2, 1, 8, "2021-08-13"],
  ["7655", "Estructuras de Datos", "Data Structures", 2, 1, 8, "2021-07-16"],
  ["7949", "Teoría de la Computabilidad", "Computability Theory", 2, 1, 10, "2021-07-16"],
  ["7951", "Tecnología de Programación", "Programming Technology", 2, 2, 9, "2021-12-03"],
  ["5744", "Organización de Computadoras", "Computer Organisation", 2, 2, 8, "2022-02-25"],
  ["7821", "Modelos de Software", "Software Models", 2, 2, 8, "2021-12-03"],
  [
    "7820",
    "Modelos Estadísticos para Ciencias de la Computación",
    "Statistical Models for Computer Science",
    2,
    2,
    9,
    "2021-12-10",
  ],
  [
    "5704",
    "Lógica para Ciencias de la Computación",
    "Logic for Computer Science",
    3,
    1,
    10,
    "2022-07-01",
  ],
  ["7911", "Requerimientos de Sistemas", "Systems Requirements", 3, 1, 5, "2022-08-11"],
  ["5561", "Arquitectura de Computadoras", "Computer Architecture", 3, 1, 7, "2023-02-28"],
  [
    "7811",
    "Métodos Formales para Ingeniería de Software",
    "Formal Methods for Software Engineering",
    3,
    2,
    10,
    "2022-12-02",
  ],
  ["6601", "Química IS", "Chemistry (IS)", 3, 2, 8, "2022-12-02"],
  ["5949", "Sistemas Operativos", "Operating Systems", 3, 2, 5, "2023-08-17"],
  ["7552", "Bases de Datos", "Databases", 3, 2, 9, "2022-12-02"],
  [
    "7680",
    "Ingeniería de Aplicaciones de Web",
    "Web Application Engineering",
    4,
    1,
    10,
    "2023-08-11",
  ],
  [
    "7527",
    "Arquitectura y Diseño de Sistemas",
    "Systems Architecture and Design",
    4,
    1,
    9,
    "2023-06-30",
  ],
  ["5523", "Algoritmos y Complejidad", "Algorithms and Complexity", 4, 1, 10, "2023-06-30"],
  [
    "7891",
    "Proyectos de Sistemas de Software",
    "Software Systems Projects",
    4,
    2,
    10,
    "2023-12-01",
  ],
  [
    "7993",
    "Verificación y Validación de Software",
    "Software Verification and Validation",
    4,
    2,
    10,
    "2023-12-01",
  ],
  ["3051", "Física I", "Physics I", 4, 2, 8, "2023-12-01"],
  [
    "7668",
    "Gestión de Calidad en el Software",
    "Software Quality Management",
    5,
    1,
    9,
    "2024-06-28",
  ],
  [
    "7886",
    "Práctica Profesional Supervisada para Ingeniería de Software",
    "Supervised Professional Practice for Software Engineering",
    5,
    1,
    "AP",
    "2025-08-27",
  ],
  ["2115", "Economía de la Empresa ISS", "Business Economics (ISS)", 5, 1, 10, "2024-06-28"],
  ["7903", "Redes de Computadoras", "Computer Networks", 5, 1, 10, "2024-06-28"],
  ["7534", "Auditoría de Sistemas", "Systems Auditing", 5, 2, 9, "2024-12-16"],
  [
    "7922",
    "Sistemas Inteligentes Artificiales",
    "Artificial Intelligence Systems",
    5,
    2,
    7,
    "2024-12-12",
  ],
  ["3058", "Física II IS", "Physics II (IS)", 5, 2, 8, "2024-12-12"],
  ["7895", "Proyecto Final", "Final Year Project", 5, 2, 10, "2025-10-09"],
  [
    "5596",
    "Examen de Suficiencia de Idioma: Inglés",
    "English Proficiency Examination",
    0,
    0,
    "AP",
    "2021-03-16",
  ],
  [
    "7659",
    "Examen Integral de Idioma Inglés ISS",
    "Comprehensive English Examination (ISS)",
    0,
    0,
    "AP",
    "2024-03-08",
  ],
];

export const academicDocuments = {
  transcript: {
    href: "/documents/uns-academic-transcript-2025.pdf",
    issued: "2025-12-22",
    format: "PDF",
  },
  plan: {
    href: "/documents/uns-information-systems-plan-2012.pdf",
    format: "PDF",
    source: "https://cs.uns.edu.ar/~devcs/downloads/PlanISI2012.pdf",
  },
};

export const academicCatalogue = rows.map(([code, es, en, year, semester, grade, completed]) => ({
  id: `uns-${code}`,
  code,
  name: { es, en },
  year,
  semester,
  grade,
  completed,
  kind:
    year === 0 ? "english" : code === "7886" ? "practice" : code === "7895" ? "project" : "subject",
  evidence: {
    result: academicDocuments.transcript.href,
    plan: year ? academicDocuments.plan.href : null,
  },
}));

export function academicEntry(id: string) {
  const entry = academicCatalogue.find((course) => course.id === id);
  if (!entry) throw new Error(`Unknown academic course: ${id}`);
  return entry;
}

export const highlightedCourseIds = [
  "uns-7922",
  "uns-7552",
  "uns-5523",
  "uns-7655",
  "uns-7820",
  "uns-5704",
  "uns-7811",
  "uns-7993",
  "uns-7527",
  "uns-7680",
  "uns-7903",
  "uns-7668",
];

export const academicAreas = [
  {
    id: "ai-data",
    title: { en: "Data and artificial intelligence", es: "Datos e inteligencia artificial" },
    description: {
      en: "An academic foundation for working with data and reasoning about intelligent systems.",
      es: "Una base académica para trabajar con datos y razonar sobre sistemas inteligentes.",
    },
    courseIds: ["uns-7922", "uns-7552", "uns-7820"],
  },
  {
    id: "algorithms",
    title: { en: "Algorithms and computation", es: "Algoritmos y computación" },
    description: {
      en: "Foundations for choosing data structures and reasoning about the cost and limits of computation.",
      es: "Fundamentos para elegir estructuras de datos y razonar sobre el costo y los límites de la computación.",
    },
    courseIds: ["uns-5523", "uns-7655", "uns-7949", "uns-7791", "uns-5793"],
  },
  {
    id: "mathematics",
    title: { en: "Mathematics, statistics and logic", es: "Matemática, estadística y lógica" },
    description: {
      en: "Quantitative and logical foundations that complement applied software and AI engineering.",
      es: "Fundamentos cuantitativos y lógicos que complementan la ingeniería de software y la IA aplicada.",
    },
    courseIds: ["uns-5704", "uns-7820", "uns-5912", "uns-5551", "uns-5552"],
  },
  {
    id: "engineering",
    title: { en: "Software engineering and quality", es: "Ingeniería de software y calidad" },
    description: {
      en: "A connected view of requirements, architecture, implementation and verification.",
      es: "Una visión integrada de requerimientos, arquitectura, implementación y verificación.",
    },
    courseIds: [
      "uns-7527",
      "uns-7811",
      "uns-7993",
      "uns-7668",
      "uns-7680",
      "uns-7891",
      "uns-7911",
      "uns-7534",
    ],
  },
  {
    id: "systems",
    title: { en: "Computer systems and networks", es: "Sistemas de computación y redes" },
    description: {
      en: "A systems perspective spanning computer organisation, architecture, operating systems and networks.",
      es: "Una perspectiva de sistemas que conecta organización y arquitectura de computadoras, sistemas operativos y redes.",
    },
    courseIds: ["uns-5744", "uns-5561", "uns-5949", "uns-7903"],
  },
];

export function localizedCurriculum(locale: AcademicLocale) {
  return [1, 2, 3, 4, 5].map((year) => ({
    year: locale === "es" ? `Año ${year}` : `Year ${year}`,
    subjects: academicCatalogue
      .filter((course) => course.year === year)
      .map((course) => course.name[locale]),
  }));
}
