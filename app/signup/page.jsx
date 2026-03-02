'use client';

import { useState } from 'react';
import styles from './signup.module.css';
import { Register } from '../Services/UserService';

const FIELDS = [
  '', 'Software Engineering', 'Data Science / Analytics', 'Product Management',
  'Design (UX/UI)', 'Marketing', 'Finance & Accounting', 'Healthcare',
  'Education', 'Sales', 'Operations & Logistics', 'Legal', 'Other',
];

const DEGREES = [
  '', "High School / GED", "Associate's Degree", "Bachelor's Degree",
  "Master's Degree", "Doctorate (PhD)", "Bootcamp / Certificate", "Other",
];

const EXP_OPTIONS = ['< 1 year', '1–2 years', '3–5 years', '5–10 years', '10+ years'];
const JOB_TYPES   = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const WORK_MODES  = ['Remote', 'Hybrid', 'On-site'];
const SALARY_RANGES = ['< $40k', '$40–60k', '$60–80k', '$80–100k', '$100–130k', '$130k+'];

const STEP_LABELS = ['Create Account', 'Skills', 'Preferences', 'Start Swiping'];

const CheckMark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function SignupPage() {
  const [step, setStep] = useState(1);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 — Background & Skills
  const [field, setField] = useState('');
  const [degree, setDegree] = useState('');
  const [experience, setExperience] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);

  // Step 3 — Preferences
  const [workMode, setWorkMode] = useState('');
  const [jobTypes, setJobTypes] = useState([]);
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [openToRelocation, setOpenToRelocation] = useState(false);

  /* ── Skill tag handlers ── */
  const handleSkillKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim().replace(/,+$/, '');
      if (newSkill && !skills.includes(newSkill)) {
        setSkills(prev => [...prev, newSkill]);
      }
      setSkillInput('');
    } else if (e.key === 'Backspace' && !skillInput && skills.length) {
      setSkills(prev => prev.slice(0, -1));
    }
  };
  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s));

  /* ── Job type toggle ── */
  const toggleJobType = (t) =>
    setJobTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  /* ── Dynamic stepper ── */
  const renderStepper = () => (
    <div className={styles.stepper}>
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const isDone   = step > num;
        const isActive = step === num;
        const isLast   = num === STEP_LABELS.length;
        return (
          <div key={num} className={`${styles.step} ${isLast ? styles.stepLast : ''}`}>
            <div className={`${styles.stepCircle} ${!isDone && !isActive ? styles.stepCircleInactive : ''}`}>
              {isDone ? <CheckMark /> : num}
            </div>
            {!isLast && (
              <div className={`${styles.stepConnector} ${isDone ? styles.stepConnectorDone : isActive ? styles.stepConnectorActive : ''}`} />
            )}
            <span className={`${styles.stepLabel} ${!isDone && !isActive ? styles.stepLabelInactive : ''}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );

  const CARD_TITLES = {
    1: "Let's get started",
    2: 'Your background',
    3: 'Job preferences',
    4: "You're all set!",
  };

  const userCredentials = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password
  }

  async function handleSubmit(){

    await Register(userCredentials);

    
  }

  return (
    <div className={styles.container}>
      {/* ── Left Panel ── */}
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 17.5L19 6.5M19 6.5H9M19 6.5V16.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.logoText}>JobPilot</span>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.avatarWrapper}>
            <img
              src="https://placehold.co/240x240/e8dcc8/8a7a6a?text=Pilot"
              alt="AI Pilot"
              className={styles.avatarImage}
            />
            <div className={styles.rocketBadge}>🚀</div>
          </div>
          <h1 className={styles.heroTitle}>Your next job is closer than you think.</h1>
          <p className={styles.heroSubtitle}>Let our AI pilot guide you through a personalized career journey.</p>
        </div>

        <div className={styles.aiPoweredBadge}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="white"/>
            <path d="M19 2L19.75 4.25L22 5L19.75 5.75L19 8L18.25 5.75L16 5L18.25 4.25L19 2Z" fill="white"/>
          </svg>
          <span>AI-powered personalized matching engine</span>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>{CARD_TITLES[step]}</h2>
            <span className={styles.cardSubtitle}>
              {step === 1 ? 'Takes under 2 minutes' : `Step ${step} of 4`}
            </span>
          </div>

          {renderStepper()}

          {/* ════ Step 1: Email ════ */}
          {step === 1 && (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Full name</label>
                <div className={styles.nameRow}>
                  <input
                    type="text"
                    placeholder="First name"
                    className={styles.inputNoIcon}
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    className={styles.inputNoIcon}
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email address</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className={styles.input}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && firstName.trim() && lastName.trim() && email.trim() && password.trim() && setStep(2)}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Password</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-7V9A6 6 0 0 0 6 9v1H4v12h16V10h-2zm-8-1V9a2 2 0 1 1 4 0v1H10z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className={styles.input}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && firstName.trim() && lastName.trim() && email.trim() && password.trim() && setStep(2)}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="#9CA3AF" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                className={styles.continueBtn}
                onClick={() => firstName.trim() && lastName.trim() && email.trim() && password.trim() && setStep(2)}
                disabled={!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()}
              >
                Continue &nbsp;→
              </button>

              <div className={styles.divider}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerText}>OR</span>
                <div className={styles.dividerLine} />
              </div>

              <button className={styles.oauthBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button className={styles.oauthBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>

              <div className={styles.nextSection}>
                <p className={styles.nextTitle}>WHAT HAPPENS NEXT?</p>
                <ul className={styles.nextList}>
                  <li className={styles.nextItem}>
                    <span className={styles.checkIcon}><CheckMark /></span>
                    We'll scan your profile for top skills
                  </li>
                  <li className={styles.nextItem}>
                    <span className={styles.checkIcon}><CheckMark /></span>
                    AI builds your custom job feed
                  </li>
                  <li className={styles.nextItem}>
                    <span className={styles.checkIcon}><CheckMark /></span>
                    You start matching instantly
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* ════ Step 2: Background & Skills ════ */}
          {step === 2 && (
            <>
              {/* Industry */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Industry / Field</label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.select}
                    value={field}
                    onChange={e => setField(e.target.value)}
                  >
                    {FIELDS.map(f => (
                      <option key={f} value={f}>{f || 'Select your field…'}</option>
                    ))}
                  </select>
                  <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Degree */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Highest degree</label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.select}
                    value={degree}
                    onChange={e => setDegree(e.target.value)}
                  >
                    {DEGREES.map(d => (
                      <option key={d} value={d}>{d || 'Select your degree…'}</option>
                    ))}
                  </select>
                  <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Experience */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Years of experience</label>
                <div className={styles.pillGroup}>
                  {EXP_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`${styles.pill} ${experience === opt ? styles.pillActive : ''}`}
                      onClick={() => setExperience(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target role */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Target role / job title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  className={styles.inputNoIcon}
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                />
              </div>

              {/* Skills tag input */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Your skills</label>
                <p className={styles.fieldHint}>Type a skill and press Enter or comma to add</p>
                <div className={styles.tagContainer} onClick={() => document.getElementById('skillInput').focus()}>
                  {skills.map(s => (
                    <span key={s} className={styles.tag}>
                      {s}
                      <button type="button" className={styles.tagRemove} onClick={() => removeSkill(s)}>×</button>
                    </span>
                  ))}
                  <input
                    id="skillInput"
                    type="text"
                    className={styles.tagInput}
                    placeholder={skills.length === 0 ? 'React, Python, SQL…' : ''}
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                  />
                </div>
              </div>

              <button className={styles.continueBtn} onClick={() => setStep(3)}>
                Continue &nbsp;→
              </button>
            </>
          )}

          {/* ════ Step 3: Job Preferences ════ */}
          {step === 3 && (
            <>
              {/* Work mode */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Preferred work mode</label>
                <div className={styles.pillGroup}>
                  {WORK_MODES.map(m => (
                    <button
                      key={m}
                      type="button"
                      className={`${styles.pill} ${workMode === m ? styles.pillActive : ''}`}
                      onClick={() => setWorkMode(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job type */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Job type <span className={styles.fieldHintInline}>(select all that apply)</span>
                </label>
                <div className={styles.pillGroup}>
                  {JOB_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.pill} ${jobTypes.includes(t) ? styles.pillActive : ''}`}
                      onClick={() => toggleJobType(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desired salary */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Desired salary range</label>
                <div className={styles.pillGroup}>
                  {SALARY_RANGES.map(r => (
                    <button
                      key={r}
                      type="button"
                      className={`${styles.pill} ${salary === r ? styles.pillActive : ''}`}
                      onClick={() => setSalary(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Preferred location</label>
                <input
                  type="text"
                  placeholder="City, state, or country"
                  className={styles.inputNoIcon}
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>

              {/* Open to relocation */}
              <div className={styles.fieldGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={openToRelocation}
                    onChange={e => setOpenToRelocation(e.target.checked)}
                  />
                  Open to relocation
                </label>
              </div>

              <button className={styles.continueBtn} onClick={() => {
                  setStep(4),
                  handleSubmit()
                }}>
                Register &nbsp;→
              </button>
            </>
          )}

          {/* ════ Step 4: Done ════ */}
          {step === 4 && (
            <div className={styles.successPanel}>
              <div className={styles.successIcon}>🚀</div>
              <h3 className={styles.successTitle}>Your profile is ready!</h3>
              <p className={styles.successText}>
                Our AI is already crunching through thousands of jobs to find your perfect matches. Time to start swiping!
              </p>
              <a href="/dashboard" className={styles.continueBtn} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Start Swiping &nbsp;→
              </a>
            </div>
          )}

          <p className={styles.loginPrompt}>
            Already a pilot?{' '}
            <a href="/login" className={styles.loginLink}>Log in here</a>
          </p>
        </div>
      </div>
    </div>
  );
}
