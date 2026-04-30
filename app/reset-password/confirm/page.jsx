'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import LiquidChrome from '@/app/components/ui/LiquidChrome/LiquidChrome';
import { ResetPassword } from '@/app/Services/UserService';

function ResetPasswordForm() {
  const searchParams  = useSearchParams();
  const token         = searchParams.get('token') ?? '';

  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordsMatch = password === confirm;
  const strong         = password.length >= 8;
  const canSubmit      = token && password && confirm && passwordsMatch && strong && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      await ResetPassword(token, password);
      setSuccess(true);
    } catch {
      setError('This link has expired or already been used. Request a new one.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className={styles.card}>
        <div className={styles.errorIconBubble}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="1.8"/>
            <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className={styles.title}>Invalid link</h1>
        <p className={styles.subtitle}>This reset link is missing a token. Please request a new one.</p>
        <Link href="/forgot-password" className={styles.submitBtn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.card}>
        <div className={styles.successIconBubble}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="#0AC4E0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className={styles.title}>Password updated</h1>
        <p className={styles.subtitle}>Your password has been changed. You can now sign in with your new credentials.</p>
        <Link href="/login" className={styles.submitBtn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.iconBubble}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#0B2D72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#0B2D72" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="12" cy="16" r="1.5" fill="#0AC4E0"/>
        </svg>
      </div>

      <h1 className={styles.title}>Set new password</h1>
      <p className={styles.subtitle}>Must be at least 8 characters.</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>New Password</label>
          <div className={styles.inputWrapper}>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoFocus
              required
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)} tabIndex={-1}>
              {showPass ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="#9CA3AF" strokeWidth="1.8"/>
                </svg>
              )}
            </button>
          </div>
          {password && !strong && (
            <p className={styles.hintText}>At least 8 characters required</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Confirm Password</label>
          <div className={styles.inputWrapper}>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              className={`${styles.input} ${confirm && !passwordsMatch ? styles.inputError : ''}`}
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              required
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
              {showConfirm ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="#9CA3AF" strokeWidth="1.8"/>
                </svg>
              )}
            </button>
          </div>
          {confirm && !passwordsMatch && (
            <p className={styles.errorText}>Passwords don't match</p>
          )}
        </div>

        {error && <p className={styles.errorText} style={{ marginBottom: '0.75rem' }}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
          {loading ? <span className={styles.spinner} /> : 'Reset Password'}
        </button>
      </form>

      <Link href="/login" className={styles.backLink}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to login
      </Link>
    </div>
  );
}

export default function ResetPasswordConfirmPage() {
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
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
