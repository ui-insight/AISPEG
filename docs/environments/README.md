# Environment definition records

Raw interview records from the deployment-environment definitional pass
(begun August 2026). Nobody at the university had systematically defined
the deployment environments — their technical characteristics,
requirements, and value propositions — so they are being defined one at
a time in working sessions with their operators.

The distilled, typed facts live in
[`lib/deployment-targets.ts`](../../lib/deployment-targets.ts) with
per-environment provenance (`definition.status`); these files are the
audit trail — the questions as asked and the answers as given, verbatim.
An environment whose profile says `repo-inferred` has no record here
yet: its characteristics are this repo's inference from documents, and
its session is pending.

| Environment | Session | Record |
|---|---|---|
| RCDS VM | Luke Sheneman (RCDS), 2026-08-06 | [rcds-vm.md](./rcds-vm.md) |
| Nexus module | pending | — |
| Standalone on OCI | pending | — |
| Standalone on OIT on-prem Kubernetes | pending | — |
| Databricks dashboard | pending | — |
