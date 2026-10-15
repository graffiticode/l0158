// SPDX-License-Identifier: MIT
import { createItems } from "./items.js";
import { createQuestions } from "./questions.js";
import {
  AUTHOR_ERROR,
  CREDENTIAL_ERROR,
  SAVE_ERROR,
  normalizeActivity,
} from "./activity.js";
import { questionTypeBuilders, attributeFields, metadataMembers } from "./question-types.js";

/* Copyright (c) 2023, ARTCOMPILER INC */
import {
  Checker as BasisChecker,
  Transformer as BasisTransformer,
  Compiler as BasisCompiler
} from '@graffiticode/basis';

// L0158 holds no Learnosity credential and signs nothing. `items` and
// `questions` compile to one unsigned, render-ready activity (activity.js),
// which L0176 signs at render time through Broker. Item-bank saves and the
// Author API are gone: saves go through L0176, Author integrations are planned
// with L0177.

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

// A program that still supplies its own consumer key or secret (`set-var
// "learnosity-key" ...` / `set-var "learnosity-secret" ...`, which basis
// writes into `options`) used a feature that's gone. It's a compile error
// rather than silently ignored.
const usesCredentials = (options) => (
  Object.prototype.hasOwnProperty.call(options, "learnosity-key") ||
  Object.prototype.hasOwnProperty.call(options, "learnosity-secret")
);

const toList = (plain) => {
  if (Array.isArray(plain)) {
    return plain;
  }
  if (plain && typeof plain === "object" && plain.list != null) {
    return Array.isArray(plain.list) ? plain.list : [plain.list];
  }
  return [plain];
};

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

  // `init <activity>` normalizes a questions or items activity to the
  // render-ready contract and returns it unsigned (L0176 signs it). An Author
  // activity is the same error as `author`.
  INIT(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [].concat(e0 || []);
      if (err.length > 0) {
        resume(err, undefined);
        return;
      }
      const { activity, errors } = normalizeActivity(toPlainObject(v0));
      if (errors) {
        resume(errors, undefined);
        return;
      }
      resume([], activity);
    });
  }

  // `learnosity <value>` is a pass-through wrapper: it returns its argument
  // unchanged and carries no credential or configuration.
  LEARNOSITY(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const plain = toPlainObject(v0);
      const err = [].concat(e0 || []);
      const val = plain;
      resume(err, val);
    });
  }

  ITEMS(node, options, resume) {
    // Visit the continuation (elts[1]) first, so a `save-to-itembank true`
    // chained after items reports its error ahead of the items themselves.
    this.visit(node.elts[1], options, async (e1) => {
      this.visit(node.elts[0], options, async (e0, v0) => {
        const err = [].concat(e0 || [], e1 || []);
        const items = toList(toPlainObject(v0));
        if (!options["lrn-id"]) {
          resume([...err, `Error: set-var "lrn-id" must be set to a non-empty string before items is called.`], undefined);
          return;
        }
        // If any child errored (e.g. a builder threw validation), bail before
        // createItems — the items/questions arrays contain `undefined` for the
        // failed entry.
        if (err.length > 0) {
          resume(err, undefined);
          return;
        }
        resume(err, createItems({ items, id: options["lrn-id"] }));
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
    // Same continuation-first ordering as ITEMS.
    this.visit(node.elts[1], options, async (e1, v1) => {
      this.visit(node.elts[0], options, async (e0, v0) => {
        const err = [].concat(e0 || [], e1 || []);
        const questions = toList(toPlainObject(v0));
        if (!options["lrn-id"]) {
          resume(err, {});
          return;
        }
        // If any child errored (e.g. a question builder threw validation),
        // bail before createQuestions — the questions array contains
        // `undefined` for the failed entry.
        if (err.length > 0) {
          resume(err, {});
          return;
        }
        // The output is exactly the activity; of the continuation only a
        // hardwired `params` table is used.
        const continuation = toPlainObject(v1);
        resume(err, createQuestions(questions, {
          id: options["lrn-id"],
          params: continuation?.params,
        }));
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

  // Author is gone. The keyword stays in the lexicon so stored `author`
  // programs still parse and get this compile error, not a parse error.
  AUTHOR(node, options, resume) {
    resume([AUTHOR_ERROR], undefined);
  }

  PROG(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      if (usesCredentials(options)) {
        resume([...(e0 || []), CREDENTIAL_ERROR], undefined);
        return;
      }
      const err = e0;
      const val = v0.pop();
      resume(err, val);
    });
  }
}

// Generate Transformer methods for question types (arity 1). Wrap the
// builder call so validating builders (e.g. bowtie) can throw with a
// human-readable message and have it surface via the standard error list
// instead of becoming an unhandled rejection.
for (const [name, builder] of Object.entries(questionTypeBuilders)) {
  Transformer.prototype[name] = function(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      // Propagate descendant errors (e.g. basis DATA's schema-validation
      // failures) instead of silently dropping them and emitting a null
      // value for the affected attribute.
      if (e0 && e0.length > 0) {
        resume(e0, null);
        return;
      }
      const attrs = toPlainObject(v0);
      try {
        resume([], builder(attrs));
      } catch (e) {
        resume([String(e && e.message || e)], undefined);
      }
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
// so child transformers (ITEMS, QUESTIONS) can read it.
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

// save-to-itembank used to write the item to the Learnosity item bank. L0158
// no longer saves (L0176 does), so `save-to-itembank true` is a compile error.
// `save-to-itembank false` asked for nothing and stays a no-op. The keyword
// stays in the lexicon so stored programs parse.
Transformer.prototype.SAVE_TO_ITEMBANK = function(node, options, resume) {
  this.visit(node.elts[0], options, async (e0, v0) => {
    this.visit(node.elts[1], options, async (e1, v1) => {
      const err = [].concat(e0 || [], e1 || []);
      if (v0 === true) {
        resume([...err, SAVE_ERROR], undefined);
        return;
      }
      resume(err, toPlainObject(v1));
    });
  });
};

export const compiler = new BasisCompiler({
  langID: '0158',
  version: 'v0.0.1',
  Checker: Checker,
  Transformer: Transformer,
});
