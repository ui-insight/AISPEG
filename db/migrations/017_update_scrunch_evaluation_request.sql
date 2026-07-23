-- Migration 017: Add Colin Addington's technical review to the Scrunch request
--
-- Owner-provided July 2026 review:
-- - The underlying GEO/AEO visibility problem is real.
-- - Defer a roughly $60,000 Scrunch purchase until U of I establishes its own
--   repeated, multi-model baseline and measures the effect of content fixes.
-- - Keep website delivery and crawler-facing work behind separate access,
--   governance, scope, and total-cost gates.

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
    RAISE EXCEPTION
      'Scrunch evaluation submission for jwalker@uidaho.edu was not found';
  END IF;

  UPDATE submissions
  SET idea_text = $idea$AI Search Visibility & GEO Evaluation

University Communications and Marketing wants to determine whether the University of Idaho should buy, build, use a hybrid, or decline a generative/answer-engine optimization (GEO/AEO) capability. The current technical recommendation is to defer the roughly $60,000 Scrunch purchase until U of I establishes its own baseline. A bounded, read-only evaluation can be built in about one week of skilled developer time: UCM will define priority recruiting prompts; the evaluation will run them repeatedly across selected models and record answers, cited sources, claims about U of I, errors, model/version metadata, timestamps, and run costs.

The baseline must distinguish information controlled by U of I from influential external sources such as rankings sites, Wikipedia, Reddit, and competitor content. Where problems are traceable to university pages, UCM should improve the human-visible canonical pages directly with consistent facts, clear summaries, FAQs, and last-updated dates, then rerun the prompt set to measure change. The content inventory must estimate the full page tree and identify duplicated or contradictory facts because page count, content drift, and source ownership drive feasibility and vendor tier.

The evaluation will not automate publication, scrape consumer interfaces, or introduce crawler-only content. Website changes require UCM edit access; any delivery-layer work requires ITS/CDN authorization and separate SEO, accessibility, security, procurement, and governance review. The decision gate will compare measured internal results, recurring staff effort, and vendor scope to determine whether Scrunch materially absorbs ongoing monitoring and maintenance or whether U of I can meet the need internally.$idea$,
      answers = answers || jsonb_build_object(
        'idea',
        'AI Search Visibility & GEO Evaluation: defer the Scrunch purchase while U of I runs a repeated multi-model baseline, fixes problems on human-visible canonical pages, measures the effect, and then makes an evidence-based buy/build/hybrid/no-go decision.'
      ),
      status = 'reviewed'
  WHERE id = v_submission_id;

  DELETE FROM submission_notes
  WHERE submission_id = v_submission_id
    AND author = 'Colin Addington (email supplied by Barrie Robison)';

  INSERT INTO submission_notes (submission_id, author, content)
  VALUES (
    v_submission_id,
    'Colin Addington (email supplied by Barrie Robison)',
    $note$TECHNICAL REVIEW — RECORDED 2026-07-23

Recommendation
- The underlying AI-search visibility problem is real, but hold the roughly $60,000 Scrunch purchase until U of I measures its current position.
- Establishing the initial baseline should take about one week for a skilled developer and cost essentially staff labor.

Baseline evaluation
- Run UCM's recruiting and comparison prompts repeatedly across several models.
- Record answers, cited sources, claims about U of I, factual errors, model/version, timestamps, and run costs.
- Identify which findings are traceable to U of I pages and which come from external sources such as rankings sites, Wikipedia, Reddit, and competitor content.
- Fix the university-controlled sources, then rerun the same prompt set and compare results.

Content strategy and prerequisite work
- Improve the real, human-visible pages with clear summaries, FAQs, consistent facts, and last-updated dates; do not create separate crawler-only versions.
- Inventory the relevant website tree and estimate page count before sizing the work or selecting a vendor tier. “Funnel pages and their children” could encompass several hundred academic pages.
- Identify a canonical source and accountable owner for degree requirements, tuition, deadlines, and other duplicated facts. A vendor cannot resolve contradictory university content; it can only expose or reformat it.

Dependencies and governance
- UCM needs edit access to the relevant sites.
- Any delivery-layer or CDN change requires ITS authorization before effort is estimated.
- Crawler behavior, sampling, reporting, and content updates create an ongoing maintenance tail; total cost must include that recurring work.
- Machine-only delivery could create SEO/cloaking risk and remains outside the baseline evaluation unless separately approved.

Decision gate
- If direct improvements to U of I pages materially improve the repeated benchmark, continue the internal approach and avoid or reduce the subscription.
- If internal fixes do not move the measures, use the evidence to define precisely what Scrunch must provide.
- A Scrunch subscription becomes more compelling only if its itemized scope materially absorbs recurring monitoring, reporting, and maintenance rather than merely supplying data and recommendations that U of I must still act on.
- Final outcome: documented buy, build, hybrid, or no-go recommendation supported by baseline measurements, content scope, access decisions, recurring labor, and itemized vendor cost.$note$
  );
END;
$migration$;

COMMIT;
