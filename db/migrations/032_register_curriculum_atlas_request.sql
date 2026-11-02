-- Migration 032: register the Curriculum Atlas request in the Unified
-- Technology Request registry (ADR 0005) and link it to its portfolio entry.
--
-- Origin: Erin James asked Luke Sheneman for the tool in person at the
-- IMCI/IIDS AI workshop on 2026-10-24. Sheneman shared a working draft on
-- 2026-10-29, and James answered Robison's intake questions by email on
-- 2026-10-30. received_at is the workshop date; its time of day is a
-- placeholder.
--
-- Same shape as 027/028: the request records the demand, the portfolio
-- entry `curriculum-atlas` records the work, and a 'converted-to' link
-- joins them. Disposition stays 'open' and track/stage/target stay NULL,
-- because conversion to a tracked prototype is a fact and prioritization
-- is triage's call.
--
-- No roi_claims row: James confirmed the tool saves time but no measure
-- exists yet. Robison's one timed question is in the need statement as an
-- anecdote, not a claim.
--
-- Related rows are looked up by origin and title, and an absent row skips
-- its link. Ordering: depends on the handbook request from Migration 031.
-- The exception fires loudly if that row is missing, because the runner
-- records this migration as applied either way.

DO $mig$
DECLARE
  atlas_title CONSTANT TEXT := 'Curriculum Atlas: how programs and units rely on each other''s courses';
  handbook_title CONSTANT TEXT := 'EPPN graduate student handbook refresh and upkeep system';
  rid UUID;
  related_id UUID;
BEGIN

IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = handbook_title) THEN
  RAISE EXCEPTION 'Migration 032 requires the EPPN handbook request from Migration 031 — apply 031 first.';
END IF;

IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = atlas_title) THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_email, requestor_unit, title, need_statement, disposition, received_at)
  VALUES ('direct', 'Erin James', 'ejames@uidaho.edu', 'Director of Curricular Innovation, with the Vice-Provost of Academic Initiatives',
    atlas_title,
    $t$Erin James, Director of Curricular Innovation, asked Luke Sheneman for this tool in consultation with Gwen Gorzelsky, Vice-Provost of Academic Initiatives. They are assessing and revising campus program health processes. That work has two aims: a system more useful to faculty, and persuasive ways to show the State Board of Education how the curriculum fits together. They want to see how programs and departments are intermeshed.

Users today are James and Gorzelsky. James expects possible later use by faculty more broadly and by stakeholders outside the university. She defines finished as James, Gorzelsky, and Sheneman being confident that it has no major errors or inconsistencies in how it represents the catalog. Sheneman and James plan several rounds of data auditing to capture catalog nuances.

The data is public: the application reads the university catalog. It does not replace existing software or a planned purchase. James places it under adapting the educational model and optimizing institutional effectiveness in the strategic plan, and says it will save time, though no measure is defined yet. Robison's first test was one question answered in under a second that he estimates would take 10 to 30 minutes by conventional means.

Effort so far: James spent 45 minutes on a first draft and an hour with Sheneman, and Sheneman built the current draft with AI assistance. Remaining effort and resources are not yet stated. The current build (edition 2026-2027, built 2026-10-30) covers 505 programs, 5,220 courses, and 398 logged catalog issues, and reports catalog structure, not enrollment.

Limit to carry into program health work: the catalog publishes no requirements for 58 of 160 graduate programs, including 22 of 33 doctoral programs, so the atlas cannot yet show how those programs depend on other units. For Entomology, the catalog points to the department handbook instead.

Robison wants to link it to the compliance tool. Related work: Sande Schlueter's Program Inventory Clean-up from the same vice provost's office, and the EPPN handbook request.$t$,
    'open', '2026-10-24T18:00:00Z')
  RETURNING id INTO rid;

  INSERT INTO tech_request_events (request_id, at, actor, event_type, note)
  VALUES (rid, '2026-10-24T18:00:00Z', 'migration-032', 'received',
    'Requested in person by Erin James of Luke Sheneman at the IMCI/IIDS AI workshop. Recorded from James''s 2026-10-30 reply to Robison''s intake questions.');

  INSERT INTO tech_request_events (request_id, at, actor, event_type, to_value, note)
  VALUES (rid, '2026-10-29T19:10:00Z', 'migration-032', 'converted', 'curriculum-atlas',
    'Sheneman shared a working draft with James and Robison on 2026-10-29. It enters the portfolio as `curriculum-atlas` (prototype).');

  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
  VALUES
    (rid, 'curriculum-atlas', 'converted-to', 'migration-032',
      'The Curriculum Atlas is the tool this request asked for; working draft as of 2026-10-29.'),
    (rid, 'execord', 'informs', 'migration-032',
      'Robison wants to link the atlas to the compliance tool.')
  ON CONFLICT (request_id, application_slug, link_type) DO NOTHING;

  SELECT id INTO related_id FROM tech_requests WHERE origin = 'clickup' AND title = 'Program Inventory Clean-up';
  IF related_id IS NOT NULL THEN
    INSERT INTO tech_request_links (request_id, related_request_id, link_type, created_by, note)
    VALUES (rid, related_id, 'related', 'migration-032',
      'Same office and same source: Schlueter is validating catalog offerings against NWCCU, OSBE, and Registrar data, and the atlas already structures the catalog.')
    ON CONFLICT (request_id, related_request_id, link_type) DO NOTHING;
  END IF;
END IF;

-- ── The EPPN handbook request draws on the atlas ──────────────

SELECT id INTO rid FROM tech_requests WHERE origin = 'direct' AND title = handbook_title;
INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
VALUES (rid, 'curriculum-atlas', 'informs', 'migration-032',
  'Supplies catalog course data and the Plant Pathology M.S. requirements. The handbook is the requirements source the catalog points to for Entomology, so the two can inform each other.')
ON CONFLICT (request_id, application_slug, link_type) DO NOTHING;

SELECT id INTO related_id FROM tech_requests WHERE origin = 'direct' AND title = atlas_title;
INSERT INTO tech_request_links (request_id, related_request_id, link_type, created_by, note)
VALUES (rid, related_id, 'related', 'migration-032',
  'Handbooks may hold the requirements the catalog does not publish, which is the atlas''s largest coverage gap for graduate programs.')
ON CONFLICT (request_id, related_request_id, link_type) DO NOTHING;

END
$mig$;
