<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# Dialect L0158 Specific Instructions

L0158 is a Graffiticode dialect for building Learnosity assessment integrations.
It compiles programs into Learnosity API requests (Items, Questions, Author APIs)
and renders them via a React frontend.

## L0158 Specific Guidelines

- Use `items` to create Items API requests for rendering assessments
- Use `questions` to create Questions API requests with question definitions
- Use `author` to create Author API requests for item authoring
- Use `init` to initialize a Learnosity API session by type
- Use `hello` to display simple text output: `hello "Hello, world!"..`

### Question Type Functions

Instead of writing raw Learnosity JSON, use the question type functions which
provide a higher-level interface with sensible defaults:

- `mcq` — Multiple choice questions
- `shorttext` — Short typed responses
- `longtext` — Rich text essays (manually scored)
- `plaintext` — Plain text essays (manually scored)
- `clozetext` — Fill-in-the-blank with typed responses
- `clozeassociation` — Fill-in-the-blank with drag and drop
- `clozedropdown` — Fill-in-the-blank with dropdown select
- `clozeformula` — Fill-in-the-blank with math/formula input
- `choicematrix` — Grid of options by stems
- `orderlist` — Drag items into correct order
- `classification` — Sort items into categories

Each function takes a record built from chainable attribute keywords.
All attributes have defaults, so `mcq {}` produces a complete question.

### Attribute Chaining

Attributes are arity-2 functions that chain together, terminated by `{}`:

```
mcq
  stimulus "What is 2 + 2?"
  options ["3", "4", "5"]
  valid-response [1]
  instant-feedback true
  {}..
```

Common attributes: `stimulus`, `options`, `valid-response`, `instant-feedback`,
`shuffle-options`, `multiple-responses`, `case-sensitive`, `max-length`,
`max-word-count`, `placeholder`, `possible-responses`, `rows`, `columns`,
`list`, `categories`, `method`.

## Example Patterns

- Simple MCQ assessment:
  ```
  items
    questions [
      mcq
        stimulus "What color means go?"
        options ["Red", "Yellow", "Green"]
        valid-response [2]
        {}
    ]
    {}..
  ```

- MCQ with all defaults:
  ```
  items questions [mcq {}] {}..
  ```

- Fill-in-the-blank:
  ```
  items
    questions [
      clozetext
        stimulus "The {{response}} is the powerhouse of the cell."
        valid-response [["mitochondria"]]
        {}
    ]
    {}..
  ```

- Math question:
  ```
  items
    questions [
      clozeformula
        stimulus "Solve: x + 3 = 7. x = {{response}}"
        valid-response ["4"]
        method "equivLiteral"
        {}
    ]
    {}..
  ```

- Multiple questions:
  ```
  items
    questions [
      mcq
        stimulus "Pick one"
        options ["A", "B", "C"]
        valid-response [0]
        {},
      shorttext
        stimulus "Type the answer"
        valid-response "answer"
        {}
    ]
    {}..
  ```

- Initialize an items session:
  ```
  init { "type": "items" }..
  ```

- Author mode for editing items:
  ```
  author { "mode": "item_edit" }..
  ```
