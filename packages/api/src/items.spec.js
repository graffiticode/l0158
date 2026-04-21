// SPDX-License-Identifier: MIT
import { jest } from "@jest/globals";
import { translateItemMetadata, buildCreateItems } from "./items.js";

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

  it("handles combined tags and notes", () => {
    const result = translateItemMetadata([
      { kind: "tags", value: { NGSS: ["MS-LS1-2"], Difficulty: "medium", DOK: "2" } },
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

describe("buildCreateItems preview vs save", () => {
  const fakeSdk = {
    init: jest.fn((kind, consumer, secret, payload) => ({ signed: true, payload })),
  };
  const makeItem = () => ({
    type: "questions",
    data: {
      id: "q-sess",
      name: "Test",
      questions: [{
        type: "mcq",
        reference: "artcompiler-mcq-test-0",
        data: {
          type: "mcq",
          stimulus: "2 + 2?",
          options: ["3", "4", "5"],
          validation: { valid_response: { value: ["1"] } },
        },
      }],
      session_id: "q-sess-2",
    },
    templateVariablesRecords: undefined,
    questionRefs: ["artcompiler-mcq-test-0"],
    metadata: undefined,
  });

  beforeEach(() => {
    fakeSdk.init.mockClear();
  });

  it("preview mode (default): skips dataApi and returns Questions API payload", async () => {
    const dataApi = jest.fn();
    const createItems = buildCreateItems({
      sdk: fakeSdk, key: "k", secret: "s", domain: "localhost", dataApi,
    });
    const result = await createItems({ items: [makeItem()], id: "test" });
    expect(dataApi).not.toHaveBeenCalled();
    // Preview routes through Questions API (not Items API), since Items API
    // always performs a bank lookup by reference.
    expect(result.type).toBe("questions");
    expect(result.data.questions).toHaveLength(1);
    expect(result.data.questions[0]).toMatchObject({
      response_id: "artcompiler-mcq-test-0",
      type: "mcq",
      stimulus: "2 + 2?",
    });
  });

  it("save mode: writes to itembank with status unpublished and returns Questions API payload", async () => {
    const dataApi = jest.fn().mockResolvedValue({ meta: { status: true } });
    const createItems = buildCreateItems({
      sdk: fakeSdk, key: "k", secret: "s", domain: "localhost", dataApi,
    });
    const result = await createItems({
      items: [makeItem()], id: "test", saveToItembank: true,
    });
    expect(dataApi).toHaveBeenCalledTimes(1);
    const [callArg] = dataApi.mock.calls[0];
    expect(callArg.route).toBe("/itembank/items");
    const sdkPayload = fakeSdk.init.mock.calls[0][3];
    // Saved items always land as drafts — the Author Site publishes them.
    expect(sdkPayload.items[0].status).toBe("unpublished");
    expect(result.type).toBe("questions");
    expect(result.data.questions).toHaveLength(1);
    expect(result.data.questions[0].response_id).toBe("artcompiler-mcq-test-0");
  });
});
