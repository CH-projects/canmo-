import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Plus } from 'lucide-react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('cs_invoices');
    if (saved) setInvoices(JSON.parse(saved));
  }, []);

  const addPlaceholder = () => {
    const today = new Date();
    const inv = {
      id: Date.now(),
      number: `INV-${Math.floor(Math.random() * 10000)}`,
      customer: `Client Corp ${Math.floor(Math.random() * 100)}`,
      date: format(today, 'yyyy-MM-dd'),
      dueDate: format(addDays(today, 30), 'yyyy-MM-dd'),
      amount: Math.floor(Math.random() * 5000) + 500,
      status: ['PENDING', 'PAID', 'OVERDUE'][Math.floor(Math.random() * 3)]
    };
    
    const newRecord = [...invoices, inv];
    setInvoices(newRecord);
    localStorage.setItem('cs_invoices', JSON.stringify(newRecord));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <button className="btn btn-primary" onClick={addPlaceholder}>
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td><strong>{inv.number}</strong></td>
                <td>{inv.customer}</td>
                <td>{inv.date}</td>
                <td>{inv.dueDate}</td>
                <td style={{ fontWeight: 'bold' }}>Rs {inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>
                  <span className={`badge ${
                    inv.status === 'PAID' ? 'badge-active' :
                    inv.status === 'OVERDUE' ? 'badge-inactive' :
                    'badge-warning'
                  }`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No invoices generated.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
