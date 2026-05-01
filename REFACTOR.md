# AISPEG Refactor Plan — May 2026

## Why

The site was conceived in early 2026 as a collaborative nexus for the AI Strategic
Plan Execution Group: a place where the chartered group (Hunter, Robison, Sheneman,
Ewart, Baumgaertner) would share what they were doing, find information, and
communicate to UI constituencies.

It didn't work. The chartered group never engaged. Stakeholders had no reason to.
The site became a one-author publication addressed to no audience in particular.

The refactor changes the site's purpose, audience, and political register:

- **From** collaborative nexus for the chartered group → **to** outward-facing
  accountability surface for IIDS's institutional AI initiative work.
- **From** AISPEG-as-collaborators → **to** AISPEG-sponsored, IIDS-operated.
- **From** evidence-forward visibility → **to** evidence-forward visibility *plus*
  a direct-register friction ledger that names blockers (OIT review queues, unit
  feedback gaps, legal embargoes, etc.) and a public Standards Watch tracking
  IIDS's outstanding asks of OIT.

Hunter and the rest of AISPEG have been notified that this refactor is happening.

## Strategic decisions

| Decision | Resolution |
|---|---|
| Primary audience | Institutional stakeholders (President, Provost, Deans, partner units). IIDS staff are a secondary audience whose tools the site integrates with. |
| Job-to-be-done | Show what IIDS shipped, what's stalled, why, and who can unblock it. |
| Scope | **Medium** — IIDS-led work + AI4RA-built tools UI deploys (OpenERA, Vandalizer, MindRouter, ProcessMapping). Wide-landscape view of partner-unit AI work is deferred or cut. |
| Political register | **Direct**, graduated by audience. Public view: factual, dated, no editorializing, but names categories, partners, and elapsed time. Internal view (auth-gated): sharper detail. Embargoed projects: counted, shaped, dated; not detailed. |
| Brand | **Co-branded** — "Operated by IIDS · Sponsored by AISPEG" or equivalent. The strategic frame stays under AISPEG voice; the friction ledger and Standards Watch carry IIDS authorship. |
| TDX | **Compete via better product**, framed positively. Don't say TDX is bad; be the recommended path for AI projects, with named owners and visible status. |
| Auth (v1) | **Basic auth** for `/internal`. SSO can come later. |

## Friction taxonomy

Every project entry can carry zero or more blockers. The taxonomy:

1. OIT — review queue (security, integration, infra)
2. OIT — standards vacuum *(systemic — surfaced separately as Standards Watch)*
3. Unit engagement — testing/feedback unreceived from intended users
4. Legal / vendor embargo — contract terms preclude public discussion
5. Hardware / procurement — GPUs, network capacity, infrastructure
6. Funding / budget commitment — distinct from procurement; no dollars committed
7. Data access / governance — registrar, SIS, research data
8. Compliance / regulatory — FERPA, HIPAA, IRB, export controls, accessibility certification (parallel to OIT security)
9. Personnel / hiring — open positions, retention
10. Internal IIDS capacity — own this honestly
11. Inter-unit politics — turf, dean-level disagreements
12. Communications / messaging clearance — UCM, President's office
13. External partner / sponsor timeline — NSF GRANTED, AI4RA-SUU, vendor partners
14. Faculty governance / academic policy — Faculty Senate, curricular committees

Each blocker on a project carries: `category`, `named_party`, `since` (date),
`public_text`, `internal_text`, `severity` (low/med/high).

## Information architecture

### Primary nav (4 surfaces)

| Surface | Route | Job |
|---|---|---|
| **The Work** | `/work` (renames `/portfolio`) | Portfolio of IIDS's institutional AI work, friction-ledger first-class. Each project: owner, status, blockers, dates, visibility tier. |
| **Standards Watch** | `/standards` | Public ledger of OIT standards IIDS has formally requested, with day counters per item. The Item I + Item II agendas, dated. |
| **Submit a Project** | `/builder-guide` (renames pending) | Intake portal — assessment quiz, named SLA, status page, ClickUp wiring, similarity matching. |
| **Reports** | `/reports` | Time-stamped artifacts, reverse-chronological. Decks, monthly briefs, public communications. Merges current `/presentations` + `/reports`. |

### Secondary

- **About** — single page, footer link. Charter context, AI4RA partnership, IIDS
  operator role, how to engage. Static, slow-moving.
- **`/internal`** — auth-gated (Basic v1). Same data, sharper rendering. Embargoed
  project records. Friction-ledger with named individuals, contact history,
  severity. Intake admin queue (during transition before full ClickUp wiring).

## Keep / cut audit

| Route | Decision | Notes |
|---|---|---|
| `/portfolio` | **Keep, rebuild as `/work`** | Core asset. Restructure around Medium scope + friction ledger. |
| `/standards` | **Keep, reshape as Standards Watch** | Empty room becomes public ledger. |
| `/builder-guide` | **Keep, improve** | See *Intake improvements* below. |
| `/admin/registry` | **Keep, relabel** | Not admin overhead — the `applications` table is the data backbone for The Work. Move out of admin framing. |
| `/presentations` + `/reports` | **Merge** into single `/reports` surface | Both are time-stamped artifacts. |
| `/ai4ra-ecosystem` | **Fold into About + tag projects** | AI4RA tools that UI deploys are entries on The Work; partnership context belongs in About. |
| `/approach` (principles + lessons + playbook) | **Cut from primary nav. Salvage selectively into About or per-project content.** | AISPEG-philosophy-era content. Most won't survive the new register. The Agent Playbook may live on as `CONTRIBUTING.md`-style internal doc. |
| `/knowledge` | **Cut** | Wiki for collaborators who don't show up. Not load-bearing. |
| `/cautionary-tales` | **Cut as a page; salvage publishable items into Reports** | Same logic as `/approach`. |
| `/roadmap` | **Cut as top-level page** | Per-project status replaces it. Friction-ledger *is* the roadmap. |
| `/outreach` | **Cut** | Not load-bearing for a coordination nexus. |
| `/action-plan` | **Cut** | The friction ledger replaces it in higher fidelity. |
| `/admin/submissions` | **Cut once ClickUp wiring lands; keep transitionally** | ClickUp becomes Colin's inbox. |

Net: ~11 routes → 4 primary surfaces + About + `/internal`. About 60% of current
route code retires.

## Data architecture

Source-of-truth boundaries:

| Data | System | Why |
|---|---|---|
| Project identity, classification, provenance | **Postgres `applications` table** | Already mirrors the wizard schema, supports similarity queries, FK to submissions. |
| Project status, blockers, daily workflow | **ClickUp** | Where Colin already lives. Custom fields encode blocker taxonomy. |
| Technical work / issue tracking | **GitHub issues** | Existing `lib/github.ts` already handles this. |
| Narrative content (deck abstracts, About copy) | **Markdown / TS in repo** | Slow-moving, version-controlled, intentional. |
| Standards Watch entries | **Single TS/JSON file in repo** | Each standards-requested event is commit-worthy. Git log = audit trail. |
| Submitter status pages | **Postgres `submissions` table + ClickUp join** | Tokenized URL reads current state from both. |

### ClickUp ↔ Postgres boundary

- Postgres `applications.id` is canonical.
- ClickUp task carries a custom field `application_id` referencing it.
- Postgres `applications.clickup_task_id` carries the reverse pointer.
- Status, blockers, and assignees flow ClickUp → Postgres on sync.
- Identity, classification, and provenance flow Postgres → ClickUp on creation.
- Bidirectional sync runs on a cron (initially) or webhook (later).

### Schema changes required

**Migration 005 — friction-ledger fields on `applications`:**

```sql
ALTER TABLE applications
  ADD COLUMN visibility_tier TEXT NOT NULL DEFAULT 'internal',
    -- 'public' | 'internal' | 'embargoed'
  ADD COLUMN clickup_task_id TEXT,
  ADD COLUMN home_unit TEXT,
  ADD COLUMN operational_owner_name TEXT,
  ADD COLUMN operational_owner_email TEXT;

CREATE TABLE IF NOT EXISTS blockers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  category        TEXT NOT NULL,           -- one of the 14 categories
  named_party     TEXT,                    -- e.g. 'OIT', 'Unit X', 'Vendor Y'
  since           DATE NOT NULL,
  public_text     TEXT,                    -- safe for the public view
  internal_text   TEXT,                    -- for /internal only
  severity        TEXT NOT NULL DEFAULT 'medium',  -- low | medium | high
  resolved_at     DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blockers_application_id ON blockers(application_id);
CREATE INDEX idx_blockers_category ON blockers(category) WHERE resolved_at IS NULL;
```

**Migration 006 — Standards Watch is *not* DB-backed.** Lives at
`lib/standards-watch.ts` so each new entry is a commit.

### ClickUp custom fields (to design with Colin)

On the IIDS AI Initiative space's tasks:

- `application_id` (text) — FK to Postgres
- `visibility_tier` (dropdown) — public / internal / embargoed
- `home_unit` (text)
- `operational_owner_email` (text)
- `blocker_category` (dropdown — 14 values)
- `blocker_named_party` (text)
- `blocker_since` (date)
- `blocker_public_text` (text long)
- `blocker_internal_text` (text long)
- `blocker_severity` (dropdown — low/medium/high)

Status states map to: `idea` → `triaged` → `scoping` → `accepted` → `in-development`
→ `staging` → `production` → `retired` (mirrors current `applications.status`).

## Submit-a-Project improvements

Keep the existing 9-step assessment quiz — already a better product than TDX.
Close these gaps:

1. **Named-human acknowledgment + SLA.** Form submits → user gets email within
   minutes from a named IIDS person. Default: "Colin Armitage will follow up within
   2 business days." The named-human signal is the single biggest TDX
   differentiator.
2. **Submitter-visible status page.** Each submission gets `/intake/[token]` (no
   login). Shows current status, assigned human, last updated, next expected
   action. The same direct-register pressure the friction ledger applies to OIT,
   the status page applies to IIDS itself.
3. **ClickUp wiring.** New submission → Postgres → ClickUp task auto-created in
   Colin's intake list with the assessment summary as the description. Colin works
   the queue in ClickUp; status changes flow back to the submitter's status page.
4. **Similarity matching surfaced *during* assessment.** The infrastructure already
   exists in `lib/similarity.ts` and `similarity_matches`. As the user fills out
   the quiz, show "3 similar projects exist; consider talking to X first" before
   submission. TDX cannot offer this.

Deferred to v1.5: public throughput page (need months of data first), explicit
"why this path" copy.

## Standards Watch

Each entry on the page:

- Item title (e.g., "System Architecture & Integration Standards")
- Sub-items (the bullets from the agenda)
- Date formally requested
- Day counter (auto-computed)
- Status chip: `requested` · `acknowledged` · `in-draft` · `published`
- Optional: link to the meeting / email where it was requested

Seed content: the two agendas Barrie has already written, verbatim. Initial state:
all entries `requested`, day counter starts on the date the agenda was first sent.

The page is durable. The longer OIT doesn't engage, the heavier the page
becomes — automatically.

## Sequencing

Each sprint is roughly a week of focused work. Sprints can overlap where they
don't share files.

### Sprint 1 — Cuts and IA reshape *(no schema work; ship-able alone)*

- Update sidebar to 4 primary surfaces + About + `/internal`.
- Remove `/knowledge`, `/cautionary-tales`, `/roadmap`, `/outreach`, `/action-plan`
  from nav and routes. Move route directories to `_archive/` for one release before
  deletion.
- Update home page (`app/page.tsx`) to point at the 4 surfaces. Remove the
  competing CTAs and the strategic-takeaways closer (legacy AISPEG framing).
- Update brand chrome to co-branded language. Header reads "Institutional AI
  Initiative · Operated by IIDS · Sponsored by AISPEG" (final wording TBD).
- Add Basic auth middleware on `/internal/*` routes.
- **Standards Watch v1**: new `/standards` page rendering Item I + Item II
  agendas as a dated ledger from `lib/standards-watch.ts`.

**Output:** the site already feels different. Standards Watch is live. Public
register has shifted. No backend changes required.

### Sprint 2 — The Work rebuild *(complete, May 2026)*

- ✅ Migration 005: friction-ledger fields on `applications` + `blockers` table
  + `schema_migrations` tracking table.
- ✅ Migration runner (`npm run migrate`) and one-shot data seed
  (`npm run seed:portfolio`) port `lib/portfolio.ts` → `applications` +
  auto-derive blockers from existing visibility/review-status flags.
- ✅ `lib/portfolio.ts` retained as the seed source until Sprint 3 ClickUp
  wiring lands; runtime reads now go through `lib/work.ts`.
- ✅ `/portfolio` and `/portfolio/[slug]` rebuilt to read from Postgres via
  `lib/work.ts`. Per-card friction-ledger chips show category, named party,
  and a day counter from blocker.since.
- ✅ Auth-gated `/internal`, `/internal/portfolio`, and
  `/internal/portfolio/[slug]` render the same data with `internal_text`
  blocker detail, embargoed records visible, and a visibility-tier chip on
  the detail view. Basic auth via `BASIC_AUTH_USER` / `BASIC_AUTH_PASS`.
- ℹ️  `/work` URL not introduced — sidebar label is "The Work" but the route
  stays `/portfolio` to avoid breaking existing inbound links from decks,
  emails, and the prior portfolio detail pages.

**Output:** The Work is live. Friction ledger is visible to public and internal
audiences with appropriate detail levels.

### Sprint 3 — Submit-a-Project delivery + ClickUp wiring

Split into two halves so the customer-facing delivery work can ship while
ClickUp wiring waits on Colin.

#### Sprint 3a — Submit-a-Project delivery *(complete, May 2026)*

ClickUp-independent. Reads from Postgres directly; ClickUp later replaces
*who* updates status, not the surfaces.

- ✅ `lib/intake-config.ts` — single source of truth for the named human
  (Colin Armitage), the SLA wording, and the status-state labels.
- ✅ `POST /api/similarity/preview` — stateless similarity endpoint that
  takes a partial assessment profile and returns matches against the
  registry. Threshold lower than the post-submit endpoint (0.2 vs 0.3) —
  over-notify rather than miss.
- ✅ `/intake/[token]` — public status page (token = submission UUID).
  Shows submission state, named human, SLA, "what happens next."
- ✅ Builder-guide updates: capture submission ID from POST, fetch
  similarity preview on entering the review step, surface matches with
  overlap counts both in review (with a "consider talking to..." nudge)
  and on the results page.
- ✅ Results page: new "What happens next" callout with named human, SLA,
  and the bookmarkable status URL.
- ✅ Seed enrichment — the portfolio entries seeded by
  `npm run seed:portfolio` now carry wizard-shape classification fields
  (sensitivity, data_sources, university_systems, etc.) so the similarity
  engine actually finds matches. Heuristic mapping per slug; refine in
  the seed script or via the admin registry.

#### Sprint 3b — ClickUp wiring *(deferred to Colin)*

- ClickUp custom fields setup (in person with Colin).
- ClickUp API integration: read-side (sync blocker/status data Postgres
  ← ClickUp on cron), then write-side (new submissions create CU tasks).
- Once ClickUp wiring is solid, retire `/admin/submissions`.

**Sprint 3a output:** intake portal materially better than TDX in
delivery — named human, factual SLA, bookmarkable status URL,
similarity-aware review. Status updates flow from manual edits to
`submissions.status` for now; ClickUp eventually becomes the source.

### Sprint 4 — Reports unification + About + cleanup

- Merge `/presentations` + `/reports` into single `/reports` surface,
  reverse-chronological.
- Build `/about` page absorbing strategic frame, AI4RA partnership context,
  AISPEG charter context, IIDS operator note. Selectively salvage from
  `/approach` and `/knowledge` content.
- Delete archived routes from `_archive/`.
- Sweep dead code in `lib/data.ts` (everything no longer referenced).
- Update `CLAUDE.md` and `README.md` to describe the new architecture.

**Output:** old AISPEG-collaborator-era content is fully retired or salvaged.
Codebase reflects the new architecture without legacy cruft.

## v1 cut

**v1 = Sprints 1 + 2 + 3.** v1.5 = Sprint 4. Sprint 1 alone is independently
shippable and would already feel like a different site to a stakeholder.

## Open questions

- **Final brand language** for the site header. "Institutional AI Initiative ·
  Operated by IIDS · Sponsored by AISPEG" is a draft. Hunter may have a preferred
  phrasing.
- **Visibility tier defaults.** Should new `applications` rows default to
  `internal` (safer, requires explicit promotion) or `public` (encourages openness,
  requires explicit demotion)? Recommendation: `internal` default.
- **Standards Watch acknowledgments**: do we surface OIT's responses (when they
  come) inline as status changes, or as separate annotated entries? Recommendation:
  inline status change with a link to the response artifact.
- **Embargoed-project public count.** A single line "N projects under vendor
  confidentiality" is honest and powerful, but exposes the count itself. Confirm
  this is OK before shipping.
- **Inbound link inventory.** Before we move/rename routes, audit what links into
  `/portfolio`, `/presentations`, etc. from outside the site (uidaho.edu, partner
  sites, prior comms). Add 301 redirects where needed.

## Risks

- **Self-applied pressure.** The submitter status page exposes IIDS's own
  turnaround the same way the friction ledger exposes OIT's. Slow IIDS response
  becomes visible. This is a feature, not a bug — but it's worth being deliberate
  about staffing the intake queue.
- **ClickUp data hygiene.** The site becomes a projection of ClickUp; if Colin's
  field discipline lapses, the site lies subtly (worse than the current visibly-
  stale state). Worth a periodic audit (monthly?) until the workflow is steady.
- **OIT response.** All three of (Standards Watch, friction ledger naming OIT,
  TDX competition) read together as a coordinated political move. They are one.
  OIT may push back through channels the site can't see (review queue
  prioritization, charter-level objections). Hunter is on notice; that's the
  primary mitigation.
- **Salvage-vs-cut judgment on `/approach` and `/knowledge`.** Some content there
  may be worth preserving as About-page copy or as Reports entries. The Sprint 4
  pass should be done with a light hand — read each piece, decide individually.

## Appendix A — Standards Watch seed content

The two agendas, as drafted, become the initial entries:

**Agenda Item I — Software Development Standards (10 sub-items):**

1. System Architecture & Integration Standards
2. API & Interface Standards
3. Data Standards & Governance
4. Security & Compliance Requirements
5. DevOps, Deployment & Hosting Standards
6. Application Lifecycle & Handoff Standards
7. Technical Debt & Code Quality Standards
8. Decision-Making & Governance Model
9. Upgrade & Change Management Standards
10. Observability & Operational Standards

**Agenda Item II — User Experience Standards (10 sub-items):**

1. Design System & Visual Standards
2. Component & Interaction Standards
3. Accessibility
4. Usability & Workflow Design Standards
5. Performance & Responsiveness Standards
6. Error Handling & Feedback Standards
7. Content & Language Standards
8. User Testing & Validation Requirements
9. Analytics & UX Telemetry
10. Governance & Exception Handling

Each sub-item gets its own row. Detail bullets from the original agendas attach
to the row as expandable detail. Date requested is the date the agenda was first
sent (verify with Barrie).
