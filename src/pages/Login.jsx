import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Use a relative path. In development it uses the Vite proxy, in production it hits the Express server directly.
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLogin();
      } else {
        setError(data.error || 'Invalid username or password');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Failed to connect to the server');
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-icon" style={{ margin: '0 auto 1rem', width: '64px', height: '64px', fontSize: '2rem' }}>
            <Lock size={32} color="white" />
          </div>
          <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', background: 'default', WebkitTextFillColor: 'initial', color: 'white' }}>Login to Canmo</h2>
          <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to continue</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Demo credentials: admin / password123</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}

            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 0.75rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.875rem', fontSize: '1rem' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
