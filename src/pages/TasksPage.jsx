// pages/TasksPage.jsx
import { useState, useEffect, useCallback } from "react";
import { tasksAPI, usersAPI } from "../api/index.ts";
import { Icon, Spinner, Badge, Modal, Confirm, Empty } from "../components/UI.jsx";

const STATUS_COLS = [
  { id: "assigned",    label: "Assigned",    color: "var(--blue)" },
  { id: "in-progress", label: "In Progress", color: "var(--amber)" },
  { id: "completed",   label: "Completed",   color: "var(--green)" },
  { id: "failed",      label: "Failed",      color: "var(--red)" },
];

export default function TasksPage({ user, toast }) {
  const isOwner = user.role === "owner";
  const isDev   = user.role === "developer";

  const [tasks,   setTasks]   = useState([]);
  const [devs,    setDevs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);  // null | "create" | task obj
  const [confirm, setConfirm] = useState(null);
  const [detail,  setDetail]  = useState(null);  // task to show detail panel
  const [form,    setForm]    = useState({ title: "", description: "", assignedTo: "", deadline: "" });
  const [saving,  setSaving]  = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = useCallback(() => {
    setLoading(true);
    tasksAPI.getAll()
      .then(setTasks)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
    if (isOwner) {
      usersAPI.getAll()
        .then((u) => setDevs(u.filter((x) => x.role === "developer")))
        .catch(() => {});
    }
  }, [load, isOwner]);

  const handleCreate = async () => {
    if (!form.title) { toast("Title required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || undefined,
        deadline: form.deadline || undefined,
      };
      await tasksAPI.create(payload);
      toast("Task created!", "success");
      setModal(null);
      load();
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await tasksAPI.updateStatus(id, status);
      toast("Status updated", "success");
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const handleDelete = async (t) => {
    try {
      await tasksAPI.delete(t._id);
      toast("Task deleted", "success");
      setConfirm(null);
      setDetail(null);
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const isOverdue = (deadline) => deadline && new Date(deadline) < new Date();

  const openCreate = () => {
    setForm({ title: "", description: "", assignedTo: "", deadline: "" });
    setModal("create");
  };

  if (loading) return <div className="loading-center"><Spinner lg /></div>;

  return (
    <div className="fade-up">
      <div className="ph">
        <div>
          <div className="ph-title">{isOwner ? "Task Management" : "My Tasks"}</div>
          <div className="ph-sub">
            {tasks.length} total · {tasks.filter((t) => t.status === "completed").length} completed
          </div>
        </div>
        <div className="ph-actions">
          {isOwner && (
            <button className="btn btn-primary" onClick={openCreate}>
              <Icon name="plus" size={15} /> New Task
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", overflow: "hidden" }}>
        {/* Kanban */}
        <div style={{ flex: 1, padding: "14px 26px 26px", overflow: "auto" }}>
          <div className="kanban" style={{ gridTemplateColumns: "repeat(4,minmax(200px,1fr))" }}>
            {STATUS_COLS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div key={col.id} className="kb-col">
                  <div className="kb-hd">
                    <span className="kb-title" style={{ color: col.color }}>{col.label}</span>
                    <span className="kb-count">{colTasks.length}</span>
                  </div>
                  <div className="kb-body">
                    {colTasks.length === 0 ? (
                      <div style={{ color: "var(--text3)", fontSize: 11.5, textAlign: "center", padding: "18px 0" }}>
                        Empty
                      </div>
                    ) : colTasks.map((t) => (
                      <div
                        key={t._id}
                        className="task-card"
                        onClick={() => setDetail(t)}
                        style={{ borderColor: detail?._id === t._id ? col.color : undefined }}
                      >
                        <div className="task-card-title">{t.title}</div>
                        {t.description && (
                          <div className="task-card-desc">{t.description.slice(0, 55)}{t.description.length > 55 ? "…" : ""}</div>
                        )}
                        <div className="task-card-meta">
                          {t.deadline && (
                            <>
                              <Icon name="calendar" size={10} />
                              <span style={{ color: isOverdue(t.deadline) ? "var(--red)" : undefined }}>
                                {new Date(t.deadline).toLocaleDateString("en-IN")}
                              </span>
                            </>
                          )}
                          {t.assignedTo?.name && (
                            <span style={{ marginLeft: "auto", background: "var(--surface)", padding: "1px 6px", borderRadius: 10 }}>
                              {t.assignedTo.name}
                            </span>
                          )}
                        </div>
                        {/* Developer actions */}
                        {isDev && col.id === "assigned" && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ marginTop: 8, fontSize: 11 }}
                            onClick={(e) => { e.stopPropagation(); handleStatus(t._id, "in-progress"); }}
                          >
                            Start Task
                          </button>
                        )}
                        {isDev && col.id === "in-progress" && (
                          <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
                            <button className="btn btn-success btn-sm" style={{ fontSize: 11 }}
                              onClick={(e) => { e.stopPropagation(); handleStatus(t._id, "completed"); }}>
                              Complete
                            </button>
                            <button className="btn btn-danger btn-sm" style={{ fontSize: 11 }}
                              onClick={(e) => { e.stopPropagation(); handleStatus(t._id, "failed"); }}>
                              Failed
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        {detail && (
          <div style={{
            width: 280, borderLeft: "1px solid var(--border)", background: "var(--bg2)",
            padding: 20, overflowY: "auto", flexShrink: 0,
            animation: "slideIn 0.25s ease"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14 }}>Task Detail</div>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setDetail(null)}>
                <Icon name="close" size={13} />
              </button>
            </div>
            <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{detail.title}</div>
            <Badge label={detail.status} />
            {detail.description && (
              <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>{detail.description}</div>
            )}
            <div className="divider" />
            {detail.assignedTo?.name && (
              <div className="info-row">
                <span className="info-key">Assigned</span>
                <span className="info-val">{detail.assignedTo.name}</span>
              </div>
            )}
            {detail.deadline && (
              <div className="info-row">
                <span className="info-key">Deadline</span>
                <span className="info-val" style={{ color: isOverdue(detail.deadline) ? "var(--red)" : undefined }}>
                  {new Date(detail.deadline).toLocaleDateString("en-IN")}
                </span>
              </div>
            )}
            {detail.createdAt && (
              <div className="info-row">
                <span className="info-key">Created</span>
                <span className="info-val">{new Date(detail.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
            )}
            {isOwner && (
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                  Change Status
                </div>
                {STATUS_COLS.filter((c) => c.id !== detail.status).map((c) => (
                  <button
                    key={c.id}
                    className="btn btn-ghost btn-sm"
                    style={{ justifyContent: "flex-start", color: c.color, borderColor: "rgba(255,255,255,0.08)" }}
                    onClick={() => { handleStatus(detail._id, c.id); setDetail((d) => ({ ...d, status: c.id })); }}
                  >
                    → {c.label}
                  </button>
                ))}
                <div className="divider" />
                <button className="btn btn-danger btn-sm" onClick={() => setConfirm(detail)}>
                  <Icon name="trash" size={13} /> Delete Task
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modal === "create" && (
        <Modal title="Create Task" onClose={() => setModal(null)}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Build landing page..." value={form.title} onChange={set("title")} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="Task details..." value={form.description} onChange={set("description")} />
          </div>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Assign To</label>
              <select className="form-input" value={form.assignedTo} onChange={set("assignedTo")}>
                <option value="">Select developer</option>
                {devs.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Deadline</label>
              <input className="form-input" type="date" value={form.deadline} onChange={set("deadline")} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? <Spinner /> : "Create Task"}
            </button>
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm
          message={`Delete "${confirm.title}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}