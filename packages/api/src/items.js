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
  console.log(
    "createItems()",
    "items=" + JSON.stringify(items, null, 2),
  );
  const [ item ] = items;
  const { questionRefs } = item;
  const itemId = questionRefs[0].split("-").slice(2).join("-");
  const itemRef = `artcompiler-${itemId}`;
  const questions = item.data.questions.map(
    question => ({
      reference: question.reference
    })
  );
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
          widgets: questions,
        },
        questions,
      }],
    },
    "set",
  );
  const itemsResp = await dataApi({
    route: "/itembank/items",
    request: itemsReq,
  });
  // TODO check for success or failure.
  return {
    type: "items",
    data: {
      user_id: uuid(),
      session_id: uuid(),
      activity_id: 'artcompiler-questions-test',
      rendering_type: 'inline',
      type: 'submit_practice',
      state: 'initial',
      name: "Test",
      items: [{
        id: "item-1",
        reference: itemRef,
      }],
      config: {
        questions_api_init_options: {
          // renderSaveButton: true,
          // renderSubmitButton: true,
        },
      },
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
