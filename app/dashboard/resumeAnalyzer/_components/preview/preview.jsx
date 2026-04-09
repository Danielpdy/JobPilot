'use client';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect } from 'react';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Lightbulb, RotateCcw, Zap, X, Sparkles } from 'lucide-react';
import styles from './preview.module.css';

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 280, damping: 26, delay },
});

/* ── SAMPLE DATA — replace with API response later ───────── */
const SAMPLE = {
  fileName:      'John_Doe_Resume.pdf',
  fileSize:      '245 KB',
  creditsLeft:   3,
  score:         82,
  scoreLabel:    'Strong Overall',
  scoreSubtitle: 'With room for improvement in key areas',
  strengths: [
    'Clear and concise professional summary',
    'Strong technical skills aligned with role',
    'Good use of action verbs throughout',
  ],
  weaknesses: [
    'Lacks quantifiable achievements',
    'Formatting inconsistencies across sections',
    'Education section lacks detail',
  ],
  improvements: [
    'Add measurable impact (e.g., "Improved performance by 25%")',
    'Standardize spacing and typography',
    'Expand education or add notable projects',
  ],
};
/* ────────────────────────────────────────────────────────── */

function ScoreRing({ score }) {
  const radius = 54;
  const circ   = 2 * Math.PI * radius;
  const color  = score >= 80 ? '#22c55e' : score >= 60 ? '#0992C2' : '#ef4444';

  const progress    = useMotionValue(0);
  const dashOffset  = useTransform(progress, v => circ - (v / 100) * circ);
  const displayNum  = useTransform(progress, v => Math.round(v));

  useEffect(() => {
    const controls = animate(progress, score, {
      duration: 1.4,
      ease: 'easeOut',
      delay: 0.3,
    });
    return controls.stop;
  }, [score]);

  return (
    <svg className={styles.scoreRingSvg} viewBox="0 0 128 128">
      <circle cx="64" cy="64" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
      <motion.circle
        cx="64" cy="64" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 64 64)"
      />
      <motion.text x="64" y="58" textAnchor="middle" dominantBaseline="middle" className={styles.scoreNumber} fill="#111827">
        {displayNum}
      </motion.text>
      <text x="64" y="78" textAnchor="middle" dominantBaseline="middle" className={styles.scoreSlash} fill="#9CA3AF">/ 100</text>
    </svg>
  );
}

export default function Preview({ onUploadNew, onReanalyze }) {
  const d = SAMPLE;

  return (
    <div className={styles.wrapper}>

      {/* ── Left — file preview ──────────────────────────────── */}
      <motion.div className={styles.leftCol} {...fadeUp(0)}>

        {/* File bar */}
        <div className={styles.fileBar}>
          <FileText className={styles.fileBarIcon} />
          <span className={styles.fileName}>{d.fileName.replace(/(.{12}).*(\.\w+)$/, '$1…$2')}</span>
          <span className={styles.fileSize}>{d.fileSize}</span>
          <button className={styles.uploadNewBtn} onClick={onUploadNew}>
            <Upload className={styles.uploadNewIcon} />
            Upload New
          </button>
          <button className={styles.closeBtn} onClick={onUploadNew} aria-label="Remove file">
            <X className={styles.closeIcon} />
          </button>
        </div>

        {/* Skeleton preview */}
        <div className={styles.previewArea}>
          <div className={styles.skeletonPage}>
            <div className={`${styles.skLine} ${styles.skTitle}`} />
            <div className={`${styles.skLine} ${styles.skMd}`} />
            <div className={`${styles.skLine} ${styles.skLg}`} />
            <div className={`${styles.skLine} ${styles.skSm}`} />
            <div className={styles.skGap} />
            <div className={`${styles.skLine} ${styles.skLg}`} />
            <div className={`${styles.skLine} ${styles.skMd}`} />
            <div className={`${styles.skLine} ${styles.skLg}`} />
            <div className={`${styles.skLine} ${styles.skSm}`} />
            <div className={styles.skGap} />
            <div className={`${styles.skLine} ${styles.skMd}`} />
            <div className={`${styles.skLine} ${styles.skLg}`} />
            <div className={styles.skGap} />
            <div className={styles.skChipsRow}>
              <div className={styles.skChip} />
              <div className={styles.skChip} />
              <div className={styles.skChip} />
            </div>
            <div className={`${styles.skLine} ${styles.skSm}`} />
          </div>
        </div>

        {/* Download bar */}
        <div className={styles.downloadBar}>
          <button className={styles.downloadBtn}>
            <Download className={styles.downloadIcon} />
            Download
          </button>
        </div>

      </motion.div>

      {/* ── Right — results ──────────────────────────────────── */}
      <div className={styles.rightCol}>

        {/* Score card */}
        <motion.div className={styles.card} {...fadeUp(0.08)}>
          <div className={styles.scoreRow}>
            <ScoreRing score={d.score} />
            <div className={styles.scoreInfo}>
              <p className={styles.scoreLabel}>RESUME SCORE</p>
              <p className={styles.scoreTitle}>{d.scoreLabel}</p>
              <p className={styles.scoreSub}>{d.scoreSubtitle}</p>
              <p className={styles.aiIndicator}>
                <Sparkles className={styles.aiIndicatorIcon} />
                AI-powered analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Strengths + Weaknesses + Improvements card */}
        <motion.div className={styles.card} {...fadeUp(0.16)}>

          {/* Strengths */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <CheckCircle2 className={styles.sectionIconGreen} />
              <h3 className={styles.sectionTitle}>Strengths</h3>
            </div>
            <ul className={styles.bulletList}>
              {d.strengths.map((s, i) => (
                <li key={i} className={styles.bulletItem}>
                  <span className={styles.dotGreen} />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <hr className={styles.divider} />

          {/* Weaknesses */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <AlertCircle className={styles.sectionIconRed} />
              <h3 className={styles.sectionTitle}>Weaknesses</h3>
            </div>
            <ul className={styles.bulletList}>
              {d.weaknesses.map((w, i) => (
                <li key={i} className={styles.bulletItem}>
                  <span className={styles.dotRed} />
                  {w}
                </li>
              ))}
            </ul>
          </div>

          <hr className={styles.divider} />

          {/* Improvements */}
          <div className={`${styles.section} ${styles.improvementsSection}`}>
            <div className={styles.sectionHeader}>
              <Lightbulb className={styles.sectionIconBlue} />
              <h3 className={styles.sectionTitle}>Improvements</h3>
            </div>
            <ul className={styles.bulletList}>
              {d.improvements.map((imp, i) => (
                <li key={i} className={styles.bulletItem}>
                  <span className={styles.dotBlue} />
                  {imp}
                </li>
              ))}
            </ul>
          </div>

        </motion.div>

        {/* Re-analyze card */}
        <motion.div className={styles.card} {...fadeUp(0.24)}>
          <button className={styles.reanalyzeBtn} onClick={onReanalyze}>
            <RotateCcw className={styles.reanalyzeIcon} />
            Re-analyze Resume
          </button>
          <p className={styles.creditsLeft}>
            <Zap className={styles.creditsIcon} />
            {d.creditsLeft} credits remaining
          </p>
        </motion.div>

      </div>
    </div>
  );
}
