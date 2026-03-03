'use client';
import styles from './home.module.css';
import LiquidChrome from '@/app/components/ui/LiquidChrome';
import GlassNavIndicator from '@/app/components/ui/GlassNavIndicator';
import AnimatedContent from '@/app/components/ui/AnimatedContent';

export default function HomePage() {
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
              src="/icons/JobPilot (1).png"
              alt="JobPilot"
              style={{ height: '160px', width: 'auto', mixBlendMode: 'multiply' }}
            />
          </a>

          {/* Links — sliding GlassSurface pill follows active/hovered item */}
          <GlassNavIndicator
            pillHeight={64}
            defaultIndex={3}
            items={[
              { label: 'Features',     href: '#features' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Pricing',      href: '#pricing' },
              { label: 'Blog',         href: '#blog' },
            ]}
          />

          {/* Actions */}
          <div className={styles.navActions}>
            <a href="/login" className={styles.navSignIn}>Sign In</a>
            <a href="/signup" className={styles.navGetStarted}>Get Started</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <AnimatedContent
          direction="vertical"
          distance={40}
          duration={0.7}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          delay={0.1}
        >
          <div className={styles.badge}>
            <span className={styles.badgeStar}>✦</span>
            AI-Powered Job Matching
          </div>
        </AnimatedContent>

        <AnimatedContent
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
        </AnimatedContent>

        <AnimatedContent
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
        </AnimatedContent>

        <AnimatedContent
          direction="vertical"
          distance={30}
          duration={0.7}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          delay={0.5}
        >
          <div className={styles.ctaRow}>
            <a href="/signup" className={styles.ctaPrimary}>Get Started Free</a>
            <a href="#how-it-works" className={styles.ctaSecondary}>See How It Works</a>
          </div>
        </AnimatedContent>
      </section>

    </div>
  );
}
