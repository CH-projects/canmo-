import React, { useState } from 'react';
import { format } from 'date-fns';

const readStoredList = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export default function Attendance() {
  const [employees] = useState(() => readStoredList('cs_employees'));
  const [records, setRecords] = useState(() => readStoredList('cs_attendance'));
  const today = format(new Date(), 'yyyy-MM-dd');

  const markAttendance = (empId, status) => {
    const existing = records.find(r => r.employeeId === empId && r.date === today);
    let newRecords;
    
    if (existing) {
      newRecords = records.map(r => r.id === existing.id ? { ...r, status } : r);
    } else {
      const nextId = records.reduce((maxId, record) => Math.max(maxId, Number(record.id) || 0), 0) + 1;
      newRecords = [...records, { 
        id: nextId, employeeId: empId, date: today, status, checkIn: format(new Date(), 'HH:mm')
      }];
    }
    
    setRecords(newRecords);
    localStorage.setItem('cs_attendance', JSON.stringify(newRecords));
  };

  const getStatus = (empId) => {
    const record = records.find(r => r.employeeId === empId && r.date === today);
    return record ? record.status : 'UNMARKED';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Daily Attendance</h1>
        <div className="badge badge-warning" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
          {format(new Date(), 'MMMM d, yyyy')}
        </div>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.filter(e => e.active).map(emp => {
              const status = getStatus(emp.id);
              return (
                <tr key={emp.id}>
                  <td><strong>{emp.name}</strong><br/><small style={{color: 'var(--text-muted)'}}>{emp.code}</small></td>
                  <td>{emp.department}</td>
                  <td>
                    <span className={`badge ${
                      status === 'PRESENT' ? 'badge-active' : 
                      status === 'ABSENT' ? 'badge-inactive' : 
                      status === 'LEAVE' ? 'badge-warning' : ''
                    }`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }} onClick={() => markAttendance(emp.id, 'PRESENT')}>Present</button>
                      <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} onClick={() => markAttendance(emp.id, 'ABSENT')}>Absent</button>
                      <button className="btn" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }} onClick={() => markAttendance(emp.id, 'LEAVE')}>Leave</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {employees.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No active employees to mark attendance for.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
