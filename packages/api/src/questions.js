import { v4 as uuid } from "uuid";

export const buildCreateQuestions = ({
  sdk,
  key,
  secret,
  domain,
  dataApi
}) => async ({
  questions,
  save
}) => {
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
  const itemRef = `artcompiler-l0158-item-${questionId}`;
  const itemsReq = sdk.init(
    'data',
    {
      consumer_key: key,
      domain,
    },
    secret,
    {
      items: [{
        reference: itemRef,
        status: "published",
        definition: {
          widgets: [{
            reference: questionRef,
          }],
        },
        questions: [{
          reference: questionRef,
        }],
      }],
    },
    "set",
  );
  const itemsResp = await dataApi({
    route: "/itembank/items",
    request: itemsReq,
  });
  // return {
  //   type: "questions",
  //   data: {
  //     "id": "x0001",
  //     "name": "Test",
  //     questions,
  //     session_id: uuid(),
  //   },
  //   questionRef,
  // };
  return {
    type: "items",
    data: {
      user_id: uuid(),
      session_id: uuid(),
      activity_id: 'artcompiler-questions-test',
      rendering_type: 'assess',
      type: 'submit_practice',
      state: 'initial',
      name: "Test",
      items: [
        itemRef,
      ],
    },
  };
};

export const buildInitQuestions = ({
  sdk,
  key,
  secret,
  domain,
}) => async ({
  data,
}) => {
  // Construct a question api request and save questions to item bank.
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
