// SPDX-License-Identifier: MIT
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Form } from "./components";
import { createState } from "./lib/state";
import { getData } from './swr/fetchers';
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
  const parsedData = JSON.parse(params.get("data")) || {};

  const initialState = isNonNullNonEmptyObject(parsedData)
    ? { type: parsedData.type, request: parsedData.request }
    : {};

  const [ state ] = useState(createState(initialState, (data, { type, args }) => {
    switch (type) {
    case "compiled":
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

  // L0158 holds no Learnosity credential: its compile output is an unsigned
  // activity, which L0176 signs and renders (the api sends L0158 items to
  // L0176's form after the cutover). This View can't sign it, so it records
  // the activity's type with no `request`, and the Form shows "Preview
  // unavailable" instead of initializing Learnosity.
  if (compileResp.data) {
    setDoRecompile(false);
    const { data: compiled, errors } = unwrapEnvelope(compileResp.data);
    state.setErrors(errors);
    if (errors.length === 0 && compiled !== null && compiled !== undefined) {
      state.apply({
        type: "compiled",
        args: {
          type: compiled?.type,
          request: undefined,
        },
      });
    }
  }
  if (compileResp.error) {
    setDoRecompile(false);
    state.setErrors([{ message: String(compileResp.error.message || compileResp.error) }]);
  }

  // When embedded (e.g. the MCP/ChatGPT inline widget iframe), report our actual
  // content height to the parent so it can size the iframe to the form instead
  // of a fixed guess (which left a large gap below short items). Learnosity
  // renders/relayouts asynchronously, so a ResizeObserver keeps the height live.
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;
    const postHeight = () => {
      const h = document.body.scrollHeight;
      if (h > 0) {
        // Post to "*": the embedding widget iframe is often a sandboxed/opaque
        // origin, so a specific targetOrigin would get the message dropped. The
        // parent validates event.source, and height is non-sensitive.
        window.parent.postMessage({ type: "resize", height: h }, "*");
      }
    };
    const ro = new ResizeObserver(postHeight);
    ro.observe(document.body);
    postHeight();
    return () => ro.disconnect();
  }, [targetOrigin]);

  return (
    (isNonNullNonEmptyObject(state.data) || state.errors.length > 0) &&
      <Form state={state} targetOrigin={targetOrigin} /> ||
      <div />
  );
}
