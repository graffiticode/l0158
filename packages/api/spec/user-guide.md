<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# L0158 User Guide

Agent-facing guide for authoring Learnosity-compatible assessment items through L0158. Read this before composing a `create_item` prompt or an `update_item` modification.

## Overview

L0158 is an authoring language for Learnosity-compatible assessment items. Input is a natural-language description of a single item (or a small group sharing a stimulus); output is a Learnosity item JSON with a stem, one or more interactions, validation rules, scoring, and optional metadata tags. L0158 is the right tool when the job is "produce one assessment item"; it is not an activity-builder, a delivery engine, or a host-app integration surface.

When composing a request, name the item type explicitly ("multiple choice", "cloze with dropdowns", "short-text", "math fill-in", "order the list", "classification") if it is known — the language has a fixed catalog of interactions and guessing costs a round-trip. Include the stem, the correct answer, any distractors, and the scoring model (exact match, partial credit, manual rubric). Describe shared context — a reading passage, an image, a diagram — only once; the backend will attach it to grouped items.

In scope: item authoring, item-level metadata, item-level accessibility hints (alt text, reading level), variant generation. Out of scope: activity-level assembly, delivery configuration, learner-side analytics, and host-app embedding — those belong downstream of this language and are handled by the Learnosity Items/Activities APIs or by the host app that renders the compiled JSON.

Item-level metadata (tags, difficulty, DOK) and question-level metadata (per-distractor rationale, acknowledgements) are supported via a `metadata` block at the relevant level — describe tags, difficulty, and per-option rationale in plain English and L0158 attaches them to the right level automatically.

## Item Types

L0158 emits one of the following interactions per question. Use the English cue when you know what you want — it removes ambiguity for the backend.

| Type key          | Natural-language cues                                               | When to use                                                                 |
|-------------------|----------------------------------------------------------------------|------------------------------------------------------------------------------|
| `mcq`             | "multiple choice", "MCQ", "pick one", "select the best answer"      | Single correct answer (or multi-select with `multiple-responses`) from a list. |
| `shorttext`       | "short text", "short response", "fill in one word"                  | One-line typed answer with exact-match validation.                          |
| `longtext`        | "essay", "long response with rich text"                             | Rubric-scored long-form response with formatting.                           |
| `plaintext`       | "plain-text essay", "open-ended response"                           | Rubric-scored long-form response without formatting.                        |
| `clozetext`       | "fill in the blank", "cloze with typed answers"                     | Inline blanks filled by typing; one or more blanks per stem.                |
| `clozeassociation`| "drag and drop into blanks", "drag the correct term into the gap"   | Inline blanks filled by dragging from a bank of choices.                    |
| `clozedropdown`   | "dropdowns in the sentence", "cloze with dropdown selectors"        | Inline blanks filled by selecting from a per-blank dropdown.                |
| `clozeformula`    | "math fill-in", "cloze with a formula answer"                       | Inline blank that accepts a math expression, scored by equivalence.         |
| `choicematrix`    | "grid", "rate each statement", "true/false matrix"                  | 2D grid: rows are stems, columns are options; one selection per row.        |
| `orderlist`       | "order these", "put in order", "sequence"                           | Drag items into the correct sequence.                                       |
| `classification`  | "sort into categories", "bucket these items"                        | Drag items into named category buckets.                                     |

No `hotspot` or `image-label` interaction today; describe those as MCQ over labeled positions if you must.

## Vocabulary Cues

Say this to get that:

- **Stem** — the prompt text the learner reads ("write the stem as…").
- **Distractors** — incorrect options in an MCQ; request "distractors that match common misconceptions" rather than just "wrong answers".
- **Valid response** — the correct answer(s). For MCQ, pass either the option text or the option index.
- **Rubric** — triggers manual-scoring mode on `longtext` / `plaintext`. Describe point values per criterion.
- **Exact match / partial credit** — picks the scoring model; default is exact match.
- **Shared stimulus** — a passage, image, or diagram attached once to a group of items. Describe it once at the top of the request.
- **Tags / standards** — NGSS, CCSS, Bloom's level — mention them by their conventional names (e.g., "NGSS MS-LS1-2", "CCSS 6.NS.A.1") and L0158 attaches them at the item level so the Learnosity Author Site can filter on them.
- **Difficulty / DOK** — describe difficulty in plain English ("medium", "hard") or numerically (1–5); for Depth of Knowledge use the integer 1–4. Both attach at the item level.
- **Distractor rationale** — for MCQ, ask for "a one-line rationale per distractor" or "explain why each wrong answer is wrong". L0158 attaches these at the question level so the Author Site review pane shows the teaching intent alongside the item.
- **Instant feedback** — turns on immediate per-response feedback in the interaction.
- **Shuffle options** — randomizes option order at render time.
- **Save to the item bank** — by default an item renders as a preview and is *not* written to the Learnosity item bank. Say "save to the item bank" (or equivalent) to persist it; it lands as `status: unpublished` (draft). Publishing is done from the Learnosity Author Site UI, not from the DSL.

## Metadata

L0158 attaches metadata at two levels.

**Item-level metadata** is what the Learnosity Author Site indexes for search and filtering. Standards tags (NGSS, CCSS, custom taxonomies), difficulty, and DOK go here. Mention them in the prompt and L0158 attaches them to the item record.

**Question-level metadata** travels with the individual interaction if it is reused. The headline field is per-distractor rationale on MCQ — when you ask for "a one-line rationale per distractor", L0158 emits these as question-level metadata that the Author Site shows in the review pane.

You usually do not need to think about which level is which — describe what you want in plain English and L0158 places the metadata at the level that makes it useful. Example: *"Create a 4-option MCQ on the function of mitochondria. Distractors should match common misconceptions, and add a one-line rationale per distractor explaining the misconception. Tag with NGSS MS-LS1-2, difficulty medium, DOK 2."* — produces an item with NGSS/difficulty/DOK at the item level and per-option rationale at the question level.

## Example Prompts

- *"Create a 4-option MCQ on the function of mitochondria. One correct answer. Distractors should match common misconceptions. Tag with NGSS MS-LS1-2. Difficulty: medium."* → `mcq`
- *"Write a cloze item with three dropdowns about the stages of mitosis in order: prophase, metaphase, anaphase. Show the stem above a sentence with blanks."* → `clozedropdown`
- *"Short-text item asking students to define 'allele' in one sentence. Exact match on 'a variant of a gene'."* → `shorttext`
- *"Given this passage about photosynthesis, write three related MCQs sharing the passage as a stimulus. Each should target a different depth-of-knowledge level."* → three `mcq` items grouped under one stimulus
- *"Create an MCQ on the function of mitochondria with four options. Distractors should match common misconceptions, and add a one-line rationale per distractor. Tag with NGSS MS-LS1-2, difficulty medium, DOK 2."* → `mcq` with item-level NGSS/difficulty/DOK tags and question-level per-option rationale
- *"Update item-id <X>: change the stem to be shorter and clearer, but keep all the existing tags and rationale."* → preserves both metadata blocks; only the stem changes

## Out of Scope

- **Activity-level assembly** — stringing items into a timed test, sections, or branching. Belongs in Learnosity Activities API.
- **Delivery configuration** — proctoring, time limits, attempt caps, accommodations at delivery time.
- **Learner-side analytics** — response data, mastery, reporting. Served by Learnosity Data / Reports APIs after items have been delivered.
- **Host-app embedding** — mounting the rendered item inside a React app, Canvas LTI, etc. Handled by the host runtime, not by this language surface. See the L0158 docs site for integration guidance.
- **Raw Learnosity JSON** — L0158 authors items in natural language and emits Learnosity JSON; requests for hand-written JSON patches should go to a lower-level tool, not here.
