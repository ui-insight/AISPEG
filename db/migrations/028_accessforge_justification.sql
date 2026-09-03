-- Migration 028: AccessForge justification — convert the PDF
-- remediation request (Migration 027) into the tracked prototype and
-- record the user-side ROI case.
--
-- Source: Seth Vieux's (Special Projects Manager, Office of the
-- President) 2026-09-03 reply to Robison's 2026-08-28 "PDF
-- Accessibility Tool" questions, with input from Chad Neilson and
-- Sukha Worob. It answers the seven prompts Robison sent: need and use
-- cases, who needs it and volume, current cost, deadlines and risk,
-- success measures, pilot users and owners, and dependencies.
--
-- What changes: the request gains a 'converted' event and a
-- 'converted-to' link to the `accessforge` portfolio entry (Sheneman's
-- prototype completed its first working remediation 2026-08-28), the
-- need statement gains the user-side justification paragraph, and the
-- ROI ledger gains one quantified cost-avoidance claim (Robison's
-- arithmetic on Vieux's inputs — status 'estimated') plus three
-- qualitative claims attested by Vieux. Disposition stays 'open' and
-- track/stage stay NULL: conversion to a tracked prototype is a fact,
-- prioritization is still triage's call (same posture as 019/020/027).
--
-- Ordering: depends on the request row from Migration 027. The
-- exception fires loudly if 027 was never applied, because the runner
-- records this migration as applied either way.

DO $mig$
DECLARE
  rid UUID;
BEGIN

SELECT id INTO rid FROM tech_requests
WHERE origin = 'direct' AND title = 'PDF accessibility remediation at scale (Title II)';

IF rid IS NULL THEN
  RAISE EXCEPTION 'Migration 028 requires the PDF remediation request from Migration 027 — apply 027 first.';
END IF;

-- ── Need statement: append the user-side justification ────────
UPDATE tech_requests
SET need_statement = need_statement || $t$

Justification (Seth Vieux, Office of the President, 2026-09-03; input from Chad Neilson and Sukha Worob): units already run disparate checkers (Siteimprove, Adobe Acrobat Pro) that score PDFs but do not fix them, so remediation is manual and scales with content complexity. Every faculty and staff member who publishes digital content needs the capability. The marketing website carries well over 2,000 PDFs that fail WCAG 2.1 AA; UCM turned away an estimated 4–8 PDFs per week over summer 2026 for lack of trained remediators; the intranet likely holds several thousand more (UCM and OIT are sizing that risk). Current cost pool: CETL employs 10 part-time students (20 hours/week each, funded by a strategic-plan initiative grant) plus its own experts to remediate courses (30 completed to date); UCM Creative Services remediates at $85/hour, 1–5 hours per document; UCM's web team spends significant time reviewing submitted PDFs and educating submitters. Deadline: state and local government entities must meet WCAG 2.1 AA by April 26, 2027; at least two Idaho state agencies have been sued over accessibility; the Office of the State Board of Education indicates UI is ahead of most or all other state agencies, so there is no rush to put a tool in users' hands before it is ready. Success measures: remediation cost avoided (primary, since CDAR is exploring a commercial AI product), staff hours saved and processing time (benchmarking current state will be hard), documents remediated, tool usage (users, uses); a stretch measure is assisting authors while creating accessible documents. Pilot users: CETL's ad-hoc accessibility advisory committee (2025–26) and the UCM Web Team; Sukha Worob offered to help develop and test. Dependencies: the Provost has expressed interest in replicating CETL's student-remediator program for non-academic units. A user-side product owner is still to be named.$t$
WHERE id = rid
  AND need_statement NOT LIKE '%Justification (Seth Vieux, Office of the President, 2026-09-03%';

-- ── Conversion: the request now has a tracked prototype ───────
IF NOT EXISTS (
  SELECT 1 FROM tech_request_events
  WHERE request_id = rid AND event_type = 'converted' AND actor = 'migration-028'
) THEN
  INSERT INTO tech_request_events (request_id, at, actor, event_type, to_value, note)
  VALUES (rid, '2026-09-03T17:26:00Z', 'migration-028', 'converted', 'accessforge',
    'Sheneman''s AccessForge prototype completed its first working remediation 2026-08-28 and entered the portfolio as `accessforge` (prototype). Robison''s 2026-08-28 request for a defensible basis was answered 2026-09-03 by Seth Vieux (Office of the President) with need, volume, cost, deadline, success measures, pilot users, and dependencies; a user-side product owner is still to be named.');
END IF;

INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
VALUES (rid, 'accessforge', 'converted-to', 'migration-028',
  'AccessForge is the MindRouter-based evaluation and remediation workflow this request asked for; prototype as of 2026-08-28.')
ON CONFLICT (request_id, application_slug, link_type) DO NOTHING;

-- ── ROI ledger ────────────────────────────────────────────────
IF NOT EXISTS (
  SELECT 1 FROM roi_claims WHERE request_id = rid AND claimed_by = 'Seth Vieux'
) THEN

  INSERT INTO roi_claims
    (request_id, claim_kind, dimension, annual_value_usd, basis, source, status, effective_fy, claimed_by, claimed_at)
  VALUES
  (rid, 'quantified', 'cost-avoidance', 79560.00,
    $t$Marketing-site inflow only, priced at the UCM Creative Services rate. Vieux (2026-09-03) reports 4–8 PDFs per week turned away over summer 2026 and Creative Services remediation at $85/hour, 1–5 hours per document. Midpoint: 6 documents/week × 3 hours × $85 × 52 weeks = $79,560/year; the range is $17,680 (4/wk × 1 hr) to $176,800 (8/wk × 5 hr). Excludes the 2,000+ non-compliant PDFs already on the marketing site (a one-time backlog of $170,000–$850,000 at the same rate), the intranet's several thousand documents, and CETL course remediation. Robison's arithmetic on Vieux's figures; no benchmark of actual current-state spend exists yet.$t$,
    'owner-attested', 'estimated', 'FY27', 'Seth Vieux', '2026-09-03');

  INSERT INTO roi_claims
    (request_id, claim_kind, dimension, basis, evidence, source, status, claimed_by, claimed_at)
  VALUES
  (rid, 'qualitative', 'risk-reduction',
    $t$Fixed regulatory clock with demonstrated litigation exposure. State and local government entities must meet WCAG 2.1 Level AA by April 26, 2027; Idaho agencies have already been sued for non-compliance. UI is ahead of peers in the state, which buys time but not exemption.$t$,
    $t$Vieux, 2026-09-03: "State and local government entities are required to meet the WCAG 2.1 Level AA standard by April 26, 2027. At least two state agencies (Dept State and Idaho Department of Education) have been previously sued for failure to comply with current standards." OMB's aggregate estimate for higher education: $7.1B initial implementation over three years, $1.1B average annual cost after.$t$,
    'owner-attested', 'attested', 'Seth Vieux', '2026-09-03'),

  (rid, 'qualitative', 'time-savings',
    $t$Staff and student time currently absorbed by manual remediation and review. CETL runs 10 part-time student remediators plus its own experts against course materials; UCM's web team reviews every submitted PDF and educates submitters; Creative Services bills 1–5 hours per document. A benchmark for the current state is hard to establish, so this stays qualitative until the tool tracks documents remediated and usage.$t$,
    $t$Vieux, 2026-09-03: "CETL currently employs 10 part-time students (20 hours/week) in addition to their own experts to assist faculty in remediating courses (30 courses completed to date)... UCM's web team invests significant time reviewing PDFs submitted for posting to the marketing site." On measurement: "Staff hours saved / processing time reduced would also be significant measures, though establishing a benchmark for current state may be difficult."$t$,
    'owner-attested', 'attested', 'Seth Vieux', '2026-09-03'),

  (rid, 'qualitative', 'strategic-enablement',
    $t$Shifts remediation left. If the tool assists authors while creating documents rather than only fixing them afterward, it removes the post-hoc remediation step entirely — the metric Vieux calls the most useful. Also the basis for extending CETL's remediator model to non-academic units the Provost wants covered.$t$,
    $t$Vieux, 2026-09-03: "If it is possible for the tool to not only screen and remediate documents, but to proactively assist the user while CREATING accessible documents, that would be an extremely useful metric in saving the staff time required after an inaccessible document is identified for remediation." And: "The Provost has expressed interest in replicating this program to support non-academic units that CETL lacks the resources to assist."$t$,
    'owner-attested', 'attested', 'Seth Vieux', '2026-09-03');

END IF;

END
$mig$;
