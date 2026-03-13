import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal(): Record<string, string> {
  try {
    const content = readFileSync(
      resolve(process.cwd(), ".env.local"),
      "utf-8"
    );
    const vars: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        vars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
      }
    }
    return vars;
  } catch {
    return {};
  }
}

const envLocal = loadEnvLocal();

type Provider = "groq" | "claude";

interface ContextNode {
  id: string;
  type: string;
  label: string;
  description: string;
  position: { x: number; y: number };
  group: string;
  resourceCount: number;
}

interface ChatRequestBody {
  provider?: Provider;
  apiKey?: string;
  messages: { role: "user" | "assistant"; content: string }[];
  currentNodes: ContextNode[];
  currentEdges: { id: string; source: string; target: string }[];
  meta: { title: string; description: string };
}

const SYSTEM_PROMPT = `You are a music education roadmap builder assistant. You help users create interactive learning roadmaps by generating nodes (topics) and edges (connections). You can both CREATE new nodes and UPDATE existing ones.

## Data Structure

Nodes have these types:
- "milestone": Major section headers (root-level, central, x≈300)
- "topic": Main spine nodes on the central path (x≈300)
- "subtopic": Branch detail nodes that connect to topics (x≈120 for left, x≈520 for right)

Each node object has these fields:
{
  "id": "kebab-case-id",
  "type": "milestone" | "topic" | "subtopic",
  "label": "Short Title",
  "description": "One sentence summary.",
  "position": { "x": 300, "y": 0 },
  "group": "group-name",
  "details": {
    "content": "2-3 paragraphs of educational material.",
    "resources": [
      { "title": "Resource Name", "url": "https://example.com", "type": "article" }
    ]
  }
}

Each edge object:
{ "id": "e-source-target", "source": "node-id", "target": "node-id", "style": "spine" | "branch" }

## Complete example

Here is a correctly formed node with rich content and resources:

{
  "id": "major-minor-scales",
  "type": "topic",
  "label": "Major & Minor Scales",
  "description": "Understanding the two foundational scale types in Western music.",
  "position": { "x": 300, "y": 220 },
  "group": "scales",
  "details": {
    "content": "The major scale follows the interval pattern W-W-H-W-W-W-H (whole and half steps), producing a bright, happy sound. Starting from C, this gives us C-D-E-F-G-A-B-C with no sharps or flats — the simplest major scale to visualize on a piano.\\n\\nThe natural minor scale uses a different pattern: W-H-W-W-H-W-W. This creates a darker, more melancholic sound. Every major scale has a relative minor that shares the same key signature — for example, A minor is the relative minor of C major.\\n\\nPractice building both scales from every starting note. Being fluent with major and minor scales is essential for understanding chords, intervals, and key signatures — virtually everything else in music theory builds on this foundation.",
    "resources": [
      { "title": "musictheory.net — Scales and Key Signatures", "url": "https://www.musictheory.net/lessons/21", "type": "article" },
      { "title": "12tone — Major vs Minor (YouTube)", "url": "https://www.youtube.com/watch?v=fw2ah5pEiXE", "type": "video" },
      { "title": "Coursera — Fundamentals of Music Theory", "url": "https://www.coursera.org/learn/edinburgh-music-theory", "type": "course" }
    ]
  }
}

Your content should be AT LEAST this detailed. Write substantive educational paragraphs, not one-liners.

## Layout rules
- Spine nodes (milestone/topic) go at x≈300, spaced ~110px apart vertically
- Subtopics branch left (x≈120) or right (x≈520) from their parent topic
- Use the "group" field to group related nodes (e.g. "basics", "rhythm", "harmony")

## Resource requirements
The "resources" array is REQUIRED on every node. Each resource must have:
- "title": descriptive name (include the site name, e.g. "musictheory.net — Lesson Title")
- "url": a real, working URL to educational content (musictheory.net, YouTube, Wikipedia, Coursera, etc.)
- "type": one of "article", "video", "course", or "tool"

Include 2-3 resources per node. Use real educational URLs you are confident exist.

## Response format
You MUST respond with valid JSON only. No markdown, no code fences, no extra text.

{
  "message": "A friendly explanation of what you did",
  "nodes": [ ...new nodes to ADD to the canvas ],
  "edges": [ ...new edges to ADD ],
  "updatedNodes": [ ...existing nodes to UPDATE (use their existing id, include ALL fields) ],
  "metaUpdate": null
}

### When to use "nodes" vs "updatedNodes":
- "nodes": for brand new nodes that don't exist yet
- "updatedNodes": for modifying existing nodes. You MUST include the node's existing "id" and ALL fields (id, type, label, description, position, group, details). The entire node object will be replaced.

### When to use "metaUpdate":
If metaUpdate is provided, it should be { "title": "...", "description": "..." } to update the roadmap metadata.

### Conversational responses:
If the user is just chatting or asking a question (not requesting changes), return empty arrays:
{
  "message": "Your helpful answer here",
  "nodes": [],
  "edges": [],
  "updatedNodes": [],
  "metaUpdate": null
}

## Important rules
- Generate unique IDs using short lowercase-kebab-case (e.g. "chord-progressions", "major-scale")
- Edge IDs should be "e-{source}-{target}"
- Position new nodes BELOW existing ones (check the highest y value and add from there)
- Always connect new nodes with edges so nothing is orphaned
- Keep labels concise (2-4 words) and descriptions to one sentence
- The "content" field MUST be 2-3 substantial paragraphs of educational material (see example above)
- ALWAYS include 2-3 resources per node with real URLs
- Alternate subtopic sides (left/right) for visual balance
- When the user asks to update, edit, add resources to, or change an existing node, use "updatedNodes" with the node's existing id`;

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const provider: Provider = body.provider ?? "groq";

    const apiKey =
      body.apiKey ||
      (provider === "claude"
        ? process.env.ANTHROPIC_API_KEY || envLocal.ANTHROPIC_API_KEY
        : process.env.GROQ_API_KEY || envLocal.GROQ_API_KEY);

    if (!apiKey) {
      return NextResponse.json(
        {
          error: `No API key provided. Add your ${provider === "claude" ? "Anthropic" : "Groq"} API key in the chat panel to get started.`,
        },
        { status: 400 }
      );
    }

    const contextMessage = buildContextMessage(
      body.currentNodes,
      body.currentEdges,
      body.meta
    );

    const raw =
      provider === "claude"
        ? await callClaude(apiKey, contextMessage, body.messages)
        : await callGroq(apiKey, contextMessage, body.messages);

    try {
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        message: raw,
        nodes: [],
        edges: [],
        metaUpdate: null,
      });
    }
  } catch (err: unknown) {
    console.error("[/api/chat] Error:", err);
    const message =
      err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function callGroq(
  apiKey: string,
  context: string,
  messages: ChatRequestBody["messages"]
): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: context },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callClaude(
  apiKey: string,
  context: string,
  messages: ChatRequestBody["messages"]
): Promise<string> {
  const claudeMessages = [
    { role: "user" as const, content: context },
    { role: "assistant" as const, content: "Understood. I have the current roadmap state. What would you like me to do?" },
    ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: claudeMessages,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Claude API error (${res.status}): ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

function buildContextMessage(
  nodes: ChatRequestBody["currentNodes"],
  edges: ChatRequestBody["currentEdges"],
  meta: ChatRequestBody["meta"]
): string {
  if (nodes.length === 0) {
    return `The roadmap canvas is currently empty. Title: "${meta.title || "Untitled"}". Description: "${meta.description || "none"}". The user is starting from scratch.`;
  }

  const maxY = Math.max(...nodes.map((n) => n.position.y));
  const nodeList = nodes
    .map(
      (n) =>
        `  - [${n.type}] "${n.label}" (id: ${n.id}, group: ${n.group}, pos: ${n.position.x},${n.position.y}, resources: ${n.resourceCount})`
    )
    .join("\n");
  const edgeList = edges
    .map((e) => `  - ${e.source} → ${e.target}`)
    .join("\n");

  return `Current roadmap state:
Title: "${meta.title}"
Description: "${meta.description}"
Nodes (${nodes.length}):
${nodeList}
Edges (${edges.length}):
${edgeList}
Lowest Y position: ${maxY}. Place new nodes starting at y=${maxY + 110} or lower.`;
}
