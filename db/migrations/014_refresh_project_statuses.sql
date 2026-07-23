-- Migration 014: Refresh confirmed portfolio statuses and descriptions
--
-- Records the July 2026 owner-confirmed project review:
-- - Invoice Processing resumed Accounts Payable user testing and remains building.
-- - Out-of-State Tax Tracking is paused pending Core4 dashboard capacity.
-- - TEMPLATE-app is archived; its OIT-review blocker is no longer active.

BEGIN;

UPDATE applications
SET description =
  'Automates the front of the AP invoice pipeline: emailed invoices are captured, invoices without a PO number are auto-rejected back to the submitter, and the rest have key fields extracted (PO number, dates, invoice number, amount, remit-to address) and compared against PO data in Banner. AP staff work a review queue in a dashboard — correcting low-confidence extractions, requesting fixes from submitters, and marking invoices processed. User testing with Accounts Payable resumed in July 2026.',
    status = 'building'
WHERE slug = 'invoice-processing';

-- Owner-confirmed correction to the cached public summary. Preserve the
-- ClickUp source fingerprint so a genuinely newer ClickUp comment replaces
-- this summary on the next sync.
UPDATE clickup_projects
SET status_summary =
      'As of July 2026, Invoice Processing has resumed user testing with Accounts Payable. The project remains in active development while the team validates the invoice-ingestion and review workflow.',
    status_summary_at = now()
WHERE clickup_list_id = '901713962364';

UPDATE applications
SET description =
  'Tracks state tax withholdings for UI employees working outside Idaho — including international W-4 cases routed through Payroll — and gets them remitted to the right state authorities. Automates the data transfer across systems that Payroll previously reconciled by hand. The project is paused until the Core4 dashboard is ready to accept additional modules.',
    status = 'paused'
WHERE slug = 'out-of-state-tax-tracking';

UPDATE applications
SET tagline = 'Archived reference scaffold for earlier UI business applications.',
    description =
      'Archived scaffold that established an opinionated starting point for University business applications built with agentic AI development. It combined UI''s technology stack, documentation standards, data-governance classification, security controls (JWT, RBAC, dependency scanning), CI/CD, and agent guidance. The record is retained as a reference for applications that adopted its patterns.',
    status = 'archived',
    institutional_review_status = NULL,
    production_scope = NULL,
    support_contact = NULL
WHERE slug = 'template-app';

UPDATE blockers
SET resolved_at = CURRENT_DATE
WHERE application_id = (
  SELECT id FROM applications WHERE slug = 'template-app'
)
  AND category = 'oit-review'
  AND resolved_at IS NULL;

COMMIT;
