import { v4 as uuid } from "uuid";

export const buildCreateItems = ({
  sdk,
  key,
  secret,
  domain,
  dataApi
}) => async ({
  items,
  save
}) => {
  let itemsRef;
  // if (save) {
  //   itemsRef = uuid();
  //   const itemsReq = sdk.init(
  //     'data',
  //     {
  //       consumer_key: key,
  //       domain,
  //     },
  //     secret,
  //     {
  //       items: [{
  //         type: items[0].type,
  //         reference: itemsRef,
  //         data: items[0],
  //       }],
  //     },
  //     "set",
  //   );
  //   const itemsResp = await dataApi({
  //     route: "/itembank/items",
  //     request: itemsReq,
  //   });
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
  //             reference: itemsRef,
  //           }],
  //         },
  //         items: [{
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
  // }
  return {
    type: "items",
    data: {
      "id": "x0001",
      "name": "Test",
      items,
      session_id: uuid(),
    },
    itemsRef,
  };
};

export const buildInitItems = ({
  sdk,
  key,
  secret,
  domain,
}) => async ({
  data,
}) => {
  // Construct a question api request and save items to item bank.
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
