import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_BACKEND_URL;

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PRIORITY_CONFIG = {
  high:   { label: "High Priority",   bg: "#FFF1F2", color: "#F43F5E", bar: "#F43F5E" },
  medium: { label: "Medium Priority", bg: "#FFFBEB", color: "#F59E0B", bar: "#F59E0B" },
  low:    { label: "Low Priority",    bg: "#F0FDF4", color: "#10B981", bar: "#10B981" },
};

const TYPE_CONFIG = {
  general:  { label: "General",  bg: "#F9FAFB", color: "#6B7280" },
  study:    { label: "Study",    bg: "#EEF2FF", color: "#4F46E5" },
  email:    { label: "Email",    bg: "#FDF4FF", color: "#9333EA" },
  personal: { label: "Personal", bg: "#FFF7ED", color: "#EA580C" },
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", description: "", type: "general", priority: "medium", due_date: "" });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get(`${API}/api/study/tasks`);
      setTasks(data.tasks || []);
    } catch (e) {
      toast.error("Could not load tasks");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    try {
      await axios.post(`${API}/api/study/tasks`, form);
      toast.success("Task added");
      setForm({ title: "", description: "", type: "general", priority: "medium", due_date: "" });
      setAdding(false);
      fetchTasks();
    } catch (e) {
      toast.error("Failed to add task");
    }
  };

  const completeTask = async (id) => {
    try {
      await axios.post(`${API}/api/study/tasks/${id}/complete`);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
      toast.success("Task completed");
    } catch (e) {
      toast.error("Failed");
    }
  };

  const filtered = filter === "all" ? tasks : filter === "pending" ? tasks.filter(t => !t.completed) : tasks.filter(t => t.completed);
  const pending = tasks.filter(t => !t.completed).length;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, fontFamily: "Syne" }}>Tasks</h2>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "2px" }}>
            {pending > 0 ? `${pending} pending · ${tasks.length - pending} done` : "All caught up"}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(!adding)} style={{ padding: "10px 16px", fontSize: "13px" }}>
          {adding ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          ) : <PlusIcon />}
          {adding ? "Cancel" : "Add Task"}
        </button>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="card" style={{ marginBottom: "16px", borderTop: "4px solid var(--indigo)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", fontFamily: "Syne" }}>New Task</h3>
          <input placeholder="Task title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ marginBottom: "10px" }} />
          <input placeholder="Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ marginBottom: "14px" }} />

          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</p>
          <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
            {Object.entries(TYPE_CONFIG).map(([key, val]) => (
              <button key={key} onClick={() => setForm({...form, type: key})} style={{
                padding: "7px 14px", borderRadius: "8px", border: "1.5px solid",
                borderColor: form.type === key ? val.color : "var(--border)",
                background: form.type === key ? val.bg : "white",
                color: form.type === key ? val.color : "var(--text2)",
                fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "DM Sans"
              }}>{val.label}</button>
            ))}
          </div>

          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Priority</p>
          <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
            {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
              <button key={key} onClick={() => setForm({...form, priority: key})} style={{
                flex: 1, padding: "8px", borderRadius: "8px", border: "1.5px solid",
                borderColor: form.priority === key ? val.color : "var(--border)",
                background: form.priority === key ? val.bg : "white",
                color: form.priority === key ? val.color : "var(--text2)",
                fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "DM Sans"
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: form.priority === key ? val.bar : "var(--border)", margin: "0 auto 4px" }} />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Due Date</p>
          <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} style={{ marginBottom: "16px" }} />
          <button className="btn btn-primary" style={{ width: "100%", padding: "14px" }} onClick={addTask}>Add Task</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", background: "var(--border)", borderRadius: "10px", padding: "4px" }}>
        {["all","pending","done"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flex: 1, padding: "8px", borderRadius: "7px", border: "none",
            background: filter === f ? "white" : "transparent",
            boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            color: filter === f ? "var(--indigo)" : "var(--text2)",
            fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "DM Sans"
          }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid #EEF2FF", borderTopColor: "#4F46E5", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: "var(--text2)", fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>No tasks here</p>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            {filter === "pending" ? "All tasks completed!" : filter === "done" ? "No completed tasks yet" : "Add your first task above"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map(task => {
            const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
            const t = TYPE_CONFIG[task.type] || TYPE_CONFIG.general;
            return (
              <div key={task.id} className="card" style={{ padding: "16px", opacity: task.completed ? 0.65 : 1, borderLeft: `4px solid ${p.bar}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <button onClick={() => !task.completed && completeTask(task.id)} style={{
                    width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, marginTop: "1px",
                    border: `2px solid ${task.completed ? "var(--emerald)" : p.bar}`,
                    background: task.completed ? "var(--emerald)" : "white",
                    cursor: task.completed ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                  }}>
                    {task.completed && <CheckIcon />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: task.completed ? "var(--text3)" : "var(--text1)", textDecoration: task.completed ? "line-through" : "none", marginBottom: "6px" }}>
                      {task.title}
                    </p>
                    {task.description && <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "6px" }}>{task.description}</p>}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px", background: t.bg, color: t.color }}>{t.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px", background: p.bg, color: p.color }}>{p.label}</span>
                      {task.due_date && <span style={{ fontSize: "11px", color: "var(--text3)" }}>Due {task.due_date}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
