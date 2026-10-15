// SPDX-License-Identifier: MIT
import { v4 as uuid } from "uuid";
import { toInlineQuestion } from "./activity.js";
import { getDynamicContentData } from "./questions.js";

// Compile a list of items to the render-ready activity (see activity.js). Only
// the first item is rendered. Its questions are inline (`{ response_id, type,
// ...questionData }`); legacy `{ type, reference, data }` records are
// converted. Unsigned: L0176 signs it at render time.
//
// The dynamic-data table inherited from an embedded L0166 custom question
// (already on the questions' activity as dynamic_content_data) overrides the
// hardwired one declared with the item-level `params` keyword.
export const createItems = ({ items, id }) => {
  const [ item ] = items;
  const questions = (item?.data?.questions || []).map(toInlineQuestion);
  const dynamicContentData =
    item?.data?.dynamic_content_data || getDynamicContentData(item?.params);
  const data = {
    id: `${id || "0"}`,
    name: "Test",
    questions,
    session_id: uuid(),
  };
  if (dynamicContentData) data.dynamic_content_data = dynamicContentData;
  return { type: "questions", data };
};
