import "../../index.css";
import { useEffect, useState } from 'react';

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
      const LearnosityApp = (window as any).LearnosityApp;
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
    <div />
  );
}
