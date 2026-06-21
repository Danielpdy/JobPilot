'use client';
import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faUpload, faPlay, faFile, faXmark } from '@fortawesome/free-solid-svg-icons';
import { startInterview } from '@/app/Services/InterviewService';
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
// OVERVIEW — sample data & sub-components
// (all kept here so it's easy to remove later)
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

const SAMPLE_INTERVIEWS = [
  {
    id: 1, role: 'Software Engineer', type: 'Mixed', difficulty: 'Mid Level',
    date: 'May 20, 2025', questions: 10, duration: 22, score: 84,
    topItems: [
      { label: 'Problem Solving',     weak: false },
      { label: 'Technical Knowledge', weak: false },
      { label: 'Communication',       weak: false },
    ],
    performance: [
      { label: 'Communication',       score: 88 },
      { label: 'Technical Knowledge', score: 82 },
      { label: 'Problem Solving',     score: 85 },
      { label: 'Confidence',          score: 80 },
    ],
    strengths:    ['Clear communication with good examples', 'Strong problem-solving approach', 'Good technical explanations'],
    improvements: ['Go deeper in system design', 'More specific metrics in answers', 'Improve confidence in responses'],
    breakdown: [
      { id: 1, q: 'Tell me about yourself.',                              score: 8.5, answer: null, feedback: null, improvement: null },
      { id: 2, q: 'Why do you want to work at our company?',             score: 8.0, answer: null, feedback: null, improvement: null },
      { id: 3, q: 'Tell me about a challenging technical problem you solved.', score: 7.5,
        answer:      'You described a deployment pipeline issue and how you identified the root cause…',
        feedback:    'Good explanation of the problem and your approach. Consider adding more details about the impact and metrics.',
        improvement: 'Try to quantify the impact and results. For example, how much time or resources were saved?' },
      { id: 4, q: 'How do you approach debugging a complex issue?',      score: 8.0, answer: null, feedback: null, improvement: null },
      { id: 5, q: 'Describe your experience with databases.',            score: 8.5, answer: null, feedback: null, improvement: null },
    ],
  },
  {
    id: 2, role: 'Backend Developer', type: 'Technical', difficulty: 'Entry Level',
    date: 'May 18, 2025', questions: 8, duration: 18, score: 76,
    topItems: [
      { label: 'System Design', weak: false },
      { label: 'Code Quality',  weak: false },
      { label: 'Optimization',  weak: true  },
    ],
    performance: [
      { label: 'System Design',   score: 80 },
      { label: 'Code Quality',    score: 78 },
      { label: 'Problem Solving', score: 72 },
      { label: 'Confidence',      score: 74 },
    ],
    strengths:    ['Strong system design thinking', 'Clean code practices', 'Good understanding of APIs'],
    improvements: ['Optimize time complexity', 'Deepen knowledge of databases', 'Practice more whiteboard problems'],
    breakdown: [
      { id: 1, q: 'Explain the difference between SQL and NoSQL.',  score: 8.0, answer: null, feedback: null, improvement: null },
      { id: 2, q: 'Design a REST API for a blog platform.',         score: 7.5,
        answer:      'You described a basic CRUD structure with user endpoints…',
        feedback:    'Good basic structure. Consider adding authentication and rate limiting.',
        improvement: 'Add error handling and API versioning to your design.' },
      { id: 3, q: 'What is indexing in databases?',                score: 7.8, answer: null, feedback: null, improvement: null },
      { id: 4, q: 'How does caching improve performance?',         score: 7.0, answer: null, feedback: null, improvement: null },
    ],
  },
  {
    id: 3, role: 'Product Manager', type: 'Behavioral', difficulty: 'Mid Level',
    date: 'May 15, 2025', questions: 10, duration: 21, score: 82,
    topItems: [
      { label: 'Leadership',             weak: false },
      { label: 'Stakeholder Management', weak: false },
      { label: 'Data-Driven Decisions',  weak: true  },
    ],
    performance: [
      { label: 'Leadership',             score: 85 },
      { label: 'Stakeholder Management', score: 88 },
      { label: 'Data-Driven Decisions',  score: 78 },
      { label: 'Communication',          score: 77 },
    ],
    strengths:    ['Excellent leadership examples', 'Clear stakeholder communication', 'Good use of data in decisions'],
    improvements: ['More quantifiable outcomes', 'Deeper conflict resolution examples', 'Stronger roadmap prioritization'],
    breakdown: [
      { id: 1, q: 'Tell me about a product you launched.',              score: 8.5, answer: null, feedback: null, improvement: null },
      { id: 2, q: 'How do you prioritize features?',                   score: 8.0,
        answer:      'You described using a RICE scoring model for prioritization…',
        feedback:    'Great framework usage. Add more stakeholder input discussion.',
        improvement: 'Mention how you handle conflicting priorities from different teams.' },
      { id: 3, q: 'Describe a time you dealt with a difficult stakeholder.', score: 7.8, answer: null, feedback: null, improvement: null },
    ],
  },
  {
    id: 4, role: 'Data Analyst', type: 'Mixed', difficulty: 'Entry Level',
    date: 'May 12, 2025', questions: 10, duration: 20, score: 71,
    topItems: [
      { label: 'Data Analysis',    weak: false },
      { label: 'SQL Queries',      weak: false },
      { label: 'Business Insights', weak: true  },
    ],
    performance: [
      { label: 'Data Analysis',    score: 75 },
      { label: 'SQL Queries',      score: 72 },
      { label: 'Business Insights', score: 68 },
      { label: 'Visualization',    score: 69 },
    ],
    strengths:    ['Good SQL knowledge', 'Clear data storytelling', 'Analytical thinking'],
    improvements: ['Improve data visualization skills', 'Deepen statistical knowledge', 'Practice more complex queries'],
    breakdown: [
      { id: 1, q: 'How would you analyze a drop in revenue?',         score: 7.5, answer: null, feedback: null, improvement: null },
      { id: 2, q: 'Write a SQL query to find duplicate records.',     score: 6.8,
        answer:      'You wrote a GROUP BY query with a HAVING clause…',
        feedback:    'Correct approach but missed some edge cases.',
        improvement: 'Consider NULL values and use window functions for better efficiency.' },
      { id: 3, q: 'What metrics would you track for an e-commerce site?', score: 7.0, answer: null, feedback: null, improvement: null },
    ],
  },
  {
    id: 5, role: 'IT Support Specialist', type: 'Behavioral', difficulty: 'Entry Level',
    date: 'May 10, 2025', questions: 8, duration: 16, score: 68,
    topItems: [
      { label: 'Customer Focus',  weak: false },
      { label: 'Troubleshooting', weak: false },
      { label: 'Technical Depth', weak: true  },
    ],
    performance: [
      { label: 'Customer Focus',  score: 75 },
      { label: 'Troubleshooting', score: 70 },
      { label: 'Technical Depth', score: 65 },
      { label: 'Communication',   score: 62 },
    ],
    strengths:    ['Strong customer empathy', 'Systematic troubleshooting', 'Good patience under pressure'],
    improvements: ['Deepen technical knowledge', 'Improve escalation processes', 'Work on time management'],
    breakdown: [
      { id: 1, q: 'Describe a time you helped a frustrated customer.',  score: 7.5, answer: null, feedback: null, improvement: null },
      { id: 2, q: 'How do you troubleshoot a network issue?',          score: 6.5,
        answer:      'You described a step-by-step approach starting from hardware checks…',
        feedback:    'Good process but missed some key diagnostic steps.',
        improvement: 'Include network layer analysis and always document the resolution.' },
      { id: 3, q: 'How do you handle multiple critical tickets at once?', score: 6.8, answer: null, feedback: null, improvement: null },
    ],
  },
];

// ─── Score ring ────────────────────────────────────────────
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
function SessionCard({ session, isActive, onClick }) {
  const color  = TYPE_COLOR[session.type]   ?? '#3B82F6';
  const typTag = TYPE_TAG[session.type]     ?? TYPE_TAG.Mixed;
  const difTag = DIFF_TAG[session.difficulty] ?? DIFF_TAG['Entry Level'];

  return (
    <button
      className={`${styles.sessionCard} ${isActive ? styles.sessionCardActive : ''}`}
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

      {/* Right: strengths */}
      <div className={styles.cardRight}>
        <span className={styles.colLabel}>Top Strengths</span>
        <ul className={styles.topList}>
          {session.topItems.map((item, i) => (
            <li key={i} className={styles.topItem}>
              {item.weak
                ? <AlertCircle  size={13} style={{ color: '#F59E0B', flexShrink: 0 }} />
                : <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0 }} />}
              <span style={{ color: item.weak ? '#F59E0B' : '#374151' }}>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

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
          <ScoreRing score={session.score} size={100} />
          <div className={styles.perfBars}>
            {session.performance.map(p => (
              <div key={p.label} className={styles.perfBar}>
                <span className={styles.perfLabel}>{p.label}</span>
                <div className={styles.perfTrack}>
                  <div className={styles.perfFill} style={{ width: `${p.score}%` }} />
                </div>
                <span className={styles.perfScore}>{p.score}/100</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.panelDivider} />

      {/* Strengths / improvements */}
      <div className={styles.strGrid}>
        <div className={styles.strBox}>
          <div className={styles.strBoxTitle} style={{ color: '#16a34a' }}>Strengths</div>
          {session.strengths.map((s, i) => (
            <div key={i} className={styles.strItem}>
              <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
              <span>{s}</span>
            </div>
          ))}
        </div>
        <div className={styles.strBox}>
          <div className={styles.strBoxTitle} style={{ color: '#F59E0B' }}>Areas to Improve</div>
          {session.improvements.map((s, i) => (
            <div key={i} className={styles.strItem}>
              <AlertCircle size={13} style={{ color: '#F59E0B', flexShrink: 0 }} />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.panelDivider} />

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
function InterviewOverview() {
  const [selectedSession, setSelectedSession] = useState(null);
  const [panelOpen, setPanelOpen]             = useState(false);
  const [search, setSearch]                   = useState('');

  const handleCardClick = (session) => {
    setSelectedSession(session);
    setPanelOpen(true);
  };

  const filtered = SAMPLE_INTERVIEWS.filter(s =>
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.ovWrapper}>

      {/* Header */}
      <div className={styles.ovHeader}>
        <div>
          <h2 className={styles.ovTitle}>Interview Overview</h2>
          <p className={styles.ovSub}>View recent interviews and track your progress over time.</p>
        </div>
        <div className={styles.ovControls}>
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
      </div>

      {/* Content */}
      <div className={styles.ovContent}>

        <div className={styles.ovList}>
          {filtered.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              isActive={panelOpen && selectedSession?.id === session.id}
              onClick={() => handleCardClick(session)}
            />
          ))}
        </div>

        <aside className={`${styles.ovPanel} ${panelOpen ? styles.ovPanelOpen : ''}`}>
          {selectedSession && (
            <DetailPanel session={selectedSession} onClose={() => setPanelOpen(false)} />
          )}
        </aside>

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

      {activeTab === 0 && (
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
      )}

      {activeTab === 1 && <InterviewOverview />}

    </div>
  );
}
