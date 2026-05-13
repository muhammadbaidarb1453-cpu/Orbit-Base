import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const roleOptions = [
  { value: 'FOUNDER', label: 'Startup Founder', desc: 'Submit and manage your startup applications' },
  { value: 'MENTOR', label: 'Mentor', desc: 'Guide and support startup teams' },
  { value: 'INVESTOR', label: 'Investor', desc: 'Discover and invest in promising startups' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'FOUNDER' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role !== 'FOUNDER') {
        toast.success('Account created! Waiting for admin approval.');
        navigate('/login');
      } else {
        navigate('/founder');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const needsApproval = form.role !== 'FOUNDER';

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
            <span className="text-canvas font-bold font-grotesk">O</span>
          </div>
          <span className="font-grotesk font-bold text-chalk text-lg tracking-tight">OrbitBase</span>
        </div>

        <div className="mb-8">
          <h1 className="font-grotesk text-2xl font-bold text-chalk mb-1">Create your account</h1>
          <p className="text-ash text-sm">Join the startup incubation ecosystem</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              required
            />
          </div>

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
              placeholder="Min 6 characters"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="label">I am a...</label>
            <div className="space-y-2">
              {roleOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                    form.role === opt.value
                      ? 'border-teal bg-teal/5'
                      : 'border-edge hover:border-edge-hi bg-surface'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={form.role === opt.value}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="mt-0.5 accent-teal"
                  />
                  <div>
                    <p className="text-sm font-semibold text-chalk">{opt.label}</p>
                    <p className="text-xs text-ash">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {needsApproval && (
            <div className="flex gap-2.5 p-3 bg-f-amber/5 border border-f-amber/20 rounded-lg">
              <span className="text-f-amber text-sm flex-shrink-0">⚠</span>
              <p className="text-xs text-ash leading-relaxed">
                <span className="text-f-amber font-semibold">Approval required.</span> Mentor and Investor accounts need admin review before access is granted.
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner w-4 h-4" />
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ash">
          Already have an account?{' '}
          <Link to="/login" className="text-teal hover:text-teal-hi font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
