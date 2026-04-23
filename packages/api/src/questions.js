// SPDX-License-Identifier: MIT
import { v4 as uuid } from "uuid";

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

export const buildCreateQuestions = ({
  sdk,
  key,
  secret,
  domain,
  dataApi
}) => async (data, { id, saveToItembank = false } = {}) => {
  // WARNING: Only using the data from the first and only question. If we ever support
  // more than one question here, this needs to be fixed.
  const templateVariablesRecords = data[0]?.data?.templateVariablesRecords;
  const batchId = id || "0";
  const questions = data.map((question, index) => {
    const reference = `artcompiler-${question.type}-${batchId}-${index}`;
    const data = fixVariableRefs(question);
    return {
      type: question.type,
      reference,
      data,
    };
  });
  const questionRefs = questions.map(question => question.reference);
  let itemBankResult;
  if (saveToItembank) {
    const questionsReq = sdk.init(
      'data',
      {
        consumer_key: key,
        domain,
      },
      secret,
      {
        questions,
      },
      "set",
    );
    await dataApi({
      route: "/itembank/questions",
      request: questionsReq,
    });
    // dataApi throws on non-2xx, so reaching here means the write succeeded.
    itemBankResult = {
      saved: true,
      references: questionRefs,
      savedAt: new Date().toISOString(),
    };
  }
  const data = {
    "id": uuid(),
    "name": "Test",
    questions,
    session_id: uuid(),
  };
  if (itemBankResult) data.itemBank = itemBankResult;
  return {
    type: "questions",
    data,
    templateVariablesRecords,
    questionRefs,
  };
};

export const buildInitQuestions = ({
  sdk,
  key,
  secret,
  domain,
}) => async ({ data }) => {
  // Construct a questions api request.
  const user_id = uuid();
  const consumer = {
    consumer_key: key,
    domain,
    user_id,
  };
  const signedRequest = sdk.init(
    'questions',
    consumer,
    secret,
    data
  );
  return signedRequest;
}
