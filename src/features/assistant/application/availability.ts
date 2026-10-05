export function isAssistantEnabled(value: string | undefined): boolean {
  if (value === undefined || value === "false") return false;
  if (value === "true") return true;
  throw new Error("ASSISTANT_ENABLED must be true or false.");
}
