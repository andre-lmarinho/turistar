# PR Description Generation Prompt

You will receive context about a Pull Request, such as the title, description, files changed, or a diff summary. Your task is to generate a **Pull Request description** that matches the style, structure, and tone of the provided examples. Output must be **Markdown only**—no explanations, meta comments, or leaked instructions.

## Structure (in this exact order)

### 1. ## What does this PR do?
- Write **1–3 concise sentences**.
- Describe **intent and impact**, not implementation.
- Focus on _what changed_ and _why it matters_.
- Avoid repeating the title or filler phrases.
- Omit if a meaningful summary can’t be produced from available context.

### 2. **Key changes:**
- Use Markdown `-` bullets only.
- Each bullet describes a single, concrete change.
- Bullets must be **short, specific, and verifiable**.
- Avoid vague verbs (e.g. “improve,” “refactor,” “cleanup”) unless paired with a concrete outcome.
- Do not include commands or instructions here.
- Omit this section if no substantive changes exist.

### 3. ## How should this be tested?
- Start with a contextual sentence about what changed.
- Then provide either:
  - A short review-paragraph, **or**
  - An ordered list of checks (`1.`, `2.`, ...).
- List only specific checks; use concise verbs (e.g. verify, check, inspect, ensure).
- Do not use placeholders or setup notes unless critical.

#### Patterns
- For docs-only: “This is a documentation-only change.” + review steps.
- For refactors: focus on boundaries, ownership, or invariants.
- For tooling/CI: focus on behavior changes before vs after.

### 4. ## Notes (optional)
- Include only if reviewer needs important context (e.g. trade-offs, follow-ups, major behavior changes).
- Omit if not needed.

## Output Constraints
- Markdown only; do not rename headings.
- Preserve **Key changes:** exactly.
- No instructional comments or placeholders.
- Follow example tone: brevity, clarity, practical verifiability, reviewer-oriented.

---

## Output Format

Produce a Markdown document with sections in this order:

1. `## What does this PR do?` (required; omit only if context is insufficient)
2. `Key changes:` (required if substantive changes exist)
3. `## How should this be tested?` (required)
4. `## Notes` (optional; include only if reviewer-critical context exists)

If you cannot generate required section content due to missing context, omit that section (except `## How should this be tested?`, which must always be included with best-effort content).

### Example

```
## What does this PR do?
Summarizes the purpose and impact of the PR in 1–3 brief sentences.

Key changes:
- Add widget X to the dashboard
- Remove deprecated endpoint `/api/old`
- Update test coverage thresholds

## How should this be tested?
Widget X should now appear on the main dashboard. Reviewers should:
1. Verify widget X is visible after login
2. Check the `/api/old` endpoint is no longer accessible
3. Observe test suite passes with updated coverage thresholds

## Notes
Legacy support for `/api/old` is removed. Follow-up work is scheduled for further cleanup.
```
