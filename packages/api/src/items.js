import { v4 as uuid } from "uuid";

export const buildCreateItems = ({
  sdk,
  key,
  secret,
  domain,
  dataApi
}) => async ({
  items,
}) => {
  console.log("createItems() items=" + JSON.stringify(items, null, 2));
  // FIXME fix these
  const [ item ] = items;
  const { questionRefs } = item;
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
          reference: questionRefs[0],
        }],
      }],
    },
    "set",
  );
  const itemsResp = await dataApi({
    route: "/itembank/items",
    request: itemsReq,
  });
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

export const buildInitItems = ({
  sdk,
  key,
  secret,
  domain,
}) => async ({ data }) => {
  // Construct a items api request.
  const user_id = uuid();
  const consumer = {
    consumer_key: key,
    domain,
    user_id,
  };
  const signedRequest = sdk.init(
    'items',
    consumer,
    secret,
    data
  );
  return signedRequest;
}
