// SPDX-License-Identifier: MIT
import { Router } from "express";
import {
  buildHttpHandler,
  parseAuthTokenFromRequest,
  optionsHandler
} from "./utils.js";
// TODO Wire up auth.
const buildPostCompileHandler = ({ compile }) => {
  return buildHttpHandler(async (req, res) => {
    const auth = ""; //req.auth.context;
    const authToken = parseAuthTokenFromRequest(req);
    try {
      const data = await compile({ auth, authToken, lang: "0158", ...req.body });
      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).json(data);
    } catch (error) {
      if (error.message === 'Missing required parameters: code and data') {
        res.status(400).json({ error: error.message });
      } else {
        throw error;
      }
    }
  });
};

export default ({ compile }) => {
  const router = new Router();
  router.post("/", buildPostCompileHandler({ compile }));
  router.options("/", optionsHandler);
  return router;
};
