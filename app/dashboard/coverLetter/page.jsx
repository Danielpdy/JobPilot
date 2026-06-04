'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, FileText, Building2, Briefcase,
  Upload, Save, Copy, Download, ChevronDown,
} from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, usePDF } from '@react-pdf/renderer';
import { Document as PdfDoc, Page as PdfPage, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
import styles from './page.module.css';
import { CreateCoverLetter } from '@/app/Services/CoverLetterService';
import GlassBubbleNav from '@/app/components/ui/GlassBubbleNav/GlassBubbleNav';
import { getResumeInfo } from '@/app/Services/ResumeService';
import { error } from 'three';

const VIEW_TABS = [{ label: 'New' }, { label: 'History' }];

const pdfStyles = StyleSheet.create({
  page:   { padding: 48, fontFamily: 'Helvetica', backgroundColor: '#fff' },
  header: { marginBottom: 24 },
  title:  { fontSize: 18, fontWeight: 'bold', color: '#111' },
  sub:    { fontSize: 10, color: '#888', marginTop: 4 },
  divider:{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginVertical: 16 },
  body:   { fontSize: 11, lineHeight: 1.8, color: '#222' },
});

function CoverLetterDocument({ text, company, jobTitle }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>{jobTitle}</Text>
          <Text style={pdfStyles.sub}>{company}</Text>
        </View>
        <View style={pdfStyles.divider} />
        <Text style={pdfStyles.body}>{text}</Text>
      </Page>
    </Document>
  );
}

function PdfPreview({ text, company, jobTitle }) {
  const [numPages, setNumPages] = useState(null);
  const [instance] = usePDF({
    document: <CoverLetterDocument text={text} company={company} jobTitle={jobTitle} />,
  });

  if (instance.loading || !instance.url) return null;

  return (
    <div style={{ flex: 1, overflow: 'auto', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
      <PdfDoc file={instance.url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
        {Array.from({ length: numPages ?? 1 }, (_, i) => (
          <PdfPage
            key={i + 1}
            pageNumber={i + 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={560}
          />
        ))}
      </PdfDoc>
    </div>
  );
}

const TONES = ['Professional', 'Confident', 'Friendly', 'Formal', 'Concise'];

// ── Hardcoded recent cover letters — replace with API data when ready ──────────
const RECENT_LETTERS = [
  { id: 1, company: 'Linear',  role: 'Product Designer',   date: 'May 14' },
  { id: 2, company: 'Vercel',  role: 'Frontend Engineer',  date: 'May 9'  },
  { id: 3, company: 'Notion',  role: 'Design Engineer',    date: 'May 2'  },
  { id: 4, company: 'Stripe',  role: 'Senior PM',          date: 'Apr 24' },
];
// ─────────────────────────────────────────────────────────────────────────────

const formVariants   = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};
const outputVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26, delay: 0.07 } },
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
  const [error, setError] = useState('');

  const resumeInputRef = useRef(null);
  const canGenerate    = company.trim() && jobTitle.trim() && jobDescription.trim();

  useEffect(() => {
    if (!accessToken) return;
    getResumeInfo(accessToken)
      .then(data => setResumeInfo(data))
      .catch(() => setResumeInfo(null));
  }, [accessToken]);

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

  const handleGenerate = async () => {
    setIsGenerating(true);
    try{
      const response = await CreateCoverLetter({ file: resumeFile || null, company, jobTitle, jobDescription, tone, accessToken });
      setGeneratedLetter(response.coverLetterText);
    }catch(err){
      console.error(err);
      if(err.status === 400){
        setError('A resume must be uploaded to generate a cover letter.');
      }
    } finally {
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

  const handleCopy = () => {
    if (generatedLetter) navigator.clipboard.writeText(generatedLetter);
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
                    {resumeInfo
                      ? <option value="saved">{resumeFile ? resumeFile.name : resumeInfo.fileName}</option>
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
                <button className={styles.actionBtn} disabled={!generatedLetter}>
                  <Save className={styles.actionIcon} />
                  Save
                </button>
                <button className={styles.actionBtn} disabled={!generatedLetter} onClick={handleCopy}>
                  <Copy className={styles.actionIcon} />
                  Copy
                </button>
                <button className={styles.actionBtn} disabled={!generatedLetter}>
                  <Download className={styles.actionIcon} />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Output body */}
            <div className={styles.outputBody}>
              {generatedLetter ? (
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

      {/* ── Recent tab ───────────────────────────────────────── */}
      {activeTab === 1 && (
        <div className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <span className={styles.recentTitle}>Recent</span>
            <button className={styles.viewAllBtn}>View all</button>
          </div>
          <div className={styles.recentStrip}>
            {RECENT_LETTERS.map(letter => (
              <button key={letter.id} className={styles.recentCard}>
                <div className={styles.recentAvatar}>
                  {letter.company.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.recentInfo}>
                  <span className={styles.recentCompany}>{letter.company}</span>
                  <span className={styles.recentRole}>{letter.role}</span>
                </div>
                <span className={styles.recentDate}>{letter.date}</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
