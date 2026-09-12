import type { Credential, EvidenceLink, Metric, Ranking } from "../types";

export const degree = {
  qualification: "Information Systems Engineer",
  institution: "Universidad Nacional del Sur",
  institutionShort: "UNS",
  institutionHref: "https://www.uns.edu.ar/",
  location: "Bahía Blanca, Argentina",
  period: "Jan 2020 – Oct 2025",
  status: "Graduated",
  programme: "A five-year accredited engineering programme.",
};

export const academicResults: Metric[] = [
  {
    value: "8.67 / 10",
    label: "average grade",
    qualifier: "Across the full degree, on the Argentine 1–10 scale.",
  },
  {
    value: "34 / 34",
    label: "required courses passed",
    qualifier: "Every course in the programme, with no outstanding subjects.",
  },
  {
    value: "10 / 10",
    label: "final year project",
    qualifier: "Filomena, graded at the maximum mark.",
  },
];

export const coursework = [
  "AI Systems",
  "Systems Architecture & Design",
  "Web Application Engineering",
  "Databases",
  "Software Verification & Validation",
  "Quality Management",
  "Computer Networks",
  "Algorithms & Complexity",
  "Formal Methods",
];

export const professionalPractice = {
  title: "Supervised Professional Practice",
  detail: "Completed in August 2025 as a degree requirement.",
};

/**
 * Rankings are institutional context, never evidence of individual performance. Each one
 * carries its edition, because a position without an edition is not a verifiable claim.
 */
export const rankings: Ranking[] = [
  {
    position: "#10 nationally",
    source: "SCImago Institutions Rankings",
    edition: "2026 edition",
    href: "https://www.scimagoir.com/rankings.php?country=ARG&ranking=Overall&sector=Higher+educ.",
  },
  {
    position: "#8 nationally",
    source: "CWUR",
    edition: "Five consecutive editions: 2020–21, 2021–22, 2022–23, 2023 and 2024",
    href: "https://cwur.org/2024/national-university-of-the-south.php",
  },
];

export const rankingCaveat =
  "These describe the institution, in the edition named. They are not a measure of my " +
  "individual performance — the degree, the grades and the project are.";

export const credentials: Credential[] = [
  { title: "Docker Fundamentals", issuer: "Universidad Nacional del Sur", date: "Mar 2024" },
  { title: "Professional Power Skills", issuer: "Kognité", date: "Jun 2026" },
];

export const credentialNote =
  "Completed certifications only. I am studying toward others and will list them when they " +
  "are finished, not before.";

export const academicEvidence: EvidenceLink[] = [
  {
    label: "Verified academic record",
    href: "https://vine-jupiter-8df.notion.site/Academic-Record-Information-Systems-Engineering-UNS-367b68807486817db09bc3f178ae0ffb",
    description: "Full record with official verification",
  },
];

export const languageNote =
  "Two university English examinations were required to graduate. They do not change my " +
  "declared level, which is B2.";

/**
 * The complete degree programme, taken from the university's published plan. It is the
 * curriculum, not a transcript: no grades appear here, and none are implied.
 */
export const curriculum: { year: string; subjects: string[] }[] = [
  {
    year: "Year 1",
    subjects: [
      "Problem Solving & Algorithms",
      "Algebra & Geometry",
      "Calculus I",
      "Introduction to Object-Oriented Programming",
      "Formal Languages & Automata",
      "Introduction to Software Engineering",
    ],
  },
  {
    year: "Year 2",
    subjects: [
      "Calculus II",
      "Data Structures",
      "Computability Theory",
      "Programming Technology",
      "Computer Organisation",
      "Software Models",
    ],
  },
  {
    year: "Year 3",
    subjects: [
      "Statistical Models for Computer Science",
      "Logic for Computer Science",
      "Systems Requirements",
      "Computer Architecture",
      "Formal Methods for Software Engineering",
      "Chemistry",
      "Operating Systems",
    ],
  },
  {
    year: "Year 4",
    subjects: [
      "Databases",
      "Web Application Engineering",
      "Systems Architecture & Design",
      "Algorithms & Complexity",
      "Software Systems Projects",
      "Software Verification & Validation",
      "Physics I",
    ],
  },
  {
    year: "Year 5",
    subjects: [
      "Software Quality Management",
      "Supervised Professional Practice",
      "Business Economics",
      "Computer Networks",
      "Systems Auditing",
      "Artificial Intelligent Systems",
      "Physics II",
      "Final Year Project",
    ],
  },
];

export const curriculumNote =
  "Plan 2012 of the Information Systems Engineering degree at Universidad Nacional del Sur, " +
  "in full. All 34 were passed.";
