// SPDX-License-Identifier: MIT
// The one shape L0158 compiles items and questions to: an unsigned,
// render-ready Learnosity activity.
//
//   { type: "questions" | "items",
//     data: { id, name, questions: [{ response_id, type, ...questionData }],
//             session_id, dynamic_content_data? } }
//
// L0158 holds no Learnosity credential and signs nothing. L0176 signs this
// activity at render time through Broker, whose `validatePreview` accepts only
// the PREVIEW_KEYS below in `data`, and requires every question to have a
// string `type` and a `response_id` matching RESPONSE_ID. Keep these in step
// with graffiticode packages/broker/src/operations.ts.

export const PREVIEW_KEYS = ["id", "name", "questions", "session_id", "dynamic_content_data", "type"];
export const RESPONSE_ID = /^[A-Za-z0-9_.:-]{1,250}$/;
export const ACTIVITY_TYPES = ["questions", "items"];

export const AUTHOR_ERROR =
  "Error: L0158 doesn't open the Learnosity Author Site; to plan an Author API integration, which your own application signs, use L0177.";
export const SAVE_ERROR =
  "Error: L0158 no longer saves to the item bank; use L0176.";
export const CREDENTIAL_ERROR =
  "Error: L0158 no longer takes Learnosity credentials (set-var \"learnosity-key\" / \"learnosity-secret\"); it holds none and signs nothing. L0176 signs its previews; to save to the item bank, use L0176.";

const isPlainObject = v => v !== null && typeof v === "object" && !Array.isArray(v);

// Make a response_id Broker accepts out of a generated reference: anything
// outside [A-Za-z0-9_.:-] becomes "_", and it's cut to 250 characters.
export const toResponseId = (ref) => {
  const id = String(ref ?? "").replace(/[^A-Za-z0-9_.:-]/g, "_").slice(0, 250);
  return id || "q";
};

// Turn one question into the inline Questions API shape. Accepts the inline
// shape `{ response_id, type, ...questionData }` as is, and the legacy record
// shape `{ type, reference, data }` (what L0158's standalone `questions` used to
// emit, and what old cached outputs still hold) as `{ response_id: reference,
// type, ...data }`.
export const toInlineQuestion = (q) => {
  if (!isPlainObject(q)) return q;
  if (q.response_id === undefined && typeof q.reference === "string" && isPlainObject(q.data)) {
    const { type, reference, data } = q;
    return { response_id: reference, ...data, type: type ?? data.type };
  }
  return q;
};

// The errors Broker's validatePreview would raise for `data`, or [] if it
// would accept it.
export const previewErrors = (data) => {
  if (!isPlainObject(data)) return ["the activity's data must be a record"];
  const errors = [];
  const extra = Object.keys(data).filter(k => !PREVIEW_KEYS.includes(k));
  if (extra.length) errors.push(`the activity's data has unsupported fields: ${extra.join(", ")}`);
  if (!Array.isArray(data.questions)) {
    errors.push("the activity's data.questions must be a list");
  } else {
    data.questions.forEach((q, i) => {
      if (!isPlainObject(q) || typeof q.type !== "string" || typeof q.response_id !== "string" || !RESPONSE_ID.test(q.response_id)) {
        errors.push(`questions[${i}] needs a type and a response_id matching ${RESPONSE_ID}`);
      }
    });
  }
  return errors;
};

// Normalize a value given to `init` into the contract activity, or explain why
// it can't be. Fields L0158 itself used to add (a signed `request`, an
// `itemBank` save receipt) are dropped: L0176 always signs afresh. Anything
// else outside the preview fields is an error rather than silently dropped.
// Returns { activity } or { errors }.
export const normalizeActivity = (value) => {
  if (!isPlainObject(value) || typeof value.type !== "string") {
    return { errors: ["Error: init expects a { type, data } activity of type \"questions\" or \"items\"."] };
  }
  if (value.type === "author") {
    return { errors: [AUTHOR_ERROR] };
  }
  if (!ACTIVITY_TYPES.includes(value.type)) {
    return { errors: [`Error: init expects an activity of type "questions" or "items", not "${value.type}".`] };
  }
  if (!isPlainObject(value.data)) {
    return { errors: ["Error: init expects a { type, data } activity; data is missing."] };
  }
  const data = {};
  for (const [k, v] of Object.entries(value.data)) {
    if (k === "request" || k === "itemBank") continue;
    data[k] = k === "questions" && Array.isArray(v) ? v.map(toInlineQuestion) : v;
  }
  const errors = previewErrors(data);
  if (errors.length) {
    return { errors: errors.map(e => `Error: init: ${e}.`) };
  }
  return { activity: { type: value.type, data } };
};
