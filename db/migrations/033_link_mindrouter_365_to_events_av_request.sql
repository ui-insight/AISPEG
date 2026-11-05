-- Migration 033: link the new mindrouter-365 portfolio entry to the Events
-- AV knowledge base request registered in Migration 031.
--
-- Robison named MindRouter 365 on 2026-11-05 as another way to deliver the
-- assistant: its panel runs as a Teams tab, and the Events SharePoint site
-- is Teams-connected. The tab reads nothing from Teams or SharePoint, so the
-- knowledge would still reach it through a tool server, not a SharePoint
-- connection. The link is 'informs', like the other three on this request.
--
-- The request is looked up by origin and title. The exception fires loudly
-- if it is missing, because the runner records this migration as applied
-- either way. No FK to applications by design (ADR 0005), so the link does
-- not wait on the portfolio seed.

DO $mig$
DECLARE
  rid UUID;
BEGIN
  SELECT id INTO rid FROM tech_requests
  WHERE origin = 'direct' AND title = 'SharePoint chat assistant for the Events AV knowledge base';
  IF rid IS NULL THEN
    RAISE EXCEPTION 'Migration 033: the Events AV request from Migration 031 is missing';
  END IF;

  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
  VALUES (rid, 'mindrouter-365', 'informs', 'migration-033',
    'Another way to deliver the assistant: the MindRouter 365 panel can run as a tab in the Events team''s Teams channel, reading the knowledge base through a tool server.')
  ON CONFLICT (request_id, application_slug, link_type) DO NOTHING;
END
$mig$;
