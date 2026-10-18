import { constants } from "node:fs";
import { open } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { eventIntent } from "../src/features/analytics/domain/events.ts";
import { interactionIntent } from "../src/features/analytics/domain/interactions.ts";

const failure = "Analytics receipt validation failed; report values are omitted";
const countKeys = [
  "attempted",
  "validated",
  "accepted",
  "distinct_event_ids",
  "v1",
  "v2",
  "page_views",
  "public_clicks",
  "section_exposures",
  "navigation_clicks",
  "published_grid_clicks",
  "withheld_grid_clicks",
  "paid_calls",
] as const;
const ledgerKeys = [
  "scope",
  "utc_day",
  ...countKeys,
  "semantic_groups",
  "interaction_groups",
  "country_collection",
  "database_assertion",
];

function requireValue(condition: unknown): asserts condition {
  if (!condition) throw new Error(failure);
}

function record(value: unknown): Record<string, unknown> {
  requireValue(value !== null && typeof value === "object" && !Array.isArray(value));
  requireValue([Object.prototype, null].includes(Object.getPrototypeOf(value)));
  return value as Record<string, unknown>;
}

function array(value: unknown): unknown[] {
  requireValue(Array.isArray(value) && value.length <= 128);
  return value;
}

function keys(value: Record<string, unknown>, expected: readonly string[]) {
  requireValue(Reflect.ownKeys(value).length === expected.length);
  requireValue(expected.every((key) => Object.hasOwn(value, key)));
}

function count(value: unknown, positive = false): number {
  requireValue(typeof value === "number" && Number.isSafeInteger(value));
  requireValue(value >= (positive ? 1 : 0) && value < 32);
  return value;
}

type Group = Record<string, string | number | null>;

function groups(value: unknown, interaction: boolean): Group[] {
  const dimensions = interaction
    ? [
        "event_name",
        "section",
        "locale",
        "region_id",
        "layout_revision",
        "viewport",
        "cell_x",
        "cell_y",
      ]
    : ["event_name", "section", "locale", "target"];
  const seen = new Set<string>();
  return array(value).map((entry) => {
    const group = record(entry);
    keys(group, [...dimensions, "count"]);
    requireValue(group.section === "cv" || group.section === "contact");
    const intent: Record<string, unknown> = {};
    for (const dimension of dimensions) {
      const item = group[dimension];
      if (
        (dimension === "target" || dimension === "cell_x" || dimension === "cell_y") &&
        item === null
      )
        continue;
      intent[dimension] = item;
    }
    if (interaction) {
      requireValue(group.viewport === "desktop");
      const click = group.event_name === "public_click";
      requireValue(
        click
          ? group.cell_x !== null && group.cell_y !== null
          : group.cell_x === null && group.cell_y === null,
      );
    }
    requireValue(interaction ? interactionIntent(intent) : eventIntent(intent));
    const normalized: Group = {};
    for (const dimension of dimensions) {
      const item = group[dimension];
      requireValue(item === null || typeof item === "string" || typeof item === "number");
      normalized[dimension] = item;
    }
    const identity = JSON.stringify(normalized);
    requireValue(!seen.has(identity));
    seen.add(identity);
    return { ...normalized, count: count(group.count, true) };
  });
}

function validateLedger(value: unknown) {
  const ledger = record(value);
  keys(ledger, ledgerKeys);
  requireValue(ledger.scope === "disposable-native-browser-and-authenticated-backoffice");
  requireValue(ledger.country_collection === "disabled" && ledger.paid_calls === 0);
  requireValue(ledger.database_assertion === "separate API-owner receipt required");
  requireValue(typeof ledger.utc_day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ledger.utc_day));
  const day = new Date(`${ledger.utc_day}T00:00:00Z`);
  requireValue(Number.isFinite(day.getTime()) && day.toISOString().slice(0, 10) === ledger.utc_day);
  const counts = Object.fromEntries(countKeys.map((key) => [key, count(ledger[key])])) as Record<
    (typeof countKeys)[number],
    number
  >;
  requireValue(
    counts.accepted > 0 && counts.v1 > 0 && counts.v2 > 0 && counts.section_exposures > 0,
  );
  requireValue(
    [counts.attempted, counts.validated, counts.distinct_event_ids].every(
      (item) => item === counts.accepted,
    ),
  );
  requireValue(counts.accepted === counts.v1 + counts.v2);
  requireValue(
    counts.page_views === 3 && counts.navigation_clicks === 1 && counts.public_clicks === 8,
  );
  requireValue(counts.published_grid_clicks === 6 && counts.withheld_grid_clicks === 2);
  requireValue(counts.public_clicks === counts.published_grid_clicks + counts.withheld_grid_clicks);
  requireValue(counts.v1 === counts.page_views + counts.navigation_clicks);
  requireValue(counts.v2 === counts.public_clicks + counts.section_exposures);
  const semantic = groups(ledger.semantic_groups, false);
  const interaction = groups(ledger.interaction_groups, true);
  const sum = (items: Group[], event?: string) =>
    items.reduce(
      (total, group) =>
        total + (event === undefined || group.event_name === event ? Number(group.count) : 0),
      0,
    );
  requireValue(sum(semantic) === counts.v1 && sum(interaction) === counts.v2);
  requireValue(sum(semantic, "page_view") === counts.page_views);
  requireValue(sum(semantic, "navigation_click") === counts.navigation_clicks);
  requireValue(sum(interaction, "public_click") === counts.public_clicks);
  requireValue(sum(interaction, "section_exposure") === counts.section_exposures);
  return {
    scope: ledger.scope,
    utc_day: ledger.utc_day,
    ...counts,
    semantic_groups: semantic,
    interaction_groups: interaction,
    country_collection: ledger.country_collection,
    database_assertion: ledger.database_assertion,
  };
}

/** Extracts a single successful native-fixture ledger; never returns reporter diagnostics. */
export function extractAnalyticsReceipt(value: unknown) {
  try {
    const report = record(value);
    const stats = record(report.stats);
    requireValue(
      stats.expected === 1 && stats.unexpected === 0 && stats.flaky === 0 && stats.skipped === 0,
    );
    requireValue(array(report.errors).length === 0);
    const tests: Record<string, unknown>[] = [];
    let visited = 0;
    const visit = (suiteValue: unknown, depth: number) => {
      requireValue(depth < 16 && ++visited <= 128);
      const suite = record(suiteValue);
      for (const specValue of array(suite.specs)) {
        const spec = record(specValue);
        requireValue(spec.ok === true);
        tests.push(...array(spec.tests).map(record));
      }
      for (const child of array(suite.suites ?? [])) visit(child, depth + 1);
    };
    for (const suite of array(report.suites)) visit(suite, 0);
    requireValue(tests.length === 1);
    const test = tests[0];
    requireValue(test.status === "expected" && test.expectedStatus === "passed");
    const results = array(test.results);
    requireValue(results.length === 1);
    const result = record(results[0]);
    requireValue(result.status === "passed" && result.retry === 0);
    requireValue(array(result.errors).length === 0 && result.error === undefined);
    const attachments = array(result.attachments);
    requireValue(attachments.length === 1);
    const attachment = record(attachments[0]);
    keys(attachment, ["name", "contentType", "body"]);
    requireValue(attachment.name === "native-browser-and-backoffice.json");
    requireValue(
      attachment.contentType === "application/json" && typeof attachment.body === "string",
    );
    const encoded = attachment.body;
    requireValue(encoded.length > 0 && encoded.length < 87_384);
    requireValue(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded));
    const decoded = Buffer.from(encoded, "base64");
    requireValue(decoded.length < 65_536 && decoded.toString("base64") === encoded);
    const text = new TextDecoder("utf-8", { fatal: true }).decode(decoded);
    return validateLedger(JSON.parse(text));
  } catch {
    throw new Error(failure);
  }
}

async function main() {
  requireValue(process.argv.length === 4);
  const [input, output] = process.argv.slice(2);
  requireValue(path.resolve(input) !== path.resolve(output));
  const file = await open(input, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  let receipt: ReturnType<typeof extractAnalyticsReceipt>;
  try {
    const metadata = await file.stat();
    requireValue(metadata.isFile() && metadata.size > 0 && metadata.size <= 2_097_152);
    const bytes = Buffer.alloc(2_097_153);
    let length = 0;
    while (length < bytes.length) {
      const read = await file.read(bytes, length, bytes.length - length, null);
      if (read.bytesRead === 0) break;
      length += read.bytesRead;
    }
    requireValue(length <= 2_097_152);
    receipt = extractAnalyticsReceipt(
      JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, length))),
    );
  } finally {
    await file.close();
  }
  const destination = await open(output, "wx", 0o600);
  try {
    await destination.writeFile(`${JSON.stringify(receipt, null, 2)}\n`);
  } finally {
    await destination.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => {
    process.stderr.write(`${failure}\n`);
    process.exitCode = 1;
  });
}
