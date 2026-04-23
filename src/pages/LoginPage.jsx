// pages/LoginPage.jsx — uses useAuth hook, real API, proper error handling
import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { Icon } from "../components/UI.jsx";

export default function LoginPage({ onLogin }) {
  const { login, loading, error } = useAuth();
  const [email,  setEmail]  = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [localErr, setLocalErr] = useState("");

  const handleSubmit = async () => {
    setLocalErr("");
    if (!email.trim()) { setLocalErr("Email is required"); return; }
    if (!password.trim()) { setLocalErr("Password is required"); return; }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await login(normalizedEmail, password);
    if (result.success) {
      onLogin(result.user);
    }
  };

  const displayError = localErr || error;

  return (
    <div className="login-page">
      <div className="login-blob1" />
      <div className="login-blob2" />

      <div className="login-card">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div className="sb-logo-icon" style={{ width: 40, height: 40, fontSize: 16 }}>WO</div>
          <div>
            <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 19 }}>Workforce OS</div>
            <div style={{ fontSize: 11, color: "var(--text3)", letterSpacing: "1px", textTransform: "uppercase" }}>
              Management Platform
            </div>
          </div>
        </div>

        <div style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          Welcome back
        </div>
        <div style={{ color: "var(--text2)", fontSize: 13.5, marginBottom: 24 }}>
          Sign in to your workspace
        </div>

        {displayError && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <Icon name="alert" size={15} />
            {displayError}
          </div>
        )}

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position: "relative" }}>
            <Icon name="user" size={15} color="var(--text3)"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              className="form-input"
              style={{ paddingLeft: 36 }}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoComplete="email"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: "relative" }}>
            <Icon name="lock" size={15} color="var(--text3)"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              className="form-input"
              style={{ paddingLeft: 36, paddingRight: 42 }}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text3)", display: "flex", padding: 4
              }}
            >
              <Icon name={showPw ? "eyeoff" : "eye"} size={15} />
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          className="btn btn-primary w-full"
          style={{ justifyContent: "center", padding: "11px", marginTop: 8, fontSize: 14 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: "2px" }} /> Signing in...</>
            : "Sign In"
          }
        </button>

        <div style={{ textAlign: "center", marginTop: 22, color: "var(--text3)", fontSize: 12 }}>
          Demo:{" "}
          <span
            style={{ color: "var(--accent2)", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => { setEmail("admin@test.com"); setPassword("123456"); }}
          >
            admin@test.com / 123456
          </span>
        </div>
      </div>
    </div>
  );
}