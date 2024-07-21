import LearnositySDK from "learnosity-sdk-nodejs";
import { buildDataApi } from "./dataapi.js";
import { buildItemsApi } from "./items.js";
import { buildQuestionsApi } from "./questions.js";

const sdk = new LearnositySDK();
const key = process.env.LEARNOSITY_KEY;
const secret = process.env.LEARNOSITY_SECRET;
const domain = process.env.AUTH_URL && "localhost" || "graffiticode.org";
/* Copyright (c) 2023, ARTCOMPILER INC */
import {
  Checker as BasisChecker,
  Transformer as BasisTransformer,
  Compiler as BasisCompiler
} from '@graffiticode/basis';

const baseUrl = 'https://data.learnosity.com/v2024.1.LTS';
const dataApi = buildDataApi({baseUrl, domain});
const items = buildItemsApi({sdk, key, secret, domain, dataApi});
const questions = buildQuestionsApi({sdk, key, secret, domain, dataApi});

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
}

export class Transformer extends BasisTransformer {
  HELLO(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const data = options?.data || {};
      const err = [];
      const val = await items({});
      resume(err, val);
    });
  }

  ITEMS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const data = options?.data || {};
        const err = [];
        const val = await items({
          ...v0,
          ...v1,
          ...data,
        });
        resume(err, val);
      });
    });
  }

  QUESTIONS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const data = options?.data || {};
        const err = [];
        const val = await questions({
          ...v0,
          ...v1,
          ...data,
        });
        resume(err, val);
      });
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
