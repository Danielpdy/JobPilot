'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { startInterview, getInterviewHistory } from '@/app/Services/InterviewService';
import InterviewSession from './InterviewSession';
import {
  Mic, LayoutDashboard, Code2, Server, Briefcase, BarChart2, Headphones,
  Calendar, Clock, HelpCircle, Search, ChevronRight, RotateCw,
  CheckCircle2, AlertCircle, X, Download, Upload, FileText, Play, Loader2,
  ListChecks, ClipboardCheck, Sparkles, ArrowLeft,
} from 'lucide-react';
import GlassBubbleNav from '@/app/components/ui/GlassBubbleNav/GlassBubbleNav';
import FlipCard from '@/components/FlipCard';
import InfiniteSpiral from '@/components/InfiniteSpiral';
import SpecularButton from '@/components/SpecularButton';
import styles from './page.module.css';

// ─── Nav tabs ─────────────────────────────────────────────
const VIEW_TABS = [
  { label: 'New Interview', icon: <Mic size={14} /> },
  { label: 'Overview',      icon: <LayoutDashboard size={14} /> },
];

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
const DIFF_COACHING = {
  'Entry Level':  'Expect fundamentals and motivation. Clear, honest answers beat buzzwords.',
  'Mid Level':    'Expect follow-ups on trade-offs and the work you owned.',
  'Senior Level': 'Expect scope, judgment and influence — how you decided, not just what you did.',
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

// ─── View transitions: crossfade only ──────────────────────
const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.15, ease: [0.7, 0, 0.84, 0] } },
};

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
        fontSize={size * 0.3} fontWeight="800" style={{ fill: 'var(--color-ink)' }}>{score}</text>
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

// ═══════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════

// ─── Stat-led hero: your average, with a coaching read ─────
function ProgressHero({ sessions }) {
  const graded = sessions.filter(s => s.scored);
  const avg    = graded.length ? Math.round(graded.reduce((a, s) => a + s.score, 0) / graded.length) : null;
  const shown  = useCountUp(avg);

  const latest = graded[0];
  const prev   = graded[1];
  let trend = null;
  if (latest && prev) {
    const diff = latest.score - prev.score;
    trend = diff > 0 ? `Your latest round scored ${latest.score}, up ${diff} from the one before.`
          : diff < 0 ? `Your latest round scored ${latest.score}, down ${-diff} from the one before.`
          : `Your latest round scored ${latest.score}, level with the one before.`;
  } else if (latest) {
    trend = `Your first graded round is on the board at ${latest.score}.`;
  }
  const focus = sessions[0]?.improvements?.[0];

  // Chronological strip — oldest on the left, newest on the right
  const strip = [...sessions].slice(0, 12).reverse();

  return (
    <div className={styles.cq}>
    <section className={styles.hero} aria-labelledby="progress-heading">
      <div className={styles.heroFigureCol}>
        <div className={styles.figure} style={{ color: avg == null ? 'var(--color-muted)' : 'var(--color-navy)' }}>
          {avg == null ? '—' : <><span aria-hidden="true">{shown}</span><span className={styles.srOnly}>{avg}</span></>}
        </div>
        <h2 id="progress-heading" className={styles.heroHeadline}>
          {avg == null
            ? 'No graded rounds yet.'
            : <>average across {graded.length} graded {graded.length === 1 ? 'round' : 'rounds'}.</>}
        </h2>
        {trend && <p className={styles.heroTrend}>{trend}</p>}
        {avg == null && <p className={styles.heroTrend}>Scores show up here once a round has been graded.</p>}
      </div>

      <div className={styles.heroSide}>
        {focus && (
          <div className={styles.focus}>
            <span className={styles.focusLabel}>Focus for your next round</span>
            <p className={styles.focusText}>{focus}</p>
          </div>
        )}
        {strip.length > 1 && (
          <div className={styles.strip} role="img" aria-label={`Scores for your last ${strip.length} rounds, oldest to newest: ${strip.map(s => s.scored ? s.score : 'not graded').join(', ')}`}>
            {strip.map(s => (
              <span key={s.id} className={styles.stripCol}>
                <span className={styles.stripTrack}>
                  <span
                    className={`${styles.stripBar} ${s.scored ? '' : styles.stripBarEmpty}`}
                    style={s.scored ? { height: `${Math.max(6, s.score)}%`, background: scoreTone(s.score).color } : undefined}
                  />
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────
function EmptyInterviewState({ onStart }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}><Mic size={22} /></span>
      <h2 className={styles.emptyTitle}>No rounds yet.</h2>
      <p className={styles.emptyText}>Each practice round you finish lands here with a score and notes on what to work on.</p>
      <button type="button" className={styles.btnPrimary} onClick={onStart}>
        <Play size={15} /> Set up a round
      </button>
    </div>
  );
}

// ─── Session row ───────────────────────────────────────────
function SessionRow({ session, isActive, onClick }) {
  const tone = session.scored ? scoreTone(session.score) : null;
  return (
    <button type="button" className={styles.row} aria-pressed={isActive} onClick={onClick}>
      <span className={styles.rowIcon} style={{ background: typeTag(session.type).bg, color: typeTag(session.type).color }}>
        <RoleIcon role={session.role} size={17} />
      </span>
      <span className={styles.rowMain}>
        <span className={styles.rowRole}>{session.role}</span>
        <span className={styles.rowTags}>
          <Tag tone={typeTag(session.type)}>{session.type}</Tag>
          <Tag tone={diffTag(session.difficulty)}>{session.difficulty}</Tag>
        </span>
      </span>
      <span className={styles.rowMeta}>
        <span className={styles.metaItem}><Calendar size={12} />{session.date}</span>
        <span className={styles.metaItem}><HelpCircle size={12} />{session.questions} questions</span>
        <span className={styles.metaItem}><Clock size={12} />{session.duration} min</span>
      </span>
      <span className={styles.rowScore}>
        {tone
          ? <><span className={styles.scoreDot} style={{ background: tone.color }} />{session.score}</>
          : <span className={styles.rowUngraded}>Not graded</span>}
      </span>
      <ChevronRight size={16} className={styles.rowArrow} aria-hidden="true" />
    </button>
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

// ─── How it works — the four steps travel an infinite spiral ──
const HOW_STEPS = [
  { icon: <ListChecks size={18} />,     tone: 'paper', title: 'Set up your round',
    text: 'Pick the role, interview type, level and number of questions. Paste a job description to tailor them.' },
  { icon: <Mic size={18} />,            tone: 'cyan',  title: 'Answer out loud',
    text: 'The interviewer reads each question aloud. You answer with your microphone, one question at a time.' },
  { icon: <ClipboardCheck size={18} />, tone: 'ocean', title: 'Review your feedback',
    text: 'Get a score, what worked, what to work on next, and feedback on every answer.' },
  { icon: <Sparkles size={18} />,       tone: 'navy',  title: 'Practice again',
    text: 'Run another round and follow your average score in Overview.' },
];
const SPIRAL_COPIES = 3; // the helix needs enough cards to loop; copies stay out of the a11y tree

function StepCard({ step, n }) {
  return (
    <div className={styles.stepCard} data-tone={step.tone}>
      <div className={styles.stepCardHead}>
        <span className={styles.stepIcon} aria-hidden="true">{step.icon}</span>
        <span className={styles.stepNum}>Step {n}</span>
      </div>
      <h3 className={styles.stepCardTitle}>{step.title}</h3>
      <p className={styles.stepCardText}>{step.text}</p>
    </div>
  );
}

// Card + helix sizing tracks the viewport (the spiral takes px)
function useSpiralSize() {
  const [size, setSize] = useState(null);
  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      if (w < 480)       setSize({ cardWidth: 250, cardHeight: 168, radius: 44 });
      else if (w < 900)  setSize({ cardWidth: 280, cardHeight: 172, radius: 110 });
      else               setSize({ cardWidth: 300, cardHeight: 176, radius: 170 });
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', measure); };
  }, []);
  return size;
}

function HowItWorks({ onStart }) {
  const size = useSpiralSize();
  const [shine, setShine] = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const css = getComputedStyle(document.documentElement);
      setShine({ line: css.getPropertyValue('--specular-line').trim(), base: css.getPropertyValue('--specular-base').trim() });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const items = useMemo(() => Array.from({ length: SPIRAL_COPIES }).flatMap((_, copy) =>
    HOW_STEPS.map((step, i) => ({
      id: `${copy}-${i}`,
      hidden: copy > 0,
      content: <StepCard step={step} n={i + 1} />,
    }))
  ), []);

  return (
    <section className={styles.how} aria-labelledby="how-title">
      <h1 id="how-title" className={styles.howTitle}>How a practice round works</h1>

      {/* Screen readers get the steps in order; the spiral is the visual telling */}
      <ol className={styles.srOnly}>
        {HOW_STEPS.map((s, i) => <li key={s.title}>Step {i + 1}: {s.title}. {s.text}</li>)}
      </ol>

      <div className={styles.howSpiral} aria-hidden="true">
        {size && (
          <InfiniteSpiral
            items={items}
            animationMode="all"
            speed={0.55}
            radius={size.radius}
            cardWidth={size.cardWidth}
            cardHeight={size.cardHeight}
            verticalSpacing={Math.round(size.cardHeight * 0.6)}
            perspective={1000}
            cardRadius={16}
            centerScale={1.2}
            edgeBlur={6}
            cardsPerTurn={7}
            pauseOnHover
          />
        )}
      </div>

      <div className={styles.howCta}>
        {shine && (
          <SpecularButton
            size="lg"
            radius={18}
            tint="var(--color-navy)"
            tintOpacity={1}
            blur={0}
            textColor="var(--color-navy-ink)"
            lineColor={shine.line}
            baseColor={shine.base}
            intensity={1}
            shineSize={10}
            shineFade={40}
            thickness={1}
            speed={0.35}
            followMouse
            proximity={250}
            autoAnimate={false}
            onClick={onStart}
            className={styles.howButton}
          >
            Get started
          </SpecularButton>
        )}
      </div>
    </section>
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

// ─── Overview ──────────────────────────────────────────────
function InterviewOverview({ accessToken, onStart }) {
  const [sessions, setSessions]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [fetchError, setFetchError]           = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [search, setSearch]                   = useState('');
  const [typeFilter, setTypeFilter]           = useState('All');
  const [attempt, setAttempt]                 = useState(0);

  useEffect(() => {
    getInterviewHistory({ accessToken })
      .then(data => setSessions(data.map(mapApiToSession)))
      .catch(() => setFetchError('We couldn’t load your rounds. Check your connection, then try again.'))
      .finally(() => setLoading(false));
  }, [accessToken, attempt]);

  const retry = () => { setFetchError(''); setLoading(true); setAttempt(a => a + 1); };

  const handleRowClick = (session) => setSelectedSession(session);

  const query    = search.trim().toLowerCase();
  const filtered = sessions.filter(s =>
    (typeFilter === 'All' || s.type === typeFilter) &&
    (s.role.toLowerCase().includes(query) || s.type.toLowerCase().includes(query))
  );

  const isEmpty = !loading && !fetchError && sessions.length === 0;

  if (loading) {
    return (
      <div className={styles.ovWrapper} aria-busy="true">
        <div className={`${styles.skeleton} ${styles.skeletonHero}`} />
        {[0, 1, 2].map(i => <div key={i} className={`${styles.skeleton} ${styles.skeletonRow}`} />)}
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.ovWrapper}>
        <div className={`${styles.notice} ${styles.noticeAction}`} role="alert">
          <AlertCircle size={16} />
          <span>{fetchError}</span>
          <button type="button" className={styles.btnSecondary} onClick={retry}>Try again</button>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return <div className={styles.ovWrapper}><EmptyInterviewState onStart={onStart} /></div>;
  }

  return (
    <div className={styles.ovWrapper}>
      <ProgressHero sessions={sessions} />

      <div className={styles.ovBody}>
        <section className={styles.ovList} aria-label="Your rounds">
          <div className={styles.ovToolbar}>
            <label className={styles.ovSearch}>
              <Search size={15} className={styles.ovSearchIcon} aria-hidden="true" />
              <input
                className={styles.input}
                type="search"
                placeholder="Search role or type"
                aria-label="Search rounds"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </label>
            <div className={styles.chips} role="radiogroup" aria-label="Filter by interview type">
              {TYPE_FILTERS.map(t => (
                <button key={t} type="button" role="radio" aria-checked={typeFilter === t}
                  className={styles.chip} onClick={() => setTypeFilter(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0
            ? <p className={styles.notice}>No rounds match that search. Clear it or pick another type.</p>
            : (
              <div className={styles.rows}>
                {filtered.map(session => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    isActive={selectedSession?.id === session.id}
                    onClick={() => handleRowClick(session)}
                  />
                ))}
              </div>
            )}
        </section>
      </div>

      <AnimatePresence>
        {selectedSession && (
          <FeedbackModal key={selectedSession.id} session={selectedSession} onClose={() => setSelectedSession(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main page export
// ═══════════════════════════════════════════════════════════
export default function MockInterviewPage({ accessToken, onSessionChange }) {
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({
    jobRole: '', interviewType: 'Mixed', difficulty: 'Entry Level',
    questionCount: 10, jobDescription: '',
  });
  const [resumeFile, setResumeFile]         = useState(null);
  const [session, setSession]               = useState(null);
  const [summarySession, setSummarySession] = useState(null);
  const [starting, setStarting]             = useState(false);
  const [startError, setStartError]         = useState('');
  const [roleError, setRoleError]           = useState(false);
  const [setupOpen, setSetupOpen]           = useState(false); // setup panel only after "Get started"
  const fileInputRef = useRef(null);

  // Tell the dashboard when a live round starts/ends so it can hide its chrome
  const live = !!session;
  useEffect(() => { onSessionChange?.(live); }, [live]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => onSessionChange?.(false), []);   // eslint-disable-line react-hooks/exhaustive-deps

  const set    =(field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const choose = (field) => (v) => setForm(prev => ({ ...prev, [field]: v }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
    e.target.value = '';
  };

  const handleStart = async () => {
    if (!form.jobRole.trim()) { setRoleError(true); return; }
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

  const handleComplete = (completedInterviewId) => {
    if (!completedInterviewId) { setSession(null); setActiveTab(1); return; }
    getInterviewHistory({ accessToken })
      .then(data => {
        const match = data.find(i => i.id === completedInterviewId);
        setSession(null);
        if (match) setSummarySession(mapApiToSession(match));
        else        setActiveTab(1);
      })
      .catch(() => { setSession(null); setActiveTab(1); });
  };

  const handleSummaryClose = () => {
    setSummarySession(null);
    setActiveTab(1);
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

  const role    = form.jobRole.trim();
  const minutes = Math.round(form.questionCount * MINUTES_PER_QUESTION);

  return (
    <MotionConfig reducedMotion="user">
    <div className={styles.page}>

      <div className={styles.toggleRow}>
        <GlassBubbleNav
          items={VIEW_TABS}
          activeIndex={activeTab}
          orientation="horizontal"
          onChange={setActiveTab}
        />
      </div>

      <AnimatePresence>
        {summarySession && (
          <SummaryModal key="summary-modal" session={summarySession} onClose={handleSummaryClose} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab === 0 && !setupOpen && (
          <motion.div key="how-it-works" {...fade} className={styles.fill}>
            <HowItWorks onStart={() => setSetupOpen(true)} />
          </motion.div>
        )}

        {activeTab === 0 && setupOpen && (
          <motion.div key="new-interview" {...fade} className={styles.cq}>
          <div className={styles.studio}>
            <button type="button" className={styles.backLink} onClick={() => setSetupOpen(false)}>
              <ArrowLeft size={15} /> How it works
            </button>

            {/* ── Left half: the setup ── */}
            <form className={styles.setup} onSubmit={e => { e.preventDefault(); handleStart(); }} noValidate>
              <div className={styles.setupHead}>
                <h1 className={styles.title}>Set up your practice round</h1>
                <p className={styles.subtitle}>Pick what you’re preparing for. You’ll answer out loud, one question at a time.</p>
              </div>

              <div className={styles.field}>
                <label htmlFor="iv-role" className={styles.label}>Job role</label>
                <input
                  id="iv-role"
                  type="text"
                  className={styles.input}
                  placeholder="Software Engineer"
                  value={form.jobRole}
                  onChange={e => { set('jobRole')(e); if (roleError) setRoleError(false); }}
                  aria-invalid={roleError}
                  aria-describedby="iv-role-help"
                />
                <p id="iv-role-help" className={`${styles.help} ${roleError ? styles.helpError : ''}`}>
                  {roleError
                    ? <><AlertCircle size={13} />Add the role you’re interviewing for so the questions fit it.</>
                    : 'The title on the job you’re going for.'}
                </p>
              </div>

              <OptionGroup label="Interview type" options={INTERVIEW_TYPES}
                value={form.interviewType} onChange={choose('interviewType')} />

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
                <textarea id="iv-jd" className={styles.textarea} rows={4}
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

              <button type="submit" className={styles.btnPrimary} disabled={starting} aria-busy={starting}>
                {starting
                  ? <><Loader2 size={16} className={styles.spin} /> Starting…</>
                  : <><Play size={15} /> Start interview</>}
              </button>
            </form>

            {/* ── Right half: the live brief ── */}
            <aside className={styles.brief} aria-live="polite">
              <h2 className={`${styles.briefRole} ${role ? '' : styles.briefRoleEmpty}`}>{role || 'Add a role to begin'}</h2>

              <dl className={styles.briefFacts}>
                <div><dt>Type</dt><dd style={{ color: typeTag(form.interviewType).color }}>{form.interviewType}</dd></div>
                <div><dt>Level</dt><dd style={{ color: diffTag(form.difficulty).color }}>{form.difficulty.replace(' Level', '')}</dd></div>
                <div><dt>Questions</dt><dd>{form.questionCount}</dd></div>
                <div><dt>Time</dt><dd>~{minutes} min</dd></div>
              </dl>

              <div className={styles.briefCoach}>
                <h3 className={styles.briefCoachTitle}>What to expect</h3>
                <p>{TYPE_COACHING[form.interviewType]}</p>
                <p>{DIFF_COACHING[form.difficulty]}</p>
              </div>

              <p className={styles.briefMic}>
                <Mic size={15} aria-hidden="true" />
                The interviewer reads each question aloud. Answer with your microphone — voice input works in Chrome and Edge.
              </p>
            </aside>
          </div>
          </motion.div>
        )}

        {activeTab === 1 && (
          <motion.div key="overview" {...fade} className={styles.fill}>
            <InterviewOverview accessToken={accessToken} onStart={() => { setSetupOpen(true); setActiveTab(0); }} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </MotionConfig>
  );
}
