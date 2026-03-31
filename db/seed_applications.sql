-- Seed: Populate application registry with current portfolio
-- Run with: psql "$DATABASE_URL" -f db/seed_applications.sql

BEGIN;

-- Clear existing applications (idempotent re-seed)
DELETE FROM similarity_matches;
DELETE FROM applications;

-- ═══════════════════════════════════════════════════════════════
-- PRODUCTION APPLICATIONS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'OpenERA',
  'Open-source electronic research administration system. Flagship pre-award proposal management platform with 9-step wizard, IACUC/IRB/IBC protocol workflows, NSF budget builder, Excel import/export, RFA AI extraction, compliance tracking, and multi-level approval workflow.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  'https://openera.insight.uidaho.edu',
  1,
  'production',
  ARRAY['internal', 'sensitive'],
  'high',
  'campus-wide',
  'role-based',
  ARRAY['Banner', 'NSF', 'Claude API'],
  ARRAY['PostgreSQL', 'Excel imports'],
  ARRAY['Banner', 'VERAS'],
  ARRAY['proposals', 'budgets', 'compliance reports', 'Excel exports']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'VERASUnlimited',
  'Open-source pre-award proposal management system for research administration, developed as part of the NSF GRANTED project. Features 9-step proposal wizard, NSF budget builder, F&A Sankey diagram, RFA AI extraction, compliance tracking, approval workflow, 27 document types, and personnel review matrix.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  1,
  'production',
  ARRAY['internal', 'sensitive'],
  'high',
  'multi-institution',
  'role-based',
  ARRAY['NSF', 'Claude API'],
  ARRAY['PostgreSQL'],
  ARRAY[]::TEXT[],
  ARRAY['proposals', 'budgets', 'compliance reports']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'The Daily Register (UCMDailyRegister-App)',
  'AI-assisted newsletter production pipeline for UCM team. Produces The Daily Register and My UI newsletters with style rule injection into LLM prompts, newsletter editing pipeline, and structured JSON response generation.',
  'Barrie Robison',
  NULL,
  'University Communications and Marketing',
  'https://ucmnews.insight.uidaho.edu',
  2,
  'production',
  ARRAY['internal'],
  'medium',
  'department',
  'role-based',
  ARRAY['Claude API', 'OpenAI API'],
  ARRAY['PostgreSQL', 'news feeds'],
  ARRAY[]::TEXT[],
  ARRAY['newsletters', 'HTML content']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'GPSA Graduate Symposium',
  'Judge scoring system for GPSA Graduate Student Symposium. Supports poster and art presentation scoring with judge scoring interface, auto-tallying, admin dashboard for ranked results, and dual-auth (admin + 6-char judge codes).',
  'Barrie Robison',
  NULL,
  'Graduate and Professional Student Association',
  NULL,
  3,
  'production',
  ARRAY['internal'],
  'low',
  'event-specific',
  'code-based',
  ARRAY[]::TEXT[],
  ARRAY['SQLite'],
  ARRAY[]::TEXT[],
  ARRAY['scores', 'rankings']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'AISPEG',
  'Interactive collaborative hub for the AI Strategic Planning & Evaluation Group at University of Idaho. Dashboard with metrics, strategic principles, lessons learned, agent playbook, projects table, knowledge base, roadmap, and application registry.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  'https://aispeg.insight.uidaho.edu',
  2,
  'production',
  ARRAY['public'],
  'medium',
  'campus-wide',
  'none',
  ARRAY['Claude API'],
  ARRAY['PostgreSQL'],
  ARRAY[]::TEXT[],
  ARRAY['dashboards', 'reports']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'ProcessMapping',
  'Full-stack process intelligence application for mapping Research Administration processes. Produces structured process maps and Vandalizer-compatible workflows with interactive process exploration and transcript ingestion.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  'https://processmapping.insight.uidaho.edu',
  2,
  'production',
  ARRAY['internal'],
  'medium',
  'department',
  'none',
  ARRAY['Claude API'],
  ARRAY['JSON files'],
  ARRAY[]::TEXT[],
  ARRAY['process maps', 'workflow definitions']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'VMDashboard',
  'Monitoring dashboard for Docker-deployed projects on openera.insight.uidaho.edu. Monitors health status and logs for all Insight applications via internal Docker collector for socket access.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  2,
  'production',
  ARRAY['internal'],
  'medium',
  'admin-only',
  'none',
  ARRAY['Docker API'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY['dashboards', 'logs']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'InvoiceReconciler',
  'Open-source invoice reconciliation tool for matching invoices to transaction reports. 3-step wizard with smart column detection, two-pass matching algorithm (exact + fuzzy), configurable tolerances, and Excel/CSV export.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  3,
  'production',
  ARRAY['internal', 'sensitive'],
  'medium',
  'department',
  'none',
  ARRAY[]::TEXT[],
  ARRAY['CSV', 'Excel', 'PDF'],
  ARRAY[]::TEXT[],
  ARRAY['reconciliation reports', 'Excel exports']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'RFD CAREER Club Dashboard',
  'Cohort progress tracking dashboard for RFD CAREER Club using workbook data. Features cohort dashboard, participant tracking, admin session model, workbook import/reload, and shared editing.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  3,
  'production',
  ARRAY['internal'],
  'low',
  'program-specific',
  'role-based',
  ARRAY[]::TEXT[],
  ARRAY['Excel workbooks'],
  ARRAY[]::TEXT[],
  ARRAY['dashboards', 'progress reports']
);

-- ═══════════════════════════════════════════════════════════════
-- IN-DEVELOPMENT APPLICATIONS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'AuditDashboard',
  'Track audit observations from SBOE internal audit reports, monitor corrective actions, and manage responsible party assignments. Features PDF upload with AI extraction pipeline (OCR + LLM) and human review interface.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  2,
  'in-development',
  ARRAY['internal', 'sensitive'],
  'high',
  'admin-only',
  'role-based',
  ARRAY['Claude API'],
  ARRAY['PostgreSQL', 'PDF uploads'],
  ARRAY['SBOE audit system'],
  ARRAY['dashboards', 'corrective action reports']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'ExecOrd (EO Compliance Tracker)',
  'Web application for tracking Executive Order compliance across deployed applications. Integrated with shared PostgreSQL infrastructure.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  2,
  'in-development',
  ARRAY['internal'],
  'medium',
  'admin-only',
  'role-based',
  ARRAY[]::TEXT[],
  ARRAY['PostgreSQL'],
  ARRAY[]::TEXT[],
  ARRAY['compliance reports', 'dashboards']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'INfamis (FAMIS Replacement)',
  'Modern replacement for legacy FAMIS system. Facilities management and asset tracking application built on the standard template scaffold.',
  'Barrie Robison',
  NULL,
  'Facilities Management',
  NULL,
  2,
  'in-development',
  ARRAY['internal'],
  'medium',
  'department',
  'role-based',
  ARRAY[]::TEXT[],
  ARRAY['PostgreSQL'],
  ARRAY['FAMIS (legacy)'],
  ARRAY['asset reports', 'work orders']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'Bank Reconciliation',
  'Bank statement and ledger upload/reconciliation workflow. Features column mapping, fuzzy transaction matching, configurable tolerances, and Excel/CSV export.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  3,
  'in-development',
  ARRAY['internal', 'sensitive'],
  'medium',
  'department',
  'none',
  ARRAY[]::TEXT[],
  ARRAY['CSV', 'Excel', 'bank statements'],
  ARRAY[]::TEXT[],
  ARRAY['reconciliation reports', 'Excel exports']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'NCBA Interviews Dashboard',
  'Interactive dashboard for analyzing 126+ semi-structured stakeholder interviews for the National Cattlemen''s Beef Association. Features interview data model, thematic analysis support, and 3-era historical framing (Pioneer/Transition/Future).',
  'Barrie Robison',
  NULL,
  'College of Agricultural and Life Sciences',
  NULL,
  3,
  'in-development',
  ARRAY['internal'],
  'medium',
  'research-team',
  'role-based',
  ARRAY[]::TEXT[],
  ARRAY['SQLite', 'interview transcripts'],
  ARRAY[]::TEXT[],
  ARRAY['dashboards', 'thematic analysis']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'SEM Experiential Learning',
  'Strategic experiential learning application built on the standard template scaffold.',
  'Barrie Robison',
  NULL,
  'Strategic Enrollment Management',
  NULL,
  3,
  'in-development',
  ARRAY['internal'],
  'low',
  'department',
  'role-based',
  ARRAY[]::TEXT[],
  ARRAY['PostgreSQL'],
  ARRAY[]::TEXT[],
  ARRAY['dashboards']
);

-- ═══════════════════════════════════════════════════════════════
-- PLANNING / IDEA STAGE
-- ═══════════════════════════════════════════════════════════════

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'ERAMigration',
  'Migration planning from legacy VERAS/Banner system to OpenERA using the Unified Data Model. Field mappings, UDM schema inventory, gap analysis, ETL planning, and validation scripts.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  1,
  'idea',
  ARRAY['internal', 'sensitive'],
  'high',
  'campus-wide',
  'none',
  ARRAY['Banner', 'VERAS'],
  ARRAY['Banner exports', 'VERAS data'],
  ARRAY['Banner', 'VERAS'],
  ARRAY['migration scripts', 'validation reports']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'LakehouseIntegration',
  'Data lakehouse modernization project for aligning institutional data architecture. Status tracking, Huron alignment analysis, and consortium strategic rationale.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  2,
  'idea',
  ARRAY['internal'],
  'high',
  'campus-wide',
  'none',
  ARRAY['Huron'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY['strategic plans', 'alignment reports']
);

-- ═══════════════════════════════════════════════════════════════
-- INFRASTRUCTURE / SUPPORTING SERVICES
-- ═══════════════════════════════════════════════════════════════

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'insight-db (Shared PostgreSQL)',
  'Single PostgreSQL 16 container shared across all UI Insight applications. Pre-configured databases for OpenERA, UCM, Audit Dashboard, ProcessMapping, ExecOrd. Uses 10.x.x.x subnet with idempotent bootstrap SQL.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  1,
  'production',
  ARRAY['internal', 'sensitive'],
  'medium',
  'infrastructure',
  'none',
  ARRAY['Docker'],
  ARRAY['PostgreSQL'],
  ARRAY[]::TEXT[],
  ARRAY['database services']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'Data Governance Repository',
  'Institutional data governance documentation repository. Catalogs applications, defines naming conventions (UDM), AllowedValues pattern, and governance drift checks using MkDocs Material and Python validation scripts.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  2,
  'production',
  ARRAY['public'],
  'low',
  'campus-wide',
  'none',
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY['documentation', 'validation reports']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'TEMPLATE-app',
  'Production-ready reference template for university business applications. Complete documentation standards, CLAUDE.md guidance, security frameworks, and CI/CD setup. Used as scaffold for multiple projects.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  3,
  'production',
  ARRAY['public'],
  'low',
  'developers',
  'none',
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY['project scaffolds']
);

-- ═══════════════════════════════════════════════════════════════
-- RESEARCH / ANALYSIS TOOLS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'RAGBot Evaluation Tool',
  'RAG (Retrieval Augmented Generation) evaluation tool for testing and benchmarking RAG architectures.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  4,
  'in-development',
  ARRAY['internal'],
  'medium',
  'research-team',
  'none',
  ARRAY['Claude API'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY['evaluation reports']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'AI4RA Open Source Site',
  'AI for Research Administration open-source initiative website and materials.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  3,
  'in-development',
  ARRAY['public'],
  'low',
  'multi-institution',
  'none',
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY['website', 'documentation']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'GBRC Website',
  'Georgia Beef Research Consortium website and supporting checkbox application.',
  'Barrie Robison',
  NULL,
  'College of Agricultural and Life Sciences',
  NULL,
  4,
  'in-development',
  ARRAY['public'],
  'low',
  'external',
  'none',
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY['website']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'SyntheticPersonas',
  'Synthetic persona generation tool for testing, demos, and user research simulations.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  4,
  'idea',
  ARRAY['internal'],
  'low',
  'research-team',
  'none',
  ARRAY['Claude API'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY['persona profiles']
);

-- ═══════════════════════════════════════════════════════════════
-- DOCUMENT / DATA PROJECTS (non-app, but tracked)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'ReconcileMJ (Manual Journal Workbench)',
  'Manual journal entry reconciliation workbench with HTML interface for matching and reviewing journal entries.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  4,
  'production',
  ARRAY['internal', 'sensitive'],
  'low',
  'department',
  'none',
  ARRAY[]::TEXT[],
  ARRAY['spreadsheets'],
  ARRAY[]::TEXT[],
  ARRAY['reconciliation reports']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'EIS Data Fetcher',
  'Python script for fetching Idaho EIS (Education Information System) data.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  4,
  'production',
  ARRAY['internal'],
  'low',
  'admin-only',
  'none',
  ARRAY['Idaho EIS'],
  ARRAY['EIS API'],
  ARRAY[]::TEXT[],
  ARRAY['data exports']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'COGS Formatting (Dissertation Templates)',
  'Dissertation formatting and LaTeX template project for College of Graduate Studies.',
  'Barrie Robison',
  NULL,
  'College of Graduate Studies',
  NULL,
  4,
  'production',
  ARRAY['public'],
  'low',
  'students',
  'none',
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY['LaTeX templates', 'formatting guides']
);

INSERT INTO applications (name, description, owner_name, owner_email, department, url, tier, status, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
VALUES (
  'REACH Workshop 2026',
  'REACH 2026 workshop materials on "AI4RA: The Intersection Between AI and Data". Static HTML with Reveal.js slides, workshop objectives, and learning materials.',
  'Barrie Robison',
  NULL,
  'Office of Research and Economic Development',
  NULL,
  4,
  'production',
  ARRAY['public'],
  'low',
  'multi-institution',
  'none',
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY['presentations', 'workshop materials']
);

COMMIT;
