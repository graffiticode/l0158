// SPDX-License-Identifier: MIT
/* eslint-env jest, node */
import { parser } from "@graffiticode/parser";
import {
  Compiler,
  Renderer,
  lexicon as basisLexicon
} from "@graffiticode/basis";
import { Checker, Transformer } from "./compiler.js";
import { lexicon as l0158Lexicon } from "./lexicon.js";
import { AUTHOR_ERROR, CREDENTIAL_ERROR, SAVE_ERROR } from "./activity.js";
import { expectContractActivity } from "./testing/validate-preview.js";

const lexicon = { ...basisLexicon, ...l0158Lexicon };

function compile(src, data = {}) {
  return new Promise(async (resolve, reject) => {
    const code = await parser.parse(158, src, lexicon);
    const compiler = new Compiler({
      langID: "0158",
      version: "v0.0.0",
      Checker,
      Transformer,
      Renderer,
    });
    compiler.compile(code, data, {}, (err, val) => {
      if (err && err.length > 0) {
        reject(err);
      } else {
        resolve(val);
      }
    });
  });
}

describe("compiler", () => {
  test("hello compiles a greeting", async () => {
    const result = await compile('hello "world"..');
    expect(result).toBe("world");
  });

  test("mcq with empty record produces question json", async () => {
    const result = await compile('mcq {}..');
    expect(result.type).toBe("mcq");
    expect(result.stimulus).toBeDefined();
  });

  test("items [item questions [mcq {}] {}] compiles to the contract activity", async () => {
    const result = await compile('id "test-preview" items [item questions [mcq {}] {}] {}..');
    expectContractActivity(result);
    expect(result.type).toBe("questions");
    expect(result.request).toBeUndefined();
  });

  test("items defaults to inline Questions API preview (no bank lookup)", async () => {
    const result = await compile(
      'id "test-preview" items [item questions [mcq {}] {}] {}..'
    );
    expect(result.type).toBe("questions");
    expect(Array.isArray(result.data.questions)).toBe(true);
    expect(result.data.questions[0].type).toBe("mcq");
    expect(result.data.questions[0].response_id).toBe("artcompiler-mcq-test-preview-0");
  });

  test("standalone questions compiles to the contract activity", async () => {
    const result = await compile('id "test-q" questions [mcq {} shorttext {}] {}..');
    expectContractActivity(result);
    expect(result.type).toBe("questions");
    expect(result.data.questions.map(q => q.type)).toEqual(["mcq", "shorttext"]);
    expect(result.data.questions.every(q => q.reference === undefined)).toBe(true);
  });

  test("continuation fields (features, layout) stay out of the activity", async () => {
    const result = await compile(
      'id "test-f" items [item questions [mcq {}] {}] features [{ a: 1 }] layout "column" {}..'
    );
    expectContractActivity(result);
  });

  test("an lrn-id with spaces still yields valid response_ids", async () => {
    const result = await compile('id "my item 1" items [item questions [mcq {}] {}] {}..');
    expectContractActivity(result);
    expect(result.data.questions[0].response_id).toBe("artcompiler-mcq-my_item_1-0");
  });

  test("save-to-itembank false stays a no-op", async () => {
    const src =
      'id "test-save" items [item questions [mcq {}] {}] save-to-itembank false {}..';
    const result = await compile(src);
    expectContractActivity(result);
  });

  test("save-to-itembank true is a compile error pointing to L0176", async () => {
    const src = `set-var "lrn-id" "t"
items [item questions [mcq {}] {}] save-to-itembank true {}..`;
    await expect(compile(src)).rejects.toEqual(
      expect.arrayContaining([expect.objectContaining({ message: SAVE_ERROR })])
    );
    expect(SAVE_ERROR).toBe("Error: L0158 no longer saves to the item bank; use L0176.");
  });

  test("save-to-itembank true on standalone questions is a compile error", async () => {
    await expect(compile('id "t" questions [mcq {}] save-to-itembank true {}..')).rejects.toEqual(
      expect.arrayContaining([expect.objectContaining({ message: SAVE_ERROR })])
    );
  });

  test.each([
    ["learnosity-key and learnosity-secret", `set-var "learnosity-key" "k"
set-var "learnosity-secret" "s"
`],
    ["learnosity-key alone", `set-var "learnosity-key" "k"
`],
    ["learnosity-secret alone", `set-var "learnosity-secret" "s"
`],
    ["an empty learnosity-key", `set-var "learnosity-key" ""
`],
  ])("set-var %s is a compile error pointing to L0176", async (_name, prefix) => {
    const src = `${prefix}set-var "lrn-id" "t"
items [item questions [mcq {}] {}] {}..`;
    await expect(compile(src)).rejects.toEqual(
      expect.arrayContaining([expect.objectContaining({ message: CREDENTIAL_ERROR })])
    );
    expect(CREDENTIAL_ERROR).toContain("L0176");
  });

  test("a credential set-var errors even without items or questions", async () => {
    await expect(compile(`set-var "learnosity-secret" "s"
mcq {}..`)).rejects.toEqual(
      expect.arrayContaining([expect.objectContaining({ message: CREDENTIAL_ERROR })])
    );
  });

  test("author is a compile error pointing to L0177", async () => {
    expect(AUTHOR_ERROR).toBe("Error: L0158 doesn't open the Learnosity Author Site; to plan an Author API integration, which your own application signs, use L0177.");
    await expect(compile('id "a" author { mode: "item_edit" }..')).rejects.toEqual(
      expect.arrayContaining([expect.objectContaining({ message: AUTHOR_ERROR })])
    );
    // Without an lrn-id too (it used to be required first).
    await expect(compile('author {}..')).rejects.toEqual(
      expect.arrayContaining([expect.objectContaining({ message: AUTHOR_ERROR })])
    );
  });

  test("init of a compiled items activity returns it unsigned and normalized", async () => {
    const result = await compile('init id "i" items [item questions [mcq {}] {}] {}..');
    expectContractActivity(result);
    expect(result.data.questions[0].response_id).toBe("artcompiler-mcq-i-0");
  });

  test("init data {} returns a posted questions activity unsigned", async () => {
    const posted = {
      type: "questions",
      data: {
        id: "x",
        name: "Test",
        session_id: "s",
        questions: [{ response_id: "r-1", type: "mcq", stimulus: "50 + 25?" }],
      },
    };
    const result = await compile("init data {}..", posted);
    expectContractActivity(result);
    expect(result).toEqual(posted);
  });

  test("init of a legacy items activity normalizes its questions and drops request", async () => {
    const posted = {
      type: "items",
      data: {
        id: "x",
        questions: [{ type: "mcq", reference: "artcompiler-mcq-x-0", data: { type: "mcq", stimulus: "?" } }],
        request: { security: { signature: "old" } },
      },
    };
    const result = await compile("init data {}..", posted);
    expectContractActivity(result);
    expect(result.type).toBe("items");
    expect(result.data.questions).toEqual([{ response_id: "artcompiler-mcq-x-0", type: "mcq", stimulus: "?" }]);
    expect(JSON.stringify(result)).not.toContain("signature");
  });

  test("init of an Author activity is the Author compile error", async () => {
    await expect(compile("init data {}..", { type: "author", data: { mode: "item_edit" } })).rejects.toEqual(
      expect.arrayContaining([expect.objectContaining({ message: AUTHOR_ERROR })])
    );
    await expect(compile('init { type: "author" }..')).rejects.toEqual(
      expect.arrayContaining([expect.objectContaining({ message: AUTHOR_ERROR })])
    );
  });

  test("init of something that isn't an activity is a compile error", async () => {
    await expect(compile('init { foo: 1 }..')).rejects.toEqual(
      expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining("init expects") })])
    );
  });

  test("learnosity is an inert pass-through of its argument", async () => {
    const result = await compile('learnosity id "l" items [item questions [mcq {}] {}] {}..');
    expectContractActivity(result);
  });

  test("bowtie compiles to the native Learnosity shape", async () => {
    const src = `bowtie
      stimulus "65-year-old with chest pain and diaphoresis."
      column-titles ["Actions", "Condition", "Monitor"]
      possible-responses [
        ["give aspirin", "give nitro", "call cardiology", "obtain 12-lead ECG"],
        ["myocardial infarction", "pulmonary embolism", "pericarditis"],
        ["ST segment changes", "blood pressure", "troponin", "respiratory rate"]
      ]
      valid-response [
        ["give aspirin", "obtain 12-lead ECG"],
        ["myocardial infarction"],
        ["ST segment changes", "troponin"]
      ]
      {}..`;
    const result = await compile(src);
    expect(result.type).toBe("bowtie");
    expect(result.group_possible_responses).toBe(true);
    expect(result.max_response_per_cell).toBe(1);
    expect(result.ui_style.column_titles).toEqual(["Actions", "Condition", "Monitor"]);
    expect(result.possible_response_groups).toHaveLength(3);
    expect(result.validation.valid_response.value).toEqual([
      [0, 3],
      [4],
      [7, 9],
    ]);
  }, 10000);

  test("custom synthesizes Learnosity custom-question shape from lang", async () => {
    const src = `custom lang "0166" {
      data: "{\\"gcItemId\\":\\"abc\\"}",
      foo: 42
    }..`;
    const result = await compile(src);
    expect(result).toEqual({
      type: "custom",
      custom_type: "custom_question_l0166",
      js: {
        question: "https://l0166.graffiticode.org/question.js",
        scorer: "https://l0166.graffiticode.org/scorer.js",
      },
      css: "https://l0166.graffiticode.org/question.css",
      data: '{"gcItemId":"abc"}',
      foo: 42,
    });
  }, 10000);

  test("custom passes a record-shaped data field through unchanged", async () => {
    const src = `custom lang "0166" {
      data: {
        problemStatement: "The magic number is",
        terms: [[4, 3, 8], [9, 5, 1], [2, 7, 6]]
      }
    }..`;
    const result = await compile(src);
    expect(result.data).toEqual({
      problemStatement: "The magic number is",
      terms: [[4, 3, 8], [9, 5, 1], [2, 7, 6]],
    });
  }, 10000);

  test("custom with empty record still emits URLs and custom_type", async () => {
    const result = await compile('custom lang "0166" {}..');
    expect(result.type).toBe("custom");
    expect(result.custom_type).toBe("custom_question_l0166");
    expect(result.js.question).toBe("https://l0166.graffiticode.org/question.js");
    expect(result.js.scorer).toBe("https://l0166.graffiticode.org/scorer.js");
    expect(result.css).toBe("https://l0166.graffiticode.org/question.css");
    expect(result.data).toBeUndefined();
  }, 10000);

  test("custom without lang surfaces a compile error", async () => {
    await expect(compile('custom { data: "x" }..')).rejects.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringMatching(/lang to be a non-empty string/),
        }),
      ])
    );
  }, 10000);

  test("bad custom inside questions [...] surfaces builder error, not a TypeError", async () => {
    const src =
      'id "test-custom" items [item questions [custom { data: "x" }] {}] {}..';
    await expect(compile(src)).rejects.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringMatching(/lang to be a non-empty string/),
        }),
      ])
    );
  }, 10000);

  test("custom model with a record passes through into the data field", async () => {
    const src = `custom
      lang "0166"
      model {
        problemStatement: "The magic number is",
        terms: [[4, 3, 8], [9, 5, 1], [2, 7, 6]]
      }
      {}..`;
    const result = await compile(src);
    expect(result.data).toEqual({
      problemStatement: "The magic number is",
      terms: [[4, 3, 8], [9, 5, 1], [2, 7, 6]],
    });
  }, 10000);

  test("custom model with a string passes through unchanged", async () => {
    const src = `custom
      lang "0166"
      model "{\\"gcItemId\\":\\"abc\\"}"
      {}..`;
    const result = await compile(src);
    expect(result.data).toBe('{"gcItemId":"abc"}');
  }, 10000);

  test("chained model overrides a record-literal data: in the terminator", async () => {
    const src = `custom
      lang "0166"
      model { a: 1 }
      { data: { b: 2 } }..`;
    const result = await compile(src);
    expect(result.data).toEqual({ a: 1 });
  }, 10000);

  test("custom model is order-independent with lang", async () => {
    const src = `custom
      model { foo: 1 }
      lang "0166"
      {}..`;
    const result = await compile(src);
    expect(result.custom_type).toBe("custom_question_l0166");
    expect(result.js.question).toBe("https://l0166.graffiticode.org/question.js");
    expect(result.data).toEqual({ foo: 1 });
  }, 10000);

  test("custom model survives the items/questions render wrapper", async () => {
    const src = `id "test-model"
      items [
        item
          questions [
            custom
              lang "0166"
              model { foo: 1 }
              {}
          ]
          {}
      ]
      {}..`;
    const result = await compile(src);
    expectContractActivity(result);
    expect(result.type).toBe("questions");
    const customQ = result.data.questions.find((q) => q && q.type === "custom");
    expect(customQ).toBeTruthy();
    expect(customQ.custom_type).toBe("custom_question_l0166");
    expect(customQ.data).toEqual({ foo: 1 });
  }, 10000);

  test("bowtie with wrong 2-1-2 counts surfaces a compile error", async () => {
    const src = `bowtie
      stimulus "..."
      column-titles ["A", "B", "C"]
      possible-responses [["a1", "a2"], ["b1"], ["c1", "c2"]]
      valid-response [["a1"], ["b1"], ["c1", "c2"]]
      {}..`;
    await expect(compile(src)).rejects.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringMatching(/2-1-2 correct answers \(got 1-1-2\)/),
        }),
      ])
    );
  }, 10000);

  test("mcq with chained attributes compiles", async () => {
    const result = await compile('mcq stimulus "What is the capital of France?" options ["Paris", "London", "Berlin", "Madrid"] valid-response [0] {}..');
    expect(result.type).toBe("mcq");
    expect(result.stimulus).toBe("What is the capital of France?");
    expect(result.options).toHaveLength(4);
    expect(result.validation.valid_response.value).toEqual(["0"]);
  }, 10000);

  test("is-math attribute emits is_math on the question", async () => {
    const result = await compile('mcq stimulus "What is the sum?" options ["3", "4"] valid-response [0] is-math true {}..');
    expect(result.type).toBe("mcq");
    expect(result.is_math).toBe(true);
  }, 10000);

  test("mcq with question-level metadata translates field names", async () => {
    const src = `mcq
      stimulus "Which organelle produces ATP?"
      options ["mitochondria" "nucleus" "ribosome" "cell membrane"]
      valid-response [0]
      metadata [
        distractor-rationale ["Correct." "That's the DNA organelle." "That's where proteins are built." "That's the boundary layer."]
        notes "Targets organelle confusions."
        acknowledgements "Adapted from Smith 2019."
      ]
      {}..`;
    const result = await compile(src);
    expect(result.type).toBe("mcq");
    expect(result.metadata).toEqual({
      distractor_rationale: [
        "1. Correct.",
        "2. That's the DNA organelle.",
        "3. That's where proteins are built.",
        "4. That's the boundary layer.",
      ].join("\n"),
      acknowledgements: "Adapted from Smith 2019.",
    });
  }, 10000);

  test("item-level metadata compiles to a list of tagged entries", async () => {
    const src = `item
      metadata [
        tags { NGSS: ["MS-LS1-2"], Difficulty: "medium", DOK: "2", "Common Core": "Math:6.NS.A.1" }
        notes "Organelle set variant A."
      ]
      {}..`;
    const result = await compile(src);
    expect(result.metadata).toEqual([
      { kind: "tags", value: { NGSS: ["MS-LS1-2"], Difficulty: "medium", DOK: "2", "Common Core": "Math:6.NS.A.1" } },
      { kind: "notes", value: "Organelle set variant A." },
    ]);
  }, 10000);

  test("hardwired params builds dynamic_content_data on the preview", async () => {
    const src = `id "t-params"
      items [
        item
          params [
            { A1: "50", A2: "25" }
            { A1: "100", A2: "75" }
          ]
          questions [
            shorttext stimulus "{{A1}}+{{A2}}=?" {}
          ]
          {}
      ]
      {}..`;
    const result = await compile(src);
    expectContractActivity(result);
    expect(result.type).toBe("questions");
    const dcd = result.data.dynamic_content_data;
    expect(dcd).toBeDefined();
    expect(dcd.cols).toEqual(["A1", "A2"]);
    const rows = Object.values(dcd.rows);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ values: ["50", "25"], index: 0 });
    expect(rows[1]).toMatchObject({ values: ["100", "75"], index: 1 });
  }, 10000);

  test("custom L0166 data.templateVariablesRecords flows into dynamic_content_data", async () => {
    const src = `id "t-inherit"
      items [
        item
          questions [
            custom
              lang "0166"
              model {
                templateVariablesRecords: [
                  { A1: "50", A2: "25" }
                  { A1: "100", A2: "75" }
                ]
              }
              {}
          ]
          {}
      ]
      {}..`;
    const result = await compile(src);
    expect(result.type).toBe("questions");
    const dcd = result.data.dynamic_content_data;
    expect(dcd).toBeDefined();
    expect(dcd.cols).toEqual(["A1", "A2"]);
    expect(Object.values(dcd.rows)).toHaveLength(2);
  }, 10000);

  test("inherited dynamic data overrides hardwired params", async () => {
    const src = `id "t-precedence"
      items [
        item
          params [{ X: "hardwired" }]
          questions [
            custom
              lang "0166"
              model {
                templateVariablesRecords: [{ X: "inherited" }]
              }
              {}
          ]
          {}
      ]
      {}..`;
    const result = await compile(src);
    const rows = Object.values(result.data.dynamic_content_data.rows);
    expect(rows[0].values).toEqual(["inherited"]);
  }, 10000);

  test("custom widget data carries {{var:X}} placeholders like built-in questions", async () => {
    // Custom questions go through the same fixVariableRefs path as built-in
    // questions: bare {{X}} markers become {{var:X}} so Learnosity can
    // substitute them at activity render time using dynamic_content_data.
    const src = `id "t-custom-vars"
      items [
        item
          questions [
            custom
              lang "0166"
              model {
                interaction: {
                  cells: {
                    A1: { text: "{{A1}}" }
                  }
                }
                templateVariablesRecords: [{ A1: "50" }]
              }
              {}
          ]
          {}
      ]
      {}..`;
    const result = await compile(src);
    const customQ = result.data.questions.find((q) => q.type === "custom");
    expect(customQ.data.interaction.cells.A1.text).toBe("{{var:A1}}");
  }, 10000);

  test("non-custom question stimulus is rewritten with {{var:}} prefix", async () => {
    const src = `id "t-rewrite"
      items [
        item
          params [{ A1: "50" }]
          questions [
            shorttext stimulus "value is {{A1}}" {}
          ]
          {}
      ]
      {}..`;
    const result = await compile(src);
    const q = result.data.questions[0];
    expect(q.stimulus).toBe("value is {{var:A1}}");
  }, 10000);

  test("custom question stimulus and widget data both get {{var:X}} rewriting", async () => {
    const src = `id "t-stim"
      items [
        item
          questions [
            custom
              lang "0166"
              stimulus "value is {{A1}}"
              model { foo: "x={{A1}}" }
              {}
          ]
          {}
      ]
      {}..`;
    const result = await compile(src);
    const customQ = result.data.questions.find((q) => q.type === "custom");
    expect(customQ.stimulus).toBe("value is {{var:A1}}");
    expect(customQ.data).toEqual({ foo: "x={{var:A1}}" });
  }, 10000);

  test("no params and no custom question: dynamic_content_data is absent", async () => {
    const src = `id "t-none"
      items [
        item questions [mcq {}] {}
      ]
      {}..`;
    const result = await compile(src);
    expect(result.type).toBe("questions");
    expect(result.data.dynamic_content_data).toBeUndefined();
  }, 10000);

  test("hot-text compiles to the Learnosity tokenhighlight shape", async () => {
    const src = `hot-text
      stimulus "Highlight the verbs."
      passage "The cat runs then jumps high."
      valid-response ["runs", "jumps"]
      distractors ["cat", "high"]
      max-selection 2
      {}..`;
    const result = await compile(src);
    expect(result.type).toBe("tokenhighlight");
    expect(result.tokenization).toBe("custom");
    expect(result.template).toContain('<span class="lrn_token">runs</span>');
    expect(result.max_selection).toBe(2);
    // Span order: cat=0, runs=1, jumps=2, high=3 → correct are runs, jumps.
    expect(result.validation.valid_response.value).toEqual([1, 2]);
  }, 10000);

  test("token-highlight is a synonym for hot-text", async () => {
    const hot = await compile('hot-text {}..');
    const token = await compile('token-highlight {}..');
    expect(token.type).toBe("tokenhighlight");
    expect(token).toEqual(hot);
  }, 10000);
});
