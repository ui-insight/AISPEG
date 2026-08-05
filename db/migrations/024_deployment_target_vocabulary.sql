-- Migration 024: Five-target deployment vocabulary + current/proposed split
--
-- Replaces the hosting-only vocabulary from Migration 012 with the
-- five-target model settled 2026-08-05: two platform-hosted form factors
-- (databricks-dashboard, nexus-module) plus three standalone-app hosting
-- locations (standalone-oci, standalone-oit-k8s, rcds-vm), a rollup
-- (oit-managed-tbd), and the surviving meta values. Azure is dropped
-- with zero uses. The RCDS VM is transitional by decision, which forces
-- the current/proposed split: where a project runs now and where it is
-- headed are separate facts. NULL current means nothing is running.
--
-- Typed source of truth: lib/project-governance.ts (vocabulary) and
-- lib/deployment-targets.ts (per-target characteristics).

BEGIN;

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_proposed_deployment_environment_check;

-- Value-level remaps (no rows carry the OIT platform-specific values
-- today; mapped anyway so a drifted database can't strand a row).
UPDATE applications
SET proposed_deployment_environment = 'standalone-oci'
WHERE proposed_deployment_environment = 'oit-oci-oke';

UPDATE applications
SET proposed_deployment_environment = 'standalone-oit-k8s'
WHERE proposed_deployment_environment = 'oit-on-prem-kubernetes';

UPDATE applications
SET proposed_deployment_environment = 'oit-managed-tbd'
WHERE proposed_deployment_environment = 'oit-azure';

-- Per-slug remaps of the coarse 'oit-hosted' claim: three projects are
-- explicitly Nexus-bound per the OIT pathway material; Nexus itself is a
-- platform, not a workload targeting one.
UPDATE applications
SET proposed_deployment_environment = 'nexus-module'
WHERE proposed_deployment_environment = 'oit-hosted'
  AND slug IN ('retroactive-payment-requests', 'openera', 'ucm-daily-register');

UPDATE applications
SET proposed_deployment_environment = 'platform'
WHERE proposed_deployment_environment = 'oit-hosted'
  AND slug = 'nexus';

-- Out-of-State Tax Tracking is feature-complete and paused pending
-- Nexus onboarding (its own description) — the target is known.
UPDATE applications
SET proposed_deployment_environment = 'nexus-module'
WHERE slug = 'out-of-state-tax-tracking';

-- Remaining 'oit-hosted' rows (Vandals Stats Pipeline) keep the
-- governance decision without a platform pick.
UPDATE applications
SET proposed_deployment_environment = 'oit-managed-tbd'
WHERE proposed_deployment_environment = 'oit-hosted';

-- 'iids-hosted' splits: MindRouter and DGX Stack are platforms; the
-- Data Infrastructure Pilot delivers the AI4RA lakehouse platform; any
-- straggler falls back to to-be-determined (the Video Storyboard app's
-- running home is recorded in current_deployment_environment below).
UPDATE applications
SET proposed_deployment_environment = 'platform'
WHERE slug IN ('mindrouter', 'dgx-stack', 'data-infrastructure-pilot');

UPDATE applications
SET proposed_deployment_environment = 'to-be-determined'
WHERE proposed_deployment_environment = 'iids-hosted';

ALTER TABLE applications
  ADD CONSTRAINT applications_proposed_deployment_environment_check
    CHECK (proposed_deployment_environment IN (
      'databricks-dashboard',
      'nexus-module',
      'standalone-oci',
      'standalone-oit-k8s',
      'rcds-vm',
      'oit-managed-tbd',
      'platform',
      'external-hosted',
      'not-applicable',
      'to-be-determined'
    ));

-- Where the project runs today. NULL = nothing running;
-- 'to-be-determined' is deliberately excluded (absence carries it).
ALTER TABLE applications
  ADD COLUMN current_deployment_environment TEXT
    CHECK (current_deployment_environment IN (
      'databricks-dashboard',
      'nexus-module',
      'standalone-oci',
      'standalone-oit-k8s',
      'rcds-vm',
      'oit-managed-tbd',
      'platform',
      'external-hosted',
      'not-applicable'
    ));

UPDATE applications
SET current_deployment_environment = 'rcds-vm'
WHERE slug IN (
  'stratplan',
  'audit-dashboard',
  'ucm-daily-register',
  'mindrouter-video-storyboard',
  'vandalizer',
  'processmapping',
  'openera',
  'execord',
  'rfd-career',
  'universo'
);

UPDATE applications
SET current_deployment_environment = 'nexus-module'
WHERE slug = 'retroactive-payment-requests';

CREATE INDEX idx_applications_current_deployment_environment
  ON applications(current_deployment_environment);

COMMIT;
