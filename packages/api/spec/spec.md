<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# L0158 Vocabulary

This specification documents dialect-specific functions available in the
**L0158** language of Graffiticode. These functions extend the core language
with functionality for building Learnosity assessment integrations.

The core language specification including the definition of its syntax,
semantics and base library can be found here:
[Graffiticode Language Specification](./graffiticode-language-spec.html)

## Functions

| Function | Arity | Signature | Description |
| :------- | :---: | :-------- | :---------- |
| `learnosity` | 2 | `<id: string, continuation: record>` | Top-level wrapper that sets a global id used in all generated Learnosity references |
| `init` | 1 | `<record: record>` | Initializes a Learnosity API session |
| `items` | 1 | `<record: record>` | Creates a Learnosity Items API request from a record or list of items |
| `item` | 1 | `<record: record>` | Defines a single item (for use in a list passed to `items`) |
| `questions` | 2 | `<list: list, continuation: record>` | Chainable attribute: sets the questions for an item |
| `features` | 2 | `<list: list, continuation: record>` | Chainable attribute: sets the features for an item (placeholder) |
| `layout` | 2 | `<string: string, continuation: record>` | Chainable attribute: sets the layout template for an item (placeholder) |
| `author` | 1 | `<record: record>` | Creates a Learnosity Author API request |
| `hello` | 1 | `<string: string>` | Renders a hello message |

### Question Type Functions

Each question type function takes a record of attributes (built via chainable
attribute keywords) and produces a Learnosity question JSON object. Attributes
not provided are filled with sensible defaults, so `mcq {}` produces a
complete renderable question.

| Function | Arity | Learnosity Type | Description |
| :------- | :---: | :-------------- | :---------- |
| `mcq` | 1 | `mcq` | Multiple choice question |
| `shorttext` | 1 | `shorttext` | Short typed response |
| `longtext` | 1 | `longtextV2` | Essay with rich text editor |
| `plaintext` | 1 | `plaintext` | Essay with plain text |
| `clozetext` | 1 | `clozetext` | Fill-in-the-blank (typed responses) |
| `clozeassociation` | 1 | `clozeassociation` | Fill-in-the-blank (drag and drop) |
| `clozedropdown` | 1 | `clozedropdown` | Fill-in-the-blank (dropdown select) |
| `clozeformula` | 1 | `clozeformulaV2` | Fill-in-the-blank (math/formula) |
| `choicematrix` | 1 | `choicematrix` | Grid of options by stems |
| `orderlist` | 1 | `orderlist` | Drag items into correct order |
| `classification` | 1 | `classification` | Sort items into categories |

### Attribute Keywords

Attribute keywords are arity-2 functions that chain together to build a record
of attributes for a question type. The chain terminates with `{}`.

| Keyword | Value Type | Learnosity Field | Used By |
| :------ | :--------- | :--------------- | :------ |
| `stimulus` | string | `stimulus` | All types |
| `options` | string[] | `options` | mcq, choicematrix |
| `valid-response` | varies | `validation.valid_response.value` | All scored types |
| `instant-feedback` | boolean | `instant_feedback` | All types |
| `shuffle-options` | boolean | `shuffle_options` | mcq, choicematrix |
| `multiple-responses` | boolean | `multiple_responses` | mcq |
| `case-sensitive` | boolean | `case_sensitive` | shorttext, clozetext |
| `max-length` | number | `max_length` | shorttext |
| `max-word-count` | number | `max_word_count` | longtext, plaintext |
| `placeholder` | string | `placeholder` | longtext, plaintext, shorttext |
| `possible-responses` | array | `possible_responses` | clozeassociation, clozedropdown, classification |
| `rows` | string[] | `stems` | choicematrix |
| `columns` | string[] | `options` | choicematrix |
| `list` | string[] | `list` | orderlist |
| `categories` | string[] | `ui_style.column_titles` | classification |
| `method` | string | `validation method` | clozeformula |
| `id` | string | global id used in all generated Learnosity references | learnosity |

## Function Reference

### learnosity

Top-level wrapper that sets a global `id` used as a component of all generated
Learnosity identifiers (item references, question references, activity id).
The `id` attribute chains with `items` or `author` as the continuation.

```
learnosity
  id "foobar-123"
  items [
    item
      questions [
        mcq
          stimulus "What is 2 + 2?"
          options ["3", "4", "5"]
          valid-response [1]
          {}
      ]
      {}
  ]..
```

### init

Initializes a Learnosity API session for items, questions, or author mode
based on the `type` field in the given record.

```
init { "type": "items" }
```

### items

Creates a Learnosity Items API request from a list of `item` objects.

```
items [
  item
    questions [
      mcq
        stimulus "What is the capital of France?"
        options ["Paris", "London", "Berlin", "Madrid"]
        valid-response [0]
        {}
    ]
    {}
]..
```

### item

Defines a single item for use in a list passed to `items`. Takes a record
of chained attributes (questions, features, layout).

```
item
  questions [mcq {}]
  {}
```

### questions

Chainable arity-2 attribute that sets the questions for an item. Takes a
list of question objects and a continuation.

```
questions [
  mcq
    stimulus "What is 2 + 2?"
    options ["3", "4", "5"]
    valid-response [1]
    {}
] {}
```

### features

Chainable arity-2 attribute that sets the features for an item. Takes a
list of feature objects and a continuation. (Placeholder — not yet implemented.)

```
features [
  { "type": "sharedpassage", "content": "Read the following passage..." }
] {}
```

### layout

Chainable arity-2 attribute that sets the HTML layout template for an item.
Takes a string and a continuation. (Placeholder — not yet implemented.)

```
layout "<div class='row'><span class='learnosity-response question-q0'></span></div>" {}
```

### author

Creates a Learnosity Author API request from the given configuration record.

```
author { "mode": "item_edit" }..
```

### hello

Renders a hello message that includes the given string.

```
hello "world"..
```

### mcq

Creates a multiple choice question. Options are provided as a string array
and `valid-response` is an array of correct option indices.

```
mcq
  stimulus "Which planet is closest to the Sun?"
  options ["Mercury", "Venus", "Earth", "Mars"]
  valid-response [0]
  instant-feedback true
  {}..
```

### shorttext

Creates a short text response question.

```
shorttext
  stimulus "What is the chemical symbol for water?"
  valid-response "H2O"
  case-sensitive false
  {}..
```

### longtext

Creates an essay question with a rich text editor. No auto-scoring.

```
longtext
  stimulus "Describe the water cycle in your own words."
  max-word-count 300
  placeholder "Write your essay here..."
  {}..
```

### plaintext

Creates an essay question with a plain text editor. No auto-scoring.

```
plaintext
  stimulus "Explain your reasoning."
  max-word-count 200
  {}..
```

### clozetext

Creates a fill-in-the-blank question where students type responses.
Use `{{response}}` markers in the stimulus for each blank.

```
clozetext
  stimulus "The {{response}} is the powerhouse of the cell."
  valid-response ["mitochondria", "mitochondrion"]
  case-sensitive false
  {}..
```

### clozeassociation

Creates a fill-in-the-blank question where students drag responses from
a list of options into blanks.

```
clozeassociation
  stimulus "Drag the correct answer: {{response}} is the capital of France."
  possible-responses ["Paris", "London", "Berlin"]
  valid-response ["Paris"]
  {}..
```

### clozedropdown

Creates a fill-in-the-blank question with dropdown selects.

```
clozedropdown
  stimulus "Select the answer: The sky is {{response}}."
  possible-responses [["blue", "red", "green"]]
  valid-response ["blue"]
  {}..
```

### clozeformula

Creates a fill-in-the-blank question for math/formula input.
The `method` attribute controls how the answer is validated.

```
clozeformula
  stimulus "Solve for x: 2x + 4 = 10. x = {{response}}"
  valid-response ["3"]
  method "equivLiteral"
  {}..
```

Supported methods: `equivLiteral`, `equivSymbolic`, `equivValue`,
`isSimplified`, `isFactorised`, `isExpanded`, `stringMatch`, `isUnit`.

### choicematrix

Creates a grid question where students select an option for each row.

```
choicematrix
  stimulus "Classify each statement as true or false."
  rows ["The sun is a star", "The moon is a planet"]
  columns ["True", "False"]
  valid-response [[0], [1]]
  {}..
```

### orderlist

Creates a question where students drag items into the correct order.

```
orderlist
  stimulus "Arrange these events in chronological order."
  list ["World War II", "World War I", "Moon Landing", "Internet"]
  valid-response [1, 0, 2, 3]
  {}..
```

### classification

Creates a question where students sort items into categories.

```
classification
  stimulus "Sort the animals into the correct categories."
  categories ["Mammals", "Reptiles"]
  possible-responses ["Dog", "Snake", "Cat", "Lizard"]
  valid-response [[0, 2], [1, 3]]
  {}..
```

## Program Examples

Multiple choice assessment:

```
learnosity
  id "foobar-123"
  items [
    item
      questions [
        mcq
          stimulus "What color means go?"
          options ["Red", "Yellow", "Green"]
          valid-response [2]
          instant-feedback true
          {}
      ]
      {}
  ]..
```

Multiple questions in one item:

```
learnosity
  id "foobar-123"
  items [
    item
      questions [
        mcq
          stimulus "What is 2 + 2?"
          options ["3", "4", "5"]
          valid-response [1]
          {},
        shorttext
          stimulus "Spell the word for the number 4."
          valid-response "four"
          case-sensitive false
          {}
      ]
      {}
  ]..
```

Question with all defaults (renders a mock MCQ):

```
learnosity id "foobar-123" items [item questions [mcq {}] {}] {}..
```

Multiple items:

```
learnosity
  id "foobar-123"
  items [
    item questions [mcq {}] {},
    item questions [shorttext {}] {}
  ]..
```
