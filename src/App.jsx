// FILE: src/App.jsx
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Study from "./pages/Study";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";

// ── Lazy-load the Command (AI chat) page if it exists, fallback inline
let Command;
try {
  Command = (await import("./pages/Command")).default;
} catch {
  Command = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: 12 }}>
      <div className="ai-avatar" style={{ width: 48, height: 48, fontSize: "1rem" }}>AI</div>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text1)" }}>AXIS AI</span>
      <p style={{ color: "var(--text3)", fontSize: "0.875rem" }}>Command module coming soon</p>
    </div>
  );
}

// ── SVG Nav Icons ─────────────────────────────────────────────
const CommandIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#6366F1" : "#475569"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
  </svg>
);
const StudyIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#6366F1" : "#475569"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const AIIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#6366F1" : "#475569"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4l3 3" />
    <path d="M8.5 8.5A5 5 0 0 1 17 12" strokeDasharray="2 2" />
  </svg>
);
const TasksIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#6366F1" : "#475569"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const SettingsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#6366F1" : "#475569"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ── AXIS AI logo center icon ──────────────────────────────────
const AxisAINavIcon = ({ active }) => (
  <div style={{
    width: 42, height: 42, borderRadius: "50%",
    background: active ? "var(--grad-primary)" : "var(--surface2)",
    border: `2px solid ${active ? "transparent" : "var(--border)"}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: active ? "0 0 16px rgba(99,102,241,0.4)" : "none",
    transition: "all 0.25s var(--ease)",
    marginTop: -16,
    flexShrink: 0
  }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6366F1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  </div>
);

// ── Tab config ────────────────────────────────────────────────
const TABS = [
  { id: "command",  label: "Command",  Icon: CommandIcon,  Page: Dashboard }, // Dashboard acts as command/home
  { id: "study",    label: "Study",    Icon: StudyIcon,    Page: Study },
  { id: "axis-ai",  label: "AXIS AI",  Icon: null,         Page: Command, isCenter: true },
  { id: "tasks",    label: "Tasks",    Icon: TasksIcon,    Page: Tasks },
  { id: "settings", label: "Settings", Icon: SettingsIcon, Page: Settings },
];

// ── Page transition wrapper ───────────────────────────────────
function PageWrapper({ children, tabId }) {
  return (
    <div
      key={tabId}
      style={{ animation: "fadeIn 0.22s var(--ease) both", minHeight: "100vh" }}
    >
      {children}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("command");

  const current = TABS.find(t => t.id === activeTab);
  const PageComponent = current?.Page;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      {/* Page content */}
      <PageWrapper tabId={activeTab}>
        {PageComponent && <PageComponent />}
      </PageWrapper>

      {/* Bottom nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "rgba(10,10,15,0.94)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderTop: "1px solid var(--border)",
        height: "var(--nav-h)",
        display: "flex", alignItems: "center",
        zIndex: 100,
        padding: "0 4px",
        boxShadow: "0 -1px 0 rgba(255,255,255,0.04)"
      }}>
        {TABS.map(({ id, label, Icon, isCenter }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`nav-item${active ? " active" : ""}`}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: isCenter ? 0 : 3,
                background: "none", border: "none", cursor: "pointer",
                padding: isCenter ? "0" : "8px 0",
                position: "relative",
                minHeight: 64
              }}
            >
              {isCenter ? (
                <AxisAINavIcon active={active} />
              ) : (
                <span className="nav-icon">
                  <Icon active={active} />
                </span>
              )}
              <span
                className="nav-label"
                style={{
                  color: active ? "var(--primary)" : "var(--text3)",
                  fontSize: isCenter ? "0.6rem" : "0.6875rem",
                  fontWeight: 700,
                  marginTop: isCenter ? 6 : 0
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Toast config */}
      <Toaster
        position="bottom-center"
        containerStyle={{ bottom: 76 }}
        toastOptions={{
          style: {
            background: "#1A1A28",
            color: "#F1F5F9",
            border: "1px solid #2A2A3F",
            borderRadius: 12,
            fontSize: "0.875rem",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            maxWidth: 340,
          },
          success: {
            iconTheme: { primary: "#10B981", secondary: "#1A1A28" },
            style: {
              background: "#1A1A28",
              color: "#F1F5F9",
              border: "1px solid rgba(16,185,129,0.3)",
            }
          },
          error: {
            iconTheme: { primary: "#EF4444", secondary: "#1A1A28" },
            style: {
              background: "#1A1A28",
              color: "#F1F5F9",
              border: "1px solid rgba(239,68,68,0.3)",
            }
          },
          duration: 3000,
        }}
      />
    </div>
  );
}
