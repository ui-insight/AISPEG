-- Migration 027: register the PDF accessibility remediation request in
-- the Unified Technology Request registry (ADR 0005).
--
-- Origin: Jodi Walker's (UCM) 2026-08-10 "Mindrouter for pdf
-- remediation" email to Robison — staff need a tool to meet the Title
-- II PDF accessibility rules taking effect after the first of the
-- year. Sheneman (RCDS/IIDS) confirmed independent demand (Eric
-- Matson, Assistive Technology & Accommodation Operations, mid-July —
-- meeting never got scheduled) and proposed a concrete build: a
-- multi-step evaluation and mitigation workflow on MindRouter plus
-- open-source PDF/accessibility tooling, operating at scale. He calls
-- it a quick project with big ROI; work starts after his annual leave
-- ends 2026-08-21. Robison is logging and lightly tracking it while
-- the overall process stands up (email to Hunter, 2026-08-11).
--
-- Same posture as Migrations 019/020: disposition stays 'open' and
-- track/stage/deployment-target stay NULL on purpose — the evidence
-- rides along in the need statement, but formal track assignment and
-- prioritization are triage's call, not the email thread's.

DO $mig$
DECLARE
  rid UUID;
BEGIN

IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = 'PDF accessibility remediation at scale (Title II)') THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_email, requestor_unit, title, need_statement, disposition, received_at)
  VALUES ('direct', 'Jodi Walker', 'jwalker@uidaho.edu', 'University Communications & Marketing (UCM)',
    'PDF accessibility remediation at scale (Title II)',
    $t$Staff across campus need a tool to bring PDFs into compliance with the ADA Title II accessibility rules coming into effect after the first of the year. UCM (Jodi Walker, Executive Director of Communications / Co-Chief Marketing Officer) raised the need directly on 2026-08-10, asking whether MindRouter could do it; the same demand had already surfaced independently — Eric Matson (Assistive Technology & Accommodation Operations) approached RCDS in mid-July 2026 to set up a meeting that never got scheduled.

Feasibility is spot-checked, not assumed: Robison ran a captured NSF solicitation PDF through qwen3.6-27b on MindRouter and got a structured Title II / Section 508 compliance analysis — missing heading structure, untagged headers/footers disrupting reading order, unstructured tables, raw-text links, reading-order breaks — with concrete remediation steps. Luke Sheneman (Director, RCDS/IIDS) is confident he can quickly build a robust solution: a multi-step evaluation and mitigation workflow leveraging MindRouter, multiple AI models, and open-source PDF/accessibility tooling, operating at scale. His assessment: big ROI, low-hanging fruit, a quick project. Build start waits on his return from annual leave (2026-08-21); Walker is scheduling the kickoff meeting.

Coverage: new build on an existing platform — MindRouter is the sanctioned on-prem inference backend; the remediation workflow would be a new automated pipeline in front of it. The regulatory deadline gives this request a fixed clock that most of the backlog lacks.$t$,
    'open', '2026-08-10T22:31:00Z')
  RETURNING id INTO rid;

  INSERT INTO tech_request_events (request_id, at, actor, event_type, note)
  VALUES (rid, '2026-08-10T22:31:00Z', 'migration-027', 'received',
    'Raised by Jodi Walker (UCM) in the "Mindrouter for pdf remediation" thread to Robison; Sheneman (RCDS) confirmed prior demand from Eric Matson (Assistive Technology & Accommodation Operations, mid-July) and proposed a MindRouter-based evaluation/mitigation workflow. Robison logged it for light tracking while the overall intake process stands up.');

  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
  VALUES (rid, 'mindrouter', 'informs', 'migration-027',
    'MindRouter is the proposed inference backend for the PDF evaluation and remediation workflow.');
END IF;

END
$mig$;
