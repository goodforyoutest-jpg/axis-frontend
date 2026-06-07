import { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_BACKEND_URL;

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="8" width="18" height="13" rx="2" stroke="#4F46E5" strokeWidth="1.8"/>
    <path d="M9 8V6a3 3 0 016 0v2" stroke="#4F46E5" strokeWidth="1.8"/>
    <circle cx="9" cy="14" r="1.5" fill="#4F46E5"/>
    <circle cx="15" cy="14" r="1.5" fill="#4F46E5"/>
  </svg>
);

const ActionIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const QUICK_PROMPTS = [
  "What should I study today?",
  "Add a high priority task for Accounting",
  "Set Instagram limit to 20 minutes",
  "How am I doing this week?",
  "Lock all timepass apps",
  "Generate my timetable for 2 hours",
];

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "I am AXIS. Your strict CA Foundation accountability partner. I have full control of your app — I can add tasks, set app limits, update your schedule, and generate your timetable. Just tell me what you need. I won't go easy on you, Gajanan." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (msg) => {
    const userMsg = msg || input.trim();
    if (!userMsg) return;
    setInput("");
    setShowQuick(false);
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/ai/chat`, { message: userMsg });
      const { reply, action } = res.data;
      setMessages(prev => [...prev, { role: "assistant", text: reply, action }]);
      if (action) {
        toast.success(`Action executed: ${action.action.replace(/_/g, ' ')}`);
      }
    } catch (e) {
      toast.error("AXIS unavailable");
      setMessages(prev => [...prev, { role: "assistant", text: "Connection error. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--off)" }}>
      <div style={{ padding: "20px 20px 16px", background: "white", borderBottom: "1px solid var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BotIcon />
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, fontFamily: "Syne", color: "var(--text1)" }}>AXIS AI</h2>
            <p style={{ fontSize: "12px", color: "var(--text2)", marginTop: "1px" }}>Strict teacher · Full app control</p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span className="badge badge-emerald">Online</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: "12px" }}>
            {m.role === "assistant" && (
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "8px", flexShrink: 0, alignSelf: "flex-end" }}>
                <BotIcon />
              </div>
            )}
            <div style={{ maxWidth: "78%" }}>
              <div style={{
                padding: "12px 16px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.role === "user" ? "var(--indigo)" : "white",
                border: m.role === "assistant" ? "1px solid var(--border)" : "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                fontSize: "14px", lineHeight: "1.6",
                color: m.role === "user" ? "white" : "var(--text1)"
              }}>
                {m.text}
              </div>
              {m.action && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", padding: "6px 10px", background: "#ECFDF5", borderRadius: "8px", border: "1px solid #A7F3D0" }}>
                  <ActionIcon />
                  <span style={{ fontSize: "11px", color: "#065F46", fontWeight: 600 }}>
                    Executed: {m.action.action.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BotIcon />
            </div>
            <div style={{ padding: "12px 16px", background: "white", borderRadius: "18px 18px 18px 4px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4F46E5", animation: `bounce 1s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {showQuick && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "10px", fontWeight: 600 }}>QUICK COMMANDS</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {QUICK_PROMPTS.map((q, i) => (
                <button key={i} onClick={() => send(q)} style={{
                  padding: "8px 14px", borderRadius: "100px", border: "1.5px solid var(--border)",
                  background: "white", fontSize: "12px", fontWeight: 500, color: "var(--text1)",
                  cursor: "pointer", fontFamily: "DM Sans"
                }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "12px 16px 80px", background: "white", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask AXIS or give a command..."
            style={{ flex: 1, borderRadius: "100px", padding: "12px 18px", fontSize: "14px" }}
          />
          <button onClick={() => send()} disabled={loading} style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: loading ? "#C7D2FE" : "var(--indigo)",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <SendIcon />
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  );
}
