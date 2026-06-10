// SPDX-License-Identifier: MIT
import bent from "bent";

function getApiUrl() {
  const host = window.document.location.host;
  return host.indexOf("localhost") === 0 && "http://localhost:3100" || "https://api.graffiticode.org";
}

function getLangUrl() {
  const host = window.document.location.host;
  return host.indexOf("localhost") === 0 && "http://localhost:50158" || "https://l0158.graffiticode.org";
}

export const getApiTask = async ({ auth, id }) => {
  try {
    const headers = { "Authorization": auth.token };
    const apiUrl = getApiUrl();
    const getApiJSON = bent(apiUrl, "GET", "json");
    const { status, error, data: task } = await getApiJSON(`/task?id=${id}`, null, headers);
    if (status !== "success") {
      throw new Error(`failed to get task ${id}: ${error.message}`);
    }
    return task;
  } catch (err) {
    throw err;
  }
};

export const getApiData = async ({ accessToken, id }) => {
  try {
    const apiUrl = getApiUrl();
    console.log("getApiData request", "id=" + id, "apiUrl=" + apiUrl);
    const getApiJSON = bent(apiUrl, "GET", "json");
    const headers = {
      "Authorization": accessToken || "",
    };
    const { status, error, data } = await getApiJSON(`/data?id=${id}`, null, headers);
    console.log("getApiData response", "status=" + status, "data=" + JSON.stringify(data));
    if (status !== "success") {
      throw new Error(`failed to get task ${id}: ${error.message}`);
    }
    return data;
  } catch (err) {
    console.error("getApiData error", "id=" + id, err);
    throw err;
  }
};

export const postApiCompile = async ({ accessToken, id, data }) => {
  try {
    const headers = {
      "x-graffiticode-storage-type": "persistent",
    };
    if (accessToken) {
      headers.authorization = accessToken;
    }
    const baseUrl = getApiUrl();
    console.log("postApiCompile request", "id=" + id, "baseUrl=" + baseUrl, "data=" + JSON.stringify(data));
    const post = bent(baseUrl, "POST", "json", headers);
    const body = { id, data };
    const resp = await post('/compile', body);
    console.log("postApiCompile response", "resp=" + JSON.stringify(resp));
    if (resp.status !== "success") {
      throw new Error(`failed to post compile ${id}: ${resp.error?.message}`);
    }
    return resp.data;
  } catch (err) {
    console.error("postApiCompile error", "id=" + id, err);
    throw err;
  }
};

export const postLangCompile = async ({ accessToken, code, data }) => {
  try {
    // Only attach the Authorization header when there is a real token. Sending
    // `authorization: null/undefined` makes bent emit the literal string
    // "null", which the lang server rejects as a failed auth (401) rather than
    // treating it as anonymous. Public tasks must compile without a token.
    const headers = accessToken ? { authorization: accessToken } : {};
    const baseUrl = getLangUrl();
    console.log("postLangCompile request", "baseUrl=" + baseUrl, "data=" + JSON.stringify(data));
    const post = bent(baseUrl, "POST", "json", headers);
    const body = { code, data };
    const resp = await post('/compile', body);
    console.log("postLangCompile response", "resp=" + JSON.stringify(resp));
    return resp;
  } catch (err) {
    console.error("postLangCompile error", err);
    throw err;
  }
};

// export const postCompile = async ({ id, data }) => {
//   const query = gql`
//     mutation (id: String!, data: String!) {
//       compile(id: $id, data: $data)
//     }
//   `;
//   // const token = await user.getToken();
//   const client = new GraphQLClient("/api", {
//     headers: {
//       // authorization: token,
//     }
//   });
//   return client.request(query, { id, daa }).then(data => data.compile);
// };

