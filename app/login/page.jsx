'use client';
import { useState } from 'react';
import styles from './login.module.css';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import LiquidChrome from '@/app/components/ui/LiquidChrome';
import AnimatedContent from '@/app/components/ui/AnimatedContent';


export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loadCredentials = {
    email: email,
    password: password
  };

  const safeNext = (next) => {
    return next && next.startsWith("/") ? next : "/dashboard";
  };

  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  async function handleSubmit(e){
    e.preventDefault();
    await signIn("credentials", {
      loadCredentials,
      callbackUrl: next
    });
  };

  return (
    <div className={styles.page}>
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
      <AnimatedContent
        distance={100}
        direction="horizontal"
        reverse
        duration={0.8}
        ease="power3.out"
        initialOpacity={0}
        animateOpacity
        scale={1}
        threshold={0.1}
        delay={0}
      >
      <div className={styles.container}>

        {/* ── Left Panel ── */}
        <div onSubmit={handleSubmit} className={styles.leftPanel}>
          <div onSubmit={handleSubmit} className={styles.formWrapper}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>
              Enter your credentials to access your personalized job dashboard.
            </p>
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <svg className={styles.inputIconRight} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Password */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(v => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="#9CA3AF" strokeWidth="1.8"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className={styles.rememberRow}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Remember me</span>
                </label>
                <a href="#" className={styles.forgotLink}>Forgot password?</a>
              </div>

              {/* Submit */}
              <button type='submit' className={styles.submitBtn}>Continue to Dashboard</button>
            </form>

            {/* Divider */}
            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>Or continue with</span>
              <div className={styles.dividerLine} />
            </div>

            {/* OAuth */}
            <div className={styles.oauthRow}>
              <button className={styles.oauthBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className={styles.oauthBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>

            {/* Sign up link */}
            <p className={styles.signupPrompt}>
              Don't have an account?{' '}
              <a href="/signup" className={styles.signupLink}>Create account</a>
            </p>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className={styles.rightPanel}>
          {/* Logo */}
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 17.5L19 6.5M19 6.5H9M19 6.5V16.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={styles.logoText}>JobPilot</span>
          </div>

          {/* Illustration Area */}
          <div className={styles.illustrationArea}>
            {/* Decorative sparkles */}
            <div className={styles.sparkle} style={{ top: '12%', left: '12%' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="rgba(255,255,255,0.4)"/>
              </svg>
            </div>
            <div className={styles.sparkle} style={{ top: '18%', right: '14%' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="rgba(255,255,255,0.3)"/>
              </svg>
            </div>
            <div className={styles.sparkle} style={{ bottom: '30%', right: '10%' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="rgba(255,255,255,0.25)"/>
              </svg>
            </div>

            {/* Job Cards */}
            {/* Top-left: Product Manager (faded) */}
            <div className={`${styles.jobCard} ${styles.cardTopLeft}`}>
              <div className={styles.cardAvatarGray} />
              <div className={styles.cardLines}>
                <div className={styles.cardLineShort} />
                <div className={styles.cardLineLong} />
              </div>
              <p className={styles.cardTitle}>Product Manager</p>
            </div>

            {/* Top-right: AI Engineer */}
            <div className={`${styles.jobCard} ${styles.cardTopRight}`}>
              <div className={styles.cardHeader2}>
                <span className={styles.cardTag}>AI</span>
                <div className={styles.cardLines2}>
                  <div className={styles.cardLineShort2} />
                </div>
              </div>
              <p className={styles.cardTitle2}>AI Engineer</p>
              <div className={styles.cardActions}>
                <button className={styles.cardBtnX}>✕</button>
                <button className={styles.cardBtnCheck}>✓</button>
              </div>
            </div>

            {/* Bottom-right: Data Scientist (faded) */}
            <div className={`${styles.jobCard} ${styles.cardBottomRight}`}>
              <div className={styles.cardAvatarGray} />
              <div className={styles.cardLines}>
                <div className={styles.cardLineShort} />
                <div className={styles.cardLineLong} />
              </div>
              <p className={styles.cardTitle}>Data Scientist</p>
            </div>

            {/* Bottom-left: Senior UX Designer */}
            <div className={`${styles.jobCard} ${styles.cardBottomLeft}`}>
              <div className={styles.cardHeader2}>
                <span className={styles.cardCheckSmall}>✓</span>
                <div className={styles.cardLines2}>
                  <div className={styles.cardLineShort2} />
                  <div className={styles.cardLineMed} />
                </div>
              </div>
              <p className={styles.cardTitle2}>Senior UX Designer</p>
              <div className={styles.cardActions}>
                <button className={styles.cardBtnX}>✕</button>
                <button className={`${styles.cardBtnCheck} ${styles.cardBtnHeart}`}>♥</button>
              </div>
            </div>

            {/* Central robot avatar */}
            <div className={styles.centralAvatar}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="white">
                <rect x="3" y="8" width="18" height="12" rx="3" fill="white" fillOpacity="0.9"/>
                <rect x="7" y="4" width="10" height="5" rx="2" fill="white" fillOpacity="0.7"/>
                <circle cx="9" cy="13" r="1.5" fill="#0AC4E0"/>
                <circle cx="15" cy="13" r="1.5" fill="#0AC4E0"/>
                <rect x="9" y="17" width="6" height="1.5" rx="0.75" fill="#0AC4E0"/>
                <line x1="2" y1="12" x2="3" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="21" y1="12" x2="22" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Bottom text */}
          <div className={styles.bottomText}>
            <div className={styles.activeBadge}>
              <span className={styles.activeDot} />
              AI MATCHING ACTIVE
            </div>
            <h2 className={styles.engineTitle}>Intelligent Matching Engine</h2>
            <p className={styles.engineSubtitle}>
              Our AI analyzes your skills to instantly swipe right on your perfect career opportunities.
            </p>
          </div>
        </div>

      </div>
      </AnimatedContent>
    </div>
  );
}
