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

// Both the /compile response and the stored /data response use the standard
// { data, errors } envelope. Detection requires `errors` to be an array (the
// envelope always carries one, even on success), because l0158's raw compile
// val carries its own top-level `data` key (items.js returns
// { type: "questions", data: {...} }), so a `data`-only heuristic would
// misidentify a legacy stored val as an envelope. For backward compatibility,
// a payload without a top-level `errors` array is used as the data model.
function unwrapEnvelope(resp) {
  if (
    resp && typeof resp === "object" && !Array.isArray(resp) &&
    Array.isArray(resp.errors)
  ) {
    return {
      data: resp.data,
      errors: resp.errors,
    };
  }
  return { data: resp, errors: [] };
}

// Dynamic-data substitution applied at session init. Learnosity substitutes
// {{var:X}} in the standard fields it owns the schema for (stimulus, options,
// ...), but it treats custom-question `data` as opaque pass-through — that's
// confirmed by inspection: a custom question whose widget data contains
// {{var:A1}} reaches the widget unsubstituted. To give custom and built-in
// questions the same author-facing behavior, we substitute everywhere in the
// compile output ourselves before handing it to LearnosityApp.init.
//
// Each View mount picks a fresh row, so reloads re-randomize. The compile
// output (and any saved bank item) keeps the full dynamic_content_data
// table, so items rendered later via Items API still re-randomize via
// Learnosity's own substitution.
function pickRow(dcd) {
  if (!dcd || !Array.isArray(dcd.cols)) return null;
  const rowIds = Object.keys(dcd.rows || {});
  if (rowIds.length === 0) return null;
  const rowId = rowIds[Math.floor(Math.random() * rowIds.length)];
  const row = dcd.rows[rowId];
  if (!row || !Array.isArray(row.values)) return null;
  return dcd.cols.reduce((env, col, i) => {
    env[col] = row.values[i];
    return env;
  }, {});
}

function resolveVariables(val, env) {
  if (typeof val === "string") {
    let out = val;
    for (const key of Object.keys(env)) {
      const re = new RegExp(`\\{\\{var:${key}\\}\\}`, "g");
      out = out.replace(re, env[key]);
    }
    return out;
  }
  if (Array.isArray(val)) return val.map(item => resolveVariables(item, env));
  if (val !== null && typeof val === "object") {
    const acc = {};
    for (const key of Object.keys(val)) acc[key] = resolveVariables(val[key], env);
    return acc;
  }
  return val;
}

function applyDynamicData(compiled) {
  const dcd = compiled?.data?.dynamic_content_data;
  const env = pickRow(dcd);
  if (!env) return compiled;
  return resolveVariables(compiled, env);
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
  const fetchKey = doRecompile && id ? { accessToken, id } : null;
  const compileResp = useSWR(fetchKey, getData);

  if (compileResp.data) {
    setDoRecompile(false);
    const { data: compiled, errors } = unwrapEnvelope(compileResp.data);
    state.setErrors(errors);
    if (errors.length === 0 && compiled !== null && compiled !== undefined) {
      setData(applyDynamicData(compiled));
      setDoInit(true);
    }
  }
  if (compileResp.error) {
    setDoRecompile(false);
    state.setErrors([{ message: String(compileResp.error.message || compileResp.error) }]);
  }

  const initResp = useSWR(
    doInit && data && {
      accessToken,
      data,
  }, initRequest);

  useEffect(() => {
    if (initResp.data) {
      setDoInit(false);
      const { data: signed, errors } = unwrapEnvelope(initResp.data);
      state.setErrors(errors);
      if (errors.length === 0 && signed !== null && signed !== undefined) {
        state.apply({
          type: "signed",
          args: {
            type: data.type,
            request: signed,
          },
        });
      }
    }
    if (initResp.error) {
      setDoInit(false);
      state.setErrors([{ message: String(initResp.error.message || initResp.error) }]);
    }
  }, [initResp.data, initResp.error]);

  return (
    (isNonNullNonEmptyObject(state.data) || state.errors.length > 0) &&
      <Form state={state} targetOrigin={targetOrigin} /> ||
      <div />
  );
}
