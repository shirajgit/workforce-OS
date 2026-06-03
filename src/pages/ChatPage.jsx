// pages/ChatPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ChatPage({ user, toast }) {
  const isOwner = user.role === "owner";

  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── KEY FIX: robust sender comparison ───────────────────────────────────────
  // Backend populates sender as { _id, name, role } where _id is a Mongoose
  // ObjectId; user._id from localStorage is usually a plain string. String()
  // on both sides normalises the comparison so sent vs received is reliable.
  const isSent = (msg) => {
    const senderId = String(msg.sender?._id ?? msg.sender ?? "");
    const meId = String(user._id ?? user.id ?? "");
    return senderId !== "" && meId !== "" && senderId === meId;
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

  // ── Auto-scroll to newest ─────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Select contact + load history ─────────────────────────────────────────────
  const selectContact = useCallback(async (contact) => {
    setActive(contact);
    setMessages([]);
    setLoadingMsgs(true);
    try {
      const hist = await messagesAPI.getHistory(contact._id);
      setMessages(Array.isArray(hist) ? hist : []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, []);

  // ── Auto-refresh every 2s ──────────────────────────────────────────────────────
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
            width: 240,
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
              contacts.map((cn) => {
                const isActive = active?._id === cn._id;
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
                    <ChatAvatar name={cn.name} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 500,
                          color: "var(--text)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {cn.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "capitalize", marginTop: 1 }}>
                        {cn.role}
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
                padding: "20px 20px 12px",
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
                  const sent = isSent(msg); // sent → right, received → left
                  return (
                    <div
                      key={msg._id || i}
                      style={{
                        display: "flex",
                        width: "100%", // row spans full width so justifyContent can push the bubble
                        justifyContent: sent ? "flex-end" : "flex-start",
                        alignItems: "flex-end",
                        gap: 8,
                        marginBottom: 10,
                        animation: "chatRise 0.18s ease",
                      }}
                    >
                      {/* Avatar on the LEFT for received messages */}
                      {!sent && <ChatAvatar name={active.name} size={28} />}

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: sent ? "flex-end" : "flex-start",
                          maxWidth: "68%",
                        }}
                      >
                        {/* BUBBLE */}
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

                        {/* TIMESTAMP + delivered ticks */}
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

                      {/* Spacer on the RIGHT keeps sent rows aligned with received ones */}
                      {sent && <div style={{ width: 28, flexShrink: 0 }} />}
                    </div>
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