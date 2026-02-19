import styles from './signup.module.css';

export default function SignupPage() {
  return (
    <div className={styles.container}>
      {/* Left Panel */}
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

          <h1 className={styles.heroTitle}>
            Your next job is closer than you think.
          </h1>
          <p className={styles.heroSubtitle}>
            Let our AI pilot guide you through a personalized career journey.
          </p>
        </div>

        <div className={styles.aiPoweredBadge}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="white"/>
            <path d="M19 2L19.75 4.25L22 5L19.75 5.75L19 8L18.25 5.75L16 5L18.25 4.25L19 2Z" fill="white"/>
          </svg>
          <span>AI-powered personalized matching engine</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Let's get started</h2>
            <span className={styles.cardSubtitle}>Takes under 2 minutes</span>
          </div>

          {/* Stepper */}
          <div className={styles.stepper}>
            <div className={`${styles.step} ${styles.stepActive}`}>
              <div className={styles.stepCircle}>1</div>
              <div className={styles.stepConnector} />
              <span className={styles.stepLabel}>Create Account</span>
            </div>
            <div className={styles.step}>
              <div className={`${styles.stepCircle} ${styles.stepCircleInactive}`}>2</div>
              <div className={styles.stepConnector} />
              <span className={`${styles.stepLabel} ${styles.stepLabelInactive}`}>Skills</span>
            </div>
            <div className={styles.step}>
              <div className={`${styles.stepCircle} ${styles.stepCircleInactive}`}>3</div>
              <div className={styles.stepConnector} />
              <span className={`${styles.stepLabel} ${styles.stepLabelInactive}`}>Preferences</span>
            </div>
            <div className={`${styles.step} ${styles.stepLast}`}>
              <div className={`${styles.stepCircle} ${styles.stepCircleInactive}`}>4</div>
              <span className={`${styles.stepLabel} ${styles.stepLabelInactive}`}>Start Swiping</span>
            </div>
          </div>

          {/* Email Field */}
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
              />
            </div>
          </div>

          {/* Continue Button */}
          <button className={styles.continueBtn}>
            Continue &nbsp;→
          </button>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine} />
          </div>

          {/* OAuth Buttons */}
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

          {/* What Happens Next */}
          <div className={styles.nextSection}>
            <p className={styles.nextTitle}>WHAT HAPPENS NEXT?</p>
            <ul className={styles.nextList}>
              <li className={styles.nextItem}>
                <span className={styles.checkIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                We'll scan your profile for top skills
              </li>
              <li className={styles.nextItem}>
                <span className={styles.checkIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                AI builds your custom job feed
              </li>
              <li className={styles.nextItem}>
                <span className={styles.checkIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                You start matching instantly
              </li>
            </ul>
          </div>

          {/* Login Link */}
          <p className={styles.loginPrompt}>
            Already a pilot?{' '}
            <a href="/login" className={styles.loginLink}>Log in here</a>
          </p>
        </div>
      </div>
    </div>
  );
}
