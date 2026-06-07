// FILE: src/pages/Tasks.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_BACKEND_URL;

// SVG Icons
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const CheckCircleIcon = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#10B981" : "none"} stroke={filled ? "#10B981" : "#475569"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    {filled && <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" />}
  </svg>
);
const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const TagIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const ChevronDown = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PRIORITY_COLORS = { High: "#EF4444", Medium: "#F59E0B", Low: "#10B981" };
const TYPE_COLORS = { General: "#6366F1", Study: "#06B6D4", Email: "#8B5CF6", Personal: "#F59E0B" };

function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("General");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!title.trim()) return toast.error("Title is required");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/study/tasks`, { title, description, type, priority, dueDate });
      toast.success("Task added!");
      onAdd(data.task || data);
      setTitle(""); setDescription(""); setType("General"); setPriority("Medium"); setDueDate("");
    } catch {
      toast.error("Failed to add task");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
    borderRadius: "var(--r-md)", padding: "9px 12px", fontSize: "0.875rem",
    color: "var(--text1)", outline: "none", fontFamily: "var(--font-body)",
    transition: "border-color var(--t-fast) var(--ease)"
  };

  return (
    <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 10, animation: "slideDown 0.3s var(--ease) both" }}>
      <div className="card" style={{ padding: 16 }}>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Task title..." style={inputStyle}
          onFocus={e => e.target.style.borderColor = "var(--primary)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        <textarea
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Description (optional)..."
          rows={2}
          style={{ ...inputStyle, marginTop: 8, resize: "none" }}
          onFocus={e => e.target.style.borderColor = "var(--primary)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Type</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["General", "Study", "Email", "Personal"].map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                background: type === t ? `${TYPE_COLORS[t]}22` : "var(--surface2)",
                border: `1px solid ${type === t ? TYPE_COLORS[t] : "var(--border)"}`,
                borderRadius: "var(--r-full)", padding: "4px 12px",
                color: type === t ? TYPE_COLORS[t] : "var(--text3)", fontWeight: 700, fontSize: "0.75rem",
                cursor: "pointer", transition: "all var(--t-fast) var(--ease)"
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Priority</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["High", "Medium", "Low"].map(p => (
              <button key={p} onClick={() => setPriority(p)} style={{
                flex: 1, background: priority === p ? `${PRIORITY_COLORS[p]}22` : "var(--surface2)",
                border: `1px solid ${priority === p ? PRIORITY_COLORS[p] : "var(--border)"}`,
                borderRadius: "var(--r-md)", padding: "6px 4px",
                color: priority === p ? PRIORITY_COLORS[p] : "var(--text3)", fontWeight: 700, fontSize: "0.8rem",
                cursor: "pointer", transition: "all var(--t-fast) var(--ease)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: PRIORITY_COLORS[p], display: "inline-block" }} />
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Due date</div>
          <input
            type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            style={{ ...inputStyle, colorScheme: "dark" }}
          />
        </div>

        <button className="btn btn-primary" style={{ width: "100%", marginTop: 12, opacity: loading ? 0.7 : 1 }} disabled={loading} onClick={submit}>
          <PlusIcon /> {loading ? "Adding..." : "Add Task"}
        </button>
      </div>
    </div>
  );
}

function TaskCard({ task, onComplete, onDelete }) {
  const borderColor = PRIORITY_COLORS[task.priority] || "#6366F1";
  const typeColor = TYPE_COLORS[task.type] || "#6366F1";
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="card" style={{
      padding: "12px 14px", borderLeft: `3px solid ${borderColor}`,
      opacity: task.completed ? 0.55 : 1,
      animation: "slideUp 0.35s var(--ease) both"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
        <button onClick={() => !task.completed && onComplete(task._id || task.id)} style={{ background: "none", border: "none", cursor: task.completed ? "default" : "pointer", padding: 0, flexShrink: 0, paddingTop: 1 }}>
          <CheckCircleIcon filled={task.completed} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: task.completed ? "var(--text3)" : "var(--text1)", textDecoration: task.completed ? "line-through" : "none" }} className="truncate">
            {task.title}
          </div>
          {task.description && (
            <div style={{ fontSize: "0.8rem", color: "var(--text2)", marginTop: 2, lineHeight: 1.5 }} className="line-clamp-2">{task.description}</div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.7rem", background: `${typeColor}22`, color: typeColor, borderRadius: "var(--r-full)", padding: "1px 7px", fontWeight: 700 }}>
              <TagIcon /> {task.type}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.7rem", background: `${borderColor}18`, color: borderColor, borderRadius: "var(--r-full)", padding: "1px 7px", fontWeight: 700 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: borderColor, display: "inline-block" }} />
              {task.priority}
            </span>
            {task.dueDate && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.7rem", color: "var(--text3)" }}>
                <CalendarIcon />
                {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          {!confirming ? (
            <button onClick={() => setConfirming(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: 4, borderRadius: "var(--r-sm)", transition: "color var(--t-fast)" }}
              onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}
            >
              <TrashIcon />
            </button>
          ) : (
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => onDelete(task._id || task.id)} style={{ background: "var(--danger-dim)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--r-sm)", padding: "3px 8px", fontSize: "0.7rem", color: "var(--danger)", fontWeight: 700, cursor: "pointer" }}>Del</button>
              <button onClick={() => setConfirming(false)} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "3px 8px", fontSize: "0.7rem", color: "var(--text3)", fontWeight: 700, cursor: "pointer" }}>No</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchTasks();
    intervalRef.current = setInterval(fetchTasks, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  async function fetchTasks() {
    try {
      const { data } = await axios.get(`${API}/api/study/tasks`);
      setTasks(data.tasks || data || []);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function completeTask(id) {
    try {
      await axios.put(`${API}/api/study/tasks/${id}`, { completed: true });
      setTasks(prev => prev.map(t => (t._id === id || t.id === id) ? { ...t, completed: true } : t));
      toast.success("Task completed!");
    } catch {
      toast.error("Failed to complete task");
    }
  }

  async function deleteTask(id) {
    try {
      await axios.delete(`${API}/api/study/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id && t.id !== id));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  }

  function addTask(task) {
    setTasks(prev => [task, ...prev]);
    setShowForm(false);
  }

  const filtered = tasks.filter(t => {
    if (filter === "Pending") return !t.completed;
    if (filter === "Done") return t.completed;
    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="page-content" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ClipboardIcon />
          <span className="page-title">Tasks</span>
          {pendingCount > 0 && (
            <span style={{ background: "var(--danger)", color: "#fff", borderRadius: "var(--r-full)", padding: "1px 7px", fontSize: "0.7rem", fontWeight: 700 }}>{pendingCount}</span>
          )}
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{
            background: showForm ? "var(--surface2)" : "var(--grad-primary)",
            border: `1px solid ${showForm ? "var(--border)" : "transparent"}`,
            borderRadius: "var(--r-md)", padding: "7px 12px",
            color: showForm ? "var(--text2)" : "#fff", fontWeight: 700, fontSize: "0.8rem",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            transition: "all var(--t-base) var(--ease)"
          }}
        >
          <PlusIcon /> {showForm ? "Cancel" : "Add Task"}
        </button>
      </div>

      {/* Add form */}
      {showForm && <AddTaskForm onAdd={addTask} />}

      {/* Filter tabs */}
      <div style={{ padding: "12px 16px", display: "flex", gap: 6 }}>
        {["All", "Pending", "Done"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flex: 1, background: filter === f ? "var(--primary)" : "var(--surface2)",
            border: `1px solid ${filter === f ? "var(--primary)" : "var(--border)"}`,
            borderRadius: "var(--r-md)", padding: "8px 4px",
            color: filter === f ? "#fff" : "var(--text3)", fontWeight: 700, fontSize: "0.8rem",
            cursor: "pointer", transition: "all var(--t-fast) var(--ease)"
          }}>{f}</button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--r-md)" }} />)
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)" }}>
            <ClipboardIcon />
            <p style={{ marginTop: 12, fontSize: "0.875rem", color: "var(--text3)" }}>
              {filter === "Done" ? "No completed tasks yet." : filter === "Pending" ? "No pending tasks. You're on top!" : "No tasks yet. Add one above!"}
            </p>
          </div>
        ) : (
          filtered.map(task => (
            <TaskCard key={task._id || task.id} task={task} onComplete={completeTask} onDelete={deleteTask} />
          ))
        )}
      </div>
    </div>
  );
}
