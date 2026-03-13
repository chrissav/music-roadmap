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

The "resources" array is REQUIRED on every node. Each resource must have:
- "title": descriptive name of the resource
- "url": a real, working URL (e.g. musictheory.net, YouTube, Wikipedia, Coursera)
- "type": one of "article", "video", "course", or "tool"

Include 1-3 resources per node. Use real educational URLs.

Each edge object:
{ "id": "e-source-target", "source": "node-id", "target": "node-id", "style": "spine" | "branch" }

## Layout rules
- Spine nodes (milestone/topic) go at x≈300, spaced ~110px apart vertically
- Subtopics branch left (x≈120) or right (x≈520) from their parent topic
- Use the "group" field to group related nodes (e.g. "basics", "rhythm", "harmony")

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
- "updatedNodes": for modifying existing nodes. You MUST include the node's existing "id" and ALL of its fields (id, type, label, description, position, group, details). The entire node object will be replaced, so include everything, not just the changed fields.

### When to use "metaUpdate":
If metaUpdate is provided, it should be { "title": "...", "description": "..." } to update the roadmap metadata.

### Conversational responses:
If the user is just chatting or asking a question (not requesting roadmap changes), return empty arrays:
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
- The "content" field in details should be 2-3 paragraphs of educational material
- ALWAYS include 1-3 resources per node with real URLs
- Alternate subtopic sides (left/right) for visual balance
- When the user asks to update, edit, add resources to, or change an existing node, use "updatedNodes" with the node's existing id`;

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();

    const apiKey =
      body.apiKey ||
      process.env.GROQ_API_KEY ||
      envLocal.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "No API key provided. Add your Groq API key in the chat panel to get started.",
        },
        { status: 400 }
      );
    }

    const contextMessage = buildContextMessage(
      body.currentNodes,
      body.currentEdges,
      body.meta
    );

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 4096,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: contextMessage },
          ...body.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error("[/api/chat] Groq HTTP error:", groqRes.status, errBody);
      return NextResponse.json(
        {
          error: `Groq API error (${groqRes.status}): ${errBody.slice(0, 200)}`,
        },
        { status: 500 }
      );
    }

    const completion = await groqRes.json();
    const raw: string = completion.choices?.[0]?.message?.content ?? "";

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
