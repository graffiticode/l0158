// SPDX-License-Identifier: MIT
// End-to-end compiler tests for the save-to-itembank path.
// The Learnosity Data API is mocked at the module level so the compiler can
// exercise the branch that POSTs item/question records without needing real
// credentials or network access.
import { jest } from "@jest/globals";

const dataApiCalls = [];
const dataApiMock = jest.fn(async ({ route, request }) => {
  dataApiCalls.push({ route, request });
  return { meta: { status: true } };
});

jest.unstable_mockModule("./dataapi.js", () => ({
  buildDataApi: () => dataApiMock,
}));

const { parser } = await import("@graffiticode/parser");
const { Compiler, Renderer, lexicon: basisLexicon } = await import("@graffiticode/basis");
const { Checker, Transformer } = await import("./compiler.js");
const { lexicon: l0158Lexicon } = await import("./lexicon.js");

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

describe("compiler save-to-itembank paths", () => {
  beforeEach(() => {
    dataApiMock.mockClear();
    dataApiCalls.length = 0;
  });

  test("preview (default) writes nothing to the item bank", async () => {
    await compile('id "test-a" items [item questions [mcq {}] {}] {}..');
    expect(dataApiMock).not.toHaveBeenCalled();
  });

  test("save-to-itembank true POSTs questions AND items with status unpublished, returns Questions API payload", async () => {
    const result = await compile(
      'id "test-b" items [item questions [mcq {}] {}] save-to-itembank true {}..'
    );
    // Rendering always goes through Questions API; the save side effect is
    // the dataApi POSTs below.
    expect(result.type).toBe("questions");

    const routes = dataApiCalls.map(c => c.route);
    expect(routes).toEqual(["/itembank/questions", "/itembank/items"]);

    const itemsCall = dataApiCalls.find(c => c.route === "/itembank/items");
    // The Learnosity SDK signs its payload; the `request` field here is the
    // URL-form-encoded signed payload. Parse it back so we can assert on the
    // item record that was submitted.
    const itemsPayload = JSON.parse(itemsCall.request.request);
    expect(itemsPayload.items[0].status).toBe("unpublished");
    expect(itemsPayload.items[0].reference).toBe("graffiticode-test-b");
  });

});
