-- Migration 020: register the VandalChat request in the Unified
-- Technology Request registry (ADR 0005).
--
-- Origin: Luke Sheneman's 2026-07-30 "MindRouter vs. boisestate.ai"
-- proposal to Robison, Ewart, and Hunter — a campus-wide AI chat
-- platform on MindRouter, with a working prototype already on a beta
-- host. The four principals deliberately scoped it as a model of the
-- emerging institutional process: Sheneman owns the scope of work
-- (delivered 2026-07-31), Hunter the ROI/impact case, Ewart security
-- guardrails and pre-launch testing, Robison portfolio alignment and
-- opportunity cost.
--
-- Same posture as Migration 019: disposition stays 'open' and
-- track/stage stay NULL on purpose — the evidence rides along in the
-- need statement and the supporting documents (public/requests/*.pdf),
-- but formal track assignment and prioritization are triage's call,
-- not the email thread's.

DO $mig$
DECLARE
  rid UUID;
  related_id UUID;
BEGIN

IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = 'VandalChat — campus-wide AI chat on MindRouter') THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_email, requestor_unit, title, need_statement, disposition, received_at)
  VALUES ('direct', 'Luke Sheneman', 'sheneman@uidaho.edu', 'IIDS / Research Computing & Data Services (RCDS)',
    'VandalChat — campus-wide AI chat on MindRouter',
    $t$The fall awareness push will drive the whole campus at MindRouter, whose current web interface is aimed at a technical audience. Most arrivals will expect a chat box; without one they will read MindRouter as a complicated tool "not for them" and won't come back — and the university pays again for every user it fails to land, in individual frontier-model licenses, in shadow spend from personal and grant funds, and in university data (Banner, Slate, grants, student records) pasted into free consumer tiers off-network.

Proposed shape: VandalChat, a self-hosted AI chat platform (FastAPI, React, PostgreSQL, containerized) with MindRouter as its inference backend. The baseline is built and running on a beta host: streaming chat, Azure AD SSO, conversation history, document library with RAG, image and voice, cited web search, tool calling, and an admin console under UI branding. The scope of work (2026-07-31) runs in two phases — Phase 1 productionalizes the baseline with security, accessibility, and data-governance review, a closed beta, and a production go-live targeted August 24, 2026; Phase 2 (September–December) adds user memory, conversation sharing, custom assistants, campus MCP connectors, sandboxed code execution, and live voice.

Capacity is measured, not guessed: live load simulation against MindRouter puts one H200 GPU at ~170 concurrent chat users within SLO; the realistic demand curve for the 18,000-person campus peaks near 1,800 concurrent in an exceptional event, and the incoming HGX B300 node sustains ~4,100 — the entire realistic adoption curve with headroom. The ROI case (Ben Hunter, CADSO) rests on adoption yield from the fall marketing spend, license cost avoidance, data retention on our own network, the common accessible interface that broad staff AI training requires, and a credible answer to the recurring campus-license question. Operational Excellence survey demand is explicit; verbatim evidence on /coordination/operational-excellence.

Coverage: new build on an existing platform — MindRouter is the sanctioned on-prem gateway and inference backend; VandalChat is the accessible front end the "Sanctioned AI access & literacy" demand pool asked for. Supporting documents: /requests/vandalchat-scope-of-work.pdf, /requests/campus-chat-capacity-executive-briefing.pdf, /requests/gemma4-31b-chat-capacity-report-2026-08-01.pdf.$t$,
    'open', '2026-07-30T14:14:00Z')
  RETURNING id INTO rid;

  INSERT INTO tech_request_events (request_id, at, actor, event_type, note)
  VALUES (rid, '2026-07-30T14:14:00Z', 'migration-020', 'received',
    'Proposed by Luke Sheneman (RCDS/IIDS) in the "MindRouter vs. boisestate.ai" thread to Robison, Ewart, and Hunter; working prototype already on a beta host. Scope of work and capacity briefing followed 2026-07-31 through 2026-08-01 (public/requests/).');

  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
  VALUES (rid, 'mindrouter', 'informs', 'migration-020',
    'MindRouter is the inference backend; VandalChat is the campus-facing chat front end.');

  -- The survey-derived "Sanctioned AI access & literacy" candidate is
  -- the same demand pool: its access question was answered by
  -- MindRouter, and VandalChat is the accessible interface that makes
  -- that answer real for novice users.
  SELECT id INTO related_id FROM tech_requests
  WHERE origin = 'direct' AND title = 'Sanctioned AI access & literacy';
  IF related_id IS NOT NULL THEN
    INSERT INTO tech_request_links (request_id, related_request_id, link_type, created_by, note)
    VALUES (rid, related_id, 'related', 'migration-020',
      'VandalChat is the accessible front end for the sanctioned-access demand that survey candidate documents.')
    ON CONFLICT (request_id, related_request_id, link_type) DO NOTHING;
  END IF;
END IF;

END
$mig$;
