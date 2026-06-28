'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faUpload, faPlay, faFile, faXmark } from '@fortawesome/free-solid-svg-icons';
import { startInterview, getInterviewHistory } from '@/app/Services/InterviewService';
import InterviewSession from './InterviewSession';
import {
  Mic, LayoutDashboard, Code2, Server, Briefcase, BarChart2, Headphones,
  Calendar, Clock, HelpCircle, Search, Filter, ChevronDown, ChevronRight,
  ChevronUp, CheckCircle2, AlertCircle, X, Download,
} from 'lucide-react';
import GlassBubbleNav from '@/app/components/ui/GlassBubbleNav/GlassBubbleNav';
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

// ═══════════════════════════════════════════════════════════
// OVERVIEW — sub-components
// ═══════════════════════════════════════════════════════════

const TYPE_COLOR = { Mixed: '#3B82F6', Technical: '#10B981', Behavioral: '#8B5CF6' };
const TYPE_TAG   = {
  Mixed:      { bg: '#EFF6FF', color: '#2563EB' },
  Technical:  { bg: '#ECFDF5', color: '#059669' },
  Behavioral: { bg: '#F5F3FF', color: '#7C3AED' },
};
const DIFF_TAG = {
  'Entry Level':  { bg: '#ECFEFF', color: '#0E7490' },
  'Mid Level':    { bg: '#FFFBEB', color: '#92400E' },
  'Senior Level': { bg: '#FFF1F2', color: '#9F1239' },
};

// ─── Animation variants ────────────────────────────────────
const tabEnter = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.16, ease: 'easeIn' } },
};

const listVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ─── Empty state ───────────────────────────────────────────
function EmptyInterviewState() {
  return (
    <motion.div
      className={styles.emptyState}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
    >
      <div className={styles.emptyRings}>
        <div className={styles.emptyRing1} />
        <div className={styles.emptyRing2} />
        <div className={styles.emptyIconWrap}>
          <Mic size={26} className={styles.emptyIconSvg} />
        </div>
      </div>
      <p className={styles.emptyTitle}>No interviews yet</p>
      <p className={styles.emptyText}>
        Start your first mock interview from the <strong>New Interview</strong> tab.<br />
        Your sessions and scores will appear here.
      </p>
    </motion.div>
  );
}

function mapApiToSession(interview) {
  const qs     = interview.questionsBreakdown ?? [];
  const scored = qs.filter(q => q.score > 0);
  const sBullets = interview.strengthBullets    ?? [];
  const iBullets = interview.improvementBullets ?? [];
  const topItems = sBullets.length > 0 || iBullets.length > 0
    ? [
        ...sBullets.slice(0, 2).map(b => ({ label: b, weak: false })),
        ...iBullets.slice(0, 1).map(b => ({ label: b, weak: true  })),
      ].slice(0, 3)
    : [];

  const strengths    = interview.strengthBullets    ?? [];
  const improvements = interview.improvementBullets ?? [];
  const performance  = qs.map(q => ({ label: `Q${q.questionNumber}`, score: q.score * 10 }));

  const breakdown = qs.map(q => ({
    id:          q.questionNumber,
    q:           q.questionText,
    score:       q.score,
    answer:      null,
    feedback:    q.feedback || null,
    improvement: null,
  }));

  return {
    id:           interview.id,
    role:         interview.role,
    type:         interview.type,
    difficulty:   interview.difficulty,
    date:         interview.date,
    questions:    interview.questions,
    duration:     interview.durationMinutes,
    score:        interview.score,
    topItems,
    performance,
    strengths,
    improvements,
    breakdown,
  };
}

// ─── Score ring (session cards) ────────────────────────────
function ScoreRing({ score, size = 90 }) {
  const ringColor = score >= 80 ? '#22c55e' : score >= 60 ? '#0992C2' : '#ef4444';
  const sw   = 7;
  const r    = (size - sw * 2) / 2;
  const cx   = size / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ * (1 - score / 100);
  return (
    <svg width={size} height={size} style={{ display: 'block', flexShrink: 0 }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E5E7EB" strokeWidth={sw} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={ringColor} strokeWidth={sw}
        strokeDasharray={`${circ} ${circ}`} strokeDashoffset={off}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cx})`} />
      <text x={cx} y={cx * 0.9} textAnchor="middle" dominantBaseline="central"
        fontSize={size * 0.22} fontWeight="700" fill="#111827">{score}</text>
      <text x={cx} y={cx + size * 0.16} textAnchor="middle" dominantBaseline="central"
        fontSize={size * 0.12} fill="#9CA3AF">/100</text>
    </svg>
  );
}

// ─── Score badge (detail panel) ────────────────────────────
function ScoreBadge({ score }) {
  return (
    <div className={styles.scoreBadge}>
      <span className={styles.scoreBadgeLabel}>Score</span>
      <span className={styles.scoreBadgeNum}>{score}</span>
      <span className={styles.scoreBadgeDenom}>/100</span>
    </div>
  );
}

// ─── Role icon ─────────────────────────────────────────────
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

// ─── Question accordion item ───────────────────────────────
function QuestionItem({ index, item }) {
  const [open, setOpen] = useState(false);
  const hasDetail = item.answer || item.feedback || item.improvement;
  const qColor = item.score >= 8 ? '#16a34a' : item.score >= 7 ? '#F59E0B' : '#DC2626';

  return (
    <div className={styles.qItem}>
      <button
        className={styles.qHeader}
        onClick={() => hasDetail && setOpen(o => !o)}
        style={{ cursor: hasDetail ? 'pointer' : 'default' }}
      >
        <span className={styles.qIndex}>{index}.</span>
        <span className={styles.qText}>{item.q}</span>
        <span className={styles.qScore} style={{ color: qColor }}>{item.score}/10</span>
        {hasDetail && (open
          ? <ChevronUp  size={13} className={styles.qChevron} />
          : <ChevronDown size={13} className={styles.qChevron} />
        )}
      </button>
      {open && hasDetail && (
        <div className={styles.qBody}>
          {item.answer      && <div className={styles.qSection}><span className={styles.qLabel}>Your Answer (Summary)</span><p className={styles.qText2}>{item.answer}</p></div>}
          {item.feedback    && <div className={styles.qSection}><span className={styles.qLabel}>Feedback</span><p className={styles.qText2}>{item.feedback}</p></div>}
          {item.improvement && <div className={styles.qSection}><span className={styles.qLabel}>Suggested Improvement</span><p className={styles.qText2}>{item.improvement}</p></div>}
        </div>
      )}
    </div>
  );
}

// ─── Session card ──────────────────────────────────────────
function SessionCard({ session, isActive, panelOpen, onClick }) {
  const typTag = TYPE_TAG[session.type]       ?? TYPE_TAG.Mixed;
  const difTag = DIFF_TAG[session.difficulty] ?? DIFF_TAG['Entry Level'];

  return (
    <button
      className={`${styles.sessionCard} ${isActive ? styles.sessionCardActive : ''} ${panelOpen ? styles.sessionCardCompact : ''}`}
      onClick={onClick}
    >
      {/* Left: info */}
      <div className={styles.cardLeft}>
        <div className={styles.cardTitle}>{session.role}</div>
        <div className={styles.cardType}>{session.type} Interview</div>
        <div className={styles.cardMeta}>
          <span className={styles.metaItem}><Calendar size={12} /> {session.date}</span>
          <span className={styles.metaItem}><span className={styles.dot} /><HelpCircle size={12} /> {session.questions} Questions</span>
          <span className={styles.metaItem}><span className={styles.dot} /><Clock size={12} /> {session.duration} min</span>
        </div>
        <div className={styles.cardTags}>
          <span className={styles.tag} style={{ background: typTag.bg, color: typTag.color }}>{session.type}</span>
          <span className={styles.tag} style={{ background: difTag.bg, color: difTag.color }}>{session.difficulty}</span>
        </div>
      </div>

      {/* Middle: score */}
      <div className={styles.cardMiddle}>
        <span className={styles.colLabel}>Overall Score</span>
        <ScoreRing score={session.score} size={80} />
      </div>

      {/* Right: insights — hidden when panel is open or no bullets yet */}
      {!panelOpen && session.topItems.length > 0 && (
        <div className={styles.cardRight}>
          <span className={styles.colLabel}>Insights</span>
          <ul className={styles.topList}>
            {session.topItems.map((item, i) => (
              <li key={i} className={styles.topItem}>
                <span className={styles.insightDot} style={{ background: item.weak ? '#F59E0B' : '#16a34a' }} />
                <span style={{ color: '#374151' }}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ChevronRight size={15} className={styles.cardArrow} />
    </button>
  );
}

// ─── Detail panel content ──────────────────────────────────
function DetailPanel({ session, onClose }) {
  const color = TYPE_COLOR[session.type] ?? '#3B82F6';

  return (
    <div className={styles.panelInner}>

      {/* Header */}
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Interview Details</span>
        <button className={styles.panelClose} onClick={onClose}><X size={15} /></button>
      </div>

      {/* Summary */}
      <div className={styles.panelSummary}>
        <div>
          <div className={styles.panelSummaryTitle}>{session.role} · {session.type} Interview</div>
          <div className={styles.panelSummaryMeta}>
            <span className={styles.metaItem}><Calendar size={11} /> {session.date}</span>
            <span className={styles.metaItem}><span className={styles.dot} /><HelpCircle size={11} /> {session.questions} Questions</span>
            <span className={styles.metaItem}><span className={styles.dot} /><Clock size={11} /> {session.duration} min</span>
          </div>
        </div>
      </div>

      <div className={styles.panelDivider} />

      {/* Overall performance */}
      <div className={styles.panelSection}>
        <div className={styles.panelSectionTitle}>Overall Performance</div>
        <div className={styles.perfRow}>
          <ScoreBadge score={session.score} />
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Type</span>
              <span className={styles.statValue} style={{ color: TYPE_COLOR[session.type] ?? '#374151' }}>
                {session.type}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Difficulty</span>
              <span className={styles.statValue} style={{ color: (DIFF_TAG[session.difficulty] ?? DIFF_TAG['Entry Level']).color }}>
                {session.difficulty}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Questions</span>
              <span className={styles.statValue}>{session.questions}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Duration</span>
              <span className={styles.statValue}>{session.duration} min</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.panelDivider} />

      {/* Strengths / improvements */}
      {(session.strengths.length > 0 || session.improvements.length > 0) && (
        <>
          <div className={`${styles.strGrid} ${(!session.strengths.length || !session.improvements.length) ? styles.strGridSingle : ''}`}>
            {session.strengths.length > 0 && (
              <div className={styles.strBox}>
                <div className={styles.strBoxTitle} style={{ color: '#16a34a' }}>Strengths</div>
                {session.strengths.map((s, i) => (
                  <div key={i} className={styles.strItem}>
                    <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
            {session.improvements.length > 0 && (
              <div className={styles.strBox}>
                <div className={styles.strBoxTitle} style={{ color: '#F59E0B' }}>Areas to Improve</div>
                {session.improvements.map((s, i) => (
                  <div key={i} className={styles.strItem}>
                    <AlertCircle size={13} style={{ color: '#F59E0B', flexShrink: 0 }} />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.panelDivider} />
        </>
      )}

      {/* Question breakdown */}
      <div className={styles.panelSection}>
        <div className={styles.panelSectionTitle}>Question Breakdown</div>
        <div className={styles.qList}>
          {session.breakdown.map((item, i) => (
            <QuestionItem key={item.id} index={i + 1} item={item} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.panelFooter}>
        <button className={styles.downloadBtn}>
          <Download size={14} />
          Download Full Report
        </button>
      </div>

    </div>
  );
}

// ─── Interview overview ────────────────────────────────────
function InterviewOverview({ accessToken }) {
  const [sessions, setSessions]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [panelOpen, setPanelOpen]             = useState(false);
  const [search, setSearch]                   = useState('');

  useEffect(() => {
    getInterviewHistory({ accessToken })
      .then(data => setSessions(data.map(mapApiToSession)))
      .catch(err => setFetchError(err.message || 'Failed to load interview history.'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const handleCardClick = (session) => {
    setSelectedSession(session);
    setPanelOpen(true);
  };

  const filtered = sessions.filter(s =>
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.type.toLowerCase().includes(search.toLowerCase())
  );

  const isEmpty = !loading && !fetchError && sessions.length === 0;

  return (
    <div className={styles.ovWrapper}>
      <div className={styles.ovContent}>

        {/* Header — spans the full width of cards + panel */}
        {!isEmpty && (
          <div className={styles.ovHeader}>
            <div className={styles.ovSearch}>
              <Search size={14} className={styles.ovSearchIcon} />
              <input
                className={styles.ovSearchInput}
                placeholder="Search interviews..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className={styles.ovFilterBtn}>
              <Filter size={14} />
              Filter
              <ChevronDown size={12} />
            </button>
          </div>
        )}

        {/* Cards + panel row */}
        <div className={styles.ovBody}>
          <motion.div
            className={styles.ovList}
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {loading && <p className={styles.ovEmpty}>Loading interviews…</p>}
            {!loading && fetchError && <p className={styles.ovEmpty}>{fetchError}</p>}
            {!loading && !fetchError && filtered.length === 0 && <EmptyInterviewState />}
            {!loading && !fetchError && filtered.map(session => (
              <motion.div key={session.id} variants={cardVariants}>
                <SessionCard
                  session={session}
                  isActive={panelOpen && selectedSession?.id === session.id}
                  panelOpen={panelOpen}
                  onClick={() => handleCardClick(session)}
                />
              </motion.div>
            ))}
          </motion.div>

          <aside className={`${styles.ovPanel} ${panelOpen ? styles.ovPanelOpen : ''}`}>
            {selectedSession && (
              <DetailPanel session={selectedSession} onClose={() => setPanelOpen(false)} />
            )}
          </aside>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main page export
// ═══════════════════════════════════════════════════════════
export default function MockInterviewPage({ accessToken }) {
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({
    jobRole: '', interviewType: 'Mixed', difficulty: 'Entry Level',
    questionCount: 10, jobDescription: '',
  });
  const [resumeFile, setResumeFile]   = useState(null);
  const [session, setSession]         = useState(null); // { interviewId, questionNumber, questionText }
  const [starting, setStarting]       = useState(false);
  const [startError, setStartError]   = useState('');
  const fileInputRef = useRef(null);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
    e.target.value = '';
  };

  const handleStart = async () => {
    if (!form.jobRole.trim()) { setStartError('Please enter a job role.'); return; }
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
      setStartError(err.message || 'Failed to start interview. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const handleComplete = () => {
    setSession(null);
    setActiveTab(1);
  };

  // Active session — hide toggle and show session UI
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

  return (
    <div className={styles.page}>

      <div className={styles.toggleRow}>
        <GlassBubbleNav
          items={VIEW_TABS}
          activeIndex={activeTab}
          orientation="horizontal"
          onChange={setActiveTab}
        />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 0 && (
          <motion.div key="new-interview" {...tabEnter} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div className={styles.card}>
              <div className={styles.header}>
                <h1 className={styles.title}>Configure your interview</h1>
                <p className={styles.subtitle}>
                  Choose your preferences and <span className={styles.accent}>we'll</span> create a realistic interview.
                </p>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label}>Job Role</label>
                  <input type="text" className={styles.input} placeholder="e.g. Software Engineer"
                    value={form.jobRole} onChange={set('jobRole')} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Interview Type</label>
                  <div className={styles.selectWrap}>
                    <select className={styles.select} value={form.interviewType} onChange={set('interviewType')}>
                      {INTERVIEW_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <FontAwesomeIcon icon={faChevronDown} className={styles.chevron} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Difficulty</label>
                  <div className={styles.selectWrap}>
                    <select className={styles.select} value={form.difficulty} onChange={set('difficulty')}>
                      {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <FontAwesomeIcon icon={faChevronDown} className={styles.chevron} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Question Count</label>
                  <div className={styles.selectWrap}>
                    <select className={styles.select} value={form.questionCount} onChange={set('questionCount')}>
                      {QUESTION_COUNTS.map(n => <option key={n} value={n}>{n} Questions</option>)}
                    </select>
                    <FontAwesomeIcon icon={faChevronDown} className={styles.chevron} />
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Paste Job Description <span className={styles.optional}>(optional)</span>
                </label>
                <textarea className={styles.textarea} rows={4}
                  placeholder="Paste the job description to tailor your questions..."
                  value={form.jobDescription} onChange={set('jobDescription')} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Upload Resume <span className={styles.optional}>(optional)</span>
                </label>
                <button type="button" className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}>
                  {resumeFile ? (
                    <>
                      <FontAwesomeIcon icon={faFile} className={styles.uploadIcon} />
                      <span className={styles.uploadFileName}>{resumeFile.name}</span>
                      <span className={styles.clearBtn} onClick={e => { e.stopPropagation(); setResumeFile(null); }}>
                        <FontAwesomeIcon icon={faXmark} />
                      </span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUpload} className={styles.uploadIcon} />
                      <span>Choose PDF or DOCX</span>
                    </>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept=".pdf,.docx"
                  className={styles.hiddenInput} onChange={handleFileChange} />
              </div>

              {startError && <p className={styles.errorMsg}>{startError}</p>}

              <button type="button" className={styles.startBtn} onClick={handleStart} disabled={starting}>
                <FontAwesomeIcon icon={faPlay} />
                {starting ? 'Starting…' : 'Start Interview'}
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 1 && (
          <motion.div key="overview" {...tabEnter}>
            <InterviewOverview accessToken={accessToken} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
