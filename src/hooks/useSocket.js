// hooks/useSocket.js
// Proper Socket.io hook — loads script dynamically, handles reconnect
import { useState, useEffect, useRef, useCallback } from "react";

const SOCKET_URL = "http://localhost:5000";
const SOCKET_CDN = "https://cdn.socket.io/4.7.2/socket.io.min.js";

// Global socket singleton — one connection for the whole app
let globalSocket = null;
let scriptLoaded = false;
let scriptLoading = false;
const scriptCallbacks = [];

const loadSocketScript = () =>
  new Promise((resolve, reject) => {
    if (scriptLoaded && window.io) { resolve(); return; }
    if (scriptLoading) { scriptCallbacks.push({ resolve, reject }); return; }

    scriptLoading = true;
    scriptCallbacks.push({ resolve, reject });

    const el = document.createElement("script");
    el.src = SOCKET_CDN;
    el.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      scriptCallbacks.forEach((cb) => cb.resolve());
      scriptCallbacks.length = 0;
    };
    el.onerror = () => {
      scriptLoading = false;
      scriptCallbacks.forEach((cb) => cb.reject(new Error("Failed to load socket.io")));
      scriptCallbacks.length = 0;
    };
    document.head.appendChild(el);
  });

export function useSocket(userId) {
  const [connected,   setConnected]   = useState(false);
  const [error,       setError]       = useState("");
  const socketRef     = useRef(null);
  const listenersRef  = useRef([]);   // { event, handler, attached }

  const attachStoredListeners = useCallback((socket) => {
    listenersRef.current.forEach((listener) => {
      if (!listener.attached) {
        socket.on(listener.event, listener.handler);
        listener.attached = true;
      }
    });
  }, []);

  const connect = useCallback(async () => {
    try {
      await loadSocketScript();

      // Reuse existing socket if already connected with same userId
      if (globalSocket?.connected) {
        socketRef.current = globalSocket;
        setConnected(true);
        setError("");
        globalSocket.emit("register", userId);
        attachStoredListeners(globalSocket);
        return;
      }

      // Disconnect stale socket
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }

      const socket = window.io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000,
      });

      globalSocket = socket;
      socketRef.current = socket;
      attachStoredListeners(socket);

      socket.on("connect", () => {
        setConnected(true);
        setError("");
        // Register user with backend
        socket.emit("register", userId);
      });

      socket.on("disconnect", (reason) => {
        setConnected(false);
        setError(reason === "io server disconnect" ? "Disconnected by server" : "");
      });

      socket.on("connect_error", (err) => {
        setConnected(false);
        setError("Cannot connect to server. Make sure backend is running.");
      });

    } catch (e) {
      setError(e.message);
    }
  }, [userId, attachStoredListeners]);

  useEffect(() => {
    if (!userId) return;
    connect();

    return () => {
      // Don't disconnect on unmount — keep global socket alive
      // Just remove listeners added by this instance
      if (socketRef.current) {
        listenersRef.current.forEach(({ event, handler }) => {
          socketRef.current.off(event, handler);
        });
        listenersRef.current = [];
      }
    };
  }, [userId, connect]);

  // Subscribe to a socket event — auto-cleanup on unmount
  const on = useCallback((event, handler) => {
    const listener = { event, handler, attached: false };
    listenersRef.current.push(listener);

    if (socketRef.current) {
      socketRef.current.on(event, handler);
      listener.attached = true;
    }

    return () => {
      socketRef.current?.off(event, handler);
      listenersRef.current = listenersRef.current.filter(
        (l) => !(l.event === event && l.handler === handler)
      );
    };
  }, []);

  // Emit to server
  const emit = useCallback((event, data) => {
    if (!socketRef.current?.connected) {
      console.warn("[Socket] Not connected, cannot emit:", event);
      return false;
    }
    socketRef.current.emit(event, data);
    return true;
  }, []);

  return { socket: socketRef.current, connected, error, emit, on };
}