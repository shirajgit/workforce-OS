// components/Sidebar.jsx
import { useState, useEffect } from "react";
import { Icon, Avatar } from "./UI.jsx";

const NAV = {
  owner: [
    { id: "dashboard",   label: "Dashboard",   icon: "dashboard" },
    { id: "users",       label: "Users",        icon: "users" },
    { id: "tasks",       label: "Tasks",        icon: "tasks" },
    { id: "interviews",  label: "Interviews",   icon: "phone" },
    { id: "submissions", label: "Submissions",  icon: "upload" },
    { id: "salary",      label: "Salary",       icon: "dollar" },
    { id: "chat",        label: "Chat",         icon: "chat" },
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
  const [open, setOpen] = useState(false);

  const handleNav = (id) => {
    setActive(id);
    setOpen(false);
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <style>{`
        .sb-toggle {
          display: none;
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 1000;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--border, rgba(255,255,255,.1));
          background: var(--surface, #1a1a2e);
          color: var(--text1, #fff);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: opacity .2s;
        }
        .sb-toggle:active { opacity: .7; }

        .sb-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 199;
          background: rgba(0,0,0,0);
          transition: background .25s;
          pointer-events: none;
        }
        .sb-backdrop.on {
          background: rgba(0,0,0,.45);
          pointer-events: all;
        }

        .sidebar {
          width: 220px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--sidebar-bg, var(--surface, #1a1a2e));
          border-right: 1px solid var(--border, rgba(255,255,255,.07));
          box-sizing: border-box;
          transition: transform .28s cubic-bezier(.4,0,.2,1);
        }

        /* Logo */
        .sb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 16px 16px;
          border-bottom: 1px solid var(--border, rgba(255,255,255,.07));
        }
        .sb-logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--accent, #6c63ff);
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sb-logo-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text1, #fff);
          letter-spacing: .1px;
        }
        .sb-logo-sub {
          font-size: 11px;
          color: var(--text3, rgba(255,255,255,.35));
          margin-top: 2px;
        }

        /* Nav */
        .sb-nav {
          flex: 1;
          padding: 12px 8px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .sb-nav::-webkit-scrollbar { display: none; }

        .sb-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text3, rgba(255,255,255,.3));
          padding: 0 8px;
          margin-bottom: 6px;
        }

        .sb-item {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--text2, rgba(255,255,255,.55));
          font-size: 13px;
          font-weight: 400;
          cursor: pointer;
          text-align: left;
          transition: background .15s, color .15s;
          margin-bottom: 1px;
        }
        .sb-item:hover {
          background: var(--hover, rgba(255,255,255,.06));
          color: var(--text1, #fff);
        }
        .sb-item.active {
          background: color-mix(in srgb, var(--accent, #6c63ff) 16%, transparent);
          color: var(--accent, #6c63ff);
          font-weight: 500;
        }

        /* User footer */
        .sb-user {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 14px;
          border-top: 1px solid var(--border, rgba(255,255,255,.07));
        }

        /* Mobile */
        @media (max-width: 768px) {
          .sb-toggle  { display: flex; }
          .sb-backdrop { display: block; }
          .sidebar {
            position: fixed;
            inset: 0 auto 0 0;
            z-index: 200;
            transform: translateX(-100%);
            box-shadow: 8px 0 32px rgba(0,0,0,.4);
          }
          .sidebar.open { transform: translateX(0); }
        }
      `}</style>

      {/* Hamburger */}
      <button
        className="sb-toggle"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <Icon name={open ? "x" : "menu"} size={18} />
      </button>

      {/* Backdrop */}
      <div
        className={`sb-backdrop ${open ? "on" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div className={`sidebar ${open ? "open" : ""}`} role="navigation" aria-label="Main navigation">
        <div className="sb-logo">
          <div className="sb-logo-icon">WO</div>
          <div>
            <div className="sb-logo-name">Workforce OS</div>
            <div className="sb-logo-sub">Hub Platform</div>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section-label">Menu</div>
          {nav.map(item => (
            <button
              key={item.id}
              className={`sb-item ${active === item.id ? "active" : ""}`}
              onClick={() => handleNav(item.id)}
            >
              <Icon name={item.icon} size={15} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sb-user">
          <Avatar name={user?.name} size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text1)" }}>
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
    </>
  );
}