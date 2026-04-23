// pages/UsersPage.jsx
import { useState, useEffect, useCallback } from "react";
import { usersAPI } from "../api/index.js";
import { Icon, Spinner, Badge, Avatar, Modal, Confirm, Empty } from "../components/UI.jsx";

const ROLES = ["developer", "caller", "bidder"];

export default function UsersPage({ toast }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);   // null | "create" | user obj
  const [confirm, setConfirm] = useState(null);   // user to delete
  const [form, setForm]       = useState({ name: "", email: "", password: "", role: "developer" });
  const [saving, setSaving]   = useState(false);
  const [filter, setFilter]   = useState("all");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = useCallback(() => {
    setLoading(true);
    usersAPI.getAll()
      .then(setUsers)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { toast("All fields required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password.trim(),
      };
      await usersAPI.create(payload);
      toast("User created!", "success");
      setModal(null);
      load();
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleToggle = async (u) => {
    try {
      await usersAPI.update(u._id, { status: u.status === "active" ? "inactive" : "active" });
      toast("User updated", "success");
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const handleDelete = async (u) => {
    try {
      await usersAPI.delete(u._id);
      toast("User deleted", "success");
      setConfirm(null);
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const filtered = filter === "all" ? users : users.filter((u) => u.role === filter);

  const openCreate = () => {
    setForm({ name: "", email: "", password: "", role: "developer" });
    setModal("create");
  };

  return (
    <div className="fade-up">
      <div className="ph">
        <div>
          <div className="ph-title">User Management</div>
          <div className="ph-sub">Manage team members, roles and access</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus" size={15} /> Add User
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ padding: "14px 26px 0", display: "flex", gap: 6 }}>
        {["all", "developer", "caller", "bidder"].map((r) => (
          <button
            key={r}
            className={`btn btn-sm ${filter === r ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter(r)}
            style={{ textTransform: "capitalize" }}
          >
            {r} {r === "all" ? `(${users.length})` : `(${users.filter((u) => u.role === r).length})`}
          </button>
        ))}
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={load}>
          <Icon name="refresh" size={13} />
        </button>
      </div>

      <div className="section">
        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-center"><Spinner lg /></div>
          ) : filtered.length === 0 ? (
            <Empty icon="users" title="No users found" sub="Create your first team member" />
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u._id}>
                      <td className="strong">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={u.name} size="sm" />
                          {u.name}
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td><Badge label={u.role} /></td>
                      <td><Badge label={u.status || "active"} /></td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className={`btn btn-sm ${u.status === "active" ? "btn-ghost" : "btn-success"}`}
                            onClick={() => handleToggle(u)}
                          >
                            {u.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirm(u)}>
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {modal === "create" && (
        <Modal title="Add New User" onClose={() => setModal(null)}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="John Doe" value={form.name} onChange={set("name")} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="john@company.com" value={form.email} onChange={set("email")} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set("password")} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={form.role} onChange={set("role")}>
              {ROLES.map((r) => <option key={r} value={r} style={{ textTransform: "capitalize" }}>{r}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? <Spinner /> : "Create User"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <Confirm
          message={`Delete ${confirm.name}? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}