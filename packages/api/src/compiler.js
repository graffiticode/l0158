import { buildDataApi } from "./dataapi.js";
import { buildCreateItems, buildInitItems } from "./items.js";
import { buildCreateQuestions, buildInitQuestions } from "./questions.js";
import { buildInitAuthor, buildCreateAuthor } from "./author.js";

console.log("process.env=" + JSON.stringify(process.env, null, 2));
/* Copyright (c) 2023, ARTCOMPILER INC */
import {
  Checker as BasisChecker,
  Transformer as BasisTransformer,
  Compiler as BasisCompiler
} from '@graffiticode/basis';

import LearnositySDK from "learnosity-sdk-nodejs";
const sdk = new LearnositySDK();
const key = process.env.LEARNOSITY_KEY;
const secret = process.env.LEARNOSITY_SECRET;
const domain = process.env.AUTH_URL && "localhost" || "l0158.graffiticode.org";
const baseUrl = 'https://data.learnosity.com/v2024.1.LTS';
const dataApi = buildDataApi({baseUrl, domain});
const createItems = buildCreateItems({sdk, key, secret, domain, dataApi});
const initItems = buildInitItems({sdk, key, secret, domain});
const createQuestions = buildCreateQuestions({sdk, key, secret, domain, dataApi});
const initQuestions = buildInitQuestions({sdk, key, secret, domain});
const initAuthor = buildInitAuthor({sdk, key, secret, domain});
const createAuthor = buildCreateAuthor({sdk, key, secret, domain, dataApi});

export class Checker extends BasisChecker {
  HELLO(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [];
      const val = node;
      resume(err, val);
    });
  }

  ITEMS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[0], options, async (e0, v0) => {
        const err = [];
        const val = node;
        resume(err, val);
      });
    });
  }

  QUESTIONS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[0], options, async (e0, v0) => {
        const err = [];
        const val = node;
        resume(err, val);
      });
    });
  }

  AUTHOR(node, options, resume) {
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
      const val = v0;
      resume(err, val);
    });
  }

  INIT(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      console.log(
        "INIT()",
        "v0=" + JSON.stringify(v0, null, 2),
      );
      const data = options?.data || {};
      const err = [];
      const { type } = v0;
      let val;
      switch (type) {
      case "questions":
        val = await initQuestions(v0);
        break;
      case "items":
        val = await initItems(v0);
        break;
      case "author":
        val = await initAuthor(v0);
        break;
      }
      resume(err, val);
    });
  }

  ITEMS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const data = options?.data || {};
      const err = [];
      const val = await createItems({items: [v0]});
      resume(err, val);
    });
  }

  QUESTIONS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const data = options?.data || {};
      const err = [];
      const val = await createQuestions(v0);
      resume(err, val);
    });
  }

  AUTHOR(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const data = options?.data || {};
      const err = [];
      console.log(
        "AUTHOR",
        "v0=" + JSON.stringify(v0, null, 2),
      );
      const val = await createAuthor(v0);
      resume(err, val);
    });
  }

  HELLO(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const data = options?.data || {};
      const err = [];
      const val = await items({
      });
      resume(err, val);
    });
  }

  PROG(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const data = options?.data || {};
      const err = e0;
      const val = v0.pop();
      resume(err, val);
    });
  }
}

export const compiler = new BasisCompiler({
  langID: '0158',
  version: 'v0.0.1',
  Checker: Checker,
  Transformer: Transformer,
});
