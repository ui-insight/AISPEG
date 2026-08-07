-- Migration 026: Vandalizer workflow — the sixth deployment target
--
-- Adds 'vandalizer-workflow' to the deployment vocabulary established
-- by Migrations 024 (applications) and 025 (tech_requests): a third
-- platform-hosted form factor alongside the Databricks dashboard and
-- the Nexus module. The ship unit is an extraction workflow, document
-- collection, or workspace inside Vandalizer (vandalizer.uidaho.edu) —
-- no application to host. Every UI person already has access (affirmed
-- 2026-08-07), so document-shaped requests can classify here instead of
-- being forced to a standalone target or left unclassified.
--
-- MindRouter is deliberately NOT a target: it is an inference gateway
-- applications call — a dependency, not a place work lands. A request
-- fully met by existing platform capability closes as
-- routed-to-existing (Migration 018 vocabulary), with or without a
-- target classification.
--
-- Typed source of truth: lib/project-governance.ts (vocabulary),
-- lib/deployment-targets.ts (per-target characteristics), lib/utr.ts
-- (request-classifiable subset). Per Migrations 024/025 discipline, the
-- CHECKs here and those modules change together.

BEGIN;

ALTER TABLE applications
  DROP CONSTRAINT applications_proposed_deployment_environment_check;

ALTER TABLE applications
  ADD CONSTRAINT applications_proposed_deployment_environment_check
    CHECK (proposed_deployment_environment IN (
      'databricks-dashboard',
      'nexus-module',
      'vandalizer-workflow',
      'standalone-oci',
      'standalone-oit-k8s',
      'rcds-vm',
      'oit-managed-tbd',
      'platform',
      'external-hosted',
      'not-applicable',
      'to-be-determined'
    ));

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
      'external-hosted',
      'not-applicable'
    ));

ALTER TABLE tech_requests
  DROP CONSTRAINT tech_requests_proposed_deployment_target_check;

ALTER TABLE tech_requests
  ADD CONSTRAINT tech_requests_proposed_deployment_target_check
    CHECK (proposed_deployment_target IN (
      'databricks-dashboard',
      'nexus-module',
      'vandalizer-workflow',
      'standalone-oci',
      'standalone-oit-k8s',
      'rcds-vm',
      'oit-managed-tbd',
      'external-hosted',
      'not-applicable'
    ));

COMMIT;
