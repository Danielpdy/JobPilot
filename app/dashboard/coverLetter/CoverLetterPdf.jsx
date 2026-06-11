'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, Trash2, X } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, usePDF } from '@react-pdf/renderer';
import { Document as PdfDoc, Page as PdfPage, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import styles from './page.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const DOC_INNER_WIDTH = 595;

const pdfStyles = StyleSheet.create({
  page:    { padding: 48, fontFamily: 'Helvetica', backgroundColor: '#fff' },
  header:  { marginBottom: 24 },
  title:   { fontSize: 18, fontWeight: 'bold', color: '#111' },
  sub:     { fontSize: 10, color: '#888', marginTop: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginVertical: 16 },
  body:    { fontSize: 11, lineHeight: 1.8, color: '#222' },
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

function PdfPreviewFromUrl({ url }) {
  const [numPages, setNumPages] = useState(null);
  return (
    <PdfDoc file={url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
      {Array.from({ length: numPages ?? 1 }, (_, i) => (
        <PdfPage
          key={i + 1}
          pageNumber={i + 1}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          width={580}
        />
      ))}
    </PdfDoc>
  );
}

export function GeneratedLetterDownloadBtn({ text, company, jobTitle }) {
  const [instance] = usePDF({
    document: <CoverLetterDocument text={text} company={company} jobTitle={jobTitle} />,
  });
  return (
    <a
      className={styles.actionBtn}
      href={instance.url ?? '#'}
      download={`${company} - ${jobTitle}.pdf`}
      onClick={e => !instance.url && e.preventDefault()}
    >
      <Download className={styles.actionIcon} />
      {instance.loading ? 'Preparing…' : 'Download PDF'}
    </a>
  );
}

export function PdfPreview({ text, company, jobTitle }) {
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

export function LetterModal({ letter, onClose }) {
  const [instance] = usePDF({
    document: <CoverLetterDocument text={letter.content} company={letter.company} jobTitle={letter.role} />,
  });

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      className={styles.modalBackdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modalContainer}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.96, y: 14 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <span className={styles.modalTitleCompany}>{letter.company}</span>
            <span className={styles.modalTitleRole}>{letter.role}</span>
          </div>
          <div className={styles.modalHeaderActions}>
            <a
              className={styles.modalDownloadBtn}
              href={instance.url ?? '#'}
              download={`${letter.company} - ${letter.role}.pdf`}
              onClick={e => !instance.url && e.preventDefault()}
            >
              <Download className={styles.modalDownloadIcon} />
              {instance.loading ? 'Preparing…' : 'Download PDF'}
            </a>
            <button className={styles.modalCloseBtn} onClick={onClose}>
              <X className={styles.modalCloseIcon} />
            </button>
          </div>
        </div>
        <div className={styles.modalBody}>
          {instance.loading || !instance.url ? (
            <div className={styles.modalPdfLoading}>Preparing preview…</div>
          ) : (
            <PdfPreviewFromUrl url={instance.url} />
          )}
        </div>
        <div className={styles.modalFooter}>
          <span className={styles.modalFooterDate}>Created {letter.date}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function LetterPreviewCard({ letter, onClick, onDelete }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.36);
  const [instance] = usePDF({
    document: <CoverLetterDocument text={letter.content} company={letter.company} jobTitle={letter.role} />,
  });

  useEffect(() => {
    if (!wrapRef.current) return;
    setScale(wrapRef.current.offsetWidth / DOC_INNER_WIDTH);
  }, []);

  return (
    <div className={styles.docCard} onClick={onClick}>
      <div className={styles.docPreviewWrap} ref={wrapRef}>
        <div className={styles.docPreviewInner} style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <p className={styles.docPreviewRole}>{letter.role}</p>
          <p className={styles.docPreviewCompany}>{letter.company}</p>
          <div className={styles.docPreviewDivider} />
          <p className={styles.docPreviewBody}>{letter.content}</p>
        </div>
      </div>
      <div className={styles.docCardMeta}>
        <p className={styles.docCardTitle}>{letter.company} — {letter.role}</p>
        <div className={styles.docCardFooter}>
          <FileText className={styles.docCardFileIcon} />
          <span className={styles.docCardDate}>Created {letter.date}</span>
          <a
            className={styles.docCardDownloadBtn}
            href={instance.url ?? '#'}
            download={`${letter.company} - ${letter.role}.pdf`}
            onClick={e => { e.stopPropagation(); if (!instance.url) e.preventDefault(); }}
            title="Download PDF"
          >
            <Download className={styles.docCardDownloadIcon} />
          </a>
          <button
            className={styles.docCardDeleteBtn}
            onClick={e => { e.stopPropagation(); onDelete(letter.id); }}
            title="Delete"
          >
            <Trash2 className={styles.docCardDeleteIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}
