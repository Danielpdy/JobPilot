'use client';

import { useState, Fragment, useRef, useCallback } from 'react';
import styles from './onboard.module.css';
import AnimatedContent from '../components/ui/AnimatedContent/AnimatedContent';
import { RegisterProfile } from '../Services/UserService';
import { analyzeResume } from '../Services/ResumeService';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const STEPS = ['Your Role', 'Your Skills', 'Preferences', 'Resume'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid-Level', 'Senior', 'Lead / Manager'];
const WORK_TYPES = ['Remote', 'Hybrid', 'On-site'];
const SALARY_RANGES = ['< $40k', '$40k–$70k', '$70k–$100k', '$100k–$150k', '$150k+'];

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function OnboardPage() {
  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const { data: session, update } = useSession();
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [workType, setWorkType] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');

  const [resumeFile, setResumeFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const ACCEPTED = ['application/pdf'];
  const MAX_MB   = 5;

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && ACCEPTED.includes(file.type) && file.size <= MAX_MB * 1024 * 1024) {
      setResumeFile(file);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };

  function formatBytes(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function addSkill(e) {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const val = skillInput.trim().replace(/,$/, '');
      if (val && !skills.includes(val)) setSkills(s => [...s, val]);
      setSkillInput('');
    }
  }

  function removeSkill(sk) {
    setSkills(s => s.filter(x => x !== sk));
  }

  function canProceed() {
    if (step === 0) return jobTitle.trim() && experience;
    if (step === 1) return skills.length > 0;
    if (step === 2) return workType && salary;
    if (step === 3) return true; // resume is optional
    return false;
  }

  async function handleFinish() {
    setFinishing(true);
    const profileInfo = {
      JobTitle: jobTitle,
      ExperienceLevel: experience,
      Skills: skills,
      WorkType: workType,
      SalaryRange: salary,
      PreferredLocation: location || ""
    };

    try {
      await RegisterProfile(profileInfo, session.accessToken);
      if (resumeFile) {
        await analyzeResume(resumeFile, session.accessToken);
      }
      await update({ IsOnboarded: true });
      router.push("/dashboard");
    } catch (error) {
      console.error('Profile creation failed:', error);
      setFinishing(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <img src="/icons/JobPilot (2).png" alt="JobPilot" className={styles.navLogo} />
      </nav>

      {/* ── Step indicator (outside container) ── */}
      <AnimatedContent
        distance={20}
        direction="vertical"
        duration={0.6}
        ease="power3.out"
        initialOpacity={0}
        animateOpacity
        threshold={0.1}
        delay={0.05}
        style={{ width: '100%', maxWidth: '540px' }}
      >
        <div className={styles.stepIndicator}>
          {STEPS.map((label, i) => (
            <Fragment key={i}>
              <div className={styles.stepItem}>
                <div
                  className={[
                    styles.stepCircle,
                    i < step ? styles.stepDone : '',
                    i === step ? styles.stepActive : '',
                  ].join(' ')}
                >
                  {i < step ? <CheckIcon /> : <span>{i + 1}</span>}
                </div>
                <span
                  className={[
                    styles.stepLabel,
                    i === step ? styles.stepLabelActive : '',
                    i < step ? styles.stepLabelDone : '',
                  ].join(' ')}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`${styles.connector} ${i < step ? styles.connectorDone : ''}`} />
              )}
            </Fragment>
          ))}
        </div>
      </AnimatedContent>

      {/* ── Container ── */}
      <AnimatedContent
        distance={30}
        direction="vertical"
        duration={0.7}
        ease="power3.out"
        initialOpacity={0}
        animateOpacity
        threshold={0.1}
        delay={0.15}
      >
        <div className={styles.container}>

          {/* ── Step 1: Role ── */}
          {step === 0 && (
            <div className={styles.stepContent}>
              <h2 className={styles.cardTitle}>What's your role?</h2>
              <p className={styles.cardSubtitle}>Tell us where you are in your career journey.</p>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Current or target job title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Product Manager"
                  className={styles.inputNoIcon}
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Experience level</label>
                <div className={styles.pillGroup}>
                  {EXPERIENCE_LEVELS.map(level => (
                    <button
                      key={level}
                      type="button"
                      className={`${styles.pill} ${experience === level ? styles.pillActive : ''}`}
                      onClick={() => setExperience(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Skills ── */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.cardTitle}>What are your skills?</h2>
              <p className={styles.cardSubtitle}>Add skills you have or want to use. Press Enter after each one.</p>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Skills</label>
                <div className={styles.tagContainer}>
                  {skills.map(sk => (
                    <span key={sk} className={styles.tag}>
                      {sk}
                      <button type="button" className={styles.tagRemove} onClick={() => removeSkill(sk)}>×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={skills.length === 0 ? 'e.g. React, Python, Figma…' : 'Add more…'}
                    className={styles.tagInput}
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                  />
                </div>
                <p className={styles.fieldHint}>Press Enter or comma to add a skill</p>
              </div>
            </div>
          )}

          {/* ── Step 3: Preferences ── */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.cardTitle}>Work preferences</h2>
              <p className={styles.cardSubtitle}>Help us find opportunities that fit your lifestyle.</p>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Work type</label>
                <div className={styles.pillGroup}>
                  {WORK_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`${styles.pill} ${workType === type ? styles.pillActive : ''}`}
                      onClick={() => setWorkType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Expected salary</label>
                <div className={styles.pillGroup}>
                  {SALARY_RANGES.map(range => (
                    <button
                      key={range}
                      type="button"
                      className={`${styles.pill} ${salary === range ? styles.pillActive : ''}`}
                      onClick={() => setSalary(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Preferred location{' '}
                  <span className={styles.fieldHintInline}>(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. New York, Remote, London"
                  className={styles.inputNoIcon}
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── Step 4: Resume Upload ── */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.cardTitle}>Upload your resume</h2>
              <p className={styles.cardSubtitle}>
                Optional — you can always add it later from your profile.
              </p>

              {!resumeFile ? (
                <div
                  className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={styles.dropIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#0992C2" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14 2 14 8 20 8" stroke="#0992C2" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="18" x2="12" y2="12" stroke="#0992C2" strokeWidth="1.7" strokeLinecap="round"/>
                      <polyline points="9 15 12 12 15 15" stroke="#0992C2" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className={styles.dropTitle}>
                    {dragOver ? 'Drop it here' : 'Drag & drop your resume'}
                  </p>
                  <p className={styles.dropSub}>or <span className={styles.dropLink}>browse files</span></p>
                  <p className={styles.dropHint}>PDF only · max 5 MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className={styles.hiddenInput}
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className={styles.fileCard}>
                  <div className={styles.fileIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#0B2D72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14 2 14 8 20 8" stroke="#0B2D72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.fileMeta}>
                    <p className={styles.fileName}>{resumeFile.name}</p>
                    <p className={styles.fileSize}>{formatBytes(resumeFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    className={styles.fileRemove}
                    onClick={() => { setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    title="Remove"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <line x1="18" y1="6" x2="6" y2="18" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="6" y1="6" x2="18" y2="18" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className={styles.navRow}>
            {step > 0 && (
              <button className={styles.backBtn} onClick={() => setStep(s => s - 1)}>
                ← Back
              </button>
            )}
            <button
              className={styles.continueBtn}
              disabled={!canProceed() || finishing}
              onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : handleFinish()}
              style={step === 0 ? { marginLeft: 'auto' } : {}}
            >
              {finishing
                ? <span className={styles.spinner} />
                : step < STEPS.length - 1
                  ? 'Continue →'
                  : resumeFile
                    ? 'Start Exploring →'
                    : 'Skip & Explore →'}
            </button>
          </div>

        </div>
      </AnimatedContent>

    </div>
  );
}
