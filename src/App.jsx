import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Study from "./pages/Study";
import AIChat from "./pages/AIChat";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import { Toaster } from "react-hot-toast";

const NAV = [
  {
    id: "dashboard", label: "Command",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="2" fill={active ? "#4F46E5" : "none"} stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8"/>
        <rect x="13" y="3" width="8" height="8" rx="2" fill={active ? "#4F46E5" : "none"} stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8"/>
        <rect x="3" y="13" width="8" height="8" rx="2" fill="none" stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8"/>
        <rect x="13" y="13" width="8" height="8" rx="2" fill="none" stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8"/>
      </svg>
    )
  },
  {
    id: "study", label: "Study",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 19V6a2 2 0 012-2h12a2 2 0 012 2v13" stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M4 19a2 2 0 002 2h12a2 2 0 002-2" stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8"/>
        <path d="M9 8h6M9 12h6M9 16h4" stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: "ai", label: "AXIS AI",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="3" fill={active ? "#4F46E5" : "#9CA3AF"}/>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: "tasks", label: "Tasks",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 11l3 3L22 4" stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: "settings", label: "Settings",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={active ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.8"/>
      </svg>
    )
  }
];

export default function App() {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "study": return <Study />;
      case "ai": return <AIChat />;
      case "tasks": return <Tasks />;
      case "settings": return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div>
      <Toaster position="top-center" toastOptions={{
        style: { background: "#0E0E1A", color: "#F5F5F5", border: "1px solid #242424", borderRadius: "12px", fontSize: "14px", fontFamily: "DM Sans" },
        success: { iconTheme: { primary: "#10B981", secondary: "#fff" } },
        error: { iconTheme: { primary: "#F43F5E", secondary: "#fff" } }
      }} />
      <div className="animate-in">{renderPage()}</div>
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid #E5E7EB",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 16px", zIndex: 100
      }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
            padding: "4px 12px", borderRadius: "12px",
            transition: "all 0.2s"
          }}>
            {n.icon(page === n.id)}
            <span style={{
              fontSize: "10px", fontWeight: 600,
              color: page === n.id ? "#4F46E5" : "#9CA3AF",
              fontFamily: "DM Sans", letterSpacing: "0.01em"
            }}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
