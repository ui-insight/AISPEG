-- Migration 016: Update UCM Daily Register and Water Law project status
--
-- Owner-confirmed July 2026 review:
-- - UCM Daily Register is in advanced user testing and ready for repository
--   migration to ui-AI4UI.
-- - Water Law Database is scheduling stakeholder feedback sessions.

BEGIN;

UPDATE applications
SET description =
      'Editorial pipeline for The Daily Register and My UI. Submission intake, AI-assisted style editing (Claude or OpenAI via MindRouter, with AP + UI style enforcement), word-level diff review, section-organized auto-assembly, and branded .docx export. The application is in advanced user testing with the UCM newsletter team and is ready for repository migration to ui-AI4UI.',
    status = 'piloting',
    pilot_cohort = jsonb_build_object(
      'size', 3,
      'scope', 'University Communications and Marketing newsletter team',
      'namedUsers', jsonb_build_array('Joy Bauer', 'Leigh Cooper', 'Jodi Walker')
    )
WHERE slug = 'ucm-daily-register';

UPDATE applications
SET description =
      'Tiered repository of Idaho water law centered on the Snake River Basin Adjudication (SRBA): judicial decisions, historical records, and key settlements, ingested from the existing system and from paper documents via large-scale OCR on IIDS''s on-prem GPU cluster. A web interface supports natural-language queries and visualizations such as diversion maps, giving legislators, water managers, and rights holders fast, verified answers instead of relitigating past disputes. Stakeholder feedback sessions are being scheduled to validate needs and priorities for the next phase.',
    status = 'approved'
WHERE slug = 'water-law-database';

-- Keep the current ClickUp fingerprints so a genuinely newer ClickUp comment
-- naturally supersedes these owner-confirmed summaries.
UPDATE clickup_projects
SET status_summary =
      'As of July 2026, UCM Daily Register is in advanced user testing with the UCM newsletter team. The application is ready for repository migration to ui-AI4UI; its current repository link remains in place until that move is complete.',
    status_summary_at = now()
WHERE clickup_list_id = '901713962400';

UPDATE clickup_projects
SET status_summary =
      'As of July 2026, Water Law Database is scheduling stakeholder feedback sessions to validate needs and priorities for the next phase of work.',
    status_summary_at = now()
WHERE clickup_list_id = '901713962384';

COMMIT;
