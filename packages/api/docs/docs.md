# L1058

**L0158** is a language for writing *Graffiticode* app integrations for
*Learnosity*.

Here is an example:

```
items questions [{
  "type": "custom",
  "stimulus": "What color means go?",
  "valid_response": {
    "value": "Green",
    "score": 1
  },
  "js": {
    "question": "https://l0155.graffiticode.org/question.js",
    "scorer": "https://l0155.graffiticode.org/scorer.js"
  },
  "css": "https://l0155.graffiticode.org/question.css",
  "instant_feedback": true
}] {}..
```

<iframe
  src="https://graffiticode.com/form?id=eyJ0YXNrSWRzIjpbIms1dzBHNmZVVmJOekNWTURXb2pqIl19"
  width="500"
  height="220"
  style="border: 0.5px solid gray; padding: 0px 20px;"
/>
