// pages/SubmissionsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { submissionsAPI } from "../api/index.js";
import { Icon, Spinner, Badge, Modal, Confirm, Empty } from "../components/UI.jsx";

const STATUSES = ["Pending", "Response", "Interview", "Rejected"];
const TODAY = new Date().toISOString().split("T")[0];

export default function SubmissionsPage({ user, toast }) {
  const canWrite = user.role === "owner" || user.role === "bidder";

  const [subs,        setSubs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(false);
  const [confirm,     setConfirm]     = useState(null);
  const [filter,      setFilter]      = useState("all");
  const [updatingId,  setUpdatingId]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [form,        setForm]        = useState({ company: "", position: "", date: TODAY });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(() => {
    setLoading(true);
    submissionsAPI.getAll()
      .then((data) => setSubs(Array.isArray(data) ? data : []))
      .catch((e)   => toast(e.message, "error"))
      .finally(()  => setLoading(false));
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, []); // eslint-disable-line

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.company.trim())  { toast("Company name required", "error"); return; }
    if (!form.position.trim()) { toast("Position required",     "error"); return; }
    setSaving(true);
    try {
      await submissionsAPI.create({
        company:  form.company.trim(),
        position: form.position.trim(),
        date:     form.date || TODAY,
      });
      toast("Submission logged!", "success");
      setModal(false);
      setForm({ company: "", position: "", date: TODAY });
      load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Update status ─────────────────────────────────────────────────────────
  const handleStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await submissionsAPI.updateStatus(id, status);
      toast("Status updated", "success");
      load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (s) => {
    try {
      await submissionsAPI.delete(s._id);
      toast("Submission deleted", "success");
      setConfirm(null);
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const todayCount   = subs.filter((s) => (s.date || "").startsWith(TODAY)).length;
  const target       = 10;
  const interviews   = subs.filter((s) => s.status === "Interview").length;
  const responses    = subs.filter((s) => s.status === "Response").length;
  const responseRate = subs.length
    ? Math.round(((interviews + responses) / subs.length) * 100) : 0;

  const displayed = filter === "all"
    ? subs
    : subs.filter((s) => s.status === filter);

  if (loading) return <div className="loading-center"><Spinner lg /></div>;

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="ph">
        <div>
          <div className="ph-title">Resume Submissions</div>
          <div className="ph-sub">Track daily targets and application responses</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <Icon name="refresh" size={13} />
          </button>
          {canWrite && (
            <button
              className="btn btn-primary"
              onClick={() => { setForm({ company: "", position: "", date: TODAY }); setModal(true); }}
            >
              <Icon name="plus" size={15} /> Log Submission
            </button>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, padding: "14px 26px" }}>
        {[
          { label: "Today",         val: todayCount,        sub: `/ ${target} target`,  color: "var(--accent)" },
          { label: "Total",         val: subs.length,       sub: "All time",            color: "var(--blue)"   },
          { label: "Interviews",    val: interviews,        sub: "Got called back",     color: "var(--green)"  },
          { label: "Response Rate", val: `${responseRate}%`,sub: "Overall",             color: "var(--amber)"  },
        ].map((k, i) => (
          <div key={i} className="card card-sm" style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>{k.label}</div>
            <div style={{ color: "var(--text3)", fontSize: 11.5, marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Daily progress bar */}
      <div style={{ padding: "0 26px 14px" }}>
        <div className="card card-sm">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>Today's Target Progress</span>
            <span style={{ fontWeight: 600, color: todayCount >= target ? "var(--green)" : "var(--amber)" }}>
              {todayCount} / {target}{todayCount >= target ? " ✓ Target Hit!" : ""}
            </span>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{
              width: `${Math.min((todayCount / target) * 100, 100)}%`,
              background: todayCount >= target ? "var(--green)" : "var(--accent)"
            }} />
          </div>
        </div>
      </div>

      {/* Filter + Table */}
      <div className="section">
        <div className="section-hd">
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["all", ...STATUSES].map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setFilter(s)}
              >
                {s} ({s === "all" ? subs.length : subs.filter((x) => x.status === s).length})
              </button>
            ))}
          </div>
          <span style={{ color: "var(--text3)", fontSize: 12 }}>{displayed.length} entries</span>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {displayed.length === 0 ? (
            <Empty icon="upload" title="No submissions yet" sub="Start logging your resume submissions" />
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Company</th>
                    <th>Position</th>
                    <th>Date</th>
                    <th>Status</th>
                    {canWrite && <th>Update</th>}
                    {user.role === "owner" && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((s, idx) => (
                    <tr key={s._id}>
                      <td style={{ color: "var(--text3)", width: 36 }}>{idx + 1}</td>
                      <td className="strong">{s.company}</td>
                      <td>{s.position}</td>
                      <td>
                        {s.date ? new Date(s.date).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td><Badge label={s.status || "Pending"} /></td>
                      {canWrite && (
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <select
                              className="form-input"
                              style={{ padding: "4px 8px", fontSize: 12, width: "auto" }}
                              value={s.status || "Pending"}
                              onChange={(e) => handleStatus(s._id, e.target.value)}
                              disabled={updatingId === s._id}
                            >
                              {STATUSES.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                            {updatingId === s._id && <Spinner />}
                          </div>
                        </td>
                      )}
                      {user.role === "owner" && (
                        <td>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirm(s)}>
                            <Icon name="trash" size={12} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <Modal title="Log New Submission" onClose={() => setModal(false)}>
          <div className="form-group">
            <label className="form-label">Company *</label>
            <input
              className="form-input"
              placeholder="Google, Infosys, Wipro…"
              value={form.company}
              onChange={set("company")}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Position *</label>
            <input
              className="form-input"
              placeholder="Frontend Developer, React Engineer…"
              value={form.position}
              onChange={set("position")}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              value={form.date}
              onChange={set("date")}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? <><Spinner /> Saving…</> : "Log Submission"}
            </button>
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm
          message={`Delete submission for ${confirm.company}?`}
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}