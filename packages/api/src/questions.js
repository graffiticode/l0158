// SPDX-License-Identifier: MIT
import { v4 as uuid } from "uuid";

const replaceVariableRefs = (str) => {
  const re = new RegExp("\\{\\{", "g");
  return str.replace(re, "{{var:");
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
}) => async (data) => {
  // console.log(
  //   "createQuestions()",
  //   "data=" + JSON.stringify(data, null, 2),
  // );
  // WARNING: Only using the data from the first and only question. If we ever support
  // more than one question here, this needs to be fixed.
  const templateVariablesRecords = data[0]?.data?.templateVariablesRecords;
  const questions = data.map((question, index) => {
    const questionId = question.id || index;
    const reference = `artcompiler-l0158-${question.type}-${questionId}`;
    const data = fixVariableRefs(question);
    // console.log(
    //   "createQuestions()",
    //   "data=" + JSON.stringify(data, null, 2),
    // );
    return {
      type: question.type,
      reference,
      data,
    };
  });
  // console.log(
  //   "createQuestions()",
  //   "questions=" + JSON.stringify(questions, null, 2),
  //   "templateVariablesRecords=" + JSON.stringify(templateVariablesRecords, null, 2),
  // );
  const questionRefs = questions.map(question => question.reference);
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
  const questionsResp = await dataApi({
    route: "/itembank/questions",
    request: questionsReq,
  });
  return {
    type: "questions",
    data: {
      "id": uuid(),
      "name": "Test",
      questions,
      session_id: uuid(),
    },
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
