'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import LiquidChrome from '@/app/components/ui/LiquidChrome/LiquidChrome';
import { ForgotPassword } from '@/app/Services/UserService';

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await ForgotPassword(email);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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

      <div className={styles.card}>
        {!submitted ? (
          <>
            <div className={styles.iconBubble}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="#0B2D72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#0B2D72" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1.5" fill="#0AC4E0"/>
              </svg>
            </div>

            <h1 className={styles.title}>Forgot your password?</h1>
            <p className={styles.subtitle}>
              Enter your email and we'll send you a link to reset it.
            </p>

            <form onSubmit={handleSubmit}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    required
                    autoFocus
                  />
                  <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {error && <p className={styles.errorText}>{error}</p>}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading || !email}>
                {loading ? <span className={styles.spinner} /> : 'Send Reset Link'}
              </button>
            </form>

            <Link href="/login" className={styles.backLink}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to login
            </Link>
          </>
        ) : (
          <>
            <div className={styles.successIconBubble}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="#0AC4E0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h1 className={styles.title}>Check your inbox</h1>
            <p className={styles.subtitle}>
              We sent a reset link to <strong className={styles.emailHighlight}>{email}</strong>. It expires in 15 minutes.
            </p>

            <p className={styles.resendText}>
              Didn't get it?{' '}
              <button className={styles.resendBtn} onClick={() => { setSubmitted(false); setEmail(''); }}>
                Try again
              </button>
            </p>

            <Link href="/login" className={styles.submitBtn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', marginTop: '0.5rem' }}>
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
