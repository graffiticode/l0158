// SPDX-License-Identifier: MIT

export function buildMcq(attrs) {
  const {
    stimulus,
    options,
    valid_response,
    multiple_responses,
    instant_feedback,
    shuffle_options,
    ...rest
  } = attrs;
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
  return question;
}

export function buildShorttext(attrs) {
  const {
    stimulus,
    valid_response,
    max_length,
    case_sensitive,
    instant_feedback,
    placeholder,
    ...rest
  } = attrs;
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
  return question;
}

export function buildLongtext(attrs) {
  const {
    stimulus,
    max_word_count,
    placeholder,
    ...rest
  } = attrs;
  const question = {
    type: "longtextV2",
    stimulus,
    ...rest,
  };
  if (max_word_count != null) {
    question.max_word_count = max_word_count;
  }
  if (placeholder != null) {
    question.placeholder = placeholder;
  }
  return question;
}

export function buildPlaintext(attrs) {
  const {
    stimulus,
    max_word_count,
    placeholder,
    ...rest
  } = attrs;
  const question = {
    type: "plaintext",
    stimulus,
    ...rest,
  };
  if (max_word_count != null) {
    question.max_word_count = max_word_count;
  }
  if (placeholder != null) {
    question.placeholder = placeholder;
  }
  return question;
}

export function buildClozetext(attrs) {
  const {
    stimulus,
    valid_response,
    case_sensitive,
    instant_feedback,
    ...rest
  } = attrs;
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
  return question;
}

export function buildClozeassociation(attrs) {
  const {
    stimulus,
    possible_responses,
    valid_response,
    instant_feedback,
    ...rest
  } = attrs;
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
  return question;
}

export function buildClozedropdown(attrs) {
  const {
    stimulus,
    possible_responses,
    valid_response,
    instant_feedback,
    ...rest
  } = attrs;
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
  return question;
}

export function buildClozeformula(attrs) {
  const {
    stimulus,
    valid_response,
    method,
    instant_feedback,
    ...rest
  } = attrs;
  const mathMethod = method || "equivLiteral";
  const question = {
    type: "clozeformulaV2",
    template: stimulus,
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
        value: values.map(v => ({
          method: mathMethod,
          value: v,
        })),
      },
    };
  }
  return question;
}

export function buildChoicematrix(attrs) {
  const {
    stimulus,
    rows,
    columns,
    valid_response,
    instant_feedback,
    shuffle_options,
    ...rest
  } = attrs;
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
  return question;
}

export function buildOrderlist(attrs) {
  const {
    stimulus,
    list,
    valid_response,
    instant_feedback,
    ...rest
  } = attrs;
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
  return question;
}

export function buildClassification(attrs) {
  const {
    stimulus,
    categories,
    possible_responses,
    valid_response,
    instant_feedback,
    ...rest
  } = attrs;
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
  return question;
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

// Registry mapping AST names to attribute field names
export const attributeFields = {
  STIMULUS: "stimulus",
  OPTIONS: "options",
  VALID_RESPONSE: "valid_response",
  INSTANT_FEEDBACK: "instant_feedback",
  SHUFFLE_OPTIONS: "shuffle_options",
  MULTIPLE_RESPONSES: "multiple_responses",
  CASE_SENSITIVE: "case_sensitive",
  MAX_LENGTH: "max_length",
  MAX_WORD_COUNT: "max_word_count",
  PLACEHOLDER: "placeholder",
  POSSIBLE_RESPONSES: "possible_responses",
  ROWS: "rows",
  COLUMNS: "columns",
  LIST: "list",
  CATEGORIES: "categories",
  METHOD: "method",
};
