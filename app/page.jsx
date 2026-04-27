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
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >Outcomes</motion.span>
          <motion.h2
            className={styles.outcomesHeading}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.07 }}
          >Better Results, Faster</motion.h2>
          <motion.p
            className={styles.outcomesSubheading}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.14 }}
          >JobPilot helps you improve your resume and move through the job search process more efficiently.</motion.p>
          <motion.p
            className={styles.outcomesDisclaimer}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.2 }}
          >Based on typical usage scenarios</motion.p>
        </div>

        {/* Row 1: score rings (left) + job stack (right) */}
        <div className={styles.outcomesRow1}>

          {/* Left: rings + improvements */}
          <motion.div
            className={styles.outcomesLeft}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
          >
            <div className={styles.scoreFlow}>
              <div className={styles.scoreItem}>
                <img src="/homepageImages/scoreRingBlue.png" alt="Score before" className={styles.scoreRing} />
                <span className={styles.scoreLabel}>Before</span>
              </div>

              <div className={styles.scoreArrow}>
                <svg width="58" height="26" viewBox="0 0 58 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 13H50M50 13L38 4M50 13L38 22" stroke="#0992C2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className={styles.scoreItem}>
                <img src="/homepageImages/scoreRing.png" alt="Score after" className={styles.scoreRing} />
                <span className={`${styles.scoreLabel} ${styles.scoreLabelAfter}`}>After</span>
              </div>
            </div>

            <div className={styles.improvedBlock}>
              <p className={styles.improvedTitle}>What improved</p>
              <ul className={styles.improvedList}>
                <li className={styles.improvedItem}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16a34a"/><path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Resume clarity &amp; structure
                </li>
                <li className={styles.improvedItem}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16a34a"/><path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Skills &amp; keyword alignment
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Right: job card stack — primary visual */}
          <motion.div
            className={styles.outcomesRight}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.18 }}
          >
            <p className={styles.stackLabel}>Better matched roles</p>
            <div className={styles.stackVisual}>
              <img src="/homepageImages/stackCards.png" alt="Job swipe cards" className={styles.stackImg} />
            </div>
          </motion.div>

        </div>


      </section>

      {/* ── Reviews section ── */}
      <section className={styles.reviewsSection}>

        <motion.div
          className={styles.reviewsHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className={styles.reviewsHeading}>
            Real people. Real results.
          </h2>
          <p className={styles.reviewsSubheading}>
            Early users are already landing better roles with JobPilot.
          </p>
        </motion.div>

        <div className={styles.testimonialsGrid}>
          {[
            {
              stars: 4.5,
              quote: <>"<strong>Resume score jumped from 61 to 79</strong> after one round of edits. Suggestions were actually specific, not the usual generic stuff. Got two callbacks that week which hadn't happened in months."</>,
              img: '/avatars/user2.jpg', name: 'Sofia M.', meta: 'Austin, TX · Mar 2025',
            },
            {
              stars: 4.5,
              quote: <>"<strong>Job matches that actually fit what I do</strong>, like 8 or 9 out of 10 were things I'd genuinely apply to. Stopped wasting hours on listings that had nothing to do with me."</>,
              img: '/avatars/user1.jpg', name: 'Marcus T.', meta: 'San Francisco, CA · Feb 2025',
            },
            {
              stars: 4,
              quote: <>"Applied the rewrites and <strong>my response rate went up within two weeks</strong>. It caught things I wouldn't have noticed on my own. Was skeptical but yeah, real difference."</>,
              initials: 'JL', color: '#0992C2', name: 'James L.', meta: 'London, UK · Apr 2025',
            },
            {
              stars: 5,
              quote: <>"<strong>40 applications in one evening</strong> with the swipe feature, which I did not expect to be that fast. Recruiter reached out two days later. Nothing else I've used comes close."</>,
              img: '/avatars/user3.jpg', name: 'Aisha K.', meta: 'Dubai, UAE · Jan 2025',
            },
          ].map((r, i) => (
            <motion.div
              key={r.name}
              className={styles.testimonialCard}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
            >
              <div className={styles.reviewStars}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 1l1.854 3.756L14 5.528l-3 2.924.708 4.13L8 10.5l-3.708 2.082L5 8.452 2 5.528l4.146-.772L8 1z"
                      fill="#FBBF24"
                      opacity={s <= Math.floor(r.stars) ? 1 : r.stars % 1 >= 0.5 && s === Math.ceil(r.stars) ? 0.5 : 0.15}
                    />
                  </svg>
                ))}
              </div>
              <p className={styles.testimonialQuote}>{r.quote}</p>
              <div className={styles.reviewerRow}>
                {r.img
                  ? <img src={r.img} alt={r.name} className={styles.reviewerAvatar} />
                  : <div className={styles.reviewerInitials} style={{ background: r.color }}>{r.initials}</div>
                }
                <div className={styles.reviewerInfo}>
                  <span className={styles.reviewerName}>{r.name}</span>
                  <span className={styles.reviewerCountry}>{r.meta}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className={styles.reviewsFooter}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          Based on early user feedback from real usage scenarios
        </motion.p>

      </section>

    </div>
  );
}
