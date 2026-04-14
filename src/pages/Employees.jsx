import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';

const emptyForm = {
  name: '',
  department: '',
  role: '',
  salary: ''
};

const fieldStyle = {
  width: '100%',
  background: 'rgba(15, 23, 42, 0.75)',
  color: 'var(--text-main)',
  border: '1px solid var(--glass-border)',
  borderRadius: '10px',
  padding: '0.75rem 0.9rem',
  font: 'inherit'
};

const syncEmployeesStore = (employees) => {
  localStorage.setItem('cs_employees', JSON.stringify(employees));
};

const normalizeEmployee = (employee) => ({
  id: employee.id,
  code: employee.code || `EMP${String(employee.id).padStart(3, '0')}`,
  name: employee.name,
  department: employee.department,
  role: employee.position || employee.role || 'Associate',
  salary: Number(employee.salary || 0),
  active: employee.active !== 0
});

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadEmployees = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/employees');
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Unable to load employees.');
      }

      const normalized = payload.data.map(normalizeEmployee);
      setEmployees(normalized);
      syncEmployeesStore(normalized);
    } catch (err) {
      setError(err.message || 'Unable to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name.trim(),
          department: form.department.trim(),
          position: form.role.trim(),
          salary: Number(form.salary || 0)
        })
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Unable to save employee.');
      }

      const nextEmployees = [...employees, normalizeEmployee(payload.employee)];
      setEmployees(nextEmployees);
      syncEmployeesStore(nextEmployees);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || 'Unable to save employee.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <button className="btn" onClick={loadEmployees} disabled={loading} style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-main)' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', alignItems: 'end' }}>
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Name</span>
            <input
              required
              name="name"
              onChange={handleChange}
              placeholder="Employee name"
              style={fieldStyle}
              value={form.name}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Department</span>
            <input
              required
              name="department"
              onChange={handleChange}
              placeholder="Department"
              style={fieldStyle}
              value={form.department}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Role</span>
            <input
              required
              name="role"
              onChange={handleChange}
              placeholder="Role or position"
              style={fieldStyle}
              value={form.role}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Salary</span>
            <input
              min="0"
              name="salary"
              onChange={handleChange}
              placeholder="Salary"
              step="0.01"
              style={fieldStyle}
              type="number"
              value={form.salary}
            />
          </label>

          <button className="btn btn-primary" disabled={saving} type="submit" style={{ justifyContent: 'center', minHeight: '46px' }}>
            <Plus size={18} /> {saving ? 'Saving...' : 'Add Employee'}
          </button>
        </form>

        {error && (
          <p style={{ color: '#fca5a5', marginTop: '1rem' }}>{error}</p>
        )}
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td><strong>{emp.code}</strong></td>
                <td>{emp.name}</td>
                <td>{emp.department}</td>
                <td>{emp.role}</td>
                <td>Rs {emp.salary.toLocaleString()}</td>
                <td>
                  <span className={`badge ${emp.active ? 'badge-active' : 'badge-inactive'}`}>
                    {emp.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}

            {!loading && employees.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No employees found in the database.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  Loading employees...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
