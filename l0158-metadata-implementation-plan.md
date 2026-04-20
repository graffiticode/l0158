# Implementation Plan: Add a `metadata` Attribute to L0158

**Audience:** Claude Code, working in `~/work/graffiticode/l0158`.
**Goal:** add a `metadata` block to the L0158 DSL — at both the item and question levels — so authors can attach Learnosity-compatible metadata (tags, difficulty, DOK, distractor rationale, notes) through natural-language requests like *"Tag with NGSS MS-LS1-2, difficulty medium, DOK 2."*
**Why:** the L0158 user guide already promises this (`spec/user-guide.md` line 44: *"L0158 will attach them as metadata"*), but the implementation drops tagging instructions today — a smoke test on the live MCP confirmed this. The Learnosity partner-program demo hinges on items being searchable in the Author Site immediately after authoring, and on per-distractor rationale showing the editorial intent behind each wrong answer.

The MCP server (`graffiticode-mcp-server`) and the console-side `language-info` plumbing have already been updated to surface the L0158 envelope correctly. This change is entirely in `~/work/graffiticode/l0158`.

---

## 1. Architectural map

The investigation phase is done — here's what I found. Every file path is relative to `~/work/graffiticode/l0158`.

### Where the surface lives

- **Lexicon** — `packages/api/src/lexicon.js`. Adds keywords with `{tk, name, cls, length, arity}`. Question-type keywords (`mcq`, `shorttext`, …) are arity 1; attribute keywords (`stimulus`, `options`, `valid-response`, …) are arity 2.
- **Compiler** — `packages/api/src/compiler.js`. Defines explicit handlers for `INIT`, `ITEMS`, `ITEM`, `QUESTIONS`, `FEATURES`, `LAYOUT`, `AUTHOR`, `LEARNOSITY`, `HELLO`, `PROG`. Auto-generates Checker/Transformer methods for everything in `attributeFields` and `questionTypeBuilders` from `question-types.js`. The auto-generated arity-2 attribute Transformer is one line: `const val = { ...continuation, [meta.field]: v0 };` — that's the pattern `metadata` slots into.
- **Question types and attribute registry** — `packages/api/src/question-types.js`. Three exports matter:
  - `questionTypeBuilders` — name → builder function. Each builder destructures known attrs and uses `...rest` for unknown ones (so a new top-level attr automatically lands in the question record).
  - `attributeFields` — name → `{field, valueType}`. Adding `METADATA` here is what turns the lexicon keyword into a working chain attribute.
  - `validAttributes` — per-question-type list. New attribute names need to be added to each entry where they're allowed.
- **Item write** — `packages/api/src/items.js`, `buildCreateItems`. Constructs the Learnosity item record (`reference`, `status`, `definition.widgets`, `dynamic_content_data`, `questions`) and POSTs to `/itembank/items` via the Learnosity Data API SDK. Currently has no `metadata` or `tags` field on the item record. **This is where item-level metadata must be added** — without this change, item-level fields land in the AST but never reach Learnosity.
- **Question write** — `packages/api/src/questions.js`, `buildCreateQuestions`. Wraps the question object in `{type, reference, data}` where `data` is the entire question record. Question-level metadata lands in `data.metadata` automatically *if* the builders pass it through via `...rest`. **No change needed in `questions.js` itself**, just in the per-type builders.

### Where the docs live (and how they propagate)

- `packages/api/spec/user-guide.md` — agent-facing guide. The `## Overview` section is extracted at build time and injected as `authoring_guide` in the published `language-info.json` (see `tools/build-language-info.js`).
- `packages/api/spec/instructions.md` — DSL authoring manual for the translator. `tools/build-instructions.js` concatenates the basis instructions with this file and emits the result; the Graffiticode backend feeds this to the translator AI.
- `packages/api/spec/language-info.json` — the source envelope returned through the MCP. Already populated with `description`, `supported_item_types`, `example_prompts`. **Must NOT contain `authoring_guide`** — the build pipeline injects that and will fail validation if it's already present.
- `packages/api/spec/spec.md` — formal vocabulary spec; tables of functions and attribute keywords. Needs a new attribute keyword row.
- `packages/api/spec/examples.md` — 100 RAG training prompts the translator may use as few-shot. None currently exercise metadata; needs new examples.
- `packages/api/spec/template.gc` — minimal starter template. Doesn't need to change.

### Where the tests live

- `packages/api/src/question-types.spec.js` — unit tests per builder. Pattern: `buildMcq({stimulus: "...", ...})` and assert on the returned shape. **Add metadata cases here** — fastest feedback loop.
- `packages/api/src/compiler.spec.js` — end-to-end compile tests. Calls `compile(src)` and asserts on the compiled value. Pattern: `await compile('mcq {}..')`. **Add at least one metadata-bearing program here** to exercise lexicon + compiler + auto-gen + builder together.
- `packages/api/src/testing/fixture.js` — shared test data. Add a metadata-bearing item fixture if multiple tests need it.

No tests run network calls to Learnosity; the SDK's `sdk.init(...)` is exercised but `dataApi` is constructed in the compiler module from env vars, so item-write integration tests are out of scope here.

### One important constraint

Reading `compiler.js` confirms there's no need for explicit nested-record syntax (`{key: value, …}`). Records in this language are *built by chaining arity-2 attribute keywords terminated by an empty record literal `{}`*. The chain `tags [...] difficulty "medium" {}` evaluates to `{tags: [...], difficulty: "medium"}`. This is the same pattern `mcq` and `item` already rely on, and it's what `metadata`'s value will be.

---

## 2. Target DSL syntax — built from the existing chain idiom

`metadata` is an arity-2 attribute keyword. Its value is itself a chain of arity-2 inner attributes terminated by `{}` — exactly the same pattern used everywhere else in L0158. No new parser construct is needed.

```
item
  metadata
    tags ["NGSS:MS-LS1-2" "topic:cellular-respiration"]
    difficulty "medium"
    dok 2
    notes "Variant A of the organelle misconception set"
    {}
  questions [
    mcq
      stimulus "What is the primary function of the mitochondria in a cell?"
      options [
        "To produce energy (ATP) through cellular respiration"
        "To control what enters and exits the cell"
        "To build proteins using genetic instructions"
        "To store and protect the cell's DNA"
      ]
      valid-response [0]
      metadata
        distractor-rationale [
          "Correct — ATP production via cellular respiration."
          "That's the role of the cell membrane."
          "That's the role of ribosomes."
          "That's the role of the nucleus."
        ]
        notes "Targets the three most common organelle confusions."
        {}
      {}
  ]
  {}
```

How the parser sees this (greedy arity-based, no parens needed): `metadata` consumes two args. The first is `tags`; `tags` is arity 2, so it consumes `["NGSS:MS-LS1-2" "topic:cellular-respiration"]` (a self-contained list literal) and the next thing — `difficulty` — which is arity 2 and continues the inner chain. The inner chain bottoms out at `{}`, which is a self-contained empty record literal. That `{}` closes the metadata value; metadata's second arg (the continuation) is the next thing — `questions`. Same logic applies inside the `mcq` chain.

### Two metadata surfaces, one keyword

`metadata` is the same keyword whether it sits inside `item` or inside an `mcq`/`shorttext`/etc. chain. The compiler doesn't need to distinguish them: at the item level the AST puts `{metadata: {...}}` into the item record; at the question level it puts `{metadata: {...}}` into the question's attrs. Per-level field-name translation happens in `items.js` (item write) and `question-types.js` builders (question write), respectively.

### Inner attribute keywords

These are arity-2 attribute keywords used inside a `metadata` chain.

| DSL keyword | Type | Where it makes sense | Notes |
|---|---|---|---|
| `tags` | list of `"key:value"` strings | item-level | Each string splits on the first `:` into a Learnosity tag type and value. Multiple tags with the same type accumulate. Document the colon-split rule. |
| `difficulty` | string (`"easy"`/`"medium"`/`"hard"`) or integer | item-level | Implementer's call which canonical form to settle on; pick one and document. |
| `dok` | integer `1`–`4` | item-level | Webb's Depth of Knowledge. Conventionally surfaced as a tag at item level so the Author Site filters on it. |
| `notes` | string | both | Same keyword at item and question level; the parent context determines where it lands. |
| `distractor-rationale` | list of strings (one per option) or single string | question-level | List form maps to `metadata.distractor_rationale_response_level`; string form to `metadata.distractor_rationale`. |
| `acknowledgements` | string | question-level | Attribution. Maps to `metadata.acknowledgements`. |

### Trade-off worth flagging

Adding these keywords to the global `attributeFields` registry means they're technically valid anywhere in the language — `mcq tags [...] {}` would parse and the auto-gen Transformer would land `tags` directly on the question. That's not what we want (question-level tags don't index in the Author Site). Phase-1 stance: accept this trade-off, document the convention in `spec/user-guide.md` and `spec/instructions.md`, and rely on the translator's few-shot examples to teach correct usage. Phase-2 (separate ticket) could enforce nesting via a dedicated `METADATA` Checker that validates inner attributes against an allow-list per parent context.

### Decisions to write down in the PR

- **Tag format**: `"key:value"` strings vs. structured form like `tags [{type "NGSS" value "MS-LS1-2"} ...]`. Strings are friendlier for the LLM to emit; structured is safer if tag values can themselves contain colons. Pick one before merging.
- **Difficulty canonical form**: prose vs. integer. Either is fine; pick one.
- **List-vs-string for `distractor-rationale`**: support both, or list-only? List form is what publishers want for review-mode display.

---

## 3. Mapping to the Learnosity schema

### Item-level mapping (in `packages/api/src/items.js`)

The `buildCreateItems` function currently writes the item record with `reference`, `status`, `definition.widgets`, `dynamic_content_data`, `questions`. It needs to read `item.metadata` from the AST plain object and add the corresponding Learnosity fields to the item record:

| L0158 DSL | Learnosity item field (verify against Items API docs) |
|---|---|
| `metadata.tags[i] = "NGSS:MS-LS1-2"` | `item.tags["NGSS"]: ["MS-LS1-2", ...]` (object keyed by tag type) |
| `metadata.difficulty` | `item.metadata.difficulty` (or `item.tags["Difficulty"]` per publisher convention) |
| `metadata.dok` | `item.tags["DOK"]: ["2"]` (conventional; lets the Author Site filter on it) |
| `metadata.notes` | `item.metadata.note` |

The single-item assumption in `buildCreateItems` (`const [item] = items;`) is preserved — this change doesn't touch the multi-item TODO.

### Question-level mapping (in `packages/api/src/question-types.js` builders)

Each builder currently destructures known attrs and spreads `...rest` into the question record. Because `metadata` is a single attribute, it would land in `...rest` and be spread as a top-level field on the question — which is what Learnosity expects (questions have a top-level `metadata` field). Two refinements needed in each builder:

1. Explicitly destructure `metadata` from attrs and place it on `question.metadata` (rather than relying on `...rest`) — this lets the builder do field-name translation.
2. Translate DSL inner field names to Learnosity field names:

| L0158 DSL | Learnosity question field |
|---|---|
| `metadata.distractor-rationale` (list form) | `question.metadata.distractor_rationale_response_level` (array) |
| `metadata.distractor-rationale` (string form) | `question.metadata.distractor_rationale` |
| `metadata.acknowledgements` | `question.metadata.acknowledgements` |
| `metadata.notes` | `question.metadata.note` |

### Verify before wiring

The Learnosity item-metadata schema has multiple variants (Items API vs. Authoring API; field names differ across consumer versions). The current `buildCreateItems` POSTs to `/itembank/items` — that's the Items API. Confirm field paths against that variant's docs before merging. If a DSL field has no clean Learnosity equivalent, prefer `user_metadata` (free-form, exists at both item and question level) rather than inventing top-level fields.

---

## 4. Ordered implementation steps

Run `npx jest` from `packages/api/` after each step. The repo has no global lint command but `npm run -w packages/api lint` runs eslint on `src/` and `tools/`.

### 4.1 Lexicon — `packages/api/src/lexicon.js`

Add seven keyword entries (all arity 2, length 2, `cls: "function"`):

- `metadata` → `{name: "METADATA"}`
- `tags` → `{name: "TAGS"}`
- `difficulty` → `{name: "DIFFICULTY"}`
- `dok` → `{name: "DOK"}`
- `notes` → `{name: "NOTES"}`
- `distractor-rationale` → `{name: "DISTRACTOR_RATIONALE"}`
- `acknowledgements` → `{name: "ACKNOWLEDGEMENTS"}`

Each follows the existing pattern of arity-2 attribute keywords (compare to `instant-feedback` at lines 167–173 of the current file).

### 4.2 Attribute registry — `packages/api/src/question-types.js`

Add seven entries to `attributeFields` (lines 432–450):

```
METADATA: { field: "metadata", valueType: "any" },
TAGS: { field: "tags", valueType: "array" },
DIFFICULTY: { field: "difficulty", valueType: "any" },
DOK: { field: "dok", valueType: "number" },
NOTES: { field: "notes", valueType: "string" },
DISTRACTOR_RATIONALE: { field: "distractor_rationale", valueType: "any" },
ACKNOWLEDGEMENTS: { field: "acknowledgements", valueType: "string" },
```

Add `"metadata"` to every entry in `validAttributes` (lines 453–465). Inner attributes (`tags`, `difficulty`, `dok`, `notes`, `distractor-rationale`, `acknowledgements`) do not need to be in `validAttributes` — they're validated by the Checker auto-gen iff they're in `attributeFields`, which they will be.

After this step, `npx jest` should still pass (the changes are additive). The lexicon and registry changes alone do not affect existing programs.

### 4.3 Question builders — `packages/api/src/question-types.js`

In each `build*` function (lines 67–413), add explicit handling for `metadata`:

- Destructure `metadata` from attrs alongside the existing destructured fields.
- After constructing the base `question` record, if `metadata` is present, build `question.metadata` by translating DSL field names per §3's question-level table. List-form `distractor-rationale` becomes `distractor_rationale_response_level`; string-form becomes `distractor_rationale`. Pass `notes` as `note`. Pass `acknowledgements` through.
- Do *not* spread `metadata` directly via `...rest` — that would leave the DSL field names (`distractor-rationale` instead of `distractor_rationale_response_level`) in the Learnosity output.

### 4.4 Item write — `packages/api/src/items.js`

In `buildCreateItems` (line 29), the destructured `item` already has `templateVariablesRecords` and `questionRefs`. Add `metadata` to the destructure. If present, build the Learnosity item-level fields per §3's item-level table:

- Translate `metadata.tags` (list of `"key:value"` strings) into `tags` (object keyed by tag type) on the item record.
- Place `metadata.difficulty`, `metadata.dok`, `metadata.notes` per the chosen convention.

The item record currently has only `{reference, status, definition, dynamic_content_data, questions}` (lines 66–74). Add `tags` and `metadata` siblings as needed.

### 4.5 Tests — `packages/api/src/question-types.spec.js`

Add tests in the existing `describe("question-types", () => {...})` block:

- `buildMcq` with full metadata produces `question.metadata.distractor_rationale_response_level` as an array.
- `buildMcq` with single-string `distractor-rationale` produces `question.metadata.distractor_rationale` as a string.
- `buildMcq` with no metadata produces a question with no `metadata` field (regression guard — must be byte-identical to today's output).
- Repeat the no-metadata regression check for at least one other type (e.g., `buildShorttext`) to confirm the spread didn't accidentally add a `metadata: undefined` field.

### 4.6 Tests — `packages/api/src/compiler.spec.js`

Add at least one end-to-end program that exercises both metadata levels:

```js
test("item with item-level metadata and question-level distractor rationale", async () => {
  const src = `
    items [
      item
        metadata
          tags ["NGSS:MS-LS1-2"]
          difficulty "medium"
          dok 2
          {}
        questions [
          mcq
            stimulus "test"
            options ["a" "b" "c" "d"]
            valid-response [0]
            metadata
              distractor-rationale ["correct" "wrong-1" "wrong-2" "wrong-3"]
              {}
            {}
        ]
        {}
    ]..`;
  const result = await compile(src);
  // assert on shape — confirm metadata reached both levels
});
```

The existing `compile` helper (lines 12–34 of the file) exercises lexicon + parser + compiler + builders end-to-end without hitting Learnosity. Note that this test exercises the AST/compile path; it does *not* exercise `buildCreateItems`'s call to `dataApi`, since that requires `LEARNOSITY_KEY` / `LEARNOSITY_SECRET`. Item-level metadata reaching the wire is covered by §5.3.

### 4.7 Spec — `packages/api/spec/spec.md`

Add a new row to the "Attribute Keywords" table for `metadata`. Add a new subsection documenting the inner attribute keywords (`tags`, `difficulty`, `dok`, `notes`, `distractor-rationale`, `acknowledgements`) and noting that they're conventionally used inside a `metadata` block.

### 4.8 Instructions — `packages/api/spec/instructions.md`

Add a new section after "Question Type Templates" titled "Metadata":

- Show the chained `metadata ... {}` syntax with both item-level and question-level examples (use the §2 mitochondria example).
- Document the colon-split rule for `tags` (`"NGSS:MS-LS1-2"` → tag type `NGSS`, value `MS-LS1-2`).
- Note that `metadata` blocks are optional and may appear at either level.

This is the file the translator AI sees — these examples directly shape what the translator emits. Without this change, the lexicon and compiler would support metadata but the translator wouldn't know to use it.

### 4.9 User guide — `packages/api/spec/user-guide.md`

The "Vocabulary Cues" section already promises tag/standards support (line 44). Add a new section after "Vocabulary Cues" titled "Metadata":

- Briefly explain the two-level model (item-level for searchable tags, question-level for distractor rationale).
- Show one full example (the mitochondria item with both levels).
- Update the existing "Example Prompts" section: the first prompt already includes "Tag with NGSS MS-LS1-2. Difficulty: medium." — add a parenthetical confirmation that this now produces an item-level metadata block.

Important: the `## Overview` section is build-injected as `authoring_guide` (see `tools/build-language-info.js`). Updating Overview will change what the MCP returns. Add one sentence to Overview: *"Item-level metadata (tags, difficulty, DOK) and question-level metadata (per-distractor rationale, acknowledgements) are both supported via a `metadata` block at the relevant level."*

### 4.10 Examples — `packages/api/spec/examples.md`

Add a new category at the end (call it "Category 12: Metadata and Tagging (101–110)") with 10 prompts that exercise:

- Item-level standards tagging (NGSS, CCSS).
- Item-level difficulty and DOK.
- Per-option distractor rationale on MCQ.
- Question-level acknowledgements.
- Combined: one item with both item-level tags and question-level distractor rationale.
- A round-trip case: an existing item, modified to change only the stem, with metadata preserved (this trains the translator not to drop metadata when asked for an unrelated edit — critical for the round-trip acceptance criterion).

### 4.11 language-info.json — `packages/api/spec/language-info.json`

Already populated with the metadata-bearing first example. No changes required unless a new example is needed for the question-level metadata story; consider adding:

```json
{
  "prompt": "MCQ on the function of mitochondria with 4 options. Distractors should match common organelle misconceptions. Add a one-line distractor rationale per option explaining the misconception. Tag with NGSS MS-LS1-2.",
  "produces": "mcq",
  "notes": "Exercises both item-level tagging and question-level distractor rationale — the killer feature for the Learnosity Author Site review pane."
}
```

---

## 5. Acceptance criteria (verifiable)

All five must pass.

1. **Unit tests.** `npx jest packages/api/src/question-types.spec.js` passes, including the new metadata cases from §4.5. The no-metadata regression test confirms existing behavior is byte-identical.

2. **Compiler test.** `npx jest packages/api/src/compiler.spec.js` passes, including the new end-to-end metadata test from §4.6. The compiled value contains `metadata` at both the item and question levels with the expected shape.

3. **Backend write — item bank.** With `LEARNOSITY_KEY` and `LEARNOSITY_SECRET` set, compile a metadata-bearing fixture and inspect the request body sent to `/itembank/items`. Confirm:
   - Item-level: `tags["NGSS"]` contains `"MS-LS1-2"`, `metadata.difficulty` matches the DSL, DOK appears at its mapped path.
   - Question-level: `data.metadata.distractor_rationale_response_level` is an array of four strings matching the DSL list.
   - No leakage: item-level fields do not appear on the question record, and question-level fields do not appear on the item record.

4. **Translator.** Through the live MCP, send `create_item("L0158", "Create a 4-option MCQ on the function of mitochondria. Distractors should match common misconceptions, and add a one-line rationale for each. Tag with NGSS MS-LS1-2, difficulty medium, DOK 2.")`. The returned `src` contains both an item-level `metadata` block (tags, difficulty, DOK) and a question-level `metadata` block with a populated `distractor-rationale` list. This is the smoke test from the prior conversation expanded to cover both levels.

5. **Round-trip.** After step 4, send `update_item(item_id, "Make the stem shorter and clearer.")`. The returned `src` shows the stem changed and *both* `metadata` blocks unchanged. Diff `get_item(item_id).src` before and after to confirm.

---

## 6. Don't touch

- `graffiticode-mcp-server` — already updated; no MCP-side changes for this feature. The MCP passes `src` and `help` history through transparently.
- The console-side language-info plumbing — already updated to surface `examples`, `authoring_guide`, `supported_item_types`, `example_prompts`. Updates to `packages/api/spec/language-info.json` and `packages/api/spec/user-guide.md` flow through that plumbing on their own (via the build pipeline in `tools/`).
- `packages/api/src/compiler.js` — the auto-generation loops at lines 119–140 (Checker) and 322–346 (Transformer) do all the work for new attribute keywords. No code change to `compiler.js` itself — the new keywords get handlers automatically once they're in `attributeFields`. **Don't add hand-written `METADATA(node, options, resume)` methods unless you discover a bug the auto-gen can't handle.**
- The `ITEM` Transformer (lines 220–227) — currently passes its single arg through unchanged. No change needed; the `metadata` attribute attaches via the `questions` chain alongside it, and `ITEM` propagates the whole record.
- Other Graffiticode languages. Each has its own DSL surface; metadata for L0153, L0159, L0166, L0169, L0171, L0172 is a separate ticket per language.
- Learnosity's own systems. The metadata write goes through the existing `dataApi` POST to `/itembank/items` and `/itembank/questions`; this change adds fields to existing payloads, not new endpoints or auth.
- Existing items already in publishers' item banks. Migration is forward-only — old items stay valid with no metadata. Don't backfill.
- `packages/app` (the React frontend) and Storybook. Item rendering doesn't need to change; the Form component already passes through whatever is in the compiled item.
- `tools/build-language-info.js` — the validation that rejects `authoring_guide` in the source `language-info.json` is intentional. Do not bypass.

---

## 7. Known unknowns

- **Tag format with embedded colons.** If a publisher uses tag values containing `:` (e.g., `"Common Core:Math:6.NS.A.1"`), the colon-split rule needs to be split-on-first-only or switched to a structured form. Test with at least one colon-bearing value before merging.
- **Difficulty per publisher.** Publishers vary on conventions (`"easy"/"medium"/"hard"` vs. integer 1–5 vs. `"Beginning/Developing/Proficient/Advanced"`). The DSL accepts a string or integer; document in `user-guide.md` that L0158 passes the value through opaquely — whatever the prompt says ends up in the item.
- **DOK as tag vs. metadata field.** The `Difficulty` and `DOK` Learnosity tag types are publisher-configurable. Confirm with whoever owns the partner publisher's Learnosity setup which form their Author Site filters on; the §3 mapping defaults to `tags["DOK"]` because that's the more commonly searchable form.
- **`distractor_rationale_response_level` array length.** Learnosity expects the array length to equal the number of options. Mismatch is technically valid JSON but functionally broken (the player won't show rationale for missing entries, or will show the wrong one for extras). The compiler should warn on length mismatch in a future ticket; phase 1 just relies on the translator to get it right.

---

## 8. Commit guidance

Multi-commit branch (the change is too large for a single commit). Suggested sequence:

```
feat(l0158): add metadata block keywords to lexicon and registry
feat(l0158): emit item-level metadata to Learnosity item write
feat(l0158): emit question-level metadata to Learnosity question record
test(l0158): metadata coverage in question-types and compiler specs
docs(l0158): document metadata syntax in spec, instructions, user guide, examples
```

Each commit should leave `npx jest` green. Do not push. Do not amend prior commits. Open the PR as draft until §5 acceptance criteria all pass; only then mark ready for review.

---

## 9. Local verification recipe

```bash
cd ~/work/graffiticode/l0158/packages/api

# 1. Unit tests for builders
npx jest src/question-types.spec.js

# 2. End-to-end compile tests
npx jest src/compiler.spec.js

# 3. Full test suite
npx jest

# 4. Lint
npm run -w packages/api lint

# 5. Build the language-info envelope (ensures docs round-trip)
node tools/build-language-info.js
cat dist/language-info.json | jq '.authoring_guide' | head -20
# expected: the new sentence about metadata is in the authoring_guide

# 6. Build the instructions for the translator
node tools/build-instructions.js > /tmp/l0158-instructions.md
grep -n "Metadata" /tmp/l0158-instructions.md
# expected: the new Metadata section is present

# 7. End-to-end through the live MCP (requires Graffiticode backend running
#    and the MCP server connected). From the conversation harness, send:
#
#    create_item("L0158",
#      "Create a 4-option MCQ on the function of mitochondria. Distractors
#       should match common misconceptions, and add a one-line rationale for
#       each. Tag with NGSS MS-LS1-2, difficulty medium, DOK 2.")
#
#    Confirm the returned `src` contains a `metadata` block at both
#    item and question levels.

# 8. Round-trip
#    update_item(<item_id>, "Make the stem shorter and clearer.")
#    Confirm `src` shows the stem changed and both metadata blocks unchanged.

# 9. (Optional, requires Learnosity creds) Open the item in the Learnosity
#    Author Site and confirm the tags/difficulty/DOK appear in the search
#    facets and the per-option distractor rationale appears in the question
#    review pane.
```

If any §5 criterion fails, do not merge. If the translator (criterion 4) drops metadata or puts it at the wrong level, the most likely cause is missing or insufficient examples in `spec/examples.md` and `spec/instructions.md` — strengthen those before re-testing rather than hand-tuning the prompt.

---

## 10. Demo implication

Two beats unlock once this lands.

**Item-level tagging — the search-and-filter visual.** Priya asks Cowork *"For each of these 10 items, tag them to the right NGSS standard from the chapter blueprint and set difficulty based on the cognitive demand."* Cowork composes the prompts, L0158 emits item-level metadata, the items land in Learnosity's item bank already searchable. The visual is the Learnosity Author Site filter dropping items into the right NGSS bucket *without anyone exporting or re-tagging* — distinguishing Graffiticode from "AI item generator" tools that produce untagged JSON.

**Per-option distractor rationale — the pedagogical-quality visual.** This is the more powerful beat. The mitochondria-MCQ smoke test already produces distractors that are pedagogically sharp (each maps to a named organelle misconception). With question-level `distractor-rationale`, Priya can ask *"add a one-line rationale to each distractor explaining the misconception"* and the Author Site review pane shows the *teaching intent* alongside the item. The argument lands without narration: this isn't an LLM generating items, it's an authoring layer that captures editorial reasoning the way a content editor would. That's the moment that converts Learnosity management from "interesting tool" to "we should partner."

---

## Appendix A — Paste-ready spec content

The drafts below are intended to be copy-pasted (or lightly tailored) into the corresponding spec files in §4.7–§4.11. They match the existing voice of each file. CC should not invent its own copy when these are present.

### A.1 — `packages/api/spec/instructions.md` — new "Metadata" section

Insert this section after "Question Type Templates" and before any later section. Match the H2/H3 heading depth of the surrounding file.

````markdown
## Metadata

L0158 supports a `metadata` block at two levels: on `item` (for fields the
Learnosity Author Site indexes for search) and on each question constructor
(for fields that travel with the interaction). Both are optional and can
appear independently — items without metadata work exactly as before.

The `metadata` block is itself a chained record built from inner attribute
keywords terminated by `{}`, the same pattern as a question record. There is
no record-literal syntax to learn.

### Item-level metadata

Place a `metadata` block alongside `questions` inside an `item` chain. These
inner attribute keywords are recognized:

- `tags` — list of `"key:value"` strings; each splits on the first `:` into a
  Learnosity tag type and value (e.g., `"NGSS:MS-LS1-2"` becomes tag type
  `NGSS` with value `MS-LS1-2`).
- `difficulty` — string (`"easy"`, `"medium"`, `"hard"`) or integer 1–5.
- `dok` — integer 1–4 for Webb's Depth of Knowledge.
- `notes` — author-facing note attached to the item.

```
items [
  item
    metadata
      tags ["NGSS:MS-LS1-2" "topic:cellular-respiration"]
      difficulty "medium"
      dok 2
      notes "Variant A of the organelle misconception set"
      {}
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

### Question-level metadata

Place a `metadata` block inside any question constructor's chain, alongside
`stimulus`, `options`, etc. These inner attribute keywords are recognized:

- `distractor-rationale` — list of strings, one per option (preferred) or a
  single string for whole-question rationale.
- `acknowledgements` — attribution string.
- `notes` — author-facing note attached to the question (distinct from the
  item-level note).

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
  metadata
    distractor-rationale [
      "Correct — ATP production via cellular respiration."
      "That's the role of the cell membrane."
      "That's the role of ribosomes."
      "That's the role of the nucleus."
    ]
    notes "Targets the three most common organelle confusions."
    {}
  {}
```

### Both levels in one item

```
items [
  item
    metadata
      tags ["NGSS:MS-LS1-2"]
      difficulty "medium"
      dok 2
      {}
    questions [
      mcq
        stimulus "..."
        options [...]
        valid-response [0]
        metadata
          distractor-rationale ["..." "..." "..." "..."]
          {}
        {}
    ]
    {}
]..
```

### Conventions

- **Tag values with a literal colon** (e.g., `"Common Core:Math:6.NS.A.1"`)
  should be wrapped: only the first colon is the type/value split, so the
  example above becomes type `Common Core` with value `Math:6.NS.A.1`.
- **Distractor-rationale list length** should match the number of options.
- **Use item-level metadata for searchable fields** (tags, difficulty, DOK).
  The Author Site only filters on item-level tags. Tags placed on a question
  are silently invisible to search.
- **Use question-level metadata for per-interaction fields**
  (`distractor-rationale`, `acknowledgements`, question `notes`). These
  travel with the question if it is reused in a different item.
````

### A.2 — `packages/api/spec/user-guide.md` — three updates

#### A.2.1 Update `## Overview` (build-injected as `authoring_guide`)

Append one sentence to the existing Overview paragraphs. Place after the
"In scope / Out of scope" sentence at the end of the section:

> Item-level metadata (tags, difficulty, DOK) and question-level metadata
> (per-distractor rationale, acknowledgements) are supported via a `metadata`
> block at the relevant level — describe tags, difficulty, and per-option
> rationale in plain English and L0158 attaches them to the right level
> automatically.

#### A.2.2 Update `## Vocabulary Cues` — refine the tags entry

Replace the existing bullet:

> - **Tags / standards** — NGSS, CCSS, Bloom's level, difficulty — mention
>   them by their conventional names and L0158 will attach them as metadata.

With:

> - **Tags / standards** — NGSS, CCSS, Bloom's level — mention them by their
>   conventional names (e.g., "NGSS MS-LS1-2", "CCSS 6.NS.A.1") and L0158
>   attaches them at the item level so the Learnosity Author Site can filter
>   on them.
> - **Difficulty / DOK** — describe difficulty in plain English ("medium",
>   "hard") or numerically (1–5); for Depth of Knowledge use the integer
>   1–4. Both attach at the item level.
> - **Distractor rationale** — for MCQ, ask for "a one-line rationale per
>   distractor" or "explain why each wrong answer is wrong". L0158 attaches
>   these at the question level so the Author Site review pane shows the
>   teaching intent alongside the item.

#### A.2.3 Add `## Metadata` section after `## Vocabulary Cues` and before `## Example Prompts`

```markdown
## Metadata

L0158 attaches metadata at two levels.

**Item-level metadata** is what the Learnosity Author Site indexes for search
and filtering. Standards tags (NGSS, CCSS, custom taxonomies), difficulty,
and DOK go here. Mention them in the prompt and L0158 attaches them to the
item record.

**Question-level metadata** travels with the individual interaction if it
is reused. The headline field is per-distractor rationale on MCQ — when you
ask for "a one-line rationale per distractor", L0158 emits these as
question-level metadata that the Author Site shows in the review pane.

You usually do not need to think about which level is which — describe what
you want in plain English and L0158 places the metadata at the level that
makes it useful. Example: *"Create a 4-option MCQ on the function of
mitochondria. Distractors should match common misconceptions, and add a
one-line rationale per distractor explaining the misconception. Tag with
NGSS MS-LS1-2, difficulty medium, DOK 2."* — produces an item with
NGSS/difficulty/DOK at the item level and per-option rationale at the
question level.
```

#### A.2.4 Update `## Example Prompts` — append two metadata-bearing prompts

Add to the existing list:

> - *"Create an MCQ on the function of mitochondria with four options.
>   Distractors should match common misconceptions, and add a one-line
>   rationale per distractor. Tag with NGSS MS-LS1-2, difficulty medium,
>   DOK 2."* → `mcq` with item-level NGSS/difficulty/DOK and question-level
>   `distractor_rationale_response_level`
> - *"Update item-id <X>: change the stem to be shorter and clearer, but
>   keep all the existing tags and rationale."* → preserves both metadata
>   blocks; only the stem changes

### A.3 — `packages/api/spec/examples.md` — new Category 12

Append at the end of the file:

```markdown
## Category 12: Metadata and Tagging (101–110)

101. Create a multiple choice question asking "What is the primary function of the mitochondria?" with four options where "ATP production" is correct, and tag the item with NGSS MS-LS1-2 and difficulty medium.
102. Create a short text question asking "What is the chemical symbol for water?" with the correct answer "H2O", and tag the item with CCSS 5-PS1-1, difficulty easy, DOK 1.
103. Create a cloze dropdown question with the template "The {{response}} is the powerhouse of the cell" with options "mitochondria", "nucleus", "ribosome" where mitochondria is correct, and tag the item with difficulty medium and DOK 2.
104. Create a multiple choice question asking "What is the function of the cell membrane?" with four options where "control what enters and exits" is correct, and add a one-line distractor rationale per option explaining each misconception.
105. Create a multiple choice question asking "Who painted the Mona Lisa?" with four options where "Leonardo da Vinci" is correct, with question-level acknowledgements "Image courtesy Louvre Museum, public domain".
106. Create an items assessment with a multiple choice question on photosynthesis with four options where "produces glucose and oxygen" is correct, distractors that match common misconceptions, a one-line rationale per distractor, and tag the item with NGSS MS-LS1-6, difficulty hard, DOK 3.
107. Create a choice matrix question asking "Classify each statement" with rows "The sun is a star" and "The moon is a planet" and columns "True" and "False", tag the item with NGSS MS-ESS1-2 and difficulty easy, and add per-row rationale explaining the correct classification.
108. Create a classification question asking "Sort animals by class" with categories "Mammals" and "Reptiles" and items "dog, snake, cat, lizard", tag the item with NGSS MS-LS4-2 and difficulty medium, and add an item-level note "Variant for the genetics unit; pair with the inheritance MCQ".
109. Update the existing item with id <ITEM_ID>: change the stem to be shorter and clearer, but keep all the existing tags, difficulty, DOK, and per-option distractor rationale unchanged.
110. Update the existing item with id <ITEM_ID>: keep the stem and options unchanged, but change the difficulty tag from medium to hard and update DOK from 2 to 3 — leave the distractor rationale alone.
```

Examples 109 and 110 are **load-bearing for the round-trip acceptance criterion** in §5.5. Without them the translator may drop metadata when asked for an unrelated edit. Don't omit either.

### A.4 — `packages/api/spec/language-info.json` — new `example_prompts` entry

Append to the `example_prompts` array (after the existing six entries):

```json
{
  "prompt": "Create a 4-option MCQ on the function of mitochondria. Distractors should match common organelle misconceptions, and add a one-line rationale per distractor explaining the misconception. Tag with NGSS MS-LS1-2, difficulty medium, DOK 2.",
  "produces": "mcq",
  "notes": "Exercises both item-level metadata (NGSS/difficulty/DOK lands on the item record so the Author Site filters on it) and question-level metadata (distractor_rationale_response_level lands on the question so the Author Site review pane shows the teaching intent per option). The killer combo for the partner pitch."
}
```

This is the only `language-info.json` change required. The first existing
example prompt already says *"Tag with NGSS MS-LS1-2. Difficulty: medium."*
— after the metadata feature lands, that prompt produces the correct item
without further changes.
