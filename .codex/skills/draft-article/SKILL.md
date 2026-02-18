---
name: draft-article
description: Create a new blog post draft via the Bhart Blog Automation API when the user provides a subject and thoughts for the article. Use for requests to draft, outline, or publish a new post (not edits) and when you need to format the draft in the house writing style and submit it as a draft.
---

# Draft Article

## Overview

Create a new post draft from a subject and raw thoughts, following the house writing style and the Blog Automation API workflow.

Load `references/agents.md` before generating or submitting drafts.

## Workflow

### 1) Gather required inputs

- Generate a `title`, `summary`, `tags`, `seo_title`, and `seo_description` if one is not supplied. Use `author_name`, `author_email` from the most recent article if not supplied.
- Generate suggestions for any optional items the user cares about: `slug`, `hero_image_url`, `hero_image_alt`, `featured`.
- If tags are unclear, offer to fetch tag suggestions with `GET /tags`.

### 2) Draft the article

- Use the writing style in `references/agents.md` as the baseline.
- Blend in a measured amount of sharp technical-blog voice: strong thesis hook up top, conversational-but-technical language, clear opinions with tradeoffs, and concrete specifics (names, numbers, costs, runtimes, configs) when helpful.
- Add practical mechanics where they improve clarity: first-person reporting when relevant, explicit attribution/credit, links to primary sources, and "show your work" implementation detail.
- Keep the mix balanced: Bhart house style first, external-inspired delivery second. Do not imitate phrasing verbatim.
- Favor narrative + tutorial structure when relevant: why this matters, what was tried, what worked, what did not, and why.
- Maintain credibility: cite uncertainty, caveats, and limits instead of overselling.
- Aim to "add something extra" in each section: context, synthesis, or a concrete takeaway beyond a plain summary.
- Avoid typical LLM tells: no em dashes, no scare quotes around ordinary words, and use straight ASCII quotes/apostrophes only.
- Prefer prose over bulleted lists; use bullets sparingly and only when they add clarity.
- Open with a hook and a clear thesis early (bold or standalone sentence).
- Include 2-4 ideas or mental models with reasoning and tradeoffs.
- Structure with `##` headings as claims, short paragraphs, and whitespace.
- End with a conclusion or an invitation to reach out or discuss.

### 3) Submit draft via API

- Call `POST /posts` with `status: "draft"` and required fields, including `seo_title` and `seo_description`.
- If the user asked to publish, confirm and set `status: "published"` with `published_at`.
- Show the user the payload before submitting if anything is inferred.

## Output format

- Provide the drafted `body_markdown`, `title`, `summary`, `tags`, `seo_title`, and `seo_description` for review.
- If requested, immediately submit the draft and return the created post ID/slug.

## API usage

Use the `references/agents.md` API spec and examples. Prefer curl for visibility and reproducibility.

## Notes

- Keep all content in ASCII unless the existing post uses Unicode.
- If the user wants revisions, update only the draft content, not unrelated fields.
