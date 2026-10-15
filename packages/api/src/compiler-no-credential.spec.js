// SPDX-License-Identifier: MIT
/* eslint-env jest, node */
// L0158 holds no Learnosity credential and makes no network call: it compiles
// to an unsigned activity that L0176 signs. These tests run the compiler with
// sentinel credentials in the environment and every outbound path stubbed,
// and check that nothing reads them, nothing signs, and nothing is sent.
import { jest } from "@jest/globals";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SENTINEL_KEY = "sentinel-learnosity-key";
const SENTINEL_SECRET = "sentinel-learnosity-secret";
process.env.LEARNOSITY_KEY = SENTINEL_KEY;
process.env.LEARNOSITY_SECRET = SENTINEL_SECRET;

const fetchStub = jest.fn(async () => {
  throw new Error("L0158 must not make network calls");
});
const originalFetch = globalThis.fetch;
globalThis.fetch = fetchStub;
const httpRequest = jest.spyOn(http, "request");
const httpsRequest = jest.spyOn(https, "request");

const { parser } = await import("@graffiticode/parser");
const { Compiler, Renderer, lexicon: basisLexicon } = await import("@graffiticode/basis");
const { Checker, Transformer } = await import("./compiler.js");
const { lexicon: l0158Lexicon } = await import("./lexicon.js");
const { expectContractActivity } = await import("./testing/validate-preview.js");

const lexicon = { ...basisLexicon, ...l0158Lexicon };

async function compile(src, data = {}) {
  const code = await parser.parse(158, src, lexicon);
  return new Promise((resolve) => {
    const compiler = new Compiler({ langID: "0158", version: "v0.0.0", Checker, Transformer, Renderer });
    compiler.compile(code, data, {}, (err, val) => resolve({ err: err || [], val }));
  });
}

const PROGRAMS = [
  ['items', 'id "n1" items [item questions [mcq {}] {}] {}..'],
  ['standalone questions', 'id "n2" questions [mcq {} shorttext {}] {}..'],
  ['items with params', `id "n3" items [item params [{ A1: "1" }] questions [shorttext stimulus "{{A1}}" {}] {}] {}..`],
  ['init of items', 'init id "n4" items [item questions [mcq {}] {}] {}..'],
];

describe("L0158 holds no credential", () => {
  afterAll(() => {
    globalThis.fetch = originalFetch;
    httpRequest.mockRestore();
    httpsRequest.mockRestore();
  });

  beforeEach(() => {
    fetchStub.mockClear();
    httpRequest.mockClear();
    httpsRequest.mockClear();
  });

  test.each(PROGRAMS)("%s: contract activity, no request, no credential, no network", async (_name, src) => {
    const { err, val } = await compile(src);
    expect(err).toEqual([]);
    expectContractActivity(val);
    expect(val.request).toBeUndefined();
    expect(val.data.request).toBeUndefined();
    const text = JSON.stringify(val);
    expect(text).not.toContain(SENTINEL_KEY);
    expect(text).not.toContain(SENTINEL_SECRET);
    expect(text).not.toContain("signature");
    expect(text).not.toContain("consumer_key");
    expect(fetchStub).not.toHaveBeenCalled();
    expect(httpRequest).not.toHaveBeenCalled();
    expect(httpsRequest).not.toHaveBeenCalled();
  });

  test.each([
    ["save-to-itembank true", 'id "s" items [item questions [mcq {}] {}] save-to-itembank true {}..'],
    ["caller credentials", `set-var "learnosity-key" "k"
set-var "learnosity-secret" "s"
id "c" items [item questions [mcq {}] {}] save-to-itembank true {}..`],
    ["author", 'id "a" author {}..'],
  ])("%s: compile error, no network", async (_name, src) => {
    const { err } = await compile(src);
    expect(err.length).toBeGreaterThan(0);
    expect(fetchStub).not.toHaveBeenCalled();
    expect(httpRequest).not.toHaveBeenCalled();
    expect(httpsRequest).not.toHaveBeenCalled();
  });

  test("the compiler sources read no Learnosity credential and load no Learnosity SDK", () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    for (const file of ["compiler.js", "items.js", "questions.js", "activity.js", "question-types.js"]) {
      const src = fs.readFileSync(path.join(dir, file), "utf8");
      expect(src).not.toMatch(/learnosity-sdk/i);
      expect(src).not.toMatch(/LEARNOSITY_(KEY|SECRET)/);
      expect(src).not.toMatch(/sdk\.init/);
    }
    expect(fs.existsSync(path.join(dir, "dataapi.js"))).toBe(false);
    expect(fs.existsSync(path.join(dir, "author.js"))).toBe(false);
  });
});
