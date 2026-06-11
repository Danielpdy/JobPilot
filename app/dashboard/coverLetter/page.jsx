'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, FileText, Building2, Briefcase,
  Upload, ChevronDown,
  CheckCircle, PenLine,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

const GeneratedLetterDownloadBtn = dynamic(() => import('./CoverLetterPdf').then(m => ({ default: m.GeneratedLetterDownloadBtn })), { ssr: false });
const PdfPreview                 = dynamic(() => import('./CoverLetterPdf').then(m => ({ default: m.PdfPreview })),                 { ssr: false });
const LetterModal                = dynamic(() => import('./CoverLetterPdf').then(m => ({ default: m.LetterModal })),                { ssr: false });
const LetterPreviewCard          = dynamic(() => import('./CoverLetterPdf').then(m => ({ default: m.LetterPreviewCard })),          { ssr: false });
import { CreateCoverLetter, GetCoverLetterHistory, DeleteCoverLetter } from '@/app/Services/CoverLetterService';
import GlassBubbleNav from '@/app/components/ui/GlassBubbleNav/GlassBubbleNav';
import { getResumeInfo } from '@/app/Services/ResumeService';

const VIEW_TABS = [{ label: 'New' }, { label: 'History' }];

const GENERATING_STEPS = [
  {
    Icon:     FileText,
    label:    'Reading',
    status:   'Reading your resume…',
    subtexts: ['Loading your resume...', 'Extracting your experience...'],
  },
  {
    Icon:     PenLine,
    label:    'Writing',
    status:   'Crafting your cover letter…',
    subtexts: ['Tailoring to the job...', 'Matching your experience...', 'Crafting compelling paragraphs...'],
  },
  {
    Icon:     Sparkles,
    label:    'Refining',
    status:   'Polishing the final draft…',
    subtexts: ['Reviewing tone and style...', 'Almost done...'],
  },
];
const GENERATING_TIMINGS = [0, 5000];


const TONES = ['Professional', 'Confident', 'Friendly', 'Formal', 'Concise'];



const formVariants   = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};
const outputVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26, delay: 0.07 } },
};
const historySectionVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const historyItemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

export default function CoverLetterPage({ accessToken }) {
  const [company, setCompany]                 = useState('');
  const [jobTitle, setJobTitle]               = useState('');
  const [jobDescription, setJobDescription]   = useState('');
  const [tone, setTone]                       = useState('Professional');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating]       = useState(false);
  const [resumeFile, setResumeFile]           = useState(null);
  const [resumeInfo, setResumeInfo]           = useState(null);
  const [activeTab, setActiveTab]             = useState(0);
  const [error, setError]                     = useState('');
  const [selectedLetter, setSelectedLetter]   = useState(null);
  const [history, setHistory]                 = useState([]);
  const [stepIndex, setStepIndex]             = useState(0);
  const [subtextIndex, setSubtextIndex]       = useState(0);
  const [fillIndex, setFillIndex]             = useState(-1);
  const [resultReady, setResultReady]         = useState(false);

  const resumeInputRef = useRef(null);
  const stepTimersRef  = useRef([]);
  const currentStepRef = useRef(0);
  const canGenerate    = company.trim() && jobTitle.trim() && jobDescription.trim();

  useEffect(() => {
    if (!accessToken) return;
    getResumeInfo(accessToken)
      .then(data => setResumeInfo(data))
      .catch(() => setResumeInfo(null));
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    GetCoverLetterHistory(accessToken)
      .then(data => setHistory(data.coverLetters.map(cl => ({
        id:      cl.id,
        company: cl.company,
        role:    cl.jobTitle,
        content: cl.coverLetterText,
        date:    new Date(cl.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }))))
      .catch(() => setHistory([]));
  }, [accessToken]);

  const handleDelete = async (id) => {
    try {
      await DeleteCoverLetter(id, accessToken);
      setHistory(prev => prev.filter(cl => cl.id !== id));
    } catch {
      setError('Failed to delete cover letter. Please try again.');
    }
  };

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 4000);
    const dismiss = () => setError('');
    document.addEventListener('click', dismiss);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', dismiss);
    };
  }, [error]);

  // Drive step progression while generating
  useEffect(() => {
    if (!isGenerating) {
      setStepIndex(0); setSubtextIndex(0); setFillIndex(-1); setResultReady(false);
      return;
    }
    stepTimersRef.current = [];
    GENERATING_TIMINGS.slice(1).forEach((ms, i) => {
      stepTimersRef.current.push(setTimeout(() => setFillIndex(i), ms - 500));
      stepTimersRef.current.push(setTimeout(() => { setStepIndex(i + 1); setSubtextIndex(0); }, ms));
    });
    return () => stepTimersRef.current.forEach(clearTimeout);
  }, [isGenerating]);

  useEffect(() => { currentStepRef.current = stepIndex; }, [stepIndex]);

  // Fast-forward remaining steps once the API responds
  useEffect(() => {
    if (!resultReady) return;
    stepTimersRef.current.forEach(clearTimeout);
    stepTimersRef.current = [];
    const FAST     = 500;
    const start    = currentStepRef.current;
    const remaining = GENERATING_STEPS.length - 1 - start;
    const timers   = [];
    for (let k = 0; k < remaining; k++) {
      const delay = (k + 1) * FAST;
      timers.push(setTimeout(() => setFillIndex(start + k),                               delay - 300));
      timers.push(setTimeout(() => { setStepIndex(start + k + 1); setSubtextIndex(0); }, delay));
    }
    const finalDelay = remaining === 0 ? 500 : remaining * FAST + 500;
    timers.push(setTimeout(() => setIsGenerating(false), finalDelay));
    return () => timers.forEach(clearTimeout);
  }, [resultReady]);

  // Rotate subtext within the active step
  useEffect(() => {
    if (!isGenerating) return;
    const subtexts = GENERATING_STEPS[stepIndex].subtexts;
    if (subtexts.length <= 1) return;
    const interval = setInterval(() => {
      setSubtextIndex(i => (i + 1) % subtexts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isGenerating, stepIndex]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResultReady(false);
    try {
      const response = await CreateCoverLetter({ file: resumeFile || null, company, jobTitle, jobDescription, tone, accessToken });
      setGeneratedLetter(response.coverLetterText);
      setResultReady(true);
    } catch(err) {
      console.error(err);
      if(err.status === 400){
        setError('A resume must be uploaded to generate a cover letter.');
      }
      setIsGenerating(false);
    }
  };

  const handleDescDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (ev) => setJobDescription(ev.target.result);
      reader.readAsText(file);
    }
  };


  return (
    <div className={styles.page}>

      {/* ── Error toast ──────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            className={styles.errorToast}
            initial={{ opacity: 0, y: -16, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -16, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── View toggle ──────────────────────────────────────── */}
      <div className={styles.tabRow}>
        <GlassBubbleNav
          items={VIEW_TABS}
          activeIndex={activeTab}
          orientation="horizontal"
          onChange={setActiveTab}
        />
      </div>

      {/* ── Workspace (Generate tab) ──────────────────────────── */}
      {activeTab === 0 && <div className={styles.workspace}>

        {/* ── Left: form column ────────────────────────────── */}
        <motion.div
          className={styles.formColumn}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <div className={`${styles.formCard} ${generatedLetter ? styles.formCardBack : ''}`}>

            {/* Resume */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <FileText className={styles.fieldIcon} />
                Resume
              </label>
              <div className={styles.resumeRow}>
                <div className={styles.selectWrap}>
                  <select className={styles.select} defaultValue="saved" readOnly>
                    {resumeFile
                      ? <option value="saved">{resumeFile.name}</option>
                      : resumeInfo
                        ? <option value="saved">{resumeInfo.fileName}</option>
                        : <option value="">No resume on file</option>
                    }
                  </select>
                  <ChevronDown className={styles.selectChevron} />
                </div>
                <button
                  className={styles.uploadBtn}
                  onClick={() => resumeInputRef.current?.click()}
                >
                  <Upload className={styles.uploadIcon} />
                  Upload
                </button>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={e => setResumeFile(e.target.files[0] || null)}
                />
              </div>
            </div>

            {/* Company + Job Title */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  <Building2 className={styles.fieldIcon} />
                  Company
                </label>
                <input
                  className={styles.input}
                  placeholder="e.g. Linear"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  <Briefcase className={styles.fieldIcon} />
                  Job Title
                </label>
                <input
                  className={styles.input}
                  placeholder="e.g. Product Designer"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Job Description */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Job Description</label>
              <div
                className={styles.textareaWrap}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDescDrop}
              >
                <textarea
                  className={styles.textarea}
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  rows={7}
                />
                <div className={styles.textareaFooter}>
                  <span className={styles.dragHint}>Drag &amp; drop a .txt file</span>
                  <span className={styles.charCount}>{jobDescription.length}</span>
                </div>
              </div>
            </div>

            {/* Tone */}
            <div className={styles.field}>
              <label className={`${styles.fieldLabel} ${styles.fieldLabelMuted}`}>Tone</label>
              <div className={styles.tones}>
                {TONES.map(t => (
                  <button
                    key={t}
                    className={`${styles.tonePill} ${tone === t ? styles.tonePillActive : ''}`}
                    onClick={() => setTone(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}
            <button
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
            >
              <Sparkles className={styles.generateIcon} />
              {isGenerating ? 'Generating…' : 'Generate Cover Letter'}
            </button>
          </div>

          </motion.div>

        {/* ── Right: output column ──────────────────────────── */}
        <motion.div
          className={styles.outputColumn}
          variants={outputVariants}
          initial="hidden"
          animate="visible"
        >
          <div className={styles.outputCard}>

            {/* Output header */}
            <div className={styles.outputHeader}>
              <div className={styles.outputActions}>
                {generatedLetter && (
                  <GeneratedLetterDownloadBtn text={generatedLetter} company={company} jobTitle={jobTitle} />
                )}
              </div>
            </div>

            {/* Output body */}
            <div className={styles.outputBody}>
              {isGenerating ? (
                <div className={styles.generatingState}>
                  <p className={styles.generatingTitle}>Generating your cover letter</p>
                  <div className={styles.hStepRow}>
                    {GENERATING_STEPS.map((step, i) => {
                      const isDone   = i < stepIndex;
                      const isActive = i === stepIndex;
                      const isLast   = i === GENERATING_STEPS.length - 1;
                      const isFilled = i <= fillIndex;
                      const StepIcon = step.Icon;
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
                  <motion.p
                    key={GENERATING_STEPS[stepIndex].subtexts[subtextIndex]}
                    className={styles.activeSubtext}
                    initial={{ opacity: 0, y: 4  }}
                    animate={{ opacity: 1, y: 0  }}
                    exit={{    opacity: 0, y: -4 }}
                    transition={{ duration: 0.5 }}
                  >
                    {GENERATING_STEPS[stepIndex].subtexts[subtextIndex]}
                  </motion.p>
                  <p className={styles.stepCount}>
                    Step {stepIndex + 1} of {GENERATING_STEPS.length} &bull; {GENERATING_STEPS[stepIndex].status}
                  </p>
                </div>
              ) : generatedLetter ? (
                <PdfPreview
                  text={generatedLetter}
                  company={company}
                  jobTitle={jobTitle}
                />
              ) : (
                <div className={styles.emptyState}>
                  <FileText className={styles.emptyIcon} />
                  <p className={styles.emptyTitle}>Your draft will appear here once generated.</p>
                  <p className={styles.emptySub}>Fill in the details on the left and click Generate.</p>
                </div>
              )}
            </div>

          </div>
        </motion.div>

      </div>}

      {activeTab === 1 && (
        <motion.div
          className={styles.historySection}
          variants={historySectionVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className={styles.historyHeader} variants={historyItemVariants}>
            <span className={styles.historyTitle}>Recent</span>
          </motion.div>
          <div className={styles.historyGrid}>
            {history.map(letter => (
              <motion.div key={letter.id} variants={historyItemVariants}>
                <LetterPreviewCard letter={letter} onClick={() => setSelectedLetter(letter)} onDelete={handleDelete} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedLetter && (
          <LetterModal letter={selectedLetter} onClose={() => setSelectedLetter(null)} />
        )}
      </AnimatePresence>

    </div>
  );
}
