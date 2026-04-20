# Graffiticode × Learnosity — 5-Minute Recorded Teaser

**Audience:** Learnosity management (VP Partnerships / Head of Product / CEO-tier).
**Goal of the video:** earn a 30-minute follow-up conversation about adding Graffiticode to the Learnosity partner program.
**Form:** async recorded video, sent as a link in an email. No Q&A, no live pressure.
**Length:** 5 minutes hard cap. Ideal runtime 4:30.

The teaser is not the pitch. The email body is the pitch; this video is the demo that makes the pitch credible.

---

## 1. Structural budget

| Section | Runtime | What it does |
|---|---|---|
| Cold open | 0:00 – 0:20 | One visual + one line. Earn the first 30 seconds. |
| Problem framing | 0:20 – 0:50 | Why publishers and Learnosity both have a gap that raw LLM tools don't close. |
| Demo arc | 0:50 – 3:30 | One item, end-to-end: authored in Cowork → lands in the Learnosity Author Site with metadata and per-option rationale. The whole case rides on this beat. |
| Why this matters to Learnosity | 3:30 – 4:15 | Partner-program argument in 45 seconds, zero hedging. |
| The ask | 4:15 – 4:40 | One sentence. One callback. |
| Close | 4:40 – 5:00 | Logo card, email on screen, 10-second beat. |

Total: 5:00. If you're running long, cut from the demo arc (drop the round-trip edit beat at 2:45) — never cut the ask.

---

## 2. Cold open (0:00 – 0:20)

### Visual

Black screen. One second. Then cut to the Learnosity Author Site item-bank list view, fully populated with a publisher's items. Filter rail on the left shows NGSS, DOK, Difficulty facets populated.

### Narration (A — recommended)

> Your publisher customers are all trying to use AI to author items right now. Most of what they're producing won't pass your QA bar. Here's what's different.

### Narration (B — punchier, use if the opening image is strong enough to carry the pause)

> This is a Learnosity item bank. Every item you see was authored in under a minute. None of them needed a human to tag them.

### Notes

Cold open must be one sentence, max fifteen words. The first three seconds of silence over the item bank image are doing as much work as the line itself. Don't let a presenter's face appear before the line lands.

---

## 3. Problem framing (0:20 – 0:50)

### Visual

Split screen, held for the full 30 seconds. Left: an LLM-generated Learnosity item JSON, scrolling, with red underlines over missing tags, missing distractor rationale, and a "status: draft — needs review" banner. Right: a publisher's QA workflow diagram (simple, three boxes: "AI draft → Human QA → Author Site") with the middle box highlighted in red.

### Narration

> The publisher's problem is throughput. They want AI to cut the six-week item-authoring cycle down to days. But raw LLM output drops the metadata, fakes the distractors, and lands in draft with no standards tags and no rationale. Every item eats a human review cycle before it's safe for the item bank. Your problem is that this is happening to every publisher in your pipeline — and the "AI authoring" story is settling without you in it.

### Notes

30 seconds is tight for three claims. Trim aggressively in editing. The middle-box-highlighted diagram is the visual spine; the narration is the voice-over. Keep the LLM-JSON scroll slow enough to read two or three field names.

---

## 4. Demo arc (0:50 – 3:30)

This is the beat the whole video rides on. One item, one path, two on-screen products (Cowork + Learnosity Author Site), three visible deliverables (item exists, item is tagged, item has per-option rationale).

### 4.1 Screen A — Cowork request (0:50 – 1:20)

**Visual.** Cowork chat pane. User types the request; hit send. Response streams in. Don't speed up the typing — it has to feel real.

**Prompt on screen, verbatim:**

> Create a 4-option MCQ on the function of the mitochondria. One correct answer. Distractors should match common organelle misconceptions, and add a one-line rationale per distractor. Tag with NGSS MS-LS1-2, difficulty medium, DOK 2.

**Narration (over the streaming response):**

> A content editor at one of your publishers types this. Not a developer, not a prompt engineer. They describe the item in the language they use with their team — standard, difficulty, DOK, distractor intent.

### 4.2 Screen A — Graffiticode source reveal (1:20 – 1:40)

**Visual.** Cowork response shows the L0158 source. Hold for 8 seconds so the structure is legible. Highlight (with a soft box) the `metadata` blocks at both the item level and the question level.

**Narration:**

> What Cowork generated isn't the item itself — it's a typed, reviewable source in a language built for Learnosity. Every piece the editor asked for has a place in the source. Nothing got invented. Nothing got silently dropped.

**Notes.** The source reveal is the trust move. If the audience doesn't see the intermediate representation, the rest of the demo could be raw LLM magic. Don't cut this beat even if you need to trim elsewhere.

### 4.3 Screen transition (1:40 – 1:50)

Snap cut — no animation — to the Learnosity Author Site, item-bank list view. The new mitochondria item is already in the list, timestamped "just now."

**Narration:**

> No export. No import. No paste. The item was written straight into the publisher's Learnosity item bank through your own Items API.

### 4.4 Screen B — Item bank, filter rail (1:50 – 2:20)

**Visual.** Click the NGSS facet in the filter rail. `MS-LS1-2` checkbox. The list filters down; the new item stays. Then also filter by DOK: 2. The list narrows further; the item is still there.

**Narration:**

> The item is tagged — NGSS MS-LS1-2, DOK 2, Difficulty medium — and the filter rail finds it on the first click. Tags aren't a separate tagging pass. They're born with the item.

**Notes.** The filter-rail click is the "lives in Learnosity" visual proof. If the audience's Author Site doesn't have these facets configured, the filter won't respond — pre-configure the demo tenant or use a mocked Author Site (see §7).

### 4.5 Screen B — Item review pane (2:20 – 3:00)

**Visual.** Open the mitochondria item in the Author Site's item detail view. Scroll to the question's metadata panel. The per-option distractor rationale is visible, one line per option, each explaining the named misconception.

**Narration:**

> And this is the one that matters to your content-quality reviewers. Every distractor has a one-line rationale that names the misconception the option is designed to surface. This isn't an LLM guessing at wrong answers. It's an authoring layer that captures editorial reasoning the way a content editor would — visible to your publisher's QA team, in your Author Site's review pane, from the moment the item is written.

**Notes.** This is the beat that converts Learnosity management. Let the narration breathe over the visible rationale — give the viewer time to read at least two of the four lines. Do not zoom or pan during this moment; stillness is the point.

### 4.6 Screen A — Round-trip edit (3:00 – 3:30)

**Visual.** Back to Cowork. New message: *"Make the stem shorter and clearer."* Stream the response. Snap-cut back to the Author Site item detail view — stem has changed, tags are unchanged, rationale is unchanged.

**Narration:**

> And when the editor wants to revise, she describes the revision. The stem tightens. The tags stay. The rationale stays. Everything the QA team already approved is still approved.

**Notes.** The round-trip beat is what makes this a durable workflow vs. a one-shot generation demo. If time is tight, cut this — but the video weakens. Better to trim the problem framing by 10 seconds.

---

## 5. Why this matters to Learnosity (3:30 – 4:15)

### Visual

Return to the Author Site item-bank list view from Screen B. Over 45 seconds, the list populates with ~10 more items that appear one at a time, each tagged, each from Cowork. Background, not the subject — keep the visual quiet under the narration.

### Narration

> Every item your publishers write through Graffiticode is a Learnosity item from birth. Not a JSON export your data team has to reconcile, not a migration task — a searchable, tagged, reviewable item inside your platform. For a publisher that means a six-week cycle compresses to an afternoon. For Learnosity it means every authoring session is item-bank volume inside your pricing model, and the "AI authoring" story stays attached to your platform instead of drifting to raw-LLM tools that bypass you. That's why this is a partner-program conversation, not a vendor conversation.

### Notes

45 seconds is one paragraph. Memorize, don't read. The three sentences are a ladder: publisher benefit → Learnosity benefit → partner-program framing. Don't collapse them.

---

## 6. The ask (4:15 – 4:40)

### Visual

Cut to a plain card: title "Partnership exploration" and three bullets:

- Authoring partner category in the Learnosity partner program.
- One reference-customer pilot with a flagship publisher.
- Thirty-minute follow-up call.

### Narration

> I'm asking for one thirty-minute call to scope Graffiticode as an authoring partner in the Learnosity partner program — not an AI partner, an authoring partner. One reference publisher for a joint pilot, and the commercial shape we both need to make it stick. My calendar link is in the email.

### Notes

Say "I'm asking for" — not "we'd love to" or "it'd be great to." Direct ask. Name the category ("authoring partner") twice — once to propose, once to distinguish. The reference-publisher bullet is what turns this from a vendor pitch into a GTM conversation.

---

## 7. Production notes

### What must be pre-built

- **Demo Learnosity tenant** with a publisher-style configuration: at minimum, tag types for `NGSS Standard`, `DOK`, and `Difficulty` configured so the filter rail shows them as facets. Without this, §4.4 has no payoff.
- **Sandboxed publisher item bank** with ~15 pre-existing items (so the "already populated" visuals in the cold open and §5 are real).
- **Cowork session** configured with Graffiticode MCP connected and L0158 known to work end-to-end against the tenant.
- **Visual assets**: LLM-JSON-with-red-underlines image for §3; plain ask card for §6; logo/email close card for §7.

### What runs live vs. pre-recorded

- **Cowork typing and streaming responses** — record live on the day, in a single take, with the demo tenant already primed. Live streaming is more trust-building than a pre-rendered screen recording.
- **Author Site responses to clicks** — record live against the tenant. If the API latency is ever >2 seconds, mock the response (see below).
- **Scripted narration** — record separately in a clean voice-over session, not live over the demo. Mix in post.

### Fallback if the Learnosity API is slow or flaky

Record the Author Site screens against a mocked consumer (local HTML mirror of the Author Site filter rail and item detail view, dressed to match). Legitimate for a recorded teaser because the claim is about the *integration pattern*, not the specific latency on a given day. Flag this in the editing notes so nothing gets approved that implies a live response when it isn't.

### What absolutely cannot break

- The per-option distractor rationale must be visible and readable for at least 6 seconds in §4.5. Test the readability on a laptop screen, not a monitor.
- The round-trip edit in §4.6 must show zero change to tags and rationale. Do a full take if there's any drift.
- The ask card in §6 must stay on screen for the full 25 seconds — shorter cuts read as uncertain.

### Pre-recording checklist

Before committing to a take, confirm:

1. MCP connected to the L0158 backend, verified with a dry-run `create_item` 10 minutes before record.
2. Author Site tenant configured with all three tag-type facets visible.
3. At least 15 items pre-populated in the item bank so list views look lived-in.
4. The mitochondria prompt produces an item with item-level tags AND per-option rationale (run once, throw away the item, record the second run).
5. Clock sync between screens if two-up is used — record separate streams and edit in post rather than split-screen live.

---

## 8. Copy variants to A/B before locking

- **Cold open** — Variant A (*"Most of what they're producing won't pass your QA bar"*) is sharper and likely better. Variant B works if the opening visual is strong enough to earn the pause.
- **The "authoring partner" framing** — also usable in the email subject line: *"A Learnosity authoring partner, not another AI vendor."*
- **Round-trip narration** — the current *"Everything the QA team already approved is still approved"* is the strongest line in the script. Consider moving it later (e.g., as a close) if you cut §4.6.

---

## 9. What the email body does (so the video doesn't have to)

Because this video leads with the demo and ends with the ask, the email body carries the framing the video skips:

- Who you are and what Graffiticode is (two sentences, not a pitch).
- Why Learnosity's partner program is the right home (one sentence).
- The commercial shape you're ready to discuss (one sentence — revenue share + co-marketing + joint reference).
- Calendar link.

A five-minute video + a five-sentence email is the package. Don't let either try to carry the other's weight.

---

## 10. Open questions (flag before recording)

- Do we use a real Learnosity demo tenant or a mocked Author Site for the video? Affects §7 production notes and the "runs live" claim.
- Who narrates — Jeff, a Priya-style persona, or a third-party voice-over? Narration tone in §4 assumes a presenter-as-expert voice, not a publisher-as-customer voice. If we go persona, the script needs a light rewrite to first-person.
- Is the reference-publisher ask concrete (i.e., we have a publisher ready to pilot) or exploratory? Concrete is stronger in §6 — "We have a flagship publisher already interested in piloting" is the killer version of that line.
