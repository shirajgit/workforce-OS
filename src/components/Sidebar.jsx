// components/Sidebar.jsx
import { Icon, Avatar } from "./UI.jsx";

const NAV = {
  owner: [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "users",     label: "Users",     icon: "users" },
    { id: "tasks",     label: "Tasks",     icon: "tasks" },
    { id: "interviews",label: "Interviews",icon: "phone" },
    { id: "submissions",label:"Submissions",icon:"upload" },
    { id: "salary",    label: "Salary",    icon: "dollar" },
    { id: "chat",      label: "Chat",      icon: "chat" },
  ],
  developer: [
    { id: "tasks", label: "My Tasks", icon: "tasks" },
    { id: "chat",  label: "Chat",     icon: "chat" },
  ],
  caller: [
    { id: "interviews", label: "Interviews", icon: "phone" },
    { id: "chat",       label: "Chat",       icon: "chat" },
  ],
  bidder: [
    { id: "submissions", label: "Submissions", icon: "upload" },
    { id: "chat",        label: "Chat",        icon: "chat" },
  ],
};

export default function Sidebar({ user, active, setActive, logout }) {
  const nav = NAV[user?.role] || NAV.developer;

  return (
    <div className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-icon">WO</div>
        <div>
          <div className="sb-logo-name">Workforce OS</div>
          <div className="sb-logo-sub">Hub Platform</div>
        </div>
      </div>

      <nav className="sb-nav">
        <div className="sb-section-label">Navigation</div>
        {nav.map(item => (
          <button
            key={item.id}
            className={`sb-item ${active === item.id ? "active" : ""}`}
            onClick={() => setActive(item.id)}
          >
            <Icon name={item.icon} size={15} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sb-user">
        <Avatar name={user?.name} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "capitalize", marginTop: 1 }}>
            {user?.role}
          </div>
        </div>
        <button
          onClick={logout}
          className="btn btn-ghost btn-sm btn-icon"
          title="Logout"
          style={{ flexShrink: 0 }}
        >
          <Icon name="logout" size={14} />
        </button>
      </div>
    </div>
  );
}