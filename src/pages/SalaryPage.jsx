// pages/SalaryPage.jsx — Fixed markPaid, uses useApi + useApiMutation hooks
import { useState } from "react";
import { paymentsAPI, usersAPI } from "../api/index.ts";
import { useApi, useApiMutation } from "../hooks/useApi.js";
import { Icon, Spinner, Badge, Modal, Confirm, Empty } from "../components/UI.jsx";

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const CUR_MONTH = `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`;

// Bonus calculation per role
const calcBonus = (role, metrics = {}) => {
  if (role === "developer") return (metrics.tasks       || 0) * 200;
  if (role === "caller")    return (metrics.offers      || 0) * 1500;
  if (role === "bidder")    return (metrics.submissions || 0) * 30;
  return 0;
};

const isPaymentPaid = (payment = {}) => {
  const status = String(payment.status || "").toLowerCase();
  return status === "paid" || Boolean(payment.isPaid);
};

export default function SalaryPage({ user, toast }) {
  // ── Data ─────────────────────────────────────────────────────────────────
  const {
    data: payments = [], loading, refetch
  } = useApi(() => paymentsAPI.getAll());

  const {
    data: allUsers = []
  } = useApi(() => usersAPI.getAll());

  const { execute } = useApiMutation();
  const paymentRows = Array.isArray(payments) ? payments : [];
  const userRows = Array.isArray(allUsers) ? allUsers : [];

  // ── Local state ───────────────────────────────────────────────────────────
  const [modal,   setModal]   = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [paying,  setPaying]  = useState(null);
  const [form,    setForm]    = useState({
    userId: "", role: "", baseSalary: "",
    month: CUR_MONTH,
    metrics: { tasks: 0, offers: 0, submissions: 0 },
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMetric = (k) => (e) => setForm((f) => ({
    ...f, metrics: { ...f.metrics, [k]: Number(e.target.value) }
  }));

  const handleUserSelect = (e) => {
    const u = userRows.find((x) => x._id === e.target.value);
    setForm((f) => ({ ...f, userId: e.target.value, role: u?.role || "" }));
  };

  // ── Create payment ────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.userId)     { toast("Select a team member", "error"); return; }
    if (!form.baseSalary) { toast("Enter base salary",    "error"); return; }
    setSaving(true);
    const result = await execute(
      () => paymentsAPI.create({
        userId:     form.userId,
        role:       form.role,
        baseSalary: Number(form.baseSalary),
        metrics:    form.metrics,
        month:      form.month,
      }),
      {
        onSuccess: () => { toast("Payment record created!", "success"); setModal(false); refetch(); },
        onError:   (e) => toast(e, "error"),
      }
    );
    setSaving(false);
  };

  // ── Mark paid — FIX: was calling wrong method before ─────────────────────
  const handleMarkPaid = async (p) => {
    setPaying(p._id);
    const result = await execute(
      () => paymentsAPI.markPaid(p._id),  // PATCH /payments/:id/pay
      {
        onSuccess: () => { toast(`${p.user?.name || "User"} marked as paid ✓`, "success"); refetch(); },
        onError:   (e) => toast(e, "error"),
      }
    );
    setPaying(null);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (p) => {
    await execute(
      () => paymentsAPI.delete(p._id),
      {
        onSuccess: () => { toast("Record deleted", "success"); setConfirm(null); refetch(); },
        onError:   (e) => toast(e, "error"),
      }
    );
  };

  // ── Summaries ─────────────────────────────────────────────────────────────
  const totalBase   = paymentRows.reduce((a, p) => a + (p.baseSalary || 0), 0);
  const totalBonus  = paymentRows.reduce((a, p) => a + calcBonus(p.role, p.metrics), 0);
  const totalPay    = totalBase + totalBonus;
  const pendingCnt  = paymentRows.filter((p) => !isPaymentPaid(p)).length;

  const teamMembers = userRows.filter((u) => u.role !== "owner");

  if (loading) return <div className="loading-center"><Spinner lg /></div>;

  return (
    <div className="fade-up">
      <div className="ph">
        <div>
          <div className="ph-title">Salary & Payments</div>
          <div className="ph-sub">Monthly payout tracking with auto-calculated performance bonuses</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost btn-sm" onClick={refetch}><Icon name="refresh" size={13} /></button>
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Export CSV</button>
          <button className="btn btn-primary" onClick={() => {
            setForm({ userId: "", role: "", baseSalary: "", month: CUR_MONTH, metrics: { tasks: 0, offers: 0, submissions: 0 } });
            setModal(true);
          }}>
            <Icon name="plus" size={15} /> Add Record
          </button>
        </div>
      </div>

      {/* KPI summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, padding: "14px 26px" }}>
        {[
          { label: "Total Base",      val: `₹${totalBase.toLocaleString("en-IN")}`,  color: "var(--text)"   },
          { label: "Total Bonus",     val: `₹${totalBonus.toLocaleString("en-IN")}`, color: "var(--green)"  },
          { label: "Total Payout",    val: `₹${totalPay.toLocaleString("en-IN")}`,   color: "var(--accent)" },
          { label: "Pending Payments",val: pendingCnt,                               color: "var(--amber)"  },
        ].map((s, i) => (
          <div key={i} className="card card-sm" style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ color: "var(--text2)", fontSize: 12.5, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bonus rules banner */}
      <div style={{ padding: "0 26px 14px" }}>
        <div className="card card-sm" style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0 }}>
            Bonus Rules
          </div>
          {[
            { role: "Developer", rule: "₹200 / task",        color: "var(--blue)"   },
            { role: "Caller",    rule: "₹1,500 / offer",     color: "var(--amber)"  },
            { role: "Bidder",    rule: "₹30 / submission",   color: "var(--green)"  },
          ].map((r, i) => (
            <div key={i} style={{ fontSize: 12.5, display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: r.color }}>{r.role}:</span>
              <span style={{ color: "var(--text2)" }}>{r.rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="section">
        <div className="card" style={{ padding: 0 }}>
          {paymentRows.length === 0 ? (
            <Empty icon="dollar" title="No payment records" sub="Add salary records for your team members" />
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Month</th>
                    <th>Base</th>
                    <th>Performance</th>
                    <th>Bonus</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRows.map((p) => {
                    const bonus = calcBonus(p.role, p.metrics);
                    const total = (p.baseSalary || 0) + bonus;
                    const m     = p.metrics || {};
                    const isPaid = isPaymentPaid(p);
                    return (
                      <tr key={p._id}>
                        <td className="strong">{p.user?.name || "—"}</td>
                        <td><Badge label={p.role || "—"} /></td>
                        <td style={{ color: "var(--text2)" }}>{p.month}</td>
                        <td>₹{(p.baseSalary || 0).toLocaleString("en-IN")}</td>
                        <td style={{ color: "var(--text3)", fontSize: 12.5 }}>
                          {p.role === "developer" && `${m.tasks       || 0} tasks`}
                          {p.role === "caller"    && `${m.offers      || 0} offers`}
                          {p.role === "bidder"    && `${m.submissions || 0} subs`}
                          {!p.role               && "—"}
                        </td>
                        <td style={{ color: "var(--green)", fontWeight: 600 }}>
                          +₹{bonus.toLocaleString("en-IN")}
                        </td>
                        <td style={{ fontFamily: "Syne", fontWeight: 700 }}>
                          ₹{total.toLocaleString("en-IN")}
                        </td>
                        <td>
                          <Badge label={isPaid ? "Paid" : "Unpaid"} />
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            {!isPaid && (
                              <button
                                className="btn btn-success btn-sm"
                                style={{ fontSize: 11.5 }}
                                onClick={() => handleMarkPaid(p)}
                                disabled={paying === p._id}
                              >
                                {paying === p._id
                                  ? <><Spinner /> Saving…</>
                                  : <><Icon name="check_circle" size={12} /> Mark Paid</>
                                }
                              </button>
                            )}
                            {isPaid && (
                              <span style={{ color: "var(--green)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                                <Icon name="check_circle" size={13} /> Paid
                              </span>
                            )}
                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirm(p)}>
                              <Icon name="trash" size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {modal && (
        <Modal title="Add Payment Record" lg onClose={() => setModal(false)}>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Team Member *</label>
              <select className="form-input" value={form.userId} onChange={handleUserSelect}>
                <option value="">— Select member —</option>
                {teamMembers.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Month</label>
              <input className="form-input" placeholder={CUR_MONTH} value={form.month} onChange={set("month")} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Base Salary (₹) *</label>
            <input className="form-input" type="number" min="0" placeholder="25000" value={form.baseSalary} onChange={set("baseSalary")} />
          </div>

          {form.role && (
            <div className="form-group">
              <label className="form-label">
                {form.role === "developer" && "Tasks Completed"}
                {form.role === "caller"    && "Offers Received"}
                {form.role === "bidder"    && "Resumes Submitted"}
              </label>
              <input
                className="form-input"
                type="number" min="0"
                placeholder="0"
                value={
                  form.role === "developer" ? form.metrics.tasks
                  : form.role === "caller"  ? form.metrics.offers
                  : form.metrics.submissions
                }
                onChange={
                  form.role === "developer" ? setMetric("tasks")
                  : form.role === "caller"  ? setMetric("offers")
                  : setMetric("submissions")
                }
              />
              {form.baseSalary && (
                <div style={{ fontSize: 12, color: "var(--green)", marginTop: 5, fontWeight: 500 }}>
                  Bonus: ₹{calcBonus(form.role, form.metrics).toLocaleString("en-IN")} →
                  Total: ₹{(Number(form.baseSalary) + calcBonus(form.role, form.metrics)).toLocaleString("en-IN")}
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? <><Spinner /> Creating…</> : "Create Record"}
            </button>
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm
          message={`Delete payment record for ${confirm.user?.name || "this user"}? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}