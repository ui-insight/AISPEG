-- Migration 035: 'nkn-hosted' deployment environment
--
-- Adds 'nkn-hosted' to the applications deployment vocabulary set by
-- Migrations 024 and 026. It records a project that already runs on
-- Northwest Knowledge Network infrastructure (nkn.uidaho.edu). The
-- first is Curriculum Atlas (courseview.nkn.uidaho.edu), per the
-- Knowledge Base Study review (AISPEG #378).
--
-- It is a meta value, not a seventh target, and it is current-only: it
-- goes in current_deployment_environment, never the proposed column.
-- So only the current CHECK changes, and tech_requests is unchanged.
--
-- Typed source of truth: lib/project-governance.ts. Per the Migration
-- 024/025 discipline, these CHECKs and that module change together.

BEGIN;

ALTER TABLE applications
  DROP CONSTRAINT applications_current_deployment_environment_check;

ALTER TABLE applications
  ADD CONSTRAINT applications_current_deployment_environment_check
    CHECK (current_deployment_environment IN (
      'databricks-dashboard',
      'nexus-module',
      'vandalizer-workflow',
      'standalone-oci',
      'standalone-oit-k8s',
      'rcds-vm',
      'oit-managed-tbd',
      'platform',
      'nkn-hosted',
      'external-hosted',
      'not-applicable'
    ));

COMMIT;
