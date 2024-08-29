import { v4 as uuid } from "uuid";

export const buildCreateQuestions = ({
  sdk,
  key,
  secret,
  domain,
  dataApi
}) => async (data) => {
  const questions = data.map((question, index) => {
    const questionId = question.id || index;
    const questionRef = `artcompiler-l0158-${question.type}-${questionId}`;
    return {
      type: question.type,
      reference: questionRef,
      data: question,
    };
  });
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
