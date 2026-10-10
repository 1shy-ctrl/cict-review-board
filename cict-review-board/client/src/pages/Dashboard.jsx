import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ResourceCard from '../components/ResourceCard.jsx';
import UploadModal from '../components/UploadModal.jsx';

const sel = 'w-full rounded-lg border border-slate-300 px-3 py-2 bg-white';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState({
    program: user.program, yearLevel: String(user.yearLevel), courseCode: '', q: '', sort: 'top',
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  useEffect(() => {
    // small debounce so typing in the search boxes doesn't spam the API
    const t = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
        setItems(await api(`/resources?${params}`));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [filters]);

  const vote = async (id, value) => {
    try {
      const updated = await api(`/resources/${id}/vote`, { method: 'POST', body: { value } });
      setItems((prev) => prev.map((r) => (r._id === id ? updated : r)));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-lg">CICT Review Board</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline">{user.name} · {user.program} {user.yearLevel}</span>
          <button onClick={signOut} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1">Log out</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 grid gap-4 md:grid-cols-[240px_1fr]">
        <aside className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 h-fit">
          <h2 className="font-semibold">Filters</h2>
          <select className={sel} value={filters.program} onChange={set('program')}>
            <option value="ALL">All programs</option>
            <option value="BSCS">BSCS</option>
            <option value="BSIS">BSIS</option>
          </select>
          <select className={sel} value={filters.yearLevel} onChange={set('yearLevel')}>
            <option value="ALL">All year levels</option>
            {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
          <input className={sel} placeholder="Course code" value={filters.courseCode} onChange={set('courseCode')} />
          <input className={sel} placeholder="Search title" value={filters.q} onChange={set('q')} />
          <select className={sel} value={filters.sort} onChange={set('sort')}>
            <option value="top">Top rated</option>
            <option value="new">Newest</option>
          </select>
          <button onClick={() => setShowUpload(true)} className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700">
            + Upload reviewer
          </button>
        </aside>

        <main className="space-y-3">
          {error && <p className="rounded-lg bg-red-50 text-red-700 text-sm p-2">{error}</p>}
          {loading && <p className="text-slate-500">Loading…</p>}
          {!loading && items.length === 0 && (
            <p className="text-slate-500">No reviewers match these filters yet. Be the first to upload one!</p>
          )}
          {items.map((r) => <ResourceCard key={r._id} resource={r} onVote={vote} />)}
        </main>
      </div>

      {showUpload && (
        <UploadModal
          defaults={{ program: user.program, yearLevel: user.yearLevel }}
          onClose={() => setShowUpload(false)}
          onUploaded={(r) => setItems((prev) => [r, ...prev])}
        />
      )}
    </div>
  );
}
