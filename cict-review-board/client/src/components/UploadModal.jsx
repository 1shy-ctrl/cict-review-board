import { useState } from 'react';
import { api } from '../api.js';

const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function UploadModal({ defaults, onClose, onUploaded }) {
  const [form, setForm] = useState({
    title: '', description: '', courseCode: '',
    program: defaults.program, yearLevel: defaults.yearLevel,
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please choose a file');
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('file', file);
      const created = await api('/resources', { method: 'POST', form: fd });
      onUploaded(created);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-10">
      <form onSubmit={submit} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold">Upload a reviewer</h2>
        {error && <p className="rounded-lg bg-red-50 text-red-700 text-sm p-2">{error}</p>}

        <input className={input} placeholder="Title" value={form.title} onChange={set('title')} required />
        <textarea className={input} rows={3} placeholder="Short description (optional)" value={form.description} onChange={set('description')} />
        <input className={input} placeholder="Course code (e.g. CS101)" value={form.courseCode} onChange={set('courseCode')} required />

        <div className="grid grid-cols-2 gap-3">
          <select className={input} value={form.program} onChange={set('program')}>
            <option value="BSCS">BSCS</option>
            <option value="BSIS">BSIS</option>
            <option value="BOTH">Both</option>
          </select>
          <select className={input} value={form.yearLevel} onChange={set('yearLevel')}>
            {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>

        <input type="file" accept=".pdf,.md,.txt,.js,.py,.java,.c,.cpp,.html,.css,.sql" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
        <p className="text-xs text-slate-400">PDF, Markdown, text or code files. Max 10 MB.</p>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button disabled={loading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">
            {loading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>
    </div>
  );
}
