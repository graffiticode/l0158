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
  const [ id, setId ] = useState();
  const [ accessToken, setAccessToken ] = useState();
  const [ doRecompile, setDoRecompile ] = useState(false);
  const [ doInit, setDoInit ] = useState(false);
  const [ height, setHeight ] = useState(0);
  const [ data, setData ] = useState({});

  useEffect(() => {
    if (window.location.search) {
      // If 'id' is given, it is the raw data of the question and needs to be
      // signed so it can be rendered. If 'data' is given it contains the signed
      // request that can be used directly.
      const params = new URLSearchParams(window.location.search);
      setId(params.get("id"));
      const accessToken = params.get("access_token");
      setAccessToken(accessToken);
      const data = JSON.parse(params.get("data"));
      if (data) {
        state.apply({
          type: "signed",
          args: {
            type: data.type,
            request: data.request,
          },
        });
      }
    }
  }, [window.location.search]);

  // Post onload message when view first renders
  useEffect(() => {
    if (targetOrigin) {
      window.parent.postMessage({ type: "onload", version: state.version, data: state.data }, targetOrigin);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    if (targetOrigin) {
      window.parent.postMessage(state.data, targetOrigin);
    }
  }, [JSON.stringify(state.data)]);

  useEffect(() => {
    // If `id` changes, then recompile.
    if (id) {
      setDoRecompile(true);
    }
  }, [id]);

  const [ state ] = useState(createState({}, (data, { type, args }) => {
    console.log(
      "L0158/state.apply()",
      "type=" + type,
      "args=" + JSON.stringify(args, null, 2),
    );
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

  const compileResp = useSWR(
    doRecompile && accessToken && id && {
      accessToken,
      id,
      data: state.data,
    },
    compile
  );

  if (compileResp.data) {
    setData(compileResp.data);
    setDoRecompile(false);
    setDoInit(true);
  }

  const initResp = useSWR(
    doInit && data && {
      accessToken,
      data,
  }, initRequest);

  useEffect(() => {
    if (initResp.data) {
      setDoInit(false);
      console.log(
        "L0158 View() location.hostname=" + location.hostname,
      );
      state.apply({
        type: "signed",
        args: {
          type: data.type,
          request: initResp.data,
        },
      });
    }
  }, [initResp.data]);

  return (
    isNonNullNonEmptyObject(state.data) &&
      <Form state={state} /> ||
      <div />
  );
}
