import React, { useState } from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';

const readStoredList = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export default function Payroll() {
  const [employees] = useState(() => readStoredList('cs_employees'));
  const [payrollRuns, setPayrollRuns] = useState(() => readStoredList('cs_payroll'));
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const generatePayroll = () => {
    // Ported business logic from PayrollService.java
    const workingDays = 22; // Hardcoded default for example, usually dynamic
    
    // In a real app we'd fetch actual attendance. For demo, we simulate
    const newRun = employees.map(emp => {
      const presentDays = Math.floor(Math.random() * 5) + 18; // Fake data 18-22
      const absentDays = workingDays - presentDays;
      
      const dailyRate = emp.salary / workingDays;
      const deduction = absentDays * dailyRate;
      const netSalary = emp.salary - deduction;
      
      return {
        id: Number(`${currentYear}${String(currentMonth).padStart(2, '0')}${String(emp.id).padStart(4, '0')}`),
        employeeId: emp.id,
        employeeName: emp.name,
        month: currentMonth,
        year: currentYear,
        workingDays,
        presentDays,
        absentDays,
        grossSalary: emp.salary,
        deductionAmount: deduction,
        netSalary: netSalary
      };
    });

    setPayrollRuns(newRun);
    localStorage.setItem('cs_payroll', JSON.stringify(newRun));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Payroll Management</h1>
        <button className="btn btn-primary" onClick={generatePayroll}>
          Generate Payroll ({format(new Date(), 'MMMM yyyy')})
        </button>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Period</th>
              <th>Days (Total/Present/Absent)</th>
              <th>Gross Amount</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payrollRuns.map(run => (
              <tr key={run.id}>
                <td><strong>{run.employeeName}</strong></td>
                <td>{run.month}/{run.year}</td>
                <td>{run.workingDays} / {run.presentDays} / {run.absentDays}</td>
                <td>Rs {run.grossSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td style={{ color: 'var(--danger)' }}>-Rs {run.deductionAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                  Rs {run.netSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </td>
                <td>
                  <button className="btn" style={{ background: 'rgba(255,255,255,0.1)' }}><Download size={16} /> Payslip</button>
                </td>
              </tr>
            ))}
            {payrollRuns.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No payroll generated for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
