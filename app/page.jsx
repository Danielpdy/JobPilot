"use client";
import { useState } from "react";
import { motion } from "motion/react";
import styles from "./home.module.css";
import LiquidChrome from "@/app/components/ui/LiquidChrome/LiquidChrome";
import TopAnimatedContent from "@/app/components/ui/TopAnimatedContent/TopAnimatedContent";
import LogoLoop from "@/app/components/ui/LogoLoop/LogoLoop";
import Link from "next/link";
import { placeholderLogos } from "./components/ui/LogoLoop/PlaceholderLogos";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

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
            {status === "loading" ? null : session ? (
              <button className={styles.navSignOut} onClick={() => signOut()}>Sign Out</button>
            ) : (
              <>
                <a href="/login" className={styles.navSignIn}>
                  Sign In
                </a>
                <a href="/signup" className={styles.navGetStarted}>
                  Get Started
                </a>
              </>
            )}
          </div>

          {/* Hamburger button — mobile only */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLine1Open : ""}`}
            />
            <span
              className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLine2Open : ""}`}
            />
            <span
              className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLine3Open : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <div className={styles.mobileDropdown}>
          { status === "loading" ? null : session ? (
            <button
              className={styles.mobileMenuSignOut}
              onClick={() => { signOut(); setMenuOpen(false); }}
            >Sign Out</button>
          ) : (
            <>
          <a
            href="/login"
            className={styles.mobileMenuLink}
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </a>
          <a
            href="/signup"
            className={styles.mobileMenuGetStarted}
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </a>
          </>
        )}
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
            JobPilot analyzes thousands of listings in real-time and matches
            them to your skills, experience, and ambitions — so you spend less
            time searching and more time landing.
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
            <Link href="/dashboard" className={styles.ctaPrimary}>
              Go to Dashboard
            </Link>
            <Link href="#how-it-works" className={styles.ctaSecondary}>
              See How It Works
            </Link>
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
          <p className={styles.logoLoopLabel}>
            Get hired by top companies worldwide
          </p>
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

      {/* ── Product overview section ── */}
      <section className={styles.productSection}>

        {/* Header */}
        <div className={styles.productHeader}>
          <motion.span
            className={styles.overlineLabel}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >Product Overview</motion.span>
          <motion.h2
            className={styles.productHeading}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          >See JobPilot in Action</motion.h2>
          <motion.p
            className={styles.productSubheading}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.16 }}
          >A faster, smarter way to discover jobs and improve your chances.</motion.p>
        </div>

        {/* Feature row */}
        <div className={styles.featureRow}>

          {/* Left: copy */}
          <motion.div
            className={styles.featureLeft}
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
          >
            <span className={styles.featureLabel}>Job Discovery</span>
            <h3 className={styles.featureTitle}>Discover Jobs Faster</h3>
            <p className={styles.featureDesc}>
              Swipe through personalized job matches tailored to your skills and goals.
            </p>
            <ul className={styles.featureList}>
              <li>Personalized job feed</li>
              <li>Fast decision-making</li>
              <li>Clean, distraction-free experience</li>
            </ul>
          </motion.div>

          {/* Right: product screenshot */}
          <motion.img
            src="/homepageImages/productOverview.png"
            alt="JobPilot swipe cards preview"
            className={styles.previewImage}
            initial={{ opacity: 0, x: 36, scale: 1.44 }}
            whileInView={{ opacity: 1, x: 0, scale: 1.44 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          />

        </div>
      </section>

      {/* ── Resume Optimization section ── */}
      <section className={styles.resumeSection}>
        <div className={styles.resumeRow}>

          {/* Left: resume preview → output animation */}
          <div className={styles.resumeImageWrapper}>

            {/* Resume preview — appears, then dims/blurs before result */}
            <motion.img
              src="/homepageImages/resumePreview.png"
              alt="Resume upload"
              className={styles.resumePreviewImg}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 0.82, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />

            {/* Output card — slides in from right as resume settles */}
            <motion.img
              src="/homepageImages/resumeOutput.png"
              alt="Resume analysis output"
              className={styles.resumeOutputImg}
              initial={{ opacity: 0, x: 36, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: 'easeOut', delay: 0.78 }}
            />

          </div>

          {/* Right: copy */}
          <div className={styles.resumeRight}>
            <span className={styles.featureLabel}>Resume Optimization</span>
            <h3 className={styles.featureTitle}>Improve Your Resume with AI</h3>
            <p className={styles.featureDesc}>
              Get clear, actionable feedback based on your career profile.
            </p>
            <ul className={styles.featureList}>
              <li>Resume score (0–100)</li>
              <li>Specific improvement suggestions</li>
              <li>Tailored insights</li>
            </ul>
          </div>

        </div>
      </section>

      {/* ── Outcomes section ── */}
      <section className={styles.outcomesSection}>
        {/* Header */}
        <div className={styles.outcomesHeader}>
          <motion.span
            className={styles.overlineLabel}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >Outcomes</motion.span>
          <motion.h2
            className={styles.outcomesHeading}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          >Better Results, Faster</motion.h2>
          <motion.p
            className={styles.outcomesSubheading}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.16 }}
          >JobPilot helps you improve your resume and move through the job search process more efficiently.</motion.p>
          <motion.p
            className={styles.outcomesDisclaimer}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.24 }}
          >Based on typical usage scenarios</motion.p>
        </div>

        {/* Two-column visual area */}
        <div className={styles.outcomesVisuals}>

          {/* Left: Before → After resume */}
          <motion.div
            className={styles.outcomesLeft}
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            {/* Score rings */}
            <div className={styles.scoreFlow}>
              <div className={styles.scoreItem}>
                <img src="/homepageImages/scoreRingBlue.png" alt="Score before" className={styles.scoreRing} />
                <span className={styles.scoreLabel}>Before JobPilot</span>
              </div>

              <div className={styles.scoreArrow}>
                <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 8H28M28 8L21 2M28 8L21 14" stroke="#0992C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className={styles.scoreItem}>
                <img src="/homepageImages/scoreRing.png" alt="Score after" className={styles.scoreRing} />
                <span className={`${styles.scoreLabel} ${styles.scoreLabelAfter}`}>After JobPilot</span>
              </div>
            </div>

            {/* What improved */}
            <div className={styles.improvedBlock}>
              <p className={styles.improvedTitle}>What improved</p>
              <img
                src="/homepageImages/outputBullets.png"
                alt="Resume improvements"
                className={styles.bulletsImg}
              />
            </div>
          </motion.div>

          {/* Right: Swipe card stack */}
          <motion.div
            className={styles.outcomesRight}
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            <div className={styles.stackWrapper}>
              <img src="/homepageImages/stackCards.png" alt="Job swipe cards" className={styles.stackImg} />
            </div>
            <p className={styles.stackCaption}>Swipe through personalized job matches</p>
          </motion.div>

        </div>

        {/* Bottom metric cards */}
        <div className={styles.metricsRow}>
          {[
            { icon: '📞', value: '+28%', label: 'More interview callbacks', note: 'After improving resume clarity' },
            { icon: '⚡', value: '2× faster', label: 'Job discovery process', note: 'Browse with swipe-based UI' },
            { icon: '📈', value: '+18 pts', label: 'Average resume score', note: 'After applying AI feedback' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              className={styles.metricCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 + i * 0.08 }}
            >
              <span className={styles.metricIcon}>{m.icon}</span>
              <span className={styles.metricValue}>{m.value}</span>
              <span className={styles.metricLabel}>{m.label}</span>
              <span className={styles.metricNote}>{m.note}</span>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
