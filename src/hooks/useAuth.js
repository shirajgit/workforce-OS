// hooks/useAuth.js
import { useState, useCallback } from "react";
import { authAPI } from "../api/index.js";

export function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wos_user")); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const data = await authAPI.login(email, password);

      // Handle various response shapes from backend
      const token    = data.token || data.accessToken;
      const userData = data.user  || data.data || { ...data, token: undefined };

      if (!token) throw new Error("No token returned from server");

      localStorage.setItem("wos_token", token);
      localStorage.setItem("wos_user",  JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (e) {
      const msg = e.message || "Login failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    setError("");
    try {
      const data = await authAPI.register(payload);

      // Support backends that auto-login on register
      const token = data?.token || data?.accessToken;
      const userData = data?.user || data?.data;

      if (token && userData) {
        localStorage.setItem("wos_token", token);
        localStorage.setItem("wos_user", JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }

      return { success: true, user: null };
    } catch (e) {
      const msg = e.message || "Registration failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("wos_token");
    localStorage.removeItem("wos_user");
    setUser(null);
    setError("");
  }, []);

  return { user, loading, error, login, register, logout };
}