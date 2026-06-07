// FILE: src/pages/Settings.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_BACKEND_URL;

// Icons
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const RefreshIcon = ({ spinning }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: spinning ? "spin 1s linear infinite" : "none" }}>
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const SmartphoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);
const DatabaseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LIMIT_APPS = [
  { name: "Instagram", icon: "📷", mins: 30 },
  { name: "YouTube", icon: "▶", mins: 45 },
  { name: "Twitter / X", icon: "✕", mins: 20 },
  { name: "WhatsApp", icon: "💬", mins: 30 },
  { name: "Snapchat", icon: "👻", mins: 15 },
  { name: "Reddit", icon: "◈", mins: 20 },
];

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
        background: on ? "var(--primary)" : "var(--surface3)",
        position: "relative", transition: "background 0.25s var(--ease)", flexShrink: 0
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: on ? "calc(100% - 21px)" : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left 0.25s var(--ease)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
      }} />
    </button>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 10px" }}>
      <span style={{ color: "var(--primary)" }}>{icon}</span>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "var(--text1)" }}>{title}</span>
    </div>
  );
}

function RowCard({ children, style = {} }) {
  return (
    <div className="card" style={{ margin: "0 16px 8px", padding: "14px 16px", ...style }}>
      {children}
    </div>
  );
}

// ── COACHING ──────────────────────────────────────────────────
function CoachingSection() {
  const [days, setDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("20:00");
  const [saving, setSaving] = useState(false);

  const toggleDay = (d) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  async function save() {
    setSaving(true);
    try {
      await axios.post(`${API}/api/study/coaching`, { days, startTime: start, endTime: end });
      toast.success("Coaching schedule saved!");
    } catch {
      toast.error("Failed to save coaching");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)",
    padding: "8px 12px", fontSize: "0.875rem", color: "var(--text1)", outline: "none",
    fontFamily: "var(--font-body)", colorScheme: "dark", flex: 1
  };

  return (
    <>
      <SectionHeader icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>} title="Coaching Schedule" />
      <RowCard>
        <div style={{ fontSize: "0.75rem", color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Active days</div>
        <div style={{ display: "flex", gap: 6 }}>
          {DAYS.map(d => (
            <button key={d} onClick={() => toggleDay(d)} style={{
              flex: 1, background: days.includes(d) ? "var(--primary)" : "var(--surface2)",
              border: `1px solid ${days.includes(d) ? "var(--primary)" : "var(--border)"}`,
              borderRadius: "var(--r-sm)", padding: "6px 2px",
              color: days.includes(d) ? "#fff" : "var(--text3)", fontWeight: 700, fontSize: "0.7rem",
              cursor: "pointer", transition: "all var(--t-fast) var(--ease)"
            }}>{d}</button>
          ))}
        </div>
      </RowCard>
      <RowCard>
        <div style={{ fontSize: "0.75rem", color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Study hours</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="time" value={start} onChange={e => setStart(e.target.value)} style={inputStyle} />
          <span style={{ color: "var(--text3)", fontSize: "0.8rem" }}>to</span>
          <input type="time" value={end} onChange={e => setEnd(e.target.value)} style={inputStyle} />
        </div>
        <button className="btn btn-primary" style={{ width: "100%", marginTop: 12, opacity: saving ? 0.7 : 1 }} disabled={saving} onClick={save}>
          <CheckIcon /> {saving ? "Saving..." : "Save Schedule"}
        </button>
      </RowCard>
    </>
  );
}

// ── APP LIMITS ────────────────────────────────────────────────
function AppLimitsSection() {
  return (
    <>
      <SectionHeader icon={<SmartphoneIcon />} title="App Limits" />
      <RowCard style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <span style={{ color: "#F59E0B" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></span>
          <span style={{ fontSize: "0.8rem", color: "#F59E0B", fontWeight: 700 }}>Managed by Digital Wellbeing</span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text2)", lineHeight: 1.6 }}>
          App time limits are set through your phone's built-in Digital Wellbeing (Android) or Screen Time (iOS) settings — not stored by AXIS.
        </p>
      </RowCard>
      <RowCard>
        <div style={{ fontSize: "0.75rem", color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>How to set limits</div>
        {[
          { step: "1", text: "Open Settings on your phone" },
          { step: "2", text: "Tap Digital Wellbeing & Parental Controls" },
          { step: "3", text: "Select an app → Set timer" },
          { step: "4", text: "Choose your daily limit" },
        ].map(({ step, text }) => (
          <div key={step} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ background: "var(--primary-dim)", color: "var(--primary)", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, flexShrink: 0 }}>{step}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text2)", paddingTop: 3 }}>{text}</span>
          </div>
        ))}
        <button
          onClick={() => { try { window.open("intent://com.google.android.apps.wellbeing#Intent;package=com.google.android.apps.wellbeing;scheme=android-app;end", "_blank"); } catch { toast("Open Digital Wellbeing in your Settings app"); } }}
          className="btn btn-outline" style={{ width: "100%", marginTop: 6 }}
        >
          <SmartphoneIcon /> Open Digital Wellbeing
        </button>
      </RowCard>
      <RowCard>
        <div style={{ fontSize: "0.75rem", color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Suggested limits</div>
        {LIMIT_APPS.map(({ name, mins }) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--text1)", fontWeight: 500 }}>{name}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--warning)", fontWeight: 700, background: "var(--warning-dim)", padding: "2px 8px", borderRadius: "var(--r-full)" }}>{mins} min/day</span>
          </div>
        ))}
      </RowCard>
    </>
  );
}

// ── NOTIFICATIONS ─────────────────────────────────────────────
function NotificationsSection() {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [scheduled, setScheduled] = useState([]);
  const [loadingSched, setLoadingSched] = useState(true);
  const [testing, setTesting] = useState(false);
  const [newNotif, setNewNotif] = useState({ message: "", time: "08:00", type: "reminder" });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadScheduled(); }, []);

  async function loadScheduled() {
    try {
      const { data } = await axios.get(`${API}/api/notify/scheduled`);
      setScheduled(data.notifications || data || []);
    } catch { /* silent */ } finally { setLoadingSched(false); }
  }

  async function testNotif() {
    setTesting(true);
    try {
      await axios.post(`${API}/api/notify/send`, { message: "AXIS test notification!" });
      toast.success("Test notification sent!");
    } catch { toast.error("Failed to send test"); } finally { setTesting(false); }
  }

  async function addScheduled() {
    if (!newNotif.message.trim()) return toast.error("Message required");
    setAdding(true);
    try {
      const { data } = await axios.post(`${API}/api/notify/scheduled`, newNotif);
      setScheduled(prev => [...prev, data.notification || data]);
      setNewNotif({ message: "", time: "08:00", type: "reminder" });
      setShowForm(false);
      toast.success("Scheduled!");
    } catch { toast.error("Failed to schedule"); } finally { setAdding(false); }
  }

  async function deleteScheduled(id) {
    try {
      await axios.delete(`${API}/api/notify/scheduled/${id}`);
      setScheduled(prev => prev.filter(n => n._id !== id && n.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  }

  const inputStyle = { background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "8px 12px", fontSize: "0.875rem", color: "var(--text1)", outline: "none", fontFamily: "var(--font-body)", width: "100%" };

  return (
    <>
      <SectionHeader icon={<BellIcon />} title="Notifications" />
      <RowCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text1)" }}>Enable Notifications</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text3)", marginTop: 2 }}>Receive study reminders & AI alerts</div>
          </div>
          <Toggle on={notifEnabled} onChange={setNotifEnabled} />
        </div>
        <button className="btn btn-ghost" style={{ width: "100%", marginTop: 12, borderColor: "var(--border)", opacity: testing ? 0.7 : 1 }} disabled={testing} onClick={testNotif}>
          <BellIcon /> {testing ? "Sending..." : "Send Test Notification"}
        </button>
      </RowCard>

      <RowCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text1)" }}>Scheduled Notifications</span>
          <button onClick={() => setShowForm(f => !f)} style={{ background: "var(--primary-dim)", border: "1px solid var(--border-glow)", borderRadius: "var(--r-md)", padding: "4px 10px", fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}>
            {showForm ? "Cancel" : "+ Add"}
          </button>
        </div>

        {showForm && (
          <div style={{ marginBottom: 12, padding: 12, background: "var(--surface2)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
            <input value={newNotif.message} onChange={e => setNewNotif(p => ({ ...p, message: e.target.value }))} placeholder="Notification message..." style={{ ...inputStyle, marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <input type="time" value={newNotif.time} onChange={e => setNewNotif(p => ({ ...p, time: e.target.value }))} style={{ ...inputStyle, flex: 1, colorScheme: "dark" }} />
              <select value={newNotif.type} onChange={e => setNewNotif(p => ({ ...p, type: e.target.value }))} style={{ ...inputStyle, flex: 1, colorScheme: "dark" }}>
                <option value="reminder">Reminder</option>
                <option value="study">Study</option>
                <option value="checkin">Check-in</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 8, opacity: adding ? 0.7 : 1 }} disabled={adding} onClick={addScheduled}>
              {adding ? "Adding..." : "Schedule"}
            </button>
          </div>
        )}

        {loadingSched ? (
          <div className="skeleton" style={{ height: 40, borderRadius: "var(--r-md)" }} />
        ) : scheduled.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "var(--text3)", textAlign: "center", padding: "10px 0" }}>No scheduled notifications.</p>
        ) : (
          scheduled.map((n) => (
            <div key={n._id || n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--text1)", fontWeight: 600 }}>{n.message}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{n.time} · {n.type}</div>
              </div>
              <button onClick={() => deleteScheduled(n._id || n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}
              ><TrashIcon /></button>
            </div>
          ))
        )}
      </RowCard>

      <RowCard style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Notification types</div>
        {[
          { type: "morning", desc: "Daily morning study briefing" },
          { type: "evening", desc: "End-of-day progress & AI message" },
          { type: "lock", desc: "AI warning when check-in missed" },
          { type: "reminder", desc: "Custom scheduled reminders" },
        ].map(({ type, desc }) => (
          <div key={type} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--primary)", background: "var(--primary-dim)", borderRadius: "var(--r-full)", padding: "2px 8px", whiteSpace: "nowrap" }}>{type}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text2)" }}>{desc}</span>
          </div>
        ))}
      </RowCard>
    </>
  );
}

// ── SYSTEM ────────────────────────────────────────────────────
function SystemSection() {
  const [status, setStatus] = useState({ backend: null, db: null, ai: null });
  const [pinging, setPinging] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => { pingBackend(); }, []);

  async function pingBackend() {
    setPinging(true);
    try {
      const { data } = await axios.get(`${API}/`);
      setStatus({ backend: "online", db: data.db || "connected", ai: data.model || "claude-3-haiku" });
    } catch {
      setStatus({ backend: "offline", db: "unknown", ai: "unknown" });
    } finally { setPinging(false); }
  }

  async function clearMemory() {
    if (!window.confirm("Clear all AI memory? This cannot be undone.")) return;
    setClearing(true);
    try {
      await axios.delete(`${API}/api/ai/memory`);
      toast.success("AI memory cleared");
    } catch { toast.error("Failed to clear memory"); } finally { setClearing(false); }
  }

  const StatusDot = ({ val }) => (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: "0.75rem", fontWeight: 700,
      color: val === "online" || val === "connected" ? "var(--success)" : val === "offline" ? "var(--danger)" : "var(--text3)"
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: val === "online" || val === "connected" ? "var(--success)" : val === "offline" ? "var(--danger)" : "var(--text3)", display: "inline-block" }} />
      {val || "checking..."}
    </span>
  );

  return (
    <>
      <SectionHeader icon={<DatabaseIcon />} title="System" />
      <RowCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text1)" }}>Backend Status</span>
          <button onClick={pingBackend} disabled={pinging} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)" }}>
            <RefreshIcon spinning={pinging} />
          </button>
        </div>
        {[
          { label: "API Server", val: status.backend },
          { label: "Database", val: status.db },
          { label: "AI Model", val: status.ai },
        ].map(({ label, val }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text2)" }}>{label}</span>
            <StatusDot val={val} />
          </div>
        ))}
      </RowCard>
      <RowCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text1)" }}>Clear AI Memory</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text3)", marginTop: 2 }}>Wipe all AI conversation context</div>
          </div>
          <button className="btn btn-danger" style={{ padding: "6px 14px", fontSize: "0.8rem", opacity: clearing ? 0.7 : 1 }} disabled={clearing} onClick={clearMemory}>
            <TrashIcon /> {clearing ? "Clearing..." : "Clear"}
          </button>
        </div>
      </RowCard>
      <RowCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text1)" }}>App Info</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text3)", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r-full)", padding: "2px 8px" }}>v1.0.0</span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text2)", lineHeight: 1.7 }}>
          AXIS is an AI-powered study companion built for CA Foundation aspirants. It tracks your daily progress, generates intelligent study timetables, sends motivational check-ins, and keeps you focused with app usage insights — all in one place.
        </p>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <ShieldIcon />
          <span style={{ fontSize: "0.75rem", color: "var(--text3)" }}>Built with privacy in mind. Your data stays on your device.</span>
        </div>
      </RowCard>
    </>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function Settings() {
  const [tab, setTab] = useState("Coaching");
  const TABS = ["Coaching", "App Limits", "Notifications", "System"];

  return (
    <div className="page-content" style={{ paddingBottom: 80 }}>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SettingsIcon />
          <span className="page-title">Settings</span>
        </div>
      </div>

      {/* Section tabs (scrollable) */}
      <div className="scroll-x" style={{ padding: "12px 16px", gap: 6 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? "var(--primary)" : "var(--surface2)",
            border: `1px solid ${tab === t ? "var(--primary)" : "var(--border)"}`,
            borderRadius: "var(--r-full)", padding: "7px 14px",
            color: tab === t ? "#fff" : "var(--text3)", fontWeight: 700, fontSize: "0.78rem",
            cursor: "pointer", whiteSpace: "nowrap", transition: "all var(--t-fast) var(--ease)", flexShrink: 0
          }}>{t}</button>
        ))}
      </div>

      <div style={{ animation: "slideUp 0.3s var(--ease) both" }}>
        {tab === "Coaching" && <CoachingSection />}
        {tab === "App Limits" && <AppLimitsSection />}
        {tab === "Notifications" && <NotificationsSection />}
        {tab === "System" && <SystemSection />}
      </div>
    </div>
  );
}
