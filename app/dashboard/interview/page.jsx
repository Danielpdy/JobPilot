'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { startInterview, getInterviewHistory } from '@/app/Services/InterviewService';
import InterviewSession from './InterviewSession';
import {
  Mic, Code2, Server, Briefcase, BarChart2, Headphones, Layers, Users,
  Calendar, Search, RotateCw, ArrowDownUp, Plus,
  CheckCircle2, AlertCircle, X, Download, Upload, FileText, Play, Loader2,
} from 'lucide-react';
import FlipCard from '@/components/FlipCard';
import styles from './page.module.css';

// ─── Form constants ────────────────────────────────────────
const INTERVIEW_TYPES = ['Mixed', 'Technical', 'Behavioral'];
const DIFFICULTIES    = ['Entry Level', 'Mid Level', 'Senior Level'];
const QUESTION_COUNTS = [5, 10, 15, 20];
const TYPE_FILTERS    = ['All', ...INTERVIEW_TYPES];
const MINUTES_PER_QUESTION = 2.5; // same estimate the live session uses

const TYPE_COACHING = {
  Mixed:      'A blend of behavioral and technical questions, like a real first-round screen.',
  Technical:  'Questions about how you’d build, debug and explain things. Think out loud — the reasoning counts.',
  Behavioral: 'Questions about situations you’ve handled. Answer with the situation, what you did, and the result.',
};
// ─── Category + score tones (all colours are tokens) ───────
const TYPE_TAG = {
  Mixed:      { bg: 'var(--color-type-mixed-soft)',      color: 'var(--color-type-mixed)' },
  Technical:  { bg: 'var(--color-type-technical-soft)',  color: 'var(--color-type-technical)' },
  Behavioral: { bg: 'var(--color-type-behavioral-soft)', color: 'var(--color-type-behavioral)' },
};
const DIFF_TAG = {
  'Entry Level':  { bg: 'var(--color-diff-entry-soft)',  color: 'var(--color-diff-entry)' },
  'Mid Level':    { bg: 'var(--color-diff-mid-soft)',    color: 'var(--color-diff-mid)' },
  'Senior Level': { bg: 'var(--color-diff-senior-soft)', color: 'var(--color-diff-senior)' },
};
const typeTag = (t) => TYPE_TAG[t] ?? TYPE_TAG.Mixed;
const diffTag = (d) => DIFF_TAG[d] ?? DIFF_TAG['Entry Level'];

// Overall score, 0–100 (design.md § Score colors)
function scoreTone(score) {
  if (score >= 80) return { color: 'var(--color-success-strong)', soft: 'var(--color-success-soft)', label: 'Excellent' };
  if (score >= 60) return { color: 'var(--color-accent-strong)',  soft: 'var(--color-accent-soft)',  label: 'Good' };
  return { color: 'var(--color-error)', soft: 'var(--color-error-soft)', label: 'Needs work' };
}
// Per-question score, 0–10 (text-safe tones: used for both the number and its bar)
function questionTone(score) {
  if (score >= 7) return 'var(--color-success-strong)';
  if (score >= 4) return 'var(--color-warning)';
  return 'var(--color-error)';
}

// ─── Count-up for the headline figure ──────────────────────
function useCountUp(target, duration = 520) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target == null) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = reduced ? 1 : Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 4))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

// ═══════════════════════════════════════════════════════════
// Data mapping
// ═══════════════════════════════════════════════════════════
function mapApiToSession(interview) {
  const qs = interview.questionsBreakdown ?? [];
  return {
    id:           interview.id,
    role:         interview.role,
    type:         interview.type,
    difficulty:   interview.difficulty,
    date:         interview.date,
    questions:    interview.questions,
    duration:     interview.durationMinutes,
    score:        interview.score,
    scored:       interview.score > 0 || qs.some(q => q.score > 0),
    strengths:    interview.strengthBullets    ?? [],
    improvements: interview.improvementBullets ?? [],
    breakdown:    qs.map(q => ({
      id:          q.questionNumber,
      q:           q.questionText,
      score:       q.score,
      answer:      null,
      feedback:    q.feedback || null,
      improvement: null,
    })),
  };
}

// ═══════════════════════════════════════════════════════════
// Shared pieces
// ═══════════════════════════════════════════════════════════
function ScoreRing({ score, size = 90 }) {
  const sw   = Math.max(5, Math.round(size * 0.075));
  const r    = (size - sw * 2) / 2;
  const cx   = size / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ * (1 - score / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.ring} role="img" aria-label={`Score ${score} out of 100`}>
      <circle cx={cx} cy={cx} r={r} fill="none" strokeWidth={sw} style={{ stroke: 'var(--color-paper-3)' }} />
      <circle cx={cx} cy={cx} r={r} fill="none" strokeWidth={sw}
        style={{ stroke: scoreTone(score).color }}
        strokeDasharray={`${circ} ${circ}`} strokeDashoffset={off}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cx})`} />
      <text x={cx} y={cx} textAnchor="middle" dominantBaseline="central"
        fontSize={size * 0.3} fontWeight="700" style={{ fill: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{score}</text>
    </svg>
  );
}

function Tag({ tone, children }) {
  return <span className={styles.tag} style={{ background: tone.bg, color: tone.color }}>{children}</span>;
}

function RoleIcon({ role, size = 18 }) {
  const p = { size, strokeWidth: 2 };
  const map = {
    'Software Engineer':     <Code2      {...p} />,
    'Backend Developer':     <Server     {...p} />,
    'Product Manager':       <Briefcase  {...p} />,
    'Data Analyst':          <BarChart2  {...p} />,
    'IT Support Specialist': <Headphones {...p} />,
  };
  return map[role] ?? <Briefcase {...p} />;
}

function OptionGroup({ label, options, value, onChange, format = o => o }) {
  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.segment} role="radiogroup" aria-label={label}>
        {options.map(o => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            className={styles.segBtn}
            onClick={() => onChange(o)}
          >
            {format(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Bullets({ strengths, improvements }) {
  if (!strengths.length && !improvements.length) return null;
  return (
    <div className={styles.bullets}>
      {strengths.length > 0 && (
        <div className={styles.bulletCol}>
          <h4 className={styles.bulletTitle} style={{ color: 'var(--color-success-strong)' }}>What worked</h4>
          {strengths.map((s, i) => (
            <p key={i} className={styles.bulletItem}>
              <CheckCircle2 size={14} style={{ color: 'var(--color-success-strong)' }} />{s}
            </p>
          ))}
        </div>
      )}
      {improvements.length > 0 && (
        <div className={styles.bulletCol}>
          <h4 className={styles.bulletTitle} style={{ color: 'var(--color-warning)' }}>Work on next</h4>
          {improvements.map((s, i) => (
            <p key={i} className={styles.bulletItem}>
              <AlertCircle size={14} style={{ color: 'var(--color-warning)' }} />{s}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Feedback card — opens centred and flips between summary and feedback ──
// FlipCard sizes in px, so measure the viewport (rAF keeps setState out of the effect body).
function useCardSize() {
  const [size, setSize] = useState(null);
  useEffect(() => {
    const measure = () => setSize({
      w: Math.round(Math.min(600, window.innerWidth - 32)),
      // phones stack the actions under the card and keep the close button clear
      h: Math.round(Math.min(680, Math.max(420, window.innerHeight - (window.innerWidth < 640 ? 300 : 168)))),
    });
    const id = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', measure); };
  }, []);
  return size;
}

function FeedbackModal({ session, onClose }) {
  const size = useCardSize();
  const [flipped, setFlipped] = useState(true); // arrives on its back, then turns to the summary
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const id = setTimeout(() => setFlipped(false), 140);
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current(); };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(id); window.removeEventListener('keydown', onKey); };
  }, []);

  const tone  = session.scored ? scoreTone(session.score) : null;
  const win   = session.strengths[0];
  const focus = session.improvements[0];
  // Reading and selecting on the back shouldn't flip the card
  const keepPointer = { onPointerDown: (e) => e.stopPropagation(), onClick: (e) => e.stopPropagation() };

  const front = (
    <div className={styles.fbFace}>
      <div className={styles.fbTop}>
        <span className={styles.metaItem}><Calendar size={13} />{session.date}</span>
        <span className={styles.rowTags}>
          <Tag tone={typeTag(session.type)}>{session.type}</Tag>
          <Tag tone={diffTag(session.difficulty)}>{session.difficulty}</Tag>
        </span>
      </div>

      <div className={styles.fbHero}>
        <div className={styles.fbScore}>
          {tone ? <ScoreRing score={session.score} size={124} /> : <span className={styles.fbUngraded}>—</span>}
          <span className={styles.scorePill} style={tone ? { background: tone.soft, color: tone.color } : { background: 'var(--color-paper-3)', color: 'var(--color-neutral)' }}>
            {tone ? tone.label : 'Not graded'}
          </span>
        </div>
        <div className={styles.fbIdentity}>
          <h2 id="fb-title" className={styles.fbRole}>{session.role}</h2>
          <dl className={styles.fbFacts}>
            <div><dt>Questions</dt><dd>{session.questions}</dd></div>
            <div><dt>Duration</dt><dd>{session.duration} min</dd></div>
            <div><dt>Answered</dt><dd>{session.breakdown.filter(q => q.score > 0).length}/{session.breakdown.length || session.questions}</dd></div>
          </dl>
        </div>
      </div>

      {win || focus
        ? (
          <div className={styles.fbTakeaways}>
            {win && (
              <div className={styles.fbFocus}>
                <span className={`${styles.focusLabel} ${styles.fbWin}`}>What worked</span>
                <p className={styles.fbFocusText}>{win}</p>
              </div>
            )}
            {focus && (
              <div className={styles.fbFocus}>
                <span className={styles.focusLabel}>Work on next</span>
                <p className={styles.fbFocusText}>{focus}</p>
              </div>
            )}
          </div>
        )
        : <p className={styles.fbQuiet}>No coaching notes were saved for this round yet.</p>}

      <p className={styles.fbHint}><RotateCw size={14} aria-hidden="true" /> Tap or drag to see question-by-question feedback</p>
    </div>
  );

  const back = (
    <div className={`${styles.fbFace} ${styles.fbBack}`}>
      <div className={styles.fbBackHead}>
        <h3 className={styles.fbBackTitle}>Feedback</h3>
        <span className={styles.fbBackRole}>{session.role}</span>
      </div>

      <div className={styles.fbScroll} {...keepPointer}>
        <Bullets strengths={session.strengths} improvements={session.improvements} />

        <h4 className={styles.panelSectionTitle}>Question by question</h4>
        {session.breakdown.length === 0
          ? <p className={styles.fbQuiet}>No per-question breakdown was saved for this round.</p>
          : (
            <ol className={styles.fbQs}>
              {session.breakdown.map((item, i) => (
                <li key={item.id} className={styles.fbQ}>
                  <div className={styles.fbQTop}>
                    <span className={styles.fbQIndex}>{i + 1}</span>
                    <p className={styles.fbQText}>{item.q}</p>
                    <span className={styles.fbQScore} style={{ color: questionTone(item.score), borderColor: questionTone(item.score) }}>
                      {item.score > 0 ? `${item.score}/10` : '—'}
                    </span>
                  </div>
                  {item.feedback && <p className={styles.fbQFeedback}>{item.feedback}</p>}
                </li>
              ))}
            </ol>
          )}
      </div>

      <p className={styles.fbHint}><RotateCw size={14} aria-hidden="true" /> Tap the header or drag to flip back</p>
    </div>
  );

  return (
    <motion.div
      className={styles.fbOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.25 } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fb-title"
    >
      <button type="button" className={`${styles.iconBtn} ${styles.fbClose}`} onClick={onClose} aria-label="Close round details">
        <X size={18} />
      </button>

      <motion.div
        className={styles.fbStage}
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } }}
        exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.2, ease: [0.7, 0, 0.84, 0] } }}
        onClick={(e) => e.stopPropagation()}
      >
        {size && (
          <FlipCard
            front={front}
            back={back}
            flipped={flipped}
            onFlipChange={setFlipped}
            axis="y"
            flipOnClick
            draggable
            dragDistance={0}
            tilt
            tiltMax={12}
            glare
            glareOpacity={0.22}
            hoverScale={1.03}
            perspective={1100}
            stiffness={170}
            damping={20}
            width={size.w}
            height={size.h}
            radius={22}
            background="var(--color-paper)"
            color="var(--color-ink)"
            shadow
            shadowColor="var(--color-navy)"
            shadowOpacity={0.45}
            ariaLabel={flipped ? 'Show the summary side' : 'Show the feedback side'}
          />
        )}

        <div className={styles.fbActions}>
          <button type="button" className={styles.btnPrimary} onClick={() => setFlipped(f => !f)}>
            <RotateCw size={15} /> {flipped ? 'Show summary' : 'Show feedback'}
          </button>
          <button type="button" className={styles.btnSecondary}>
            <Download size={15} /> Download report
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Summary modal (shown after a round completes) ─────────
function SummaryModal({ session, onClose }) {
  const [secs, setSecs] = useState(10);
  const onCloseRef = useRef(onClose);
  const pausedRef  = useRef(false); // hovering or focus inside → hold the countdown (WCAG 2.2.1)
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setSecs(s => {
        if (s <= 1) { clearInterval(id); onCloseRef.current(); return 0; }
        return s - 1;
      });
    }, 1000);
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current(); };
    window.addEventListener('keydown', onKey);
    return () => { clearInterval(id); window.removeEventListener('keydown', onKey); };
  }, []);

  const tone = session.scored ? scoreTone(session.score) : null;

  return (
    <motion.div
      className={styles.smOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.smBox}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sm-title"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        onFocus={() => { pausedRef.current = true; }}
        onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) pausedRef.current = false; }}
      >
        <div className={styles.smCountdown} aria-hidden="true">
          <div className={styles.smCountdownFill} style={{ transform: `scaleX(${secs / 10})` }} />
        </div>

        <div className={styles.smHeader}>
          <div>
            <p className={styles.smDone}><CheckCircle2 size={16} /> Round complete</p>
            <h2 id="sm-title" className={styles.smTitle}>{session.role}</h2>
            <div className={styles.rowTags}>
              <Tag tone={typeTag(session.type)}>{session.type}</Tag>
              <Tag tone={diffTag(session.difficulty)}>{session.difficulty}</Tag>
            </div>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close summary"><X size={16} /></button>
        </div>

        <div className={styles.smBody}>
          <div className={styles.smScore}>
            {tone ? <ScoreRing score={session.score} size={112} /> : <span className={styles.panelUngraded}>—</span>}
            {tone && <span className={styles.scorePill} style={{ background: tone.soft, color: tone.color }}>{tone.label}</span>}
            <span className={styles.smMeta}>{session.questions} questions · {session.duration} min</span>
          </div>
          <Bullets strengths={session.strengths} improvements={session.improvements} />
        </div>

        {session.breakdown.length > 0 && (
          <div className={styles.smBars}>
            <h3 className={styles.panelSectionTitle}>Question scores</h3>
            <div className={styles.smBarRow}>
              {session.breakdown.map(item => (
                <div key={item.id} className={styles.smBarCol}>
                  <div className={styles.smBarTrack}>
                    <div className={styles.smBarFill} style={{ height: `${Math.max(4, item.score * 10)}%`, background: questionTone(item.score) }} />
                  </div>
                  <span className={styles.smBarScore} style={{ color: questionTone(item.score) }}>{item.score}</span>
                  <span className={styles.smBarName}>Q{item.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD — stats first; the setup form lives in a dialog
// ═══════════════════════════════════════════════════════════
const TYPE_ICON = {
  Mixed:      <Layers size={17} />,
  Technical:  <Code2 size={17} />,
  Behavioral: <Users size={17} />,
};
const RECENT_LIMIT = 6;
const NOTES_LIMIT  = 4;

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function formatMinutes(m) {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

function summarize(list) {
  const graded  = list.filter(s => s.scored);
  const avg     = graded.length ? Math.round(graded.reduce((a, s) => a + s.score, 0) / graded.length) : null;
  const best    = graded.reduce((b, s) => (!b || s.score > b.score ? s : b), null);
  const minutes = list.reduce((a, s) => a + (s.duration || 0), 0);
  const questions = list.reduce((a, s) => a + (s.questions || 0), 0);
  return { graded, avg, best, minutes, questions };
}

// Most recent first, one line each, no repeats
function collectNotes(list, key) {
  const seen = new Set();
  const out = [];
  for (const s of list) {
    for (const text of s[key]) {
      const k = text.trim().toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ text, role: s.role, date: s.date, id: `${s.id}-${out.length}` });
      if (out.length === NOTES_LIMIT) return out;
    }
  }
  return out;
}

// ─── Score banner: the average and how it has moved ────────
function ScoreBanner({ list, stats }) {
  const shown  = useCountUp(stats.avg);
  const latest = stats.graded[0];
  const prev   = stats.graded[1];
  const bars   = stats.graded.slice(0, 16).reverse(); // oldest left, newest right
  const focus  = list.find(s => s.improvements.length)?.improvements[0];

  let sub = stats.graded.length
    ? `Across ${plural(stats.graded.length, 'graded round')}.`
    : 'Scores appear once a round has been graded.';
  if (latest && prev) {
    const d = latest.score - prev.score;
    sub += ` Your latest scored ${latest.score}, ${d > 0 ? `up ${d}` : d < 0 ? `down ${-d}` : 'level'} from the one before.`;
  }

  return (
    <section className={styles.banner} aria-labelledby="avg-label">
      <div className={styles.bannerMain}>
        <h2 id="avg-label" className={styles.bannerLabel}>Average score</h2>
        <p className={styles.bannerFigure}>
          {stats.avg == null
            ? '—'
            : <><span aria-hidden="true">{shown}</span><span className={styles.srOnly}>{stats.avg} out of 100</span></>}
          <span className={styles.bannerOf} aria-hidden="true">/100</span>
        </p>
        <p className={styles.bannerSub}>{sub}</p>
        {focus && <p className={styles.bannerFocus}><strong>Next focus.</strong> {focus}</p>}
      </div>

      {bars.length > 1 && (
        <div
          className={styles.trend}
          role="img"
          aria-label={`Scores for your last ${bars.length} graded rounds, oldest to newest: ${bars.map(s => s.score).join(', ')}`}
        >
          {bars.map((s, i) => (
            <span key={s.id} className={styles.trendCol} title={`${s.role}, ${s.date}: ${s.score}`}>
              <span
                className={styles.trendBar}
                data-latest={i === bars.length - 1 || undefined}
                style={{ height: `${Math.max(6, s.score)}%` }}
              />
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Overview numbers ──────────────────────────────────────
function StatsStrip({ list, stats }) {
  const perRound = list.length ? Math.round(stats.minutes / list.length) : 0;
  return (
    <dl className={styles.stats}>
      <div className={styles.stat}>
        <dt>Rounds</dt>
        <dd className={styles.statValue}>{list.length}</dd>
        <dd className={styles.statNote}>{stats.graded.length} graded</dd>
      </div>
      <div className={styles.stat}>
        <dt>Best score</dt>
        <dd className={styles.statValue}>{stats.best ? stats.best.score : '—'}</dd>
        <dd className={styles.statNote}>{stats.best ? stats.best.role : 'No graded rounds'}</dd>
      </div>
      <div className={styles.stat}>
        <dt>Practice time</dt>
        <dd className={styles.statValue}>{formatMinutes(stats.minutes)}</dd>
        <dd className={styles.statNote}>About {perRound} min a round</dd>
      </div>
      <div className={styles.stat}>
        <dt>Questions</dt>
        <dd className={styles.statValue}>{stats.questions}</dd>
        <dd className={styles.statNote}>Asked across all rounds</dd>
      </div>
    </dl>
  );
}

function SectionHead({ id, title, action }) {
  return (
    <div className={styles.sectionHead}>
      <h2 id={id} className={styles.sectionTitle}>{title}</h2>
      {action}
    </div>
  );
}

// ─── By interview type: each card filters the page ─────────
function TypeCards({ sessions, onPick }) {
  return (
    <div className={styles.typeGrid}>
      {INTERVIEW_TYPES.map(t => {
        const rounds = sessions.filter(s => s.type === t);
        const st = summarize(rounds);
        return (
          <button key={t} type="button" className={styles.card} onClick={() => onPick(t)} aria-label={`Show ${t} rounds`}>
            <span className={styles.cardIcon} style={{ background: typeTag(t).bg, color: typeTag(t).color }}>{TYPE_ICON[t]}</span>
            <span className={styles.cardBody}>
              <span className={styles.cardTitle}>{t}</span>
              <span className={styles.cardMeta}>
                {rounds.length ? `${plural(rounds.length, 'round')}, ${formatMinutes(st.minutes)}` : 'No rounds yet'}
              </span>
              <span className={styles.meter} aria-hidden="true">
                <span className={styles.meterFill} style={{ width: `${st.avg ?? 0}%` }} />
              </span>
            </span>
            <span className={`${styles.cardScore} ${styles.cardScoreStack}`}>
              {st.avg ?? '—'}
              <span className={styles.cardScoreLabel}>avg</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── One past round ────────────────────────────────────────
function RoundCard({ session, onOpen }) {
  const tone = session.scored ? scoreTone(session.score) : null;
  return (
    <button type="button" className={styles.card} onClick={onOpen}>
      <span className={styles.cardIcon}><RoleIcon role={session.role} size={17} /></span>
      <span className={styles.cardBody}>
        <span className={styles.cardTitle}>{session.role}</span>
        <span className={styles.cardTags}>
          <Tag tone={typeTag(session.type)}>{session.type}</Tag>
          <Tag tone={diffTag(session.difficulty)}>{session.difficulty}</Tag>
        </span>
        <span className={styles.cardMeta}>
          {session.date} · {plural(session.questions, 'question')} · {session.duration} min
        </span>
      </span>
      <span className={styles.cardScore}>
        {tone
          ? <><span className={styles.scoreDot} style={{ background: tone.color }} />{session.score}</>
          : <span className={styles.cardUngraded}>Not graded</span>}
      </span>
    </button>
  );
}

// ─── Coaching notes pulled from recent rounds ──────────────
function NotesList({ id, title, notes, icon, tone }) {
  return (
    <section className={styles.notes} aria-labelledby={id}>
      <h3 id={id} className={styles.notesTitle}>{title}</h3>
      {notes.length === 0
        ? <p className={styles.notesEmpty}>Nothing saved yet. Notes appear after a round is graded.</p>
        : (
          <ul className={styles.notesList}>
            {notes.map(n => (
              <li key={n.id} className={styles.note}>
                <span className={styles.noteIcon} style={{ color: tone }} aria-hidden="true">{icon}</span>
                <span className={styles.noteBody}>
                  <span className={styles.noteText}>{n.text}</span>
                  <span className={styles.noteSource}>{n.role}, {n.date}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// Main page export
// ═══════════════════════════════════════════════════════════
export default function MockInterviewPage({ accessToken, onSessionChange }) {
  const [form, setForm] = useState({
    jobRole: '', interviewType: 'Mixed', difficulty: 'Entry Level',
    questionCount: 10, jobDescription: '',
  });
  const [resumeFile, setResumeFile]         = useState(null);
  const [session, setSession]               = useState(null);
  const [summarySession, setSummarySession] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [starting, setStarting]             = useState(false);
  const [startError, setStartError]         = useState('');
  const [roleError, setRoleError]           = useState(false);
  const [setupOpen, setSetupOpen]           = useState(false);
  const [sessions, setSessions]             = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError]     = useState('');
  const [attempt, setAttempt]               = useState(0);
  const [typeFilter, setTypeFilter]         = useState('All');
  const [search, setSearch]                 = useState('');
  const [sortByScore, setSortByScore]       = useState(false);
  const [showAll, setShowAll]               = useState(false);
  const fileInputRef = useRef(null);
  const roleInputRef = useRef(null);
  const dialogRef    = useRef(null);

  // Tell the dashboard when a live round starts/ends so it can hide its chrome
  const live = !!session;
  useEffect(() => { onSessionChange?.(live); }, [live]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => onSessionChange?.(false), []);   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getInterviewHistory({ accessToken })
      .then(data => { setSessions(data.map(mapApiToSession)); setHistoryError(''); })
      .catch(() => setHistoryError('We couldn’t load your rounds. Check your connection, then try again.'))
      .finally(() => setHistoryLoading(false));
  }, [accessToken, attempt]);

  // The native dialog gives us Esc, focus trapping and an inert page for free
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (setupOpen && !d.open) { d.showModal(); roleInputRef.current?.focus(); }
    if (!setupOpen && d.open) d.close();
  }, [setupOpen]);

  const retryHistory = () => { setHistoryError(''); setHistoryLoading(true); setAttempt(a => a + 1); };

  const set    = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const choose = (field) => (v) => setForm(prev => ({ ...prev, [field]: v }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
    e.target.value = '';
  };

  const handleStart = async () => {
    if (!form.jobRole.trim()) { setRoleError(true); roleInputRef.current?.focus(); return; }
    setRoleError(false);
    setStartError('');
    setStarting(true);
    try {
      const res = await startInterview({
        jobTitle:           form.jobRole.trim(),
        interviewType:      form.interviewType,
        difficulty:         form.difficulty,
        questionCount:      parseInt(form.questionCount, 10),
        resumeText:         null,
        jobDescriptionText: form.jobDescription || null,
        accessToken,
      });
      setSetupOpen(false);
      setSession({
        interviewId:    res.interviewId,
        questionNumber: res.questionNumber,
        questionText:   res.questionText,
        totalQuestions: parseInt(form.questionCount, 10),
        jobTitle:       form.jobRole.trim(),
        interviewType:  form.interviewType,
      });
    } catch (err) {
      setStartError(err.message || 'We couldn’t start the round. Check your connection and try again.');
    } finally {
      setStarting(false);
    }
  };

  // Round finished: refresh history, then show the summary for that round
  const handleComplete = (completedInterviewId) => {
    getInterviewHistory({ accessToken })
      .then(data => {
        const mapped = data.map(mapApiToSession);
        setSessions(mapped);
        setHistoryError('');
        setSession(null);
        const match = completedInterviewId ? mapped.find(s => s.id === completedInterviewId) : null;
        if (match) setSummarySession(match);
      })
      .catch(() => { setSession(null); retryHistory(); });
  };

  // Live round — the session owns the screen
  if (session) {
    return (
      <div className={styles.page}>
        <InterviewSession
          interviewId={session.interviewId}
          questionNumber={session.questionNumber}
          questionText={session.questionText}
          totalQuestions={session.totalQuestions}
          jobTitle={session.jobTitle}
          interviewType={session.interviewType}
          accessToken={accessToken}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  const minutes   = Math.round(form.questionCount * MINUTES_PER_QUESTION);
  const hasRounds = !historyLoading && !historyError && sessions.length > 0;

  // Filters apply to every section, so the numbers always describe what's listed
  const query = search.trim().toLowerCase();
  const list  = sessions.filter(s =>
    (typeFilter === 'All' || s.type === typeFilter) &&
    (!query || s.role.toLowerCase().includes(query) || s.type.toLowerCase().includes(query))
  );
  const stats   = summarize(list);
  const ordered = sortByScore ? [...list].sort((a, b) => b.score - a.score) : list;
  const shown   = showAll ? ordered : ordered.slice(0, RECENT_LIMIT);
  const clearFilters = () => { setTypeFilter('All'); setSearch(''); };

  const openSetup = () => { setStartError(''); setSetupOpen(true); };

  let content;
  if (historyLoading) {
    content = (
      <div className={styles.stack} aria-busy="true">
        <div className={`${styles.skeleton} ${styles.skeletonBanner}`} />
        <div className={`${styles.skeleton} ${styles.skeletonStats}`} />
        <div className={`${styles.skeleton} ${styles.skeletonCards}`} />
      </div>
    );
  } else if (historyError) {
    content = (
      <div className={`${styles.notice} ${styles.noticeAction}`} role="alert">
        <AlertCircle size={16} />
        <span>{historyError}</span>
        <button type="button" className={styles.btnSecondary} onClick={retryHistory}>Try again</button>
      </div>
    );
  } else if (!hasRounds) {
    content = (
      <section className={styles.emptyBanner} aria-labelledby="empty-title">
        <h2 id="empty-title" className={styles.emptyBannerTitle}>No rounds yet</h2>
        <p className={styles.emptyBannerText}>
          Run a practice round and this page fills in with your scores, practice time and notes on what to work on.
        </p>
        <button type="button" className={styles.btnLight} onClick={openSetup}>
          <Play size={15} /> Start your first round
        </button>
      </section>
    );
  } else if (list.length === 0) {
    content = (
      <div className={`${styles.notice} ${styles.noticeAction}`}>
        <Search size={16} />
        <span>No rounds match these filters.</span>
        <button type="button" className={styles.btnSecondary} onClick={clearFilters}>Clear filters</button>
      </div>
    );
  } else {
    content = (
      <div className={styles.stack}>
        <ScoreBanner list={list} stats={stats} />

        <section aria-labelledby="overview-title">
          <SectionHead id="overview-title" title="Overview" />
          <StatsStrip list={list} stats={stats} />
        </section>

        {typeFilter === 'All' && (
          <section aria-labelledby="types-title">
            <SectionHead id="types-title" title="By interview type" />
            <TypeCards sessions={list} onPick={setTypeFilter} />
          </section>
        )}

        <section aria-labelledby="rounds-title">
          <SectionHead
            id="rounds-title"
            title={sortByScore ? 'Rounds by score' : 'Recent rounds'}
            action={ordered.length > RECENT_LIMIT && (
              <button type="button" className={styles.linkBtn} onClick={() => setShowAll(v => !v)} aria-expanded={showAll}>
                {showAll ? 'Show fewer' : `Show all ${ordered.length}`}
              </button>
            )}
          />
          <div className={styles.cardGrid}>
            {shown.map(s => <RoundCard key={s.id} session={s} onOpen={() => setSelectedSession(s)} />)}
          </div>
        </section>

        <section aria-labelledby="notes-title">
          <SectionHead id="notes-title" title="Coaching notes" />
          <div className={styles.notesGrid}>
            <NotesList id="notes-next" title="Work on next" notes={collectNotes(list, 'improvements')}
              icon={<AlertCircle size={15} />} tone="var(--color-warning)" />
            <NotesList id="notes-good" title="What’s working" notes={collectNotes(list, 'strengths')}
              icon={<CheckCircle2 size={15} />} tone="var(--color-success-strong)" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className={styles.page}>

      <AnimatePresence>
        {summarySession && (
          <SummaryModal key="summary-modal" session={summarySession} onClose={() => setSummarySession(null)} />
        )}
      </AnimatePresence>

      <div className={styles.shell}>
        <h1 className={styles.pageTitle}>Mock interviews</h1>

        <div className={styles.toolbar}>
          {hasRounds && (
            <div className={styles.tabs} role="radiogroup" aria-label="Filter by interview type">
              {TYPE_FILTERS.map(t => (
                <button key={t} type="button" role="radio" aria-checked={typeFilter === t}
                  className={styles.tab} onClick={() => setTypeFilter(t)}>
                  {t}
                </button>
              ))}
            </div>
          )}
          <div className={styles.toolbarEnd}>
            {hasRounds && (
              <>
                <label className={styles.search}>
                  <Search size={15} className={styles.searchIcon} aria-hidden="true" />
                  <input
                    className={styles.searchInput}
                    type="search"
                    placeholder="Search"
                    aria-label="Search rounds by role or type"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => setSortByScore(v => !v)}
                  aria-pressed={sortByScore}
                  aria-label="Sort rounds by score"
                  title={sortByScore ? 'Sorted by score' : 'Sorted by date'}
                >
                  <ArrowDownUp size={15} />
                </button>
              </>
            )}
            <button type="button" className={styles.btnNew} onClick={openSetup}>
              <Plus size={15} /> New interview
            </button>
          </div>
        </div>

        {content}
      </div>

      {/* ── Setup dialog ── */}
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="setup-title"
        onClose={() => setSetupOpen(false)}
        onClick={e => { if (e.target === e.currentTarget) setSetupOpen(false); }}
      >
        <form className={styles.dialogForm} onSubmit={e => { e.preventDefault(); handleStart(); }} noValidate>
          <div className={styles.dialogHead}>
            <h2 id="setup-title" className={styles.dialogTitle}>New interview</h2>
            <button type="button" className={styles.iconBtn} onClick={() => setSetupOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div className={styles.dialogBody}>
            <div className={styles.field}>
              <label htmlFor="iv-role" className={styles.label}>Job role</label>
              <input
                ref={roleInputRef}
                id="iv-role"
                type="text"
                className={styles.input}
                placeholder="Software Engineer"
                value={form.jobRole}
                onChange={e => { set('jobRole')(e); if (roleError) setRoleError(false); }}
                aria-invalid={roleError}
                aria-describedby={roleError ? 'iv-role-help' : undefined}
              />
              {roleError && (
                <p id="iv-role-help" className={`${styles.help} ${styles.helpError}`}>
                  <AlertCircle size={13} />Add the role you’re interviewing for so the questions fit it.
                </p>
              )}
            </div>

            <div className={styles.field}>
              <OptionGroup label="Interview type" options={INTERVIEW_TYPES}
                value={form.interviewType} onChange={choose('interviewType')} />
              <p className={styles.help}>{TYPE_COACHING[form.interviewType]}</p>
            </div>

            <div className={styles.pair}>
              <OptionGroup label="Level" options={DIFFICULTIES}
                value={form.difficulty} onChange={choose('difficulty')}
                format={d => d.replace(' Level', '')} />
              <OptionGroup label="Questions" options={QUESTION_COUNTS}
                value={form.questionCount} onChange={choose('questionCount')} />
            </div>

            <div className={styles.field}>
              <label htmlFor="iv-jd" className={styles.label}>
                Job description <span className={styles.optional}>optional</span>
              </label>
              <textarea id="iv-jd" className={styles.textarea} rows={3}
                placeholder="Paste the posting to tailor the questions"
                value={form.jobDescription} onChange={set('jobDescription')} />
            </div>

            <div className={styles.field}>
              <span className={styles.label} id="iv-resume-label">
                Resume <span className={styles.optional}>optional</span>
              </span>
              {resumeFile ? (
                <div className={styles.fileChip}>
                  <FileText size={16} aria-hidden="true" />
                  <span className={styles.fileName}>{resumeFile.name}</span>
                  <button type="button" className={styles.iconBtn} onClick={() => setResumeFile(null)} aria-label={`Remove ${resumeFile.name}`}>
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <button type="button" className={styles.upload} onClick={() => fileInputRef.current?.click()} aria-labelledby="iv-resume-label">
                  <Upload size={16} aria-hidden="true" /> Choose a PDF or DOCX
                </button>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,.docx" hidden onChange={handleFileChange} />
            </div>

            {startError && <p className={styles.notice} role="alert"><AlertCircle size={16} />{startError}</p>}
          </div>

          <div className={styles.dialogFoot}>
            <p className={styles.dialogSummary}>
              <Mic size={14} aria-hidden="true" />
              {form.questionCount} questions, about {minutes} min, answered out loud
            </p>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setSetupOpen(false)}>Cancel</button>
              <button type="submit" className={styles.btnPrimary} disabled={starting} aria-busy={starting}>
                {starting
                  ? <><Loader2 size={16} className={styles.spin} /> Starting…</>
                  : <><Play size={15} /> Start interview</>}
              </button>
            </div>
          </div>
        </form>
      </dialog>

      <AnimatePresence>
        {selectedSession && (
          <FeedbackModal key={selectedSession.id} session={selectedSession} onClose={() => setSelectedSession(null)} />
        )}
      </AnimatePresence>

    </div>
    </MotionConfig>
  );
}
