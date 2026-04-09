import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';

const REPORT_LABELS = {
  finance: 'Finance Report',
  attendance: 'Attendance Report',
  payroll: 'Payroll Report'
};

const formatCurrency = (value) =>
  `Rs ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const readStoredList = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
};

export default function Reports() {
  const [searchParams] = useSearchParams();
  const requestedType = searchParams.get('type');
  const [reportType, setReportType] = useState(
    REPORT_LABELS[requestedType] ? requestedType : 'finance'
  );
  const [reportContent, setReportContent] = useState('');

  const reportData = useMemo(() => {
    const employees = readStoredList('cs_employees');
    const attendance = readStoredList('cs_attendance');
    const payroll = readStoredList('cs_payroll');
    const expenses = readStoredList('cs_expenses');
    const invoices = readStoredList('cs_invoices');

    return { employees, attendance, payroll, expenses, invoices };
  }, []);

  const buildFinanceReport = () => {
    const totalExpenses = reportData.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalInvoiced = reportData.invoices.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const outstanding = reportData.invoices
      .filter((item) => item.status !== 'PAID')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const invoiceLines = reportData.invoices.length > 0
      ? reportData.invoices.map((item) =>
          `${item.number} | ${item.customer} | Total: ${formatCurrency(item.amount)} | Status: ${item.status}`
        )
      : ['No invoices recorded.'];

    const expenseLines = reportData.expenses.length > 0
      ? reportData.expenses.map((item) =>
          `${item.date} | ${item.category} | ${item.description} | ${formatCurrency(item.amount)}`
        )
      : ['No expenses recorded.'];

    return [
      'FINANCE REPORT',
      `Date: ${format(new Date(), 'yyyy-MM-dd')}`,
      '',
      `Total Expenses: ${formatCurrency(totalExpenses)}`,
      `Total Invoiced: ${formatCurrency(totalInvoiced)}`,
      `Outstanding Receivables: ${formatCurrency(outstanding)}`,
      '',
      'Invoices',
      ...invoiceLines,
      '',
      'Expenses',
      ...expenseLines
    ].join('\n');
  };

  const buildAttendanceReport = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayAttendance = reportData.attendance.filter((item) => item.date === today);

    const lines = reportData.employees.length > 0
      ? reportData.employees.map((employee) => {
          const record = todayAttendance.find((item) => item.employeeId === employee.id);
          return [
            employee.code,
            employee.name,
            record?.status || 'UNMARKED',
            record?.checkIn || '-'
          ].join(' | ');
        })
      : ['No employees available.'];

    return [
      'ATTENDANCE REPORT',
      `Date: ${today}`,
      '',
      ...lines
    ].join('\n');
  };

  const buildPayrollReport = () => {
    const lines = reportData.payroll.length > 0
      ? reportData.payroll.map((item) =>
          [
            item.employeeName,
            `Gross: ${formatCurrency(item.grossSalary)}`,
            `Deduction: ${formatCurrency(item.deductionAmount)}`,
            `Net: ${formatCurrency(item.netSalary)}`,
            `Present: ${item.presentDays}`,
            `Absent: ${item.absentDays}`
          ].join(' | ')
        )
      : ['No payroll generated yet.'];

    return [
      'PAYROLL REPORT',
      `Date: ${format(new Date(), 'yyyy-MM-dd')}`,
      '',
      ...lines
    ].join('\n');
  };

  const generateReport = (type = reportType) => {
    if (type === 'attendance') {
      setReportContent(buildAttendanceReport());
      return;
    }

    if (type === 'payroll') {
      setReportContent(buildPayrollReport());
      return;
    }

    setReportContent(buildFinanceReport());
  };

  useEffect(() => {
    if (REPORT_LABELS[requestedType]) {
      setReportType(requestedType);
      generateReport(requestedType);
      return;
    }

    generateReport(reportType);
  }, [requestedType]);

  const downloadReport = () => {
    const content = reportContent.trim() ? reportContent : buildFinanceReport();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => generateReport()}>
            <FileText size={18} /> Generate Report
          </button>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-main)' }} onClick={downloadReport}>
            <Download size={18} /> Download Report
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="report-type" style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Report Type
        </label>
        <select
          id="report-type"
          value={reportType}
          onChange={(event) => setReportType(event.target.value)}
          style={{
            width: '100%',
            maxWidth: '320px',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            background: 'rgba(15, 23, 42, 0.9)',
            color: 'var(--text-main)'
          }}
        >
          <option value="finance">Finance Report</option>
          <option value="attendance">Attendance Report</option>
          <option value="payroll">Payroll Report</option>
        </select>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Report Preview</h3>
        <pre
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: "'Courier New', monospace",
            color: 'var(--text-main)',
            lineHeight: 1.7
          }}
        >
          {reportContent}
        </pre>
      </div>
    </div>
  );
}
