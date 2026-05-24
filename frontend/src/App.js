import React, { useState, useEffect, useCallback } from "react";
import { employeeAPI } from "./services/api";
import "./App.css";

// ─── Constants ────────────────────────────────────────────────────
const DEPARTMENTS = ["Engineering", "Marketing", "HR", "Finance", "Operations", "Sales", "Design"];
const DESIGNATIONS = {
  Engineering: ["Junior Developer", "Senior Developer", "Tech Lead", "Engineering Manager"],
  Marketing: ["Marketing Executive", "Marketing Manager", "Brand Strategist"],
  HR: ["HR Executive", "HR Specialist", "HR Manager"],
  Finance: ["Financial Analyst", "Accountant", "Finance Manager"],
  Operations: ["Operations Executive", "Operations Manager"],
  Sales: ["Sales Executive", "Sales Manager", "Account Manager"],
  Design: ["UI Designer", "UX Designer", "Design Lead"],
};

const EMPTY_FORM = {
  first_name: "", last_name: "", email: "", phone: "",
  department: "", designation: "", salary: "", date_of_joining: "", status: "Active",
};

// ─── Stat Card ─────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent }) => (
  <div className={`stat-card stat-${accent}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
);

// ─── Modal ─────────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// ─── Employee Form ──────────────────────────────────────────────────
const EmployeeForm = ({ initial = EMPTY_FORM, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  useEffect(() => { setForm(initial); setErrors({}); }, [initial]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p, [name]: value,
      ...(name === "department" ? { designation: "" } : {}),
    }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "Required";
    if (!form.last_name.trim()) e.last_name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.department) e.department = "Required";
    if (!form.designation) e.designation = "Required";
    if (!form.salary || isNaN(form.salary) || Number(form.salary) <= 0) e.salary = "Enter a valid salary";
    if (!form.date_of_joining) e.date_of_joining = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => { if (validate()) onSubmit(form); };

  const Field = ({ name, label, type = "text", children }) => (
    <div className="form-field">
      <label>{label}</label>
      {children || (
        <input
          type={type} name={name} value={form[name]}
          onChange={handle} placeholder={label}
          className={errors[name] ? "error" : ""}
        />
      )}
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="emp-form">
      <div className="form-grid">
        <Field name="first_name" label="First Name" />
        <Field name="last_name" label="Last Name" />
        <Field name="email" label="Email Address" type="email" />
        <Field name="phone" label="Phone Number" />
        <Field name="department" label="Department">
          <select name="department" value={form.department} onChange={handle} className={errors.department ? "error" : ""}>
            <option value="">-- Select Department --</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field name="designation" label="Designation">
          <select name="designation" value={form.designation} onChange={handle}
            disabled={!form.department} className={errors.designation ? "error" : ""}>
            <option value="">-- Select Designation --</option>
            {(DESIGNATIONS[form.department] || []).map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field name="salary" label="Salary (₹)" type="number" />
        <Field name="date_of_joining" label="Date of Joining" type="date" />
        <Field name="status" label="Status">
          <select name="status" value={form.status} onChange={handle}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </Field>
      </div>
      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={loading}>
          {loading ? "Saving…" : "Save Employee"}
        </button>
      </div>
    </div>
  );
};

// ─── Main App ───────────────────────────────────────────────────────
export default function App() {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [modal, setModal]         = useState(null); // null | 'add' | 'edit' | 'view' | 'delete'
  const [selected, setSelected]   = useState(null);
  const [toast, setToast]         = useState(null);
  const [filters, setFilters]     = useState({ search: "", department: "", status: "" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, statsRes] = await Promise.all([
        employeeAPI.getAll(filters),
        employeeAPI.getStats(),
      ]);
      setEmployees(empRes.data.data);
      setStats(statsRes.data.data);
    } catch {
      showToast("Failed to load data. Is the server running?", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  const closeModal = () => { setModal(null); setSelected(null); };

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await employeeAPI.create(data);
      showToast("Employee added successfully!");
      closeModal();
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add employee", "error");
    } finally { setFormLoading(false); }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      await employeeAPI.update(selected.id, data);
      showToast("Employee updated successfully!");
      closeModal();
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update employee", "error");
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await employeeAPI.remove(selected.id);
      showToast("Employee deleted successfully!");
      closeModal();
      loadData();
    } catch {
      showToast("Failed to delete employee", "error");
    } finally { setFormLoading(false); }
  };

  const fmtSalary = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const fmtDate   = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="app">
      {/* ── Toast ── */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">👥</div>
          <div>
            <h1>EmpTrack</h1>
            <span>Employee Information Management System</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("add")}>
          + Add Employee
        </button>
      </header>

      <main className="app-main">
        {/* ── Stats ── */}
        {stats && (
          <section className="stats-row">
            <StatCard icon="👤" label="Total Employees"  value={stats.total}      accent="blue" />
            <StatCard icon="✅" label="Active"           value={stats.active}     accent="green" />
            <StatCard icon="⛔" label="Inactive"         value={stats.inactive}   accent="red" />
            <StatCard icon="💰" label="Avg. Salary"      value={fmtSalary(stats.avg_salary)} accent="gold" />
          </section>
        )}

        {/* ── Filters ── */}
        <section className="filters-bar">
          <input
            className="filter-search" placeholder="🔍 Search by name or email…"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
          />
          <select value={filters.department}
            onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button className="btn btn-outline" onClick={loadData}>Refresh</button>
        </section>

        {/* ── Table ── */}
        <section className="table-section">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading employees…</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="empty-state">
              <p>😕 No employees found.</p>
              <button className="btn btn-primary" onClick={() => setModal("add")}>Add First Employee</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Email</th>
                    <th>Salary</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, i) => (
                    <tr key={emp.id}>
                      <td className="td-num">{i + 1}</td>
                      <td className="td-name">
                        <div className="emp-avatar">{emp.first_name[0]}{emp.last_name[0]}</div>
                        <span>{emp.first_name} {emp.last_name}</span>
                      </td>
                      <td><span className="dept-badge">{emp.department}</span></td>
                      <td>{emp.designation}</td>
                      <td className="td-email">{emp.email}</td>
                      <td className="td-salary">{fmtSalary(emp.salary)}</td>
                      <td>{fmtDate(emp.date_of_joining)}</td>
                      <td>
                        <span className={`status-badge status-${emp.status.toLowerCase()}`}>{emp.status}</span>
                      </td>
                      <td className="td-actions">
                        <button className="act-btn view-btn"  title="View"
                          onClick={() => { setSelected(emp); setModal("view"); }}>👁</button>
                        <button className="act-btn edit-btn"  title="Edit"
                          onClick={() => { setSelected(emp); setModal("edit"); }}>✏️</button>
                        <button className="act-btn del-btn"   title="Delete"
                          onClick={() => { setSelected(emp); setModal("delete"); }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* ── Add Modal ── */}
      <Modal isOpen={modal === "add"} onClose={closeModal} title="Add New Employee">
        <EmployeeForm onSubmit={handleCreate} onCancel={closeModal} loading={formLoading} />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={modal === "edit"} onClose={closeModal} title="Edit Employee">
        {selected && (
          <EmployeeForm
            initial={{ ...selected, date_of_joining: selected.date_of_joining?.slice(0, 10) }}
            onSubmit={handleUpdate} onCancel={closeModal} loading={formLoading}
          />
        )}
      </Modal>

      {/* ── View Modal ── */}
      <Modal isOpen={modal === "view"} onClose={closeModal} title="Employee Details">
        {selected && (
          <div className="emp-detail">
            <div className="detail-avatar">{selected.first_name[0]}{selected.last_name[0]}</div>
            <h3>{selected.first_name} {selected.last_name}</h3>
            <p className="detail-role">{selected.designation} · {selected.department}</p>
            <div className="detail-grid">
              {[
                ["📧 Email",      selected.email],
                ["📞 Phone",      selected.phone || "—"],
                ["💰 Salary",     fmtSalary(selected.salary)],
                ["📅 Joined",     fmtDate(selected.date_of_joining)],
                ["🔖 Status",     selected.status],
              ].map(([k, v]) => (
                <div key={k} className="detail-row">
                  <span className="detail-key">{k}</span>
                  <span className="detail-val">{v}</span>
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={closeModal}>Close</button>
              <button className="btn btn-primary" onClick={() => setModal("edit")}>Edit</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={modal === "delete"} onClose={closeModal} title="Confirm Delete">
        {selected && (
          <div className="confirm-delete">
            <div className="confirm-icon">⚠️</div>
            <p>Are you sure you want to delete <strong>{selected.first_name} {selected.last_name}</strong>?</p>
            <p className="confirm-sub">This action cannot be undone.</p>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={formLoading}>
                {formLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
