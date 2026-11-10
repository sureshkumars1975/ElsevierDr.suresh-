export default function JournalCard({ journal, isFav, onToggleFav }) {
  const sponsored = journal.model === 'Sponsored OA';
  return (
    <article className="card">
      <div className="card-top">
        <span className="subject">{journal.subject}</span>
        <button
          className={`star ${isFav ? 'on' : ''}`}
          onClick={() => onToggleFav(journal.id)}
          aria-label={isFav ? 'Remove from saved' : 'Save journal'}
          title={isFav ? 'Remove from saved' : 'Save journal'}
        >
          {isFav ? '★' : '☆'}
        </button>
      </div>
      <h3>{journal.title}</h3>
      <p className="scope">{journal.scope}</p>
      <div className="badges">
        <span className="badge apc">No APC</span>
        <span className={`badge ${sponsored ? 'oa' : 'sub'}`}>{journal.model}</span>
      </div>
      <div className="card-actions">
        <a href={journal.url} target="_blank" rel="noreferrer" className="btn">Journal home</a>
        <a href={journal.guideUrl} target="_blank" rel="noreferrer" className="btn ghost">Guide for authors</a>
      </div>
    </article>
  );
}
