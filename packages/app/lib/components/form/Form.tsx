// SPDX-License-Identifier: MIT
import "../../index.css";
import React, { useEffect, useState } from 'react'; React;

function renderErrors(errors: { message: string; from: number; to: number }[]) {
  return (
    <div className="flex flex-col gap-2">
      {errors.map((error, i) => (
        <div
          key={i}
          className="rounded-md p-3 border text-sm bg-red-50 border-red-200 text-red-800"
        >
          {error.message}
        </div>
      ))}
    </div>
  );
}

export const Form = ({ state, targetOrigin }) => {
  if (Array.isArray(state.data?.errors) && state.data.errors.length > 0) {
    return renderErrors(state.data.errors);
  }
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { type, request } = state.data;
  useEffect(() => {
    // Dynamically load Learnosity script if not included in HTML
    const script = document.createElement('script');
    script.src =
      type === "questions" ? 'https://questions.learnosity.com/?latest-lts' :
      type === "author" ? 'https://authorapi.learnosity.com/?latest-lts' :
      'https://items.learnosity.com/?latest-lts';
    script.async = true;
    script.onload = () => {
      console.log("Learnosity script loaded", "type=" + type, "src=" + script.src);
      setScriptLoaded(true);
    };
    script.onerror = (e) => {
      console.error("Learnosity script failed to load", "type=" + type, "src=" + script.src, e);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  useEffect(() => {
    if (scriptLoaded) {
      const LearnosityApp =
            type === "questions" ? (window as any).LearnosityApp :
            type === "author" ? (window as any).LearnosityAuthor :
            (window as any).LearnosityItems;
      console.log("Learnosity init", "type=" + type, "request=" + JSON.stringify(request));
      LearnosityApp.init(request, {
        readyListener: () => {
          console.log("Learnosity ready", "type=" + type);
          if (targetOrigin) {
            window.parent.postMessage({ type: "onload", data: state.data }, targetOrigin);
          }
        },
        errorListener(err) {
          console.error("Learnosity error", "type=" + type, err);
        }
      });
    }
  }, [scriptLoaded, request]);
  return (
    <>
      {type === "author" ? (
        <div id="learnosity-author" />
      ) : (
        <span id="learnosity_assess" className="learnosity-item" data-reference="item-1" />
      )}
    </>
  );
}
