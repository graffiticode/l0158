// SPDX-License-Identifier: MIT
import {
  buildMcq,
  buildShorttext,
  buildLongtext,
  buildPlaintext,
  buildClozetext,
  buildClozeassociation,
  buildClozedropdown,
  buildClozeformula,
  buildChoicematrix,
  buildOrderlist,
  buildClassification,
  buildBowtie,
  translateQuestionMetadata,
} from "./question-types.js";

describe("question-types", () => {
  describe("defaults", () => {
    it("should build mcq with defaults from empty attrs", () => {
      const result = buildMcq({});
      expect(result.type).toBe("mcq");
      expect(result.stimulus).toBe("Which of the following is correct?");
      expect(result.options).toHaveLength(4);
      expect(result.validation.valid_response.value).toEqual(["0"]);
    });

    it("should build shorttext with defaults from empty attrs", () => {
      const result = buildShorttext({});
      expect(result.type).toBe("shorttext");
      expect(result.stimulus).toBe("Type your answer below.");
      expect(result.validation.valid_response.value).toBe("answer");
    });

    it("should build longtext with defaults from empty attrs", () => {
      const result = buildLongtext({});
      expect(result.type).toBe("longtextV2");
      expect(result.stimulus).toBe("Write a detailed response.");
      expect(result.max_length).toBe(500);
    });

    it("should build plaintext with defaults from empty attrs", () => {
      const result = buildPlaintext({});
      expect(result.type).toBe("plaintext");
      expect(result.stimulus).toBe("Write your response in plain text.");
    });

    it("should build clozetext with defaults from empty attrs", () => {
      const result = buildClozetext({});
      expect(result.type).toBe("clozetext");
      expect(result.template).toBe("The {{response}} is the answer.");
      expect(result.validation.valid_response.value).toEqual([["answer"]]);
    });

    it("should build clozeassociation with defaults from empty attrs", () => {
      const result = buildClozeassociation({});
      expect(result.type).toBe("clozeassociation");
      expect(result.possible_responses).toEqual(["correct", "incorrect", "maybe"]);
    });

    it("should build clozedropdown with defaults from empty attrs", () => {
      const result = buildClozedropdown({});
      expect(result.type).toBe("clozedropdown");
      expect(result.possible_responses).toEqual([["correct", "incorrect", "maybe"]]);
    });

    it("should build clozeformula with defaults from empty attrs", () => {
      const result = buildClozeformula({});
      expect(result.type).toBe("clozeformulaV2");
      expect(result.validation.valid_response.value).toEqual([
        { method: "equivLiteral", value: "x+1" },
      ]);
    });

    it("should build choicematrix with defaults from empty attrs", () => {
      const result = buildChoicematrix({});
      expect(result.type).toBe("choicematrix");
      expect(result.stems).toEqual(["Statement 1", "Statement 2"]);
      expect(result.options).toEqual(["True", "False"]);
    });

    it("should build orderlist with defaults from empty attrs", () => {
      const result = buildOrderlist({});
      expect(result.type).toBe("orderlist");
      expect(result.list).toEqual(["First", "Second", "Third", "Fourth"]);
    });

    it("should build classification with defaults from empty attrs", () => {
      const result = buildClassification({});
      expect(result.type).toBe("classification");
      expect(result.ui_style.column_titles).toEqual(["Category A", "Category B"]);
      expect(result.possible_responses).toEqual(["Item 1", "Item 2", "Item 3", "Item 4"]);
    });

    it("should allow partial overrides with defaults filling the rest", () => {
      const result = buildMcq({ stimulus: "Custom question?" });
      expect(result.stimulus).toBe("Custom question?");
      expect(result.options).toHaveLength(4);
      expect(result.validation.valid_response.value).toEqual(["0"]);
    });
  });

  describe("buildMcq", () => {
    it("should build mcq with options and validation", () => {
      const result = buildMcq({
        stimulus: "What is 2 + 2?",
        options: ["3", "4", "5"],
        valid_response: [1],
      });
      expect(result.type).toBe("mcq");
      expect(result.stimulus).toBe("What is 2 + 2?");
      expect(result.options).toEqual([
        { label: "3", value: "0" },
        { label: "4", value: "1" },
        { label: "5", value: "2" },
      ]);
      expect(result.validation).toEqual({
        scoring_type: "exactMatch",
        valid_response: { score: 1, value: ["1"] },
      });
    });

    it("should set optional attributes", () => {
      const result = buildMcq({
        stimulus: "Q?",
        options: ["A", "B"],
        valid_response: [0],
        multiple_responses: true,
        shuffle_options: true,
        instant_feedback: false,
      });
      expect(result.multiple_responses).toBe(true);
      expect(result.shuffle_options).toBe(true);
      expect(result.instant_feedback).toBe(false);
    });

    it("should pass through extra attributes via rest", () => {
      const result = buildMcq({
        stimulus: "Q?",
        options: ["A", "B"],
        valid_response: [0],
        ui_style: { type: "horizontal" },
      });
      expect(result.ui_style).toEqual({ type: "horizontal" });
    });
  });

  describe("buildShorttext", () => {
    it("should build shorttext with validation", () => {
      const result = buildShorttext({
        stimulus: "Type the answer",
        valid_response: "42",
      });
      expect(result.type).toBe("shorttext");
      expect(result.stimulus).toBe("Type the answer");
      expect(result.validation.valid_response.value).toBe("42");
    });

    it("should set optional attributes", () => {
      const result = buildShorttext({
        stimulus: "Q?",
        valid_response: "yes",
        max_length: 10,
        case_sensitive: false,
        placeholder: "Enter answer",
      });
      expect(result.max_length).toBe(10);
      expect(result.case_sensitive).toBe(false);
      expect(result.placeholder).toBe("Enter answer");
    });
  });

  describe("buildLongtext", () => {
    it("should build longtextV2 without validation", () => {
      const result = buildLongtext({
        stimulus: "Write an essay",
        max_length: 500,
        placeholder: "Start writing...",
      });
      expect(result.type).toBe("longtextV2");
      expect(result.stimulus).toBe("Write an essay");
      expect(result.max_length).toBe(500);
      expect(result.placeholder).toBe("Start writing...");
      expect(result.validation).toBeUndefined();
    });
  });

  describe("buildPlaintext", () => {
    it("should build plaintext without validation", () => {
      const result = buildPlaintext({
        stimulus: "Write your response",
      });
      expect(result.type).toBe("plaintext");
      expect(result.stimulus).toBe("Write your response");
      expect(result.validation).toBeUndefined();
    });
  });

  describe("buildClozetext", () => {
    it("should build clozetext with template and validation", () => {
      const result = buildClozetext({
        stimulus: "The {{response}} is the powerhouse of the cell.",
        valid_response: [["mitochondria", "mitochondrion"]],
      });
      expect(result.type).toBe("clozetext");
      expect(result.template).toBe("The {{response}} is the powerhouse of the cell.");
      expect(result.validation.valid_response.value).toEqual([["mitochondria", "mitochondrion"]]);
    });
  });

  describe("buildClozeassociation", () => {
    it("should build clozeassociation with drag options", () => {
      const result = buildClozeassociation({
        stimulus: "Drag the {{response}} into the blank.",
        possible_responses: ["cat", "dog", "fish"],
        valid_response: [["cat"]],
      });
      expect(result.type).toBe("clozeassociation");
      expect(result.template).toBe("Drag the {{response}} into the blank.");
      expect(result.possible_responses).toEqual(["cat", "dog", "fish"]);
      expect(result.validation.valid_response.value).toEqual([["cat"]]);
    });
  });

  describe("buildClozedropdown", () => {
    it("should build clozedropdown with dropdown options", () => {
      const result = buildClozedropdown({
        stimulus: "Select the {{response}}.",
        possible_responses: [["red", "blue", "green"]],
        valid_response: [["blue"]],
      });
      expect(result.type).toBe("clozedropdown");
      expect(result.possible_responses).toEqual([["red", "blue", "green"]]);
    });
  });

  describe("buildClozeformula", () => {
    it("should build clozeformulaV2 with default equivLiteral method", () => {
      const result = buildClozeformula({
        stimulus: "Solve: {{response}}",
        valid_response: ["x^2"],
      });
      expect(result.type).toBe("clozeformulaV2");
      expect(result.template).toBe("Solve: {{response}}");
      expect(result.validation.valid_response.value).toEqual([
        { method: "equivLiteral", value: "x^2" },
      ]);
    });

    it("should use specified method", () => {
      const result = buildClozeformula({
        stimulus: "Simplify: {{response}}",
        valid_response: ["2x"],
        method: "equivSymbolic",
      });
      expect(result.validation.valid_response.value).toEqual([
        { method: "equivSymbolic", value: "2x" },
      ]);
    });

    it("should handle single string valid_response", () => {
      const result = buildClozeformula({
        stimulus: "{{response}}",
        valid_response: "x+1",
      });
      expect(result.validation.valid_response.value).toEqual([
        { method: "equivLiteral", value: "x+1" },
      ]);
    });
  });

  describe("buildChoicematrix", () => {
    it("should build choicematrix with rows and columns", () => {
      const result = buildChoicematrix({
        stimulus: "Classify each statement",
        rows: ["The sun is a star", "The moon is a planet"],
        columns: ["True", "False"],
        valid_response: [[0], [1]],
      });
      expect(result.type).toBe("choicematrix");
      expect(result.stems).toEqual(["The sun is a star", "The moon is a planet"]);
      expect(result.options).toEqual(["True", "False"]);
      expect(result.validation.valid_response.value).toEqual([[0], [1]]);
    });
  });

  describe("buildOrderlist", () => {
    it("should build orderlist with list and validation", () => {
      const result = buildOrderlist({
        stimulus: "Put in order",
        list: ["First", "Second", "Third"],
        valid_response: [0, 1, 2],
      });
      expect(result.type).toBe("orderlist");
      expect(result.list).toEqual(["First", "Second", "Third"]);
      expect(result.validation.valid_response.value).toEqual([0, 1, 2]);
    });
  });

  describe("buildClassification", () => {
    it("should build classification with categories", () => {
      const result = buildClassification({
        stimulus: "Sort the animals",
        categories: ["Mammals", "Reptiles"],
        possible_responses: ["Dog", "Snake", "Cat", "Lizard"],
        valid_response: [[0, 2], [1, 3]],
      });
      expect(result.type).toBe("classification");
      expect(result.ui_style.column_count).toBe(2);
      expect(result.ui_style.column_titles).toEqual(["Mammals", "Reptiles"]);
      expect(result.possible_responses).toEqual(["Dog", "Snake", "Cat", "Lizard"]);
      expect(result.validation.valid_response.value).toEqual([[0, 2], [1, 3]]);
    });
  });

  describe("metadata", () => {
    it("joins list-form distractor_rationale into a single distractor_rationale string", () => {
      const result = buildMcq({
        stimulus: "Q?",
        options: ["A", "B", "C", "D"],
        valid_response: [0],
        metadata: [
          { kind: "distractor_rationale", value: ["a1", "a2", "a3", "a4"] },
        ],
      });
      expect(result.metadata).toEqual({
        distractor_rationale: "1. a1\n2. a2\n3. a3\n4. a4",
      });
    });

    it("maps string-form distractor_rationale to distractor_rationale", () => {
      const result = buildMcq({
        stimulus: "Q?",
        options: ["A", "B"],
        valid_response: [0],
        metadata: [
          { kind: "distractor_rationale", value: "whole-question rationale" },
        ],
      });
      expect(result.metadata).toEqual({
        distractor_rationale: "whole-question rationale",
      });
    });

    it("passes acknowledgements through", () => {
      const result = buildMcq({
        stimulus: "Q?",
        options: ["A", "B"],
        valid_response: [0],
        metadata: [
          { kind: "notes", value: "author note" },
          { kind: "acknowledgements", value: "Image: Louvre" },
        ],
      });
      expect(result.metadata).toEqual({
        acknowledgements: "Image: Louvre",
      });
    });

    it("does not add a metadata field when no metadata is passed (mcq)", () => {
      const result = buildMcq({
        stimulus: "Q?",
        options: ["A", "B"],
        valid_response: [0],
      });
      expect(result).not.toHaveProperty("metadata");
    });

    it("does not add a metadata field when no metadata is passed (shorttext)", () => {
      const result = buildShorttext({
        stimulus: "Q?",
        valid_response: "x",
      });
      expect(result).not.toHaveProperty("metadata");
    });

    it("does not add a metadata field when metadata is an empty list", () => {
      const result = buildMcq({
        stimulus: "Q?",
        options: ["A", "B"],
        valid_response: [0],
        metadata: [],
      });
      expect(result).not.toHaveProperty("metadata");
    });
  });

  describe("translateQuestionMetadata", () => {
    it("returns undefined for null/undefined input", () => {
      expect(translateQuestionMetadata(null)).toBeUndefined();
      expect(translateQuestionMetadata(undefined)).toBeUndefined();
    });

    it("returns undefined for empty list", () => {
      expect(translateQuestionMetadata([])).toBeUndefined();
    });

    it("translates all supported fields", () => {
      expect(translateQuestionMetadata([
        { kind: "distractor_rationale", value: ["one", "two"] },
        { kind: "acknowledgements", value: "a" },
      ])).toEqual({
        distractor_rationale: "1. one\n2. two",
        acknowledgements: "a",
      });
    });

    it("ignores unrecognized kinds", () => {
      expect(translateQuestionMetadata([
        { kind: "tags", value: { NGSS: ["MS-LS1-2"] } },
        { kind: "notes", value: "n" },
        { kind: "acknowledgements", value: "a" },
      ])).toEqual({ acknowledgements: "a" });
    });
  });

  describe("buildBowtie", () => {
    const validAttrs = () => ({
      stimulus: "Scenario",
      column_titles: ["Actions", "Condition", "Monitor"],
      possible_responses: [
        ["give aspirin", "give nitro", "call cardiology", "obtain 12-lead ECG"],
        ["myocardial infarction", "pulmonary embolism", "pericarditis"],
        ["ST segment changes", "blood pressure", "troponin", "respiratory rate"],
      ],
      valid_response: [
        ["give aspirin", "obtain 12-lead ECG"],
        ["myocardial infarction"],
        ["ST segment changes", "troponin"],
      ],
    });

    it("builds a complete bowtie from defaults", () => {
      const result = buildBowtie({});
      expect(result.type).toBe("bowtie");
      expect(result.group_possible_responses).toBe(true);
      expect(result.max_response_per_cell).toBe(1);
      expect(result.ui_style.column_titles).toEqual([
        "Actions to Take", "Condition Most Likely", "Parameters to Monitor",
      ]);
      expect(result.possible_response_groups).toHaveLength(3);
      expect(result.possible_response_groups[0].title).toBe("Actions to Take");
      expect(result.validation.valid_response.value.map(a => a.length)).toEqual([2, 1, 2]);
    });

    it("resolves valid-response strings to flat global indices", () => {
      const result = buildBowtie(validAttrs());
      // pools: 4 + 3 + 4. Pool offsets: 0, 4, 7.
      // "give aspirin" → 0, "obtain 12-lead ECG" → 3
      // "myocardial infarction" → 4
      // "ST segment changes" → 7, "troponin" → 9
      expect(result.validation.valid_response.value).toEqual([
        [0, 3],
        [4],
        [7, 9],
      ]);
    });

    it("mirrors the author-site sample (generic pool), producing [[2,0],[5],[8,11]]", () => {
      const result = buildBowtie({
        column_titles: ["Area 1", "Area 2", "Area 3"],
        possible_responses: [
          ["c1:i1", "c1:i2", "c1:i3", "c1:i4"],
          ["c2:i1", "c2:i2", "c2:i3", "c2:i4"],
          ["c3:i1", "c3:i2", "c3:i3", "c3:i4"],
        ],
        valid_response: [
          ["c1:i3", "c1:i1"],
          ["c2:i2"],
          ["c3:i1", "c3:i4"],
        ],
      });
      expect(result.validation.valid_response.value).toEqual([[2, 0], [5], [8, 11]]);
    });

    it("errors when column-titles has the wrong length", () => {
      const attrs = { ...validAttrs(), column_titles: ["only", "two"] };
      expect(() => buildBowtie(attrs)).toThrow(/column-titles must be an array of 3/);
    });

    it("errors when possible-responses has the wrong length", () => {
      const attrs = { ...validAttrs(), possible_responses: [["a", "b"], ["c"]] };
      expect(() => buildBowtie(attrs)).toThrow(/possible-responses must be an array of 3/);
    });

    it("errors when valid-response has the wrong length", () => {
      const attrs = { ...validAttrs(), valid_response: [["a"], ["b"]] };
      expect(() => buildBowtie(attrs)).toThrow(/valid-response must be an array of 3/);
    });

    it("errors when valid-response counts are not 2-1-2", () => {
      const attrs = {
        ...validAttrs(),
        valid_response: [
          ["give aspirin", "give nitro", "call cardiology"],
          ["myocardial infarction"],
          ["ST segment changes", "troponin"],
        ],
      };
      expect(() => buildBowtie(attrs)).toThrow(/2-1-2 correct answers \(got 3-1-2\)/);
    });

    it("errors when a valid-response entry is not in the matching pool", () => {
      const attrs = {
        ...validAttrs(),
        valid_response: [
          ["give aspirin", "NOT A REAL OPTION"],
          ["myocardial infarction"],
          ["ST segment changes", "troponin"],
        ],
      };
      expect(() => buildBowtie(attrs)).toThrow(/"NOT A REAL OPTION" is not in possible-responses\[0\]/);
    });

    it("errors on duplicate entries within a single valid-response list", () => {
      const attrs = {
        ...validAttrs(),
        valid_response: [
          ["give aspirin", "give aspirin"],
          ["myocardial infarction"],
          ["ST segment changes", "troponin"],
        ],
      };
      expect(() => buildBowtie(attrs)).toThrow(/duplicate entry "give aspirin"/);
    });

    it("errors when a pool is smaller than the required correct-answer count", () => {
      const attrs = {
        ...validAttrs(),
        possible_responses: [
          ["only one"],
          ["myocardial infarction"],
          ["ST segment changes", "troponin"],
        ],
        valid_response: [
          ["only one", "missing"],
          ["myocardial infarction"],
          ["ST segment changes", "troponin"],
        ],
      };
      expect(() => buildBowtie(attrs)).toThrow(/possible-responses\[0\] needs at least 2 options/);
    });
  });
});
