// SPDX-License-Identifier: MIT
/* eslint-env jest, node */
import { createItems } from "./items.js";
import { createQuestions } from "./questions.js";
import { expectContractActivity } from "./testing/validate-preview.js";

describe("createItems", () => {
  const mcq = () => ({
    type: "mcq",
    stimulus: "2 + 2?",
    options: ["3", "4", "5"],
    validation: { valid_response: { value: ["1"] } },
  });
  // An item as the compiler builds it: the questions' activity, plus any
  // item-level attributes chained around it.
  const makeItem = (extra = {}) => ({
    ...createQuestions([mcq()], { id: "test" }),
    ...extra,
  });

  it("returns one unsigned activity that Broker's validatePreview accepts", () => {
    const result = createItems({ items: [makeItem()], id: "test" });
    expectContractActivity(result);
    expect(result.type).toBe("questions");
    expect(result.request).toBeUndefined();
    expect(result.data.itemBank).toBeUndefined();
    expect(result.data.id).toBe("test");
    expect(result.data.questions).toEqual([{
      response_id: "artcompiler-mcq-test-0",
      type: "mcq",
      stimulus: "2 + 2?",
      options: ["3", "4", "5"],
      validation: { valid_response: { value: ["1"] } },
    }]);
  });

  it("converts legacy { type, reference, data } question records to inline questions", () => {
    const legacy = {
      type: "questions",
      data: {
        questions: [{ type: "mcq", reference: "artcompiler-mcq-old-0", data: mcq() }],
      },
    };
    const result = createItems({ items: [legacy], id: "old" });
    expectContractActivity(result);
    expect(result.data.questions[0]).toMatchObject({
      response_id: "artcompiler-mcq-old-0",
      type: "mcq",
      stimulus: "2 + 2?",
    });
    expect(result.data.questions[0].reference).toBeUndefined();
  });

  it("builds dynamic_content_data from item-level params", () => {
    const result = createItems({
      items: [makeItem({ params: [{ A1: "1" }, { A1: "2" }] })],
      id: "test",
    });
    expectContractActivity(result);
    expect(result.data.dynamic_content_data.cols).toEqual(["A1"]);
    expect(Object.values(result.data.dynamic_content_data.rows)).toHaveLength(2);
  });

  it("an inherited table (from the questions) wins over params", () => {
    const custom = { type: "custom", data: { templateVariablesRecords: [{ X: "inherited" }] } };
    const item = {
      ...createQuestions([custom], { id: "test" }),
      params: [{ X: "hardwired" }],
    };
    const result = createItems({ items: [item], id: "test" });
    expectContractActivity(result);
    expect(Object.values(result.data.dynamic_content_data.rows)[0].values).toEqual(["inherited"]);
  });

  it("an item with no questions is still a valid (empty) activity", () => {
    const result = createItems({ items: [{}], id: "empty" });
    expectContractActivity(result);
    expect(result.data.questions).toEqual([]);
  });
});
