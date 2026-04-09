import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('cs_expenses');
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  const addPlaceholder = () => {
    const newExp = {
      id: Date.now(),
      date: format(new Date(), 'yyyy-MM-dd'),
      category: ['Office Supplies', 'Utilities', 'Software', 'Travel'][Math.floor(Math.random() * 4)],
      description: 'Monthly subscription or purchase',
      amount: Math.floor(Math.random() * 500) + 50
    };

    const newRecord = [...expenses, newExp];
    setExpenses(newRecord);
    localStorage.setItem('cs_expenses', JSON.stringify(newRecord));
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <button className="btn btn-primary" onClick={addPlaceholder}>
          <Plus size={18} /> Record Expense
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'inline-block', minWidth: '200px' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Expenses</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--danger)' }}>
            RS {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id}>
                <td>{exp.date}</td>
                <td><span className="badge badge-warning" style={{ background: 'rgba(255,255,255,0.1)' }}>{exp.category}</span></td>
                <td>{exp.description}</td>
                <td style={{ fontWeight: 'bold' }}>Rs {exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No expenses recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
