// pages/ChatPage.jsx
import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { messagesAPI, usersAPI } from "../api/index.js";
import { Icon, Spinner } from "../components/UI.jsx";

// ─── Helpers ────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const AVATAR_COLORS = [
  { bg: "#534AB7", fg: "#EEEDFE" },
  { bg: "#185FA5", fg: "#E6F1FB" },
  { bg: "#0F6E56", fg: "#E1F5EE" },
  { bg: "#993C1D", fg: "#FAECE7" },
  { bg: "#993556", fg: "#FBEAF0" },
];
const pickColor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + h * 31;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

const fmtTime = (d) => {
  try {
    return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const sameDay = (a, b) => {
  const x = new Date(a), y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
};

// "Today" / "Yesterday" / "3 Jun" / "3 Jun 2025"
const dayLabel = (d) => {
  const date = new Date(d);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yest)) return "Yesterday";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(date.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  });
};

// short relative time for the sidebar
const sidebarTime = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (sameDay(date, today)) return fmtTime(date);
  if (sameDay(date, yest)) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

// ─── ChatAvatar ───────────────────────────────────────────────────────────────
function ChatAvatar({ name, size = 36, online = false }) {
  const { bg, fg } = pickColor(name);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: bg,
          color: fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.36,
          fontWeight: 500,
          userSelect: "none",
        }}
      >
        {getInitials(name)}
      </div>
      {online && (
        <div
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#1D9E75",
            border: "2px solid var(--bg)",
          }}
        />
      )}
    </div>
  );
}

// Centered date / unread divider
function Divider({ label, accent = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 14px" }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: accent ? "#534AB7" : "var(--text3)",
          background: accent ? "rgba(83,74,183,0.10)" : "var(--bg3)",
          border: `1px solid ${accent ? "rgba(83,74,183,0.25)" : "var(--border)"}`,
          borderRadius: 20,
          padding: "3px 12px",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ChatPage({ user, toast }) {
  const isOwner = user.role === "owner";
  const myId = String(user._id ?? user.id ?? "");
  const LR_KEY = `chat:lastRead:${myId}`;

  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [sending, setSending] = useState(false);

  // per-contact metadata for the sidebar: { lastText, lastTime, lastFromMe, unread }
  const [meta, setMeta] = useState({});
  // read cutoffs: { [contactId]: timestamp of last read message }
  const [lastRead, setLastRead] = useState(() => {
    try {
      return JSON.parse((typeof window !== "undefined" && localStorage.getItem(LR_KEY)) || "{}");
    } catch {
      return {};
    }
  });
  // snapshot of the read cutoff when a conversation was opened (for the "Unread" line)
  const [openCutoff, setOpenCutoff] = useState(0);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const persistRead = (next) => {
    setLastRead(next);
    try {
      localStorage.setItem(LR_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  };

  // ── Robust sender comparison (ObjectId vs string) ───────────────────────────
  const isSent = (msg) => {
    const senderId = String(msg.sender?._id ?? msg.sender ?? "");
    return senderId !== "" && myId !== "" && senderId === myId;
  };
  const isFromContact = (msg, contactId) => {
    const senderId = String(msg.sender?._id ?? msg.sender ?? "");
    return senderId !== "" && senderId === String(contactId);
  };

  // ── Load contacts ────────────────────────────────────────────────────────────
  useEffect(() => {
    usersAPI
      .getAll()
      .then((all) => {
        const list = Array.isArray(all) ? all : [];
        setContacts(
          isOwner
            ? list.filter((u) => u.role !== "owner")
            : (() => {
                const owner = list.find((u) => u.role === "owner");
                return owner ? [owner] : [];
              })()
        );
      })
      .catch(() => {
        toast("Failed to load contacts", "error");
        setContacts([]);
      })
      .finally(() => setLoadingContacts(false));
  }, [isOwner, toast]);

  // ── Sidebar poll: last message + unread count per contact ───────────────────
  // Fine for a small internal team. For large lists, add a backend summary
  // endpoint (see the note at the bottom of this file).
  useEffect(() => {
    if (contacts.length === 0) return;
    let alive = true;

    const tick = async () => {
      const entries = await Promise.all(
        contacts.map(async (cn) => {
          try {
            const hist = await messagesAPI.getHistory(cn._id);
            const arr = Array.isArray(hist) ? hist : [];
            const last = arr[arr.length - 1];
            const cutoff = lastRead[cn._id] || 0;
            const unread = arr.reduce((n, m) => {
              const t = new Date(m.createdAt).getTime();
              return isFromContact(m, cn._id) && t > cutoff ? n + 1 : n;
            }, 0);
            return [
              cn._id,
              {
                lastText: last?.text || "",
                lastTime: last ? new Date(last.createdAt).getTime() : 0,
                lastFromMe: last ? isSent(last) : false,
                unread: active?._id === cn._id ? 0 : unread,
              },
            ];
          } catch {
            return [cn._id, null];
          }
        })
      );
      if (!alive) return;
      setMeta((prev) => {
        const next = { ...prev };
        entries.forEach(([id, m]) => {
          if (m) next[id] = m;
        });
        return next;
      });
    };

    tick();
    const id = setInterval(tick, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [contacts, lastRead, active, myId]);

  // ── Auto-scroll to newest ─────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Select contact + load history ─────────────────────────────────────────────
  const selectContact = useCallback(
    async (contact) => {
      setActive(contact);
      setMessages([]);
      setLoadingMsgs(true);
      setOpenCutoff(lastRead[contact._id] || 0); // where "Unread" should appear
      setMeta((prev) => (prev[contact._id] ? { ...prev, [contact._id]: { ...prev[contact._id], unread: 0 } } : prev));
      try {
        const hist = await messagesAPI.getHistory(contact._id);
        setMessages(Array.isArray(hist) ? hist : []);
      } catch {
        setMessages([]);
      } finally {
        setLoadingMsgs(false);
        setTimeout(() => inputRef.current?.focus(), 80);
      }
    },
    [lastRead]
  );

  // ── Auto-refresh active conversation every 2s ───────────────────────────────
  useEffect(() => {
    if (!active) return;
    const id = setInterval(async () => {
      try {
        const hist = await messagesAPI.getHistory(active._id);
        if (Array.isArray(hist)) setMessages(hist);
      } catch {
        /* ignore transient poll errors */
      }
    }, 2000);
    return () => clearInterval(id);
  }, [active]);

  // ── Mark the open conversation as read whenever messages change ─────────────
  useEffect(() => {
    if (!active || messages.length === 0) return;
    const latest = messages[messages.length - 1];
    const t = new Date(latest.createdAt).getTime();
    if ((lastRead[active._id] || 0) >= t) return;
    persistRead({ ...lastRead, [active._id]: t });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, active]);

  // ── Send ───────────────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !active) return;
    setSending(true);
    setInput("");
    try {
      const msg = await messagesAPI.send({ receiver: active._id, text });
      setMessages((prev) => [...prev, msg]);
    } catch {
      toast("Failed to send message", "error");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // ── Sidebar ordering: most-recent activity first ────────────────────────────
  const sortedContacts = [...contacts].sort(
    (a, b) => (meta[b._id]?.lastTime || 0) - (meta[a._id]?.lastTime || 0)
  );

  // index of the first unread (received) message, for the "Unread" line
  let firstUnreadIdx = -1;
  if (active && openCutoff > 0) {
    firstUnreadIdx = messages.findIndex(
      (m) => isFromContact(m, active._id) && new Date(m.createdAt).getTime() > openCutoff
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* PAGE HEADER */}
      <div className="ph" style={{ paddingBottom: 14 }}>
        <div>
          <div className="ph-title">Messages</div>
          <div className="ph-sub">Private chat system</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>Messages synced</div>
      </div>

      {/* MAIN CHAT LAYOUT */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          margin: "0 26px 26px",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          display: "flex",
          background: "var(--bg2)",
        }}
      >
        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <div
          style={{
            width: 270,
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px 10px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Contacts</span>
            {contacts.length > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: "1px 8px",
                  color: "var(--text3)",
                }}
              >
                {contacts.length}
              </span>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingContacts ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 30 }}>
                <Spinner />
              </div>
            ) : contacts.length === 0 ? (
              <div style={{ padding: "30px 16px", textAlign: "center", color: "var(--text3)", fontSize: 12.5 }}>
                No contacts available
              </div>
            ) : (
              sortedContacts.map((cn) => {
                const isActive = active?._id === cn._id;
                const m = meta[cn._id] || {};
                const unread = isActive ? 0 : m.unread || 0;
                const hasUnread = unread > 0;
                const preview = m.lastText ? (m.lastFromMe ? "You: " : "") + m.lastText : cn.role;
                return (
                  <div
                    key={cn._id}
                    onClick={() => selectContact(cn)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      cursor: "pointer",
                      background: isActive ? "var(--bg2)" : "transparent",
                      borderLeft: isActive ? "2px solid #534AB7" : "2px solid transparent",
                      transition: "background 0.12s",
                    }}
                  >
                    <ChatAvatar name={cn.name} size={40} online={hasUnread} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                        <span
                          style={{
                            fontSize: 13.5,
                            fontWeight: hasUnread ? 700 : 500,
                            color: "var(--text)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {cn.name}
                        </span>
                        {m.lastTime > 0 && (
                          <span style={{ fontSize: 10.5, color: hasUnread ? "#534AB7" : "var(--text3)", flexShrink: 0 }}>
                            {sidebarTime(m.lastTime)}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 2 }}>
                        <span
                          style={{
                            fontSize: 12,
                            color: hasUnread ? "var(--text)" : "var(--text3)",
                            fontWeight: hasUnread ? 500 : 400,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textTransform: m.lastText ? "none" : "capitalize",
                          }}
                        >
                          {preview}
                        </span>
                        {hasUnread && (
                          <span
                            style={{
                              flexShrink: 0,
                              minWidth: 18,
                              height: 18,
                              padding: "0 5px",
                              borderRadius: 9,
                              background: "#534AB7",
                              color: "#EEEDFE",
                              fontSize: 11,
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── CHAT WINDOW ─────────────────────────────────────────────── */}
        {!active ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              color: "var(--text3)",
            }}
          >
            <Icon name="chat" size={40} color="var(--text3)" />
            <div style={{ fontSize: 13.5 }}>Select a contact to start chatting</div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* TOP BAR */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 18px",
                borderBottom: "1px solid var(--border)",
                background: "var(--bg)",
                flexShrink: 0,
              }}
            >
              <ChatAvatar name={active.name} size={38} online />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{active.name}</div>
                <div style={{ fontSize: 11, color: "#1D9E75", marginTop: 1 }}>Online</div>
              </div>
            </div>

            {/* MESSAGES AREA */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 20px 12px",
                display: "flex",
                flexDirection: "column",
                background: "var(--bg2)",
              }}
            >
              {loadingMsgs ? (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 60 }}>
                  <Spinner />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 13, marginTop: 60 }}>
                  No messages yet. Say hello 👋
                </div>
              ) : (
                messages.map((msg, i) => {
                  const sent = isSent(msg);
                  const prev = messages[i - 1];
                  const showDay = !prev || !sameDay(prev.createdAt, msg.createdAt);
                  const showUnread = i === firstUnreadIdx;
                  return (
                    <Fragment key={msg._id || i}>
                      {showDay && <Divider label={dayLabel(msg.createdAt)} />}
                      {showUnread && <Divider label="Unread messages" accent />}

                      <div
                        style={{
                          display: "flex",
                          width: "100%",
                          justifyContent: sent ? "flex-end" : "flex-start",
                          alignItems: "flex-end",
                          gap: 8,
                          marginBottom: 10,
                          animation: "chatRise 0.18s ease",
                        }}
                      >
                        {!sent && <ChatAvatar name={active.name} size={28} />}

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: sent ? "flex-end" : "flex-start",
                            maxWidth: "68%",
                          }}
                        >
                          <div
                            style={{
                              padding: "9px 14px",
                              fontSize: 13.5,
                              lineHeight: 1.5,
                              wordBreak: "break-word",
                              borderRadius: sent ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                              background: sent ? "#534AB7" : "var(--bg)",
                              color: sent ? "#EEEDFE" : "var(--text)",
                              border: sent ? "none" : "1px solid var(--border)",
                            }}
                          >
                            {msg.text}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              marginTop: 4,
                              fontSize: 10.5,
                              color: "var(--text3)",
                            }}
                          >
                            <span>{fmtTime(msg.createdAt)}</span>
                            {sent && (
                              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                                <path d="M1 5L4.5 8.5L9 3" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 5L8.5 8.5L13 3" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {sent && <div style={{ width: 28, flexShrink: 0 }} />}
                      </div>
                    </Fragment>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* INPUT BAR */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderTop: "1px solid var(--border)",
                background: "var(--bg)",
                flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                placeholder={`Message ${active.name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                disabled={sending}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 20,
                  border: "1px solid var(--border)",
                  background: "var(--bg2)",
                  padding: "0 18px",
                  fontSize: 13.5,
                  color: "var(--text)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  background: input.trim() && !sending ? "#534AB7" : "var(--bg3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                {sending ? (
                  <Spinner />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke={input.trim() ? "#EEEDFE" : "var(--text3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() ? "#EEEDFE" : "var(--text3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes chatRise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

/*
  NOTE on unread at scale:
  The sidebar polls each contact's history every 5s to compute unread counts —
  fine for a small internal team. For many contacts, add a backend summary
  endpoint instead, e.g. GET /api/messages/unread -> { "<contactId>": 3, ... },
  combined with a stored per-user "lastReadAt". For real "seen" ticks, add
  `seen: Boolean` to the message schema and mark a conversation seen on open.
*/