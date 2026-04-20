// SPDX-License-Identifier: MIT

// Default mock data per question type
const DEFAULTS = {
  mcq: {
    stimulus: "Which of the following is correct?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    valid_response: [0],
  },
  shorttext: {
    stimulus: "Type your answer below.",
    valid_response: "answer",
  },
  longtext: {
    stimulus: "Write a detailed response.",
    max_length: 500,
    placeholder: "Start writing here...",
  },
  plaintext: {
    stimulus: "Write your response in plain text.",
    max_length: 300,
    placeholder: "Start writing here...",
  },
  clozetext: {
    stimulus: "The {{response}} is the answer.",
    valid_response: ["answer"],
  },
  clozeassociation: {
    stimulus: "Drag the correct {{response}} here.",
    possible_responses: ["correct", "incorrect", "maybe"],
    valid_response: ["correct"],
  },
  clozedropdown: {
    stimulus: "Select the correct {{response}}.",
    possible_responses: [["correct", "incorrect", "maybe"]],
    valid_response: ["correct"],
  },
  clozeformula: {
    stimulus: "Solve: {{response}}",
    valid_response: ["x+1"],
    method: "equivLiteral",
  },
  choicematrix: {
    stimulus: "Select the correct answer for each row.",
    rows: ["Statement 1", "Statement 2"],
    columns: ["True", "False"],
    valid_response: [[0], [1]],
  },
  orderlist: {
    stimulus: "Arrange the items in the correct order.",
    list: ["First", "Second", "Third", "Fourth"],
    valid_response: [0, 1, 2, 3],
  },
  classification: {
    stimulus: "Sort the items into the correct categories.",
    categories: ["Category A", "Category B"],
    possible_responses: ["Item 1", "Item 2", "Item 3", "Item 4"],
    valid_response: [[0, 2], [1, 3]],
  },
};

function withDefaults(type, attrs) {
  const defaults = DEFAULTS[type] || {};
  return { ...defaults, ...attrs };
}

// Translate a DSL question-level metadata list into a Learnosity question
// metadata object. Input is an array of tagged entries ({kind, value}) where
// kind is one of "acknowledgements" | "distractor_rationale".
// Returns undefined when there is nothing to attach, so no-metadata programs
// produce byte-identical output to pre-feature behavior.
export function translateQuestionMetadata(entries) {
  if (!Array.isArray(entries)) {
    return undefined;
  }
  const out = {};
  for (const entry of entries) {
    if (entry == null || typeof entry !== "object") continue;
    const { kind, value } = entry;
    if (value == null) continue;
    if (kind === "distractor_rationale") {
      out.distractor_rationale = Array.isArray(value)
        ? value.map((v, i) => `${i + 1}. ${v}`).join("\n")
        : value;
    } else if (kind === "acknowledgements") {
      out.acknowledgements = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function attachQuestionMetadata(question, metadata) {
  const translated = translateQuestionMetadata(metadata);
  if (translated !== undefined) {
    question.metadata = translated;
  }
  return question;
}

export function buildMcq(attrs) {
  const {
    stimulus,
    options,
    valid_response,
    multiple_responses,
    instant_feedback,
    shuffle_options,
    metadata,
    ...rest
  } = withDefaults("mcq", attrs);
  const question = {
    type: "mcq",
    stimulus,
    options: options.map((label, i) => ({ label, value: String(i) })),
    ...rest,
  };
  if (multiple_responses != null) {
    question.multiple_responses = multiple_responses;
  }
  if (shuffle_options != null) {
    question.shuffle_options = shuffle_options;
  }
  if (instant_feedback != null) {
    question.instant_feedback = instant_feedback;
  }
  if (valid_response != null) {
    question.validation = {
      scoring_type: "exactMatch",
      valid_response: {
        score: 1,
        value: valid_response.map(String),
      },
    };
  }
  return attachQuestionMetadata(question, metadata);
}

export function buildShorttext(attrs) {
  const {
    stimulus,
    valid_response,
    max_length,
    case_sensitive,
    instant_feedback,
    placeholder,
    metadata,
    ...rest
  } = withDefaults("shorttext", attrs);
  const question = {
    type: "shorttext",
    stimulus,
    ...rest,
  };
  if (max_length != null) {
    question.max_length = max_length;
  }
  if (case_sensitive != null) {
    question.case_sensitive = case_sensitive;
  }
  if (instant_feedback != null) {
    question.instant_feedback = instant_feedback;
  }
  if (placeholder != null) {
    question.placeholder = placeholder;
  }
  if (valid_response != null) {
    question.validation = {
      scoring_type: "exactMatch",
      valid_response: {
        score: 1,
        value: valid_response,
      },
    };
  }
  return attachQuestionMetadata(question, metadata);
}

export function buildLongtext(attrs) {
  const {
    stimulus,
    max_length,
    placeholder,
    metadata,
    ...rest
  } = withDefaults("longtext", attrs);
  const question = {
    type: "longtextV2",
    stimulus,
    ...rest,
  };
  if (max_length != null) {
    question.max_length = max_length;
  }
  if (placeholder != null) {
    question.placeholder = placeholder;
  }
  return attachQuestionMetadata(question, metadata);
}

export function buildPlaintext(attrs) {
  const {
    stimulus,
    max_length,
    placeholder,
    metadata,
    ...rest
  } = withDefaults("plaintext", attrs);
  const question = {
    type: "plaintext",
    stimulus,
    ...rest,
  };
  if (max_length != null) {
    question.max_length = max_length;
  }
  if (placeholder != null) {
    question.placeholder = placeholder;
  }
  return attachQuestionMetadata(question, metadata);
}

export function buildClozetext(attrs) {
  const {
    stimulus,
    valid_response,
    case_sensitive,
    instant_feedback,
    metadata,
    ...rest
  } = withDefaults("clozetext", attrs);
  const question = {
    type: "clozetext",
    template: stimulus,
    ...rest,
  };
  if (case_sensitive != null) {
    question.case_sensitive = case_sensitive;
  }
  if (instant_feedback != null) {
    question.instant_feedback = instant_feedback;
  }
  if (valid_response != null) {
    question.validation = {
      scoring_type: "exactMatch",
      valid_response: {
        score: 1,
        value: valid_response,
      },
    };
  }
  return attachQuestionMetadata(question, metadata);
}

export function buildClozeassociation(attrs) {
  const {
    stimulus,
    possible_responses,
    valid_response,
    instant_feedback,
    metadata,
    ...rest
  } = withDefaults("clozeassociation", attrs);
  const question = {
    type: "clozeassociation",
    template: stimulus,
    possible_responses,
    ...rest,
  };
  if (instant_feedback != null) {
    question.instant_feedback = instant_feedback;
  }
  if (valid_response != null) {
    question.validation = {
      scoring_type: "exactMatch",
      valid_response: {
        score: 1,
        value: valid_response,
      },
    };
  }
  return attachQuestionMetadata(question, metadata);
}

export function buildClozedropdown(attrs) {
  const {
    stimulus,
    possible_responses,
    valid_response,
    instant_feedback,
    metadata,
    ...rest
  } = withDefaults("clozedropdown", attrs);
  const question = {
    type: "clozedropdown",
    template: stimulus,
    possible_responses,
    ...rest,
  };
  if (instant_feedback != null) {
    question.instant_feedback = instant_feedback;
  }
  if (valid_response != null) {
    question.validation = {
      scoring_type: "exactMatch",
      valid_response: {
        score: 1,
        value: valid_response,
      },
    };
  }
  return attachQuestionMetadata(question, metadata);
}

export function buildClozeformula(attrs) {
  const {
    stimulus,
    valid_response,
    method,
    instant_feedback,
    metadata,
    ...rest
  } = withDefaults("clozeformula", attrs);
  const mathMethod = method || "equivLiteral";
  const question = {
    type: "clozeformulaV2",
    template: stimulus,
    is_math: true,
    ui_style: { type: "block-on-focus-keyboard" },
    response_containers: [],
    show_hints_button: true,
    ...rest,
  };
  if (instant_feedback != null) {
    question.instant_feedback = instant_feedback;
  }
  if (valid_response != null) {
    const values = Array.isArray(valid_response) ? valid_response : [valid_response];
    question.validation = {
      scoring_type: "exactMatch",
      valid_response: {
        score: 1,
        value: values.map(v => [{
          method: mathMethod,
          value: v,
          options: {
            ignoreOrder: false,
            setDecimalSeparator: ".",
            setThousandsSeparator: [],
            inverseResult: false,
          },
        }]),
      },
    };
  }
  return attachQuestionMetadata(question, metadata);
}

export function buildChoicematrix(attrs) {
  const {
    stimulus,
    rows,
    columns,
    valid_response,
    instant_feedback,
    shuffle_options,
    metadata,
    ...rest
  } = withDefaults("choicematrix", attrs);
  const question = {
    type: "choicematrix",
    stimulus,
    options: columns,
    stems: rows,
    ...rest,
  };
  if (shuffle_options != null) {
    question.shuffle_options = shuffle_options;
  }
  if (instant_feedback != null) {
    question.instant_feedback = instant_feedback;
  }
  if (valid_response != null) {
    question.validation = {
      scoring_type: "exactMatch",
      valid_response: {
        score: 1,
        value: valid_response,
      },
    };
  }
  return attachQuestionMetadata(question, metadata);
}

export function buildOrderlist(attrs) {
  const {
    stimulus,
    list,
    valid_response,
    instant_feedback,
    metadata,
    ...rest
  } = withDefaults("orderlist", attrs);
  const question = {
    type: "orderlist",
    stimulus,
    list,
    ...rest,
  };
  if (instant_feedback != null) {
    question.instant_feedback = instant_feedback;
  }
  if (valid_response != null) {
    question.validation = {
      scoring_type: "exactMatch",
      valid_response: {
        score: 1,
        value: valid_response,
      },
    };
  }
  return attachQuestionMetadata(question, metadata);
}

export function buildClassification(attrs) {
  const {
    stimulus,
    categories,
    possible_responses,
    valid_response,
    instant_feedback,
    metadata,
    ...rest
  } = withDefaults("classification", attrs);
  const question = {
    type: "classification",
    stimulus,
    possible_responses,
    ui_style: {
      column_count: categories.length,
      column_titles: categories,
    },
    ...rest,
  };
  if (instant_feedback != null) {
    question.instant_feedback = instant_feedback;
  }
  if (valid_response != null) {
    question.validation = {
      scoring_type: "exactMatch",
      valid_response: {
        score: 1,
        value: valid_response,
      },
    };
  }
  return attachQuestionMetadata(question, metadata);
}

// Registry mapping AST names to builders
export const questionTypeBuilders = {
  MCQ: buildMcq,
  SHORTTEXT: buildShorttext,
  LONGTEXT: buildLongtext,
  PLAINTEXT: buildPlaintext,
  CLOZETEXT: buildClozetext,
  CLOZEASSOCIATION: buildClozeassociation,
  CLOZEDROPDOWN: buildClozedropdown,
  CLOZEFORMULA: buildClozeformula,
  CHOICEMATRIX: buildChoicematrix,
  ORDERLIST: buildOrderlist,
  CLASSIFICATION: buildClassification,
};

// Registry mapping AST names to attribute field names and expected types
// valueType: "string" | "number" | "boolean" | "array" | "any"
export const attributeFields = {
  STIMULUS: { field: "stimulus", valueType: "string" },
  OPTIONS: { field: "options", valueType: "array" },
  VALID_RESPONSE: { field: "valid_response", valueType: "any" },
  INSTANT_FEEDBACK: { field: "instant_feedback", valueType: "boolean" },
  SHUFFLE_OPTIONS: { field: "shuffle_options", valueType: "boolean" },
  MULTIPLE_RESPONSES: { field: "multiple_responses", valueType: "boolean" },
  CASE_SENSITIVE: { field: "case_sensitive", valueType: "boolean" },
  MAX_LENGTH: { field: "max_length", valueType: "number" },
  MAX_WORD_COUNT: { field: "max_length", valueType: "number" },
  PLACEHOLDER: { field: "placeholder", valueType: "string" },
  POSSIBLE_RESPONSES: { field: "possible_responses", valueType: "array" },
  ROWS: { field: "rows", valueType: "array" },
  COLUMNS: { field: "columns", valueType: "array" },
  ORDER_LIST: { field: "list", valueType: "array" },
  CATEGORIES: { field: "categories", valueType: "array" },
  METHOD: { field: "method", valueType: "string", allowed: ["equivLiteral", "equivSymbolic", "equivValue", "isSimplified", "isFactorised", "isExpanded", "stringMatch", "isUnit"] },
  ID: { field: "id", valueType: "string" },
  METADATA: { field: "metadata", valueType: "array" },
};

// Metadata member constructors (arity 1). Each maps a DSL keyword to the
// `kind` string attached to its tagged-entry output, so the translators in
// items.js and question-types.js can dispatch on kind.
export const metadataMembers = {
  TAGS: { kind: "tags" },
  DIFFICULTY: { kind: "difficulty" },
  DOK: { kind: "dok" },
  NOTES: { kind: "notes" },
  DISTRACTOR_RATIONALE: { kind: "distractor_rationale" },
  ACKNOWLEDGEMENTS: { kind: "acknowledgements" },
};

// Which attributes are valid for each question type
export const validAttributes = {
  MCQ: ["stimulus", "options", "valid_response", "instant_feedback", "shuffle_options", "multiple_responses", "metadata"],
  SHORTTEXT: ["stimulus", "valid_response", "instant_feedback", "case_sensitive", "max_length", "placeholder", "metadata"],
  LONGTEXT: ["stimulus", "max_length", "placeholder", "metadata"],
  PLAINTEXT: ["stimulus", "max_length", "placeholder", "metadata"],
  CLOZETEXT: ["stimulus", "valid_response", "instant_feedback", "case_sensitive", "metadata"],
  CLOZEASSOCIATION: ["stimulus", "possible_responses", "valid_response", "instant_feedback", "metadata"],
  CLOZEDROPDOWN: ["stimulus", "possible_responses", "valid_response", "instant_feedback", "metadata"],
  CLOZEFORMULA: ["stimulus", "valid_response", "instant_feedback", "method", "metadata"],
  CHOICEMATRIX: ["stimulus", "rows", "columns", "valid_response", "instant_feedback", "shuffle_options", "metadata"],
  ORDERLIST: ["stimulus", "list", "valid_response", "instant_feedback", "metadata"],
  CLASSIFICATION: ["stimulus", "categories", "possible_responses", "valid_response", "instant_feedback", "metadata"],
};
