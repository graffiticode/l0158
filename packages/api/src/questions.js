import { v4 as uuid } from "uuid";
const route = "/itembank/questions";

export const buildQuestionsApi = ({ sdk, key, secret, domain, dataApi }) => async ({ questions }) => {
  console.log("buildQuestionsApi() domain=" + domain);
  console.log("buildQuestionsApi() questions=" + JSON.stringify(questions, null, 2));
  const user_id = uuid();    // Generate a UUID for the user ID
  const session_id = uuid(); // Generate a UUID for the session ID
  const data = sdk.init( // Set Learnosity init options
    'questions', // Select Data API
    {
      consumer_key: key,
      domain,
      user_id,
    },
    secret,
    {
      "id": "x0001",
      "name": "Test",
      questions,
      session_id,
    },
  );
  return data;
}

