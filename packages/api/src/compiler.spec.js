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

  test("items [item questions [mcq {}] {}] compiles", async () => {
    const result = await compile('items [item questions [mcq {}] {}]..');
    expect(result).toBeDefined();
    expect(result.type).toBe("items");
  });

  test("mcq with chained attributes compiles", async () => {
    const result = await compile('mcq stimulus "What is the capital of France?" options ["Paris", "London", "Berlin", "Madrid"] valid-response [0] {}..');
    expect(result.type).toBe("mcq");
    expect(result.stimulus).toBe("What is the capital of France?");
    expect(result.options).toHaveLength(4);
    expect(result.validation.valid_response.value).toEqual(["0"]);
  }, 10000);

  test("mcq with question-level metadata translates field names", async () => {
    const src = `mcq
      stimulus "Which organelle produces ATP?"
      options ["mitochondria" "nucleus" "ribosome" "cell membrane"]
      valid-response [0]
      metadata [
        distractor-rationale ["Correct." "That's the DNA organelle." "That's where proteins are built." "That's the boundary layer."]
        notes "Targets organelle confusions."
        acknowledgements "Adapted from Smith 2019."
      ]
      {}..`;
    const result = await compile(src);
    expect(result.type).toBe("mcq");
    expect(result.metadata).toEqual({
      distractor_rationale_response_level: [
        "Correct.",
        "That's the DNA organelle.",
        "That's where proteins are built.",
        "That's the boundary layer.",
      ],
      note: "Targets organelle confusions.",
      acknowledgements: "Adapted from Smith 2019.",
    });
  }, 10000);

  test("item-level metadata compiles to a list of tagged entries", async () => {
    const src = `item
      metadata [
        tags { NGSS: ["MS-LS1-2"], "Common Core": "Math:6.NS.A.1" }
        difficulty "medium"
        dok 2
        notes "Organelle set variant A."
      ]
      {}..`;
    const result = await compile(src);
    expect(result.metadata).toEqual([
      { kind: "tags", value: { NGSS: ["MS-LS1-2"], "Common Core": "Math:6.NS.A.1" } },
      { kind: "difficulty", value: "medium" },
      { kind: "dok", value: 2 },
      { kind: "notes", value: "Organelle set variant A." },
    ]);
  }, 10000);
});
