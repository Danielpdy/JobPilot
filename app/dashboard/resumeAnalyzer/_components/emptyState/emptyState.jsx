'use client';
import { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, BarChart2, ArrowRight, Zap, CheckCircle, FileText, Search } from 'lucide-react';
import { analyzeResume } from '@/app/Services/ResumeService';
import { motion } from 'motion/react';
import styles from './emptyState.module.css';

const LOADING_STEPS = [
  {
    Icon:     Upload,
    label:    'Uploading',
    status:   'Uploading your resume…',
    subtexts: ['Sending your file securely...', 'Preparing your document...'],
  },
  {
    Icon:     FileText,
    label:    'Extracting',
    status:   'Parsing structure and layout…',
    subtexts: ['Reading resume content...', 'Parsing structure and layout...'],
  },
  {
    Icon:     Search,
    label:    'Analyzing',
    status:   'Evaluating impact and experience…',
    subtexts: ['Understanding your experience...', 'Evaluating impact and structure...', 'Identifying improvement opportunities...'],
  },
  {
    Icon:     Sparkles,
    label:    'Generating',
    status:   'Writing personalized feedback…',
    subtexts: ['Building your score...', 'Writing personalized feedback...', 'Almost there...'],
  },
];

// Uploading ~2s, Extracting ~4s, Analyzing ~10s, Generating until API resolves
const STEP_TIMINGS = [0, 2000, 6000, 16000];

const MAX_ANALYSES = 3;

const steps = [
  { Icon: Upload,    title: 'Upload',  desc: 'Drop your PDF resume'   },
  { Icon: Sparkles,  title: 'Analyze', desc: 'AI reviews your resume' },
  { Icon: BarChart2, title: 'Improve', desc: 'Get score & feedback'   },
];

export default function EmptyState({ token, onAnalyzed }) {
  const [file, setFile]                 = useState(null);
  const [dragging, setDragging]         = useState(false);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [score, setScore]               = useState(null);
  const [feedback, setFeedback]         = useState(null);
  const [analysesLeft, setAnalysesLeft] = useState(MAX_ANALYSES);
  const inputRef       = useRef(null);
  const stepTimersRef  = useRef([]);
  const currentStepRef = useRef(0);

  const handleFile = (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setFile(f);
    setScore(null);
    setFeedback(null);
  };

  const onInputChange = (e) => handleFile(e.target.files?.[0]);
  const onDrop        = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); };
  const onDragOver    = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave   = ()  => setDragging(false);

  const [resultReady, setResultReady] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await analyzeResume(file, token);
      setResultReady(true);
    } catch(error) {
      console.error(error);
      setIsAnalyzing(false);
    }
  };

  const [stepIndex, setStepIndex]       = useState(0);
  const [subtextIndex, setSubtextIndex] = useState(0);
  const [fillIndex, setFillIndex]       = useState(-1);

  useEffect(() => {
    if (!isAnalyzing) {
      setStepIndex(0); setSubtextIndex(0); setFillIndex(-1); setResultReady(false);
      return;
    }

    stepTimersRef.current = [];
    STEP_TIMINGS.slice(1).forEach((ms, i) => {
      stepTimersRef.current.push(setTimeout(() => setFillIndex(i),                               ms - 500));
      stepTimersRef.current.push(setTimeout(() => { setStepIndex(i + 1); setSubtextIndex(0); }, ms));
    });

    return () => stepTimersRef.current.forEach(clearTimeout);
  }, [isAnalyzing]);

  // Keep a ref in sync so the fast-forward effect reads the current step without stale closure
  useEffect(() => { currentStepRef.current = stepIndex; }, [stepIndex]);

  // When the API responds, cancel slow timers and fast-forward remaining steps
  useEffect(() => {
    if (!resultReady) return;

    stepTimersRef.current.forEach(clearTimeout);
    stepTimersRef.current = [];

    const FAST      = 500; // ms per remaining step
    const start     = currentStepRef.current;
    const remaining = LOADING_STEPS.length - 1 - start;
    const timers    = [];

    for (let k = 0; k < remaining; k++) {
      const delay = (k + 1) * FAST;
      timers.push(setTimeout(() => setFillIndex(start + k),                               delay - 300));
      timers.push(setTimeout(() => { setStepIndex(start + k + 1); setSubtextIndex(0); }, delay));
    }

    // Transition to preview after last step settles
    const finalDelay = remaining === 0 ? 500 : remaining * FAST + 500;
    timers.push(setTimeout(() => onAnalyzed(), finalDelay));

    return () => timers.forEach(clearTimeout);
  }, [resultReady]);

  useEffect(() => {
    if (!isAnalyzing) return;
    const subtexts = LOADING_STEPS[stepIndex].subtexts;
    if (subtexts.length <= 1) return;
    const interval = setInterval(() => {
      setSubtextIndex(i => (i + 1) % subtexts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isAnalyzing, stepIndex]);

  /* ── Score ring ─────────────────────────────────────────── */
  const radius     = 54;
  const circ       = 2 * Math.PI * radius;
  const scoreColor = score >= 80 ? '#0AC4E0' : score >= 60 ? '#0992C2' : '#0B2D72';
  const dashOffset = score != null ? circ - (score / 100) * circ : circ;

  if (isAnalyzing) {
    const activeStep   = LOADING_STEPS[stepIndex];
    const activeSubtext = activeStep.subtexts[subtextIndex];

    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loadingModule}>
          <p className={styles.loadingTitle}>Analyzing your resume</p>

          <div className={styles.hStepRow}>
            {LOADING_STEPS.map((step, i) => {
              const isDone      = i < stepIndex;
              const isActive    = i === stepIndex;
              const isLast      = i === LOADING_STEPS.length - 1;
              const isFilled    = i <= fillIndex;
              const StepIcon    = step.Icon;

              return (
                <div key={step.label} className={styles.hStepGroup}>
                  <div className={styles.hStepItem}>
                    <motion.div
                      className={`${styles.hStepIcon} ${isDone ? styles.hStepIconDone : isActive ? styles.hStepIconActive : styles.hStepIconPending}`}
                      animate={{ scale: isActive ? 1.12 : 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    >
                      {isDone ? (
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1,   opacity: 1 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                          <CheckCircle className={styles.hStepCheck} />
                        </motion.span>
                      ) : isActive ? (
                        <motion.span
                          animate={{ scale: [1, 1.12, 1] }}
                          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                        >
                          <StepIcon className={styles.hStepActiveIcon} />
                        </motion.span>
                      ) : (
                        <StepIcon className={styles.hStepPendingIcon} />
                      )}
                    </motion.div>
                    <span className={`${styles.hStepLabel} ${isDone ? styles.hStepLabelDone : isActive ? styles.hStepLabelActive : styles.hStepLabelPending}`}>
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={styles.hConnectorWrapper}>
                      <div className={styles.hConnectorTrack} />
                      <motion.div
                        className={styles.hConnectorFill}
                        animate={{ width: isFilled ? '100%' : '0%' }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active step subtext — rotates every 3.5s */}
          <motion.p
            key={activeSubtext}
            className={styles.activeSubtext}
            initial={{ opacity: 0, y: 4  }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: -4 }}
            transition={{ duration: 0.5 }}
          >
            {activeSubtext}
          </motion.p>

          <p className={styles.stepCount}>
            Step {stepIndex + 1} of {LOADING_STEPS.length} &bull; {LOADING_STEPS[stepIndex].status}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>

      {/* ── Drop zone ────────────────────────────────────────── */}
      <div
        className={`${styles.dropZone} ${dragging ? styles.dropZoneDragging : ''} ${file ? styles.dropZoneLoaded : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <div className={`${styles.iconBubble} ${file ? styles.iconBubbleLoaded : ''}`}>
          <Upload className={styles.dropIcon} />
        </div>
        <p className={styles.dropTitle}>
          {file ? file.name : 'Upload your resume'}
        </p>
        <p className={styles.dropSub}>
          {file ? 'PDF ready — click to replace' : 'Drag & drop a PDF or click to browse'}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={onInputChange}
      />

      {/* ── Steps row ────────────────────────────────────────── */}
      <div className={styles.stepsRow}>
        {steps.map(({ Icon, title, desc }, i) => (
          <div key={title} className={styles.stepGroup}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>
                <Icon className={styles.stepIconSvg} />
              </div>
              <div className={styles.stepText}>
                <p className={styles.stepTitle}>{title}</p>
                <p className={styles.stepDesc}>{desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className={styles.stepArrow} />
            )}
          </div>
        ))}
      </div>

      {/* ── Analyses count ───────────────────────────────────── */}
      <p className={styles.analysesCount}>
        <Zap className={styles.analysesIcon} />
        <strong>{analysesLeft}</strong> free {analysesLeft === 1 ? 'analysis' : 'analyses'} available
      </p>

      {/* ── Analyze button (shown once file is loaded) ───────── */}
      {file && (
        <button
          className={`${styles.analyzeBtn} ${(analysesLeft <= 0 || isAnalyzing) ? styles.analyzeBtnDisabled : ''}`}
          onClick={handleAnalyze}
          disabled={analysesLeft <= 0 || isAnalyzing}
        >
          <Sparkles className={styles.analyzeBtnIcon} />
          {isAnalyzing ? 'Analyzing…' : 'Analyze Resume'}
        </button>
      )}

      {/* ── Results (shown after analysis) ───────────────────── */}
      {score != null && (
        <div className={styles.resultsRow}>

          {/* Score card */}
          <div className={styles.resultCard}>
            <p className={styles.resultCardTitle}>Resume Score</p>
            <div className={styles.scoreRingWrapper}>
              <svg className={styles.scoreRing} viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r={radius}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 64 64)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <text
                  x="64" y="64"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={styles.scoreText}
                  fill={scoreColor}
                >
                  {score}
                </text>
              </svg>
            </div>
            <p className={styles.scoreSub}>Score out of 100</p>
          </div>

          {/* Feedback card */}
          <div className={styles.resultCard}>
            <p className={styles.resultCardTitle}>AI Feedback</p>
            <p className={styles.feedbackText}>{feedback}</p>
          </div>

        </div>
      )}

    </div>
  );
}
