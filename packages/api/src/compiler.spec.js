// SPDX-License-Identifier: MIT
import { parser } from "@graffiticode/parser";
import {
  Compiler,
  Renderer,
  lexicon as basisLexicon
} from "@graffiticode/basis";
import { Checker, Transformer } from "./compiler.js";
import { lexicon as l0158Lexicon } from "./lexicon.js";

const lexicon = { ...basisLexicon, ...l0158Lexicon };

function compile(src, data = {}) {
  return new Promise(async (resolve, reject) => {
    const code = await parser.parse(158, src, lexicon);
    const compiler = new Compiler({
      langID: "0158",
      version: "v0.0.0",
      Checker,
      Transformer,
      Renderer,
    });
    compiler.compile(code, data, {}, (err, val) => {
      if (err && err.length > 0) {
        reject(err);
      } else {
        resolve(val);
      }
    });
  });
}

describe("compiler", () => {
  test("hello compiles a greeting", async () => {
    const result = await compile('hello "world"..');
    expect(result).toBe("world");
  });

  test("mcq with empty record produces question json", async () => {
    const result = await compile('mcq {}..');
    expect(result.type).toBe("mcq");
    expect(result.stimulus).toBeDefined();
  });

  test("items questions [mcq {}] compiles", async () => {
    const result = await compile('items questions [mcq {}] {v:2}..');
    console.log("items result:", JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
  });
});
