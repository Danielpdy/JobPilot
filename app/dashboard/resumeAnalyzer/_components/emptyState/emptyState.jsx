'use client';
import { useState, useRef } from 'react';
import { Upload, Sparkles, BarChart2, ArrowRight, Zap } from 'lucide-react';
import styles from './emptyState.module.css';

const MAX_ANALYSES = 3;

const steps = [
  { Icon: Upload,    title: 'Upload',  desc: 'Drop your PDF resume'   },
  { Icon: Sparkles,  title: 'Analyze', desc: 'AI reviews your resume' },
  { Icon: BarChart2, title: 'Improve', desc: 'Get score & feedback'   },
];

export default function ResumeBuilder() {
  const [file, setFile]                 = useState(null);
  const [dragging, setDragging]         = useState(false);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [score, setScore]               = useState(null);
  const [feedback, setFeedback]         = useState(null);
  const [analysesLeft, setAnalysesLeft] = useState(MAX_ANALYSES);
  const inputRef = useRef(null);

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

  const handleAnalyze = async () => {
    if (!file || analysesLeft <= 0 || isAnalyzing) return;
    setIsAnalyzing(true);
    // TODO: call real API
    await new Promise(r => setTimeout(r, 2000));
    setScore(72);
    setFeedback('Your resume is well-structured. Consider adding quantified achievements to your experience section and tailoring keywords to each job description to improve ATS compatibility.');
    setAnalysesLeft(n => n - 1);
    setIsAnalyzing(false);
  };

  /* ── Score ring ─────────────────────────────────────────── */
  const radius     = 54;
  const circ       = 2 * Math.PI * radius;
  const scoreColor = score >= 80 ? '#0AC4E0' : score >= 60 ? '#0992C2' : '#0B2D72';
  const dashOffset = score != null ? circ - (score / 100) * circ : circ;

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
