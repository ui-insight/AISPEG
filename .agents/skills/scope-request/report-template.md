# Scoping proposal template

Keep the section order. Write to the requester as "you" and to IIDS as "we". The first sentence of each section states its point. Use sentence-case headings, short sentences, and plain words.

## Front matter

`proposal.md` starts with this block. The renderer builds the masthead, title, at-a-glance table, AI statement, approval statement, and page footer from it. Do not write those in the body.

```yaml
---
title: <Unit> <asset or need>: Proposed Scope and Options
output: <file-name-without-extension>
author: <author's full name>
date: <Month D, YYYY>
request: <title as it appears in the registry>
requested_by: <names and unit>
prepared_by: <names and unit>
status: <draft number and state, such as "Draft 1 for your review">
recommendation: <option letter, effort range, labeled a draft estimate>
needs: <the asks, in one line>
approvers: <full names, such as "Ann Lee, Sam Roe, and Kim Park">
author_reviewed: false
approved: false
---
```

The author is the person responsible for the content, usually Barrie Robison. The footer and page one change as `author_reviewed` and `approved` change. The body starts at Summary.

## Summary

The recommendation in two or three sentences, who builds and who maintains it, the draft effort, and a numbered list of what would let work start. Always invite correction.

## What we heard from you

Lead with what they asked for and ask them to correct it. Then a bullet list of requirements and limits, and a bullet list of known content or work. End with anything that must wait, and what it waits on.

## What we found

Lead with the single finding that shapes the scope most, then name what you reviewed. Give each finding a bold lead sentence that states it, followed by the counts. Say what would change the finding, and what you could not confirm.

## The recommended plan

One or two sentences on what the option changes for the requester, then these subsections:

- **What `<unit>` receives.** Deliverables, as a bullet list.
- **Where it lives.** Working copy and reader copy, and what is not settled.
- **The ongoing routine.** Numbered steps that repeat, and who starts them. Omit for one-time work.
- **How we would get there.** Numbered build steps. Step 1 is submitting the approved scoping document through the University's Unified Technology Request.

End with what this option does not decide or do.

## The alternatives

Lead with which option meets the request at the smallest size, and state that hours are draft estimates, not a quote. Then one table with options as rows, marking the recommended row in its name.

| Option | What `<unit>` gets | Next update | IIDS effort | Depends on | Main risk |
| --- | --- | --- | --- | --- | --- |
| A. Name | | | | | |

Then a short bold "Why not Option X" paragraph for each option passed over, and the conditions for moving up.

## How this connects to other work

Lead with how much can be reused, then show `{{figure:connections}}`. Follow with the point of the timeline, how the comparables were chosen, and a plain warning that calendar time is not effort, then show `{{figure:comparables}}`. End with a "Possible future connections" subsection when the owner names any: a bullet per project saying what it could add, and a plain statement that these are outside the recommended option and its estimate.

## Data security

Lead with the proposed APM 30.11 level (Low, Moderate, or High Risk) and why. Then show `{{figure:dataFlow}}`, the controls that follow from the requester's limits, and who confirms the classification. A proposal is not a classification: data owners and stewards decide it with the Information Security Office. A system takes the level of the highest-risk data it handles.

## Open questions

Lead with what must be answered before work starts and who will carry each question. One table, ordered by when the answer is needed.

| Question | Who answers | Needed before |
| --- | --- | --- |

## Sources

Supplied documents by name and date, then each page you opened, as links. Do not cite transcripts in this list.

## Figures

Each `{{figure:key}}` sits alone on a line and matches a key in `figures.json`. Every entry needs `type`, `caption`, and `alt`. The renderer numbers figures in order. Drop a figure and its text if the data does not support it. Do not pad one out.

```json
{
  "connections": {
    "type": "connections", "caption": "", "alt": "",
    "center": { "title": "", "status": "This proposal" },
    "nodes": [
      { "title": "", "kind": "project", "status": "", "adds": "what it gives this work, one line" },
      { "title": "", "kind": "request", "status": "Open request", "via": "title of a linked node, for a second hop", "adds": "" }
    ]
  },
  "comparables": {
    "type": "comparables", "caption": "", "alt": "",
    "items": [{ "name": "", "status": "", "commits": 0, "start": "YYYY-MM-DD", "end": "YYYY-MM-DD", "active": false }]
  },
  "dataFlow": {
    "type": "dataFlow", "caption": "", "alt": "",
    "boundaryLabel": "", "boundaryColumns": 3, "excluded": "",
    "columns": [{ "title": "", "items": [{ "label": "", "risk": "Low Risk, proposed" }] }]
  }
}
```

Connections come only from registry links (`tech_request_project_links`, `tech_request_links`), at most six nodes. Use public stage and status labels from `lib/portfolio.ts`. Comparables show the development timelines of projects of similar scope to the options being estimated, not the projects in the connections figure: a project that connects to the request belongs in Figure 1, and it is a comparable only if its own build is similar in size. Each needs a stated reason, three to five rows. Set `active: true` only when the repository has commits in the last 30 days. Mark a risk level "proposed" until the data owner confirms it.

## Brand

The stylesheet follows [the U of I brand style guide](https://www.uidaho.edu/brand/brand-style-guide) and `.impeccable.md`. Public Sans is bundled under the SIL Open Font License. Colors come from `app/globals.css`. The renderer downloads the official logo and uses it unaltered: never recolor, crop, or redraw it, never add a unit logo beside it without UCM approval, and never use the seal. The full brand guide is on the InsideUI SharePoint site, so check it when a rule here seems incomplete.
