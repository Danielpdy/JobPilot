'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import styles from './signup.module.css';
import { LoginCredentials, Register } from '../Services/UserService';
import LiquidChrome from '../components/ui/LiquidChrome/LiquidChrome';
import AnimatedContentLeft from '../components/ui/AnimatedContentLeft/AnimatedContentLeft';
import AnimatedContentRight from '../components/ui/AnimatedContentRight/AnimatedContentRight';


const CheckMark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    await Register({ firstName, lastName, email, password });
    setDone(true);
  }

  const login = async () =>{
    await signIn("credentials",{
      email,
      password,
      callbackUrl: "/dashboard"
    });
  };

  return (
    <div className={styles.page}>
      {/* ── Full-page background ── */}
      <div className={styles.bgContainer}>
        <LiquidChrome
          baseColor={[0.55, 0.68, 0.96]}
          speed={0.15}
          amplitude={0.28}
          frequencyX={2.0}
          frequencyY={1.5}
          interactive={true}
        />
      </div>

      <div className={styles.container}>
      {/* ── Left Panel ── */}
      <div className={styles.leftPanel}>
        <div className={styles.leftPanelContent}>
        <AnimatedContentLeft delay={0.05}>
          <div className={styles.logo}>
            <img src="/icons/JobPilot (2).png" alt="JobPilot" className={styles.logoImg} />
          </div>
        </AnimatedContentLeft>

        <AnimatedContentLeft delay={0.2} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Your next job is closer than you think.</h1>
            <p className={styles.heroSubtitle}>Let our AI pilot guide you through a personalized career journey.</p>

            <div className={styles.socialProof}>
              <div className={styles.avatarStack}>
                <img src="/avatars/user1.jpg" alt="" className={styles.stackAvatar} />
                <img src="/avatars/user2.jpg" alt="" className={styles.stackAvatar} />
                <img src="/avatars/user3.jpg" alt="" className={styles.stackAvatar} />
                <img src="/avatars/user4.jpg" alt="" className={styles.stackAvatar} />
              </div>
              <div className={styles.socialProofText}>
                <div className={styles.stars}>{'★★★★★'}</div>
                <span className={styles.socialProofLabel}>Loved by <strong>50,000+</strong> job seekers</span>
              </div>
            </div>
          </div>
        </AnimatedContentLeft>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className={styles.rightPanel}>
        <AnimatedContentRight delay={0} style={{ width: '100%', maxWidth: '440px', margin: 'auto 0' }}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{done ? "You're all set!" : "Let's get started"}</h2>
            </div>

            {!done ? (
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
                  onClick={handleSubmit}
                  disabled={!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()}
                >
                  Create Account &nbsp;→
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
              </>
            ) : (
              <div className={styles.successPanel}>
                <div className={styles.successIcon}>🚀</div>
                <h3 className={styles.successTitle}>Your profile is ready!</h3>
                <p className={styles.successText}>
                  Our AI is already crunching through thousands of jobs to find your perfect matches. Time to start swiping!
                </p>
                <button href="/dashboard" className={styles.continueBtn} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                  onClick={() => login()}
                  >
                  Start Swiping &nbsp;→
                </button>
              </div>
            )}

            <p className={styles.loginPrompt}>
              Already a pilot?{' '}
              <a href="/login" className={styles.loginLink}>Log in here</a>
            </p>
          </div>
        </AnimatedContentRight>
      </div>
      </div>
    </div>
  );
}
