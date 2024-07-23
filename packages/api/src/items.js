import { v4 as uuid } from "uuid";
const route = "/itembank/items";

export const buildItemsApi = ({ sdk, key, secret, domain, dataApi }) => async () => {
  const user_id = uuid();    // Generate a UUID for the user ID
  const session_id = uuid(); // Generate a UUID for the session ID
  const data = sdk.init(  // Set Learnosity init options
    'data', // Select Data API
    {
      consumer_key: key,
      domain: 'localhost',
    },
    secret,
    {
      // types: [
      //   "mcq"
      // ],
      item_references: [
        "ARTC_770138d1-e3f9-4227-8f40-2599f13356db",
      ],
    },
    "get",
  );
  return await dataApi({route, data});
}

