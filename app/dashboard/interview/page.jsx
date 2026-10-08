'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from 'motion/react';
import { startInterview, getInterviewHistory, deleteInterview } from '@/app/Services/InterviewService';
import InterviewSession from './InterviewSession';
import {
  Mic, Code2, Server, Briefcase, BarChart2, Headphones, Layers, Users,
  Calendar, Search, RotateCw, ArrowDownUp, Plus,
  CheckCircle2, AlertCircle, X, Download, Upload, FileText, Play, Loader2,
  Phone, MessageSquareQuote, Building2, Clock, Trash2,
  EllipsisVertical, MessageSquareText, RotateCcw, Copy, Check,
  ArrowUpRight, ArrowDownRight, Minus,
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

// ─── Entrance: one short sequence when the rounds arrive ───
// Sections settle in order; inside them the data itself moves
// (bars grow, meters fill). MotionConfig below honours reduced motion.
const EASE_OUT = [0.16, 1, 0.3, 1];
const stackIn = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const riseIn  = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};
const gridIn  = { hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } } };

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

// ─── Summary (shown right after a round completes) ─────────
// One sequence: a check draws itself, its circle becomes the score ring
// and fills while the number counts up, then each question's score
// cascades in. Stays open until closed.
const SM_RING   = 112;
const SM_STROKE = 6;
const SM_R      = (SM_RING - SM_STROKE) / 2;
const CHECK_MS  = 950;                      // how long the check holds before the ring takes over
const ROWS_AT   = CHECK_MS / 1000 + 0.75;   // rows start once the ring is mostly filled

function SummaryFigure({ score }) {
  const shown = useCountUp(score, 900);
  return (
    <span className={styles.smFigure} aria-hidden="true">{shown}</span>
  );
}

function SummaryModal({ session, onClose, onSeeFeedback }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(reduced ? 'score' : 'check');
  const onCloseRef = useRef(onClose);
  const doneRef    = useRef(null);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    doneRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current(); };
    window.addEventListener('keydown', onKey);
    const id = reduced ? null : setTimeout(() => setPhase('score'), CHECK_MS);
    return () => { clearTimeout(id); window.removeEventListener('keydown', onKey); };
  }, [reduced]);

  const graded = session.scored;
  const ringColor = graded ? scoreTone(session.score).color : 'var(--color-success)';
  const c = SM_RING / 2;
  // Long rounds keep the whole cascade under about 1.4s
  const step = Math.min(0.08, 1.4 / Math.max(1, session.breakdown.length));

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
        aria-describedby="sm-result"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        onClick={e => e.stopPropagation()}
      >
        <button type="button" className={`${styles.iconBtn} ${styles.smClose}`} onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        <div className={styles.smHead}>
          <div className={styles.smRing} style={{ width: SM_RING, height: SM_RING }}>
            <svg width={SM_RING} height={SM_RING} viewBox={`0 0 ${SM_RING} ${SM_RING}`} aria-hidden="true">
              {/* Track appears with the ring */}
              <motion.circle cx={c} cy={c} r={SM_R} fill="none" strokeWidth={SM_STROKE}
                style={{ stroke: 'var(--color-paper-3)' }}
                initial={false}
                animate={{ opacity: phase === 'score' ? 1 : 0 }}
                transition={{ duration: 0.3 }} />
              {/* The check's circle draws closed, empties, then fills to the score */}
              <motion.circle cx={c} cy={c} r={SM_R} fill="none" strokeWidth={SM_STROKE} strokeLinecap="round"
                transform={`rotate(-90 ${c} ${c})`}
                initial={{ pathLength: reduced ? (graded ? session.score / 100 : 1) : 0 }}
                animate={phase === 'check' || !graded
                  ? { pathLength: 1, stroke: 'var(--color-success)' }
                  : { pathLength: reduced ? session.score / 100 : [1, 0, session.score / 100], stroke: ringColor }}
                transition={phase === 'check' || !graded
                  ? { duration: 0.45, ease: EASE_OUT }
                  : {
                      pathLength: { duration: 1.1, times: [0, 0.2, 1], ease: ['easeIn', EASE_OUT] },
                      stroke: { duration: 0.25 },
                    }} />
            </svg>

            <AnimatePresence mode="wait" initial={false}>
              {phase === 'check' || !graded ? (
                <motion.svg key="check" className={styles.smCheck} viewBox="0 0 24 24" aria-hidden="true"
                  exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.18 } }}>
                  <motion.path d="M6 12.5l4 4 8-9" fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                    style={{ stroke: 'var(--color-success)' }}
                    initial={{ pathLength: reduced ? 1 : 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.35, delay: 0.35, ease: EASE_OUT }} />
                </motion.svg>
              ) : (
                <motion.span key="score" className={styles.smFigureWrap}
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}>
                  <SummaryFigure score={session.score} />
                  <span className={styles.smOf} aria-hidden="true">/100</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <h2 id="sm-title" className={styles.smTitle}>{session.role}</h2>
          <p id="sm-result" className={styles.smMeta}>
            Round complete in {session.duration} min
            <span className={styles.srOnly}>{graded ? `. Score ${session.score} out of 100.` : '. Not graded yet.'}</span>
          </p>
        </div>

        {session.breakdown.length > 0 && (
          <ol className={styles.smList} aria-label="Score for each question">
            {session.breakdown.map((item, i) => {
              const tone  = questionTone(item.score);
              const delay = (reduced ? 0 : ROWS_AT) + i * step;
              return (
                <motion.li key={item.id} className={styles.smItem}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay, ease: EASE_OUT }}>
                  <span className={styles.smNum}>{i + 1}</span>
                  <span className={styles.smQ}>
                    <span className={styles.smQText} title={item.q}>{item.q}</span>
                    <span className={styles.smTrack} aria-hidden="true">
                      <motion.span className={styles.smFill}
                        style={{ background: tone, width: `${Math.max(2, item.score * 10)}%`, originX: 0 }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.55, delay: delay + 0.1, ease: EASE_OUT }} />
                    </span>
                  </span>
                  <span className={styles.smScore} style={{ color: item.score > 0 ? tone : 'var(--color-neutral)' }}>
                    {item.score > 0 ? item.score : '—'}
                    <span className={styles.srOnly}> out of 10</span>
                  </span>
                </motion.li>
              );
            })}
          </ol>
        )}

        <div className={styles.smActions}>
          <button type="button" className={styles.btnSecondary} onClick={onSeeFeedback}>See feedback</button>
          <button ref={doneRef} type="button" className={styles.btnPrimary} onClick={onClose}>Done</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD — stats first; the setup form lives in a dialog
// ═══════════════════════════════════════════════════════════
const TYPE_ICON = {
  Mixed:      <Layers size={18} />,
  Technical:  <Code2 size={18} />,
  Behavioral: <Users size={18} />,
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
    <motion.section variants={riseIn} className={styles.banner} aria-labelledby="avg-label">
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
              <motion.span
                className={styles.trendBar}
                data-latest={i === bars.length - 1 || undefined}
                style={{ height: `${Math.max(6, s.score)}%`, originY: 1 }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.035, ease: EASE_OUT }}
              />
            </span>
          ))}
        </div>
      )}
    </motion.section>
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

// ─── By interview type: square stat tiles, read-only ───────
// Unlike the round rows these aren't buttons: gray icon, the average
// large in the middle, and a form tag as the tile's only colour.
function formTag(avg) {
  if (avg == null) return { label: 'Not practiced', bg: 'var(--color-paper-3)',     color: 'var(--color-neutral)' };
  if (avg >= 80)   return { label: 'In good form',  bg: 'var(--color-success-soft)', color: 'var(--color-success-strong)' };
  if (avg >= 60)   return { label: 'Getting there', bg: 'var(--color-accent-soft)',  color: 'var(--color-accent-strong)' };
  return               { label: 'Needs work',    bg: 'var(--color-error-soft)',   color: 'var(--color-error)' };
}

// Latest graded round of the type against the one before it (list is newest first)
function typeTrend(graded) {
  if (graded.length < 2) return null;
  const d = graded[0].score - graded[1].score;
  if (d > 0) return { icon: <ArrowUpRight size={13} aria-hidden="true" />,   text: `Up ${d}` };
  if (d < 0) return { icon: <ArrowDownRight size={13} aria-hidden="true" />, text: `Down ${-d}` };
  return { icon: <Minus size={13} aria-hidden="true" />, text: 'Level' };
}

function TypeCards({ sessions }) {
  return (
    <div className={styles.typeGrid}>
      {INTERVIEW_TYPES.map(t => {
        const rounds = sessions.filter(s => s.type === t);
        const st     = summarize(rounds);
        const tag    = formTag(st.avg);
        const trend  = typeTrend(st.graded);
        const id     = `type-${t.toLowerCase()}`;
        return (
          <article key={t} className={styles.typeTile} aria-labelledby={id}>
            <span className={styles.typeIcon} aria-hidden="true">{TYPE_ICON[t]}</span>
            <h3 id={id} className={styles.typeName}>{t}</h3>

            <p className={styles.typeAvg}>
              {st.avg ?? '—'}
              <span className={styles.srOnly}>{st.avg == null ? ' No graded rounds' : ' average out of 100'}</span>
            </p>
            <span className={styles.typeTag} style={{ background: tag.bg, color: tag.color }}>{tag.label}</span>

            {(st.best || trend) && (
              <p className={styles.typeFacts}>
                {st.best && <span>Best {st.best.score}</span>}
                {trend && <span className={styles.typeTrend}>{trend.icon}{trend.text}<span className={styles.srOnly}> since the previous round</span></span>}
              </p>
            )}
            <p className={styles.typeMeta}>
              {rounds.length ? `${plural(rounds.length, 'round')}, ${formatMinutes(st.minutes)}` : 'No rounds yet'}
            </p>
          </article>
        );
      })}
    </div>
  );
}

// ─── Round actions menu (⋮) ────────────────────────────────
// Menu-button pattern: arrows move between items, Esc and outside clicks close
// it and hand focus back to the trigger. Opens upward near the bottom of the screen.
const MENU_HEIGHT = 190;

function plainResults(s) {
  const lines = [`${s.role} mock interview, ${s.date}`, s.scored ? `Score: ${s.score}/100` : 'Not graded'];
  s.breakdown.forEach((q, i) => lines.push(`${i + 1}. ${q.q} (${q.score > 0 ? `${q.score}/10` : 'not scored'})`));
  return lines.join('\n');
}

function RoundMenu({ session, triggerRef, onView, onPractice, onDelete }) {
  const [open, setOpen]     = useState(false);
  const [upward, setUpward] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);
  const menuId  = `round-menu-${session.id}`;

  const close = (refocus = true) => {
    setOpen(false);
    setCopied(false);
    if (refocus) triggerRef.current?.focus();
  };
  const toggle = () => {
    if (open) { close(false); return; }
    const r = triggerRef.current?.getBoundingClientRect();
    setUpward(!!r && window.innerHeight - r.bottom < MENU_HEIGHT && r.top > MENU_HEIGHT);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    const onDown = (e) => {
      if (!menuRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) {
        setOpen(false);
        setCopied(false);
      }
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, triggerRef]);

  const onKeyDown = (e) => {
    const items = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') close(false);
  };

  const pick = (fn) => () => { close(false); fn(); };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plainResults(session));
      setCopied(true);
      setTimeout(() => close(), 900); // leave "Copied" up long enough to read
    } catch {
      close();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.moreBtn}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Actions for the ${session.role} round from ${session.date}`}
      >
        <EllipsisVertical size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={`${session.role} round`}
            className={styles.menu}
            data-upward={upward || undefined}
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, scale: 0.96, y: upward ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.14, ease: EASE_OUT } }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
          >
            <button type="button" role="menuitem" className={styles.menuItem} onClick={pick(onView)}>
              <MessageSquareText size={15} aria-hidden="true" /> View feedback
            </button>
            <button type="button" role="menuitem" className={styles.menuItem} onClick={pick(onPractice)}>
              <RotateCcw size={15} aria-hidden="true" /> Practice again
            </button>
            <button type="button" role="menuitem" className={styles.menuItem} onClick={copy} aria-live="polite">
              {copied
                ? <><Check size={15} aria-hidden="true" /> Copied</>
                : <><Copy size={15} aria-hidden="true" /> Copy results</>}
            </button>
            <button type="button" role="menuitem" className={`${styles.menuItem} ${styles.menuDanger}`} onClick={pick(onDelete)}>
              <Trash2 size={15} aria-hidden="true" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── One past round ────────────────────────────────────────
// Delete asks in place: the card turns into its own confirmation.
function RoundCard({ session, onOpen, onDelete, onPractice }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [error, setError]           = useState('');
  const keepRef = useRef(null);
  const moreRef = useRef(null);
  const asked   = useRef(false);
  const tone = session.scored ? scoreTone(session.score) : null;

  // Focus follows the swap: to "Keep it" when asked, back to the ⋮ button when kept
  useEffect(() => {
    if (confirming) { asked.current = true; keepRef.current?.focus(); }
    else if (asked.current) moreRef.current?.focus();
  }, [confirming]);

  const keep = () => { setConfirming(false); setError(''); };
  const confirmDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await onDelete(session.id); // parent drops the card on success
    } catch {
      setError('The round wasn’t deleted. Check your connection, then try again.');
      setDeleting(false);
    }
  };

  // One persistent wrapper, so the card can animate out and its neighbours slide up
  return (
    <motion.div
      layout
      variants={riseIn}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: [0.7, 0, 0.84, 0] } }}
      className={styles.roundItem}
    >
      {confirming ? (
        <div
          className={styles.roundConfirm}
          role="group"
          aria-labelledby={`del-${session.id}`}
          onKeyDown={e => { if (e.key === 'Escape' && !deleting) keep(); }}
        >
          <p id={`del-${session.id}`} className={styles.confirmText}>
            Delete this round and its feedback?
            <span className={styles.srOnly}> {session.role}, {session.date}.</span>
          </p>
          {error && <p className={styles.confirmError} role="alert"><AlertCircle size={14} />{error}</p>}
          <div className={styles.confirmActions}>
            <button ref={keepRef} type="button" className={styles.btnSecondary} onClick={keep} disabled={deleting}>
              Keep it
            </button>
            <button type="button" className={styles.btnDanger} onClick={confirmDelete} disabled={deleting} aria-busy={deleting}>
              {deleting ? <><Loader2 size={15} className={styles.spin} /> Deleting…</> : <><Trash2 size={15} /> Delete</>}
            </button>
          </div>
        </div>
      ) : (
        <>
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
          <RoundMenu
            session={session}
            triggerRef={moreRef}
            onView={onOpen}
            onPractice={() => onPractice(session)}
            onDelete={() => setConfirming(true)}
          />
        </>
      )}
    </motion.div>
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

// ─── Empty state: nothing to show yet, so offer starting points ──
// Each starter only presets the setup dialog; the user still names the role.
const STARTERS = [
  { title: 'First-round screen',  type: 'Mixed',      difficulty: 'Entry Level',  count: 5,  icon: <Phone size={16} />,
    text: 'A short mix of behavioral and technical questions, like a recruiter’s first call.' },
  { title: 'Stories from past work', type: 'Behavioral', difficulty: 'Mid Level', count: 5,  icon: <MessageSquareQuote size={16} />,
    text: 'Talk through situations you’ve handled: what happened, what you did and how it turned out.' },
  { title: 'Technical deep dive', type: 'Technical',  difficulty: 'Mid Level',    count: 10, icon: <Code2 size={16} />,
    text: 'Explain how you’d build and debug things, thinking out loud as you go.' },
  { title: 'Final-round loop',    type: 'Mixed',      difficulty: 'Senior Level', count: 15, icon: <Building2 size={16} />,
    text: 'A longer round with harder follow-ups, closer to meeting the hiring team.' },
];

function EmptyState({ onPick }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyHero}>
        <Mic className={styles.emptyArt} strokeWidth={1.5} aria-hidden="true" />
        <p className={styles.emptyText}>No practice rounds yet. Pick a starting point, or set up your own.</p>
      </div>

      <div className={styles.emptyRule} aria-hidden="true" />

      <section aria-labelledby="starters-title">
        <h2 id="starters-title" className={styles.srOnly}>Starting points</h2>
        <ul className={styles.starters}>
          {STARTERS.map(s => (
            <li key={s.title}>
              <button type="button" className={styles.starter} onClick={() => onPick(s)}>
                <span className={styles.starterIcon} aria-hidden="true">{s.icon}</span>
                <span className={styles.starterBody}>
                  <span className={styles.starterTitle}>{s.title}</span>
                  <span className={styles.starterText}>{s.text}</span>
                  <span className={styles.starterMeta}>
                    <Clock size={13} aria-hidden="true" />
                    {s.count} questions, about {Math.round(s.count * MINUTES_PER_QUESTION)} min
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
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

  // Errors are thrown back to the card so it can say so in place
  const handleDelete = async (id) => {
    await deleteInterview({ interviewId: id, accessToken });
    setSessions(prev => prev.filter(s => s.id !== id));
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
  const startFrom = (s) => {
    setForm(prev => ({ ...prev, interviewType: s.type, difficulty: s.difficulty, questionCount: s.count }));
    openSetup();
  };
  // Same role and settings as a past round; the description and resume start empty
  const practiceAgain = (s) => {
    setForm(prev => ({
      ...prev,
      jobRole:       s.role,
      interviewType: INTERVIEW_TYPES.includes(s.type) ? s.type : prev.interviewType,
      difficulty:    DIFFICULTIES.includes(s.difficulty) ? s.difficulty : prev.difficulty,
      questionCount: QUESTION_COUNTS.includes(s.questions) ? s.questions : prev.questionCount,
      jobDescription: '',
    }));
    setRoleError(false);
    openSetup();
  };

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
    content = <EmptyState onPick={startFrom} />;
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
      <motion.div className={styles.stack} variants={stackIn} initial="hidden" animate="show">
        <ScoreBanner list={list} stats={stats} />

        <motion.section variants={riseIn} aria-labelledby="overview-title">
          <SectionHead id="overview-title" title="Overview" />
          <StatsStrip list={list} stats={stats} />
        </motion.section>

        {typeFilter === 'All' && (
          <motion.section variants={riseIn} aria-labelledby="types-title">
            <SectionHead id="types-title" title="By interview type" />
            <TypeCards sessions={list} />
          </motion.section>
        )}

        <motion.section variants={riseIn} aria-labelledby="rounds-title">
          <SectionHead
            id="rounds-title"
            title={sortByScore ? 'Rounds by score' : 'Recent rounds'}
            action={ordered.length > RECENT_LIMIT && (
              <button type="button" className={styles.linkBtn} onClick={() => setShowAll(v => !v)} aria-expanded={showAll}>
                {showAll ? 'Show fewer' : `Show all ${ordered.length}`}
              </button>
            )}
          />
          <motion.div className={styles.cardGrid} variants={gridIn}>
            <AnimatePresence>
              {shown.map(s => (
                <RoundCard key={s.id} session={s} onOpen={() => setSelectedSession(s)}
                  onDelete={handleDelete} onPractice={practiceAgain} />
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.section>

        <motion.section variants={riseIn} aria-labelledby="notes-title">
          <SectionHead id="notes-title" title="Coaching notes" />
          <div className={styles.notesGrid}>
            <NotesList id="notes-next" title="Work on next" notes={collectNotes(list, 'improvements')}
              icon={<AlertCircle size={15} />} tone="var(--color-warning)" />
            <NotesList id="notes-good" title="What’s working" notes={collectNotes(list, 'strengths')}
              icon={<CheckCircle2 size={15} />} tone="var(--color-success-strong)" />
          </div>
        </motion.section>
      </motion.div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className={styles.page}>

      <AnimatePresence>
        {summarySession && (
          <SummaryModal
            key="summary-modal"
            session={summarySession}
            onClose={() => setSummarySession(null)}
            onSeeFeedback={() => { setSelectedSession(summarySession); setSummarySession(null); }}
          />
        )}
      </AnimatePresence>

      <div className={styles.shell}>
        <div className={styles.head}>
          <h1 className={styles.pageTitle}>Mock interviews</h1>
          {/* With nothing to filter, the action sits beside the title */}
          {!hasRounds && (
            <button type="button" className={styles.btnNew} onClick={openSetup}>
              <Plus size={15} /> New interview
            </button>
          )}
        </div>

        {hasRounds && (
          <div className={styles.toolbar}>
            <div className={styles.tabs} role="radiogroup" aria-label="Filter by interview type">
              {TYPE_FILTERS.map(t => (
                <button key={t} type="button" role="radio" aria-checked={typeFilter === t}
                  className={styles.tab} onClick={() => setTypeFilter(t)}>
                  {t}
                </button>
              ))}
            </div>
            <div className={styles.toolbarEnd}>
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
              <button type="button" className={styles.btnNew} onClick={openSetup}>
                <Plus size={15} /> New interview
              </button>
            </div>
          </div>
        )}

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
