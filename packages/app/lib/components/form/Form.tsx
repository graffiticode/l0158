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
    if (!type) return;
    // Dynamically load Learnosity script if not included in HTML. Re-run on
    // type change so preview (questions) and save (items) swap scripts
    // correctly when state.data.type flips post-compile.
    setScriptLoaded(false);
    const script = document.createElement('script');
    script.src =
      type === "questions" ? 'https://questions.learnosity.com/?latest-lts' :
      type === "author" ? 'https://authorapi.learnosity.com/?latest-lts' :
      'https://items.learnosity.com/?latest-lts';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = (e) => {
      console.error("Learnosity script failed to load", type, script.src, e);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [type]);
  useEffect(() => {
    if (!scriptLoaded) return;
    const LearnosityApp =
          type === "questions" ? (window as any).LearnosityApp :
          type === "author" ? (window as any).LearnosityAuthor :
          (window as any).LearnosityItems;
    // Defer one frame so React has committed the response spans before
    // Questions API validates the activity JSON against the DOM (error 10001
    // "no matching DOM element" fires otherwise on first load).
    const run = () => {
      if (type === "questions") {
        const qs = request?.questions ?? request?.request?.questions ?? [];
        const missing = qs
          .map((q: { response_id: string }) => q.response_id)
          .filter((rid: string) =>
            !document.querySelector(`.learnosity-response.question-${CSS.escape(rid)}`)
          );
        if (missing.length) {
          requestAnimationFrame(run);
          return;
        }
      }
      LearnosityApp.init(request, {
        readyListener: () => {
          if (targetOrigin) {
            window.parent.postMessage({ type: "onload", data: state.data }, targetOrigin);
          }
        },
        errorListener(err) {
          console.error("Learnosity error", type, err);
        }
      });
    };
    requestAnimationFrame(run);
  }, [scriptLoaded, request]);
  if (type === "author") {
    return <div id="learnosity-author" />;
  }
  if (type === "questions") {
    // Questions API renders into .learnosity-response spans keyed by response_id.
    // The Questions SDK returns a flat signed request (questions at the top
    // level); Items/Author SDKs wrap data in {security, request}.
    const questions = request?.questions ?? request?.request?.questions ?? [];
    return (
      <div>
        {questions.map((q: { response_id: string }) => (
          <span
            key={q.response_id}
            className={`learnosity-response question-${q.response_id}`}
            data-response-id={q.response_id}
          />
        ))}
      </div>
    );
  }
  return (
    <span id="learnosity_assess" className="learnosity-item" data-reference="item-1" />
  );
}
