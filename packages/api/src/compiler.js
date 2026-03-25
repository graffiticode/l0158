// SPDX-License-Identifier: MIT
import { buildDataApi } from "./dataapi.js";
import { buildCreateItems, buildInitItems } from "./items.js";
import { buildCreateQuestions, buildInitQuestions } from "./questions.js";
import { buildInitAuthor, buildCreateAuthor } from "./author.js";

/* Copyright (c) 2023, ARTCOMPILER INC */
import {
  Checker as BasisChecker,
  Transformer as BasisTransformer,
  Compiler as BasisCompiler
} from '@graffiticode/basis';

function toPlainObject(val) {
  if (val !== null && typeof val === 'object' && val._type === 'record' && val._entries instanceof Map) {
    const obj = {};
    for (const [k, v] of val._entries) {
      const name = k.replace(/^(tag|str|num):/, '');
      obj[name] = toPlainObject(v);
    }
    return obj;
  }
  if (Array.isArray(val)) {
    return val.map(toPlainObject);
  }
  return val;
}

import LearnositySDK from "learnosity-sdk-nodejs";
const sdk = new LearnositySDK();
const key = process.env.LEARNOSITY_KEY;
const secret = process.env.LEARNOSITY_SECRET;
const domain = process.env.NODE_ENV === "production" ? "l0158.graffiticode.org" : "localhost";
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
      const err = [];
      const val = node;
      resume(err, val);
    });
  }

  QUESTIONS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [];
      const val = node;
      resume(err, val);
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
      const plain = toPlainObject(v0);
      console.log(
        "INIT()",
        "plain=" + JSON.stringify(plain, null, 2),
      );
      const err = [];
      const { type } = plain;
      let val;
      switch (type) {
      case "questions":
        val = await initQuestions(plain);
        break;
      case "items":
        val = await initItems(plain);
        break;
      case "author":
        val = await initAuthor(plain);
        break;
      }
      resume(err, val);
    });
  }

  ITEMS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const plain = toPlainObject(v0);
      console.log(
        "ITEMS()",
        "v0 type=" + typeof v0,
        "isArray=" + Array.isArray(v0),
        "plain=" + JSON.stringify(plain, null, 2),
      );
      const err = [];
      const val = await createItems({items: [plain]});
      resume(err, val);
    });
  }

  QUESTIONS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const plain = toPlainObject(v0);
      console.log(
        "QUESTIONS()",
        "v0 type=" + typeof v0,
        "isArray=" + Array.isArray(v0),
        "plain=" + JSON.stringify(plain, null, 2),
      );
      const err = [];
      const val = await createQuestions(plain);
      resume(err, val);
    });
  }

  AUTHOR(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const plain = toPlainObject(v0);
      const err = [];
      console.log(
        "AUTHOR",
        "plain=" + JSON.stringify(plain, null, 2),
      );
      const val = await createAuthor(plain);
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
