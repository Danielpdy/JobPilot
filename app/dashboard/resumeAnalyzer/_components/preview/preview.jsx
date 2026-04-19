'use client';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect, useState } from 'react';
import { FileText, Upload, Download, Lightbulb, RotateCcw, Zap, X, Sparkles } from 'lucide-react';
import { getAnalysis, getResume } from '@/app/Services/ResumeService';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import styles from './preview.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 280, damping: 26, delay },
});


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

export default function Preview({ onUploadNew, token }) {

  const [pdfUrl, setPdfUrl]     = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(300);
  const [resumeAnalysis, setResumeAnalysis] = useState({});

  useEffect(() => {
    if (!token) return;

    analysis();

    getResume(token)
      .then(({ pdfUrl, fileName, fileSize }) => {
        setPdfUrl(pdfUrl);
        setFileName(fileName);
        setFileSize((fileSize / 1024).toFixed(0) + ' KB');
      })
      .catch((err) => console.error(err));

    return () => URL.revokeObjectURL(pdfUrl);
  }, [token]);

  const analysis = async () => {
    try{
      const response = await getAnalysis(token);
      setResumeAnalysis(response);
    }catch(error){
      console.error(error);
    }
  }

  return (
    <div className={styles.wrapper}>

      {/* ── Left — file preview ──────────────────────────────── */}
      <motion.div className={styles.leftCol} {...fadeUp(0)}>

        {/* File bar */}
        <div className={styles.fileBar}>
          <FileText className={styles.fileBarIcon} />
          <span className={styles.fileName}>{fileName.replace(/(.{12}).*(\.\w+)$/, '$1…$2')}</span>
          <span className={styles.fileSize}>{fileSize}</span>
          <button className={styles.uploadNewBtn} onClick={onUploadNew}>
            <Upload className={styles.uploadNewIcon} />
            Upload New
          </button>
          <button className={styles.closeBtn} onClick={onUploadNew} aria-label="Remove file">
            <X className={styles.closeIcon} />
          </button>
        </div>

        {/* PDF preview */}
        <div
          className={styles.previewArea}
          ref={el => { if (el) setPageWidth(el.clientWidth - 32); }}
        >
          {pdfUrl && (
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              className={styles.pdfDocument}
              loading={null}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <Page
                  key={i + 1}
                  pageNumber={i + 1}
                  width={pageWidth}
                  className={styles.pdfPage}
                />
              ))}
            </Document>
          )}
          {(!pdfUrl || !numPages) && (
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
          )}
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
            <ScoreRing score={resumeAnalysis.resumeScore ?? 0} />
            <div className={styles.scoreInfo}>
              <p className={styles.scoreLabel}>RESUME SCORE</p>
              <p className={styles.scoreTitle}>{resumeAnalysis.scoreLabel ?? ''}</p>
              <p className={styles.scoreSub}>{resumeAnalysis.scoreSummary ?? ''}</p>
              <p className={styles.aiIndicator}>
                <Sparkles className={styles.aiIndicatorIcon} />
                AI-powered analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Improvements card */}
        <motion.div className={styles.card} {...fadeUp(0.16)}>

          {/* Improvements */}
          <div className={`${styles.section} ${styles.improvementsSection}`}>
            <div className={styles.sectionHeader}>
              <Lightbulb className={styles.sectionIconBlue} />
              <h3 className={styles.sectionTitle}>Improvements</h3>
            </div>
            <ul className={styles.bulletList}>
              {(resumeAnalysis.improvements ?? []).map((imp, i) => (
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
          <button className={styles.reanalyzeBtn}>
            <RotateCcw className={styles.reanalyzeIcon} />
            Re-analyze Resume
          </button>
          <p className={styles.creditsLeft}>
            <Zap className={styles.creditsIcon} />
3 credits remaining
          </p>
        </motion.div>

      </div>
    </div>
  );
}
