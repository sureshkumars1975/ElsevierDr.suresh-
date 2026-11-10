import { useEffect, useMemo, useRef, useState } from 'react';
import { journals, subjects, models } from './data/journals.js';
import JournalCard from './components/JournalCard.jsx';

const LETTERS = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

function downloadCsv(list) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [
    ['Title', 'Subject', 'Access model', 'Scope', 'Journal URL', 'Guide for authors'],
    ...list.map((j) => [j.title, j.subject, j.model, j.scope, j.url, j.guideUrl]),
  ];
  const blob = new Blob(['\ufeff' + rows.map((r) => r.map(esc).join(',')).join('\r\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'nil-apc-journals.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

function loadFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem('nilapc-favs') || '[]'));
  } catch {
    return new Set();
  }
}

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [model, setModel] = useState('All');
  const [letter, setLetter] = useState('All');
  const [sort, setSort] = useState('az');
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [showTop, setShowTop] = useState(false);
  const searchRef = useRef(null);

  // "/" focuses search, Esc clears it.
  useEffect(() => {
    const onKey = (e) => {
      const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setQuery('');
      }
    };
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nilapc-favs', JSON.stringify([...favorites]));
    } catch {
      /* storage unavailable */
    }
  }, [favorites]);

  const toggleSubject = (s) =>
    setSelectedSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const toggleFavorite = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const resetFilters = () => {
    setQuery('');
    setSelectedSubjects([]);
    setModel('All');
    setLetter('All');
    setSort('az');
    setOnlyFavs(false);
  };

  const lettersInUse = useMemo(() => new Set(journals.map((j) => j.title[0].toUpperCase())), []);

  const subjectCounts = useMemo(() => {
    const counts = {};
    journals.forEach((j) => (counts[j.subject] = (counts[j.subject] || 0) + 1));
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = journals.filter(
      (j) =>
        (!q ||
          j.title.toLowerCase().includes(q) ||
          j.scope.toLowerCase().includes(q) ||
          j.subject.toLowerCase().includes(q)) &&
        (selectedSubjects.length === 0 || selectedSubjects.includes(j.subject)) &&
        (model === 'All' || j.model === model) &&
        (letter === 'All' || j.title.toUpperCase().startsWith(letter)) &&
        (!onlyFavs || favorites.has(j.id)),
    );
    const sorted = [...list];
    if (sort === 'za') sorted.sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === 'subject')
      sorted.sort((a, b) => a.subject.localeCompare(b.subject) || a.title.localeCompare(b.title));
    else sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [query, selectedSubjects, model, letter, sort, onlyFavs, favorites]);

  const activeFilterCount =
    (query ? 1 : 0) + selectedSubjects.length + (model !== 'All' ? 1 : 0) + (letter !== 'All' ? 1 : 0) + (onlyFavs ? 1 : 0);

  return (
    <div className="app">
      <header className="hero">
        <div className="wrap">
          <p className="eyebrow">Publish without article processing charges</p>
          <h1>Nil APC Journal Finder</h1>
          <p className="author">
            <span className="avatar" aria-hidden="true">SK</span>
            <span>
              Compiled by <strong>Dr. Suresh Kumar S</strong>
              <br />
              Professor, Department of AI &amp; DS
            </span>
          </p>
          <p className="lede">
            {journals.length} Elsevier journals you can publish in for free — subscription (hybrid) titles where
            the standard route has no APC, plus sponsored open access titles.
          </p>
          <div className="stats">
            <div><strong>{journals.length}</strong><span>Journals</span></div>
            <div><strong>{subjects.length}</strong><span>Subject areas</span></div>
            <div><strong>₹0 / $0</strong><span>APC</span></div>
          </div>
        </div>
      </header>

      <main className="wrap">
        <section className="filters" aria-label="Filters">
          <div className="filter-row">
            <input
              ref={searchRef}
              type="search"
              className="search"
              placeholder="Search title, scope or subject…"
              title="Tip: press / to search, Esc to clear"
              aria-label="Search journals"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select value={model} onChange={(e) => setModel(e.target.value)} aria-label="Access model">
              <option value="All">All access models</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              <option value="az">Title A → Z</option>
              <option value="za">Title Z → A</option>
              <option value="subject">Subject area</option>
            </select>
            <label className="fav-toggle">
              <input type="checkbox" checked={onlyFavs} onChange={(e) => setOnlyFavs(e.target.checked)} />
              ★ Saved ({favorites.size})
            </label>
          </div>

          <div className="chips" role="group" aria-label="Subject areas">
            {subjects.map((s) => (
              <button
                key={s}
                className={`chip ${selectedSubjects.includes(s) ? 'on' : ''}`}
                onClick={() => toggleSubject(s)}
                aria-pressed={selectedSubjects.includes(s)}
              >
                {s} <span className="count">{subjectCounts[s]}</span>
              </button>
            ))}
          </div>

          <div className="letters" role="group" aria-label="Starts with">
            {LETTERS.map((l) => (
              <button
                key={l}
                className={`letter ${letter === l ? 'on' : ''}`}
                onClick={() => setLetter(l)}
                disabled={l !== 'All' && !lettersInUse.has(l)}
                aria-pressed={letter === l}
              >
                {l}
              </button>
            ))}
          </div>
        </section>

        <div className="result-bar" aria-live="polite">
          <span>
            Showing <strong>{filtered.length}</strong> of {journals.length} journals
          </span>
          <span className="result-actions">
            {activeFilterCount > 0 && (
              <button className="link-btn" onClick={resetFilters}>
                Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
              </button>
            )}
            {filtered.length > 0 && (
              <button className="link-btn" onClick={() => downloadCsv(filtered)}>
                ⤓ Download CSV
              </button>
            )}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <p>No journals match these filters.</p>
            <button className="btn" onClick={resetFilters}>Reset filters</button>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((j) => (
              <JournalCard key={j.id} journal={j} isFav={favorites.has(j.id)} onToggleFav={toggleFavorite} />
            ))}
          </div>
        )}

        <p className="disclaimer">
          APC policies change. Always confirm on the journal's <em>Guide for authors</em> before submitting —
          choosing the open access option in a hybrid journal does incur an APC. Not affiliated with Elsevier.
        </p>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          Compiled by <strong>Dr. Suresh Kumar S</strong>, Professor, Department of AI &amp; DS
          <span className="footer-note">© {new Date().getFullYear()}</span>
        </div>
      </footer>

      {showTop && (
        <button className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          ↑
        </button>
      )}
    </div>
  );
}
