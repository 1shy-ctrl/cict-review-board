import { useState } from 'react';

export default function ResourceCard({ resource, onVote }) {
  const [preview, setPreview] = useState(false);
  const isPdf = resource.fileType === '.pdf';

  const voteBtn = (value, label) => (
    <button
      onClick={() => onVote(resource._id, value)}
      className={`w-8 h-8 rounded-lg border text-sm ${resource.myVote === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-slate-100'}`}
      aria-label={value === 1 ? 'Upvote' : 'Downvote'}
    >
      {label}
    </button>
  );

  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1">
          {voteBtn(1, '▲')}
          <span className="text-sm font-semibold">{resource.score}</span>
          {voteBtn(-1, '▼')}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{resource.title}</h3>
          <div className="flex flex-wrap gap-2 text-xs my-1">
            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{resource.courseCode}</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded">{resource.program === 'BOTH' ? 'BSCS + BSIS' : resource.program}</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded">Year {resource.yearLevel}</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded">{resource.fileType}</span>
          </div>
          {resource.description && <p className="text-sm text-slate-600">{resource.description}</p>}
          <p className="text-xs text-slate-400 mt-1">Uploaded by {resource.uploader?.name || 'Unknown'}</p>

          <div className="flex gap-3 mt-3 text-sm">
            {isPdf && (
              <button onClick={() => setPreview(!preview)} className="text-indigo-600 font-medium">
                {preview ? 'Hide preview' : 'Preview'}
              </button>
            )}
            <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-medium">
              {isPdf ? 'Open / Download' : 'View file'}
            </a>
          </div>
        </div>
      </div>

      {preview && isPdf && (
        <iframe title={resource.title} src={resource.fileUrl} className="w-full h-[500px] mt-3 rounded-lg border" />
      )}
    </article>
  );
}
