-- Migration 019: register the Operational Excellence survey candidate
-- projects in the Unified Technology Request registry (ADR 0005).
--
-- The portfolio owner's 2026-07-24 direction: the site tells one story —
-- every requested or suggested project lives in the one public queue
-- (/portfolio/pipeline), with no public/internal split. The eight
-- candidate projects derived from the Operational Excellence survey
-- (lib/surveys/candidate-projects.ts; verbatim evidence on
-- /standards/operational-excellence) become registry rows with origin
-- 'direct'. Dispositions stay 'open' on purpose: the coverage analysis
-- rides along in the need statement and the project links, but the
-- formal disposition — including routing already-covered demand to an
-- existing solution — is triage's call, not the survey's.
--
-- Link semantics: existing projects that partially cover or pattern-prove
-- a candidate are linked 'informs'; where the analysis says demand is
-- already met, the link is 'interest' (the requestor pool joins the
-- existing project's audience once triage confirms).

DO $mig$
DECLARE
  rid UUID;
BEGIN

-- 1/8 — Reimbursement & payment status tracker (partial)
IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = 'Reimbursement & payment status tracker') THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_unit, title, need_statement, disposition)
  VALUES ('direct', 'Operational Excellence survey respondents', 'Institution-wide (survey-derived)',
    'Reimbursement & payment status tracker',
    $t$Travel and Accounts Payable reimbursements take weeks to months, and employees have no visibility into where a request is stuck or why — one respondent reported a 41-day Chrome River AP review and out-of-pocket bank fees.

Proposed shape: a status view that shows an employee and approvers exactly where a reimbursement, invoice, or payment sits and what is blocking it — the same direct-register pattern already used for the intake status page, applied to finance workflows.

Coverage: partial — Invoice Processing already works the AP invoice side; the gap is the employee- and approver-facing status visibility.$t$,
    'open')
  RETURNING id INTO rid;
  INSERT INTO tech_request_events (request_id, actor, event_type, note)
  VALUES (rid, 'migration-019', 'received', 'Registered from the Operational Excellence survey candidate-projects inventory; verbatim evidence on /standards/operational-excellence.');
  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
  VALUES (rid, 'invoice-processing', 'informs', 'migration-019', 'Partial coverage: AP invoice side exists; status visibility is the gap.');
END IF;

-- 2/8 — Onboarding & access automation (gap)
IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = 'Onboarding & access automation') THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_unit, title, need_statement, disposition)
  VALUES ('direct', 'Operational Excellence survey respondents', 'Institution-wide (survey-derived)',
    'Onboarding & access automation',
    $t$New employee and TA onboarding — I-9 → EPAF → email → system access — is a multi-office, multi-day scavenger hunt that leaves new teaching staff without their systems until classes have already started.

Proposed shape: a guided onboarding flow where approval of the I-9 automatically triggers the downstream steps (EPAF, email creation, Banner entry, Bridge/FERPA), with a checklist the new hire and their admin can both see.

Coverage: gap — no current project addresses this.$t$,
    'open')
  RETURNING id INTO rid;
  INSERT INTO tech_request_events (request_id, actor, event_type, note)
  VALUES (rid, 'migration-019', 'received', 'Registered from the Operational Excellence survey candidate-projects inventory; verbatim evidence on /standards/operational-excellence.');
END IF;

-- 3/8 — Institutional knowledge & policy search (partial)
IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = 'Institutional knowledge & policy search') THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_unit, title, need_statement, disposition)
  VALUES ('direct', 'Operational Excellence survey respondents', 'Institution-wide (survey-derived)',
    'Institutional knowledge & policy search',
    $t$The 2025 website/intranet migration broke findability: staff and students can't locate policies (APMs), forms, mileage rates, and how-tos that used to be a click away.

Proposed shape: a retrieval-augmented search over policies, APMs, forms, and how-to documentation that answers a plain-language question with a cited source — the same pattern already proven on the Water Law Database.

Coverage: partial — the RAG retrieval pattern is proven on legal documents; applying it to institutional policy and how-to content is the open work.$t$,
    'open')
  RETURNING id INTO rid;
  INSERT INTO tech_request_events (request_id, actor, event_type, note)
  VALUES (rid, 'migration-019', 'received', 'Registered from the Operational Excellence survey candidate-projects inventory; verbatim evidence on /standards/operational-excellence.');
  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
  VALUES (rid, 'water-law-database', 'informs', 'migration-019', 'The cited-answer RAG pattern is proven there; policy corpus is the new application.');
END IF;

-- 4/8 — Repetitive-query response assistant (partial)
IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = 'Repetitive-query response assistant') THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_unit, title, need_statement, disposition)
  VALUES ('direct', 'Operational Excellence survey respondents', 'Institution-wide (survey-derived)',
    'Repetitive-query response assistant',
    $t$Front-line offices — financial aid especially — answer the same questions hundreds of times, while students cite slow email response as their top communication frustration.

Proposed shape: an assistant that drafts a first response to high-volume, repetitive inbound questions for staff to review and send, cutting turnaround without removing the human. Runs on the existing MindRouter gateway.

Coverage: partial — one financial-aid respondent proposed exactly this. MindRouter is the platform; the drafting assistant is the build.$t$,
    'open')
  RETURNING id INTO rid;
  INSERT INTO tech_request_events (request_id, actor, event_type, note)
  VALUES (rid, 'migration-019', 'received', 'Registered from the Operational Excellence survey candidate-projects inventory; verbatim evidence on /standards/operational-excellence.');
  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
  VALUES (rid, 'mindrouter', 'informs', 'migration-019', 'MindRouter is the platform; the drafting assistant is the build.');
END IF;

-- 5/8 — Self-serve unit budget view (partial)
IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = 'Self-serve unit budget view') THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_unit, title, need_statement, disposition)
  VALUES ('direct', 'Operational Excellence survey respondents', 'Institution-wide (survey-derived)',
    'Self-serve unit budget view',
    $t$Directors and chairs can't see index/fund balances in real time and fall back on manually maintained spreadsheets; different tools give different numbers.

Proposed shape: a self-serve dashboard showing current balances and transactions per index/fund — "like looking at a bank account" — instead of days of human effort to assemble a picture.

Coverage: partial — the dashboard pattern exists at the executive level; a unit-level, self-serve budget view is the gap, and overlaps the Huron data-modernization work.$t$,
    'open')
  RETURNING id INTO rid;
  INSERT INTO tech_request_events (request_id, actor, event_type, note)
  VALUES (rid, 'migration-019', 'received', 'Registered from the Operational Excellence survey candidate-projects inventory; verbatim evidence on /standards/operational-excellence.');
  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note) VALUES
    (rid, 'audit-dashboard', 'informs', 'migration-019', 'Dashboard pattern precedent within Financial Affairs.'),
    (rid, 'rfd-career', 'informs', 'migration-019', 'Cohort/progress dashboard pattern precedent.'),
    (rid, 'oit-data-modernization', 'informs', 'migration-019', 'Overlaps the Huron data-modernization scope; coordinate before building.');
END IF;

-- 6/8 — Student resource navigator (gap)
IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = 'Student resource navigator') THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_unit, title, need_statement, disposition)
  VALUES ('direct', 'Operational Excellence survey respondents', 'Institution-wide (survey-derived)',
    'Student resource navigator',
    $t$Students bounce across offices to answer simple questions and routinely find out about resources too late; many ask for a way to be pointed to the right place.

Proposed shape: a secure, opt-in student assistant that routes a question to the right office or resource and answers routine "how do I…" queries. Runs on MindRouter.

Coverage: gap — no current project addresses this. A vocal share of students are AI-skeptical; this must be opt-in, transparent about limits, and always offer a human path — or it will bounce the very audience it serves.$t$,
    'open')
  RETURNING id INTO rid;
  INSERT INTO tech_request_events (request_id, actor, event_type, note)
  VALUES (rid, 'migration-019', 'received', 'Registered from the Operational Excellence survey candidate-projects inventory; verbatim evidence on /standards/operational-excellence.');
  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
  VALUES (rid, 'mindrouter', 'informs', 'migration-019', 'Would run on the MindRouter gateway.');
END IF;

-- 7/8 — Grants & research-administration tooling (covered)
IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = 'Grants & research-administration tooling') THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_unit, title, need_statement, disposition)
  VALUES ('direct', 'Operational Excellence survey respondents', 'Institution-wide (survey-derived)',
    'Grants & research-administration tooling',
    $t$Grant submission through VERAS is duplicative (the same figures entered in multiple places) and contract approval runs long with PIs left out of the loop.

Proposed shape: not a new build — this demand is largely met by existing research-administration projects. The residual gap is VERAS data-entry duplication specifically.

Coverage: covered — OpenERA, Vandalizer, ProcessMapping, and UniVerso already address research-administration workload; surface them to this audience rather than starting over. Formal routing to the existing solutions is triage's call.$t$,
    'open')
  RETURNING id INTO rid;
  INSERT INTO tech_request_events (request_id, actor, event_type, note)
  VALUES (rid, 'migration-019', 'received', 'Registered from the Operational Excellence survey candidate-projects inventory; verbatim evidence on /standards/operational-excellence.');
  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note) VALUES
    (rid, 'openera', 'interest', 'migration-019', 'Demand largely met here; VERAS duplication is the residual gap OpenERA retires.'),
    (rid, 'vandalizer', 'interest', 'migration-019', 'Existing coverage of RA document workload.'),
    (rid, 'processmapping', 'interest', 'migration-019', 'Existing coverage of RA process visibility.'),
    (rid, 'universo', 'interest', 'migration-019', 'Existing coverage of research discovery.');
END IF;

-- 8/8 — Sanctioned AI access & literacy (covered)
IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = 'Sanctioned AI access & literacy') THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_unit, title, need_statement, disposition)
  VALUES ('direct', 'Operational Excellence survey respondents', 'Institution-wide (survey-derived)',
    'Sanctioned AI access & literacy',
    $t$Faculty and staff want approved AI tools and guidance on which are sanctioned; students are divided, with a pro camp asking for a secure, sanctioned option and AI literacy.

Proposed shape: not a new build — MindRouter is the sanctioned, on-prem AI gateway that answers the access question. The open work is enablement: publishing which tools are approved and how to use them well.

Coverage: covered — the demand is met by MindRouter; the remaining gap is communication and AI literacy, not a platform. Formal routing to the existing solution is triage's call.$t$,
    'open')
  RETURNING id INTO rid;
  INSERT INTO tech_request_events (request_id, actor, event_type, note)
  VALUES (rid, 'migration-019', 'received', 'Registered from the Operational Excellence survey candidate-projects inventory; verbatim evidence on /standards/operational-excellence.');
  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
  VALUES (rid, 'mindrouter', 'interest', 'migration-019', 'Access demand met by MindRouter; the gap is enablement and literacy.');
END IF;

END
$mig$;
