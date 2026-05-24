// api/index.js — Fixed API layer
// ROOT CAUSE OF "Unexpected token '<'" :
// Server returns an HTML error page (404/500) instead of JSON.
// We check Content-Type before calling .json() to give a proper error.

type ApiRecord = Record<string, unknown>;
type ApiResponse = Promise<unknown>;

export const API_BASE = "https://test-back-0mld.onrender.com/";

// ─── CORE REQUEST ─────────────────────────────────────────────────────────────
export const request = async (
  path: string,
  options: RequestInit & { headers?: HeadersInit } = {}
): Promise<unknown> => {
  const token = localStorage.getItem("wos_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (_) {
    throw new Error("Cannot reach server. Is backend running on port 5000?");
  }

  // Some successful operations (especially DELETE) can return no content.
  if (res.status === 204 || res.status === 205) {
    return null;
  }

  // Detect HTML response (server returned error page, not JSON)
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const STATUS_MSG: Record<number, string> = {
      404: `API route not found: ${path}`,
      401: "Session expired — please login again",
      403: "Access denied",
      500: "Internal server error",
    };
    if (!res.ok) {
      throw new Error(STATUS_MSG[res.status] || `Server error (${res.status})`);
    }
    return null;
  }

  const data = await res.json();
  if (!res.ok) throw new Error((data as any).message || (data as any).error || `Error ${res.status}`);
  return data;
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string): ApiResponse =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (payload: ApiRecord): ApiResponse =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
};

// ─── USERS ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (): ApiResponse => request("/users"),
  getById: (id: string): ApiResponse => request(`/users/${id}`),
  create: (data: ApiRecord): ApiResponse =>
    request("/users", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: ApiRecord): ApiResponse =>
    request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: async (id: string): Promise<unknown> => {
    const candidates = [
      `/users/${id}`,
      `/users/delete/${id}`,
      `/users/${id}/delete`,
      `/users/remove/${id}`,
    ];

    let lastError: unknown = null;
    for (const route of candidates) {
      try {
        return await request(route, { method: "DELETE" });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (!message.includes("API route not found")) throw e;
        lastError = e;
      }
    }

    throw lastError || new Error("No matching user delete route found");
  },
};

// ─── TASKS ────────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll: (): ApiResponse => request("/tasks"),
  create: (data: ApiRecord): ApiResponse =>
    request("/tasks", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: ApiRecord): ApiResponse =>
    request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string): ApiResponse =>
    request(`/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  delete: async (id: string): Promise<unknown> => {
    try {
      return await request(`/tasks/${id}`, { method: "DELETE" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      if (!message.includes("API route not found")) throw e;

      try {
        return await request(`/tasks/delete/${id}`, { method: "DELETE" });
      } catch (e2: unknown) {
        const message2 = e2 instanceof Error ? e2.message : String(e2);
        if (!message2.includes("API route not found")) throw e2;
        return request(`/tasks/${id}/delete`, { method: "DELETE" });
      }
    }
  },
};

// ─── SUBMISSIONS ──────────────────────────────────────────────────────────────
export const submissionsAPI = {
  getAll: (): ApiResponse => request("/submissions"),
  create: (data: ApiRecord): ApiResponse =>
    request("/submissions", { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string): ApiResponse =>
    request(`/submissions/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
  delete: async (id: string): Promise<unknown> => {
    const candidates = [`/submissions/${id}`];

    let lastError: unknown = null;
    for (const route of candidates) {
      try {
        return await request(route, { method: "DELETE" });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (!message.includes("API route not found")) throw e;
        lastError = e;
      }
    }

    throw lastError || new Error("No matching submission delete route found");
  },
};

// ─── INTERVIEWS ───────────────────────────────────────────────────────────────
export const interviewsAPI = {
  getAll: (): ApiResponse => request("/interviews"),
  create: (data: ApiRecord): ApiResponse =>
    request("/interviews", { method: "POST", body: JSON.stringify(data) }),
  advance: (id: string): ApiResponse =>
    request(`/interviews/${id}/advance`, { method: "PATCH" }),
  update: (id: string, data: ApiRecord): ApiResponse =>
    request(`/interviews/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string): ApiResponse =>
    request(`/interviews/${id}`, { method: "DELETE" }),
};

// ─── PAYMENTS / SALARY ────────────────────────────────────────────────────────
export const paymentsAPI = {
  getAll: (): ApiResponse => request("/payments"),
  create: (data: ApiRecord): ApiResponse =>
    request("/payments", { method: "POST", body: JSON.stringify(data) }),
  markPaid: (id: string): ApiResponse =>
    request(`/payments/${id}/pay`, { method: "PATCH" }),   // FIX: was broken
  delete: (id: string): ApiResponse =>
    request(`/payments/${id}`, { method: "DELETE" }),
};

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export const messagesAPI = {
  getHistory: (receiverId: string) => request(`/messages/${receiverId}`),
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => request("/dashboard"),
};
