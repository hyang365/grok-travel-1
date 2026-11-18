import { useMemo, useState } from "react";
import { ME } from "../data";
import { GRANTS, KIND_LABEL, PROGRAMS, REGIONS, grantsFor, type Program, type ProgramKind } from "./data";
import { average, reviewStore, useReviews, type ProgramReview } from "./reviewStore";
import "./abroad.css";

const KINDS: ProgramKind[] = ["yss", "london", "nonyale-summer", "term"];

function Stars({ value }: { value: number | null }) {
  if (value === null) return <span className="ab-score none">No reviews</span>;
  return <span className="ab-score">{value.toFixed(1)}<small>/5</small></span>;
}

export function AbroadView() {
  const reviews = useReviews();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ProgramKind | "all">("all");
  const [region, setRegion] = useState<string>("all");
  const [grant, setGrant] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string>(PROGRAMS[0].id);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROGRAMS.filter((p) => {
      if (kind !== "all" && p.kind !== kind) return false;
      if (region !== "all" && p.region !== region) return false;
      if (grant !== "all" && !grantsFor(p).some((g) => g.id === grant)) return false;
      if (!q) return true;
      return [p.name, p.city, p.country, p.subject, p.language ?? ""].some((s) => s.toLowerCase().includes(q));
    });
  }, [query, kind, region, grant]);

  const selected = PROGRAMS.find((p) => p.id === selectedId) ?? rows[0] ?? PROGRAMS[0];

  return (
    <div className="ab-page">
      <section className="ab-list">
        <header>
          <h2>Study abroad</h2>
          <p className="fine">Yale-run and Yale-approved programs, what Yalies thought of them, and the grants that can pay for each.</p>
        </header>
        <input className="search ab-search" type="search" placeholder="Search city, language, subject" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search programs" />
        <div className="ab-filters">
          <select value={kind} onChange={(e) => setKind(e.target.value as ProgramKind | "all")} aria-label="Program type">
            <option value="all">All types</option>
            {KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
          </select>
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region">
            <option value="all">All regions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={grant} onChange={(e) => setGrant(e.target.value)} aria-label="Funding">
            <option value="all">Any funding</option>
            {Object.values(GRANTS).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <p className="fine">{rows.length} programs</p>
        <ul className="ab-rows">
          {rows.map((p) => {
            const mine = reviews.filter((r) => r.programId === p.id);
            return (
              <li key={p.id}>
                <button type="button" className={p.id === selected.id ? "active" : ""} onClick={() => setSelectedId(p.id)}>
                  <span className="ab-row-main">
                    <strong>{p.name}</strong>
                    <span>{p.city}, {p.country} · {KIND_LABEL[p.kind]}</span>
                  </span>
                  <span className="ab-row-side">
                    <Stars value={average(mine, "overall")} />
                    <span className="fine">{grantsFor(p).length} grants</span>
                  </span>
                </button>
              </li>
            );
          })}
          {rows.length === 0 ? <li className="empty">No programs match. Try clearing a filter.</li> : null}
        </ul>
        <a className="textlink" href="https://studyabroad.yale.edu/get-started/how-choose-program" target="_blank" rel="noreferrer">
          Full Yale Study Abroad database ↗
        </a>
      </section>
      <ProgramDetail program={selected} reviews={reviews.filter((r) => r.programId === selected.id)} />
    </div>
  );
}

function ProgramDetail({ program, reviews }: { program: Program; reviews: ProgramReview[] }) {
  const grants = grantsFor(program);
  return (
    <section className="ab-detail">
      <header>
        <p className="kicker">{KIND_LABEL[program.kind]} · {program.terms.join(", ")}</p>
        <h2>{program.name}</h2>
        <p>{program.city}, {program.country} · {program.subject}</p>
        {program.note ? <p className="callout">{program.note}</p> : null}
        <div className="plan-actions">
          <a className="primary ab-link" href={program.url} target="_blank" rel="noreferrer">Program page ↗</a>
          <a className="textlink" href="https://studyabroad.yale.edu/node/97" target="_blank" rel="noreferrer">Deadlines</a>
        </div>
      </header>

      <div className="ab-scores">
        {(["overall", "academics", "housing", "value"] as const).map((k) => (
          <div key={k}>
            <span className="field-label">{k[0].toUpperCase() + k.slice(1)}</span>
            <Stars value={average(reviews, k)} />
          </div>
        ))}
      </div>

      <h3>Grants you can apply for</h3>
      <ul className="ab-grants">
        {grants.map((g) => (
          <li key={g.id}>
            <div className="ab-grant-top">
              <a href={g.url} target="_blank" rel="noreferrer"><strong>{g.name}</strong></a>
              <span className="ab-amount">{g.amount}</span>
            </div>
            <p>{g.who}</p>
            <p className="fine">{g.deadline}</p>
            {g.caveat ? <p className="fine ab-caveat">{g.caveat}</p> : null}
          </li>
        ))}
      </ul>
      <p className="fine">Eligibility depends on your aid status and citizenship. Confirm on each grant's page before you apply.</p>

      <h3>Reviews ({reviews.length})</h3>
      <ReviewForm program={program} />
      {reviews.length === 0 ? <p className="empty">No reviews yet. If you went, you'd be the first.</p> : null}
      <ul className="ab-reviews">
        {reviews.map((r) => (
          <li key={r.id}>
            <div className="ab-grant-top">
              <strong>{r.author}</strong>
              <span className="fine">{r.term} {r.year} · {r.overall}/5</span>
            </div>
            <p className="fine">Academics {r.academics} · Housing {r.housing} · Value {r.value}</p>
            <p>{r.text}</p>
            {r.netid === ME.netid ? (
              <button className="textlink danger" type="button" onClick={() => reviewStore.remove(r.id)}>Delete</button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReviewForm({ program }: { program: Program }) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(program.terms[0]);
  const [year, setYear] = useState(2026);
  const [scores, setScores] = useState({ overall: 4, academics: 4, housing: 4, value: 4 });
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  if (!open) {
    return <button className="primary ab-write" type="button" onClick={() => { setOpen(true); setTerm(program.terms[0]); }}>Write a review</button>;
  }

  return (
    <form
      className="ab-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim().length < 20) {
          setError("Write at least a couple of sentences so it helps the next person.");
          return;
        }
        reviewStore.add({
          id: `rev-${Date.now()}`,
          programId: program.id,
          netid: ME.netid,
          author: `${ME.college} '${ME.year.slice(2)}`,
          term,
          year,
          ...scores,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        });
        setText("");
        setError("");
        setOpen(false);
      }}
    >
      <div className="ab-form-row">
        <label>Term
          <select value={term} onChange={(e) => setTerm(e.target.value)}>
            {program.terms.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label>Year
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2026, 2025, 2024, 2023, 2022].map((y) => <option key={y}>{y}</option>)}
          </select>
        </label>
      </div>
      <div className="ab-form-row">
        {(Object.keys(scores) as (keyof typeof scores)[]).map((k) => (
          <label key={k}>{k[0].toUpperCase() + k.slice(1)}
            <select value={scores[k]} onChange={(e) => setScores({ ...scores, [k]: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
        ))}
      </div>
      <textarea rows={4} value={text} onChange={(e) => { setText(e.target.value); setError(""); }} placeholder="Workload, instructors, housing, what you'd tell a friend before applying" aria-label="Review" />
      {error ? <p className="form-error">{error}</p> : null}
      <p className="fine">Posted as "{ME.college} '{ME.year.slice(2)}". Your NetID isn't shown.</p>
      <div className="plan-actions">
        <button className="primary" type="submit">Post review</button>
        <button className="textlink" type="button" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
