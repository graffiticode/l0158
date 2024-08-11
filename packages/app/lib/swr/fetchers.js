import { postApiCompile, getApiData } from "../lib/api";

export const compile = async ({ accessToken, id, data }) => {
  try {
    const index = Object.keys(data).length > 0 && 1 || 2; // Empty data so use full id.
    id = id.split("+").slice(0, index).join("+");  // Re-compile state with code id.
    return await postApiCompile({ accessToken, id, data });
  } catch (x) {
    console.log("./swr/fetchers/compile()");
    console.log(x.stack);
  }
};

export const getData = async ({ accessToken, id }) => {
  try {
    return await getApiData({accessToken, id});
  } catch (err) {
    throw err;
  }
};

const code = {
  "1": {
    "elts": [
      "init"
    ],
    "tag": "IDENT"
  },
  "2": {
    "elts": [
      "data"
    ],
    "tag": "IDENT"
  },
  "3": {
    "elts": [],
    "tag": "RECORD"
  },
  "4": {
    "elts": [
      1,
      2,
      3
    ],
    "tag": "EXPRS"
  },
  "5": {
    "elts": [
      "RECORD"
    ],
    "tag": "IDENT"
  },
  "6": {
    "elts": [
      3
    ],
    "tag": "DATA"
  },
  "7": {
    "elts": [
      "DATA"
    ],
    "tag": "IDENT"
  },
  "8": {
    "elts": [
      6
    ],
    "tag": "INIT"
  },
  "9": {
    "elts": [
      "INIT"
    ],
    "tag": "IDENT"
  },
  "10": {
    "elts": [
      8
    ],
    "tag": "EXPRS"
  },
  "11": {
    "elts": [
      10
    ],
    "tag": "PROG"
  },
  "root": 11
};

export const initRequest = async ({ accessToken, data }) => {
  console.log("initRequest() data=" + JSON.stringify(data, null, 2));
  try {
    return await getLangCompile({accessToken, code, data});
  } catch (err) {
    throw err;
  }
};
