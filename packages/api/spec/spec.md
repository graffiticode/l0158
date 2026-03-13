<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# L0158 Vocabulary

This specification documents dialect-specific functions available in the
**L0158** language of Graffiticode. These functions extend the core language
with functionality for building Learnosity assessment integrations.

The core language specification including the definition of its syntax,
semantics and base library can be found here:
[Graffiticode Language Specification](./graffiticode-language-spec.html)

## Functions

| Function | Signature | Description |
| :------- | :-------- | :---------- |
| `init` | `<record: record>` | Initializes a Learnosity API session |
| `items` | `<record: record>` | Creates a Learnosity Items API request |
| `questions` | `<record: record>` | Creates a Learnosity Questions API request |
| `author` | `<record: record>` | Creates a Learnosity Author API request |
| `hello` | `<string: string>` | Renders a hello message |

### init

Initializes a Learnosity API session for items, questions, or author mode
based on the `type` field in the given record.

```
init { "type": "items" }
```

### items

Creates a Learnosity Items API request from the given item definition record.

```
items questions [{
  "type": "custom",
  "stimulus": "What color means go?",
  "valid_response": { "value": "Green", "score": 1 },
  "js": {
    "question": "https://l0155.graffiticode.org/question.js",
    "scorer": "https://l0155.graffiticode.org/scorer.js"
  },
  "css": "https://l0155.graffiticode.org/question.css",
  "instant_feedback": true
}] {}..
```

### questions

Creates a Learnosity Questions API request from the given question definitions.

```
questions [{
  "type": "custom",
  "stimulus": "What is 2 + 2?",
  "valid_response": { "value": "4", "score": 1 }
}] {}..
```

### author

Creates a Learnosity Author API request from the given configuration record.

```
author { "mode": "item_edit" }..
```

### hello

Renders a hello message that includes the given string.

```
hello "world"  | returns "hello, world!"
```

## Program Examples

Create a Learnosity items assessment with a custom question:

```
items questions [{
  "type": "custom",
  "stimulus": "What color means go?",
  "valid_response": { "value": "Green", "score": 1 }
}] {}..
```
