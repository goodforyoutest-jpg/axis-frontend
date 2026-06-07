import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import useNotifications from "../components/useNotifications";

const API = import.meta.env.VITE_BACKEND_URL;

const IconTarget = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#4F46E5" strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="5" stroke="#4F46E5" strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="1.5" fill="#4F46E5"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Dashboard() {
  const [topics, setTopics] = useState([]);
  const [checkin, setCheckin] = useState(null);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState("");
  const [aiType, setAiType] = useState("neutral");
  const { permission, subscribed, subscribe } = useNotifications();

  useEffect(() => {
    fetchToday();
    checkTodayCheckin();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchToday = async () => {
    try {
      const res = await axios.get(`${API}/api/study/today`);
      setTopics(res.data.topics || []);
    } catch (e) {
      toast.error("Could not load topics");
    } finally {
      setLoading(false);
    }
  };

  const checkTodayCheckin = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await axios.get(`${API}/api/study/checkin-status?date=${today}`);
      if (data.checkin) setCheckin(data.checkin.completed);
    } catch (e) {}
  };

  const handleCheckin = async (done) => {
    try {
      const res = await axios.post(`${API}/api/study/checkin`, { completed: done });
      setCheckin(done);
      setAiType(done ? "success" : "danger");
      setAiMessage(done
        ? "Outstanding discipline, Gaju! Every topic completed is one step closer to clearing CA Foundation. Keep this momentum tomorrow."
        : "Unacceptable, Gajanan. Your timepass apps are locked for today. No negotiations. Use this time to at least review your notes."
      );
      if (!done) {
        await axios.post(`${API}/api/notify/ai-notify`, { type: 'lock' });
      }
      toast.success(res.data.message);
    } catch (e) {
      toast.error("Check-in failed");
    }
  };

  const completeTopic = async (id) => {
    try {
      await axios.post(`${API}/api/study/complete/${id}`);
      setTopics(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
      toast.success("Topic completed");
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleEnableNotifications = async () => {
    const success = await subscribe();
    if (success) toast.success("Notifications enabled!");
    else toast.error("Could not enable notifications");
  };

  const done = topics.filter(t => t.completed).length;
  const total = topics.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const hour = time.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const circumference = 2 * Math.PI * 26;
  const strokeDash = circumference - (progress / 100) * circumference;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "4px", fontWeight: 500 }}>{greeting}</p>
          <h1 style={{ fontSize: "30px", fontWeight: 800, color: "var(--text1)", lineHeight: 1.1, fontFamily: "Syne" }}>Gajanan</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
            <span className="badge badge-indigo">CA Foundation</span>
            <span className="badge" style={{ background: "#F0FDF4", color: "#16A34A" }}>May 2027</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text1)", fontFamily: "Syne" }}>
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text2)", marginTop: "2px" }}>
              {time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
          {!subscribed && (
            <button onClick={handleEnableNotifications} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 12px", borderRadius: "8px", border: "1.5px solid var(--border)",
              background: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer",
              color: permission === 'granted' ? "var(--emerald)" : "var(--indigo)"
            }}>
              <IconBell />
              {permission === 'granted' ? 'Activating...' : 'Enable Alerts'}
            </button>
          )}
          {subscribed && (
            <span className="badge badge-emerald" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <IconBell /> Alerts On
            </span>
          )}
        </div>
      </div>

      {/* Progress Ring */}
      <div className="card-deep" style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "20px" }}>
        <svg width="72" height="72" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#1A1A2E" strokeWidth="5"/>
          <circle cx="30" cy="30" r="26" fill="none" stroke={progress === 100 ? "#10B981" : "#4F46E5"}
            strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDash}
            transform="rotate(-90 30 30)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
          <text x="30" y="35" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="Syne">{progress}%</text>
        </svg>
        <div>
          <p style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: 500, marginBottom: "4px" }}>TODAY'S TARGET</p>
          <p style={{ color: "white", fontSize: "22px", fontWeight: 800, fontFamily: "Syne" }}>{done}<span style={{ color: "#525252", fontSize: "16px" }}>/{total}</span></p>
          <p style={{ color: "#6B7280", fontSize: "12px", marginTop: "2px" }}>topics completed</p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1A1A2E", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconTarget />
          </div>
        </div>
      </div>

      {/* AI Message */}
      {aiMessage && (
        <div className="card" style={{ marginBottom: "16px", borderLeft: `4px solid ${aiType === "success" ? "var(--emerald)" : "var(--rose)"}`, background: aiType === "success" ? "#F0FDF4" : "#FFF1F2" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ color: aiType === "success" ? "var(--emerald)" : "var(--rose)", marginTop: "1px" }}>
              {aiType === "success" ? <IconStar /> : <IconLock />}
            </span>
            <p style={{ fontSize: "13px", color: aiType === "success" ? "#166534" : "#9F1239", lineHeight: "1.6", fontWeight: 500 }}>{aiMessage}</p>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text2)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Today's Topics</h3>
          <span className="badge badge-indigo">{total} scheduled</span>
        </div>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ width: "28px", height: "28px", border: "3px solid #EEF2FF", borderTopColor: "#4F46E5", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : topics.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <p style={{ color: "var(--text2)", fontSize: "14px", marginBottom: "4px" }}>No topics scheduled yet</p>
            <p style={{ color: "var(--text3)", fontSize: "12px" }}>Go to Study tab to generate your timetable</p>
          </div>
        ) : topics.map((topic, i) => (
          <div key={topic.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: i < topics.length - 1 ? "1px solid var(--border)" : "none" }}>
            <button onClick={() => !topic.completed && completeTopic(topic.id)} style={{
              width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${topic.completed ? "var(--emerald)" : "var(--border)"}`,
              background: topic.completed ? "var(--emerald)" : "white",
              cursor: topic.completed ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", transition: "all 0.2s"
            }}>
              {topic.completed && <IconCheck />}
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "14px", fontWeight: 500, color: topic.completed ? "var(--text3)" : "var(--text1)", textDecoration: topic.completed ? "line-through" : "none" }}>
                {topic.topic}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>{topic.subject} · {topic.duration_minutes} min</p>
            </div>
            {topic.completed && <span className="badge badge-emerald">Done</span>}
          </div>
        ))}
      </div>

      {checkin === null && (
        <div className="card" style={{ borderTop: "4px solid var(--indigo)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconTarget />
            </div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}>Daily Check-in</p>
              <p style={{ fontSize: "12px", color: "var(--text2)" }}>Did you complete today's study target?</p>
            </div>
          </div>
          <div className="divider" />
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-success" style={{ flex: 1 }} onClick={() => handleCheckin(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Yes, Done
            </button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleCheckin(false)}>
              <IconLock />
              Not Done
            </button>
          </div>
        </div>
      )}

      {checkin !== null && (
        <div className="card" style={{ borderTop: `4px solid ${checkin ? "var(--emerald)" : "var(--rose)"}`, background: checkin ? "#F0FDF4" : "#FFF1F2" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: checkin ? "#DCFCE7" : "#FFE4E6", display: "flex", alignItems: "center", justifyContent: "center", color: checkin ? "var(--emerald)" : "var(--rose)" }}>
              {checkin ? <IconStar /> : <IconLock />}
            </div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: checkin ? "#166534" : "#9F1239" }}>
              {checkin ? "Checked in — Great work today, Gaju!" : "Checked in — Apps locked for today"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
