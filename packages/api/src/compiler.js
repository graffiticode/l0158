import LearnositySDK from "learnosity-sdk-nodejs";
import { v4 as uuid } from "uuid";
import { buildDataApi } from "./dataapi.js";
import fetch from "node-fetch";

const learnositySDK = new LearnositySDK();
const LEARNOSITY_KEY = process.env.LEARNOSITY_KEY;
const LEARNOSITY_SECRET = process.env.LEARNOSITY_SECRET;

/* Copyright (c) 2023, ARTCOMPILER INC */
import {
  Checker as BasisChecker,
  Transformer as BasisTransformer,
  Compiler as BasisCompiler
} from '@graffiticode/basis';

const callLrn = () => {
  const user_id = uuid();    // Generate a UUID for the user ID
  const session_id = uuid(); // Generate a UUID for the session ID
  const domain = 'localhost';   // Set the domain
  const initResp = learnositySDK.init(  // Set Learnosity init options
    'items', // Select Items API
    {
      consumer_key: LEARNOSITY_KEY,
      domain: 'localhost',
      user_id: '1234567',
    },
    LEARNOSITY_SECRET,
    {
      user_id: user_id,
      activity_template_id: 'quickstart_examples_activity_template_001',
      session_id: session_id,
      activity_id: "quickstart_examples_activity_001",
      rendering_type: 'assess',
      type: 'submit_practice',
      name: "Items API Quickstart",
      state: 'initial',
      config: {
        regions: 'main'
      }
    }
  );
  console.log("callLrn() initResp=" + JSON.stringify(initResp, null, 2));
}

const baseUrl = 'https://data.learnosity.com/v2024.1.LTS';

const getActivities = async () => {
  const dataApi = buildDataApi({baseUrl, bent});
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
  const form = new URLSearchParams({
    ...initResp,
    // security: {
    //   ...initResp.security,
    //   consumer_key: LEARNOSITY_KEY,
    // },
  });
  // const form = new FormData();
  // form.append("security", initResp.security);
  // form.append("request", initResp.request);
  // form.append("action", "get");
  //  const dataApiResp = await dataApi(form);
  const endpoint = baseUrl + "/itembank/questions";
  const dataApiResp = await fetch(endpoint, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    body: form,
  });
  const data = await dataApiResp.json();
  console.log("getActivities() dataApiResp=" + JSON.stringify(dataApiResp, null, 2));
  console.log("getActivities() data=" + JSON.stringify(data, null, 2));
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
      await getActivities();
      const data = options?.data || {};
      const err = [];
      const val = {
        ...data,
        hello: data.hello !== undefined ? data.hello : v0,
      };
      resume(err, val);
    });
  }

  PROG(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const data = options?.data || {};
      const err = e0;
      const val = v0.pop();
      resume(err, {
        ...val,
        ...data,
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
