// pages/ChatPage.jsx

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import {
  messagesAPI,
  usersAPI,
} from "../api/index.js";

import {
  Icon,
  Spinner,
  Avatar,
} from "../components/UI.jsx";

// ─── Helpers ────────────────────────────────────────────────
const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const AVATAR_COLORS = [
  { bg: "#534AB7", text: "#EEEDFE" },
  { bg: "#185FA5", text: "#E6F1FB" },
  { bg: "#0F6E56", text: "#E1F5EE" },
  { bg: "#993C1D", text: "#FAECE7" },
  { bg: "#993556", text: "#FBEAF0" },
];

const avatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const fmt = (d) => {
  try {
    return new Date(d).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

// ─── Sub-components ─────────────────────────────────────────
function ChatAvatar({ name, size = 38, showOnline = false }) {
  const { bg, text } = avatarColor(name);
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: bg,
          color: text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.34,
          fontWeight: 500,
        }}
      >
        {getInitials(name)}
      </div>
      {showOnline && (
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

function IconBtn({ icon, onClick, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        border: "none",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text3)",
        cursor: "pointer",
        fontSize: 18,
      }}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────
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

  // ── Load Contacts ──────────────────────────────────────────
  useEffect(() => {
    usersAPI
      .getAll()
      .then((all) => {
        if (isOwner) {
          setContacts(all.filter((u) => u.role !== "owner"));
        } else {
          const owner = all.find((u) => u.role === "owner");
          setContacts(owner ? [owner] : []);
        }
      })
      .catch(() => {
        toast("Failed to load contacts", "error");
        setContacts([]);
      })
      .finally(() => setLoadingContacts(false));
  }, [isOwner, toast]);

  // ── Auto Scroll ────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Load Message History ───────────────────────────────────
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
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  // ── Auto Refresh ───────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(async () => {
      try {
        const hist = await messagesAPI.getHistory(active._id);
        setMessages(hist);
      } catch (err) {
        console.log(err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [active]);

  // ── Send Message ───────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || !active) return;
    try {
      setSending(true);
      const text = input.trim();
      setInput("");
      const newMessage = await messagesAPI.send({ receiver: active._id, text });
      setMessages((prev) => [...prev, newMessage]);
    } catch {
      toast("Failed to send message", "error");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const isSent = (msg) => {
    const s = msg.sender?._id || msg.sender;
    return s === user._id;
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* PAGE HEADER */}
      <div className="ph" style={{ paddingBottom: 14 }}>
        <div>
          <div className="ph-title">Messages</div>
          <div className="ph-sub">Private chat system</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>Messages synced</div>
      </div>

      {/* CHAT LAYOUT */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          margin: "0 26px 26px",
          border: "0.5px solid var(--border)",
          borderRadius: "var(--r)",
          display: "flex",
          background: "var(--bg2)",
        }}
      >
        {/* ── SIDEBAR ── */}
        <div
          style={{
            width: 240,
            flexShrink: 0,
            borderRight: "0.5px solid var(--border)",
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: "14px 16px 10px",
              borderBottom: "0.5px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text)",
              }}
            >
              Contacts
              {contacts.length > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 11,
                    fontWeight: 400,
                    background: "var(--bg3)",
                    border: "0.5px solid var(--border)",
                    borderRadius: 20,
                    padding: "1px 8px",
                    color: "var(--text3)",
                  }}
                >
                  {contacts.length}
                </span>
              )}
            </div>
          </div>

          {/* Contact list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingContacts ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: 30,
                }}
              >
                <Spinner />
              </div>
            ) : contacts.length === 0 ? (
              <div
                style={{
                  padding: "30px 16px",
                  textAlign: "center",
                  color: "var(--text3)",
                  fontSize: 12.5,
                }}
              >
                No contacts available
              </div>
            ) : (
              contacts.map((c) => {
                const isActive = active?._id === c._id;
                return (
                  <div
                    key={c._id}
                    onClick={() => selectContact(c)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      cursor: "pointer",
                      background: isActive ? "var(--bg2)" : "transparent",
                      borderLeft: isActive
                        ? "2px solid #534AB7"
                        : "2px solid transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <ChatAvatar name={c.name} size={36} />
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
                        {c.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text3)",
                          textTransform: "capitalize",
                          marginTop: 1,
                        }}
                      >
                        {c.role}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── CHAT WINDOW ── */}
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
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ── TOP BAR ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 18px",
                borderBottom: "0.5px solid var(--border)",
                background: "var(--bg)",
                flexShrink: 0,
              }}
            >
              <ChatAvatar name={active.name} size={38} showOnline />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  {active.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#1D9E75",
                    marginTop: 1,
                  }}
                >
                  Online
                </div>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                <IconBtn icon="phone" title="Call" />
                <IconBtn icon="dots-vertical" title="More options" />
              </div>
            </div>

            {/* ── MESSAGES ── */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 20px 10px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                background: "var(--bg2)",
              }}
            >
              {loadingMsgs ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 60,
                  }}
                >
                  <Spinner />
                </div>
              ) : messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--text3)",
                    fontSize: 13,
                    marginTop: 60,
                  }}
                >
                  No messages yet. Say hello 👋
                </div>
              ) : (
                messages.map((msg, i) => {
                  const sent = isSent(msg);
                  return (
                    <div
                      key={msg._id || i}
                      style={{
                        display: "flex",
                        justifyContent: sent ? "flex-end" : "flex-start",
                        marginBottom: 6,
                        animation: "fadeUp 0.18s ease",
                      }}
                    >
                      {/* Receiver avatar */}
                      {!sent && (
                        <div style={{ marginRight: 8, alignSelf: "flex-end" }}>
                          <ChatAvatar name={active.name} size={26} />
                        </div>
                      )}

                      <div
                        style={{
                          maxWidth: "68%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: sent ? "flex-end" : "flex-start",
                        }}
                      >
                        {/* Bubble */}
                        <div
                          style={{
                            padding: "9px 14px",
                            borderRadius: sent
                              ? "16px 16px 4px 16px"
                              : "16px 16px 16px 4px",
                            background: sent ? "#534AB7" : "var(--bg)",
                            color: sent ? "#EEEDFE" : "var(--text)",
                            fontSize: 13.5,
                            lineHeight: 1.45,
                            wordBreak: "break-word",
                            border: sent
                              ? "none"
                              : "0.5px solid var(--border)",
                          }}
                        >
                          {msg.text}
                        </div>

                        {/* Timestamp + tick */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 3,
                            paddingInline: 4,
                            fontSize: 10.5,
                            color: "var(--text3)",
                          }}
                        >
                          <span>{fmt(msg.createdAt)}</span>
                          {sent && (
                            <Icon name="checks" size={13} color="#1D9E75" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── INPUT BAR ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderTop: "0.5px solid var(--border)",
                background: "var(--bg)",
                flexShrink: 0,
              }}
            >
              {/* Attach button */}
              <button
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "none",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text3)",
                  cursor: "pointer",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                <Icon name="paperclip" size={18} />
              </button>

              {/* Text input */}
              <input
                ref={inputRef}
                placeholder={`Message ${active.name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && sendMessage()
                }
                disabled={sending}
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: 20,
                  border: "0.5px solid var(--border)",
                  background: "var(--bg2)",
                  padding: "0 16px",
                  fontSize: 13.5,
                  color: "var(--text)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />

              {/* Send button */}
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "none",
                  background:
                    !input.trim() || sending
                      ? "var(--bg3)"
                      : "#534AB7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor:
                    !input.trim() || sending ? "not-allowed" : "pointer",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                {sending ? (
                  <Spinner />
                ) : (
                  <Icon
                    name="send-2"
                    size={16}
                    color={
                      !input.trim() ? "var(--text3)" : "#EEEDFE"
                    }
                  />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bubble fade-up animation */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}