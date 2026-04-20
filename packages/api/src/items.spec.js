// SPDX-License-Identifier: MIT
import { translateItemMetadata } from "./items.js";

describe("translateItemMetadata", () => {
  const emptyResult = {
    tags: undefined,
    note: undefined,
    description: undefined,
    source: undefined,
    adaptive: undefined,
    metadata: undefined,
  };

  it("returns undefined fields for null/undefined input", () => {
    expect(translateItemMetadata(null)).toEqual(emptyResult);
    expect(translateItemMetadata(undefined)).toEqual(emptyResult);
  });

  it("returns undefined fields for empty list", () => {
    expect(translateItemMetadata([])).toEqual(emptyResult);
  });

  it("merges a tags record with array values verbatim", () => {
    const result = translateItemMetadata([
      {
        kind: "tags",
        value: {
          NGSS: ["MS-LS1-2", "MS-LS1-6"],
          "Common Core": ["Math:6.NS.A.1"],
        },
      },
    ]);
    expect(result.tags).toEqual({
      NGSS: ["MS-LS1-2", "MS-LS1-6"],
      "Common Core": ["Math:6.NS.A.1"],
    });
    expect(result.metadata).toBeUndefined();
  });

  it("normalizes a bare string tag value to a single-element array", () => {
    const result = translateItemMetadata([
      { kind: "tags", value: { NGSS: "MS-LS1-2" } },
    ]);
    expect(result.tags).toEqual({ NGSS: ["MS-LS1-2"] });
    expect(result.metadata).toBeUndefined();
  });

  it("surfaces difficulty as tags[\"Difficulty\"]", () => {
    const result = translateItemMetadata([{ kind: "difficulty", value: "medium" }]);
    expect(result.tags).toEqual({ Difficulty: ["medium"] });
    expect(result.metadata).toBeUndefined();
  });

  it("surfaces dok as tags[\"DOK\"]", () => {
    const result = translateItemMetadata([{ kind: "dok", value: 2 }]);
    expect(result.tags).toEqual({ DOK: ["2"] });
    expect(result.metadata).toBeUndefined();
  });

  it("places notes on the top-level note field", () => {
    const result = translateItemMetadata([{ kind: "notes", value: "item note" }]);
    expect(result.tags).toBeUndefined();
    expect(result.note).toBe("item note");
    expect(result.metadata).toBeUndefined();
  });

  it("passes acknowledgements through to metadata", () => {
    const result = translateItemMetadata([
      { kind: "acknowledgements", value: "Adapted from Smith 2019" },
    ]);
    expect(result.tags).toBeUndefined();
    expect(result.metadata).toEqual({ acknowledgements: "Adapted from Smith 2019" });
  });

  it("places description on the top-level description field", () => {
    const result = translateItemMetadata([
      { kind: "description", value: "A short overview." },
    ]);
    expect(result.description).toBe("A short overview.");
  });

  it("places source on the top-level source field", () => {
    const result = translateItemMetadata([
      { kind: "source", value: "NASA Mars Program" },
    ]);
    expect(result.source).toBe("NASA Mars Program");
  });

  it("wraps difficulty_level as adaptive.difficulty integer", () => {
    const result = translateItemMetadata([
      { kind: "difficulty_level", value: 3 },
    ]);
    expect(result.adaptive).toEqual({ difficulty: 3 });
  });

  it("handles combined tags, difficulty, dok, and notes", () => {
    const result = translateItemMetadata([
      { kind: "tags", value: { NGSS: ["MS-LS1-2"] } },
      { kind: "difficulty", value: "medium" },
      { kind: "dok", value: 2 },
      { kind: "notes", value: "variant A" },
    ]);
    expect(result.tags).toEqual({
      NGSS: ["MS-LS1-2"],
      Difficulty: ["medium"],
      DOK: ["2"],
    });
    expect(result.note).toBe("variant A");
    expect(result.metadata).toBeUndefined();
  });
});
