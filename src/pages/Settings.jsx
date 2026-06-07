import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_BACKEND_URL;

const PRESET_APPS = [
  { name: "Instagram", minutes: 20 },
  { name: "YouTube", minutes: 30 },
  { name: "Snapchat", minutes: 15 },
  { name: "Chrome", minutes: 45 },
  { name: "Twitter/X", minutes: 20 },
  { name: "WhatsApp", minutes: 30 },
  { name: "BGMI/PUBG", minutes: 0 },
  { name: "Netflix", minutes: 0 },
  { name: "Facebook", minutes: 15 },
];

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function Settings() {
  const [coaching, setCoaching] = useState({ days: ["Mon","Tue","Wed","Thu","Fri","Sat"], start_time: "07:00", end_time: "15:00" });
  const [appForm, setAppForm] = useState({ app_name: "", daily_limit_minutes: 30, is_timepass: true });
  const [appLimits, setAppLimits] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("coaching");

  useEffect(() => { fetchAppLimits(); }, []);

  const fetchAppLimits = async () => {
    try {
      const { data } = await axios.get(`${API}/api/schedule/appsettings`);
      setAppLimits(data.apps || []);
    } catch (e) {}
  };

  const saveCoaching = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/api/study/coaching`, coaching);
      toast.success("Coaching schedule saved");
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveApp = async (name, minutes) => {
    const appName = name || appForm.app_name;
    const appMinutes = minutes !== undefined ? minutes : appForm.daily_limit_minutes;
    if (!appName.trim()) return toast.error("App name required");
    try {
      await axios.post(`${API}/api/schedule/appsettings`, { app_name: appName, daily_limit_minutes: appMinutes, is_timepass: true });
      toast.success(`${appName} limit saved`);
      if (!name) setAppForm({ app_name: "", daily_limit_minutes: 30, is_timepass: true });
      fetchAppLimits();
    } catch (e) {
      toast.error("Failed");
    }
  };

  const toggleDay = (day) => {
    setCoaching(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
  };

  const savedAppNames = appLimits.map(a => a.app_name);

  const SECTIONS = [
    { id: "coaching", label: "Coaching" },
    { id: "apps", label: "App Limits" },
    { id: "system", label: "System" },
  ];

  return (
    <div className="page">
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, fontFamily: "Syne" }}>Settings</h2>
        <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "2px" }}>Update everything anytime</p>
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "20px", background: "var(--border)", borderRadius: "10px", padding: "4px" }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            flex: 1, padding: "8px", borderRadius: "7px", border: "none",
            background: activeSection === s.id ? "white" : "transparent",
            boxShadow: activeSection === s.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            color: activeSection === s.id ? "var(--indigo)" : "var(--text2)",
            fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "DM Sans"
          }}>{s.label}</button>
        ))}
      </div>

      {activeSection === "coaching" && (
        <div className="card" style={{ borderTop: "4px solid var(--indigo)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px", fontFamily: "Syne" }}>Coaching Schedule</h3>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "20px" }}>Set your coaching days and timing</p>

          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Coaching Days</p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
            {DAYS.map(day => (
              <button key={day} onClick={() => toggleDay(day)} style={{
                padding: "8px 14px", borderRadius: "8px", border: "1.5px solid",
                borderColor: coaching.days.includes(day) ? "var(--indigo)" : "var(--border)",
                background: coaching.days.includes(day) ? "#EEF2FF" : "white",
                color: coaching.days.includes(day) ? "var(--indigo)" : "var(--text2)",
                fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "DM Sans"
              }}>{day}</button>
            ))}
          </div>

          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Timing</p>
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "6px" }}>Start</p>
              <input type="time" value={coaching.start_time} onChange={e => setCoaching({...coaching, start_time: e.target.value})} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "6px" }}>End</p>
              <input type="time" value={coaching.end_time} onChange={e => setCoaching({...coaching, end_time: e.target.value})} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", padding: "14px" }} onClick={saveCoaching} disabled={saving}>
            {saving ? "Saving..." : "Save Coaching Schedule"}
          </button>
        </div>
      )}

      {activeSection === "apps" && (
        <div>
          <div className="card" style={{ marginBottom: "16px", borderTop: "4px solid var(--rose)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px", fontFamily: "Syne" }}>Quick Add</h3>
            <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "16px" }}>Tap to add preset app limits</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {PRESET_APPS.map(app => {
                const saved = savedAppNames.includes(app.name);
                return (
                  <div key={app.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "10px", background: saved ? "#F0FDF4" : "var(--off)", border: `1px solid ${saved ? "#A7F3D0" : "var(--border)"}` }}>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: saved ? "#065F46" : "var(--text1)" }}>{app.name}</p>
                      <p style={{ fontSize: "12px", color: saved ? "#6EE7B7" : "var(--text3)" }}>{app.minutes === 0 ? "Block completely" : `${app.minutes} min/day`}</p>
                    </div>
                    {saved ? (
                      <span className="badge badge-emerald">Added</span>
                    ) : (
                      <button className="btn btn-primary" style={{ padding: "7px 14px", fontSize: "12px" }} onClick={() => saveApp(app.name, app.minutes)}>
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ borderTop: "4px solid var(--violet)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px", fontFamily: "Syne" }}>Custom App</h3>
            <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "16px" }}>Add any other app manually</p>
            <input placeholder="App name" value={appForm.app_name} onChange={e => setAppForm({...appForm, app_name: e.target.value})} style={{ marginBottom: "12px" }} />
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Daily Limit</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "16px", background: "var(--off)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
              <button onClick={() => setAppForm(f => ({...f, daily_limit_minutes: Math.max(0, f.daily_limit_minutes - 5)}))} style={{ width: "40px", height: "40px", borderRadius: "10px", border: "none", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </button>
              <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "Syne", color: "var(--rose)", minWidth: "80px", textAlign: "center" }}>
                {appForm.daily_limit_minutes === 0 ? "Block" : `${appForm.daily_limit_minutes}m`}
              </span>
              <button onClick={() => setAppForm(f => ({...f, daily_limit_minutes: Math.min(180, f.daily_limit_minutes + 5)}))} style={{ width: "40px", height: "40px", borderRadius: "10px", border: "none", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <button className="btn btn-danger" style={{ width: "100%", padding: "14px" }} onClick={() => saveApp()}>Add App Limit</button>
          </div>
        </div>
      )}

      {activeSection === "system" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="card" style={{ borderTop: "4px solid var(--emerald)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", fontFamily: "Syne" }}>System Status</h3>
            {[
              { label: "Backend", value: "axis-backend-n5gc.onrender.com", status: true },
              { label: "AI Model", value: "llama-3.3-70b-versatile", status: true },
              { label: "Database", value: "Supabase — Connected", status: true },
              { label: "Exam", value: "CA Foundation · May 2027", status: true },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text1)" }}>{item.label}</p>
                  <p style={{ fontSize: "12px", color: "var(--text2)", marginTop: "2px" }}>{item.value}</p>
                </div>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--emerald)" }} />
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", fontFamily: "Syne" }}>About AXIS</h3>
            <p style={{ fontSize: "13px", color: "var(--text2)", lineHeight: "1.7" }}>
              AXIS is your personal command center built for CA Foundation preparation. It combines AI-powered study planning, strict accountability, and app control — all in one place.
            </p>
            <div className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "var(--text3)" }}>Version</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text1)" }}>1.0.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
