// SPDX-License-Identifier: MIT
/* eslint-env jest, node */
import { createQuestions } from "./questions.js";
import { expectContractActivity } from "./testing/validate-preview.js";

describe("createQuestions (standalone questions)", () => {
  const makeQuestions = () => [{
    type: "mcq",
    stimulus: "2 + 2?",
    options: ["3", "4", "5"],
    validation: { valid_response: { value: ["1"] } },
  }, {
    type: "shorttext",
    stimulus: "{{A1}} + 1?",
  }];

  it("returns one unsigned activity that Broker's validatePreview accepts", () => {
    const result = createQuestions(makeQuestions(), { id: "test" });
    expectContractActivity(result);
    expect(result).toEqual({ type: "questions", data: expect.any(Object) });
    expect(result.data.questions.map(q => q.response_id)).toEqual([
      "artcompiler-mcq-test-0",
      "artcompiler-shorttext-test-1",
    ]);
    expect(result.data.questions[0]).toMatchObject({ type: "mcq", stimulus: "2 + 2?" });
    // No legacy record fields, no save receipt.
    expect(result.data.questions[0].reference).toBeUndefined();
    expect(result.data.questions[0].data).toBeUndefined();
    expect(result.data.itemBank).toBeUndefined();
  });

  it("keeps the compile-time {{var:X}} rewriting", () => {
    const result = createQuestions(makeQuestions(), { id: "test" });
    expect(result.data.questions[1].stimulus).toBe("{{var:A1}} + 1?");
  });

  it("makes response_ids Broker accepts from any lrn-id", () => {
    const result = createQuestions(makeQuestions(), { id: "my item/№ 1" });
    expectContractActivity(result);
    expect(result.data.questions[0].response_id).toBe("artcompiler-mcq-my_item___1-0");
  });

  it("inherits dynamic_content_data from an embedded custom question", () => {
    const result = createQuestions([{
      type: "custom",
      data: { templateVariablesRecords: [{ A1: "50" }, { A1: "100" }] },
    }], { id: "test" });
    expectContractActivity(result);
    expect(result.data.dynamic_content_data.cols).toEqual(["A1"]);
    expect(Object.values(result.data.dynamic_content_data.rows)).toHaveLength(2);
    // The custom question's own data field is kept.
    expect(result.data.questions[0].data.templateVariablesRecords).toHaveLength(2);
  });

  it("has no dynamic_content_data without a table", () => {
    const result = createQuestions(makeQuestions(), { id: "test" });
    expect("dynamic_content_data" in result.data).toBe(false);
  });
});
