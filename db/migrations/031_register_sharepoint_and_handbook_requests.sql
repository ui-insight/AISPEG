-- Migration 031: register two requests from scoping meetings in the
-- Unified Technology Request registry (ADR 0005).
--
-- Origin: Teams transcripts of two meetings with Robison and Addington,
-- supplied by Robison on 2026-11-02.
--
--   1. "Discuss Sharepoint chatbot request": Corbin Hohstadt (Admin Ops /
--      Events Services) asks for chat over his AV knowledge base.
--   2. "EPPN Graduate Handbook Refresh": Mark Schwarzlaender and Shirley
--      Luckhart (EPPN) ask for a refreshed handbook and a way to keep it
--      current.
--
-- received_at is the registration date. The transcripts carry no meeting
-- date, and this must not be read as the date either meeting happened.
-- Correct it with an update if the dates matter to triage. Addington
-- refers to an "initial request" from Hohstadt in the meeting; it is not
-- in the registry, ClickUp, or the 2026-08-02 IDEA cut, so it may be in a
-- later IDEA cut. If it arrives on import, link it here as duplicate-of
-- rather than deleting either row.
--
-- Same posture as 019/020/027/029: disposition stays 'open' and
-- track/stage/deployment target stay NULL, because both meetings ended
-- with these going through the UTR process. The need statements cover
-- the ask, the evidence, and the open questions. Side conversation in the
-- transcripts stays out because /portfolio/pipeline is public, and the
-- transcripts themselves are not hosted.
--
-- Related rows are looked up by title. If one is absent on this database
-- (the IDEA and ClickUp rows arrive by import and sync, not migration)
-- that link is skipped.

DO $mig$
DECLARE
  sharepoint_title CONSTANT TEXT := 'SharePoint chat assistant for the Events AV knowledge base';
  handbook_title   CONSTANT TEXT := 'EPPN graduate student handbook refresh and upkeep system';
  rid UUID;
  related_id UUID;
  lnk RECORD;
BEGIN

-- ── Request 1: Events AV knowledge base chat ──────────────────

IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = sharepoint_title) THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_email, requestor_unit, title, need_statement, disposition, received_at)
  VALUES ('direct', 'Corbin Hohstadt', 'chohstadt@uidaho.edu', 'Admin Ops / Events Services',
    sharepoint_title,
    $t$Corbin Hohstadt is the technical manager for events and handles the AV for them. When gear misbehaves during an event, staff call or text him, sometimes at 7 or 9 p.m. and often about a problem he has already solved many times. The idea came from the first football game, when the repeat questions left him no room to think. He wants people to ask a chat assistant first.

The knowledge base already exists but is young. It lives on a Teams-connected SharePoint site, moved there after earlier iterations, and the site structure is further along than the content. It holds SOPs, troubleshooting guides, equipment lists for the multi-use facilities, and links to firmware, manuals, and current gear settings. Most files are PDFs, plus a couple of Microsoft Lists and a couple of Word documents. Hohstadt expects to add much more, mainly equipment manuals, and has time for that from mid-December through March and again in summer.

The commercial route has been tried. SharePoint's built-in agent needs Copilot Studio and pay-as-you-go credits, which the university did not favor, and that is how the request reached IIDS. A test agent also could not answer "what audio processor is in this room?" because it could not read the site data.

What he asked for: answers to simple questions at first, growing as content is added, drawn from the site so that new material becomes answerable. A widget on the SharePoint site is the ideal, but he is fine with VandalChat or a separate app. There is no hard deadline. Next semester would be great and next fall would be fine. His nice-to-have is that the assistant pings him when it cannot answer, so he can supply the answer.

Proposed shape from the meeting: a RAG chatbot over the site, either a Vandalizer knowledge base or a clone of the compliance tool's RAG function, on MindRouter. Addington's early look suggests an iframe on the SharePoint page, and both he and Robison name connecting SharePoint to MindRouter as the biggest technical hurdle. Addington set one expectation: this is retrieval, not model training, so corrections typed into chat do not carry over to the next person. New knowledge has to go into the source content, and Addington would hand Hohstadt the few steps that refresh the index.

Ownership: Hohstadt would own this and build it with IIDS. He has used AI chat to build Power Automate flows, runs a home server, and can set up GitHub, so the plan is to teach him to run it, not hand him a finished app. Robison sees a possible template for other units that want chat on an intranet site.

Next step: Hohstadt shares the site with Robison and Addington and flags anything that should stay out of the knowledge base. Nobody has classified the data yet.$t$,
    'open', '2026-11-02T18:00:00Z')
  RETURNING id INTO rid;

  INSERT INTO tech_request_events (request_id, at, actor, event_type, note)
  VALUES (rid, '2026-11-02T18:00:00Z', 'migration-031', 'received',
    'Registered from the Teams transcript "Discuss Sharepoint chatbot request" (Hohstadt, Addington, Robison), supplied by Robison 2026-11-02. The transcript carries no meeting date, so this is the registration date. Addington read from an initial request that has not been located.');

  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
  VALUES
    (rid, 'vandalizer', 'informs', 'migration-031',
      'Robison named a Vandalizer knowledge base as one way to run the assistant.'),
    (rid, 'execord', 'informs', 'migration-031',
      'Robison named cloning the compliance tool''s RAG function as the other way to run the assistant.'),
    (rid, 'mindrouter', 'informs', 'migration-031',
      'MindRouter is the proposed inference backend. Connecting SharePoint to it is the named technical hurdle.')
  ON CONFLICT (request_id, application_slug, link_type) DO NOTHING;

  FOR lnk IN
    SELECT t.origin, t.title, t.note FROM (VALUES
      ('oit-idea', 'Admin-Ops/ESS Tech Work Orders',
       'Same requestor and same AV support load. The IDEA row asks to track the work; this request asks to deflect the repeat questions.'),
      ('direct', 'VandalChat — campus-wide AI chat on MindRouter',
       'Hohstadt said delivery through VandalChat would be acceptable if a SharePoint widget is not.'),
      ('direct', 'Institutional knowledge & policy search',
       'Same RAG pattern, cited answers over internal documents, at institutional scope.'),
      ('clickup', 'AI Chatbot for Training/Manuals',
       'Same demand in another unit: Payroll staff asking an assistant about SOPs and manuals.')
    ) AS t(origin, title, note)
  LOOP
    SELECT id INTO related_id FROM tech_requests WHERE origin = lnk.origin AND title = lnk.title;
    IF related_id IS NOT NULL THEN
      INSERT INTO tech_request_links (request_id, related_request_id, link_type, created_by, note)
      VALUES (rid, related_id, 'related', 'migration-031', lnk.note)
      ON CONFLICT (request_id, related_request_id, link_type) DO NOTHING;
    END IF;
  END LOOP;
END IF;

-- ── Request 2: EPPN graduate handbook ─────────────────────────

IF NOT EXISTS (SELECT 1 FROM tech_requests WHERE origin = 'direct' AND title = handbook_title) THEN
  INSERT INTO tech_requests (origin, requestor_name, requestor_email, requestor_unit, title, need_statement, disposition, received_at)
  VALUES ('direct', 'Mark Schwarzlaender', 'markschw@uidaho.edu', 'Entomology, Plant Pathology and Nematology (EPPN), College of Agricultural and Life Sciences',
    handbook_title,
    $t$The EPPN graduate student handbook has not been updated in seven years. Asked whether they wanted a quick fix or a sustainable path, Mark Schwarzlaender chose the sustainable path. Shirley Luckhart, who did the last update, put the goal as something easy to update from year to year, because she expects major changes this year and in the years after.

Known content work: add the MS in plant pathology, which the handbook never included; fix curriculum listings for courses the department requires but does not teach; check every link and resource; revisit qualifying exam paths with faculty, including the literature review option; review PhD and master's expectations; and add an up-front section on resources available to students. COGS is working on changes to PhD credit requirements that may affect the curriculum, so that part waits until the change is formal.

Current process: someone takes the initiative and drafts an update, faculty vote on it, and the result goes to COGS. Nobody in the meeting could say whether COGS keeps official copies or still circulates a university-wide template. Schwarzlaender recalled a template from about three years ago and a request to directors of graduate studies for current handbooks.

Boundaries the requestors set: no automatic updates of any kind. AI-generated text is acceptable, but every generated passage has to show where it came from, internally and with a link, so faculty can judge whether it fits their programs. IIDS apps carry provenance and audit records, and for high-stakes work can require the exact quotation with a link to it. Robison and Schwarzlaender agreed on at least two human reviews, by the person initiating a change and then by faculty. Schwarzlaender is comfortable with MindRouter because it keeps the data internal.

Sources: Schwarzlaender can forward curriculum fact sheets for the MS and PhD in entomology and the MS in plant pathology, developed for the department's stakeholder input process. They are accurate except for one course in the PhD sheet that should not be listed. The fact sheets, not the degree finder or catalog, are the intended source for those requirements. His suggested method gives the model the newest COGS template, the existing handbook, and an exemplary handbook from another STEM degree, then has it move the handbook text into the template.

What the current handbook shows (24 pages, revised 21 March 2019): it covers only the M.S. and Ph.D. in Entomology. About two pages carry course and credit requirements. Much of the rest restates university policy that other offices own, and it names people where it could name roles. The 2026-27 catalog's Entomology M.S. page sends readers to this handbook for program requirements, while the handbook calls itself unofficial and sends readers to the catalog, so a 2019 document is the working source of those requirements. Insect Anatomy and Physiology, a handbook core course, does not appear in the 2026-27 catalog data, and the catalog now uses four-digit course codes. The Curriculum Atlas holds an enumerated Plant Pathology M.S., but no requirements for either Entomology degree, because the catalog publishes none.

Build model: IIDS builds it and EPPN learns to maintain it. Robison also sees the system generating updated fact sheets from the same authoritative sources.

Where it lives is open. Robison's starting assumption is the department's intranet SharePoint site, because that is the OIT default and people can find it, though SharePoint restricts development. Luckhart raised how it should look and whether UCM would have a view. Robison asked Schwarzlaender to hold off creating a dedicated site until scoping confirms it meets the need.

Reuse: Robison rates campus-wide ROI for this kind of template as very high, and Luckhart expects other departments to want it, since many lack the staff to do this work. Robison says a sister application for the new data governance council is the closest match he is building now.

Cost and next step: Robison and Addington will scope it and estimate the cost. Funding is not decided. Robison set a goal of giving Schwarzlaender and Luckhart an update or a proposed scope by the end of the week of the meeting.$t$,
    'open', '2026-11-02T18:00:00Z')
  RETURNING id INTO rid;

  INSERT INTO tech_request_events (request_id, at, actor, event_type, note)
  VALUES (rid, '2026-11-02T18:00:00Z', 'migration-031', 'received',
    'Registered from the Teams transcript "EPPN Graduate Handbook Refresh" (Schwarzlaender, Luckhart, Addington, Robison), supplied by Robison 2026-11-02. The transcript says the meeting was on a Monday morning but gives no date, so this is the registration date.');

  INSERT INTO tech_request_project_links (request_id, application_slug, link_type, created_by, note)
  VALUES
    (rid, 'mindrouter', 'informs', 'migration-031',
      'Schwarzlaender''s comfort with AI here depends on the MindRouter route keeping data internal.'),
    (rid, 'dissertation-formatter', 'informs', 'migration-031',
      'Nearest precedent: moving a graduate document into a COGS template. That app never rewrites text, while this request accepts generated text with citations.'),
    (rid, 'governance-registry', 'informs', 'migration-031',
      'The sister application Robison named in the meeting: versioned institutional documents with status, citations, and human approval.')
  ON CONFLICT (request_id, application_slug, link_type) DO NOTHING;
END IF;

-- ── Cross-link: both depend on the same SharePoint answer ─────

SELECT id INTO rid FROM tech_requests WHERE origin = 'direct' AND title = handbook_title;
SELECT id INTO related_id FROM tech_requests WHERE origin = 'direct' AND title = sharepoint_title;
INSERT INTO tech_request_links (request_id, related_request_id, link_type, created_by, note)
VALUES (rid, related_id, 'related', 'migration-031',
  'Both turn on what IIDS can run inside SharePoint. Robison flagged the same open question for the handbook during that meeting.')
ON CONFLICT (request_id, related_request_id, link_type) DO NOTHING;

END
$mig$;
