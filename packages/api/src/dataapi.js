// SPDX-License-Identifier: MIT
import fetch from "node-fetch";

export const buildDataApi = ({ baseUrl }) => async ({ route, request }) => {
  const endpoint = `${baseUrl}${route}`;
  const body = new URLSearchParams(request);
  const dataApiResp = await fetch(endpoint, {
    method: 'POST',
    body,
  });
  const data = await dataApiResp.json();
  if (!dataApiResp.ok) {
    throw new Error(`Learnosity Data API error: ${dataApiResp.status} ${route} - ${JSON.stringify(data)}`);
  }
  if (data?.meta?.status === false) {
    throw new Error(`Learnosity Data API failed: ${route} - ${JSON.stringify(data.meta)}`);
  }
  return data;
};
