-- Migration 013: Seed the UCM AI search visibility / GEO evaluation submission
--
-- This preserves the scoped intake record across AISPEG environments without
-- prematurely promoting the proposal into the application inventory.

BEGIN;

DO $migration$
DECLARE
  v_submission_id UUID;
BEGIN
  SELECT id
  INTO v_submission_id
  FROM submissions
  WHERE submitter_email = 'jwalker@uidaho.edu'
    AND idea_text LIKE 'AI Search Visibility & GEO Evaluation%'
  ORDER BY created_at
  LIMIT 1;

  IF v_submission_id IS NULL THEN
    v_submission_id := '6da87ac4-cfb8-446d-b2b6-3c28046a9332';

    INSERT INTO submissions (
      id,
      idea_text,
      answers,
      score,
      tier,
      submitter_email,
      submitter_name,
      department
    )
    VALUES (
      v_submission_id,
      $idea$AI Search Visibility & GEO Evaluation

University Communications and Marketing wants to determine whether the University of Idaho should buy, build, or decline a generative/answer-engine optimization (GEO/AEO) capability. Phase 1 is a bounded, read-only monitoring MVP: UCM will define priority recruiting prompt clusters; the service will run them through selected commercial LLM APIs at a controlled cadence, retain responses, citations, model/version metadata, and timestamps, and provide a dashboard and assessment of U of I visibility, citation share, answer quality, and changes following content interventions. A sample of API results will be compared manually with consumer chat interfaces before the monitoring approach is accepted as representative.

The MVP will not alter university web pages, automate content publication, scrape consumer interfaces, or build a crawler-facing Agent Experience Platform (AXP) or pre-rendering layer. A separate discovery and governance gate will assess the AXP/vendor proposition, uidaho.edu surface area, crawler maintenance, SEO/cloaking risk, accessibility, security, procurement, and total cost of ownership. The intended outcome is a documented buy/build/no-go recommendation before committing to RDA's $48,000 12-month proposal or the roughly $60,000 Scrunch-related cost referenced in the July 16 email thread.$idea$,
      $answers${
        "idea": "AI Search Visibility & GEO Evaluation: evaluate whether U of I should buy, build, or decline a GEO/AEO capability through a bounded, read-only monitoring MVP, with crawler-facing AXP work held behind a separate discovery and governance gate.",
        "sensitivity": ["No sensitive data"],
        "complexity": "Multiple data sources",
        "userbase": "My department",
        "auth": "University SSO",
        "integrations": ["External SaaS APIs", "AI / LLM integration"],
        "dataSources": ["Flat files / spreadsheets"],
        "universitySystems": ["None"],
        "outputTypes": ["Read-only reporting"]
      }$answers$::jsonb,
      7,
      2,
      'jwalker@uidaho.edu',
      'Jodi Walker',
      'University Communications & Marketing'
    );
  ELSE
    UPDATE submissions
    SET idea_text = $idea$AI Search Visibility & GEO Evaluation

University Communications and Marketing wants to determine whether the University of Idaho should buy, build, or decline a generative/answer-engine optimization (GEO/AEO) capability. Phase 1 is a bounded, read-only monitoring MVP: UCM will define priority recruiting prompt clusters; the service will run them through selected commercial LLM APIs at a controlled cadence, retain responses, citations, model/version metadata, and timestamps, and provide a dashboard and assessment of U of I visibility, citation share, answer quality, and changes following content interventions. A sample of API results will be compared manually with consumer chat interfaces before the monitoring approach is accepted as representative.

The MVP will not alter university web pages, automate content publication, scrape consumer interfaces, or build a crawler-facing Agent Experience Platform (AXP) or pre-rendering layer. A separate discovery and governance gate will assess the AXP/vendor proposition, uidaho.edu surface area, crawler maintenance, SEO/cloaking risk, accessibility, security, procurement, and total cost of ownership. The intended outcome is a documented buy/build/no-go recommendation before committing to RDA's $48,000 12-month proposal or the roughly $60,000 Scrunch-related cost referenced in the July 16 email thread.$idea$,
        answers = $answers${
          "idea": "AI Search Visibility & GEO Evaluation: evaluate whether U of I should buy, build, or decline a GEO/AEO capability through a bounded, read-only monitoring MVP, with crawler-facing AXP work held behind a separate discovery and governance gate.",
          "sensitivity": ["No sensitive data"],
          "complexity": "Multiple data sources",
          "userbase": "My department",
          "auth": "University SSO",
          "integrations": ["External SaaS APIs", "AI / LLM integration"],
          "dataSources": ["Flat files / spreadsheets"],
          "universitySystems": ["None"],
          "outputTypes": ["Read-only reporting"]
        }$answers$::jsonb,
        score = 7,
        tier = 2,
        submitter_email = 'jwalker@uidaho.edu',
        submitter_name = 'Jodi Walker',
        department = 'University Communications & Marketing'
    WHERE id = v_submission_id;
  END IF;

  DELETE FROM submission_details
  WHERE submission_id = v_submission_id;

  INSERT INTO submission_details (
    submission_id,
    sensitivity,
    complexity,
    userbase,
    auth_level,
    integrations,
    data_sources,
    university_systems,
    output_types
  )
  VALUES (
    v_submission_id,
    ARRAY['No sensitive data'],
    'Multiple data sources',
    'My department',
    'University SSO',
    ARRAY['External SaaS APIs', 'AI / LLM integration'],
    ARRAY['Flat files / spreadsheets'],
    ARRAY['None'],
    ARRAY['Read-only reporting']
  );

  DELETE FROM submission_notes
  WHERE submission_id = v_submission_id
    AND author = 'Codex (on behalf of Barrie Robison)';

  INSERT INTO submission_notes (submission_id, author, content)
  VALUES (
    v_submission_id,
    'Codex (on behalf of Barrie Robison)',
    $note$SCOPING SYNTHESIS — 2026-07-22

Sources reviewed
- “RDA - AI GEO for U of I.pdf” (RDA; PDF metadata dated 2026-04-01): proposes a 12-month, $48,000 engagement covering an initial GEO assessment, GEO recommendations, quarterly reports, and quarterly next-best-action recommendations.
- July 16, 2026 email thread initiated by Jodi Walker, with technical notes from Colin Addington: asks whether U of I can build an agent to assess visibility across LLMs and whether Scrunch AXP is worth a significant investment. The thread references approximately $60,000 in Scrunch-related costs but does not establish which product, configuration, or term that figure covers.

Recommended project shape
1. Discovery / decision definition
   - UCM owns the business question, priority audience, recruiting programs, prompt clusters, competitors, models, cadence, and acceptable outputs.
   - Obtain itemized RDA and Scrunch scope, licensing term, product configuration, prompt/model limits, data retention, and contract requirements.
   - Inventory the relevant uidaho.edu content surface and current SEO/analytics baselines.

2. Monitoring MVP (recommended first build)
   - Start with a governed UCM prompt set, prioritizing high-intent competitive-comparison and program-specific recruiting questions.
   - Query selected commercial LLM APIs at a controlled cadence; retain prompt, response, citations/URLs, model/version, run time, and cost metadata.
   - Normalize results into a read-only internal dashboard showing U of I mentions, citation share, cited domains/pages, answer accuracy review, volatility, and change over time.
   - Manually compare a representative sample with consumer chat interfaces. Do not automate or scrape consumer interfaces unless terms-of-service and legal/procurement review explicitly permit it.
   - Use repeated before/after samples to estimate change following content interventions; do not claim direct causality from a single run.

3. Buy/build/no-go gate
   - Compare vendor reporting quality, reproducibility, coverage, actionability, and total cost with the MVP.
   - Decide whether to buy a monitoring service, continue an internal monitor, use a hybrid, or stop.

4. Optional AXP / website-delivery discovery (separate workstream)
   - Assess crawler detection, pre-rendering, structured enrichment, publishing workflow, bot-list maintenance, accessibility, security, and SEO/cloaking risk.
   - Do not implement or procure AXP until the university web surface area and governance implications are understood.

Success measures for the MVP
- Agreed prompt coverage across priority recruiting clusters and selected models.
- Repeatable capture of answers, citations, model/version, timestamp, and run cost.
- Baseline and trend reporting for U of I mentions, citation share, cited pages/domains, and human-reviewed answer accuracy.
- Documented API-versus-consumer-interface comparison for a representative sample.
- Measured cost and staff effort per monitoring cycle.
- A defensible buy/build/no-go recommendation before vendor commitment.

Key risks and controls
- Model outputs are nondeterministic and ranking factors are unpublished: use repeated samples, preserve provenance, and label inference/uncertainty.
- Vendor figures conflict or are incomplete: treat $48,000 and approximately $60,000 as source-reported decision inputs pending an itemized quote.
- Consumer-interface automation may violate terms or be brittle: API-first; require review before any scraping.
- AXP could cross the SEO cloaking line or create ongoing crawler-maintenance obligations: separate review and explicit approval gate.
- Content recommendations can be inaccurate or overstate causality: UCM human review remains required before web changes.
- Start with public uidaho.edu content and non-sensitive business prompts; reassess data classification if scope expands.

Ownership and deployment assumptions
- Business owner / submitter: Jodi Walker, University Communications & Marketing.
- Likely technical collaborators: IIDS, with OIT/security/procurement involvement at the relevant gates.
- Proposed production deployment if the MVP proceeds: OIT-hosted internal application with University SSO; a time-limited evaluation may use an approved non-production environment.

Portfolio and replacement classification
- No duplicate GEO/search-visibility submission or inventory project was found. UCM Daily Register is adjacent organizationally but addresses a different workflow; infrastructure patterns may be reusable.
- Enterprise-system replacement: No. This evaluates a prospective vendor purchase and an internal alternative; no current paid enterprise system was identified.
- Current annual enterprise-system cost: $0 / not applicable. The $48,000 proposal and approximately $60,000 email reference are prospective and require reconciliation.$note$
  );
END;
$migration$;

COMMIT;
