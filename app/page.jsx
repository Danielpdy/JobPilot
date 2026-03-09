'use client';
import { useState } from 'react';
import styles from './home.module.css';
import LiquidChrome from '@/app/components/ui/LiquidChrome/LiquidChrome';
import GlassNavIndicator from '@/app/components/ui/GlassNavIndicator/GlassNavIndicator';
import TopAnimatedContent from '@/app/components/ui/TopAnimatedContent/TopAnimatedContent';
import LogoLoop from '@/app/components/ui/LogoLoop/LogoLoop';
import Link from 'next/link';
import { placeholderLogos } from './components/ui/LogoLoop/PlaceholderLogos';


export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

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

      {/* ── Navbar ── */}
      <nav className={styles.navWrapper}>
        <div className={styles.navInner}>
          {/* Logo */}
          <a href="/" className={styles.navLogo}>
            <img
              src="/icons/JobPilot (2).png"
              alt="JobPilot"
              className={styles.navLogoImg}
            />
          </a>

          {/* Desktop actions */}
          <div className={styles.navActions}>
            <a href="/login" className={styles.navSignIn}>Sign In</a>
            <a href="/signup" className={styles.navGetStarted}>Get Started</a>
          </div>

          {/* Hamburger button — mobile only */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLine1Open : ''}`} />
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLine2Open : ''}`} />
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLine3Open : ''}`} />
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <div className={styles.mobileDropdown}>
          <a href="/login" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>Sign In</a>
          <a href="/signup" className={styles.mobileMenuGetStarted} onClick={() => setMenuOpen(false)}>Get Started</a>
        </div>
      )}

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <TopAnimatedContent
          direction="vertical"
          distance={50}
          duration={0.8}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          delay={0.2}
        >
          <h1 className={styles.headline}>
            Find Your Dream Job.
            <span className={styles.headlineAccent}>Powered by AI.</span>
          </h1>
        </TopAnimatedContent>

        <TopAnimatedContent
          direction="vertical"
          distance={40}
          duration={0.8}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          delay={0.35}
        >
          <p className={styles.subheadline}>
            JobPilot analyzes thousands of listings in real-time and matches them
            to your skills, experience, and ambitions — so you spend less time
            searching and more time landing.
          </p>
        </TopAnimatedContent>

        <TopAnimatedContent
          direction="vertical"
          distance={30}
          duration={0.7}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          delay={0.5}
        >
          <div className={styles.ctaRow}>
            <Link href="/dashboard" className={styles.ctaPrimary}>Go to Dashboard</Link>
            <Link href="#how-it-works" className={styles.ctaSecondary}>See How It Works</Link>
          </div>
        </TopAnimatedContent>

        <TopAnimatedContent
          direction="vertical"
          distance={20}
          duration={0.7}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          delay={0.65}
        >
          <p className={styles.logoLoopLabel}>Get hired by top companies worldwide</p>
          <div className={styles.logoLoopWrapper}>
            <LogoLoop
              logos={placeholderLogos}
              speed={25}
              direction="left"
              logoHeight={36}
              gap={52}
              pauseOnHover
              scaleOnHover
              ariaLabel="Technologies"
            />
          </div>
        </TopAnimatedContent>
      </section>

    </div>
  );
}
