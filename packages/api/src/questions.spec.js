// SPDX-License-Identifier: MIT
import { jest } from "@jest/globals";
import { buildCreateQuestions } from "./questions.js";

describe("buildCreateQuestions preview vs save", () => {
  const fakeSdk = {
    init: jest.fn((kind, consumer, secret, payload) => ({ signed: true, payload })),
  };
  const makeQuestions = () => [{
    type: "mcq",
    stimulus: "2 + 2?",
    options: ["3", "4", "5"],
    validation: { valid_response: { value: ["1"] } },
  }];

  beforeEach(() => {
    fakeSdk.init.mockClear();
  });

  it("preview mode (default): skips dataApi but still returns questions payload", async () => {
    const dataApi = jest.fn();
    const createQuestions = buildCreateQuestions({
      sdk: fakeSdk, key: "k", secret: "s", domain: "localhost", dataApi,
    });
    const result = await createQuestions(makeQuestions(), { id: "test" });
    expect(dataApi).not.toHaveBeenCalled();
    expect(result.type).toBe("questions");
    expect(result.data.questions).toHaveLength(1);
    expect(result.questionRefs).toEqual(["artcompiler-mcq-test-0"]);
  });

  it("save mode: POSTs to /itembank/questions", async () => {
    const dataApi = jest.fn().mockResolvedValue({ meta: { status: true } });
    const createQuestions = buildCreateQuestions({
      sdk: fakeSdk, key: "k", secret: "s", domain: "localhost", dataApi,
    });
    await createQuestions(makeQuestions(), { id: "test", saveToItembank: true });
    expect(dataApi).toHaveBeenCalledTimes(1);
    const [callArg] = dataApi.mock.calls[0];
    expect(callArg.route).toBe("/itembank/questions");
  });
});
