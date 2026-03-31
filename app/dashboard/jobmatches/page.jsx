'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapPin,
  faDollarSign,
  faBriefcase,
  faArrowUpRightFromSquare,
  faHeartCrack,
  faMagnifyingGlass,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { useSwipesStore } from '@/app/stores/swipeStore';
import styles from './page.module.css';
import { GetLikedJobs } from '@/app/Services/JobService';

// ── Avatar helpers (same deterministic palette as swipe cards) ────────────────
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

function companyColor(company)    { return PALETTE[hashStr(company ?? '') % PALETTE.length]; }
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

const cardVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26, delay: i * 0.06 } }),
  exit:    { opacity: 0, scale: 0.88, transition: { duration: 0.18 } },
};

export default function JobMatches({ accessToken }) {
  const likedJobs = useSwipesStore(s => s.likedJobs);
  const unlikeJob = useSwipesStore(s => s.unlikeJob);

  const [search, setSearch] = useState('');
  const [sort, setSort]     = useState('recent');

  useEffect(() => {
    if (!accessToken) return;
    getlikedJobs();
  }, [accessToken]);

  const filtered = useMemo(() => {
    let list = [...likedJobs];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(j => j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q));
    }
    if (sort === 'salary-high') list.sort((a, b) => (b.salaryMax ?? 0) - (a.salaryMax ?? 0));
    if (sort === 'salary-low')  list.sort((a, b) => (a.salaryMin ?? 0) - (b.salaryMin ?? 0));
    return list;
  }, [likedJobs, search, sort]);

  const getlikedJobs = async () => {
    try { await GetLikedJobs(accessToken); }
    catch (error) { console.error(error); }
  };

  return (
    <div className={styles.wrapper}>

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <h2 className={styles.count}>
          {likedJobs.length} liked job{likedJobs.length !== 1 ? 's' : ''}
        </h2>
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search by title or company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.selectWrapper}>
            <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="salary-high">Salary: High to Low</option>
              <option value="salary-low">Salary: Low to High</option>
            </select>
            <FontAwesomeIcon icon={faChevronDown} className={styles.selectIcon} />
          </div>
        </div>
      </div>

      {/* ── Empty state ────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        >
          <span className={styles.emptyEmoji}>💼</span>
          <h3>{search ? 'No jobs match your search.' : 'No liked jobs yet.'}</h3>
          <p>{search ? 'Try a different search term.' : 'Start swiping to save jobs you like.'}</p>
        </motion.div>
      )}

      {/* ── Grid ──────────────────────────────────────────────── */}
      <div className={styles.grid}>
        <AnimatePresence>
          {filtered.map((job, i) => {
            const color    = companyColor(job.company);
            const initials = companyInitials(job.company);
            const salary   = formatSalary(job.salaryMin, job.salaryMax);
            const contract = contractLabel(job.contractTime);

            return (
              <motion.div
                key={job.id}
                className={styles.card}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(11,45,114,0.15)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                {/* Accent bar */}
                <div className={styles.accentBar} style={{ background: color }} />

                <div className={styles.cardContent}>
                  {/* Header: avatar + company */}
                  <div className={styles.cardHeader}>
                    <div className={styles.avatar} style={{ background: color }}>
                      {initials}
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.companyName}>{job.company}</span>
                      {job.location && (
                        <span className={styles.locationMini}>
                          <FontAwesomeIcon icon={faMapPin} className={styles.locationIcon} />
                          {job.location}
                        </span>
                      )}
                    </div>
                    {job.created && <span className={styles.postedBadge}>{job.created}</span>}
                  </div>

                  {/* Title */}
                  <h3 className={styles.jobTitle}>{job.title}</h3>

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
                    {job.category && <span className={styles.chip}>{job.category}</span>}
                  </div>

                  {/* Footer */}
                  <div className={styles.cardFooter}>
                    <a
                      href={job.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewBtn}
                      style={{ '--accent': color }}
                      onClick={e => e.stopPropagation()}
                    >
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} className={styles.btnIcon} />
                      View Job
                    </a>
                    <button className={styles.unlikeBtn} onClick={() => unlikeJob(job.id)}>
                      <FontAwesomeIcon icon={faHeartCrack} className={styles.btnIcon} />
                      Unlike
                    </button>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
