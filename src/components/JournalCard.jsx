function Highlight({ text, query }) {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

export default function JournalCard({ journal, query, isFav, onToggleFav }) {
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
      <h3 data-url={journal.url}><Highlight text={journal.title} query={query} /></h3>
      <p className="scope"><Highlight text={journal.scope} query={query} /></p>
      <div className="badges">
        <span className="badge apc">No APC</span>
        <span className={`badge ${sponsored ? 'oa' : 'sub'}`}>{journal.model}</span>
      </div>
      <div className="card-actions">
        <a href={journal.url} target="_blank" rel="noreferrer" className="btn" aria-label={`${journal.title} – journal home (opens in new tab)`}>
          Journal home
        </a>
        <a href={journal.guideUrl} target="_blank" rel="noreferrer" className="btn ghost" aria-label={`${journal.title} – guide for authors (opens in new tab)`}>
          Guide for authors
        </a>
      </div>
    </article>
  );
}
