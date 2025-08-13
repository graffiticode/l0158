import "../../index.css";
import React, { useEffect, useState } from 'react'; React;

export const Form = ({ state }) => {
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
      console.log("loaded");
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.log("error");
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
      LearnosityApp.init(request, {
        readyListener: () => {
          console.log("ready");
        },
        errorListener(err) {
          console.log('error', err);
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
