import { v4 as uuid } from "uuid";

export const buildCreateQuestions = ({
  sdk,
  key,
  secret,
  domain,
  dataApi
}) => async ({ questions }) => {
  // TODO Support multiple questions.
  const [ question ] = questions;
  const questionId = question.id || "00000";
  const questionRef = `artcompiler-l0158-${question.type}-${questionId}`;
  const questionsReq = sdk.init(
    'data',
    {
      consumer_key: key,
      domain,
    },
    secret,
    {
      questions: [{
        type: questions[0].type,
        reference: questionRef,
        data: questions[0],
      }],
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
      "id": "x0001",
      "name": "Test",
      questions,
      session_id: uuid(),
    },
    questionRefs: [questionRef],
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
