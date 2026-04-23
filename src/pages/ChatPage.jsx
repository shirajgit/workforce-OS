// pages/ChatPage.jsx — uses useSocket hook, real-time messaging
import { useState, useEffect, useRef, useCallback } from "react";
import { messagesAPI, usersAPI } from "../api/index.js";
import { useSocket } from "../hooks/useSocket.js";
import { Icon, Spinner, Avatar } from "../components/UI.jsx";

export default function ChatPage({ user, toast }) {
  const isOwner = user.role === "owner";

  const [contacts,  setContacts]  = useState([]);
  const [active,    setActive]    = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [sending,   setSending]   = useState(false);

  const bottomRef = useRef(null);
  const activeRef = useRef(null);   // keep active contact accessible inside socket callback

  // Socket hook
  const { connected, error: socketError, emit, on } = useSocket(user._id);

  // Keep activeRef in sync
  useEffect(() => { activeRef.current = active; }, [active]);

  // Register incoming messages
  useEffect(() => {
    const off = on("receive_message", (msg) => {
      const cur = activeRef.current;
      const msgSender   = msg.sender?._id   || msg.sender;
      const msgReceiver = msg.receiver?._id || msg.receiver;

      // Only show if it's for the current active chat
      if (
        cur &&
        (
          (msgSender === cur._id   && msgReceiver === user._id) ||
          (msgSender === user._id  && msgReceiver === cur._id)
        )
      ) {
        setMessages((prev) => {
          // Remove optimistic version if present
          const filtered = prev.filter((m) => !m._optimistic || m.text !== msg.text);
          return [...filtered, { ...msg, _real: true }];
        });
      }
    });
    return off;
  }, [on, user._id]);

  // Load contacts
  useEffect(() => {
    usersAPI.getAll()
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

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load message history from DB
  const selectContact = useCallback(async (contact) => {
    setActive(contact);
    setMessages([]);
    setLoadingMsgs(true);
    try {
      const hist = await messagesAPI.getHistory(contact._id);
      setMessages(Array.isArray(hist) ? hist : []);
    } catch {
      // Route might not exist yet — just show empty chat
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !active) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    // Optimistic UI
    const optimistic = {
      _id: `_opt_${Date.now()}`,
      sender: user._id,
      receiver: active._id,
      text,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    const sent = emit("send_message", {
      sender:   user._id,
      receiver: active._id,
      text,
    });

    if (!sent) {
      toast("Not connected to server — message may not reach recipient", "error");
    }

    setSending(false);
  };

  const isSent = (msg) => {
    const s = msg.sender?._id || msg.sender;
    return s === user._id;
  };

  const fmt = (d) => {
    try {
      return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 14 }}>
        <div>
          <div className="ph-title">Messages</div>
          <div className="ph-sub">
            Owner ↔ Team — strictly private channels
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: connected ? "var(--green)" : "var(--red-dim)",
            display: "inline-block", border: `1px solid ${connected ? "var(--green)" : "var(--red)"}`
          }} />
          <span style={{ color: "var(--text3)" }}>
            {connected ? "Connected" : socketError ? "Connection failed" : "Connecting…"}
          </span>
        </div>
      </div>

      {socketError && (
        <div style={{ padding: "0 26px 10px" }}>
          <div className="alert alert-error" style={{ fontSize: 12.5 }}>
            <Icon name="alert" size={14} />
            {socketError} — Real-time disabled. Messages won't be delivered live.
          </div>
        </div>
      )}

      {/* Chat layout */}
      <div style={{
        flex: 1, overflow: "hidden", margin: "0 26px 26px",
        border: "1px solid var(--border)", borderRadius: "var(--r)",
        display: "flex", background: "var(--bg2)"
      }}>
        {/* Contact list */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-hd">
            Contacts{contacts.length > 0 ? ` (${contacts.length})` : ""}
          </div>

          {loadingContacts ? (
            <div className="loading-center" style={{ padding: 30 }}><Spinner /></div>
          ) : contacts.length === 0 ? (
            <div style={{ padding: 20, color: "var(--text3)", fontSize: 12.5, textAlign: "center" }}>
              No contacts available
            </div>
          ) : contacts.map((c) => (
            <div
              key={c._id}
              className={`contact-item ${active?._id === c._id ? "active" : ""}`}
              onClick={() => selectContact(c)}
            >
              <Avatar name={c.name} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="contact-name">{c.name}</div>
                <div className="contact-role">{c.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat window */}
        {!active ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text3)"
          }}>
            <Icon name="chat" size={40} color="var(--text3)" />
            <div style={{ fontSize: 13.5 }}>Select a contact to start chatting</div>
            <div style={{ fontSize: 12 }}>All messages are private between you and the owner</div>
          </div>
        ) : (
          <div className="chat-main">
            {/* Chat header */}
            <div className="chat-hd">
              <Avatar name={active.name} size="sm" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{active.name}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "capitalize" }}>{active.role}</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--text3)", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? "var(--green)" : "var(--red)", display: "inline-block" }} />
                {connected ? "Live" : "Offline"}
              </div>
            </div>

            {/* Messages */}
            <div className="chat-msgs">
              {loadingMsgs ? (
                <div className="loading-center"><Spinner /></div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 13, marginTop: 50 }}>
                  No messages yet. Start the conversation!
                </div>
              ) : messages.map((msg, i) => {
                const sent = isSent(msg);
                return (
                  <div key={msg._id || i} className={`msg ${sent ? "sent" : "recv"}`}>
                    <div className="msg-bubble" style={{ opacity: msg._optimistic ? 0.65 : 1 }}>
                      {msg.text}
                    </div>
                    <div className="msg-time">
                      {fmt(msg.createdAt)}
                      {msg._optimistic && " · sending…"}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="chat-input-row">
              <input
                className="chat-input"
                placeholder={`Message ${active.name}…`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                disabled={sending}
              />
              <button
                className="btn btn-primary"
                style={{ padding: "9px 14px", flexShrink: 0 }}
                onClick={sendMessage}
                disabled={!input.trim() || sending}
              >
                {sending ? <Spinner /> : <Icon name="send" size={15} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}