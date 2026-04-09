import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Coins, Receipt, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon, trend }) => (
  <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</h3>
        <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem' }}>{value}</p>
      </div>
      <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
        {icon}
      </div>
    </div>
    {trend && (
      <div style={{ fontSize: '0.875rem', color: trend.startsWith('+') ? 'var(--success)' : 'var(--text-muted)' }}>
        {trend}
      </div>
    )}
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <button className="btn btn-primary" onClick={() => navigate('/reports?type=finance')}>
          Generate Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Total Employees" value="24" icon={<Users size={24} color="var(--primary)" />} trend="+2 this month" />
        <StatCard title="Present Today" value="21" icon={<TrendingUp size={24} color="var(--success)" />} trend="87% attendance rate" />
        <StatCard title="Total Payroll" value="Rs142,500" icon={<Coins size={24} color="var(--secondary)" />} trend="Last month" />
        <StatCard title="Pending Invoices" value="8" icon={<Receipt size={24} color="var(--warning)" />} trend="3 overdue" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Recent Activity</h3>
          <p style={{ color: 'var(--text-muted)' }}>Implement real activity log here.</p>
        </div>
      </div>
    </div>
  );
}
