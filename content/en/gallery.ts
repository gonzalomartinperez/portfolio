/** Alt text describing what each capture shows, keyed by the shared gallery ids. */
export const galleryAlt: Record<string, string> = {
  "005": "Exam list with publication and completion states",
  "006": "Confirmation dialog for deleting an exam",
  "007": "Exam creation form and navigation settings",
  "011": "User creation form with exam-specific roles",
  "012": "Existing-user search dialog",
  "019": "Exam section management",
  "023": "Clinical-case list and examiner assignments",
  "028": "Question creation form with image attachments",
  "032": "Assessment rubric list",
  "034": "Rubric creation with sections and scoring items",
  "038": "Exam resource library with document uploads",
  "044": "Examiner grading progress dashboard",
  "049": "Report availability before exam completion",
  "052": "Student welcome screen and exam entry",
  "053": "Exam access-code dialog",
  "058": "Confirmation dialog before starting an exam",
  "060": "Answer editor with automatic saving",
  "063": "Confirmation before saving and advancing",
  "068": "Completed exam screen and answer-report download",
  "070": "Examiner welcome screen",
  "074": "Assigned case awaiting assessment",
  "075": "Question-by-question grading progress",
  "076": "Pseudonymous student assessment queue",
  "078": "Bulk approval of rubric items",
  "079": "Bulk rejection of rubric items",
  "086": "Completed grading and correction-report download",
  "090": "Application health checks for database, cache and queues",
  "001": "Filomena login screen, asking for a national ID number and a password",
  "004": "Administrator home page listing the ordered steps to set up an exam",
  "015": "Spreadsheet import screen with a file drop zone, a template download and a role selector",
  "026": "Question bank listing clinical scenarios, their prompts and their order",
  "029": "Question editor filled in with a clinical scenario and the question asked about it",
  "033":
    "Checklist detail listing scored items, their point values and the question each belongs to",
  "017": "Table of numbered pseudonyms, with a checkmark indicating which are currently in use",
  "040":
    "Exam administration console with start, finish and defense controls beside live monitor tiles",
  "057":
    "Exam entry card showing the exam code, the student pseudonym assigned for it and the rules",
  "059": "An exam in progress, showing case one, question one of seven and the scenario text",
  "066": "Gestation calculator built into the exam, with a date wheel and the dates it derives",
  "043": "Live monitor listing students by pseudonym with their progress and an alert control",
  "045": "Real-time gauges showing student and evaluator completion during a running exam",
  "077": "Correction screen with a student answer beside the yes or no checklist used to score it",
  "051": "Reports page with four exports available once the exam has finished",
  "091": "Grafana dashboard showing service health checks and record counts per exam model",
};

/** Alt text for the Pequeverso captures, keyed by the shared gallery ids. */
export const pequeversoGalleryAlt: Record<string, string> = {
  "store-home":
    "Pequeverso store home page with the Grafismo Fonético kit, its price and a call to action",
  "store-support":
    "Store support page with refund and contact options, and the assistant launcher in the corner",
  "assistant-panel-welcome":
    "Assistant panel at its real desktop size, with a welcome message, suggested questions and the message box",
  "assistant-panel-answer":
    "Assistant panel answering a guarantee question with two expanded sources, using a test model",
  "assistant-waiting":
    "Assistant open on the store page while it waits for an answer, with a control to cancel the request",
  "assistant-expanded":
    "Expanded assistant view with the answer, its sources, a product card with a validated price and related materials",
  "assistant-mobile-answer":
    "Assistant on a phone with the answer, expanded sources, a product card and the fixed message box",
  "backoffice-mobile-status":
    "Back office status page on a phone, with availability and remaining budget labelled as synthetic data",
  "backoffice-availability":
    "Back office availability summary: accepting questions, remaining monthly budget, completed answers and time to first text",
  "backoffice-budget":
    "Monthly budget with reported usage, estimated and reserved spend against the configured limit, using synthetic data",
  "backoffice-catalog":
    "Catalog panel with the store revision, last verified sync, price window and indexed documents",
  "backoffice-daily":
    "Daily activity charts for runs and cost per day, with the accessible data table below",
  "backoffice-quality":
    "Request outcomes for the last 24 hours and 30 days, with latency percentiles, token usage and failure codes",
  "backoffice-runs":
    "Recent runs with status, model, language, latency and opaque synthetic identifiers, without conversation content",
  "backoffice-analytics":
    "Site activity report with nine synthetic events and filters for period, page, section and screen width",
  "backoffice-access":
    "Back office access page for inviting people with a role and revoking pending invitations, using test accounts",
};
