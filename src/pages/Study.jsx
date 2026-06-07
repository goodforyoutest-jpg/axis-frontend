import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_BACKEND_URL;

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M4 19V6a2 2 0 012-2h12a2 2 0 012 2v13" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M4 19a2 2 0 002 2h12a2 2 0 002-2" stroke="#4F46E5" strokeWidth="1.8"/>
    <path d="M9 8h6M9 12h6M9 16h4" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SUBJECT_COLORS = {
  "Accounting": { bg: "#EEF2FF", color: "#4F46E5", dot: "#4F46E5" },
  "Business Laws": { bg: "#FDF4FF", color: "#9333EA", dot: "#9333EA" },
  "Quantitative Aptitude": { bg: "#FFF7ED", color: "#EA580C", dot: "#EA580C" },
  "Business Economics": { bg: "#F0FDF4", color: "#16A34A", dot: "#16A34A" },
};

export default function Study() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [view, setView] = useState("today");
  const [hours, setHours] = useState(1);

  useEffect(() => { fetchTimetable(); }, []);

  const fetchTimetable = async () => {
    try {
      const res = await axios.get(`${API}/api/study/timetable`);
      setTimetable(res.data.timetable || []);
    } catch (e) {
      toast.error("Could not load timetable");
    } finally {
      setLoading(false);
    }
  };

  const generateTimetable = async () => {
    setGenerating(true);
    try {
      await axios.post(`${API}/api/study/generate`, { hours_per_day: hours });
      toast.success("Timetable generated!");
      fetchTimetable();
    } catch (e) {
      toast.error("Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayTopics = timetable.filter(t => t.date === today);
  const weekTopics = timetable.slice(0, 14);
  const displayTopics = view === "today" ? todayTopics : view === "week" ? weekTopics : timetable;
  const completed = timetable.filter(t => t.completed).length;
  const total = timetable.length;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BookIcon />
        </div>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, fontFamily: "Syne" }}>Study Engine</h2>
          <p style={{ fontSize: "12px", color: "var(--text2)" }}>CA Foundation · 4 Month Plan</p>
        </div>
        {total > 0 && (
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <p style={{ fontSize: "20px", fontWeight: 800, fontFamily: "Syne", color: "var(--indigo)" }}>{Math.round((completed/total)*100)}%</p>
            <p style={{ fontSize: "11px", color: "var(--text2)" }}>overall</p>
          </div>
        )}
      </div>

      {/* Generate Card */}
      {timetable.length === 0 && (
        <div className="card" style={{ marginBottom: "20px", borderTop: "4px solid var(--indigo)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", fontFamily: "Syne" }}>Generate Your Timetable</h3>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "20px" }}>Set your daily study hours to begin</p>

          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hours per day</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "20px", background: "var(--off)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
            <button onClick={() => setHours(h => Math.max(1, h-1))} style={{
              width: "40px", height: "40px", borderRadius: "10px", border: "none",
              background: hours === 1 ? "transparent" : "white",
              boxShadow: hours === 1 ? "none" : "0 1px 3px rgba(0,0,0,0.1)",
              cursor: "pointer", fontSize: "18px", fontWeight: 700, color: "var(--text1)",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
            <span style={{ fontSize: "22px", fontWeight: 800, fontFamily: "Syne", color: "var(--indigo)", minWidth: "60px", textAlign: "center" }}>{hours}h</span>
            <button onClick={() => setHours(h => Math.min(6, h+1))} style={{
              width: "40px", height: "40px", borderRadius: "10px", border: "none",
              background: hours === 6 ? "transparent" : "white",
              boxShadow: hours === 6 ? "none" : "0 1px 3px rgba(0,0,0,0.1)",
              cursor: "pointer", color: "var(--text1)",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
          </div>

          <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
            {[1,2,3,4,5,6].map(h => (
              <button key={h} onClick={() => setHours(h)} style={{
                flex: 1, padding: "8px 0", borderRadius: "8px", border: "1.5px solid",
                borderColor: hours === h ? "var(--indigo)" : "var(--border)",
                background: hours === h ? "#EEF2FF" : "white",
                color: hours === h ? "var(--indigo)" : "var(--text2)",
                fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
              }}>{h}</button>
            ))}
          </div>
          <button className="btn btn-primary" style={{ width: "100%", padding: "14px" }} onClick={generateTimetable} disabled={generating}>
            {generating ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Generating...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Generate 4-Month Plan
              </span>
            )}
          </button>
        </div>
      )}

      {/* View Tabs */}
      {timetable.length > 0 && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", background: "var(--border)", borderRadius: "10px", padding: "4px" }}>
          {["today","week","full"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              flex: 1, padding: "8px", borderRadius: "7px", border: "none",
              background: view === v ? "white" : "transparent",
              boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              color: view === v ? "var(--indigo)" : "var(--text2)",
              fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              fontFamily: "DM Sans"
            }}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
          ))}
        </div>
      )}

      {/* Topics List */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid #EEF2FF", borderTopColor: "#4F46E5", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : displayTopics.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: "var(--text2)", fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>No topics for today</p>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>Try Week or Full view to see upcoming topics</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {displayTopics.map((topic) => {
            const subjectStyle = SUBJECT_COLORS[topic.subject] || { bg: "#F9FAFB", color: "#374151", dot: "#374151" };
            return (
              <div key={topic.id} className="card" style={{ padding: "16px", opacity: topic.completed ? 0.7 : 1 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, marginTop: "1px", border: `2px solid ${topic.completed ? "var(--emerald)" : "var(--border)"}`, background: topic.completed ? "var(--emerald)" : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {topic.completed && <CheckIcon />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: topic.completed ? "var(--text3)" : "var(--text1)", textDecoration: topic.completed ? "line-through" : "none", marginBottom: "6px" }}>
                      {topic.topic}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px", background: subjectStyle.bg, color: subjectStyle.color }}>
                        {topic.subject}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text3)" }}>{topic.duration_minutes} min</span>
                      {view !== "today" && <span style={{ fontSize: "11px", color: "var(--text3)" }}>{topic.date}</span>}
                      <span style={{ fontSize: "11px", color: "var(--text3)" }}>Week {topic.week_number}</span>
                    </div>
                  </div>
                  {topic.completed && <span className="badge badge-emerald">Done</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {timetable.length > 0 && (
        <div className="card" style={{ marginTop: "16px", borderTop: "4px solid var(--indigo)" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, marginBottom: "14px", fontFamily: "Syne" }}>Update Study Hours</p>
          <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
            {[1,2,3,4,5,6].map(h => (
              <button key={h} onClick={() => setHours(h)} style={{
                flex: 1, padding: "8px 0", borderRadius: "8px", border: "1.5px solid",
                borderColor: hours === h ? "var(--indigo)" : "var(--border)",
                background: hours === h ? "#EEF2FF" : "white",
                color: hours === h ? "var(--indigo)" : "var(--text2)",
                fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
              }}>{h}</button>
            ))}
          </div>
          <button className="btn btn-ghost" style={{ width: "100%" }} onClick={generateTimetable} disabled={generating}>
            {generating ? "Regenerating..." : "Regenerate Timetable"}
          </button>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
