import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const demoAccounts = [
  { label: 'Founder', email: 'founder@orbitbase.com', password: 'founder123', color: 'border-f-blue/30 text-f-blue hover:border-f-blue hover:bg-f-blue/5' },
  { label: 'Mentor', email: 'mentor@orbitbase.com', password: 'mentor123', color: 'border-f-green/30 text-f-green hover:border-f-green hover:bg-f-green/5' },
  { label: 'Investor', email: 'investor@orbitbase.com', password: 'investor123', color: 'border-f-violet/30 text-f-violet hover:border-f-violet hover:bg-f-violet/5' },
  { label: 'Admin', email: 'admin@orbitbase.com', password: 'admin123', color: 'border-f-amber/30 text-f-amber hover:border-f-amber hover:bg-f-amber/5' },
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const routes = { FOUNDER: '/founder', MENTOR: '/mentor', INVESTOR: '/investor', ADMIN: '/admin' };
      navigate(routes[user.role] || '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email, password) => {
    setLoading(true);
    try {
      const user = await login(email, password);
      const routes = { FOUNDER: '/founder', MENTOR: '/mentor', INVESTOR: '/investor', ADMIN: '/admin' };
      navigate(routes[user.role]);
    } catch {
      toast.error('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-surface border-r border-edge">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
            <span className="text-canvas font-bold font-grotesk">O</span>
          </div>
          <span className="font-grotesk font-bold text-chalk text-lg tracking-tight">OrbitBase</span>
        </div>

        <div>
          <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-4">Startup Incubation Portal</p>
          <h1 className="font-grotesk text-5xl font-bold text-chalk leading-[1.1] mb-6">
            Where startups<br />
            find their<br />
            <span className="text-teal">orbit.</span>
          </h1>
          <p className="text-ash text-base max-w-sm leading-relaxed">
            Connect founders with mentors and investors. Manage milestones, track applications, and grow your startup ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-6">
          {[
            { n: '4', l: 'Roles' },
            { n: '15', l: 'Use Cases' },
            { n: '∞', l: 'Potential' },
          ].map(({ n, l }) => (
            <div key={l}>
              <p className="font-mono text-2xl font-medium text-chalk">{n}</p>
              <p className="text-xs text-ash">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
              <span className="text-canvas font-bold font-grotesk">O</span>
            </div>
            <span className="font-grotesk font-bold text-chalk text-lg">OrbitBase</span>
          </div>

          <div className="mb-8">
            <h2 className="font-grotesk text-2xl font-bold text-chalk mb-1">Welcome back</h2>
            <p className="text-ash text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner w-4 h-4" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-edge" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-canvas text-xs text-dim uppercase tracking-widest">Demo access</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.label}
                  onClick={() => quickLogin(acc.email, acc.password)}
                  disabled={loading}
                  className={`border rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 ${acc.color}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-ash">
            No account?{' '}
            <Link to="/register" className="text-teal hover:text-teal-hi font-medium transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
