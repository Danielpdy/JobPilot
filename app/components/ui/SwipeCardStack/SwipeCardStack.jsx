'use client';
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faHeart,
  faMapPin,
  faDollarSign,
  faBriefcase,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import styles from './SwipeCardStack.module.css';
import { useSwipesStore } from '@/app/stores/swipeStore';
import { useSwipeFlush } from '@/app/hooks/useSwipeFlush';

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

// ── Avatar helpers ─────────────────────────────────────────────────────────────
const PALETTE = [
  '#4a7fa5', '#5a9e6f', '#a0714f', '#7c5cbf',
  '#bf8c30', '#3d8f8f', '#bf4f6f', '#4f6fbf',
  '#7a8f3f', '#8f5040',
];

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function companyColor(company) {
  return PALETTE[hashStr(company ?? '') % PALETTE.length];
}

function companyInitials(company) {
  return (company ?? '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function formatSalary(min, max) {
  const fmt = v => `$${Math.round(v / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return null;
}

function contractLabel(ct) {
  if (!ct) return null;
  if (ct === 'full_time') return 'Full Time';
  if (ct === 'part_time') return 'Part Time';
  return ct.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Card body ─────────────────────────────────────────────────────────────────
function CardBody({ card, onLocationClick }) {
  const color    = companyColor(card.company);
  const initials = companyInitials(card.company);
  const salary   = formatSalary(card.salaryMin, card.salaryMax);
  const contract = contractLabel(card.contractTime);
  const hasMultiple = card.applyOptions?.length > 1 || card.locations?.length > 1;

  return (
    <>
      <div className={styles.accentBar} style={{ background: color }} />
      <div className={styles.cardContent}>

        {/* Top row: avatar + company */}
        <div className={styles.topRow}>
          <div className={styles.avatar} style={{ background: color }}>
            {initials}
          </div>
          <div className={styles.companyBlock}>
            <span className={styles.companyName}>{card.company}</span>
            {(card.locationSummary || card.location) && (
              <span
                className={`${styles.locationMini} ${onLocationClick && hasMultiple ? styles.locationClickable : ''}`}
                data-location={onLocationClick && hasMultiple ? 'true' : undefined}
                onClick={onLocationClick && hasMultiple ? e => { e.stopPropagation(); onLocationClick(card); } : undefined}
              >
                <FontAwesomeIcon icon={faMapPin} className={styles.locationIcon} />
                {card.locationSummary || card.location}
                {hasMultiple && (
                  <span className={styles.locationCount}>
                    +{(card.applyOptions?.length || card.locations?.length) - 1}
                  </span>
                )}
              </span>
            )}
          </div>
          {card.created && <span className={styles.postedBadge}>{card.created}</span>}
        </div>

        {/* Job title — primary focus */}
        <h2 className={styles.jobTitle}>{card.title}</h2>

        {/* Chips */}
        <div className={styles.chipsRow}>
          {salary && (
            <span className={styles.chip}>
              <FontAwesomeIcon icon={faDollarSign} className={styles.chipIcon} />
              {salary}
            </span>
          )}
          {contract && (
            <span className={styles.chip}>
              <FontAwesomeIcon icon={faBriefcase} className={styles.chipIcon} />
              {contract}
            </span>
          )}
          {card.category && <span className={styles.chip}>{card.category}</span>}
        </div>

      </div>
    </>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────────────
function JobDetailModal({ job, onClose }) {
  const color    = companyColor(job.company);
  const initials = companyInitials(job.company);
  const salary   = formatSalary(job.salaryMin, job.salaryMax);
  const contract = contractLabel(job.contractTime);

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{ scale: 0.92,    opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.modalAccent} style={{ background: color }} />
        <div className={styles.modalBody}>

          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>

          <div className={styles.modalTopRow}>
            <div className={styles.modalAvatar} style={{ background: color }}>{initials}</div>
            <div>
              <p className={styles.modalCompany}>{job.company}</p>
              {job.location && <p className={styles.modalLocation}>{job.location}</p>}
            </div>
          </div>

          <h2 className={styles.modalTitle}>{job.title}</h2>

          <div className={styles.modalChips}>
            {salary && (
              <span className={styles.chip}>
                <FontAwesomeIcon icon={faDollarSign} className={styles.chipIcon} />
                {salary}
              </span>
            )}
            {contract && (
              <span className={styles.chip}>
                <FontAwesomeIcon icon={faBriefcase} className={styles.chipIcon} />
                {contract}
              </span>
            )}
            {job.category && <span className={styles.chip}>{job.category}</span>}
          </div>

          {job.redirectUrl && (
            <a
              href={job.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.applyBtn}
              style={{ background: color }}
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className={styles.applyIcon} />
              Apply Now
            </a>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Location sheet ────────────────────────────────────────────────────────────
function LocationSheet({ job, onClose }) {
  const color   = companyColor(job.company);
  const options = job.applyOptions?.length > 0
    ? job.applyOptions
    : (job.locations ?? []).map(l => ({ location: l, redirectUrl: job.redirectUrl }));

  return (
    <motion.div
      className={styles.sheetOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.sheet}
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.sheetHandle} />

        <div className={styles.sheetHeader}>
          <div className={styles.sheetHeaderText}>
            <p className={styles.sheetCompany}>{job.company}</p>
            <h3 className={styles.sheetTitle}>{job.title}</h3>
          </div>
          <button className={styles.sheetClose} onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p className={styles.sheetSubtitle}>
          {options.length} location{options.length !== 1 ? 's' : ''} available
        </p>

        <div className={styles.sheetList}>
          {options.map((opt, i) => (
            <div key={i} className={styles.sheetItem}>
              <div className={styles.sheetItemDot} style={{ background: color }} />
              <span className={styles.sheetItemLocation}>{opt.location}</span>
            </div>
          ))}

          {job.redirectUrl && (
            <a
              href={job.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sheetApplyBtn}
              style={{ background: color }}
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className={styles.sheetApplyIcon} />
              Apply for this job
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── FlyingCard ────────────────────────────────────────────────────────────────
function FlyingCard({ card, x0, y0, direction, onComplete }) {
  const x      = useMotionValue(x0);
  const y      = useMotionValue(y0);
  const rotate = useTransform(x, [-280, 0, 280], [-22, 0, 22]);
  const opacity = useTransform(x, [-280, -130, 0, 130, 280], [0, 1, 1, 1, 0]);

  useEffect(() => {
    let anim;
    if (direction !== 0) {
      anim = animate(x, direction * EXIT_X, { type: 'spring', stiffness: 100, damping: 18, restDelta: 0.5 });
    } else {
      anim = animate(y, -700, { type: 'spring', stiffness: 100, damping: 18, restDelta: 0.5 });
    }
    anim.then(onComplete);
    return () => anim.stop();
  }, []);

  return (
    <motion.div
      className={styles.card}
      style={{ x, y, rotate, opacity, zIndex: 50, pointerEvents: 'none' }}
    >
      <CardBody card={card} />
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SwipeCardStack({ jobs, loading }) {
  const { data: session } = useSession();
  const addSwipe = useSwipesStore(s => s.addSwipe);
  const { flushQueue, scheduleFlush, cancelFlush } = useSwipeFlush(session?.accessToken);

  const [cards, setCards]           = useState(jobs ?? []);
  const [stats, setStats]           = useState({ liked: 0, passed: 0 });
  const [flyingCard, setFlyingCard] = useState(null);
  const [detailJob, setDetailJob]   = useState(null);
  const [locationSheet, setLocationSheet] = useState(null);

  const isSwiping = useRef(false);

  useEffect(() => { if (jobs) setCards(jobs); }, [jobs]);
  useEffect(() => { return () => { cancelFlush(); flushQueue(); }; }, []);

  const x           = useMotionValue(0);
  const y           = useMotionValue(0);
  const rotate      = useTransform(x, [-280, 0, 280], [-22, 0, 22]);
  const cardOpacity = useTransform(x, [-280, -130, 0, 130, 280], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0]);

  const launchFlyingCard = (action, direction) => {
    addSwipe(cards[0], action);
    scheduleFlush();
    setFlyingCard({ card: cards[0], x0: x.get(), y0: y.get(), direction });
    setStats(prev => ({ ...prev, [action]: prev[action] + 1 }));
    setCards(prev => prev.slice(1));
    x.set(0); y.set(0);
  };

  const onFlyingComplete = () => { setFlyingCard(null); isSwiping.current = false; };

  const handleDragEnd = (_, info) => {
    if (isSwiping.current) return;
    const swipeRight = info.offset.x >  SWIPE_OFFSET_THRESHOLD || info.velocity.x >  SWIPE_VELOCITY_THRESHOLD;
    const swipeLeft  = info.offset.x < -SWIPE_OFFSET_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD;
    if (swipeRight)      { isSwiping.current = true; launchFlyingCard('liked',  1); }
    else if (swipeLeft)  { isSwiping.current = true; launchFlyingCard('passed', -1); }
    else                 { animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 }); }
  };

  const triggerSwipe = (action) => {
    if (isSwiping.current || cards.length === 0) return;
    isSwiping.current = true;
    if (action === 'like') launchFlyingCard('liked', 1);
    else                   launchFlyingCard('passed', -1);
  };

  const visibleCards = cards.slice(0, 1);
  const totalCards   = (jobs ?? []).length;
  const currentIndex = totalCards - cards.length + 1;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.topHalf}>
          <div className={styles.stack}>
            <div className={`${styles.card} ${styles.skeletonCard} ${styles.topCard}`} />
          </div>
        </div>
      </div>
    );
  }

  if (cards.length === 0 && !flyingCard) {
    return (
      <motion.div className={styles.emptyContainer} variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={sectionVariants} className={styles.emptyState}>
          <FontAwesomeIcon icon={faBriefcase} className={styles.emptyIcon} />
          <h3>You&apos;ve seen all jobs!</h3>
          <p>Check back later for new matches.</p>
          <button className={styles.resetBtn} onClick={() => { setCards(jobs ?? []); setStats({ liked: 0, passed: 0 }); }}>
            Start Over
          </button>
        </motion.div>
        <motion.div variants={sectionVariants}><StatsRow stats={stats} /></motion.div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div className={styles.container} variants={containerVariants} initial="hidden" animate="visible">

        {/* ── Top half: card stack ──────────────────────────────────────── */}
        <div className={styles.topHalf}>
          <motion.div variants={sectionVariants} className={styles.stack}>

            {visibleCards.map((card, i) => {
              const isTop = i === 0;
              return (
                <motion.div
                  key={card.id}
                  className={`${styles.card} ${isTop ? styles.topCard : ''}`}
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
                  onTap={isTop ? (e) => { if (e.target.closest('[data-location]')) return; setDetailJob(card); } : undefined}
                >
                  {isTop && (
                    <>
                      <motion.div className={`${styles.indicator} ${styles.likeIndicator}`} style={{ opacity: likeOpacity }}>LIKE</motion.div>
                      <motion.div className={`${styles.indicator} ${styles.nopeIndicator}`}  style={{ opacity: nopeOpacity }}>NOPE</motion.div>
                    </>
                  )}
                  <CardBody card={card} onLocationClick={isTop ? card => setLocationSheet({ job: card }) : null} />
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
        </div>

        {/* ── Bottom half: counter + buttons + stats ────────────────────── */}
        <div className={styles.bottomHalf}>
          <motion.p variants={sectionVariants} className={styles.counter}>
            {currentIndex} of {totalCards}&nbsp;&middot;&nbsp;Drag or tap to inspect
          </motion.p>
          <motion.div variants={sectionVariants} className={styles.actions}>
            <button className={`${styles.actionBtn} ${styles.passBtn}`} onClick={() => triggerSwipe('pass')} aria-label="Pass">
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <button className={`${styles.actionBtn} ${styles.likeBtn}`} onClick={() => triggerSwipe('like')} aria-label="Like">
              <FontAwesomeIcon icon={faHeart} />
            </button>
          </motion.div>
          <motion.div variants={sectionVariants}><StatsRow stats={stats} /></motion.div>
        </div>

      </motion.div>

      {/* ── Detail modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {detailJob && (
          <JobDetailModal key="modal" job={detailJob} onClose={() => setDetailJob(null)} />
        )}
      </AnimatePresence>

      {/* ── Location sheet ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {locationSheet && (
          <LocationSheet
            key="location-sheet"
            job={locationSheet.job}
            onClose={() => setLocationSheet(null)}
          />
        )}
      </AnimatePresence>
    </>
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
    </div>
  );
}
