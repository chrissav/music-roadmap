"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
} from "lucide-react";
import type { RoadmapNodeData, RoadmapEdgeData, RoadmapMeta } from "@/lib/types";

const STORAGE_KEY = "music-roadmap-groq-key";

function getSavedApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

function saveApiKey(key: string) {
  if (key) {
    localStorage.setItem(STORAGE_KEY, key);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  nodesAdded?: number;
  nodesUpdated?: number;
  edgesAdded?: number;
  error?: boolean;
}

interface AIResponse {
  message: string;
  nodes: RoadmapNodeData[];
  edges: RoadmapEdgeData[];
  updatedNodes?: RoadmapNodeData[];
  metaUpdate?: { title: string; description: string } | null;
  error?: string;
}

interface AIChatPanelProps {
  currentNodes: RoadmapNodeData[];
  currentEdges: RoadmapEdgeData[];
  meta: RoadmapMeta;
  onAddNodes: (nodes: RoadmapNodeData[]) => void;
  onAddEdges: (edges: RoadmapEdgeData[]) => void;
  onUpdateNodes: (nodes: RoadmapNodeData[]) => void;
  onUpdateMeta: (meta: Partial<Pick<RoadmapMeta, "title" | "description">>) => void;
}

const SUGGESTIONS = [
  "Create a beginner roadmap about jazz piano",
  "Add a section on chord progressions with 3 subtopics",
  "Add resources to all nodes that are missing them",
  "Generate a complete guitar scales roadmap",
];

function APIKeySection({
  apiKey,
  onSave,
  onClear,
}: {
  apiKey: string;
  onSave: (key: string) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [showKey, setShowKey] = useState(false);

  if (apiKey) {
    const masked = apiKey.slice(0, 8) + "..." + apiKey.slice(-4);
    return (
      <div className="border-b border-border px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-500">
            <Key size={10} />
            <span className="font-medium">API key saved</span>
          </div>
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Trash2 size={9} />
            Remove
          </button>
        </div>
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
          {masked}
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-border px-3 py-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Key size={10} className="text-muted-foreground" />
        <span className="text-[10px] font-medium text-foreground">
          Groq API Key
        </span>
        <a
          href="https://console.groq.com/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-0.5 text-[10px] text-primary hover:underline"
        >
          Get free key <ExternalLink size={8} />
        </a>
      </div>
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <input
            type={showKey ? "text" : "password"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="gsk_..."
            className="w-full rounded border border-border bg-background px-2 py-1.5 pr-7 font-mono text-[10px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showKey ? <EyeOff size={10} /> : <Eye size={10} />}
          </button>
        </div>
        <button
          onClick={() => {
            if (draft.trim()) {
              onSave(draft.trim());
              setDraft("");
            }
          }}
          disabled={!draft.trim()}
          className="shrink-0 rounded bg-primary px-2.5 py-1.5 text-[10px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          Save
        </button>
      </div>
      <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
        Your key stays in your browser and is never stored on our server.
        It&apos;s only used to call the Groq API.
      </p>
    </div>
  );
}

export function AIChatPanel({
  currentNodes,
  currentEdges,
  meta,
  onAddNodes,
  onAddEdges,
  onUpdateNodes,
  onUpdateMeta,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setApiKey(getSavedApiKey());
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSaveKey = useCallback((key: string) => {
    saveApiKey(key);
    setApiKey(key);
  }, []);

  const handleClearKey = useCallback(() => {
    saveApiKey("");
    setApiKey("");
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      if (!apiKey) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            role: "user" as const,
            content: text.trim(),
          },
          {
            id: `msg-${Date.now() + 1}`,
            role: "assistant" as const,
            content:
              "Please add your Groq API key above to use the AI assistant. You can get a free key at console.groq.com/keys",
            error: true,
          },
        ]);
        return;
      }

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: text.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey,
            messages: history,
            currentNodes: currentNodes.map((n) => ({
              id: n.id,
              type: n.type,
              label: n.label,
              description: n.description,
              position: n.position,
              group: n.group,
              resourceCount: n.details?.resources?.length ?? 0,
            })),
            currentEdges: currentEdges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
            })),
            meta: { title: meta.title, description: meta.description },
          }),
        });

        const data: AIResponse = await res.json();

        if (data.error) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              role: "assistant",
              content: data.error!,
              error: true,
            },
          ]);
          setLoading(false);
          return;
        }

        if (data.nodes?.length > 0) onAddNodes(data.nodes);
        if (data.edges?.length > 0) onAddEdges(data.edges);
        if (data.updatedNodes && data.updatedNodes.length > 0) onUpdateNodes(data.updatedNodes);
        if (data.metaUpdate) onUpdateMeta(data.metaUpdate);

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: data.message || "Done!",
            nodesAdded: data.nodes?.length ?? 0,
            nodesUpdated: data.updatedNodes?.length ?? 0,
            edgesAdded: data.edges?.length ?? 0,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: "Failed to reach the AI service. Check your API key and try again.",
            error: true,
          },
        ]);
      }
      setLoading(false);
    },
    [loading, messages, apiKey, currentNodes, currentEdges, meta, onAddNodes, onAddEdges, onUpdateNodes, onUpdateMeta]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        <Sparkles size={16} />
        AI Assistant
      </button>
    );
  }

  return (
    <div className="flex w-80 shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <Sparkles size={13} className="text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            AI Assistant
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Collapse"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {/* API Key */}
      <APIKeySection
        apiKey={apiKey}
        onSave={handleSaveKey}
        onClear={handleClearKey}
      />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Describe what you want in your roadmap and I&apos;ll generate the
              nodes and connections for you.
            </p>
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Try saying
              </p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="block w-full rounded-md border border-border px-2.5 py-2 text-left text-xs text-foreground transition-colors hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="mb-3">
            <div className="mb-1 flex items-center gap-1.5">
              {msg.role === "user" ? (
                <User size={12} className="text-muted-foreground" />
              ) : msg.error ? (
                <AlertCircle size={12} className="text-red-500" />
              ) : (
                <Bot size={12} className="text-primary" />
              )}
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {msg.role === "user" ? "You" : "AI"}
              </span>
            </div>
            <div
              className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary/10 text-foreground"
                  : msg.error
                    ? "bg-red-500/10 text-red-400"
                    : "bg-accent/50 text-foreground"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "assistant" &&
              !msg.error &&
              ((msg.nodesAdded ?? 0) > 0 || (msg.nodesUpdated ?? 0) > 0) && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-500">
                  <CheckCircle2 size={10} />
                  {(msg.nodesAdded ?? 0) > 0 &&
                    `Added ${msg.nodesAdded} node${msg.nodesAdded !== 1 ? "s" : ""}`}
                  {(msg.nodesAdded ?? 0) > 0 && (msg.nodesUpdated ?? 0) > 0 && ", "}
                  {(msg.nodesUpdated ?? 0) > 0 &&
                    `Updated ${msg.nodesUpdated} node${msg.nodesUpdated !== 1 ? "s" : ""}`}
                  {(msg.edgesAdded ?? 0) > 0 &&
                    `, ${msg.edgesAdded} connection${msg.edgesAdded !== 1 ? "s" : ""}`}
                </div>
              )}
          </div>
        ))}

        {loading && (
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 size={12} className="animate-spin" />
            Generating...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={apiKey ? "Describe what to add..." : "Add your API key above first..."}
            rows={2}
            className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="flex h-auto items-end rounded-md bg-primary px-2.5 pb-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
