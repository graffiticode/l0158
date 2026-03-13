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
- Question definitions follow the Learnosity question format with `type`, `stimulus`, and `valid_response` fields
- Custom question types require `js` and `css` fields pointing to question/scorer scripts

## Example Patterns

- Simple items assessment:
  ```
  items questions [{
    "type": "custom",
    "stimulus": "What color means go?",
    "valid_response": { "value": "Green", "score": 1 }
  }] {}..
  ```
- Initialize an items session:
  ```
  init { "type": "items" }..
  ```
- Author mode for editing items:
  ```
  author { "mode": "item_edit" }..
  ```
