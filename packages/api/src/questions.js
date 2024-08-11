import { v4 as uuid } from "uuid";

export const createQuestions = ({ questions }) => ({
    type: "questions",
    data: {
      "id": "x0001",
      "name": "Test",
      questions,
      session_id: uuid(),
    },
});

export const buildInitQuestions = ({
  sdk,
  key,
  secret,
  domain,
  dataApi
}) => async ({
  data,
  save,
}) => {
  // Construct a question api request and save questions to item bank.
//  console.log("buildInitQuestions() save=" + save + " data=" + JSON.stringify(data, null, 2));
  // if (save) {
  //   const { questions } = data;
  //   const questionsRef = uuid();
  //   console.log("createQuestions() questions=" + JSON.stringify(questions, null, 2));
  //   const questionsReq = sdk.init(
  //     'data',
  //     {
  //       consumer_key: key,
  //       domain,
  //     },
  //     secret,
  //     {
  //       questions: [{
  //         type: questions[0].type,
  //         reference: questionsRef,
  //         data: questions[0],
  //       }],
  //     },
  //     "set",
  //   );
  //   console.log("createQuestions() questionsReq=" + JSON.stringify(questionsReq, null, 2));
  //   const questionsResp = await dataApi({
  //     route: "/itembank/questions",
  //     request: questionsReq,
  //   });
  //   console.log("createQuestions() questionsResp=" + JSON.stringify(questionsResp, null, 2));
  //   const itemsRef = uuid();
  //   const itemsReq = sdk.init(
  //     'data',
  //     {
  //       consumer_key: key,
  //       domain,
  //     },
  //     secret,
  //     {
  //       items: [{
  //         reference: itemsRef,
  //         definition: {
  //           widgets: [{
  //             reference: questionsRef,
  //           }],
  //         },
  //         questions: [{
  //           reference: questionsRef,
  //         }],
  //       }],
  //     },
  //     "set",
  //   );
  //   const itemsResp = await dataApi({
  //     route: "/itembank/items",
  //     request: itemsReq,
  //   });
  //   console.log("createQuestions() itemsResp=" + JSON.stringify(itemsResp, null, 2));
  // }
  const user_id = uuid();
  return sdk.init(
    'questions',
    {
      consumer_key: key,
      domain,
      user_id,
    },
    secret,
    data
  );
}

