import { DocPage, InfoBox } from "@/components/DocPage";

export default function MindRouterDocsPage() {
  return (
    <DocPage
      title="MindRouter Integration"
      subtitle="How AISPEG uses the University of Idaho's on-prem LLM inference cluster for AI-powered features."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "MindRouter" },
      ]}
    >
      <h2>What is MindRouter?</h2>
      <p>
        MindRouter is the University of Idaho&apos;s on-premises LLM inference platform. It runs
        on institutional GPU infrastructure and provides OpenAI-compatible API endpoints for
        chat completions, embeddings, text-to-speech, and more. All data stays on university
        infrastructure with full data sovereignty.
      </p>
      <p>
        AISPEG uses MindRouter for two features: <strong>AI-powered idea analysis</strong> and
        the <strong>AI Assistant chat panel</strong> in the Builder Guide wizard.
      </p>

      <h2>Architecture</h2>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
Browser (Client)                  AISPEG (Server)                MindRouter
─────────────────                 ─────────────────              ────────────
"Analyze" click  ──POST──►  /api/ai/analyze-idea  ──POST──►  /v1/chat/completions
                                  (JSON mode)                 (gpt-oss-120b)
                 ◄──JSON──  Structured analysis    ◄──JSON──  Structured output

Chat message     ──POST──►  /api/ai/refine         ──POST──►  /v1/chat/completions
                 ◄──JSON──  Reply text              ◄──JSON──  Chat response
      `}</pre>

      <InfoBox type="info" title="Server-side only">
        All MindRouter communication happens server-side through Next.js API routes. The API
        key never reaches the browser. The client only sees the processed results.
      </InfoBox>

      <h2>Client Library</h2>
      <p>
        The MindRouter client lives in <code>lib/mindrouter.ts</code> and provides:
      </p>

      <h3>chatCompletion(options)</h3>
      <p>Low-level chat completions call. Supports all standard OpenAI parameters:</p>
      <ul>
        <li><code>messages</code> — Array of system/user/assistant messages</li>
        <li><code>temperature</code> — Defaults to 0.3 for analysis, 0.5 for chat</li>
        <li><code>max_tokens</code> — Defaults to 2048</li>
        <li><code>json_mode</code> — When true, sets <code>response_format: json_object</code></li>
      </ul>

      <h3>analyzeIdea(ideaText)</h3>
      <p>
        High-level function that sends an idea description to MindRouter with a detailed system
        prompt tuned for U of I context. Uses JSON mode to guarantee parseable output. Returns:
      </p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
{
  summary: string,
  suggested_sensitivity: string[],     // FERPA, HIPAA, PII, CUI, etc.
  suggested_complexity: string,        // Static, CRUD, Multi-source, etc.
  suggested_userbase: string,          // Team, Department, University, etc.
  suggested_auth: string,              // None, SSO, RBAC, etc.
  suggested_integrations: string[],
  suggested_data_sources: string[],    // Banner, Canvas, LDAP, etc.
  suggested_university_systems: string[],
  suggested_output_types: string[],
  clarifying_questions: string[],      // 2-4 follow-up questions
  similar_existing_tools: string[],    // Known similar tools
  risks_and_considerations: string[]   // Compliance and technical risks
}
      `}</pre>

      <h3>refinementChat(messages)</h3>
      <p>
        Multi-turn conversation endpoint. Prepends a system prompt that positions the LLM as
        a friendly U of I IT consultant who knows university systems, data governance, and
        web development.
      </p>

      <h2>System Prompts</h2>

      <h3>Idea Analysis Prompt</h3>
      <p>
        The analysis system prompt instructs the model to act as a university IT architect and
        return structured JSON. Key behaviors:
      </p>
      <ul>
        <li>Conservative sensitivity classification (if student data involved, include FERPA)</li>
        <li>Matches suggestions to the exact option labels used in the wizard</li>
        <li>Generates clarifying questions to help the user think through requirements</li>
        <li>Identifies similar existing tools (commercial or university)</li>
        <li>Flags compliance and technical risks</li>
      </ul>

      <h3>Refinement Chat Prompt</h3>
      <p>
        The chat system prompt creates a conversational assistant that:
      </p>
      <ul>
        <li>Asks clarifying questions about scope, users, and data</li>
        <li>Points out compliance considerations the user may not have thought of</li>
        <li>Suggests simpler alternatives when appropriate</li>
        <li>Explains university systems in plain language</li>
        <li>Stays conversational, concise, and encouraging</li>
      </ul>

      <h2>Configuration</h2>
      <p>Three environment variables control MindRouter integration:</p>

      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
MINDROUTER_API_KEY=mr2_...        # Required. Bearer token for auth.
MINDROUTER_BASE_URL=https://mindrouter.uidaho.edu  # Default.
MINDROUTER_MODEL=openai/gpt-oss-120b              # Current model.
      `}</pre>

      <InfoBox type="tip" title="Model selection">
        MindRouter hosts 60+ models. The current default is <code>openai/gpt-oss-120b</code>
        which provides excellent structured output quality. Other good options include
        <code>llama3.3:70b</code>, <code>qwen2.5:72b</code>, and <code>mistral-large:123b</code>.
        Change the model by updating the <code>MINDROUTER_MODEL</code> environment variable.
      </InfoBox>

      <h2>Graceful Degradation</h2>
      <p>
        If <code>MINDROUTER_API_KEY</code> is not set, both AI endpoints return a 503 with
        <code>unconfigured: true</code>. The wizard UI handles this gracefully:
      </p>
      <ul>
        <li>The &ldquo;Analyze&rdquo; button shows a &ldquo;not yet configured&rdquo; message</li>
        <li>The AI chat panel displays a configuration notice</li>
        <li>All non-AI wizard functionality continues to work normally</li>
        <li>Submissions are still saved to the database</li>
      </ul>

      <h2>Available Models</h2>
      <p>
        To see what models are available on the MindRouter cluster, query the models endpoint:
      </p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
curl -H "Authorization: Bearer $MINDROUTER_API_KEY" \\
  https://mindrouter.uidaho.edu/v1/models
      `}</pre>
    </DocPage>
  );
}
