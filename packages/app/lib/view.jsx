// SPDX-License-Identifier: MIT
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Form } from "./components";
import { createState } from "./lib/state";
import { compile, getData, initRequest } from './swr/fetchers';
//import './index.css';

function isNonNullNonEmptyObject(obj) {
  return (
    typeof obj === "object" &&
      obj !== null &&
      Object.keys(obj).length > 0
  );
}

export const View = () => {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get("id");
  console.log("[L0158/View] mount", {
    rawId,
    search: window.location.search,
    idHasPlus: typeof rawId === "string" && rawId.indexOf("+") !== -1,
    idSegments: typeof rawId === "string" ? rawId.split("+") : null,
  });
  const [ id, setId ] = useState(rawId);
  const [ accessToken, setAccessToken ] = useState(params.get("access_token"));
  const [ targetOrigin, setTargetOrigin ] = useState(params.get("origin"));
  const [ doRecompile, setDoRecompile ] = useState(false);
  const [ doInit, setDoInit ] = useState(false);
  const [ height, setHeight ] = useState(0);
  const parsedData = JSON.parse(params.get("data")) || {};
  const [ data, setData ] = useState(parsedData);

  const initialState = isNonNullNonEmptyObject(parsedData)
    ? { type: parsedData.type, request: parsedData.request }
    : {};

  const [ state ] = useState(createState(initialState, (data, { type, args }) => {
    switch (type) {
    case "signed":
      return {
        ...data,
        ...args,
      };
    case "change":
      setDoRecompile(true);
      return {
        ...data,
        ...args,
      };
    default:
      console.error(false, `Unimplemented action type: ${type}`);
      return data;
    }
  }));

  useEffect(() => {
    // If `id` changes, then recompile.
    if (id) {
      setDoRecompile(true);
    }
  }, [id]);

  // Idempotent fetch keyed by id alone. The api server's `/data` route is
  // cached by id; subsequent identical requests hit the cache without
  // recompiling the chain. We use this in place of POST /compile (which
  // posts a state task and was causing chain-id churn driven by Learnosity
  // init responses accumulating into state.data — each fresh user_id /
  // signature was busting the cache and re-firing the chain compile, which
  // in turn racked l0166 with concurrent recompiles and produced transient
  // "Language server error:" responses).
  //
  // State changes (form interactions) are handled by the parent (gallery)
  // via its own compile() POST against the head + build-time prefix; the
  // view itself only needs the initial idempotent fetch.
  const fetchKey = doRecompile && accessToken && id ? { accessToken, id } : null;
  const compileResp = useSWR(fetchKey, getData);

  if (compileResp.data) {
    console.log("[L0158/View] compileResp", {
      id,
      hasErrors: Array.isArray(compileResp.data.errors) && compileResp.data.errors.length > 0,
      errors: compileResp.data.errors || null,
      type: compileResp.data?.type,
      keys: compileResp.data && typeof compileResp.data === "object" ? Object.keys(compileResp.data) : null,
    });
    setDoRecompile(false);
    if (Array.isArray(compileResp.data.errors) && compileResp.data.errors.length > 0) {
      state.apply({ type: "signed", args: compileResp.data });
    } else {
      setData(compileResp.data);
      setDoInit(true);
    }
  }
  if (compileResp.error) {
    console.error("[L0158/View] compileResp.error", { id, error: compileResp.error });
  }

  const initResp = useSWR(
    doInit && data && {
      accessToken,
      data,
  }, initRequest);

  useEffect(() => {
    if (initResp.data) {
      console.log("[L0158/View] initResp", {
        id,
        hasErrors: Array.isArray(initResp.data.errors) && initResp.data.errors.length > 0,
        errors: initResp.data.errors || null,
        keys: typeof initResp.data === "object" ? Object.keys(initResp.data) : null,
      });
      setDoInit(false);
      state.apply({
        type: "signed",
        args: {
          type: data.type,
          request: initResp.data,
        },
      });
    }
    if (initResp.error) {
      console.error("[L0158/View] initResp.error", { id, error: initResp.error });
    }
  }, [initResp.data, initResp.error]);

  return (
    isNonNullNonEmptyObject(state.data) &&
      <Form state={state} targetOrigin={targetOrigin} /> ||
      <div />
  );
}
