import fetch from "node-fetch";

export const buildDataApi = ({ baseUrl }) => async ({ route, data }) => {
  const endpoint = `${baseUrl}${route}`;  // e.g. "/itembank/questions";
  const body = new URLSearchParams(data);
  const dataApiResp = await fetch(endpoint, {
    method: 'POST',
    body,
  });
  return await dataApiResp.json();
};
