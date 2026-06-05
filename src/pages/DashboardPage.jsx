// pages/DashboardPage.jsx

import { useState, useEffect } from "react";
import { dashboardAPI } from "../api";
import { Icon, Spinner, Badge } from "../components/UI";
import CountUp from "react-countup";
import "./DashboardPage.css";


const StatCard = ({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  meta,
  trend,
}) => (
  <div className="stat-card">
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div
        className="stat-icon"
        style={{
          background: iconBg,
          color: iconColor,
        }}
      >
        <Icon name={icon} size={20} />
      </div>

      {trend && (
        <div
          style={{
            background: "rgba(16,185,129,.12)",
            color: "var(--green)",
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {trend}
        </div>
      )}
    </div>

    <div
      className="stat-val"
      style={{
        color: iconColor,
        marginTop: 14,
      }}
    >
      {value}
    </div>

    <div className="stat-lbl">{label}</div>

    {meta && <div className="stat-meta">{meta}</div>}
  </div>
);

const BarChart = ({
  data,
  color = "var(--accent)",
}) => {
  const max = Math.max(
    ...data.map((d) => d.val),
    1
  );

  return (
    <div>
      <div className="bar-chart">
        {data.map((d, i) => (
          <div
            key={i}
            className="bar"
            title={`${d.label}: ${d.val}`}
            style={{
              height: `${(d.val / max) * 100}%`,
              background: color,
            }}
          />
        ))}
      </div>

      <div className="bar-labels">
        {data.map((d, i) => (
          <div
            key={i}
            className="bar-label"
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProgressItem = ({
  label,
  value,
  total,
  color,
}) => {
  const percentage = total
    ? (value / total) * 100
    : 0;

  return (
    <div
      style={{
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            color: "var(--text2)",
            fontSize: 13,
          }}
        >
          {label}
        </span>

        <span
          style={{
            color,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="progress">
        <div
          className="progress-bar"
          style={{
            width: `${percentage}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    dashboardAPI
      .getStats()
      .then(setStats)
      .catch((e) =>
        setError(
          e?.message ||
            "Failed to load dashboard"
        )
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  if (loading)
    return (
      <div className="loading-center">
        <Spinner lg />
      </div>
    );

  if (error)
    return (
      <div className="section">
        <div className="alert alert-error">
          <Icon
            name="alert"
            size={16}
          />
          {error}
        </div>
      </div>
    );

  const u = stats?.users || {};
  const t = stats?.tasks || {};

  const completionRate =
    t.total > 0
      ? Math.round(
          (t.completed / t.total) *
            100
        )
      : 0;

  const taskChart = [
    {
      label: "Done",
      val: t.completed || 0,
    },
    {
      label: "WIP",
      val: t.inProgress || 0,
    },
    {
      label: "Late",
      val: t.overdue || 0,
    },
    {
      label: "New",
      val:
        (t.total || 0) -
        (t.completed || 0) -
        (t.inProgress || 0) -
        (t.overdue || 0),
    },
  ];

  const userChart = [
    {
      label: "Dev",
      val: u.developers || 0,
    },
    {
      label: "Caller",
      val: u.callers || 0,
    },
    {
      label: "Bidder",
      val: u.bidders || 0,
    },
  ];

  return (
    <div className="fade-up">
      {/* HERO */}

      <div className="ph">
        <div>
          <div className="ph-title">
            Workmax Dashboard
          </div>

          <div className="ph-sub">
            Monitor your
            Workmax,
            productivity,
            interviews and
            project health
            in real-time.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Badge
            label="Live"
            variant="badge-green"
          />

          <Badge
            label={`${completionRate}% Completed`}
            variant="badge-blue"
          />
        </div>
        
      </div>

       

      {/* KPI CARDS */}

      <div className="stat-grid">
        <StatCard
          icon="users"
          iconColor="var(--accent)"
          iconBg="rgba(108,99,255,.15)"
          label="Total Users"
          value={u.total || 0}
          meta={`${u.active || 0} Active Users`}
          trend="+12%"
        />

        <StatCard
          icon="tasks"
          iconColor="var(--blue)"
          iconBg="var(--blue-dim)"
          label="Tasks"
          value={t.total || 0}
          meta={`${t.inProgress || 0} Running`}
          trend="+8%"
        />

        <StatCard
          icon="check_circle"
          iconColor="var(--green)"
          iconBg="var(--green-dim)"
          label="Completed"
          value={t.completed || 0}
          meta="Successfully Done"
        />

        <StatCard
          icon="alert"
          iconColor="var(--red)"
          iconBg="var(--red-dim)"
          label="Overdue"
          value={t.overdue || 0}
          meta="Need Attention"
        />

        <StatCard
          icon="upload"
          iconColor="var(--amber)"
          iconBg="var(--amber-dim)"
          label="Submissions"
          value={
            stats?.submissions
              ?.total || 0
          }
          meta="Total Logged"
        />

        <StatCard
          icon="phone"
          iconColor="var(--blue)"
          iconBg="var(--blue-dim)"
          label="Interviews"
          value={
            stats?.interviews
              ?.total || 0
          }
          meta={`${
            stats?.interviews
              ?.offers || 0
          } Offers`}
        />
      </div>

      {/* CHARTS */}

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 24,
    padding: "0 24px 24px",
  }}
>
        <div className="card">
          <div className="section-hd">
            <div className="section-title">
              Task Breakdown
            </div>

            <Badge
              label="Tasks"
              variant="badge-blue"
            />
          </div>

          <BarChart
            data={taskChart}
            color="linear-gradient(180deg,#6c63ff,#8b5cf6)"
          />
        </div>

        <div className="card">
          <div className="section-hd">
            <div className="section-title">
              Team Composition
            </div>

            <Badge
              label="Roles"
              variant="badge-purple"
            />
          </div>

          <BarChart
            data={userChart}
            color="var(--green)"
          />
        </div>
      </div>

      {/* BOTTOM GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1.2fr .8fr",
          gap: 18,
          padding:
            "0 24px 24px",
        }}
      >
        <div className="card">
          <div
            className="section-title"
            style={{
              marginBottom: 20,
            }}
          >
            Task Progress
          </div>

          <ProgressItem
            label="Completion"
            value={
              t.completed || 0
            }
            total={t.total || 0}
            color="var(--green)"
          />

          <ProgressItem
            label="In Progress"
            value={
              t.inProgress || 0
            }
            total={t.total || 0}
            color="var(--accent)"
          />

          <ProgressItem
            label="Overdue"
            value={
              t.overdue || 0
            }
            total={t.total || 0}
            color="var(--red)"
          />
        </div>

        <div className="card">
          <div
            className="section-title"
            style={{
              marginBottom: 20,
            }}
          >
            Recent Activity
          </div>

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: 16,
            }}
          >
            <div>
              ✅ New task
              assigned
            </div>

            <div>
              👤 User joined
              team
            </div>

            <div>
              📞 Interview
              completed
            </div>

            <div>
              🚀 Submission
              received
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}