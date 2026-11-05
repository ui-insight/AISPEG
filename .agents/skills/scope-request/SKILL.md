---
name: scope-request
description: Turns a request in the Unified Technology Request registry into a branded, requester-ready scoping proposal PDF: stated requirements, tested findings, a ladder of three or four options, one recommendation, related-work and data-security figures, and open questions by owner. Use when asked to scope a request, generate scoped options, estimate what a request would take, or write a proposal a requesting unit can read.
---

# Scope request

The product is a proposal the requester can read, correct, and approve. Named approvers approve it, and it then goes through the University's Unified Technology Request. Nothing here changes a request's disposition, track, or stage.

## Rules

- This repository and `/portfolio/pipeline` are public. Transcripts, emails, supplied documents, and the proposal itself stay outside the repo. Work in `Scoping-Proposals/<request-name>/`, beside the repo, one directory per proposal, and delete derived copies of transcripts when done.
- The proposal goes to the requester, so it carries the ask, the requirements, and the open questions. Leave out funding intentions, personal estimates, jokes, and opinions about offices or people, even if they appear in the source.
- Attribute a requirement to a person only if they stated it as one.
- Hours are draft estimates, never a quote. A person who would do the work confirms them before the proposal goes out.
- Describe university systems and offices neutrally. State what a link, page, or process does today, not whose fault it is.
- Every proposal states that it was generated with the help of AI and carries the author's full name. It does not name the AI tool or say what the tool was given. The renderer prints this wording.
- Every proposal names its approvers and states that, once approved, it will be submitted through the University's Unified Technology Request. The renderer prints this too.
- Set `author_reviewed: true` only when the author says they have reviewed the proposal. Set `approved: true` only when the author says every approver has approved it.
- A project with restricted circulation appears by a generic description, such as "prototype curriculum database", even if its name appears elsewhere. Ask the owner when unsure.
- Do not send the proposal, or commit it. The owner sends it.

## Workflow

1. **Anchor.** Find the request in the `tech_requests` registry and read its need statement, events, and links. If it is not registered, stop and register it first, following the pattern in the latest registering migration. Collect the primary sources into the scratch directory.

2. **List requirements.** Write down what the requester asked for, the limits they set, and the known content of the work. Separate these from what IIDS proposed in the meeting. Note who still has not been heard from.

3. **Test the ground.** Look for what the sources cannot show:

   - Assumptions anyone stated but could not confirm. Check each one, and record what you searched if you find nothing.
   - The condition of the current asset, in counts: broken links, age, pages, how much of it the unit owns.
   - Where the same data or document already lives, and whether those places agree.
   - Precedents in `lib/portfolio.ts` and related rows in the registry.

   Give any automated check a control. Probe a known-good and a known-bad case first, so a blocked client does not read as a finding. Open a page before citing it; a search summary is a lead.

4. **Build the ladder.** Write three or four options, each building on the one before, smallest first.

   - Include one option below the recommendation, even if it fails the ask. It shows what the extra work buys.
   - Include a larger option if the request has campus-wide reach.
   - For each one: what the requester gets, what happens at the next update, effort, dependencies, main risk.

5. **Recommend.** Pick the smallest option that meets the stated request, unless your findings argue otherwise. Give the reason each other option lost, and the conditions for moving up the ladder. A dependency nobody controls yet, such as university sign-on, counts against an option.

6. **Estimate.** Use commit spans from repositories of similar scope as evidence, and give ranges. Similar scope means a build of about the same size, not a project the request connects to. Commits are not hours, so say that in the proposal. Do not state precision the comparison cannot support.

7. **Build the figures.** Write `figures.json` as described in [report-template.md](report-template.md). Figures are data, so take them from the registry, commit history, and APM 30.11, not from memory.

8. **Write and render.** Fill the template as `proposal.md` in the scratch directory, then run:

   ```bash
   node .agents/skills/scope-request/scripts/render-proposal.mjs ../Scoping-Proposals/<request-name>
   ```

   Rasterize the PDF with `pdftoppm` and look at every page. Check figures for label collisions and small text. Apply the `unslop` skill if it is installed.

9. **Screen.** Reread the proposal as the requester, then as their dean. Check that:

   - every number traces to a source you opened;
   - no candid remark or funding detail survived;
   - nothing reads as blame for the unit or another office;
   - the requester's own words are not used against them.

10. **Hand off.** Tell the owner what they must confirm: the hours, any commitment written in their name, any finding you could not verify, and who must approve it. Once they say they have reviewed it, set `author_reviewed: true` and render again. Stop there.

## Later steps

Record what the requester decides only after they respond. Once every approver has approved, set `approved: true`, render again, and leave the Unified Technology Request submission to the owner. Registry changes go through a migration on a feature branch, screened the same way, because commit history is public.
