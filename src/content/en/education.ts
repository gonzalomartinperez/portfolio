import { certificateFiles } from "../site-config";
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
  "Software Verification & Validation",
  "Systems Architecture & Design",
  "Databases",
  "Algorithms & Complexity",
  "Data Structures",
  "Operating Systems",
  "Web Application Engineering",
  "Software Systems Projects",
  "Computer Networks",
  "Formal Methods for Software Engineering",
  "Software Quality Management",
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

export const rankingCaveat = "Institutional positions are shown with their ranking and edition.";

export const credentials: Credential[] = [
  {
    title: "Docker Fundamentals",
    issuer: "Universidad Nacional del Sur",
    date: "Mar 2024",
    evidence: certificateFiles.docker,
  },
  {
    title: "Professional Power Skills",
    issuer: "Kognité",
    date: "Jun 2026",
    evidence: certificateFiles.powerSkills,
  },
];

export const credentialNote =
  "Completed training in container fundamentals and professional collaboration.";

export const academicEvidence: EvidenceLink[] = [
  {
    label: "Verified academic record",
    href: "https://vine-jupiter-8df.notion.site/Academic-Record-Information-Systems-Engineering-UNS-367b68807486817db09bc3f178ae0ffb",
    description: "Full record with official verification",
  },
];

export const languageNote =
  "English: professional working proficiency (B2). The degree also included two university English examinations.";

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
      "Artificial Intelligence Systems",
      "Physics II",
      "Final Year Project",
    ],
  },
];

export const curriculumNote =
  "The university’s Plan 2012 describes the programme structure below. Course completion and individual grades are documented separately in the verified academic record.";
