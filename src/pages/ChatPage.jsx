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

export default function ChatPage({
  user,
  toast,
}) {

  const isOwner =
    user.role === "owner";

  const [contacts, setContacts] =
    useState([]);

  const [active, setActive] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [
    loadingMsgs,
    setLoadingMsgs,
  ] = useState(false);

  const [
    loadingContacts,
    setLoadingContacts,
  ] = useState(true);

  const [sending, setSending] =
    useState(false);

  const bottomRef = useRef(null);

  // =========================
  // LOAD CONTACTS
  // =========================
  useEffect(() => {

    usersAPI.getAll()

      .then((all) => {

        if (isOwner) {

          setContacts(
            all.filter(
              (u) => u.role !== "owner"
            )
          );

        } else {

          const owner =
            all.find(
              (u) => u.role === "owner"
            );

          setContacts(
            owner ? [owner] : []
          );
        }
      })

      .catch(() => {

        toast(
          "Failed to load contacts",
          "error"
        );

        setContacts([]);
      })

      .finally(() => {
        setLoadingContacts(false);
      });

  }, [isOwner, toast]);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  // =========================
  // LOAD MESSAGE HISTORY
  // =========================
  const selectContact =
    useCallback(async (contact) => {

      setActive(contact);

      setMessages([]);

      setLoadingMsgs(true);

      try {

        const hist =
          await messagesAPI.getHistory(
            contact._id
          );

        setMessages(
          Array.isArray(hist)
            ? hist
            : []
        );

      } catch {

        setMessages([]);

      } finally {

        setLoadingMsgs(false);
      }

    }, []);

  // =========================
  // AUTO REFRESH
  // =========================
  useEffect(() => {

    if (!active) return;

    const interval =
      setInterval(async () => {

        try {

          const hist =
            await messagesAPI.getHistory(
              active._id
            );

          setMessages(hist);

        } catch (err) {

          console.log(err);
        }

      }, 2000);

    return () =>
      clearInterval(interval);

  }, [active]);

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage =
    async () => {

      if (
        !input.trim() ||
        !active
      ) return;

      try {

        setSending(true);

        const text =
          input.trim();

        setInput("");

        const newMessage =
          await messagesAPI.send({

            receiver:
              active._id,

            text,
          });

        setMessages((prev) => [
          ...prev,
          newMessage,
        ]);

      } catch (err) {

        toast(
          "Failed to send message",
          "error"
        );

      } finally {

        setSending(false);
      }
    };

  // =========================
  // CHECK SENT MESSAGE
  // =========================
  const isSent = (msg) => {

    const s =
      msg.sender?._id ||
      msg.sender;

    return s === user._id;
  };

  // =========================
  // FORMAT TIME
  // =========================
  const fmt = (d) => {

    try {

      return new Date(d)
        .toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );

    } catch {

      return "";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >

      {/* HEADER */}
      <div
        className="ph"
        style={{
          paddingBottom: 14,
        }}
      >

        <div>

          <div className="ph-title">
            Messages
          </div>

          <div className="ph-sub">
            Private chat system
          </div>

        </div>

        <div
          style={{
            fontSize: 12,
            color:
              "var(--text3)",
          }}
        >
          Messages synced
        </div>

      </div>

      {/* CHAT LAYOUT */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          margin: "0 26px 26px",
          border:
            "1px solid var(--border)",
          borderRadius:
            "var(--r)",
          display: "flex",
          background:
            "var(--bg2)",
        }}
      >

        {/* CONTACTS */}
        <div className="chat-sidebar">

          <div className="chat-sidebar-hd">
            Contacts
            {contacts.length > 0
              ? ` (${contacts.length})`
              : ""}
          </div>

          {loadingContacts ? (

            <div
              className="loading-center"
              style={{
                padding: 30,
              }}
            >
              <Spinner />
            </div>

          ) : contacts.length === 0 ? (

            <div
              style={{
                padding: 20,
                color:
                  "var(--text3)",
                fontSize: 12.5,
                textAlign:
                  "center",
              }}
            >
              No contacts available
            </div>

          ) : (

            contacts.map((c) => (

              <div
                key={c._id}
                className={`contact-item ${
                  active?._id ===
                  c._id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selectContact(c)
                }
              >

                <Avatar
                  name={c.name}
                  size="sm"
                />

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >

                  <div className="contact-name">
                    {c.name}
                  </div>

                  <div className="contact-role">
                    {c.role}
                  </div>

                </div>

              </div>
            ))
          )}
        </div>

        {/* CHAT WINDOW */}
        {!active ? (

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection:
                "column",
              alignItems:
                "center",
              justifyContent:
                "center",
              gap: 10,
              color:
                "var(--text3)",
            }}
          >

            <Icon
              name="chat"
              size={40}
              color="var(--text3)"
            />

            <div
              style={{
                fontSize: 13.5,
              }}
            >
              Select a contact
            </div>

          </div>

        ) : (

          <div className="chat-main">

            {/* CHAT HEADER */}
            <div className="chat-hd">

              <Avatar
                name={active.name}
                size="sm"
              />

              <div>

                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {active.name}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color:
                      "var(--text3)",
                    textTransform:
                      "capitalize",
                  }}
                >
                  {active.role}
                </div>

              </div>

            </div>

            {/* MESSAGES */}
           {/* MESSAGES */}
<div className="chat-msgs">

{loadingMsgs ? (

  <div className="loading-center">
    <Spinner />
  </div>

) : messages.length === 0 ? (

  <div
    style={{
      textAlign: "center",
      color: "var(--text3)",
      fontSize: 13,
      marginTop: 50,
    }}
  >
    No messages yet
  </div>

) : (

  messages.map((msg, i) => {

    const sent = isSent(msg);

    return (

      <div
        key={msg._id || i}
        style={{
          display: "flex",
          justifyContent: sent
            ? "flex-end"
            : "flex-start",
          marginBottom: 12,
        }}
      >

        <div
          style={{
            maxWidth: "75%",
            display: "flex",
            flexDirection: "column",
            alignItems: sent
              ? "flex-end"
              : "flex-start",
          }}
        >

          {/* MESSAGE BUBBLE */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 16,
              background: sent
                ? "var(--primary)"
                : "var(--bg3)",
              color: sent
                ? "#fff"
                : "var(--text)",
              fontSize: 14,
              lineHeight: 1.4,
              wordBreak: "break-word",
              border: sent
                ? "none"
                : "1px solid var(--border)",
            }}
          >
            {msg.text}
          </div>

          {/* TIME */}
          <div
            style={{
              fontSize: 11,
              color: "var(--text3)",
              marginTop: 4,
              paddingInline: 4,
            }}
          >
            {fmt(msg.createdAt)}
          </div>

        </div>

      </div>
    );
  })
)}

<div ref={bottomRef} />

</div>

            {/* INPUT */}
            <div className="chat-input-row">

              <input
                className="chat-input"
                placeholder={`Message ${active.name}...`}
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  e.key ===
                    "Enter" &&
                  !e.shiftKey &&
                  sendMessage()
                }
                disabled={sending}
              />

              <button
                className="btn btn-primary"
                style={{
                  padding:
                    "9px 14px",
                  flexShrink: 0,
                }}
                onClick={sendMessage}
                disabled={
                  !input.trim() ||
                  sending
                }
              >

                {sending ? (
                  <Spinner />
                ) : (
                  <Icon
                    name="send"
                    size={15}
                  />
                )}

              </button>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}