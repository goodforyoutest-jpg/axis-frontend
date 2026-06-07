// FILE: src/pages/AIChat.jsx

import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────
   CONFIG
───────────────────────────────────────── */
const BACKEND = import.meta.env.VITE_BACKEND_URL || "https://axis-backend-n5gc.onrender.com";

const QUICK_COMMANDS = [
  { icon: "📚", label: "Study plan today",   prompt: "Give me a focused CA Foundation study plan for today." },
  { icon: "🧮", label: "Maths help",          prompt: "Help me with a Quantitative Aptitude problem." },
  { icon: "📖", label: "Explain concept",     prompt: "Explain a key concept from Business Economics." },
  { icon: "⚖️",  label: "Business Laws",       prompt: "Give me an important Business Laws topic to revise." },
  { icon: "📝", label: "MCQ quiz me",         prompt: "Quiz me with 5 MCQs on any CA Foundation topic." },
  { icon: "🗓️",  label: "Add task",            prompt: "Add a study task for today to my task list." },
  { icon: "💡", label: "Motivate me",         prompt: "Give me a short motivating message for my CA studies." },
  { icon: "🔍", label: "Search web",          prompt: "Search the web for latest ICAI CA Foundation updates." },
];

/* ─────────────────────────────────────────
   MARKDOWN PARSER  (no external lib)
───────────────────────────────────────── */
function parseMarkdown(raw) {
  if (!raw || typeof raw !== "string") return "";

  // Strip [ACTION:{...}] tags
  let text = raw.replace(/\[ACTION:\{[^}]*\}\]/g, "").trim();

  const lines = text.split("\n");
  const output = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (/^### /.test(line)) {
      output.push(`<h3>${inlineMarkdown(line.replace(/^### /, ""))}</h3>`);
      i++; continue;
    }
    if (/^## /.test(line)) {
      output.push(`<h2>${inlineMarkdown(line.replace(/^## /, ""))}</h2>`);
      i++; continue;
    }
    if (/^# /.test(line)) {
      output.push(`<h1>${inlineMarkdown(line.replace(/^# /, ""))}</h1>`);
      i++; continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      output.push(`<hr/>`);
      i++; continue;
    }

    // Ordered list — collect consecutive numbered lines
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li>${inlineMarkdown(lines[i].replace(/^\d+\. /, ""))}</li>`);
        i++;
      }
      output.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Unordered list — collect consecutive bullet lines
    if (/^[-*•] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*•] /.test(lines[i])) {
        items.push(`<li>${inlineMarkdown(lines[i].replace(/^[-*•] /, ""))}</li>`);
        i++;
      }
      output.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Blockquote
    if (/^> /.test(line)) {
      output.push(`<blockquote>${inlineMarkdown(line.replace(/^> /, ""))}</blockquote>`);
      i++; continue;
    }

    // Fenced code block
    if (/^```/.test(line)) {
      const codeLines = [];
      i++; // skip opening ```
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      i++; // skip closing ```
      output.push(`<pre><code>${codeLines.join("\n")}</code></pre>`);
      continue;
    }

    // Empty line → spacing
    if (line.trim() === "") {
      output.push(`<br/>`);
      i++; continue;
    }

    // Paragraph
    output.push(`<p>${inlineMarkdown(line)}</p>`);
    i++;
  }

  return output.join("");
}

function inlineMarkdown(text) {
  return text
    // Escape HTML first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Link
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* Extract action tags from raw AI text */
function extractActions(raw) {
  if (!raw) return [];
  const matches = [...raw.matchAll(/\[ACTION:\{([^}]*)\}\]/g)];
  return matches.map(m => {
    try {
      return JSON.parse(`{${m[1]}}`);
    } catch {
      return { type: m[1] };
    }
  });
}

function actionLabel(action) {
  const t = action?.type || action?.action || "";
  if (/task/i.test(t))     return "✅ Task added";
  if (/remind/i.test(t))   return "⏰ Reminder set";
  if (/search/i.test(t))   return "🔍 Web search";
  if (/note/i.test(t))     return "📝 Note saved";
  if (/schedule/i.test(t)) return "🗓️ Scheduled";
  return "⚡ Action executed";
}

/* ─────────────────────────────────────────
   MARKDOWN MESSAGE COMPONENT
───────────────────────────────────────── */
function MarkdownMessage({ content }) {
  const html = parseMarkdown(content);
  return (
    <div
      className="markdown"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ─────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, padding: "4px 0 8px" }}>
      {/* AI Avatar */}
      <div className="ai-avatar" style={{ marginBottom: 0 }}>A</div>
      <div
        className="chat-bubble chat-bubble-ai"
        style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 5 }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SINGLE MESSAGE
───────────────────────────────────────── */
function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  const actions = isUser ? [] : extractActions(msg.content || "");

  return (
    <div
      className="animate-messageIn"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: 4,
        padding: "3px 0",
      }}
    >
      {!isUser && (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          <div className="ai-avatar">A</div>
          <div className="chat-bubble chat-bubble-ai">
            <MarkdownMessage content={msg.content} />
          </div>
        </div>
      )}

      {isUser && (
        <div className="chat-bubble chat-bubble-user">
          <span style={{ color: "inherit", fontSize: "0.9375rem", lineHeight: 1.6 }}>
            {msg.content}
          </span>
        </div>
      )}

      {/* Action chips */}
      {actions.length > 0 && (
        <div style={{ paddingLeft: 38, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {actions.map((a, idx) => (
            <span key={idx} className="action-chip">
              {actionLabel(a)}
            </span>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <span
        style={{
          fontSize: "0.6875rem",
          color: "var(--text3)",
          paddingLeft: isUser ? 0 : 38,
          paddingRight: isUser ? 4 : 0,
        }}
      >
        {msg.time}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────── */
function EmptyState({ onQuick }) {
  return (
    <div
      className="animate-fadeIn"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: "32px 20px 20px",
        gap: 24,
        textAlign: "center",
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "var(--grad-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          color: "var(--white)",
          boxShadow: "0 0 32px rgba(99,102,241,0.4), 0 4px 24px rgba(0,0,0,0.5)",
          animation: "glowPulse 3s ease-in-out infinite",
        }}
      >
        A
      </div>

      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.625rem",
            color: "var(--text1)",
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          Hey, Gaju! 👋
        </h2>
        <p style={{ color: "var(--text2)", fontSize: "0.9375rem", maxWidth: 280, margin: "0 auto" }}>
          Your AXIS AI is ready. Ask me anything about CA Foundation, life, or just get things done.
        </p>
      </div>

      {/* Quick commands */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--text3)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Quick Start
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {QUICK_COMMANDS.slice(0, 4).map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => onQuick(cmd.prompt)}
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                padding: "12px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 5,
                cursor: "pointer",
                transition: "all 0.2s var(--ease)",
                textAlign: "left",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--border-glow)";
                e.currentTarget.style.background = "var(--surface3)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--surface2)";
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>{cmd.icon}</span>
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text2)",
                  lineHeight: 1.3,
                }}
              >
                {cmd.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [memLoading, setMemLoading] = useState(true);
  const [error, setError]       = useState(null);
  const [toast, setToast]       = useState(null);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const toastTimer  = useRef(null);

  /* ── helpers ── */
  const showToast = useCallback((msg, duration = 2400) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), duration);
  }, []);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior, block: "end" });
    }, 60);
  }, []);

  const nowTime = () =>
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  /* ── fetch memory on mount ── */
  useEffect(() => {
    async function loadMemory() {
      try {
        const res = await fetch(`${BACKEND}/api/ai/memory`);
        if (!res.ok) throw new Error("Memory fetch failed");
        const data = await res.json();
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          // Attach display time to each stored message
          const withTime = data.messages.map((m) => ({
            ...m,
            time: m.time || "",
          }));
          setMessages(withTime);
          scrollToBottom("instant");
        }
      } catch (e) {
        console.warn("Memory load error:", e.message);
        // Fail silently — fresh session
      } finally {
        setMemLoading(false);
      }
    }
    loadMemory();
    // eslint-disable-next-line
  }, []);

  /* ── save a message to memory ── */
  const saveToMemory = useCallback(async (msgs) => {
    try {
      await fetch(`${BACKEND}/api/ai/memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs }),
      });
    } catch (e) {
      console.warn("Memory save error:", e.message);
    }
  }, []);

  /* ── clear memory ── */
  const clearMemory = useCallback(async () => {
    try {
      await fetch(`${BACKEND}/api/ai/memory`, {
        method: "DELETE",
      });
      setMessages([]);
      showToast("🗑️ Memory cleared");
    } catch {
      // Even on error, clear UI
      setMessages([]);
      showToast("🗑️ Chat cleared");
    }
  }, [showToast]);

  /* ── send message ── */
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || loading) return;

      setInput("");
      setError(null);

      const userMsg = {
        role: "user",
        content: trimmed,
        time: nowTime(),
      };

      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setLoading(true);
      scrollToBottom();

      // History for API (role + content only, no time)
      const historyForApi = newMessages.map(({ role, content }) => ({ role, content }));

      try {
        const res = await fetch(`${BACKEND}/api/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: historyForApi,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Server error ${res.status}`);
        }

        const data = await res.json();
        const aiContent = data.reply || data.message || data.response || "Sorry, I didn't get a response.";

        const aiMsg = {
          role: "assistant",
          content: aiContent,
          time: nowTime(),
        };

        const finalMessages = [...newMessages, aiMsg];
        setMessages(finalMessages);
        scrollToBottom();

        // Save full history to memory
        await saveToMemory(finalMessages.map(({ role, content }) => ({ role, content })));

        // Notify if action was taken
        const actions = extractActions(aiContent);
        if (actions.length > 0) {
          showToast(actionLabel(actions[0]));
        }
      } catch (e) {
        setError(e.message || "Something went wrong. Try again.");
        // Remove optimistic user message on hard error
        // (keep for UX — user can retry)
        scrollToBottom();
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [input, loading, messages, scrollToBottom, saveToMemory, showToast]
  );

  /* ── handle Enter key ── */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── auto-scroll on new messages ── */
  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages.length, scrollToBottom]);

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--bg)",
        position: "relative",
      }}
    >
      {/* ── HEADER ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(10,10,15,0.92)",
          backdropFilter: "blur(20px) saturate(2)",
          WebkitBackdropFilter: "blur(20px) saturate(2)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar */}
          <div
            className="ai-avatar animate-glowPulse"
            style={{ width: 36, height: 36, fontSize: "0.875rem" }}
          >
            A
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.0625rem",
                color: "var(--text1)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              AXIS AI
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
              <span
                className="badge badge-success badge-dot"
                style={{ fontSize: "0.65rem", padding: "1px 7px" }}
              >
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Clear memory button */}
        <button
          onClick={clearMemory}
          className="btn btn-ghost btn-sm"
          title="Clear chat memory"
          style={{ color: "var(--text3)", fontSize: "0.8125rem" }}
        >
          <span>🗑️</span>
          <span>Clear</span>
        </button>
      </header>

      {/* ── QUICK COMMANDS STRIP ── */}
      <div
        style={{
          padding: "10px 16px 6px",
          flexShrink: 0,
          borderBottom: "1px solid rgba(42,42,63,0.5)",
          background: "rgba(10,10,15,0.6)",
        }}
      >
        <div className="scroll-x" style={{ gap: 8 }}>
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd.label}
              className="quick-chip"
              onClick={() => sendMessage(cmd.prompt)}
              disabled={loading}
            >
              <span>{cmd.icon}</span>
              <span>{cmd.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div
        className="scroll-y"
        style={{
          flex: 1,
          padding: "12px 16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        {/* Memory loading state */}
        {memLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "32px 0",
              color: "var(--text3)",
              fontSize: "0.875rem",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                display: "inline-block",
                animation: "spin 1s linear infinite",
                fontSize: "1rem",
              }}
            >
              ⟳
            </span>
            Loading memory…
          </div>
        )}

        {/* Empty state */}
        {!memLoading && messages.length === 0 && (
          <EmptyState onQuick={(p) => sendMessage(p)} />
        )}

        {/* Messages list */}
        {!memLoading &&
          messages.map((msg, idx) => (
            <ChatMessage key={idx} msg={msg} />
          ))}

        {/* Typing indicator */}
        {loading && <TypingIndicator />}

        {/* Error state */}
        {error && !loading && (
          <div
            className="animate-slideUp"
            style={{
              background: "var(--danger-dim)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "var(--r-md)",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              margin: "4px 0",
            }}
          >
            <span style={{ fontSize: "0.875rem", color: "#F87171" }}>
              ⚠️ {error}
            </span>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                setError(null);
                sendMessage(messages[messages.length - 1]?.content || "");
              }}
              style={{ padding: "5px 10px", fontSize: "0.75rem" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} style={{ height: 1 }} />
      </div>

      {/* ── INPUT AREA ── */}
      <div
        style={{
          padding: "10px 14px 14px",
          background: "rgba(10,10,15,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            padding: "6px 6px 6px 14px",
            transition: "border-color 0.2s var(--ease), box-shadow 0.2s var(--ease)",
          }}
          onFocusCapture={e =>
            (e.currentTarget.style.borderColor = "var(--primary)",
            (e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-glow)"))
          }
          onBlurCapture={e =>
            ((e.currentTarget.style.borderColor = "var(--border)"),
            (e.currentTarget.style.boxShadow = "none"))
          }
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask AXIS anything…"
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text1)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9375rem",
              lineHeight: 1.6,
              resize: "none",
              maxHeight: 120,
              overflowY: "auto",
              paddingTop: 6,
              paddingBottom: 6,
              caretColor: "var(--primary)",
            }}
          />

          {/* Send button */}
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: loading || !input.trim() ? "var(--surface3)" : "var(--grad-primary)",
              border: "none",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "1.0625rem",
              transition: "all 0.2s var(--ease)",
              boxShadow: loading || !input.trim() ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => {
              if (!loading && input.trim())
                e.currentTarget.style.transform = "scale(1.06)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {loading ? (
              <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>
                ⟳
              </span>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            )}
          </button>
        </div>

        {/* Hint */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.6875rem",
            color: "var(--text3)",
            marginTop: 8,
            letterSpacing: "0.02em",
          }}
        >
          AXIS · Powered by Llama 3.3 · Press Enter to send
        </p>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div
          className="toast"
          style={{
            bottom: "calc(80px + 12px)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
