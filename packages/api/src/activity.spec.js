// SPDX-License-Identifier: MIT
/* eslint-env jest, node */
import { AUTHOR_ERROR, normalizeActivity, toInlineQuestion, toResponseId } from "./activity.js";
import { expectContractActivity } from "./testing/validate-preview.js";

describe("normalizeActivity", () => {
  const inline = { response_id: "q-1", type: "mcq", stimulus: "?" };

  it("returns a contract activity unchanged", () => {
    const value = { type: "questions", data: { id: "a", name: "Test", questions: [inline], session_id: "s" } };
    const { activity, errors } = normalizeActivity(value);
    expect(errors).toBeUndefined();
    expectContractActivity(activity);
    expect(activity).toEqual(value);
  });

  it("normalizes legacy question records and drops request and itemBank", () => {
    const { activity } = normalizeActivity({
      type: "items",
      request: { security: {} },
      data: {
        id: "a",
        questions: [{ type: "mcq", reference: "ref-1", data: { type: "mcq", stimulus: "?" } }],
        request: { signed: true },
        itemBank: { saved: true },
      },
    });
    expectContractActivity(activity);
    expect(activity).toEqual({
      type: "items",
      data: { id: "a", questions: [{ response_id: "ref-1", type: "mcq", stimulus: "?" }] },
    });
  });

  it("refuses Author with the Author error", () => {
    expect(normalizeActivity({ type: "author", data: {} }).errors).toEqual([AUTHOR_ERROR]);
  });

  it.each([
    ["undefined", undefined],
    ["a list", [{ type: "questions" }]],
    ["a bare signed request", { security: { consumer_key: "k" }, request: { questions: [] } }],
    ["an unknown type", { type: "feedback", data: { questions: [] } }],
    ["no data", { type: "questions" }],
    ["unsupported data fields", { type: "items", data: { questions: [], items: ["ref"] } }],
    ["a question without a response_id", { type: "questions", data: { questions: [{ type: "mcq" }] } }],
    ["a bad response_id", { type: "questions", data: { questions: [{ type: "mcq", response_id: "has space" }] } }],
  ])("refuses %s", (_name, value) => {
    const { activity, errors } = normalizeActivity(value);
    expect(activity).toBeUndefined();
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("toInlineQuestion / toResponseId", () => {
  it("leaves an inline question with a custom data field alone", () => {
    const q = { response_id: "r", type: "custom", data: { a: 1 } };
    expect(toInlineQuestion(q)).toBe(q);
  });

  it("replaces disallowed characters and caps the length", () => {
    expect(toResponseId("a b/c")).toBe("a_b_c");
    expect(toResponseId("x".repeat(300))).toHaveLength(250);
  });
});
