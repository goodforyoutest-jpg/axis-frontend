// FILE: src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNotifications } from "../components/useNotifications";

const API = import.meta.env.VITE_BACKEND_URL;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function ProgressRing({ pct = 0, size = 96, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2A2A3F" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.16,1,0.3,1)" }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// SVG Icons
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const CheckCircleIcon = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#6366F1" : "none"} stroke={filled ? "#6366F1" : "#475569"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    {filled && <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" />}
  </svg>
);
const BookOpenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const FlameIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
  </svg>
);
const TrendingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);
const SparkleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);
const GraduationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function Dashboard() {
  const now = useClock();
  const { isSubscribed, subscribe } = useNotifications();
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [checkinDone, setCheckinDone] = useState(null); // null=unknown, true/false
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState(null);
  const [aiType, setAiType] = useState(null); // 'success' | 'danger'
  const [stats, setStats] = useState({ done: 0, streak: 0, overall: 0 });

  const formatTime = (d) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
  const formatDate = (d) => d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

  const todayPct = topics.length > 0 ? Math.round((topics.filter(t => t.completed).length / topics.length) * 100) : 0;

  useEffect(() => {
    fetchTopics();
    fetchCheckinStatus();
  }, []);

  async function fetchTopics() {
    setLoadingTopics(true);
    try {
      const { data } = await axios.get(`${API}/api/study/today`);
      setTopics(data.topics || data || []);
      const done = (data.topics || data || []).filter(t => t.completed).length;
      setStats(s => ({ ...s, done }));
    } catch {
      toast.error("Failed to load today's topics");
    } finally {
      setLoadingTopics(false);
    }
  }

  async function fetchCheckinStatus() {
    try {
      const { data } = await axios.get(`${API}/api/study/checkin-status?date=today`);
      if (data.checkedIn !== undefined) setCheckinDone(data.checkedIn);
      if (data.stats) setStats(s => ({ ...s, streak: data.stats.streak || 0, overall: data.stats.overall || 0 }));
    } catch { /* silent */ }
  }

  async function completeTopic(id) {
    try {
      await axios.put(`${API}/api/study/topics/${id}`, { completed: true });
      setTopics(prev => prev.map(t => t._id === id || t.id === id ? { ...t, completed: true } : t));
      setStats(s => ({ ...s, done: s.done + 1 }));
      toast.success("Topic completed!");
    } catch {
      toast.error("Failed to mark complete");
    }
  }

  async function handleCheckin(done) {
    setCheckinLoading(true);
    try {
      const type = done ? "evening" : "lock";
      await Promise.all([
        axios.post(`${API}/api/notify/ai-notify`, { type }),
        axios.post(`${API}/api/study/checkin`, { done }),
      ]);
      setCheckinDone(done);
      const { data } = await axios.get(`${API}/api/notify/ai-notify/last`).catch(() => ({ data: null }));
      setAiMessage(data?.message || (done ? "Great work today! Keep the momentum going." : "Tomorrow is a fresh start. Stay disciplined!"));
      setAiType(done ? "success" : "danger");
      toast.success("Check-in recorded!");
    } catch {
      toast.error("Check-in failed");
    } finally {
      setCheckinLoading(false);
    }
  }

  const subjectColors = { Law: "#6366F1", Accounts: "#06B6D4", Maths: "#10B981", Economics: "#F59E0B", default: "#8B5CF6" };
  const getSubjectColor = (name = "") => {
    for (const k of Object.keys(subjectColors)) if (name.toLowerCase().includes(k.toLowerCase())) return subjectColors[k];
    return subjectColors.default;
  };

  return (
    <div className="page-content" style={{ padding: "0 0 80px" }}>
      {/* Header */}
      <div style={{ padding: "20px 16px 0", animation: "slideDown 0.4s var(--ease) both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text3)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>
              {getGreeting()}
            </div>
            <h1 style={{ fontSize: "1.6rem", fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--text1)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Gajanan
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--primary-dim)", border: "1px solid var(--border-glow)", borderRadius: "var(--r-full)", padding: "3px 10px" }}>
                <GraduationIcon />
                <span style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: 700 }}>CA Foundation</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "var(--r-full)", padding: "3px 10px" }}>
                <CalendarIcon />
                <span style={{ fontSize: "0.7rem", color: "#F59E0B", fontWeight: 700 }}>May 2027</span>
              </div>
            </div>
          </div>
          <button
            onClick={!isSubscribed ? subscribe : undefined}
            style={{
              background: isSubscribed ? "var(--success-dim)" : "var(--surface2)",
              border: `1px solid ${isSubscribed ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
              borderRadius: "var(--r-md)", padding: "8px", cursor: "pointer",
              color: isSubscribed ? "var(--success)" : "var(--text2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all var(--t-base) var(--ease)"
            }}
            title={isSubscribed ? "Notifications enabled" : "Enable notifications"}
          >
            <BellIcon />
          </button>
        </div>

        {/* Clock */}
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, color: "var(--text3)", fontSize: "0.8rem" }}>
          <ClockIcon />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text2)", fontSize: "0.85rem", letterSpacing: "0.02em" }}>{formatTime(now)}</span>
          <span style={{ color: "var(--text3)" }}>IST &nbsp;·&nbsp; {formatDate(now)}</span>
        </div>
      </div>

      {/* Progress + Stats Row */}
      <div style={{ padding: "16px 16px 0", animation: "slideUp 0.4s var(--ease) 0.06s both", opacity: 0 }}>
        <div className="card-glow" style={{ padding: "16px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <ProgressRing pct={todayPct} size={88} stroke={7} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.15rem", color: "var(--text1)" }}>{todayPct}%</span>
              <span style={{ fontSize: "0.6rem", color: "var(--text3)", fontWeight: 600, marginTop: -2 }}>today</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text3)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Today's Progress</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "Done", value: stats.done, icon: <CheckCircleIcon filled />, color: "#6366F1" },
                { label: "Streak", value: `${stats.streak}d`, icon: <FlameIcon />, color: "#F59E0B" },
                { label: "Overall", value: `${stats.overall}%`, icon: <TrendingIcon />, color: "#10B981" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} style={{ background: "var(--surface2)", borderRadius: "var(--r-md)", padding: "8px", textAlign: "center", border: "1px solid var(--border)" }}>
                  <div style={{ color, marginBottom: 2, display: "flex", justifyContent: "center" }}>{icon}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "var(--text1)" }}>{value}</div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text3)", fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Topics */}
      <div style={{ padding: "16px 16px 0", animation: "slideUp 0.4s var(--ease) 0.12s both", opacity: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <BookOpenIcon />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "var(--text1)" }}>Today's Topics</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text3)", fontWeight: 600 }}>{topics.filter(t => t.completed).length}/{topics.length}</span>
        </div>

        {loadingTopics ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: "var(--r-md)" }} />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="card" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ color: "var(--text3)", fontSize: "0.875rem" }}>No topics scheduled for today.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topics.map((t, i) => {
              const color = getSubjectColor(t.subject || t.name);
              return (
                <div
                  key={t._id || t.id || i}
                  className="card"
                  style={{
                    padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
                    borderLeft: `3px solid ${color}`, opacity: t.completed ? 0.6 : 1,
                    animation: `slideUp 0.35s var(--ease) ${i * 0.05 + 0.15}s both`,
                  }}
                >
                  <button
                    onClick={() => !t.completed && completeTopic(t._id || t.id)}
                    style={{ background: "none", border: "none", cursor: t.completed ? "default" : "pointer", padding: 0, flexShrink: 0 }}
                  >
                    <CheckCircleIcon filled={t.completed} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: t.completed ? "var(--text3)" : "var(--text1)", textDecoration: t.completed ? "line-through" : "none" }} className="truncate">
                      {t.name || t.topic || t.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: "0.7rem", background: `${color}22`, color, borderRadius: "var(--r-full)", padding: "1px 7px", fontWeight: 700 }}>{t.subject}</span>
                      {t.duration && <span style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{t.duration}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily Check-in */}
      <div style={{ padding: "16px 16px 0", animation: "slideUp 0.4s var(--ease) 0.2s both", opacity: 0 }}>
        <div className="card" style={{ padding: 16, border: "1px solid var(--border-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <SparkleIcon />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "var(--text1)" }}>Daily Check-in</span>
            {checkinDone !== null && (
              <span style={{
                marginLeft: "auto", fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px",
                borderRadius: "var(--r-full)",
                background: checkinDone ? "var(--success-dim)" : "var(--danger-dim)",
                color: checkinDone ? "var(--success)" : "var(--danger)"
              }}>
                {checkinDone ? "Done" : "Missed"}
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: 14 }}>
            Did you complete your study session today?
          </p>
          {checkinDone === null ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-success"
                style={{ flex: 1, opacity: checkinLoading ? 0.6 : 1 }}
                disabled={checkinLoading}
                onClick={() => handleCheckin(true)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                Yes, Done!
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1, opacity: checkinLoading ? 0.6 : 1 }}
                disabled={checkinLoading}
                onClick={() => handleCheckin(false)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                Not Done
              </button>
            </div>
          ) : (
            <div style={{ fontSize: "0.8rem", color: "var(--text3)", textAlign: "center", padding: "8px 0" }}>
              Check-in recorded for today.
            </div>
          )}
        </div>
      </div>

      {/* AI Message */}
      {aiMessage && (
        <div style={{ padding: "14px 16px 0", animation: "slideUp 0.4s var(--ease) both" }}>
          <div className="card" style={{
            padding: 16,
            borderLeft: `3px solid ${aiType === "success" ? "var(--success)" : "var(--danger)"}`,
            background: aiType === "success" ? "var(--success-dim)" : "var(--danger-dim)",
            borderColor: aiType === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div className="ai-avatar" style={{ width: 24, height: 24, fontSize: "0.65rem" }}>AI</div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: aiType === "success" ? "var(--success)" : "var(--danger)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                AXIS AI
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text1)", lineHeight: 1.6 }}>{aiMessage}</p>
          </div>
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}
