// components/UI.jsx - Reusable UI primitives

// ─── ICONS ───────────────────────────────────────────────────────────────────
const ICONS = {
    dashboard: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    tasks: <><rect x="9" y="11" width="13" height="13" rx="2"/><path d="M5 7H3a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-2"/></>,
    chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    check: <polyline points="20 6 9 12 4 10"/>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></>,
    close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    alert: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    eyeoff: <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>,
    dollar: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    upload: <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    arrow_right: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    check_circle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    x_circle: <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>,
    info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    menu: <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  };
  
  export const Icon = ({ name, size = 16, color, style: s }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || "currentColor"} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...s }}>
      {ICONS[name] || null}
    </svg>
  );
  
  // ─── SPINNER ─────────────────────────────────────────────────────────────────
  export const Spinner = ({ lg }) => <div className={lg ? "spinner spinner-lg" : "spinner"} />;
  
  // ─── AVATAR ──────────────────────────────────────────────────────────────────
  export const Avatar = ({ name = "?", size = "md" }) => (
    <div className={`avatar avatar-${size}`}>{(name || "?")[0].toUpperCase()}</div>
  );
  
  // ─── BADGE ───────────────────────────────────────────────────────────────────
  const BADGE_MAP = {
    active: "badge-green", inactive: "badge-red",
    owner: "badge-purple", developer: "badge-blue",
    caller: "badge-amber", bidder: "badge-green",
    assigned: "badge-blue", "in-progress": "badge-amber",
    completed: "badge-green", failed: "badge-red",
    Pending: "badge-amber", Interview: "badge-green",
    Rejected: "badge-red", Response: "badge-blue",
    Paid: "badge-green", Unpaid: "badge-amber",
  };
  
  export const Badge = ({ label, variant }) => (
    <span className={`badge ${variant || BADGE_MAP[label] || "badge-gray"}`}>{label}</span>
  );
  
  // ─── TOAST ───────────────────────────────────────────────────────────────────
  export const Toast = ({ msg, type = "success", onClose }) => (
    <div className={`toast toast-${type}`}>
      <Icon name={type === "error" ? "alert" : "check_circle"} size={16} />
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex" }}>
        <Icon name="close" size={14} />
      </button>
    </div>
  );
  
  // ─── MODAL ───────────────────────────────────────────────────────────────────
  export const Modal = ({ title, onClose, children, lg }) => (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${lg ? "modal-lg" : ""}`}>
        <div className="modal-hd">
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
            <Icon name="close" size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
  
  // ─── EMPTY STATE ─────────────────────────────────────────────────────────────
  export const Empty = ({ icon = "info", title, sub }) => (
    <div className="empty">
      <Icon name={icon} size={38} color="var(--text3)" />
      <div className="empty-title">{title}</div>
      {sub && <div style={{ fontSize: 13, marginTop: 2 }}>{sub}</div>}
    </div>
  );
  
  // ─── CONFIRM DIALOG ──────────────────────────────────────────────────────────
  export const Confirm = ({ message, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 22 }}>
          <div style={{ background: "var(--red-dim)", padding: 10, borderRadius: 10, flexShrink: 0 }}>
            <Icon name="alert" size={20} color="var(--red)" />
          </div>
          <div>
            <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Are you sure?</div>
            <div style={{ color: "var(--text2)", fontSize: 13.5 }}>{message}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );