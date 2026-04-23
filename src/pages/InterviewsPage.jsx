// pages/InterviewsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { interviewsAPI } from "../api/index.js";
import { Icon, Spinner, Badge, Avatar, Modal, Confirm, Empty } from "../components/UI.jsx";

const STAGES = [
  "Recruiter Interview",
  "HR Interview",
  "Technical Interview 1",
  "Technical Interview 2",
  "Technical Interview 3",
  "Final Interview",
  "Offer / Rejected",
];

const STAGE_COLORS = [
  "var(--blue)", "var(--accent)", "var(--amber)",
  "var(--amber)", "var(--amber)", "var(--green)", "var(--green)",
];

export default function InterviewsPage({ user, toast }) {
  const isOwner  = user.role === "owner";
  const isCaller = user.role === "caller";
  const canWrite = isOwner || isCaller;

  const [candidates, setCandidates] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [modal,      setModal]      = useState(false);
  const [confirm,    setConfirm]    = useState(null);
  const [form,       setForm]       = useState({ name: "", company: "", salary: "", notes: "" });
  const [saving,     setSaving]     = useState(false);
  const [advancing,  setAdvancing]  = useState(null);
  const [filter,     setFilter]     = useState("all");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = useCallback(() => {
    setLoading(true);
    interviewsAPI.getAll()
      .then(setCandidates)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.name) { toast("Candidate name required", "error"); return; }
    setSaving(true);
    try {
      await interviewsAPI.create(form);
      toast("Candidate added!", "success");
      setModal(false);
      load();
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleAdvance = async (c) => {
    setAdvancing(c._id);
    try {
      const updated = await interviewsAPI.advance(c._id);
      toast("Stage advanced!", "success");
      load();
      setSelected((s) => s?._id === c._id ? { ...s, stage: (s.stage || 0) + 1 } : s);
    } catch (e) { toast(e.message, "error"); }
    finally { setAdvancing(null); }
  };

  const handleDelete = async (c) => {
    try {
      await interviewsAPI.delete(c._id);
      toast("Candidate removed", "success");
      setConfirm(null);
      setSelected(null);
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const displayed = filter === "all" ? candidates
    : filter === "offers" ? candidates.filter((c) => c.stage >= 6)
    : candidates.filter((c) => `Stage ${(c.stage || 0) + 1}` === filter);

  if (loading) return <div className="loading-center"><Spinner lg /></div>;

  return (
    <div className="fade-up">
      <div className="ph">
        <div>
          <div className="ph-title">Interview Pipeline</div>
          <div className="ph-sub">
            {candidates.length} candidates · {candidates.filter((c) => (c.stage || 0) >= 6).length} offers received
          </div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <Icon name="refresh" size={13} />
          </button>
          {canWrite && (
            <button className="btn btn-primary" onClick={() => { setForm({ name: "", company: "", salary: "", notes: "" }); setModal(true); }}>
              <Icon name="plus" size={15} /> Add Candidate
            </button>
          )}
        </div>
      </div>

      {/* Stage funnel overview */}
      <div style={{ padding: "0 26px 16px" }}>
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="section-title" style={{ marginBottom: 14 }}>Pipeline Stages</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 0 }}>
            {STAGES.map((s, i) => {
              const count = candidates.filter((c) => (c.stage || 0) === i).length;
              return (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontFamily: "Syne", fontWeight: 800, color: STAGE_COLORS[i] }}>{count}</div>
                  <div style={{
                    height: 6, background: STAGE_COLORS[i], opacity: count > 0 ? 1 : 0.2,
                    marginBottom: 6, borderRadius: i === 0 ? "4px 0 0 4px" : i === STAGES.length - 1 ? "0 4px 4px 0" : 0
                  }} />
                  <div style={{ fontSize: 9.5, color: "var(--text3)", lineHeight: 1.3 }}>{s.split(" ").slice(0, 2).join(" ")}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14, padding: "0 26px 26px" }}>
        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {candidates.length === 0 ? (
            <div className="card"><Empty icon="phone" title="No candidates yet" sub="Add your first candidate to the pipeline" /></div>
          ) : candidates.map((c) => {
            const stage = c.stage || 0;
            return (
              <div
                key={c._id}
                onClick={() => setSelected(c)}
                style={{
                  background: "var(--bg2)", border: `1px solid ${selected?._id === c._id ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "var(--r)", padding: "13px 16px", cursor: "pointer", transition: "all 0.18s",
                  display: "flex", alignItems: "center", gap: 14
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: STAGE_COLORS[stage], display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#fff", flexShrink: 0
                }}>
                  {stage + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</div>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 1 }}>
                    {c.company || "—"} · {c.date ? new Date(c.date).toLocaleDateString("en-IN") : new Date(c.createdAt || Date.now()).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="badge" style={{ background: `${STAGE_COLORS[stage]}22`, color: STAGE_COLORS[stage], borderRadius: 20, padding: "2px 8px", fontSize: 11 }}>
                    {STAGES[stage].split(" ").slice(0, 2).join(" ")}
                  </span>
                  {c.salary && <span style={{ color: "var(--text2)", fontSize: 12 }}>{c.salary}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail */}
        <div>
          {selected ? (
            <div className="card" style={{ position: "sticky", top: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16 }}>{selected.name}</div>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>{selected.company || "—"}</div>
                </div>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(null)}>
                  <Icon name="close" size={13} />
                </button>
              </div>

              {/* Stage progress */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Stage {(selected.stage || 0) + 1} / 7
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div className="progress-bar" style={{ width: `${(((selected.stage || 0) + 1) / 7) * 100}%`, background: STAGE_COLORS[selected.stage || 0] }} />
                </div>
                <div style={{ fontSize: 12, color: STAGE_COLORS[selected.stage || 0], marginTop: 6, fontWeight: 600 }}>
                  {STAGES[selected.stage || 0]}
                </div>
              </div>

              <div className="divider" />
              <div className="info-row"><span className="info-key">Salary</span><span className="info-val">{selected.salary || "—"}</span></div>
              <div className="info-row"><span className="info-key">Notes</span><span className="info-val" style={{ fontSize: 12, textAlign: "right", maxWidth: 160 }}>{selected.notes || "—"}</span></div>

              {canWrite && (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {(selected.stage || 0) < 6 && (
                    <button
                      className="btn btn-primary"
                      style={{ justifyContent: "center" }}
                      onClick={() => handleAdvance(selected)}
                      disabled={advancing === selected._id}
                    >
                      {advancing === selected._id ? <Spinner /> : <><Icon name="arrow_right" size={14} /> Advance Stage</>}
                    </button>
                  )}
                  {(selected.stage || 0) === 6 && (
                    <div className="alert alert-success" style={{ marginBottom: 0 }}>
                      <Icon name="check_circle" size={15} /> Offer stage reached!
                    </div>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirm(selected)}>
                    <Icon name="trash" size={13} /> Remove Candidate
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
              <Icon name="phone" size={36} color="var(--text3)" />
              <div style={{ color: "var(--text3)", fontSize: 13, marginTop: 10 }}>Select a candidate to view details</div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {modal && (
        <Modal title="Add Candidate" onClose={() => setModal(false)}>
          <div className="form-group">
            <label className="form-label">Candidate Name *</label>
            <input className="form-input" placeholder="Full name" value={form.name} onChange={set("name")} />
          </div>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Company</label>
              <input className="form-input" placeholder="TechCorp" value={form.company} onChange={set("company")} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Salary Offered</label>
              <input className="form-input" placeholder="₹10 LPA" value={form.salary} onChange={set("salary")} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Notes</label>
            <textarea className="form-input" placeholder="Candidate notes..." value={form.notes} onChange={set("notes")} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? <Spinner /> : "Add Candidate"}
            </button>
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm
          message={`Remove ${confirm.name} from the pipeline?`}
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}