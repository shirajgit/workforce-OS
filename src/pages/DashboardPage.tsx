// pages/DashboardPage.jsx
import { useState, useEffect } from "react";
import { dashboardAPI } from "../api/index.js";
import { Icon, Spinner, Badge } from "../components/UI.jsx";

const StatCard = ({ icon, iconColor, iconBg, label, value, meta, delay = 0 }) => (
  <div className="stat-card" style={{ animationDelay: `${delay}s` }}>
    <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
      <Icon name={icon} size={18} />
    </div>
    <div className="stat-val" style={{ color: iconColor }}>{value}</div>
    <div className="stat-lbl">{label}</div>
    {meta && <div className="stat-meta">{meta}</div>}
  </div>
);

const BarChart = ({ data, color = "var(--accent)" }) => {
  const max = Math.max(...data.map((d) => d.val), 1);
  return (
    <div>
      <div className="bar-chart">
        {data.map((d, i) => (
          <div
            key={i}
            className="bar"
            style={{ height: `${(d.val / max) * 100}%`, background: color }}
            title={`${d.label}: ${d.val}`}
          />
        ))}
      </div>
      <div className="bar-labels">
        {data.map((d, i) => (
          <div key={i} className="bar-label">{d.label}</div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardAPI.getStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><Spinner lg /></div>;

  if (error) return (
    <div className="section">
      <div className="alert alert-error"><Icon name="alert" size={15} /> {error}</div>
    </div>
  );

  const u = stats?.users || {};
  const t = stats?.tasks || {};

  // Build chart data from stats
  const taskChart = [
    { label: "Done", val: t.completed || 0 },
    { label: "WIP", val: t.inProgress || 0 },
    { label: "Late", val: t.overdue || 0 },
    { label: "New", val: (t.total || 0) - (t.completed || 0) - (t.inProgress || 0) - (t.overdue || 0) },
  ];

  const userChart = [
    { label: "Dev", val: u.developers || 0 },
    { label: "Caller", val: u.callers || 0 },
    { label: "Bidder", val: u.bidders || 0 },
  ];

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="ph">
        <div>
          <div className="ph-title">Dashboard</div>
          <div className="ph-sub">Your workforce at a glance · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
        <div className="ph-actions">
          <span className="badge badge-green" style={{ padding: "5px 12px" }}>
            <span style={{ width: 6, height: 6, background: "var(--green)", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            Live
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard icon="users" iconColor="var(--accent2)" iconBg="rgba(108,99,255,0.14)" label="Total Users" value={u.total ?? 0} meta={`${u.active ?? 0} active`} delay={0} />
        <StatCard icon="tasks" iconColor="var(--blue)" iconBg="var(--blue-dim)" label="Total Tasks" value={t.total ?? 0} meta={`${t.inProgress ?? 0} in progress`} delay={0.04} />
        <StatCard icon="check_circle" iconColor="var(--green)" iconBg="var(--green-dim)" label="Completed" value={t.completed ?? 0} meta="Tasks done" delay={0.08} />
        <StatCard icon="alert" iconColor="var(--red)" iconBg="var(--red-dim)" label="Overdue" value={t.overdue ?? 0} meta="Need attention" delay={0.12} />
        <StatCard icon="upload" iconColor="var(--amber)" iconBg="var(--amber-dim)" label="Submissions" value={stats?.submissions?.total ?? 0} meta="Total logged" delay={0.16} />
        <StatCard icon="phone" iconColor="var(--blue)" iconBg="var(--blue-dim)" label="Interviews" value={stats?.interviews?.total ?? 0} meta={`${stats?.interviews?.offers ?? 0} offers`} delay={0.2} />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "0 26px 16px" }}>
        <div className="card">
          <div className="section-hd">
            <div className="section-title">Task Breakdown</div>
            <Badge label="Tasks" variant="badge-blue" />
          </div>
          <BarChart data={taskChart} color="var(--accent)" />
        </div>
        <div className="card">
          <div className="section-hd">
            <div className="section-title">Team Composition</div>
            <Badge label="Roles" variant="badge-purple" />
          </div>
          <BarChart data={userChart} color="var(--green)" />
        </div>
      </div>

      {/* Progress bars */}
      <div className="section">
        <div className="card">
          <div className="section-title" style={{ marginBottom: 18 }}>Task Progress Overview</div>
          {[
            { label: "Completion Rate", val: t.completed, total: t.total, color: "var(--green)" },
            { label: "In Progress", val: t.inProgress, total: t.total, color: "var(--accent)" },
            { label: "Overdue Rate", val: t.overdue, total: t.total, color: "var(--red)" },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: i < 2 ? 16 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12.5 }}>
                <span style={{ color: "var(--text2)" }}>{item.label}</span>
                <span style={{ color: item.color, fontWeight: 600 }}>{item.val ?? 0} / {item.total ?? 0}</span>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${item.total ? ((item.val ?? 0) / item.total) * 100 : 0}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}