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

  LEARNOSITY(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [].concat(e0 || [], e1 || []);
        const val = node;
        resume(err, val);
      });
    });
  }

  ITEMS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [].concat(e0 || []);
      const val = node;
      resume(err, val);
    });
  }

  ITEM(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [].concat(e0 || []);
      const val = node;
      resume(err, val);
    });
  }

  QUESTIONS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [].concat(e0 || [], e1 || []);
        const val = node;
        resume(err, val);
      });
    });
  }

  FEATURES(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [].concat(e0 || [], e1 || []);
        const val = node;
        resume(err, val);
      });
    });
  }

  LAYOUT(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [].concat(e0 || [], e1 || []);
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

// Generate Checker methods for question types (arity 1)
for (const name of Object.keys(questionTypeBuilders)) {
  Checker.prototype[name] = function(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [].concat(e0 || []);
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

  LEARNOSITY(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const plain = toPlainObject(v0);
        const continuation = toPlainObject(v1);
        console.log(
          "LEARNOSITY()",
          "plain=" + JSON.stringify(plain, null, 2),
        );
        const err = [].concat(e0 || [], e1 || []);
        const val = { ...continuation, ...plain };
        resume(err, val);
      });
    });
  }

  ITEMS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const plain = toPlainObject(v0);
      console.log(
        "ITEMS()",
        "plain=" + JSON.stringify(plain, null, 2),
      );
      const err = [].concat(e0 || []);
      // Expects a list of item records
      let items;
      if (Array.isArray(plain)) {
        items = plain;
      } else if (plain && typeof plain === "object" && plain.list != null) {
        items = Array.isArray(plain.list) ? plain.list : [plain.list];
      } else {
        items = [plain];
      }
      const val = await createItems({items, id: options.id});
      resume(err, val);
    });
  }

  ITEM(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const plain = toPlainObject(v0);
      const err = [].concat(e0 || []);
      const val = plain;
      resume(err, val);
    });
  }

  QUESTIONS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const plain = toPlainObject(v0);
        console.log(
          "QUESTIONS()",
          "plain=" + JSON.stringify(plain, null, 2),
        );
        const err = [].concat(e0 || [], e1 || []);
        // Normalize to array: basis LIST node may produce {list: item} or an array
        let questions;
        if (Array.isArray(plain)) {
          questions = plain;
        } else if (plain && typeof plain === "object" && plain.list != null) {
          questions = Array.isArray(plain.list) ? plain.list : [plain.list];
        } else {
          questions = [plain];
        }
        const questionsResult = await createQuestions(questions, {id: options.id});
        const continuation = toPlainObject(v1);
        const val = { ...continuation, ...questionsResult };
        resume(err, val);
      });
    });
  }

  FEATURES(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const plain = toPlainObject(v0);
        console.log(
          "FEATURES()",
          "plain=" + JSON.stringify(plain, null, 2),
        );
        const err = [].concat(e0 || [], e1 || []);
        // Normalize to array
        let features;
        if (Array.isArray(plain)) {
          features = plain;
        } else if (plain && typeof plain === "object" && plain.list != null) {
          features = Array.isArray(plain.list) ? plain.list : [plain.list];
        } else {
          features = [plain];
        }
        const continuation = toPlainObject(v1);
        const val = { ...continuation, features };
        resume(err, val);
      });
    });
  }

  LAYOUT(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [].concat(e0 || [], e1 || []);
        const continuation = toPlainObject(v1);
        const val = { ...continuation, layout: v0 };
        resume(err, val);
      });
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
      const val = await createAuthor({...plain, id: options.id});
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

// Override ID to set options.id before visiting continuation,
// so child transformers (ITEMS, QUESTIONS, AUTHOR) can read it.
// Don't include id in the output record — it flows via options only.
Transformer.prototype.ID = function(node, options, resume) {
  this.visit(node.elts[0], options, async (e0, v0) => {
    options.id = v0;
    this.visit(node.elts[1], options, async (e1, v1) => {
      const err = [].concat(e0 || [], e1 || []);
      const val = toPlainObject(v1);
      resume(err, val);
    });
  });
};

export const compiler = new BasisCompiler({
  langID: '0158',
  version: 'v0.0.1',
  Checker: Checker,
  Transformer: Transformer,
});
