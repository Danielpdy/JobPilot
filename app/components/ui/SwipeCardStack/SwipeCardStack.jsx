'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faBookmark,
  faHeart,
  faMapPin,
  faDollarSign,
  faBriefcase,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import styles from './SwipeCardStack.module.css';

// ── Thresholds ────────────────────────────────────────────────────────────────
const SWIPE_OFFSET_THRESHOLD  = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;
const EXIT_X = 500;

// ── Entrance animation variants ───────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const sectionVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

// ── Shared card body ──────────────────────────────────────────────────────────
function CardBody({ card, isTop }) {
  return (
    <>
      <div className={styles.cardHeader}>
        <div className={styles.logoBox} style={{ background: card.logoColor }}>
          {card.logoEmoji}
        </div>
        <div className={styles.cardCompanyInfo}>
          <span className={styles.companyName}>{card.company}</span>
          <h3 className={styles.jobTitle}>{card.title}</h3>
        </div>
        <span className={styles.postedBadge}>{card.postedAt}</span>
      </div>

      <div className={styles.metaRow}>
        <span className={styles.metaItem}>
          <FontAwesomeIcon icon={faMapPin} className={styles.metaIcon} />
          {card.location}
        </span>
        <span className={styles.metaItem}>
          <FontAwesomeIcon icon={faDollarSign} className={styles.metaIcon} />
          {card.salaryMin?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} - {card.salaryMax?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
        </span>
        {card.contractTime && (
          <span className={styles.contractBadge}>
            <FontAwesomeIcon icon={faBriefcase} className={styles.metaIcon} />
            {card.contractTime === 'full_time' ? 'Full Time' : 'Part Time'}
          </span>
        )}
        {card.category && (
          <span className={styles.contractBadge}>
            {card.category}
          </span>
        )}
      </div>

      <div className={styles.descriptionWrapper}>
        <p className={styles.description}>
          {card.description}
        </p>
      </div>

      <div className={styles.skillsRow}>
        {(card.skills ?? []).map((skill) => (
          <span key={skill} className={styles.skillTag}>{skill}</span>
        ))}
      </div>

      {isTop && card.redirectUrl && (
        <a
          href={card.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewJobBtn}
          onClick={(e) => e.stopPropagation()}
        >
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className={styles.viewJobIcon} />
          View full job posting
        </a>
      )}
    </>
  );
}

// ── FlyingCard ────────────────────────────────────────────────────────────────
function FlyingCard({ card, x0, y0, direction, onComplete }) {
  const x       = useMotionValue(x0);
  const y       = useMotionValue(y0);
  const rotate  = useTransform(x, [-280, 0, 280], [-22, 0, 22]);
  const opacity = useTransform(x, [-280, -130, 0, 130, 280], [0, 1, 1, 1, 0]);

  useEffect(() => {
    let anim;
    if (direction !== 0) {
      anim = animate(x, direction * EXIT_X, {
        type: 'spring', stiffness: 100, damping: 18, restDelta: 0.5,
      });
    } else {
      anim = animate(y, -700, {
        type: 'spring', stiffness: 100, damping: 18, restDelta: 0.5,
      });
    }
    anim.then(onComplete);
    return () => anim.stop();
  }, []);

  return (
    <motion.div
      className={styles.card}
      style={{ x, y, rotate, opacity, zIndex: 50, pointerEvents: 'none' }}
    >
      <CardBody card={card} isTop={false} />
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SwipeCardStack({ jobs }) {
  const [cards, setCards] = useState(jobs ?? []);
  const [stats, setStats] = useState({ liked: 0, passed: 0, saved: 0 });
  const [flyingCard, setFlyingCard] = useState(null);

  const isSwiping = useRef(false);

  useEffect(() => {
    if (jobs) setCards(jobs);
  }, [jobs]);

  const x           = useMotionValue(0);
  const y           = useMotionValue(0);
  const rotate      = useTransform(x, [-280, 0, 280], [-22, 0, 22]);
  const cardOpacity = useTransform(x, [-280, -130, 0, 130, 280], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0]);

  const launchFlyingCard = (action, direction) => {
    setFlyingCard({ card: cards[0], x0: x.get(), y0: y.get(), direction });
    setStats((prev) => ({ ...prev, [action]: prev[action] + 1 }));
    setCards((prev) => prev.slice(1));
    x.set(0);
    y.set(0);
  };

  const onFlyingComplete = () => {
    setFlyingCard(null);
    isSwiping.current = false;
  };

  const handleDragEnd = (_, info) => {
    if (isSwiping.current) return;

    const swipeRight =
      info.offset.x > SWIPE_OFFSET_THRESHOLD ||
      info.velocity.x > SWIPE_VELOCITY_THRESHOLD;
    const swipeLeft =
      info.offset.x < -SWIPE_OFFSET_THRESHOLD ||
      info.velocity.x < -SWIPE_VELOCITY_THRESHOLD;

    if (swipeRight) {
      isSwiping.current = true;
      launchFlyingCard('liked', 1);
    } else if (swipeLeft) {
      isSwiping.current = true;
      launchFlyingCard('passed', -1);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 });
    }
  };

  const triggerSwipe = (action) => {
    if (isSwiping.current || cards.length === 0) return;
    isSwiping.current = true;
    if (action === 'like')      launchFlyingCard('liked',  1);
    else if (action === 'pass') launchFlyingCard('passed', -1);
    else                        launchFlyingCard('saved',  0);
  };

  const visibleCards = cards.slice(0, 3);
  const totalCards   = (jobs ?? []).length;
  const currentIndex = totalCards - cards.length + 1;

  if (cards.length === 0 && !flyingCard) {
    return (
      <motion.div className={styles.container} variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={sectionVariants} className={styles.emptyState}>
          <span className={styles.emptyEmoji}>🎉</span>
          <h3>You&apos;ve seen all jobs!</h3>
          <p>Check back later for new matches.</p>
          <button
            className={styles.resetBtn}
            onClick={() => {
              setCards(jobs ?? []);
              setStats({ liked: 0, passed: 0, saved: 0 });
            }}
          >
            Start Over
          </button>
        </motion.div>
        <motion.div variants={sectionVariants}><StatsRow stats={stats} /></motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div className={styles.container} variants={containerVariants} initial="hidden" animate="visible">

      {/* ── Card stack ───────────────────────────────────────────────────── */}
      <motion.div variants={sectionVariants} className={styles.stack}>

        {visibleCards.map((card, i) => {
          const isTop = i === 0;
          return (
            <motion.div
              key={card.id}
              className={styles.card}
              style={{
                zIndex: visibleCards.length - i,
                ...(isTop ? { x, y, rotate, opacity: cardOpacity } : {}),
              }}
              initial={{ scale: 1 - i * 0.04, y: i * 14 }}
              animate={{ scale: 1 - i * 0.04, y: i * 14 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              drag={isTop ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={isTop ? handleDragEnd : undefined}
              whileTap={isTop ? { cursor: 'grabbing' } : undefined}
            >
              {isTop && (
                <>
                  <motion.div
                    className={`${styles.indicator} ${styles.likeIndicator}`}
                    style={{ opacity: likeOpacity }}
                  >
                    LIKE
                  </motion.div>
                  <motion.div
                    className={`${styles.indicator} ${styles.nopeIndicator}`}
                    style={{ opacity: nopeOpacity }}
                  >
                    NOPE
                  </motion.div>
                </>
              )}
              <CardBody card={card} isTop={isTop} />
            </motion.div>
          );
        })}

        {flyingCard && (
          <FlyingCard
            key="flying"
            card={flyingCard.card}
            x0={flyingCard.x0}
            y0={flyingCard.y0}
            direction={flyingCard.direction}
            onComplete={onFlyingComplete}
          />
        )}
      </motion.div>

      {/* ── Counter ──────────────────────────────────────────────────────── */}
      <motion.p variants={sectionVariants} className={styles.counter}>
        {currentIndex} of {totalCards}&nbsp;&middot;&nbsp;Drag or tap buttons
      </motion.p>

      {/* ── Action buttons ───────────────────────────────────────────────── */}
      <motion.div variants={sectionVariants} className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.passBtn}`}
          onClick={() => triggerSwipe('pass')}
          aria-label="Pass"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <button
          className={`${styles.actionBtn} ${styles.saveBtn}`}
          onClick={() => triggerSwipe('save')}
          aria-label="Save"
        >
          <FontAwesomeIcon icon={faBookmark} />
        </button>
        <button
          className={`${styles.actionBtn} ${styles.likeBtn}`}
          onClick={() => triggerSwipe('like')}
          aria-label="Like"
        >
          <FontAwesomeIcon icon={faHeart} />
        </button>
      </motion.div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <motion.div variants={sectionVariants}><StatsRow stats={stats} /></motion.div>

    </motion.div>
  );
}

// ── StatsRow ──────────────────────────────────────────────────────────────────
function StatsRow({ stats }) {
  return (
    <div className={styles.statsRow}>
      <div className={styles.stat}>
        <span className={`${styles.statCount} ${styles.likedCount}`}>{stats.liked}</span>
        <span className={styles.statLabel}>LIKED</span>
      </div>
      <div className={styles.stat}>
        <span className={`${styles.statCount} ${styles.passedCount}`}>{stats.passed}</span>
        <span className={styles.statLabel}>PASSED</span>
      </div>
      <div className={styles.stat}>
        <span className={`${styles.statCount} ${styles.savedCount}`}>{stats.saved}</span>
        <span className={styles.statLabel}>SAVED</span>
      </div>
    </div>
  );
}
