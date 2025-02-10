import "../../index.css";
import { useEffect, useState } from 'react';

export const Form = ({ state }) => {
  console.log(
    "Form() state=" + JSON.stringify(state, null, 2)
  );
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { type, request } = state.data;
  useEffect(() => {
    // Dynamically load Learnosity script if not included in HTML
    const script = document.createElement('script');
    script.src =
      type === "questions" &&
        'https://questions.learnosity.com/?latest-lts' ||
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
            type === "questions" &&
              (window as any).LearnosityApp ||
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
    <span  id="learnosity_assess" className="learnosity-item" data-reference="item-1" />
  );
}
