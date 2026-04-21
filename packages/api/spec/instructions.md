<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# Dialect L0158 Specific Instructions

L0158 is a Graffiticode dialect for building Learnosity assessment integrations.
It compiles programs into Learnosity API requests (Items, Questions, Author APIs)
and renders them via a React frontend.

## L0158 Specific Guidelines

- **CRITICAL**: The first line of every program MUST be exactly `set-var "lrn-id" get-val-public "itemId"`. This captures the caller-supplied item ID. NEVER use `set-var "lrn-id" ""` or any other value — the program will fail if `lrn-id` is empty. Copy this line verbatim from the template; do not simplify or omit `get-val-public "itemId"`.
- Use `items` to create Items API requests for rendering assessments
- Use `item` to define individual items when building a list for `items`
- Use `questions` as a chainable attribute to set questions on an item
- Use `features` as a chainable attribute to set features on an item (placeholder)
- Use `layout` as a chainable attribute to set the HTML template for an item (placeholder)
- Use `author` to create Author API requests for item authoring
- Use `init` to initialize a Learnosity API session by type
- Use `hello` to display simple text output: `hello "Hello, world!"..`
- `items` always takes a list of `item` objects: `items [item questions [...] {}]..`
- When an assessment has multiple questions, place all questions in the same `item` rather than creating separate items: `items [item questions [mcq {}, shorttext {}] {}]..`

### Question Type Functions

Instead of writing raw Learnosity JSON, use the question type functions which
provide a higher-level interface with sensible defaults:

- `mcq` — Multiple choice questions
- `shorttext` — Short typed responses
- `longtext` — Rich text essays (manually scored)
- `plaintext` — Plain text essays (manually scored)
- `clozetext` — Fill-in-the-blank with typed responses
- `clozeassociation` — Fill-in-the-blank with drag and drop (use `possible-responses`, not `options`)
- `clozedropdown` — Fill-in-the-blank with dropdown select (use `possible-responses`, not `options`)
- `clozeformula` — Fill-in-the-blank with math/formula input
- `choicematrix` — Grid of options by stems
- `orderlist` — Drag items into correct order
- `classification` — Sort items into categories

Each function takes a record built from chainable attribute keywords.
All attributes have defaults, so `mcq {}` produces a complete question.

### Question Type Templates

- `mcq` — Multiple choice:
  ```
  mcq
    stimulus "What is 2 + 2?"
    options ["3", "4", "5"]
    valid-response [1]
    {}
  ```

- `shorttext` — Short typed response:
  ```
  shorttext
    stimulus "What is the capital of France?"
    valid-response "Paris"
    {}
  ```

- `longtext` — Rich text essay (manually scored):
  ```
  longtext
    stimulus "Explain the water cycle."
    max-length 500
    placeholder "Start writing here..."
    {}
  ```

- `plaintext` — Plain text essay (manually scored):
  ```
  plaintext
    stimulus "Describe your favorite book."
    max-length 300
    placeholder "Start writing here..."
    {}
  ```

- `clozetext` — Fill-in-the-blank with typed responses:
  ```
  clozetext
    stimulus "The {{response}} is the powerhouse of the cell."
    valid-response ["mitochondria"]
    {}
  ```

- `clozeassociation` — Fill-in-the-blank with drag and drop (use `possible-responses`, not `options`):
  ```
  clozeassociation
    stimulus "Drag the correct {{response}} here."
    possible-responses ["correct", "incorrect", "maybe"]
    valid-response ["correct"]
    {}
  ```

- `clozedropdown` — Fill-in-the-blank with dropdown select (use `possible-responses`, not `options`; each blank gets its own list):
  ```
  clozedropdown
    stimulus "Select the correct {{response}}."
    possible-responses [["correct", "incorrect", "maybe"]]
    valid-response ["correct"]
    {}
  ```

- `clozeformula` — Fill-in-the-blank with math/formula input:
  ```
  clozeformula
    stimulus "Solve: x + 3 = 7. x = {{response}}"
    valid-response ["4"]
    method "equivLiteral"
    {}
  ```

- `choicematrix` — Grid of options by stems:
  ```
  choicematrix
    stimulus "Select the correct answer for each row."
    rows ["Statement 1", "Statement 2"]
    columns ["True", "False"]
    valid-response [[0], [1]]
    {}
  ```

- `orderlist` — Drag items into correct order:
  ```
  orderlist
    stimulus "Arrange in order."
    list ["First", "Second", "Third", "Fourth"]
    valid-response [0, 1, 2, 3]
    {}
  ```

- `classification` — Sort items into categories (use `possible-responses` for the draggable items, `categories` for column headings):
  ```
  classification
    stimulus "Sort the animals"
    possible-responses ["Dog", "Snake", "Cat", "Lizard"]
    categories ["Mammals", "Reptiles"]
    valid-response [[0, 2], [1, 3]]
    {}
  ```

### Metadata

L0158 supports a `metadata` block at two levels: on `item` (for fields the
Learnosity Author Site indexes for search) and on each question constructor
(for fields that travel with the interaction). Both are optional and can
appear independently — items without metadata work exactly as before.

`metadata` takes a list whose members are arity-1 constructor calls
(`tags`, `notes`, `acknowledgements`, `distractor-rationale`,
`description`, `source`, `difficulty-level`). Each member tags its
payload with a kind so the compiler can route faceted fields to `tags`
and free-form fields to `metadata` in the Learnosity output.

#### Item-level metadata

Place a `metadata` block alongside `questions` inside an `item` chain. These
list members are recognized:

- `tags` — record mapping tag type to value, where each value is a string
  or an array of strings (a bare string is normalized to a single-element
  array). Faceted conventions like `Difficulty` and `DOK` go here (e.g.
  `tags { Difficulty: "medium", DOK: 2 }`) because Learnosity has no
  dedicated fields for them. Example:
  `tags { NGSS: "MS-LS1-2", "Common Core": ["Math:6.NS.A.1"] }`.
- `notes` — author-facing note attached to the item. Emitted as the
  item's top-level `note` field (what the Author Site item details
  page's Notes field reads from).
- `description` — short item description. Emitted as the item's
  top-level `description` field (Description field on the item details
  page).
- `source` — source/attribution string. Emitted as the item's top-level
  `source` field (Source field on the item details page).
- `difficulty-level` — integer Rasch calibration for adaptive sessions.
  Emitted as `adaptive.difficulty`, backing the Difficulty level spinner
  on the item details page. Distinct from the faceted `Difficulty` tag,
  which is a text label (e.g. `"medium"`) used for filtering.
- `acknowledgements` — attribution string. Emitted as
  `metadata.acknowledgements`.

```
items [
  item
    metadata [
      tags { NGSS: "MS-LS1-2", Difficulty: "medium", DOK: 2, topic: "cellular-respiration" }
      notes "Variant A of the organelle misconception set"
    ]
    questions [
      mcq
        stimulus "What is the primary function of the mitochondria?"
        options [
          "To produce energy (ATP) through cellular respiration"
          "To control what enters and exits the cell"
          "To build proteins using genetic instructions"
          "To store and protect the cell's DNA"
        ]
        valid-response [0]
        {}
    ]
    {}
]..
```

#### Question-level metadata

Place a `metadata` block inside any question constructor's chain, alongside
`stimulus`, `options`, etc. These list members are recognized:

- `distractor-rationale` — a string, or a list of strings (one per option).
  A list is joined into a numbered multi-line string (`"1. ...\n2. ..."`)
  so the Author Site's single Distractor Rationale field displays the
  per-option intent in place.
- `acknowledgements` — attribution string.

```
mcq
  stimulus "What is the primary function of the mitochondria?"
  options [
    "To produce energy (ATP) through cellular respiration"
    "To control what enters and exits the cell"
    "To build proteins using genetic instructions"
    "To store and protect the cell's DNA"
  ]
  valid-response [0]
  metadata [
    distractor-rationale [
      "Correct — ATP production via cellular respiration."
      "That's the role of the cell membrane."
      "That's the role of ribosomes."
      "That's the role of the nucleus."
    ]
    notes "Targets the three most common organelle confusions."
  ]
  {}
```

#### Both levels in one item

```
items [
  item
    metadata [
      tags { NGSS: "MS-LS1-2", Difficulty: "medium", DOK: 2 }
    ]
    questions [
      mcq
        stimulus "..."
        options [...]
        valid-response [0]
        metadata [
          distractor-rationale ["..." "..." "..." "..."]
        ]
        {}
    ]
    {}
]..
```

#### Conventions

- **Tag values** are plain strings. When one tag type has multiple values,
  pass an array (e.g., `tags { NGSS: ["MS-LS1-2", "MS-LS1-6"] }`); for a
  single value, a bare string is accepted for readability.
- **Distractor-rationale list length** should match the number of options.
- **Use item-level `tags` for faceted fields** (standards, Difficulty,
  DOK, subject, etc.) — these drive Author Site search and filtering.
- **Use question-level metadata for per-interaction fields**
  (`distractor-rationale`, `acknowledgements`, question `notes`). These
  travel with the question if it is reused in a different item.

### Attribute Chaining

Attributes are arity-2 functions that chain together, terminated by `{}`:

```
mcq
  stimulus "What is 2 + 2?"
  options ["3", "4", "5"]
  valid-response [1]
  instant-feedback true
  {}
```

Common attributes: `stimulus`, `options`, `valid-response`, `instant-feedback`,
`shuffle-options`, `multiple-responses`, `case-sensitive`, `max-length`,
`max-word-count`, `placeholder`, `possible-responses`, `rows`, `columns`,
`list`, `categories`, `method`.

### Save to Item Bank vs. Preview

By default, `items [...]` produces a **preview**: the item and its questions
render inline through Questions API without being written to the Learnosity
item bank. This is the right default for AI-authored items — the human can
eyeball the preview before deciding to persist.

Chain `save-to-itembank true` onto the items continuation to persist the
item and its questions to the Learnosity item bank. Saved items always land
as `status: "unpublished"` (draft); publishing is done from the Learnosity
Author Site UI, not from the DSL.

Prompts that should trigger `save-to-itembank true`:

- "save it to the item bank" / "write to the bank" / "persist it" → include
  `save-to-itembank true`
- No such phrasing → preview-only; omit the attribute.

Example — save as draft:

```
set-var "lrn-id" get-val-public "itemId"
learnosity
  items [
    item
      questions [mcq stimulus "Which planet is closest to the Sun?"
        options ["Mercury", "Venus", "Earth", "Mars"]
        valid-response [0] {}]
      {}
  ]
  save-to-itembank true
  {}..
```

## Example Patterns

- Simple MCQ assessment:
  ```
  set-var "lrn-id" get-val-public "itemId"
  learnosity
    items [
      item
        questions [
          mcq
            stimulus "What color means go?"
            options ["Red", "Yellow", "Green"]
            valid-response [2]
            {}
        ]
        {}
    ] {}..
  ```

- MCQ with all defaults:
  ```
  set-var "lrn-id" get-val-public "itemId"
  learnosity items [item questions [mcq {}] {}] {}..
  ```

- Multiple items:
  ```
  set-var "lrn-id" get-val-public "itemId"
  learnosity
    items [
      item questions [mcq {}] {},
      item questions [shorttext {}] {}
    ] {}..
  ```

- Fill-in-the-blank:
  ```
  set-var "lrn-id" get-val-public "itemId"
  learnosity
    items [
      item
        questions [
          clozetext
            stimulus "The {{response}} is the powerhouse of the cell."
            valid-response ["mitochondria"]
            {}
        ]
        {}
    ] {}..
  ```

- Math question:
  ```
  set-var "lrn-id" get-val-public "itemId"
  learnosity
    items [
      item
        questions [
          clozeformula
            stimulus "Solve: x + 3 = 7. x = {{response}}"
            valid-response ["4"]
            method "equivLiteral"
            {}
        ]
        {}
    ] {}..
  ```

- Multiple questions in one item:
  ```
  set-var "lrn-id" get-val-public "itemId"
  learnosity
    items [
      item
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
        {}
    ] {}..
  ```

- Initialize an items session:
  ```
  init { "type": "items" }..
  ```

- Author mode for editing items:
  ```
  author { "mode": "item_edit" }..
  ```
