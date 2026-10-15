// SPDX-License-Identifier: MIT
import { v4 as uuid } from "uuid";
import { toResponseId } from "./activity.js";

const replaceVariableRefs = (str) => {
  // Replace {{...}} with {{var:...}} for template variables,
  // but skip {{response}} which is a Learnosity cloze placeholder.
  return str.replace(/\{\{(?!response\}\})/g, "{{var:");
}

const isNonNullNonEmptyObject = obj => (
  typeof obj === "object" &&
    obj !== null &&
    Object.keys(obj).length > 0
);

const fixVariableRefs = (obj) => (
  Object.keys(obj).reduce((obj, key) => {
    const val = obj[key];
    // console.log(
    //   "fixVariableRefs()",
    //   "key=" + key,
    //   "val=" + JSON.stringify(val),
    // );
    if (typeof obj[key] === "string") {
      obj[key] = replaceVariableRefs(val);
    } else if (isNonNullNonEmptyObject(val)) {
      obj[key] = fixVariableRefs(val);
    }
    return obj;
  }, obj)
);

// Build the dynamic_content_data table Learnosity substitutes {{var:X}} from:
// one row per record, columns from the first record's keys. Returns undefined
// for no records.
export const getDynamicContentData = (records) => {
  if (!Array.isArray(records) || records.length === 0) {
    return undefined;
  }
  const reference = "graffiticode-" + new Date().toISOString().split(":").join("").split(".").join("");
  let cols;
  const rows = {};
  records.forEach((d, i) => {
    if (!cols) {
      cols = Object.keys(d);
    }
    rows[reference + "-row-" + i] = {
      "values": Object.values(d),
      "index": i,
    };
  });
  return { cols, rows };
};

// Compile a list of questions to the render-ready activity (see activity.js):
// `{ type: "questions", data: { id, name, questions, session_id,
// dynamic_content_data? } }`, each question inline as `{ response_id, type,
// ...questionData }`. Unsigned: L0176 signs it at render time.
//
// `params` is a hardwired dynamic-data table (from a `params` chained into the
// questions continuation); a table inherited from an embedded custom question
// wins over it.
export const createQuestions = (data, { id, params } = {}) => {
  // Inherit a dynamic-data table from the first question whose data carries
  // one (typically an embedded L0166 custom question whose data includes
  // templateVariablesRecords). Items have one shared table in Learnosity's
  // model; first-wins matches the common single-widget-per-item case.
  let templateVariablesRecords;
  for (const q of data) {
    const records = q?.data?.templateVariablesRecords;
    if (Array.isArray(records) && records.length > 0) {
      templateVariablesRecords = records;
      break;
    }
  }
  const batchId = id || "0";
  const questions = data.map((question, index) => {
    const responseId = toResponseId(`artcompiler-${question.type}-${batchId}-${index}`);
    const fixed = fixVariableRefs(question);
    return {
      response_id: responseId,
      ...fixed,
      type: question.type,
    };
  });
  const questionsData = {
    id: uuid(),
    name: "Test",
    questions,
    session_id: uuid(),
  };
  const dynamicContentData = getDynamicContentData(templateVariablesRecords || params);
  if (dynamicContentData) questionsData.dynamic_content_data = dynamicContentData;
  return {
    type: "questions",
    data: questionsData,
  };
};
