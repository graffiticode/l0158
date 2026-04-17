// SPDX-License-Identifier: MIT
import { v4 as uuid } from "uuid";

// Translate a DSL item-level metadata block into the Learnosity item record
// fields `tags` (object keyed by tag type) and `metadata`. Tag strings use the
// first ":" as the type/value separator, so "Common Core:Math:6.NS.A.1" becomes
// type "Common Core" with value "Math:6.NS.A.1". Difficulty and DOK are
// surfaced as tags so the Author Site filter panel renders them. The Items
// API field that backs the settings "Difficulty level" spinner is not yet
// confirmed — candidates are item.adaptive.difficulty and a top-level
// item.difficulty — so for now only the tag form is emitted.
export function translateItemMetadata(metadata) {
  if (metadata == null || typeof metadata !== "object") {
    return { tags: undefined, metadata: undefined };
  }
  const tags = {};
  const meta = {};
  const pushTag = (type, value) => {
    if (!tags[type]) tags[type] = [];
    tags[type].push(String(value));
  };
  for (const [key, value] of Object.entries(metadata)) {
    if (value == null) continue;
    if (key === "tags") {
      if (!Array.isArray(value)) continue;
      for (const tag of value) {
        if (typeof tag !== "string") continue;
        const colon = tag.indexOf(":");
        if (colon < 0) continue;
        pushTag(tag.slice(0, colon), tag.slice(colon + 1));
      }
    } else if (key === "difficulty") {
      pushTag("Difficulty", value);
    } else if (key === "dok") {
      pushTag("DOK", value);
    } else if (key === "notes") {
      meta.note = value;
    } else {
      meta[key] = value;
    }
  }
  return {
    tags: Object.keys(tags).length > 0 ? tags : undefined,
    metadata: Object.keys(meta).length > 0 ? meta : undefined,
  };
}

const getDynamicContentData = (data) => {
  if (!data) {
    return;
  }
  let reference = "graffiticode-" + new Date().toISOString().split(":").join("").split(".").join("");
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
  id,
}) => {
  // console.log(
  //   "createItems()",
  //   "items=" + JSON.stringify(items, null, 2),
  // );
  const [ item ] = items;
  const { templateVariablesRecords } = item;
  const { questionRefs } = item;
  const itemRef = `graffiticode-${id || '0'}`;
  const questions = item.data.questions.map(
    question => ({
      reference: question.reference
    })
  );
  const dynamicContentData = getDynamicContentData(templateVariablesRecords);
  const { tags, metadata } = translateItemMetadata(item.metadata);
  const itemRecord = {
    reference: itemRef,
    status: "published",
    definition: {
      widgets: questions,
    },
    dynamic_content_data: dynamicContentData,
    questions,
  };
  if (tags !== undefined) itemRecord.tags = tags;
  if (metadata !== undefined) itemRecord.metadata = metadata;
  const itemsReq = sdk.init(
    'data',
    {
      consumer_key: key,
      domain,
    },
    secret,
    {
      items: [itemRecord],
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
      activity_id: `${id || '0'}`,
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
