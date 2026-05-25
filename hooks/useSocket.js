// hooks/useSocket.js

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = (userId) => {

  const [socket, setSocket] = useState(null);

  const [connected, setConnected] =
    useState(false);

  const [error, setError] =
    useState(null);

  useEffect(() => {

    if (!userId) return;

    const newSocket = io(
      "https://test-back-0mld.onrender.com",
      {
        withCredentials: true,
      }
    );

    // ✅ CONNECTED
    newSocket.on("connect", () => {

      console.log(
        "Connected:",
        newSocket.id
      );

      setConnected(true);

      setError(null);

      // ✅ JOIN USER
      newSocket.emit(
        "join",
        userId
      );
    });

    // ❌ DISCONNECTED
    newSocket.on(
      "disconnect",
      () => {

        console.log(
          "Disconnected"
        );

        setConnected(false);
      }
    );

    // ❌ ERROR
    newSocket.on(
      "connect_error",
      (err) => {

        console.log(
          "Socket Error:",
          err.message
        );

        setError(err.message);

        setConnected(false);
      }
    );

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };

  }, [userId]);

  // ✅ EMIT
  const emit = (event, data) => {

    if (!socket || !connected)
      return false;

    socket.emit(event, data);

    return true;
  };

  // ✅ ON
  const on = (event, callback) => {

    if (!socket)
      return () => {};

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  };

  return {
    socket,
    connected,
    error,
    emit,
    on,
  };
};