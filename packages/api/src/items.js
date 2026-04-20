// SPDX-License-Identifier: MIT
import { v4 as uuid } from "uuid";

// Translate a DSL item-level metadata list into the Learnosity item record's
// faceted `tags`, `metadata` bag, and top-level scalar fields (`note`,
// `description`, `source`, `adaptive.difficulty`).
//
// Input is an array of tagged entries produced by the arity-1 member
// constructors in the DSL: `{ kind, value }` where kind is one of
// "tags" | "difficulty" | "dok" | "notes" | "acknowledgements" |
// "description" | "source" | "difficulty_level".
//
// Everything faceted (difficulty, DOK, standards) goes into `tags` because
// that is the Author Site filter axis — the left-rail filter panel enumerates
// tag types, not metadata keys.
//
// Item details page fields bind to specific Learnosity locations:
//   notes            → item.note (top-level, singular)
//   description      → item.description (top-level)
//   source           → item.source (top-level)
//   difficulty-level → item.adaptive.difficulty (integer Rasch calibration)
//   acknowledgements → item.metadata.acknowledgements (nested bag)
//
// Tag type names follow Learnosity's sample-data convention: title-case for
// words ("Difficulty") and caps for acronyms ("DOK"). Tag values are strings
// (integers are stringified). `tags` entries accept a record whose values are
// a string or an array of strings — a bare string is treated as a single-
// element array for authoring convenience.
export function translateItemMetadata(entries) {
  const empty = {
    tags: undefined,
    note: undefined,
    description: undefined,
    source: undefined,
    adaptive: undefined,
    metadata: undefined,
  };
  if (!Array.isArray(entries)) {
    return empty;
  }
  const tags = {};
  const meta = {};
  let note;
  let description;
  let source;
  let difficultyLevel;
  const pushTag = (type, value) => {
    if (!tags[type]) tags[type] = [];
    tags[type].push(String(value));
  };
  for (const entry of entries) {
    if (entry == null || typeof entry !== "object") continue;
    const { kind, value } = entry;
    if (value == null) continue;
    if (kind === "tags") {
      if (value == null || typeof value !== "object") continue;
      for (const [type, raw] of Object.entries(value)) {
        if (raw == null) continue;
        const values = Array.isArray(raw) ? raw : [raw];
        for (const v of values) pushTag(type, v);
      }
    } else if (kind === "difficulty") {
      pushTag("Difficulty", value);
    } else if (kind === "dok") {
      pushTag("DOK", value);
    } else if (kind === "notes") {
      note = value;
    } else if (kind === "description") {
      description = value;
    } else if (kind === "source") {
      source = value;
    } else if (kind === "difficulty_level") {
      difficultyLevel = value;
    } else if (kind === "acknowledgements") {
      meta.acknowledgements = value;
    }
  }
  return {
    tags: Object.keys(tags).length > 0 ? tags : undefined,
    note,
    description,
    source,
    adaptive: difficultyLevel !== undefined ? { difficulty: difficultyLevel } : undefined,
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
  const { tags, note, description, source, adaptive, metadata } = translateItemMetadata(item.metadata);
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
  if (note !== undefined) itemRecord.note = note;
  if (description !== undefined) itemRecord.description = description;
  if (source !== undefined) itemRecord.source = source;
  if (adaptive !== undefined) itemRecord.adaptive = adaptive;
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
