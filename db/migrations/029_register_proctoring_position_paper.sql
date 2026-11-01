-- Migration 029: register the CETL online-proctoring position paper in
-- the Unified Technology Request registry (ADR 0005).
--
-- Origin: "Advancing Academic Integrity for Online Assessments", a
-- Center of Excellence for Teaching and Learning position paper dated
-- 2026-09-17 (author of record per the document metadata: Margaret
-- Pinnell, CETL; the body is unsigned and discloses AI-assisted
-- drafting). Received by Robison 2026-09-18. It argues for an
-- institution-wide, multi-modal, tiered approach to proctoring —
-- automated tools for routine and mid-stakes assessments, live
-- proctoring reserved for high-stakes exams — backed by a literature
-- review, a spring 2026 survey of directors and chairs, a comparison
-- of seven commercial platforms, and six recommendations that start
-- with a cross-institutional review committee and a pilot.
--
-- Not new demand: the OIT IDEA form already carries "Proctoring
-- software" (Brian Small, 2025-10-07, Migration 023), inferred Track A /
-- external-hosted. This paper is the institutional-scale case for that
-- same demand, so the two rows are linked 'related' rather than merged
-- — merging is triage's call, and the disposition here stays 'open'
-- with track/stage/target NULL (same posture as 019/020/027). Two
-- adjacent IDEA rows are linked as well: the College of Law's
-- ExamSoft → Surpass transition for the NextGen Bar Exam (the paper's
-- licensure-bound-programs case) and CDAR's mobile exam-scoring review
-- (CDAR is the in-person proctoring operation and a named committee
-- seat).
--
-- No project link: nothing in the IIDS portfolio addresses proctoring.
-- The request is a commercial-platform purchase plus governance, and
-- Canvas integration makes it an OIT / Digital Learning Initiatives
-- matter — that is why it is registered rather than built.
--
-- The IDEA rows are looked up by title; if the 2026-08-02 cut was never
-- imported on this database the related links are simply skipped.

DO $mig$
DECLARE
  rid UUID;
  related_id UUID;
BEGIN

IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = 'Institution-wide online exam proctoring (CETL position paper)') THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_email, requestor_unit, title, need_statement, disposition, received_at)
  VALUES ('direct', 'Margaret Pinnell', 'mpinnell@uidaho.edu', 'Center of Excellence for Teaching and Learning (CETL)',
    'Institution-wide online exam proctoring (CETL position paper)',
    $t$Online and hybrid assessment at UI has outgrown the institution's ability to verify who is taking an exam and under what conditions. In fall 2025 over 486,000 quizzes and exams were administered through the main Canvas instance; the 2026–2030 Strategic Plan commits to expanding flexible, technology-enabled education; and generative AI has made unsupervised online exams easy to compromise. Proctoring practice today is decentralized — individual faculty decide, or do not proctor at all — while several programs report proctoring and identity verification as non-negotiable for specialized accreditation and state licensure.

Evidence: a spring 2026 CETL survey of roughly 50 directors and chairs (15 responses, a 30% rate) found nearly 70% of respondents interested in a future online proctoring implementation. The leading concerns are technical reliability, added faculty workload, student equity and accessibility, and cost to both the institution and students; respondents want proctoring to be a seamless part of the distance-learning experience rather than a fragmented add-on. Two units already run established proctoring processes — Independent Study in Idaho and Engineering Outreach — so the institution has an operational base to consolidate rather than a blank slate.

Proposed shape: not a single tool purchase but an institution-wide, multi-modal, tiered approach that matches oversight to the stakes of the assessment — browser lockdown or light automated oversight for routine quizzes; automated AI proctoring with instructor review of flags for unit exams; automated proctoring paired with live proctor oversight, or full human review of flagged recordings, for finals and certification exams. The paper compares seven platforms (Proctorio, Honorlock, Respondus Monitor, ProctorU, ExamSoft/Examplify, Examity, ProctorTrack) by type, LMS integration, best-fit use, and cost tier, and asks for six things: a cross-institutional review committee (Faculty Senate, CETL, Digital Learning Initiatives, OIT, CDAR, Dean of Students); a limited pilot of the most promising tool across disciplines and course formats; a stakeholder process for live-proctoring strategy in accredited and licensure-bound programs; institutional guidance for faculty on proctoring within the tiered framework; support for CETL's authentic-assessment work as the pedagogical complement; and a clearly communicated institutional direction.

Responsible-use conditions the paper attaches: transparency to students about what is collected, retained, and by whom; surveillance proportional to stakes; human review of every automated flag before any integrity consequence; honoring documented disability accommodations; and attention to the roughly 10% of students whose hardware, connectivity, or testing space cannot meet remote-proctoring requirements. It names algorithmic bias, false positives, test anxiety, and technical failure as risks the implementation has to manage, not footnotes.

Coverage: no IIDS project addresses this; the request is a commercial-platform purchase plus governance, and Canvas integration makes it an OIT / Digital Learning Initiatives matter. The same demand is already in the registry from the OIT IDEA form ("Proctoring software", Brian Small, 2025-10-07); this paper is the institutional-scale case for it. Adjacent registry rows: the College of Law's ExamSoft → Surpass transition for the NextGen Bar Exam, and CDAR's mobile exam-scoring review (CDAR proctored more than 1,500 exams in spring 2025). Data signals: FERPA and PII throughout; biometric data wherever facial recognition or ID verification is switched on.$t$,
    'open', '2026-09-18T19:40:00Z')
  RETURNING id INTO rid;

  INSERT INTO tech_request_events (request_id, at, actor, event_type, note)
  VALUES (rid, '2026-09-18T19:40:00Z', 'migration-029', 'received',
    'Registered from the CETL position paper "Advancing Academic Integrity for Online Assessments" (dated 2026-09-17; author of record Margaret Pinnell per document metadata; the paper discloses drafting assistance from Copilot, Grammarly, and Gemini). Received by Robison 2026-09-18. Same demand as the OIT IDEA "Proctoring software" row; linked, not merged — that call is triage''s.');

  -- Same demand, earlier and narrower: one instructor's IDEA-form ask.
  SELECT id INTO related_id FROM tech_requests
  WHERE origin = 'oit-idea' AND title = 'Proctoring software';
  IF related_id IS NOT NULL THEN
    INSERT INTO tech_request_links (request_id, related_request_id, link_type, created_by, note)
    VALUES (rid, related_id, 'related', 'migration-029',
      'Same demand. The IDEA row is one instructor''s ask (physiology exams in Canvas, students visibly using AI); the position paper is the institution-wide case, survey, platform comparison, and governance proposal for it.')
    ON CONFLICT (request_id, related_request_id, link_type) DO NOTHING;
  END IF;

  -- Licensure-bound exam delivery: the paper's high-stakes tier in
  -- practice, and ExamSoft is one of the seven platforms it compares.
  SELECT id INTO related_id FROM tech_requests
  WHERE origin = 'oit-idea' AND title = 'NextGen Bar Assessment Platform - Surpass Assessment';
  IF related_id IS NOT NULL THEN
    INSERT INTO tech_request_links (request_id, related_request_id, link_type, created_by, note)
    VALUES (rid, related_id, 'related', 'migration-029',
      'The College of Law''s ExamSoft → Surpass transition is the licensure-bound, high-stakes exam case the paper reserves live proctoring for; any institution-wide tiered framework has to accommodate it.')
    ON CONFLICT (request_id, related_request_id, link_type) DO NOTHING;
  END IF;

  -- CDAR runs in-person proctoring today and is a named seat on the
  -- proposed review committee.
  SELECT id INTO related_id FROM tech_requests
  WHERE origin = 'oit-idea' AND title = 'Mobile Exam Scoring Options';
  IF related_id IS NOT NULL THEN
    INSERT INTO tech_request_links (request_id, related_request_id, link_type, created_by, note)
    VALUES (rid, related_id, 'related', 'migration-029',
      'CDAR proctored 1,500+ exams in spring 2025 and is asking which exam-scoring tools are approved; the paper names CDAR to the review committee and its accommodations rule depends on CDAR''s process.')
    ON CONFLICT (request_id, related_request_id, link_type) DO NOTHING;
  END IF;
END IF;

END
$mig$;
