import assert from "node:assert/strict";
import test from "node:test";
import { routeConnection } from "../../src/features/architecture-diagrams/domain/architecture-edge-routing.ts";
import type { EnterpriseKind } from "../../src/features/architecture-diagrams/domain/architecture-types.ts";
import {
  enterpriseConnections,
  enterpriseLayout,
  enterpriseSteps,
} from "../../src/features/architecture-diagrams/domain/enterprise-architecture-layout.ts";
import {
  filomenaConnections,
  filomenaDesktopPositions,
  filomenaMobilePositions,
  filomenaSteps,
} from "../../src/features/architecture-diagrams/domain/filomena-architecture-layout.ts";

const locales = ["en", "es"] as const;
const enterpriseKinds: EnterpriseKind[] = ["rampy", "teamcubation", "cooperativa-obrera"];

for (const kind of enterpriseKinds) {
  test(`${kind} retains the same node identities across languages`, () => {
    const ids = locales.map((locale) => enterpriseSteps(kind, locale).map(({ id }) => id));
    assert.deepEqual(ids[0], ids[1]);
    assert.equal(new Set(ids[0]).size, ids[0].length);
  });

  for (const locale of locales) {
    for (const vertical of [false, true]) {
      test(`${kind} ${locale} ${vertical ? "mobile" : "desktop"} connections have valid routes`, () => {
        const layout = enterpriseLayout(kind, vertical, locale);
        const nodes = enterpriseSteps(kind, locale);
        for (const node of nodes) {
          assert.ok(layout.positions[node.id], `Missing position: ${node.id}`);
          assert.ok(node.title.trim(), `Missing title: ${node.id}`);
          assert.ok(node.detail.trim(), `Missing detail: ${node.id}`);
        }
        const endpoints = Object.fromEntries(
          layout.groups
            .filter((group) => !group.deployment)
            .map((group) => [
              group.id,
              { ...group.position, width: group.width, height: group.height },
            ]),
        );
        for (const { source, target } of enterpriseConnections[kind]) {
          assert.ok(layout.positions[source] ?? endpoints[source], `Missing source: ${source}`);
          assert.ok(layout.positions[target] ?? endpoints[target], `Missing target: ${target}`);
          const route = routeConnection(
            source,
            target,
            layout.positions,
            layout.width,
            layout.height,
            endpoints,
          );
          assert.ok(route.points.length >= 2, `${source} → ${target}`);
          for (const point of route.points) {
            assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
          }
        }
      });
    }
  }
}

test("Filomena's translated graphs share complete desktop and mobile positions", () => {
  const ids = filomenaSteps.en.map(({ id }) => id);
  assert.deepEqual(
    ids,
    filomenaSteps.es.map(({ id }) => id),
  );
  assert.equal(new Set(ids).size, ids.length);
  for (const positions of [filomenaDesktopPositions, filomenaMobilePositions]) {
    assert.deepEqual(Object.keys(positions).sort(), [...ids].sort());
    for (const [source, target] of filomenaConnections) {
      assert.ok(positions[source], `Missing source: ${source}`);
      assert.ok(positions[target], `Missing target: ${target}`);
    }
  }
});
