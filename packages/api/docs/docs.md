# L1058

**L0158** is a language for writing *Graffiticode* app integrations for
*Learnosity*.

Here is an example:

```
questions [{
  "id": "magicsquare-15",
  "response_id": "60005",
  "type": "custom",
  "stimulus": "Complete the magic square",
  "valid_response": {
    "value": "Green",
    "score": 1
  },
  "js": {
    "question": "https://l0154.graffiticode.org/question.js",
    "scorer": "https://l0154.graffiticode.org/scorer.js"
  },
  "css": "https://l0154.graffiticode.org/question.css",
  "instant_feedback": true,
  "problemStatement": "The magic number is",
  "expression": "15",
  "showFeedback": true,
  "initializeGrid": true,
  "terms": [
    [
      4,
      3,
      8
    ],
    [
      9,
      5,
      1
    ],
    [
      2,
      7,
      6
    ]
  ]
}]..
```

<iframe src="https://graffiticode.com/form?lang=0158&id=eyJ0YXNrSWRzIjpbIkNHOWprVVUyU3RtVDZ3UVQwUFhyIl19" width="100%" height="1000" border="none" />
