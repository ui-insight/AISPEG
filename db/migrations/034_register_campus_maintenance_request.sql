-- Migration 034: register the Campus Services Maintenance Tracker request
-- from ClickUp in the Unified Technology Request registry (ADR 0005) and
-- link it to its portfolio entry.
--
-- Origin: ClickUp task 86e2fv0dh in AI4UI New Project Requests, created
-- 2026-07-23. The task had not been ingested into the registry. It is
-- inserted here in the shape the sync writes (origin 'clickup', keyed on
-- clickup_task_id), so a future sync upserts this same row.
--
-- The need statement uses names and roles confirmed by the owner on
-- 2026-11-05. A later sync replaces it with the ClickUp text.
--
-- Same shape as 032: the request records the demand, the portfolio entry
-- `campus-services-maintenance` records the work, and a 'converted-to'
-- link joins them. Disposition stays 'open', matching what the sync maps
-- from the ClickUp status "to be reviewed".

DO $mig$
DECLARE
  rid UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE clickup_task_id = '86e2fv0dh') THEN
    INSERT INTO tech_requests (origin, clickup_task_id, requestor_name, requestor_unit, title, need_statement, disposition, received_at)
    VALUES ('clickup', '86e2fv0dh', 'Greg Fizzell', 'Campus Services (Auxiliary Services)',
      'Campus Services Maintenance Tracker (equipment inventory, scheduled maintenance & life-cycle)',
      $t$Mobile-first, credential-gated web app giving U of I Campus Services (auxiliary buildings: housing and dorms, dining, Kibbie Dome, ICCU Arena, Bruce Pitman Center, Student Union Building, aquatics) one shared place to inventory equipment and building systems, schedule and log maintenance, and support repair-or-replace (life-cycle) decisions.

Users: the Campus Services facilities and maintenance team, an admin or overseer plus field technicians (12 users or fewer). Pilot: New South Hill Apartments (new construction, data available), then older buildings. The data model handles the difference between a fleet of many units (a heat-pump fleet) and one whole system (a building HVAC or pool plant).

Constraints: simple, small, and affordable. No sensitive data; door and keypad codes are explicitly excluded. No integrations in version 1. It complements StarRez (Housing work orders) and FAMIS (Facilities) and replaces neither.

People: sponsor Eric Torok; named owner Greg Fizzell; IIDS tech lead Colin Addington. Built on ui-insight/TEMPLATE-app (FastAPI, React, Vite, TypeScript, PostgreSQL), with Entra ID sign-on at production.$t$,
      'open', '2026-07-23T23:50:52Z')
    RETURNING id INTO rid;

    INSERT INTO tech_request_events (request_id, at, actor, event_type, note)
    VALUES (rid, '2026-07-23T23:50:52Z', 'migration-034', 'received',
      'Registered from ClickUp task 86e2fv0dh, with names and roles confirmed by Robison on 2026-11-05.');
  END IF;

  SELECT id INTO rid FROM tech_requests WHERE clickup_task_id = '86e2fv0dh';
  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
  VALUES (rid, 'campus-services-maintenance', 'converted-to', 'migration-034',
    'The request became the Campus Services Maintenance Tracker, built by IIDS.')
  ON CONFLICT (request_id, application_slug, link_type) DO NOTHING;
END
$mig$;
