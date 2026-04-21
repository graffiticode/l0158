// SPDX-License-Identifier: MIT
import { buildDataApi } from "./dataapi.js";
import { buildCreateItems, buildInitItems } from "./items.js";
import { buildCreateQuestions, buildInitQuestions } from "./questions.js";
import { buildInitAuthor, buildCreateAuthor } from "./author.js";
import { questionTypeBuilders, attributeFields, metadataMembers, validAttributes } from "./question-types.js";

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
      const err = [].concat(e0 || []);
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

  SAVE_TO_ITEMBANK(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [].concat(e0 || [], e1 || []);
        const val = node;
        resume(err, val);
      });
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

// Generate Checker methods for metadata member constructors (arity 1).
// Value-shape validation happens in the translators — the Checker just
// walks the child expression.
for (const name of Object.keys(metadataMembers)) {
  Checker.prototype[name] = function(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [].concat(e0 || []);
      const val = node;
      resume(err, val);
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
      const plain = toPlainObject(v0);
      const err = [].concat(e0 || []);
      const val = plain;
      resume(err, val);
    });
  }

  ITEMS(node, options, resume) {
    // Visit the continuation (elts[1]) BEFORE the items list (elts[0]) so
    // that save-to-itembank chained after items sets `options` before the
    // QUESTIONS transformers inside the items list run and read it.
    this.visit(node.elts[1], options, async (e1, v1) => {
      this.visit(node.elts[0], options, async (e0, v0) => {
        const plain = toPlainObject(v0);
        const err = [].concat(e0 || [], e1 || []);
        // Expects a list of item records
        let items;
        if (Array.isArray(plain)) {
          items = plain;
        } else if (plain && typeof plain === "object" && plain.list != null) {
          items = Array.isArray(plain.list) ? plain.list : [plain.list];
        } else {
          items = [plain];
        }
        if (!options["lrn-id"]) {
          resume([...err, `Error: set-var "lrn-id" must be set to a non-empty string before items is called.`], undefined);
          return;
        }
        const saveToItembank = options["save-to-itembank"] === true;
        const itemsResult = await createItems({
          items,
          id: options["lrn-id"],
          saveToItembank,
        });
        const continuation = toPlainObject(v1);
        const val = { ...continuation, ...itemsResult };
        resume(err, val);
      });
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
    // Same continuation-first ordering as ITEMS, so save-to-itembank chained
    // on top-level `questions [...] save-to-itembank true {}` is honored.
    this.visit(node.elts[1], options, async (e1, v1) => {
      this.visit(node.elts[0], options, async (e0, v0) => {
        const plain = toPlainObject(v0);
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
        if (!options["lrn-id"]) {
          resume(err, {});
          return;
        }
        const saveToItembank = options["save-to-itembank"] === true;
        const questionsResult = await createQuestions(questions, {
          id: options["lrn-id"],
          saveToItembank,
        });
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
      if (!options["lrn-id"]) {
        resume([`Error: set-var "lrn-id" must be set to a non-empty string before author is called.`], undefined);
        return;
      }
      const val = await createAuthor({...plain, id: options["lrn-id"]});
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
        let fieldValue = toPlainObject(v0);
        // METADATA's value is a list of tagged-entry records ({kind, value}).
        // basis LIST nodes surface as {list: x} or a raw array — normalize.
        if (name === "METADATA") {
          if (Array.isArray(fieldValue)) {
            // already a list
          } else if (fieldValue && typeof fieldValue === "object" && fieldValue.list != null) {
            fieldValue = Array.isArray(fieldValue.list) ? fieldValue.list : [fieldValue.list];
          } else if (fieldValue != null) {
            fieldValue = [fieldValue];
          } else {
            fieldValue = [];
          }
        }
        const val = { ...continuation, [meta.field]: fieldValue };
        resume(err, val);
      });
    });
  };
}

// Generate Transformer methods for metadata member constructors (arity 1).
// Each returns a tagged-entry record that appears inside the metadata list.
for (const [name, meta] of Object.entries(metadataMembers)) {
  Transformer.prototype[name] = function(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [].concat(e0 || []);
      const val = { kind: meta.kind, value: toPlainObject(v0) };
      resume(err, val);
    });
  };
}

// Override ID to set options["lrn-id"] before visiting continuation,
// so child transformers (ITEMS, QUESTIONS, AUTHOR) can read it.
// Don't include id in the output record — it flows via options only.
Transformer.prototype.ID = function(node, options, resume) {
  this.visit(node.elts[0], options, async (e0, v0) => {
    options["lrn-id"] = v0;
    this.visit(node.elts[1], options, async (e1, v1) => {
      const err = [].concat(e0 || [], e1 || []);
      const val = toPlainObject(v1);
      resume(err, val);
    });
  });
};

// save-to-itembank is a control-flow attribute: it doesn't emit an output
// field, it mutates `options` so the enclosing ITEMS transformer sees the
// flag when it runs. Placement in the chain is flexible because ITEMS
// visits its continuation first.
Transformer.prototype.SAVE_TO_ITEMBANK = function(node, options, resume) {
  this.visit(node.elts[0], options, async (e0, v0) => {
    options["save-to-itembank"] = v0 === true;
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
