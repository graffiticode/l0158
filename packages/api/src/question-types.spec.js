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
} from "./question-types.js";

describe("question-types", () => {
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
        max_word_count: 500,
        placeholder: "Start writing...",
      });
      expect(result.type).toBe("longtextV2");
      expect(result.stimulus).toBe("Write an essay");
      expect(result.max_word_count).toBe(500);
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
});
