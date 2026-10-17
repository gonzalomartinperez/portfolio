/** Build-time gate; enabling the assistant never enables product analytics. */
export function isAnalyticsEnabled(value: string | undefined): boolean {
  if (value === undefined || value === "false") return false;
  if (value === "true") return true;
  throw new Error("ANALYTICS_ENABLED must be true or false");
}
