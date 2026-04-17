// SPDX-License-Identifier: MIT
import { translateItemMetadata } from "./items.js";

describe("translateItemMetadata", () => {
  it("returns undefined fields for null/undefined input", () => {
    expect(translateItemMetadata(null)).toEqual({ tags: undefined, metadata: undefined });
    expect(translateItemMetadata(undefined)).toEqual({ tags: undefined, metadata: undefined });
  });

  it("returns undefined fields for empty object", () => {
    expect(translateItemMetadata({})).toEqual({ tags: undefined, metadata: undefined });
  });

  it("splits tag strings on the first colon into type/value pairs", () => {
    const result = translateItemMetadata({
      tags: ["NGSS:MS-LS1-2", "NGSS:MS-LS1-6", "Common Core:Math:6.NS.A.1"],
    });
    expect(result.tags).toEqual({
      NGSS: ["MS-LS1-2", "MS-LS1-6"],
      "Common Core": ["Math:6.NS.A.1"],
    });
    expect(result.metadata).toBeUndefined();
  });

  it("surfaces difficulty as tags[\"Difficulty\"]", () => {
    const result = translateItemMetadata({ difficulty: "medium" });
    expect(result.tags).toEqual({ Difficulty: ["medium"] });
    expect(result.metadata).toBeUndefined();
  });

  it("surfaces dok as tags[\"DOK\"]", () => {
    const result = translateItemMetadata({ dok: 2 });
    expect(result.tags).toEqual({ DOK: ["2"] });
    expect(result.metadata).toBeUndefined();
  });

  it("renames notes to note and places it on metadata", () => {
    const result = translateItemMetadata({ notes: "item note" });
    expect(result.tags).toBeUndefined();
    expect(result.metadata).toEqual({ note: "item note" });
  });

  it("handles combined tags, difficulty, dok, and notes", () => {
    const result = translateItemMetadata({
      tags: ["NGSS:MS-LS1-2"],
      difficulty: "medium",
      dok: 2,
      notes: "variant A",
    });
    expect(result.tags).toEqual({
      NGSS: ["MS-LS1-2"],
      Difficulty: ["medium"],
      DOK: ["2"],
    });
    expect(result.metadata).toEqual({ note: "variant A" });
  });
});
