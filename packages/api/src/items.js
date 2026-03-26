// SPDX-License-Identifier: MIT
import { v4 as uuid } from "uuid";

function shortId() {
  return Date.now().toString(36);
}

const getDynamicContentData = (data) => {
  if (!data) {
    return;
  }
  let reference = "artcompiler-" + new Date().toISOString().split(":").join("").split(".").join("");
  let cols;
  let rows = {};
  if (data) {
    data.forEach((d, i) => {
      if (!cols) {
        cols = Object.keys(d);
      }
      let vals = Object.values(d);
      rows[reference + "-row-" + i] = {
        "values": vals,
        "index": i,
      };
    });
  }
  return {
    cols: cols,
    rows: rows,
  };
}

export const buildCreateItems = ({
  sdk,
  key,
  secret,
  domain,
  dataApi
}) => async ({
  items,
}) => {
  // console.log(
  //   "createItems()",
  //   "items=" + JSON.stringify(items, null, 2),
  // );
  const [ item ] = items;
  const { templateVariablesRecords } = item;
  const { questionRefs } = item;
  const itemRef = `artcompiler-l0158-${shortId()}`;
  const questions = item.data.questions.map(
    question => ({
      reference: question.reference
    })
  );
  const dynamicContentData = getDynamicContentData(templateVariablesRecords);
  // console.log(
  //   "createItems()",
  //   "items=" + JSON.stringify(items, null, 2),
  //   "dynamicContentData=" + JSON.stringify(dynamicContentData, null, 2),
  // );
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
        dynamic_content_data: dynamicContentData,
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
