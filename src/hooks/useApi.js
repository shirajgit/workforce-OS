// hooks/useApi.js
// Generic hook for any API call — handles loading, error, and refetch
import { useState, useEffect, useCallback, useRef } from "react";

export function useApi(apiFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiFn();
      if (mountedRef.current) setData(result);
    } catch (e) {
      if (mountedRef.current) setError(e.message || "Request failed");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch, setData };
}

// Simpler version that doesn't auto-fetch — just returns an executor
export function useApiMutation() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const execute = useCallback(async (apiFn, { onSuccess, onError } = {}) => {
    setLoading(true);
    setError("");
    try {
      const result = await apiFn();
      onSuccess?.(result);
      return { success: true, data: result };
    } catch (e) {
      const msg = e.message || "Request failed";
      setError(msg);
      onError?.(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
}