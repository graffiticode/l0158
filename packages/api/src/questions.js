import { v4 as uuid } from "uuid";
const route = "/itembank/questions";

export const buildQuestionsApi = ({ sdk, key, secret, dataApi }) => async () => {
  const user_id = uuid();    // Generate a UUID for the user ID
  const session_id = uuid(); // Generate a UUID for the session ID
  const domain = 'localhost';   // Set the domain
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
      questions: [
        {
          response_id: '60005',
          type: 'association',
          stimulus: 'Match the cities to the parent nation.',
          stimulus_list: ['London', 'Dublin', 'Paris', 'Sydney'],
          possible_responses: ['Australia', 'France', 'Ireland', 'England'
                              ],
          validation: {
            valid_responses: [
              ['England'],['Ireland'],['France'],['Australia']
            ]
          },
          instant_feedback: true
        }
      ],
      session_id,
    },
  );
  return data;
}

