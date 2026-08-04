-- Migration 022: record Ben Hunter's qualitative ROI case for the
-- VandalChat request (Migration 020) as five kind-discriminated
-- roi_claims rows (Migration 021).
--
-- Source: Hunter's ROI/impact justification from the "MindRouter vs.
-- boisestate.ai" thread (2026-07-30) as cleaned up and delivered
-- 2026-08-03, with verbatim Operational Excellence survey responses as
-- evidence — the assignment Robison's 2026-07-31 email gave him.
-- Dimensions come from lib/utr.ts; `strategic-enablement` lands there
-- alongside this migration.
--
-- Ordering: depends on the VandalChat registry row from Migration 020.
-- Lexicographic application order guarantees 020 runs first in any
-- single migration batch; the exception below only fires if this file
-- somehow reaches a database that never applied 020 — loud beats a
-- silent forever-skip, because the runner records this migration as
-- applied either way.

DO $mig$
DECLARE
  rid UUID;
BEGIN

SELECT id INTO rid FROM tech_requests
WHERE origin = 'direct' AND title = 'VandalChat — campus-wide AI chat on MindRouter';

IF rid IS NULL THEN
  RAISE EXCEPTION 'Migration 022 requires the VandalChat request from Migration 020 — apply 020 first.';
END IF;

IF NOT EXISTS (
  SELECT 1 FROM roi_claims WHERE request_id = rid AND claim_kind = 'qualitative'
) THEN

  INSERT INTO roi_claims
    (request_id, claim_kind, dimension, basis, evidence, source, status, claimed_by, claimed_at)
  VALUES
  (rid, 'qualitative', 'cost-avoidance',
    $t$Adoption yield on the fall marketing spend. The awareness push drives the whole campus at MindRouter at once; most arrivals will expect a chat box, and without one they read MindRouter as a complicated tool "not for them" and don't come back. First impressions are non-renewable — losing them means paying the acquisition cost twice.$t$,
    $t$Operational Excellence survey, on the Inside U of I rollout: "It's one thing to handle the technical aspects of rolling out a web platform. It's another to provide the needs discovery, training, communication and post-launch adjustments to support your population through the adoption of that platform."$t$,
    'owner-attested', 'attested', 'Ben Hunter', '2026-08-03'),

  (rid, 'qualitative', 'cost-avoidance',
    $t$License cost avoidance. Every user who lands on MindRouter is a user not requesting an individual frontier-model seat. Staff are already paying out of pocket and out of grants — uncontrolled spend the university absorbs anyway, just less visibly.$t$,
    $t$Operational Excellence survey: "I think premium plans to chat GPT and Gemini could be of great value to us. I use these all the time, but I have to find grants or other sources to pay for this type of program."$t$,
    'owner-attested', 'attested', 'Ben Hunter', '2026-08-03'),

  (rid, 'qualitative', 'risk-reduction',
    $t$Data retention on our own network. Staff handle university data (Banner, Slate, grants, student records) as the core of their work; novice-friendly access is what keeps that work inside the perimeter instead of pasted into a free consumer tier. The highest-leverage risk reduction in the proposal — and it only works if the tool is easy enough that people don't route around it.$t$,
    $t$Ben Hunter, 2026-07-30 thread: "More than any other group on campus, our staff are dealing with university data as a core part of their work. Making MindRouter approachable and usable to novice users keeps that much more data within our network."$t$,
    'owner-attested', 'attested', 'Ben Hunter', '2026-08-03'),

  (rid, 'qualitative', 'strategic-enablement',
    $t$Makes broad staff training possible at all. Senior leadership wants staff AI training, and a broad-based curriculum requires a common, accessible interface — it can't be built on free tiers or on tools people buy individually.$t$,
    $t$Operational Excellence survey: "I would love it if the UofI created a position to give training and 'office hours' for admin and finance people to help in ways AI may be used to make our jobs easier, and what are the regulations regarding AI."$t$,
    'owner-attested', 'attested', 'Ben Hunter', '2026-08-03'),

  (rid, 'qualitative', 'strategic-enablement',
    $t$A real answer to the recurring campus-license question. "When is the university going to provide ChatGPT/Claude/Gemini to everyone?" currently gets answered with "we can't afford it"; VandalChat on MindRouter is a credible institutional answer.$t$,
    $t$Operational Excellence survey: "the dearth of options for AI... their whole strategy on AI appears muddled. Most universities now have signed up for ChatGPT.edu."$t$,
    'owner-attested', 'attested', 'Ben Hunter', '2026-08-03');

END IF;

END
$mig$;
