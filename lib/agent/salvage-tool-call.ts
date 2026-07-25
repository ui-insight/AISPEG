// Salvage tool calls the model wrote as prose instead of emitting on the
// native tool-calling channel.
//
// Observed on qwen3.6-27b through MindRouter (2026-07-24 and again
// 2026-07-25): instead of returning `tool_calls`, the model writes a
// textual imitation of one and that text becomes the final answer. The
// NO_TOOLS_NUDGE in loop.ts catches some of these; when it doesn't, the
// user sees raw markup where an answer should be. Three syntaxes have
// been observed in the wild, all three parsed here:
//
//   1. Anthropic-style XML
//      <invoke name="search_portfolio">
//        <parameter name="query">OpenERA</parameter>
//      </invoke>
//   2. Tool name as the element
//      <search_portfolio query="MindRouter">
//   3. JSON, often fenced and/or wrapped in <details>
//      {"tool": "search_portfolio", "parameters": {"query": "MindRouter"}}
//
// The model has told us exactly what it wants; it just used the wrong
// channel. Rather than nudge and hope, the loop parses the intent and
// runs the tool.
//
// This is deliberately conservative. A parse is only accepted when the
// extracted name matches a REGISTERED tool — an unknown name means we
// guessed wrong about what the text is, and guessing wrong here would
// fabricate a tool call the model never intended. Everything else falls
// through to the nudge and then to the refusal.

/** A tool call recovered from assistant prose. */
export interface SalvagedCall {
  name: string;
  arguments: Record<string, unknown>;
}

function coerceScalar(raw: string): unknown {
  const v = raw.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null") return null;
  if (v !== "" && !Number.isNaN(Number(v))) return Number(v);
  return v;
}

/** `<invoke name="x"><parameter name="k">v</parameter></invoke>` */
function parseInvokeBlocks(text: string, known: Set<string>): SalvagedCall[] {
  const out: SalvagedCall[] = [];
  const invokeRe = /<invoke\s+name=["']([\w.-]+)["']\s*>([\s\S]*?)<\/invoke>/gi;
  for (const m of text.matchAll(invokeRe)) {
    const name = m[1];
    if (!known.has(name)) continue;
    const args: Record<string, unknown> = {};
    const paramRe =
      /<parameter\s+name=["']([\w.-]+)["']\s*>([\s\S]*?)<\/parameter>/gi;
    for (const p of m[2].matchAll(paramRe)) {
      args[p[1]] = coerceScalar(p[2]);
    }
    out.push({ name, arguments: args });
  }
  return out;
}

/** `<search_portfolio query="MindRouter">` — tool name as the element. */
function parseNamedElements(text: string, known: Set<string>): SalvagedCall[] {
  const out: SalvagedCall[] = [];
  const elRe = /<([\w.-]+)((?:\s+[\w.-]+=["'][^"']*["'])*)\s*\/?>/g;
  for (const m of text.matchAll(elRe)) {
    const name = m[1];
    if (!known.has(name)) continue;
    const args: Record<string, unknown> = {};
    const attrRe = /([\w.-]+)=["']([^"']*)["']/g;
    for (const a of (m[2] ?? "").matchAll(attrRe)) {
      args[a[1]] = coerceScalar(a[2]);
    }
    out.push({ name, arguments: args });
  }
  return out;
}

/**
 * `{"tool": "x", "parameters": {...}}` and its variants. Scans every
 * balanced `{...}` region so fenced blocks, <details> wrappers, and
 * surrounding prose all work without special-casing each container.
 */
function parseJsonObjects(text: string, known: Set<string>): SalvagedCall[] {
  const out: SalvagedCall[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "{") continue;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let j = i; j < text.length; j++) {
      const c = text[j];
      if (esc) {
        esc = false;
        continue;
      }
      if (c === "\\") {
        esc = true;
        continue;
      }
      if (c === '"') inStr = !inStr;
      if (inStr) continue;
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          const slice = text.slice(i, j + 1);
          try {
            const parsed = JSON.parse(slice) as Record<string, unknown>;
            const name = parsed.tool ?? parsed.name ?? parsed.tool_name;
            if (typeof name === "string" && known.has(name)) {
              const rawArgs =
                parsed.parameters ?? parsed.arguments ?? parsed.args ?? {};
              out.push({
                name,
                arguments:
                  rawArgs && typeof rawArgs === "object"
                    ? (rawArgs as Record<string, unknown>)
                    : {},
              });
            }
          } catch {
            // Not JSON, or not valid — nothing to salvage from this span.
          }
          i = j; // don't rescan the interior
          break;
        }
      }
    }
  }
  return out;
}

/**
 * Extract tool calls the model wrote as text. Returns [] when the text
 * holds nothing that unambiguously names a registered tool — the caller
 * should then fall back to nudging or refusing.
 *
 * `knownToolNames` is the gate: only registered tools are ever returned.
 */
export function salvageToolCalls(
  text: string,
  knownToolNames: Iterable<string>,
): SalvagedCall[] {
  if (!text.trim()) return [];
  const known = new Set(knownToolNames);

  const found = [
    ...parseInvokeBlocks(text, known),
    ...parseNamedElements(text, known),
    ...parseJsonObjects(text, known),
  ];

  // De-dupe: the same intent can match more than one grammar (a JSON
  // block inside a <details> element, say). Keyed on name + args.
  const seen = new Set<string>();
  const unique: SalvagedCall[] = [];
  for (const c of found) {
    const key = `${c.name}::${JSON.stringify(c.arguments)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(c);
  }
  return unique;
}

/**
 * True when assistant text looks like an imitated tool call rather than
 * an answer. Used as a last-resort guard so raw markup is never returned
 * to the user as the final response.
 */
export function looksLikeImitatedToolCall(
  text: string,
  knownToolNames: Iterable<string>,
): boolean {
  return salvageToolCalls(text, knownToolNames).length > 0;
}

/**
 * True when the text names a registered tool at all — even with nothing
 * parseable attached ("I'll search for OpenERA... **search_portfolio**").
 *
 * Weaker than salvage on purpose. It cannot tell the loop *what* to run,
 * only that the model meant to run something, which is enough to
 * distinguish an intended-but-botched call from a genuine refusal: a
 * real out-of-scope refusal never names a tool. The loop uses it to
 * decide whether the retry should force `tool_choice: "required"`.
 */
export function mentionsKnownTool(
  text: string,
  knownToolNames: Iterable<string>,
): boolean {
  if (!text.trim()) return false;
  for (const name of knownToolNames) {
    // Word-boundary match so `search_portfolio` in prose counts but a
    // longer identifier that merely contains it does not.
    const re = new RegExp(`(^|[^\\w-])${name}([^\\w-]|$)`);
    if (re.test(text)) return true;
  }
  return false;
}
