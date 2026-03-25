// SPDX-License-Identifier: MIT
import fetch from "node-fetch";

export const buildDataApi = ({ baseUrl }) => async ({ route, request }) => {
  const endpoint = `${baseUrl}${route}`;
  const body = new URLSearchParams(request);
  console.log(
    "dataApi request",
    "route=" + route,
    "endpoint=" + endpoint,
    "body=" + JSON.stringify(request, null, 2),
  );
  const dataApiResp = await fetch(endpoint, {
    method: 'POST',
    body,
  });
  const data = await dataApiResp.json();
  console.log(
    "dataApi response",
    "route=" + route,
    "status=" + dataApiResp.status,
    "body=" + JSON.stringify(data, null, 2),
  );
  if (!dataApiResp.ok) {
    throw new Error(`Learnosity Data API error: ${dataApiResp.status} ${route} - ${JSON.stringify(data)}`);
  }
  if (data?.meta?.status === false) {
    console.error(
      "dataApi error",
      "route=" + route,
      "meta=" + JSON.stringify(data.meta, null, 2),
    );
    throw new Error(`Learnosity Data API failed: ${route} - ${JSON.stringify(data.meta)}`);
  }
  return data;
};
