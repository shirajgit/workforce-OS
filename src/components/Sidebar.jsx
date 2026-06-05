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
:root{
  --sidebar-bg:#0f172a;
  --sidebar-card:rgba(255,255,255,.04);
  --border:rgba(255,255,255,.08);

  --text1:#ffffff;
  --text2:#cbd5e1;
  --text3:#64748b;

  --accent:#6c63ff;
  --accent2:#8b5cf6;
}

/* TOGGLE */

.sb-toggle{
  display:none;
  position:fixed;
  top:16px;
  left:16px;
  z-index:1000;

  width:42px;
  height:42px;

  border:none;
  border-radius:12px;

  cursor:pointer;

  background:
  linear-gradient(
    135deg,
    var(--accent),
    var(--accent2)
  );

  color:white;

  box-shadow:
  0 10px 30px rgba(108,99,255,.35);

  transition:.3s;
}

.sb-toggle:hover{
  transform:scale(1.08);
}

/* BACKDROP */

.sb-backdrop{
  display:none;
  position:fixed;
  inset:0;
  z-index:199;

  background:rgba(0,0,0,0);

  transition:.25s;

  pointer-events:none;
}

.sb-backdrop.on{
  background:rgba(0,0,0,.6);
  backdrop-filter:blur(4px);

  pointer-events:auto;
}

/* SIDEBAR */

.sidebar{
  width:280px;
  height:100vh;

  display:flex;
  flex-direction:column;

  position:relative;

  background:
  linear-gradient(
    180deg,
    rgba(15,23,42,.98),
    rgba(2,6,23,.98)
  );

  border-right:1px solid var(--border);

  overflow:hidden;

  transition:.35s ease;
}

/* Glow */

.sidebar::before{
  content:"";

  position:absolute;

  width:300px;
  height:300px;

  top:-120px;
  right:-120px;

  background:
  radial-gradient(
    circle,
    rgba(108,99,255,.25),
    transparent 70%
  );

  pointer-events:none;
}

/* LOGO */

.sb-logo{
  padding:24px 20px;

  display:flex;
  align-items:center;
  gap:14px;

  border-bottom:1px solid var(--border);
}

.sb-logo-icon{
  width:50px;
  height:50px;

  border-radius:16px;

  background:
  linear-gradient(
    135deg,
    var(--accent),
    var(--accent2)
  );

  display:flex;
  align-items:center;
  justify-content:center;

  font-weight:800;
  font-size:16px;

  color:white;

  box-shadow:
  0 12px 30px rgba(108,99,255,.35);
}

.sb-logo-name{
  font-size:18px;
  font-weight:800;
  color:white;
}

.sb-logo-sub{
  margin-top:4px;

  font-size:12px;
  color:var(--text3);
}

/* NAV */

.sb-nav{
  flex:1;
  overflow:auto;

  padding:18px 12px;
}

.sb-nav::-webkit-scrollbar{
  width:0;
}

.sb-section-label{
  color:var(--text3);

  font-size:11px;
  font-weight:700;

  text-transform:uppercase;
  letter-spacing:1px;

  margin-bottom:10px;
  padding-left:10px;
}

/* MENU ITEM */

.sb-item{
  width:100%;

  display:flex;
  align-items:center;
  gap:14px;

  padding:14px 16px;

  border:none;
  border-radius:14px;

  background:transparent;

  color:var(--text2);

  font-size:14px;
  font-weight:600;

  cursor:pointer;

  transition:.25s;

  margin-bottom:6px;
}

.sb-item:hover{
  background:
  rgba(255,255,255,.06);

  color:white;

  transform:translateX(4px);
}

/* ACTIVE */

.sb-item.active{
  background:
  linear-gradient(
    135deg,
    rgba(108,99,255,.22),
    rgba(139,92,246,.18)
  );

  color:white;

  box-shadow:
  inset 0 0 0 1px rgba(108,99,255,.4),
  0 10px 25px rgba(108,99,255,.18);
}

.sb-item.active svg{
  color:var(--accent);
}

/* FOOTER */

.sb-user{
  margin:14px;

  padding:14px;

  border-radius:18px;

  background:
  rgba(255,255,255,.04);

  border:
  1px solid rgba(255,255,255,.06);

  display:flex;
  align-items:center;
  gap:12px;

  backdrop-filter:blur(10px);
}

.sb-user-name{
  color:white;
  font-size:14px;
  font-weight:700;
}

.sb-user-role{
  color:var(--text3);
  font-size:12px;
  text-transform:capitalize;
}

.sb-logout{
  width:38px;
  height:38px;

  border:none;
  border-radius:12px;

  cursor:pointer;

  background:
  rgba(239,68,68,.15);

  color:#ef4444;

  transition:.25s;
}

.sb-logout:hover{
  transform:scale(1.05);

  background:
  rgba(239,68,68,.25);
}

/* MOBILE */

@media(max-width:768px){

  .sb-toggle{
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .sb-backdrop{
    display:block;
  }

  .sidebar{
    position:fixed;
    left:0;
    top:0;
    z-index:200;

    transform:translateX(-100%);

    box-shadow:
    20px 0 50px rgba(0,0,0,.5);
  }

  .sidebar.open{
    transform:translateX(0);
  }
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
            <div className="sb-logo-name">Workmax OS</div>
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