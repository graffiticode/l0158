import "../../index.css";
import { useEffect, useState } from 'react';

// function renderJSON(data) {
//   delete data.schema;
//   return (
//     <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
//   );
// }

// function render({ state }) {
//   const { data } = state;
//   return renderJSON(data);
// }

// const callbacks = {
//   errorListener: function(e) {
//     // Adds a listener to all error codes.
//     console.log("Error Code ", e.code);
//     console.log("Error Message ", e.msg);
//     console.log("Error Detail ", e.detail);
//   },
//   /* example object
//      {
//      code:   10001,
//      msg:    "JSON format error",
//      detail: "Activity JSON Poorly formed. Incorrect activity type found: abcd",
//      }
//   */

//   readyListener: function() {
//     console.log("Learnosity Questions API is ready");
//   },

//   labelBundle: {
//     loadingInfo: "Loading page...",
//     play: "play",
//   },

//   saveSuccess: function(response_ids) {
//     for(let i = 0; i < response_ids.length; i++) {
//       console.log("Responses saved : ", response_ids[i]);
//     }
//   },

//   saveError: function(e) {
//     console.log("Save failed - error ", e);
//   },

//   saveProgress: function(progress) {
//     console.log("Save progress - ", progress);
//   }
// };

export const Form = ({ state }) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const request = state.data;
  useEffect(() => {
    // Dynamically load Learnosity script if not included in HTML
    const script = document.createElement('script');
    script.src = 'https://questions.learnosity.com/?latest-lts';
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
      console.log("Form() request=" + JSON.stringify(request, null, 2));
      const LearnosityApp = (window as any).LearnosityApp;
      const questionsApp = LearnosityApp.init(request, {
        readyListener: () => {
          console.log("ready");
          console.log("questions=" + JSON.stringify(questionsApp.questions()));
        },
        errorListener(err) {
          console.log('error', err);
        }
      });
    }
  }, [scriptLoaded, request]);
  return (
    <div />
  );
}
