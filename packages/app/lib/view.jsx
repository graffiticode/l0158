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
  const [ id, setId ] = useState(params.get("id"));
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

  const compileResp = useSWR(
    doRecompile && accessToken && id && {
      accessToken,
      id,
      data: state.data,
    },
    compile
  );

  if (compileResp.data) {
    setDoRecompile(false);
    if (Array.isArray(compileResp.data.errors) && compileResp.data.errors.length > 0) {
      state.apply({ type: "signed", args: compileResp.data });
    } else {
      setData(compileResp.data);
      setDoInit(true);
    }
  }

  const initResp = useSWR(
    doInit && data && {
      accessToken,
      data,
  }, initRequest);

  useEffect(() => {
    if (initResp.data) {
      setDoInit(false);
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
      <Form state={state} targetOrigin={targetOrigin} /> ||
      <div />
  );
}
