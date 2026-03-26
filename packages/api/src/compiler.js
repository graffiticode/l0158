// SPDX-License-Identifier: MIT
import { buildDataApi } from "./dataapi.js";
import { buildCreateItems, buildInitItems } from "./items.js";
import { buildCreateQuestions, buildInitQuestions } from "./questions.js";
import { buildInitAuthor, buildCreateAuthor } from "./author.js";
import { questionTypeBuilders, attributeFields, validAttributes } from "./question-types.js";

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
const baseUrl = 'https://data.learnosity.com/v2025.2.LTS';
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
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [].concat(e0 || [], e1 || []);
        const val = node;
        resume(err, val);
      });
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

function checkValueType(value, expectedType, name) {
  if (expectedType === "any") return null;
  if (expectedType === "string" && typeof value !== "string") {
    return `E_ARG_TYPE: ${name} expects a string`;
  }
  if (expectedType === "number" && typeof value !== "number") {
    return `E_ARG_TYPE: ${name} expects a number`;
  }
  if (expectedType === "boolean" && typeof value !== "boolean") {
    return `E_ARG_TYPE: ${name} expects a boolean`;
  }
  if (expectedType === "array" && !Array.isArray(value)) {
    return `E_ARG_TYPE: ${name} expects an array`;
  }
  return null;
}

// Generate Checker methods for question types (arity 1)
for (const name of Object.keys(questionTypeBuilders)) {
  Checker.prototype[name] = function(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [].concat(e0 || []);
      // Validate that only valid attributes are present
      const allowed = validAttributes[name];
      if (allowed && v0 && typeof v0 === "object") {
        const plain = toPlainObject(v0);
        if (plain && typeof plain === "object") {
          for (const key of Object.keys(plain)) {
            if (!allowed.includes(key)) {
              err.push(`E_INVALID_ATTR: '${key}' is not a valid attribute for ${name}`);
            }
          }
        }
      }
      const val = node;
      resume(err, val);
    });
  };
}

// Generate Checker methods for attributes (arity 2)
for (const [name, meta] of Object.entries(attributeFields)) {
  Checker.prototype[name] = function(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [].concat(e0 || [], e1 || []);
        // Validate value type
        const typeErr = checkValueType(v0, meta.valueType, name);
        if (typeErr) {
          err.push(typeErr);
        }
        // Validate allowed values (enum)
        if (meta.allowed && typeof v0 === "string" && !meta.allowed.includes(v0)) {
          err.push(`E_INVALID_VALUE: '${v0}' is not valid for ${name}. Expected one of: ${meta.allowed.join(", ")}`);
        }
        const val = node;
        resume(err, val);
      });
    });
  };
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
      this.visit(node.elts[1], options, async (e1, v1) => {
        const plain0 = toPlainObject(v0);
        const plain1 = toPlainObject(v1);
        console.log(
          "ITEMS()",
          "plain0=" + JSON.stringify(plain0, null, 2),
          "plain1=" + JSON.stringify(plain1, null, 2),
        );
        const err = [].concat(e0 || [], e1 || []);
        const val = await createItems({items: [{ ...plain1, ...plain0 }]});
        resume(err, val);
      });
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

// Generate Transformer methods for question types (arity 1)
for (const [name, builder] of Object.entries(questionTypeBuilders)) {
  Transformer.prototype[name] = function(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [];
      const attrs = toPlainObject(v0);
      const val = builder(attrs);
      resume(err, val);
    });
  };
}

// Generate Transformer methods for attributes (arity 2)
for (const [name, meta] of Object.entries(attributeFields)) {
  Transformer.prototype[name] = function(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [].concat(e0 || [], e1 || []);
        const continuation = toPlainObject(v1);
        const val = { ...continuation, [meta.field]: v0 };
        resume(err, val);
      });
    });
  };
}

export const compiler = new BasisCompiler({
  langID: '0158',
  version: 'v0.0.1',
  Checker: Checker,
  Transformer: Transformer,
});
