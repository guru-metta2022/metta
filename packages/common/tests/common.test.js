import test from "node:test";
import assert from "node:assert/strict";
import { PRECEPTS, DHAMMA_NODES, MettaClient } from "../src/index.js";

test("PRECEPTS contains 5 canonical precepts", () => {
  assert.equal(PRECEPTS.length, 5);
  assert.equal(PRECEPTS[0].id, 1);
  assert.match(PRECEPTS[0].pali, /Pāṇātipātā/);
});

test("DHAMMA_NODES has distress and equanimity categories", () => {
  assert.equal(DHAMMA_NODES.distress.length, 4);
  assert.equal(DHAMMA_NODES.equanimity.length, 4);
});

test("MettaClient instantiates with default base url", () => {
  const client = new MettaClient({ baseUrl: "https://api.metta.internal" });
  assert.equal(client.baseUrl, "https://api.metta.internal");
});
