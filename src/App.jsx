import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Users, Calendar, Banknote, Receipt, Coins, FileText, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Expenses from './pages/Expenses';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <span className="logo-icon">C</span>
              <h1>Canmo System</h1>
            </div>
          </div>
          <nav className="nav-menu">
            <Link to="/" className="nav-item">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/employees" className="nav-item">
              <Users size={20} />
              <span>Employees</span>
            </Link>
            <Link to="/attendance" className="nav-item">
              <Calendar size={20} />
              <span>Attendance</span>
            </Link>
            <Link to="/payroll" className="nav-item">
              <Banknote size={20} />
              <span>Payroll</span>
            </Link>
            <Link to="/expenses" className="nav-item">
              <Receipt size={20} />
              <span>Expenses</span>
            </Link>
            <Link to="/invoices" className="nav-item">
              <Coins size={20} />
              <span>Invoices</span>
            </Link>
            <Link to="/reports" className="nav-item">
              <FileText size={20} />
              <span>Reports</span>
            </Link>
          </nav>
        </aside>
        
        <main className="main-content">
          <header className="topbar">
            <h2>Attendance & Accounting System</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="user-profile">Admin</div>
              <button 
                onClick={() => setIsAuthenticated(false)} 
                title="Logout"
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: 'none', 
                  color: 'var(--danger)', 
                  padding: '0.5rem', 
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>
          
          <div className="page-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/payroll" element={<Payroll />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
