// SPDX-License-Identifier: MIT
// A copy of Broker's preview validation, for tests: what L0176 will accept
// when it signs an L0158 activity through Broker. Copied from graffiticode
// packages/broker/src/operations.ts (`isPlainObject`, `isRef`, `onlyKeys`,
// `PREVIEW_KEYS`, `validatePreview`). Keep it in step with that file; it is
// deliberately not imported from ../activity.js, so the tests check L0158's
// output against Broker's rules rather than against L0158's own copy of them.

export class PayloadRejected extends Error {}

const isPlainObject = v => v !== null && typeof v === "object" && !Array.isArray(v);
const isRef = v => typeof v === "string" && /^[A-Za-z0-9_.:-]{1,250}$/.test(v);

const onlyKeys = (obj, allowed, where) => {
  if (!isPlainObject(obj)) throw new PayloadRejected(`${where} must be an object`);
  const extra = Object.keys(obj).filter(k => !allowed.includes(k));
  if (extra.length) throw new PayloadRejected(`${where} has unsupported fields: ${extra.join(", ")}`);
};

const PREVIEW_KEYS = ["id", "name", "questions", "session_id", "dynamic_content_data", "type"];

export const validatePreview = payload => {
  onlyKeys(payload, PREVIEW_KEYS, "preview");
  if (!Array.isArray(payload.questions)) throw new PayloadRejected("preview.questions must be a list");
  payload.questions.forEach((q, i) => {
    if (!isPlainObject(q) || typeof q.type !== "string" || !isRef(q.response_id)) {
      throw new PayloadRejected(`preview.questions[${i}] needs a type and response_id`);
    }
  });
};

// The whole contract for one L0158 activity: `{ type, data }` and nothing
// else at the top level, type "questions" or "items", no signed `request`,
// and `data` accepted by Broker's validatePreview. Throws on any violation.
export const expectContractActivity = (activity) => {
  if (!isPlainObject(activity)) throw new PayloadRejected("activity must be an object");
  onlyKeys(activity, ["type", "data"], "activity");
  if (!["questions", "items"].includes(activity.type)) {
    throw new PayloadRejected(`activity.type must be "questions" or "items", not ${JSON.stringify(activity.type)}`);
  }
  validatePreview(activity.data);
};
