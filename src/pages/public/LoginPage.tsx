import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';

const inp: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit',
  background: '#fff', color: '#0f172a', boxSizing: 'border-box', transition: 'border .15s',
};
const F = (e: any) => e.target.style.borderColor = '#f97316';
const B = (e: any) => e.target.style.borderColor = '#e2e8f0';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const redirectByRole = (role: string) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin')      navigate('/admin/dashboard');
    else if (r === 'client') navigate('/client/dashboard');
    else                    navigate('/freelancer/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Enter your email and password'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.message || j.detail || 'Invalid email or password');
        setLoading(false); return;
      }

      const data = await res.json();
      // Store token + user info for all pages to use
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role || '');
      localStorage.setItem('user', JSON.stringify({
        email,
        role:   data.role,
        userId: data.userId || data.id || 0,
        name:   data.name || data.fullName || '',
      }));

      redirectByRole(data.role);
    } catch {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#f97316,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={14} color="#fff" fill="#fff"/></div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>WorkSupport <span style={{ color: '#f97316' }}>360</span></span>
        </button>
        <button onClick={() => navigate('/register')} style={{ fontSize: 13, fontWeight: 600, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
          New here? <span style={{ color: '#f97316' }}>Create account →</span>
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ background: '#fff', borderRadius: 22, padding: '36px 32px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
            {/* Logo in card */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#f97316,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}>
                <Zap size={24} color="#fff" fill="#fff"/>
              </div>
            </div>
            <h1 style={{ fontWeight: 900, fontSize: 24, color: '#0f172a', textAlign: 'center', margin: '12px 0 6px', letterSpacing: '-0.03em' }}>Welcome back</h1>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', margin: '0 0 26px' }}>Sign in to your WorkSupport 360 account</p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 7 }}>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" style={inp} onFocus={F} onBlur={B}/>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 7 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" style={{ ...inp, paddingRight: 44 }} onFocus={F} onBlur={B}/>
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ padding: '13px', borderRadius: 13, background: loading ? '#f1f5f9' : 'linear-gradient(135deg,#f97316,#ef4444)', color: loading ? '#94a3b8' : '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 16px rgba(249,115,22,0.35)', marginTop: 4 }}>
                {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }}/> Signing in…</> : 'Sign in →'}
              </button>
            </form>

            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #f8fafc', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
              Don't have an account?{' '}
              <button onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f97316', fontWeight: 700, fontSize: 13 }}>
                Create one →
              </button>
            </div>

            {/* Dev hint */}
            <div style={{ marginTop: 16, background: '#f8fafc', borderRadius: 10, padding: '10px 14px', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
              Admin: admin@worksupport360.com · Admin@123!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
