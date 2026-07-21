-- Migration 012: Project deployment and enterprise-system replacement tracking
--
-- The proposed deployment environment follows the OIT Enterprise AI
-- Development Framework and AI-Assisted Builder Guide discussion drafts.
-- Replacement fields make the incumbent system's annual cost and contract
-- renewal visible when a project is intended to displace enterprise software.

BEGIN;

ALTER TABLE applications
  ADD COLUMN proposed_deployment_environment TEXT NOT NULL
    DEFAULT 'to-be-determined'
    CHECK (proposed_deployment_environment IN (
      'oit-hosted',
      'oit-azure',
      'oit-oci-oke',
      'oit-on-prem-kubernetes',
      'iids-hosted',
      'external-hosted',
      'not-applicable',
      'to-be-determined'
    )),
  ADD COLUMN enterprise_replacement_status TEXT NOT NULL
    DEFAULT 'to-be-determined'
    CHECK (enterprise_replacement_status IN ('yes', 'no', 'to-be-determined')),
  ADD COLUMN existing_enterprise_system_name TEXT,
  ADD COLUMN existing_enterprise_system_annual_cost_usd NUMERIC(14, 2),
  ADD COLUMN existing_enterprise_system_renewal_date DATE,
  ADD CONSTRAINT applications_enterprise_replacement_details_check CHECK (
    (
      enterprise_replacement_status = 'yes'
      AND NULLIF(BTRIM(existing_enterprise_system_name), '') IS NOT NULL
      AND existing_enterprise_system_annual_cost_usd IS NOT NULL
      AND existing_enterprise_system_annual_cost_usd >= 0
    )
    OR
    (
      enterprise_replacement_status IN ('no', 'to-be-determined')
      AND existing_enterprise_system_name IS NULL
      AND existing_enterprise_system_annual_cost_usd IS NULL
      AND existing_enterprise_system_renewal_date IS NULL
    )
  );

-- Both projects are explicitly described in the OIT pathway material as
-- targeting the OIT-hosted Nexus environment. The OpenERA replacement facts
-- come from the portfolio owner and are intentionally backfilled here so an
-- existing database receives the same data as a fresh portfolio seed.
UPDATE applications
SET proposed_deployment_environment = 'oit-hosted'
WHERE slug IN ('openera', 'ucm-daily-register')
   OR (slug IS NULL AND name IN ('OpenERA', 'UCM Daily Register'));

UPDATE applications
SET enterprise_replacement_status = 'yes',
    existing_enterprise_system_name = 'VERAS',
    existing_enterprise_system_annual_cost_usd = 150000.00,
    existing_enterprise_system_renewal_date = DATE '2027-03-31'
WHERE slug = 'openera'
   OR (slug IS NULL AND name = 'OpenERA');

UPDATE applications
SET proposed_deployment_environment = 'oit-hosted',
    enterprise_replacement_status = 'no'
WHERE slug = 'nexus'
   OR (slug IS NULL AND name = 'Nexus');

CREATE INDEX idx_applications_proposed_deployment_environment
  ON applications(proposed_deployment_environment);

CREATE INDEX idx_applications_enterprise_replacement_status
  ON applications(enterprise_replacement_status);

COMMIT;
