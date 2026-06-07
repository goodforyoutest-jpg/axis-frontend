// FILE: src/pages/Study.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_BACKEND_URL;

// SVG Icons
const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const RefreshIcon = ({ spinning }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: spinning ? "spin 1s linear infinite" : "none" }}>
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const CheckCircleIcon = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#6366F1" : "none"} stroke={filled ? "#6366F1" : "#475569"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    {filled && <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" />}
  </svg>
);
const BrainIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2" />
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ExternalLinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const SUBJECTS = ["Accounts", "Law", "Maths", "Economics"];
const SUBJECT_COLORS = { Accounts: "#06B6D4", Law: "#6366F1", Maths: "#10B981", Economics: "#F59E0B" };

function GenerateCard({ onGenerated }) {
  const [hours, setHours] = useState(4);
  const [subjects, setSubjects] = useState([...SUBJECTS]);
  const [loading, setLoading] = useState(false);

  const toggleSubject = (s) => setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  async function generate() {
    if (subjects.length === 0) return toast.error("Select at least one subject");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/study/generate`, { hoursPerDay: hours, subjects });
      toast.success("Timetable generated!");
      onGenerated(data);
    } catch {
      toast.error("Failed to generate timetable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-glow" style={{ padding: 18, margin: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <BrainIcon />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.95rem", color: "var(--text1)" }}>AI Timetable Generator</span>
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginBottom: 14 }}>AXIS AI will create an intelligent schedule based on subject weightage and your exam date.</p>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text3)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Hours per day</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5, 6].map(h => (
            <button
              key={h}
              onClick={() => setHours(h)}
              style={{
                background: hours === h ? "var(--primary)" : "var(--surface2)",
                border: `1px solid ${hours === h ? "var(--primary)" : "var(--border)"}`,
                borderRadius: "var(--r-md)", padding: "6px 14px",
                color: hours === h ? "#fff" : "var(--text2)", fontWeight: 700, fontSize: "0.875rem",
                cursor: "pointer", transition: "all var(--t-fast) var(--ease)"
              }}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text3)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Subject focus</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SUBJECTS.map(s => {
            const active = subjects.includes(s);
            const color = SUBJECT_COLORS[s];
            return (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                style={{
                  background: active ? `${color}22` : "var(--surface2)",
                  border: `1px solid ${active ? color : "var(--border)"}`,
                  borderRadius: "var(--r-full)", padding: "5px 12px",
                  color: active ? color : "var(--text3)", fontWeight: 700, fontSize: "0.75rem",
                  cursor: "pointer", transition: "all var(--t-fast) var(--ease)"
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: "100%", opacity: loading ? 0.7 : 1 }} disabled={loading} onClick={generate}>
        {loading ? <><RefreshIcon spinning /> Generating...</> : <><BrainIcon /> Generate Timetable</>}
      </button>
    </div>
  );
}

function TopicsList({ topics, onComplete }) {
  if (!topics || topics.length === 0) return (
    <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text3)", fontSize: "0.875rem" }}>
      No topics found.
    </div>
  );

  return (
    <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      {topics.map((t, i) => {
        const color = SUBJECT_COLORS[t.subject] || "#8B5CF6";
        return (
          <div key={t._id || t.id || i} className="card" style={{
            padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
            borderLeft: `3px solid ${color}`, opacity: t.completed ? 0.55 : 1,
            animation: `slideUp 0.35s var(--ease) ${i * 0.04}s both`
          }}>
            <button onClick={() => !t.completed && onComplete(t._id || t.id)} style={{ background: "none", border: "none", cursor: t.completed ? "default" : "pointer", padding: 0 }}>
              <CheckCircleIcon filled={t.completed} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: t.completed ? "var(--text3)" : "var(--text1)", textDecoration: t.completed ? "line-through" : "none" }} className="truncate">
                {t.name || t.topic || t.title}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.7rem", background: `${color}22`, color, borderRadius: "var(--r-full)", padding: "1px 7px", fontWeight: 700 }}>{t.subject}</span>
                {t.duration && <span style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{t.duration}</span>}
                {t.week && <span style={{ fontSize: "0.7rem", color: "var(--text3)" }}>Wk {t.week}</span>}
                {t.date && <span style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ICAISection() {
  const [sub, setSub] = useState("Syllabus");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const endpoints = { Syllabus: "/api/icai/syllabus", Exams: "/api/icai/exams", Updates: "/api/icai/updates" };

  async function load() {
    setLoading(true);
    setData(null);
    try {
      const { data: d } = await axios.get(`${API}${endpoints[sub]}`);
      setData(d);
    } catch {
      toast.error(`Failed to fetch ICAI ${sub}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [sub]);

  const renderData = (d) => {
    if (!d) return null;
    if (typeof d === "string") return <p style={{ fontSize: "0.875rem", color: "var(--text2)", lineHeight: 1.7 }}>{d}</p>;
    if (Array.isArray(d)) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {d.map((item, i) => (
          <div key={i} className="card" style={{ padding: "12px 14px" }}>
            {typeof item === "string" ? (
              <p style={{ fontSize: "0.875rem", color: "var(--text1)" }}>{item}</p>
            ) : (
              <>
                {item.title && <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text1)", marginBottom: 4 }}>{item.title}</div>}
                {item.description && <p style={{ fontSize: "0.8rem", color: "var(--text2)" }}>{item.description}</p>}
                {item.date && <p style={{ fontSize: "0.75rem", color: "var(--text3)", marginTop: 4 }}>{item.date}</p>}
              </>
            )}
          </div>
        ))}
      </div>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Object.entries(d).map(([k, v]) => (
          <div key={k} className="card" style={{ padding: "10px 14px" }}>
            <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--primary)", marginRight: 8 }}>{k}:</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text2)" }}>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, padding: "0 16px 12px", alignItems: "center" }}>
        {["Syllabus", "Exams", "Updates"].map(s => (
          <button key={s} onClick={() => setSub(s)} style={{
            flex: 1, background: sub === s ? "var(--primary-dim)" : "var(--surface2)",
            border: `1px solid ${sub === s ? "var(--border-glow)" : "var(--border)"}`,
            borderRadius: "var(--r-md)", padding: "7px 4px", fontSize: "0.775rem", fontWeight: 700,
            color: sub === s ? "var(--primary)" : "var(--text3)", cursor: "pointer",
            transition: "all var(--t-fast) var(--ease)"
          }}>{s}</button>
        ))}
        <button onClick={load} disabled={loading} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "7px 10px", cursor: "pointer", color: "var(--text2)" }}>
          <RefreshIcon spinning={loading} />
        </button>
      </div>
      <div style={{ padding: "0 16px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: "var(--r-md)" }} />)}
          </div>
        ) : renderData(data)}
      </div>
    </div>
  );
}

export default function Study() {
  const [tab, setTab] = useState("Today");
  const [topics, setTopics] = useState({ Today: [], Week: [], Full: [] });
  const [loading, setLoading] = useState({});
  const [hasTimetable, setHasTimetable] = useState(false);
  const [overallPct, setOverallPct] = useState(0);

  const tabConfig = { Today: "/api/study/today", Week: "/api/study/week", Full: "/api/study/full" };

  useEffect(() => {
    if (tab !== "ICAI") loadTopics(tab);
  }, [tab]);

  useEffect(() => {
    loadTopics("Today");
  }, []);

  async function loadTopics(t) {
    setLoading(prev => ({ ...prev, [t]: true }));
    try {
      const { data } = await axios.get(`${API}${tabConfig[t]}`);
      const list = data.topics || data || [];
      setTopics(prev => ({ ...prev, [t]: list }));
      if (list.length > 0) setHasTimetable(true);
      if (data.overallPercent !== undefined) setOverallPct(data.overallPercent);
    } catch {
      toast.error(`Failed to load ${t} topics`);
    } finally {
      setLoading(prev => ({ ...prev, [t]: false }));
    }
  }

  async function completeTopic(id) {
    try {
      await axios.put(`${API}/api/study/topics/${id}`, { completed: true });
      setTopics(prev => {
        const updated = {};
        for (const k of Object.keys(prev)) updated[k] = prev[k].map(t => (t._id === id || t.id === id) ? { ...t, completed: true } : t);
        return updated;
      });
      toast.success("Marked complete!");
    } catch {
      toast.error("Failed to update");
    }
  }

  async function regenerate() {
    try {
      await axios.post(`${API}/api/study/generate`, { regenerate: true });
      toast.success("Timetable regenerated!");
      loadTopics(tab !== "ICAI" ? tab : "Today");
    } catch {
      toast.error("Failed to regenerate");
    }
  }

  return (
    <div className="page-content" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BookIcon />
          <span className="page-title">Study Plan</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {hasTimetable && tab !== "ICAI" && (
            <button onClick={regenerate} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "6px 10px", cursor: "pointer", color: "var(--text2)", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <RefreshIcon /> Regenerate
            </button>
          )}
          <div style={{ background: "var(--primary-dim)", border: "1px solid var(--border-glow)", borderRadius: "var(--r-full)", padding: "4px 10px", fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700 }}>
            {overallPct}% overall
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "12px 16px 0", display: "flex", gap: 6 }}>
        {["Today", "Week", "Full", "ICAI"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, background: tab === t ? "var(--primary)" : "var(--surface2)",
            border: `1px solid ${tab === t ? "var(--primary)" : "var(--border)"}`,
            borderRadius: "var(--r-md)", padding: "8px 4px",
            color: tab === t ? "#fff" : "var(--text3)", fontWeight: 700, fontSize: "0.8rem",
            cursor: "pointer", transition: "all var(--t-fast) var(--ease)"
          }}>{t}</button>
        ))}
      </div>

      <div style={{ paddingTop: 14 }}>
        {tab === "ICAI" ? (
          <ICAISection />
        ) : loading[tab] ? (
          <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: "var(--r-md)" }} />)}
          </div>
        ) : !hasTimetable && topics[tab]?.length === 0 ? (
          <GenerateCard onGenerated={() => { setHasTimetable(true); loadTopics(tab); }} />
        ) : (
          <TopicsList topics={topics[tab]} onComplete={completeTopic} />
        )}
      </div>
    </div>
  );
}
