import LearnositySDK from "learnosity-sdk-nodejs";
import { v4 as uuid } from "uuid";
import { buildDataApi } from "./dataapi.js";

const learnositySDK = new LearnositySDK();
const LEARNOSITY_KEY = process.env.LEARNOSITY_KEY;
const LEARNOSITY_SECRET = process.env.LEARNOSITY_SECRET;

/* Copyright (c) 2023, ARTCOMPILER INC */
import {
  Checker as BasisChecker,
  Transformer as BasisTransformer,
  Compiler as BasisCompiler
} from '@graffiticode/basis';

const baseUrl = 'https://data.learnosity.com/v2024.1.LTS';

const getActivities = async () => {
  const dataApi = buildDataApi({baseUrl});
  const user_id = uuid();    // Generate a UUID for the user ID
  const session_id = uuid(); // Generate a UUID for the session ID
  const domain = 'localhost';   // Set the domain
  console.log("getActivities() LEARNOSITY_KEY=" + LEARNOSITY_KEY);
  console.log("getActivities() LEARNOSITY_SECRET=" + LEARNOSITY_SECRET);
  const initResp = learnositySDK.init(  // Set Learnosity init options
    'data', // Select Data API
    {
      consumer_key: LEARNOSITY_KEY,
      domain: 'localhost',
    },
    LEARNOSITY_SECRET,
    {
      // types: [
      //   "mcq"
      // ],
      item_references: [
        "ARTC_770138d1-e3f9-4227-8f40-2599f13356db",
      ],
    },
    "get",
  );
  const endpoint = baseUrl + "/itembank/questions";
  const data = await dataApi({
    route: "/itembank/questions",
    data: initResp,
  });
  console.log("getActivities() data=" + JSON.stringify(data, null, 2));
  return data;
}

export class Checker extends BasisChecker {
  HELLO(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [];
      const val = node;
      resume(err, val);
    });
  }
}

export class Transformer extends BasisTransformer {
  HELLO(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const data = options?.data || {};
      const err = [];
      const val = await getActivities();
      resume(err, val);
    });
  }

  PROG(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const data = options?.data || {};
      const err = e0;
      const val = v0.pop();
      resume(err, {
        val,
      });
    });
  }
}

export const compiler = new BasisCompiler({
  langID: '0158',
  version: 'v0.0.1',
  Checker: Checker,
  Transformer: Transformer,
});
