import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([
    { id: 1, code: 'EMP001', name: 'John Doe', department: 'Engineering', role: 'Senior Developer', salary: 120000, active: true }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('cs_employees');
    if (saved) {
      setEmployees(JSON.parse(saved));
    }
  }, []);

  const saveEmployees = (newEmployees) => {
    setEmployees(newEmployees);
    localStorage.setItem('cs_employees', JSON.stringify(newEmployees));
  };

  const addPlaceholder = () => {
    const newEmp = {
      id: Date.now(),
      code: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      name: 'New Employee',
      department: 'Sales',
      role: 'Associate',
      salary: 60000,
      active: true
    };
    saveEmployees([...employees, newEmp]);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <button className="btn btn-primary" onClick={addPlaceholder}>
          <Plus size={18} /> Add Employee
        </button>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
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
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                      <Edit2 size={16} />
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
