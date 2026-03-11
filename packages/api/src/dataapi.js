// SPDX-License-Identifier: MIT
import fetch from "node-fetch";

export const buildDataApi = ({ baseUrl }) => async ({ route, request }) => {
  const endpoint = `${baseUrl}${route}`;  // e.g. "/itembank/questions";
  const body = new URLSearchParams(request);
  const dataApiResp = await fetch(endpoint, {
    method: 'POST',
    body,
  });
  return await dataApiResp.json();
};
