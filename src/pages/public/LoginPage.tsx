import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Shield, Zap, Users, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../store/authStore';

const roles: { role: UserRole; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { role: 'client', label: 'Client', desc: 'Hire experts & manage projects', icon: <Users size={18}/>, color: 'border-green-300 bg-green-50 text-green-700' },
  { role: 'freelancer', label: 'Freelancer', desc: 'Work on projects, earn money', icon: <Zap size={18}/>, color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { role: 'admin', label: 'Admin', desc: 'Manage the entire platform', icon: <Shield size={18}/>, color: 'border-purple-300 bg-purple-50 text-purple-700' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithEmail, loginWithGoogle, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [notVerified, setNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [activeSession, setActiveSession] = useState<{lastLogin:string;sessionCount:string;email:string}|null>(null);
  const [forceLogging, setForceLogging] = useState(false);

  // Handle URL params on load
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      const em = searchParams.get('email') || '';
      if (em) setEmail(decodeURIComponent(em));
      toast.success('✅ Email verified! You can now log in.', { duration: 5000 });
    }
    if (searchParams.get('registered') === 'true') {
      const em = decodeURIComponent(searchParams.get('email') || '');
      setRegisteredEmail(em);
      if (em) setEmail(em);
      setJustRegistered(true);
    }
  }, [searchParams]);

  const handleForceLogin = async () => {
    if (!activeSession) return;
    setForceLogging(true);
    try {
      const { default: axiosLib } = await import('axios');
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const res = await axiosLib.post(`${apiUrl}/api/auth/force-login`, { email, password, deviceInfo: navigator.userAgent });
      const { accessToken, refreshToken, role, name, userId, picture } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', role); localStorage.setItem('name', name);
      localStorage.setItem('userId', userId);
      if (picture) localStorage.setItem('picture', picture);
      setActiveSession(null);
      toast.success('✅ Previous session ended. Logged in successfully!');
      redirect(role as any);
    } catch (err: any) {
      toast.error('Force login failed. Please try again.');
    } finally { setForceLogging(false); }
  };

  const redirect = (role: UserRole) => {
    // Check if there's a returnTo param (e.g. user was booking quick support)
    const returnTo = searchParams.get('returnTo');
    const pendingAction = localStorage.getItem('pendingAction');
    
    if (returnTo && pendingAction) {
      // Go back to home page — pending action will auto-resume
      navigate(returnTo);
      return;
    }
    // Normal redirect to dashboard
    if ((role as string) === 'agent') { navigate('/agent'); return; }
    if (role === 'admin') navigate('/admin');
    else if (role === 'freelancer') navigate('/freelancer');
    else navigate('/client');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Enter email and password'); return; }
    try {
      await loginWithEmail(email, password);
      const role = localStorage.getItem('userRole') as UserRole;
      redirect(role);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Exchange the auth code for an ID token via backend
        const result = await loginWithGoogle(response.access_token);
        const role = localStorage.getItem('userRole') as UserRole;
        if (result?.isNewUser) toast.success('Welcome to WorkSupport360!');
        redirect(role);
      } catch {
        toast.error('Google sign-in failed. Please try again.');
      }
    },
    onError: () => toast.error('Google sign-in was cancelled'),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex">
      {/* Left hero */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute border border-white rounded-full"
              style={{ width:`${(i+1)*80}px`, height:`${(i+1)*80}px`, top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-white font-bold text-2xl">Work<span className="text-orange-400">Support</span><span className="opacity-60">360</span></div>
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors">
            <ArrowLeft size={14}/> Back to home
          </button>
        </div>
        <div>
          <h1 className="text-4xl font-semibold text-white leading-tight mb-5">
            India's first<br/><span className="text-orange-400">identity-safe</span><br/>talent platform
          </h1>
          <p className="text-blue-200 text-base leading-relaxed mb-8">
            Connect with 1,200+ verified MNC professionals. Their company identity stays private — your project stays delivered.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[['1,240+','Verified experts'],['98%','Satisfaction'],['$2.4M','Paid out']].map(([n,l]) => (
              <div key={l} className="bg-white bg-opacity-10 rounded-xl p-3 text-center">
                <div className="text-white font-bold text-xl">{n}</div>
                <div className="text-blue-200 text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-blue-300 text-xs">© 2025 WorkSupport360</div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="text-2xl font-bold text-gray-900 mb-1">Welcome back</div>
              <div className="text-sm text-gray-500">Sign in to your WorkSupport360 account</div>
            </div>

            {/* Role selector */}
            <div className="mb-6">
              <div className="text-xs font-medium text-gray-500 mb-3">Signing in as</div>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <button key={r.role} type="button" onClick={() => setSelectedRole(r.role)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center
                      ${selectedRole === r.role ? r.color + ' border-current' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}>
                    {r.icon}
                    <span className="text-xs font-semibold">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Google */}
            <button type="button" onClick={() => googleLogin()}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-100"/><span className="text-xs text-gray-400">or email</span><div className="flex-1 h-px bg-gray-100"/>
            </div>

            {/* ── Just Registered Banner ── */}
            {justRegistered && (
              <div className="mb-4 rounded-2xl overflow-hidden border border-blue-200">
                <div className="bg-blue-50 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-base">🎉</span>
                    </div>
                    <div>
                      <div className="font-black text-blue-900 text-sm mb-1">Account created! Check your email</div>
                      <div className="text-blue-700 text-xs leading-relaxed">
                        We sent a verification link to <strong>{registeredEmail}</strong>. Click the link in that email to activate your account, then come back here to log in.
                      </div>
                      <div className="text-blue-500 text-xs mt-2 flex items-center gap-1">
                        <span>📁</span> Don't see it? Check your spam/junk folder.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Active Session Banner ── */}
            {activeSession && (
              <div className="mb-4 rounded-2xl overflow-hidden border border-orange-200">
                <div className="bg-orange-50 px-5 py-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 mt-0.5 text-base">🔐</div>
                    <div>
                      <div className="font-black text-orange-900 text-sm mb-1">Already logged in on another device</div>
                      <div className="text-orange-700 text-xs leading-relaxed">
                        Your account is currently active in another browser or device.<br/>
                        Last login: <strong>{activeSession.lastLogin ? new Date(activeSession.lastLogin).toLocaleString() : 'recently'}</strong><br/>
                        Active sessions: <strong>{activeSession.sessionCount}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-100 rounded-xl p-3 text-xs text-orange-800 mb-3">
                    ⚠️ If you continue, the existing session will be <strong>immediately logged out</strong>. Any unsaved work on that device will be lost.
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" disabled={forceLogging} onClick={handleForceLogin}
                      className="flex items-center gap-2 text-xs font-black text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-4 py-2.5 rounded-xl transition-all">
                      {forceLogging ? '⏳ Logging in...' : '🔄 Kill existing session & log in'}
                    </button>
                    <button type="button" onClick={() => setActiveSession(null)}
                      className="text-xs font-semibold text-orange-600 px-3 py-2 rounded-xl hover:bg-orange-100 transition-all border border-orange-200">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Email Not Verified Banner ── */}
            {notVerified && (
              <div className="mb-4 rounded-2xl overflow-hidden border border-amber-200">
                <div className="bg-amber-50 px-5 py-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-base">📧</span>
                    </div>
                    <div>
                      <div className="font-black text-amber-900 text-sm mb-1">Account not activated yet</div>
                      <div className="text-amber-700 text-xs leading-relaxed">
                        We sent a verification link to <strong>{unverifiedEmail}</strong> when you registered. Please check your inbox (and spam folder) and click the link to activate your account.
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!resendSent ? (
                      <button type="button" onClick={async () => {
                        try {
                          // Call resend verification endpoint
                          const { default: axios } = await import('axios');
                          await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/resend-verification`, { email: unverifiedEmail });
                          setResendSent(true);
                          toast.success('Verification email resent! Check your inbox.');
                        } catch {
                          toast.error('Failed to resend. Please contact help@worksupport360.com');
                        }
                      }} className="text-xs font-black text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-xl transition-all">
                        Resend verification email
                      </button>
                    ) : (
                      <div className="text-xs font-bold text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-200 flex items-center gap-2">
                        ✅ Email sent! Check your inbox.
                      </div>
                    )}
                    <button type="button" onClick={() => setNotVerified(false)} className="text-xs font-semibold text-amber-600 px-3 py-2 rounded-xl hover:bg-amber-100 transition-all">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Email address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Password</label>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                {isLoading ? <><Loader2 size={16} className="animate-spin"/> Signing in...</> : `Sign in as ${selectedRole}`}
              </button>
            </form>

            <div className="pt-4 border-t border-gray-100 text-center">
              <span className="text-xs text-gray-500">Don't have an account? </span>
              <button onClick={() => navigate('/register')} className="text-xs text-blue-600 font-medium hover:text-blue-800">Register here</button>
            </div>

            {/* Dev hint */}
            <div className="mt-4 bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
              <div className="font-semibold mb-1">Demo accounts:</div>
              <div>admin@worksupport360.com / Admin@123!</div>
              <div>rahul@example.com / Test@123! (freelancer)</div>
              <div>john@abccorp.com / Test@123! (client)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
