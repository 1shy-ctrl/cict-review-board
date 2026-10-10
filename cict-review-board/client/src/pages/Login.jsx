import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function Login() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ studentId: '', name: '', password: '', program: 'BSCS', yearLevel: 1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: form });
      signIn(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">CICT Review Board</h1>
          <p className="text-sm text-slate-500">
            {mode === 'login' ? 'Log in with your Student ID' : 'Create your account'}
          </p>
        </div>

        {error && <p className="rounded-lg bg-red-50 text-red-700 text-sm p-2">{error}</p>}

        <input className={input} placeholder="Student ID (e.g. 2023-01234)" value={form.studentId} onChange={set('studentId')} required />

        {mode === 'register' && (
          <>
            <input className={input} placeholder="Full name" value={form.name} onChange={set('name')} required />
            <div className="grid grid-cols-2 gap-3">
              <select className={input} value={form.program} onChange={set('program')}>
                <option value="BSCS">BSCS</option>
                <option value="BSIS">BSIS</option>
              </select>
              <select className={input} value={form.yearLevel} onChange={set('yearLevel')}>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <input className={input} type="password" placeholder="Password (min 8 characters)" value={form.password} onChange={set('password')} required />

        <button disabled={loading} className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}
        </button>

        <p className="text-sm text-center text-slate-500">
          {mode === 'login' ? 'No account yet?' : 'Already registered?'}{' '}
          <button type="button" className="text-indigo-600 font-medium" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Register' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  );
}
