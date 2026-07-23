-- Migration 015: Apply the July 22, 2026 project-status meeting review
--
-- Source: owner-provided meeting transcript. This migration records only
-- explicit project facts and the OSP-module mapping documented in the
-- canonical portfolio. It does not infer new lifecycle stages.

BEGIN;

UPDATE applications
SET description =
  'Replaces the paper/email retroactive payment request process with a validated electronic submission flow plus a dashboard for payroll analysts. Submissions are checked for completeness and verified against Banner data before they reach an analyst, so corrections happen at intake instead of mid-process. As of July 2026, several pull requests are ready for testing and temporary reactivation of the test environment has been requested.'
WHERE slug = 'retroactive-payment-requests';

UPDATE applications
SET description =
  'Institutional sponsored-research administration system, operated by IIDS for the Office of Research and Economic Development. The canonical implementor of the AI4RA Unified Data Model in research administration: 32 tables spanning 20 canonical UDM tables and 12 project-specific extensions. AI4RA Core dual-destiny project; designed to be deployable beyond UI as the partnership matures. As of July 2026, the team has outlined the VERAS-replacement MVP and the required dual-operation period, with three to four developers contributing. The renamed OSP module is in development, with its sub-module access structure awaiting Microsoft Entra group creation; transfer of the repository to the new UI AI for UI GitHub organization is also pending.'
WHERE slug = 'openera';

UPDATE applications
SET description =
  'React + FastAPI application platform running on OIT-managed secure infrastructure, built collaboratively by OIT and IIDS. Nexus is the institutional template where University of Idaho application modules are deployed, providing a shared, audited, and security-hardened runtime for AI-enabled and traditional unit-level apps. Complements TEMPLATE-app: where TEMPLATE-app is the development scaffold, Nexus is the production landing zone. Governed by OIT''s Enterprise AI Development Framework (the approved tech stack) and AI-Assisted Builder Guide (the six-stage pathway for teams outside OIT); OpenERA and UCM Daily Register are the first IIDS-built applications entering that pathway. Nexus continues to receive regular updates; recurring security-review tickets and approval steps on pull requests are the main reported delivery friction.'
WHERE slug = 'nexus';

-- Public status summaries derived from the meeting. For rows with an existing
-- ClickUp fingerprint, keep it unchanged so a newer ClickUp comment naturally
-- supersedes the meeting summary on the next sync.
UPDATE clickup_projects
SET status_summary =
      'As of July 22, 2026, Retroactive Payment Requests remains in active development. Several pull requests are ready for testing, and temporary reactivation of the test environment has been requested so validation can proceed.',
    status_summary_at = now()
WHERE clickup_list_id = '901713962307';

UPDATE clickup_projects
SET status_summary =
      'As of July 22, 2026, the VERAS replacement team has outlined the MVP and the required dual-operation period with VERAS. Three to four developers are contributing, issues are logged, and transfer of the repository to the new UI AI for UI GitHub organization remains pending. The renamed OSP module is waiting on an access-group dependency before sub-module work can proceed.',
    status_summary_at = now()
WHERE clickup_list_id = '901713962269';

UPDATE clickup_projects
SET status_summary =
      'As of July 22, 2026, Nexus continues to receive regular updates. Recurring security-review tickets and approval steps on pull requests are the main reported delivery friction, and the team is reviewing whether that process can be made more efficient.',
    status_summary_at = now()
WHERE clickup_list_id = '901713962298';

INSERT INTO blockers (
  application_id, category, named_party, since,
  public_text, internal_text, severity
)
SELECT
  a.id,
  'oit-standards',
  'OIT',
  DATE '2026-07-22',
  'OSP sub-module access controls are awaiting Microsoft Entra group creation.',
  'Nathan Layman reported that the renamed OSP module cannot implement its sub-module structure until the requested Entra group is created. Blair had reached out to Dan; status was still pending at the July 22 meeting.',
  'medium'
FROM applications a
WHERE a.slug = 'openera'
  AND NOT EXISTS (
    SELECT 1
    FROM blockers b
    WHERE b.application_id = a.id
      AND b.category = 'oit-standards'
      AND b.resolved_at IS NULL
      AND b.public_text =
        'OSP sub-module access controls are awaiting Microsoft Entra group creation.'
  );

INSERT INTO blockers (
  application_id, category, named_party, since,
  public_text, internal_text, severity
)
SELECT
  a.id,
  'compliance',
  'OIT Security (SEC)',
  DATE '2026-07-22',
  'Release pull requests trigger recurring security-review tickets and approval steps.',
  'Colin Addington reported that Nexus PRs repeatedly open SEC-team vulnerability tickets and require Nathan''s approval before release. Work continues, but the repeated approval path is creating delivery friction.',
  'low'
FROM applications a
WHERE a.slug = 'nexus'
  AND NOT EXISTS (
    SELECT 1
    FROM blockers b
    WHERE b.application_id = a.id
      AND b.category = 'compliance'
      AND b.resolved_at IS NULL
      AND b.public_text =
        'Release pull requests trigger recurring security-review tickets and approval steps.'
  );

COMMIT;
