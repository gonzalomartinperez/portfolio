import type { Credential, EvidenceLink, Metric, Ranking } from "../types";

export const degree = {
  qualification: "Ingeniero en Sistemas de Información",
  institution: "Universidad Nacional del Sur",
  institutionShort: "UNS",
  institutionHref: "https://www.uns.edu.ar/",
  location: "Bahía Blanca, Argentina",
  period: "Ene 2020 – Oct 2025",
  status: "Graduado",
  programme: "Una carrera de ingeniería acreditada de cinco años.",
};

export const academicResults: Metric[] = [
  {
    value: "8,67 / 10",
    label: "promedio",
    qualifier: "Sobre la carrera completa, en la escala argentina de 1 a 10.",
  },
  {
    value: "34 / 34",
    label: "materias obligatorias aprobadas",
    qualifier: "Todas las materias del plan, sin asignaturas pendientes.",
  },
  {
    value: "10 / 10",
    label: "proyecto final",
    qualifier: "Filomena, calificado con la nota máxima.",
  },
];

export const coursework = [
  "Sistemas Inteligentes Artificiales",
  "Verificación y Validación de Software",
  "Arquitectura y Diseño de Sistemas",
  "Bases de Datos",
  "Algoritmos y Complejidad",
  "Estructuras de Datos",
  "Sistemas Operativos",
  "Ingeniería de Aplicaciones Web",
  "Proyectos de Sistemas de Software",
  "Redes de Computadoras",
  "Métodos Formales para Ingeniería de Software",
  "Gestión de Calidad en el Software",
];

export const professionalPractice = {
  title: "Práctica Profesional Supervisada",
  detail: "Completada en agosto de 2025 como requisito de la carrera.",
};

/**
 * Los rankings son contexto institucional, nunca evidencia de desempeño individual. Cada uno
 * lleva su edición, porque una posición sin edición no es una afirmación verificable.
 */
export const rankings: Ranking[] = [
  {
    position: "#10 nacional",
    source: "SCImago Institutions Rankings",
    edition: "Edición 2026",
    href: "https://www.scimagoir.com/rankings.php?country=ARG&ranking=Overall&sector=Higher+educ.",
  },
  {
    position: "#8 nacional",
    source: "CWUR",
    edition: "Cinco ediciones consecutivas: 2020–21, 2021–22, 2022–23, 2023 y 2024",
    href: "https://cwur.org/2024/national-university-of-the-south.php",
  },
];

export const rankingCaveat =
  "Las posiciones institucionales se presentan con su ranking y edición.";

export const credentials: Credential[] = [
  { title: "Fundamentos de Docker", issuer: "Universidad Nacional del Sur", date: "Mar 2024" },
  { title: "Professional Power Skills", issuer: "Kognité", date: "Jun 2026" },
];

export const credentialNote =
  "Formación completada en fundamentos de contenedores y habilidades profesionales.";

export const academicEvidence: EvidenceLink[] = [
  {
    label: "Registro académico verificado",
    href: "https://vine-jupiter-8df.notion.site/Registro-Acad-mico-Ingenier-a-en-Sistemas-de-Informaci-n-UNS-367b6880748681d2af22f678fb406878",
    description: "Registro completo con verificación oficial",
  },
];

export const languageNote =
  "Inglés: comunicación profesional general (B2). La carrera incluyó además dos evaluaciones universitarias de inglés.";

/**
 * The complete degree programme, taken from the university's published plan. It is the
 * curriculum, not a transcript: no grades appear here, and none are implied.
 */
export const curriculum: { year: string; subjects: string[] }[] = [
  {
    year: "Primer año",
    subjects: [
      "Resolución de Problemas y Algoritmos",
      "Elementos de Álgebra y de Geometría",
      "Análisis Matemático I",
      "Introducción a la Programación Orientada a Objetos",
      "Lenguajes Formales y Autómatas",
      "Introducción a la Ingeniería de Software",
    ],
  },
  {
    year: "Segundo año",
    subjects: [
      "Análisis Matemático II",
      "Estructuras de Datos",
      "Teoría de la Computabilidad",
      "Tecnología de Programación",
      "Organización de Computadoras",
      "Modelos de Software",
    ],
  },
  {
    year: "Tercer año",
    subjects: [
      "Modelos Estadísticos para Ciencias de la Computación",
      "Lógica para Ciencias de la Computación",
      "Requerimientos de Sistemas",
      "Arquitectura de Computadoras",
      "Métodos Formales para Ingeniería de Software",
      "Química",
      "Sistemas Operativos",
    ],
  },
  {
    year: "Cuarto año",
    subjects: [
      "Bases de Datos",
      "Ingeniería de Aplicaciones Web",
      "Arquitectura y Diseño de Sistemas",
      "Algoritmos y Complejidad",
      "Proyectos de Sistemas de Software",
      "Verificación y Validación de Software",
      "Física I",
    ],
  },
  {
    year: "Quinto año",
    subjects: [
      "Gestión de Calidad en el Software",
      "Práctica Profesional Supervisada",
      "Economía de la Empresa",
      "Redes de Computadoras",
      "Auditoría de Sistemas",
      "Sistemas Inteligentes Artificiales",
      "Física II",
      "Proyecto Final",
    ],
  },
];

export const curriculumNote =
  "El Plan 2012 de la universidad describe la estructura del programa. Las materias aprobadas y las calificaciones individuales se documentan por separado en el registro académico verificado.";
